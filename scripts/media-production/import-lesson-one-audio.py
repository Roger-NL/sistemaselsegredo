#!/usr/bin/env python3
"""Split already-authorized, locally downloaded lesson recordings. No network/TTS.

Usage:
  python3 scripts/media-production/import-lesson-one-audio.py \
    --person ana --texts-json output/lesson-one-audio/plan.json

Inspection is always saved first. Ambiguous automatic cuts block export; inspect
the candidate pauses and pass reviewed midpoint seconds via --cuts 1.7,4.8.
"""
from __future__ import annotations

import argparse
import array
import bisect
import hashlib
import itertools
import json
import math
import re
import struct
import subprocess
import sys
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PEOPLE = ("ana", "leo", "maya", "sam", "nina")


def run_convert(source: Path, destination: Path, arguments: list[str]) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.unlink(missing_ok=True)
    subprocess.run(["/usr/bin/afconvert", str(source), str(destination), *arguments],
                   check=True, capture_output=True, text=True)


def read_pcm(path: Path) -> tuple[int, array.array]:
    try:
        with wave.open(str(path), "rb") as stream:
            if stream.getsampwidth() != 2 or stream.getnchannels() != 1:
                raise ValueError("Analysis requires signed 16-bit mono PCM")
            rate = stream.getframerate()
            raw = stream.readframes(stream.getnframes())
    except wave.Error:
        # CoreAudio may emit WAVE_FORMAT_EXTENSIBLE, unsupported by Python 3.9's
        # wave reader. Accept its PCM16 subtype explicitly, never compressed data.
        data = path.read_bytes()
        if data[:4] != b"RIFF" or data[8:12] != b"WAVE":
            raise ValueError("Unsupported analysis container")
        offset, fmt, raw = 12, None, None
        while offset + 8 <= len(data):
            name, size = struct.unpack_from("<4sI", data, offset)
            chunk = data[offset + 8:offset + 8 + size]
            if name == b"fmt ":
                fmt = chunk
            elif name == b"data":
                raw = chunk
            offset += 8 + size + (size % 2)
        if fmt is None or raw is None or len(fmt) < 16:
            raise ValueError("Missing PCM WAV chunks")
        tag, channels, rate, _, _, bits = struct.unpack_from("<HHIIHH", fmt)
        valid_subtype = tag == 1 or (tag == 65534 and len(fmt) >= 40 and fmt[24:40] == bytes.fromhex("0100000000001000800000aa00389b71"))
        if not valid_subtype or channels != 1 or bits != 16:
            raise ValueError("Analysis requires signed 16-bit mono PCM subtype")
    samples = array.array("h", raw)
    if sys.byteorder != "little":
        samples.byteswap()
    return rate, samples


def write_pcm(path: Path, rate: int, samples: array.array) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    little = array.array("h", samples)
    if sys.byteorder != "little":
        little.byteswap()
    with wave.open(str(path), "wb") as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(rate)
        stream.writeframes(little.tobytes())


def read_texts(path: Path, person: str) -> list[str]:
    data = json.loads(path.read_text())
    texts: list[str] = []

    def visit(value, inherited_person=None):
        if isinstance(value, str):
            if inherited_person in (None, person):
                texts.append(value)
        elif isinstance(value, list):
            for item in value:
                visit(item, inherited_person)
        elif isinstance(value, dict):
            identity = value.get("person", value.get("character", inherited_person))
            if identity is not None and identity != person:
                return
            if "texts" in value:
                visit(value["texts"], identity)
            elif "text" in value and isinstance(value["text"], str):
                texts.append(value["text"])
            elif "phrases" in value:
                visit(value["phrases"], identity)
            elif "clips" in value:
                visit(value["clips"], identity)
            elif "jobs" in value:
                visit(value["jobs"], identity)
            elif "entries" in value:
                visit(value["entries"], identity)
            elif person in value:
                visit(value[person], person)

    visit(data)
    if not texts or any(not text.strip() for text in texts):
        raise ValueError(f"No ordered utterance list for {person} in {path}")
    if len(texts) != len(set(texts)):
        raise ValueError("Recording plan repeats an utterance; deduplicate before generation")
    if any(not re.fullmatch(r"(?:I am|You are) [A-Z][a-z]+\.|(?:We|They) are a team\.", text) for text in texts):
        raise ValueError("Plan contains a model outside the approved affirmative lesson forms")
    return texts


def analyze(rate: int, samples: array.array, threshold_db: float, min_gap: float):
    size = max(1, round(rate * .01))
    threshold = 32768 * 10 ** (threshold_db / 20)
    frames = []
    for start in range(0, len(samples), size):
        chunk = samples[start:start + size]
        rms = math.sqrt(sum(sample * sample for sample in chunk) / max(1, len(chunk)))
        frames.append({"start": start / rate, "end": min(start + size, len(samples)) / rate,
                       "rms": rms, "voice": rms >= threshold})
    voiced = [frame for frame in frames if frame["voice"]]
    if not voiced:
        raise ValueError("Recording has no audible speech at the selected threshold")
    first, last = voiced[0]["start"], voiced[-1]["end"]
    gaps, beginning = [], None
    for frame in frames:
        if not frame["voice"] and beginning is None:
            beginning = frame["start"]
        if frame["voice"] and beginning is not None:
            end = frame["start"]
            if end - beginning >= min_gap and beginning > first and end < last:
                gaps.append({"start": round(beginning, 4), "end": round(end, 4),
                             "duration": round(end - beginning, 4), "midpoint": round((beginning + end) / 2, 4)})
            beginning = None
    return frames, gaps, first, last


def select_cuts(gaps, frames, count: int, duration: float, minimum: float):
    if count == 0:
        return [], []
    # Longest-pause search with speech-duration guards; bounded for short lessons.
    ranked = sorted(gaps, key=lambda gap: gap["duration"], reverse=True)[:max(16, count + 5)]
    ranked.sort(key=lambda gap: gap["midpoint"])
    voiced = [frame for frame in frames if frame["voice"]]
    starts = [frame["start"] for frame in voiced]
    options = []
    for combination in itertools.combinations(ranked, count):
        boundaries = [0., *(gap["midpoint"] for gap in combination), duration]
        valid = True
        for left, right in zip(boundaries, boundaries[1:]):
            first = bisect.bisect_left(starts, left)
            final = bisect.bisect_left(starts, right) - 1
            if final < first or voiced[final]["end"] - voiced[first]["start"] < minimum:
                valid = False
                break
        if valid:
            options.append((sum(gap["duration"] for gap in combination), combination))
    if not options:
        return [], ["Not enough separate speech regions for the requested utterances"]
    options.sort(key=lambda value: value[0], reverse=True)
    selected = list(options[0][1])
    reasons = []
    if min(gap["duration"] for gap in selected) < .24:
        reasons.append("At least one selected pause is shorter than 240ms")
    if len(options) > 1 and options[0][0] - options[1][0] < .12:
        reasons.append("Another valid cut arrangement has a similar pause score (<120ms difference)")
    return selected, reasons


def metrics(samples: array.array, rate: int):
    peak = max((abs(value) for value in samples), default=0)
    rms = math.sqrt(sum(value * value for value in samples) / max(1, len(samples)))
    return {"duration": round(len(samples) / rate, 4), "peak_dbfs": round(20 * math.log10(max(1, peak) / 32768), 2),
            "rms_dbfs": round(20 * math.log10(max(1, rms) / 32768), 2),
            "clipped_samples": sum(abs(value) >= 32760 for value in samples)}


def slug(text: str):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def reviewed_alignment(path: Path, source: Path, texts: list[str]):
    data = json.loads(path.read_text())
    if Path(data.get("source", "")).resolve() != source.resolve():
        raise ValueError("Reviewed word timestamps belong to a different recording")
    if data.get("initial_prompt") is not None:
        raise ValueError("Reviewed alignment must be from an unprompted transcription")

    def tokens(text):
        return ["ana" if token == "anna" else token for token in re.findall(r"[a-z]+", text.lower())]

    words = data.get("words", [])
    actual = [token for word in words for token in tokens(word["word"])]
    expected = [token for text in texts for token in tokens(text)]
    if actual != expected or any(len(tokens(word["word"])) != 1 for word in words):
        raise ValueError("Unprompted words do not match the complete ordered phrase list (only Anna→Ana alias accepted)")
    spans, offset = [], 0
    for text in texts:
        count = len(tokens(text))
        phrase_words = words[offset:offset + count]
        if any(float(word["end"]) < float(word["start"]) for word in phrase_words):
            raise ValueError("Invalid word timestamps")
        spans.append({"text": text, "start": float(phrase_words[0]["start"]), "end": float(phrase_words[-1]["end"])})
        offset += count
    gaps = [{"start": left["end"], "end": right["start"]} for left, right in zip(spans, spans[1:])]
    if any(gap["end"] < gap["start"] for gap in gaps):
        raise ValueError("Reviewed utterance timestamps overlap; inspect before cutting")
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "engine": data.get("engine"), "model": data.get("model"), "initial_prompt": data.get("initial_prompt"),
            "transcript": data.get("transcript"), "alias_policy": "Anna→Ana only", "utterance_spans": spans, "cut_windows": gaps}


def export_clip(source: Path, stem: Path, codec: str):
    attempts = [codec] if codec != "auto" else ["mp3", "m4a", "wav"]
    failures = []
    for chosen in attempts:
        destination = stem.with_suffix("." + chosen)
        if chosen == "wav":
            destination.write_bytes(source.read_bytes())
            return chosen, destination, failures
        args = ["-f", "MPG3", "-d", ".mp3", "-b", "96000"] if chosen == "mp3" else ["-f", "m4af", "-d", "aac ", "-b", "64000", "-q", "127"]
        try:
            run_convert(source, destination, args)
            return chosen, destination, failures
        except subprocess.CalledProcessError as error:
            destination.unlink(missing_ok=True)
            failures.append({"codec": chosen, "reason": (error.stderr or str(error))[-800:].strip()})
    raise RuntimeError(f"No export codec succeeded: {failures}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--person", choices=PEOPLE, required=True)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--texts-json", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "public/first-encounters/audio/lesson-one")
    parser.add_argument("--report-dir", type=Path, default=ROOT / "output/lesson-one-audio")
    parser.add_argument("--threshold-db", type=float, default=-45.)
    parser.add_argument("--min-gap", type=float, default=.18)
    parser.add_argument("--min-utterance", type=float, default=.45)
    parser.add_argument("--pad", type=float, default=.14)
    parser.add_argument("--cuts", help="Reviewed cut midpoints in seconds, comma separated")
    parser.add_argument("--reviewed-word-timestamps", type=Path,
                        help="Explicitly reviewed unprompted ASR JSON; validates every word and the source before allowing nonsilent word-boundary cuts")
    parser.add_argument("--reviewed-boundary-tolerance", type=float, default=0.,
                        help="Reviewed ASR timestamps are approximate. Explicit --cuts may extend this many seconds outside their word windows; requires alignment plus independent clip QA")
    parser.add_argument("--codec", choices=("auto", "mp3", "m4a", "wav"), default="auto")
    parser.add_argument("--inspect-only", action="store_true")
    args = parser.parse_args()
    if not 0 <= args.reviewed_boundary_tolerance <= .2 or args.reviewed_boundary_tolerance and (not args.reviewed_word_timestamps or args.cuts is None):
        parser.error("Boundary tolerance must be 0–200ms, with explicit cuts and reviewed word timestamps")
    source = (args.input or ROOT / f"output/lesson-one-audio/batches/{args.person}.mp3").resolve()
    if not source.is_file():
        parser.error(f"Downloaded batch does not exist: {source}")
    texts = read_texts(args.texts_json, args.person)
    report_dir = args.report_dir.resolve()
    working = report_dir / "work" / args.person
    working.mkdir(parents=True, exist_ok=True)
    pcm = working / "batch.wav"
    run_convert(source, pcm, ["-f", "WAVE", "-d", "LEI16@44100", "-c", "1"])
    rate, samples = read_pcm(pcm)
    duration = len(samples) / rate
    frames, gaps, first, last = analyze(rate, samples, args.threshold_db, args.min_gap)
    selected, ambiguity = select_cuts(gaps, frames, len(texts) - 1, duration, args.min_utterance)
    cuts = [gap["midpoint"] for gap in selected]
    alignment = reviewed_alignment(args.reviewed_word_timestamps, source, texts) if args.reviewed_word_timestamps else None
    if alignment and args.cuts is None:
        cuts = []
        for gap in alignment["cut_windows"]:
            candidates = [frame for frame in frames if gap["start"] <= frame["start"] and frame["end"] <= gap["end"]]
            minimum = min(candidates, key=lambda frame: frame["rms"]) if candidates else None
            cuts.append(round((minimum["start"] + minimum["end"]) / 2, 4) if minimum else round((gap["start"] + gap["end"]) / 2, 4))
        ambiguity = []
    if args.cuts is not None:
        cuts = sorted(float(value) for value in args.cuts.split(",") if value.strip())
        if len(cuts) != len(texts) - 1 or any(cut <= 0 or cut >= duration for cut in cuts):
            parser.error("--cuts must contain exactly utterance-count minus one interior timestamps")
        if alignment:
            if any(not gap["start"] - args.reviewed_boundary_tolerance <= cut <= gap["end"] + args.reviewed_boundary_tolerance for cut, gap in zip(cuts, alignment["cut_windows"])):
                parser.error("A reviewed cut is outside the ASR inter-utterance word boundary")
        elif any(not any(gap["start"] < cut < gap["end"] for gap in gaps) for cut in cuts):
            parser.error("A reviewed cut is outside a detected silent interval; provide explicitly reviewed unprompted word timestamps")
        ambiguity = []
    report = {"person": args.person, "source": str(source), "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
              "source_bytes": source.stat().st_size, "sample_rate": rate, "duration": round(duration, 4),
              "texts": texts, "threshold_dbfs": args.threshold_db, "pad_seconds": args.pad,
              "speech_start": first, "speech_end": last, "candidate_gaps": gaps, "cuts": cuts,
              "reviewed_cuts": args.cuts is not None, "reviewed_alignment": alignment,
              "reviewed_boundary_tolerance_seconds": args.reviewed_boundary_tolerance,
              "cut_energy_dbfs": [round(20 * math.log10(max(1, min(frames, key=lambda frame: abs((frame["start"] + frame["end"]) / 2 - cut))["rms"]) / 32768), 2) for cut in cuts],
              "ambiguity": ambiguity, "exported": False, "clips": []}
    inspection = report_dir / f"{args.person}-inspection.json"
    inspection.write_text(json.dumps(report, indent=2) + "\n")
    if args.inspect_only or ambiguity or len(cuts) != len(texts) - 1:
        print(json.dumps({"person": args.person, "exported": False, "report": str(inspection), "cuts": cuts, "ambiguity": ambiguity}, indent=2))
        return 2 if ambiguity else 0
    args.output_dir.mkdir(parents=True, exist_ok=True)
    boundaries = [0., *cuts, duration]
    chosen_codec = args.codec
    for index, (text, left, right) in enumerate(zip(texts, boundaries, boundaries[1:])):
        voice = [frame for frame in frames if frame["voice"] and left <= frame["start"] < right]
        if not voice:
            raise ValueError(f"Empty utterance region {index + 1}")
        start = max(left, voice[0]["start"] - args.pad)
        end = min(right, voice[-1]["end"] + args.pad)
        trimmed = samples[round(start * rate):round(end * rate)]
        added_lead = max(0, round((args.pad - (voice[0]["start"] - start)) * rate))
        added_tail = max(0, round((args.pad - (end - voice[-1]["end"])) * rate))
        trimmed = array.array("h", [0]) * added_lead + trimmed + array.array("h", [0]) * added_tail
        measure = metrics(trimmed, rate)
        if measure["duration"] < args.min_utterance or measure["duration"] > 8 or measure["peak_dbfs"] < -35:
            raise ValueError(f"Suspicious utterance {index + 1}: {measure}")
        clip_pcm = working / f"{index + 1:02d}-{slug(text)}.wav"
        write_pcm(clip_pcm, rate, trimmed)
        chosen_codec, destination, failures = export_clip(clip_pcm, args.output_dir / f"{args.person}-{slug(text)}", chosen_codec)
        checked = working / f"{index + 1:02d}-encoded-check.wav"
        run_convert(destination, checked, ["-f", "WAVE", "-d", "LEI16@44100", "-c", "1"])
        check_rate, decoded = read_pcm(checked)
        encoded = metrics(decoded, check_rate)
        if abs(encoded["duration"] - measure["duration"]) > .12:
            raise ValueError(f"Encoding changed duration unexpectedly: {destination}")
        for extension in ("mp3", "m4a", "wav"):
            alternate = destination.with_suffix("." + extension)
            if alternate != destination:
                alternate.unlink(missing_ok=True)
        report["clips"].append({"person": args.person, "text": text, "key": f"{args.person}:{text}",
                                "url": f"/first-encounters/audio/lesson-one/{destination.name}",
                                "path": str(destination.resolve()), "codec": chosen_codec,
                                "source_start": round(start, 4), "source_end": round(end, 4),
                                "leading_margin": round(voice[0]["start"] - start + added_lead / rate, 4),
                                "trailing_margin": round(end - voice[-1]["end"] + added_tail / rate, 4),
                                "silence_added": {"leading": round(added_lead / rate, 4), "trailing": round(added_tail / rate, 4)},
                                "pcm_metrics": measure, "decoded_metrics": encoded,
                                "bytes": destination.stat().st_size, "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
                                "codec_fallbacks": failures})
    report["exported"] = True
    inspection.write_text(json.dumps(report, indent=2) + "\n")
    fragment = report_dir / f"{args.person}-catalog.json"
    fragment.write_text(json.dumps({clip["key"]: clip["url"] for clip in report["clips"]}, indent=2) + "\n")
    # Merge QA only, never the source catalog that the producing agent owns.
    combined_file = report_dir / "clip-inspection.json"
    combined = json.loads(combined_file.read_text()) if combined_file.exists() else {"characters": {}}
    combined["characters"][args.person] = report
    combined_file.write_text(json.dumps(combined, indent=2) + "\n")
    print(json.dumps({"person": args.person, "exported": True, "clips": len(report["clips"]),
                      "codec": chosen_codec, "catalog_fragment": str(fragment), "report": str(inspection)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
