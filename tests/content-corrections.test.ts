import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget } from "@/features/demo/model/listening";
import { acceptsAnswer, normalizeAnswer, practice, writtenRepertoire } from "@/features/demo/model/practice";
import { createDemo, transition, replayEvent } from "@/features/demo/model/reducer";
import { expressionHistory } from "@/features/demo/model/history";
import { retrospective } from "@/features/demo/model/retrospective";
import { PROFILES, type DemoState, type DemoEvent, type ResponseNode } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";
import { isCorrect, studySteps, normalizeAnswer as normalizeStudy, practiceFeedback } from "@/features/theory/progress";
import { CachedAudio, pauseOtherStudyAudio } from "@/features/theory/TheoryExperience";
import { parseDemoSnapshot, parseStudySnapshot, savedStudyCompleted } from "@/server/workspace/validation";
import { DemoExperience } from "@/features/demo/DemoExperience";

type Action = DemoEvent extends infer E ? E extends DemoEvent ? Omit<E, "at"> : never : never;
const act = (s: DemoState, e: Action) => transition(s, { ...e, at: s.nodeId } as DemoEvent);
function read(s: DemoState) {
  for (let n = 0; n < 20; n++) {
    const target = listeningTarget(s);
    if (target && !s.audioAccess[target.key]) s = act(s, { type: "AUDIO_ACCESS", key: target.key, mode: "text" });
    else if (s.presentationStep < presentationCards(catalog[s.nodeId], s).length) s = act(s, { type: "ADVANCE_PRESENTATION" });
    else return s;
  }
  throw new Error("READ_LOOP");
}
function advance(input: DemoState, supported = false) {
  let s = read(input); const node = catalog[s.nodeId];
  if (node.kind === "scene") return act(s, { type: "NEXT" });
  if (node.kind === "comprehension") return act(s, { type: "ANSWER_MEANING", correct: true });
  if (node.kind !== "response") throw new Error("EXPECTED_RESPONSE");
  if (s.phase === "present" || s.phase === "recall") s = act(s, { type: s.phase === "present" ? "PREPARE" : "CHECK" });
  if (supported) s = act(s, { type: "REVEAL_MODEL" });
  if (s.phase === "build") for (const block of practice(node, s.activityProfile).answer) s = act(s, { type: "PLACE_BLOCK", block });
  if (s.phase === "write") s = act(s, { type: "TYPE", text: audio[node.response].text });
  if (s.phase === "select") s = act(s, { type: "RECOGNIZE", response: node.response });
  return act(s, { type: "SEND_RESPONSE" });
}
function reach(id: string, choices: Record<string, string> = {}, profile: typeof PROFILES[number] = "less") {
  let s = createDemo(profile, "correction-test", 0);
  for (let n = 0; n < 120 && s.nodeId !== id; n++) {
    const node = catalog[s.nodeId];
    s = node.kind === "choice" ? act(read(s), { type: "CHOOSE", choice: choices[node.id] ?? node.choices[0].id }) : advance(s);
  }
  expect(s.nodeId).toBe(id); return s;
}
const negative = { "p8.topic": "job", "p9.cafe-opinion": "not", "p9.pause": "stay" };

describe("corrected content and actual current-event routes", () => {
  it("enumerates every choice in all supports, normal and with model, without contradicting the café preference", () => {
    const matrix: unknown[] = []; const visited = new Set<string>(); const choices = new Set<string>();
    for (const profile of PROFILES) for (const supported of [false, true]) {
      let count = 0; let negativeStays = 0;
      function walk(input: DemoState, route: string[] = []) {
        const s = read(input), node = catalog[s.nodeId]; visited.add(node.id);
        const sequence = [...route, node.id];
        if (node.kind === "end") {
          count++;
          const conflictBranch = s.decisions["p9.cafe-opinion"] === "not" && s.decisions["p9.pause"] === "stay";
          if (conflictBranch) {
            negativeStays++;
            expect(sequence).toContain("p10.quiet");
            expect(sequence).not.toContain("p10.here");
            expect(s.transcript.some(line => line.audioId === "U17")).toBe(false);
            expect(s.evidence.some(item => item.response === "U17")).toBe(false);
          }
          expect(retrospective(s).some(item => item.after === "U17")).toBe(s.decisions["p9.pause"] === "stay" && !conflictBranch);
          expect(s.evidence.length).toBe(s.transcript.filter(line => line.role === "you").length);
          expect(decodeSnapshot(encodeSnapshot(s))).toEqual(s);
          expect(parseDemoSnapshot(encodeSnapshot(s)).demoSnapshot).toBe(encodeSnapshot(s));
          matrix.push({ profile, supported, decisions: s.decisions, nodes: sequence, responses: s.evidence.length, conflict: false });
          return;
        }
        if (node.kind === "choice") for (const choice of node.choices) { choices.add(`${node.id}:${choice.id}`); walk(act(s, { type: "CHOOSE", choice: choice.id }), sequence); }
        else walk(advance(s, supported), sequence);
      }
      walk(createDemo(profile, "all-current-paths", 0));
      expect(count).toBe(128); expect(negativeStays).toBe(16);
    }
    expect([...visited].sort()).toEqual(nodes.map(node => node.id).sort());
    expect([...choices].sort()).toEqual(nodes.flatMap(node => node.kind === "choice" ? node.choices.map(c => `${node.id}:${c.id}`) : []).sort());
    mkdirSync("output/content-corrections-2026-10-28", { recursive: true });
    writeFileSync("output/content-corrections-2026-10-28/percursos-atuais.json", JSON.stringify({ runs: matrix.length, matrix }, null, 2));
  });

  it("keeps staying available after a negative opinion and allows Back, branch change, resumption and honest retrospective", () => {
    for (const profile of PROFILES) {
      const quiet = read(reach("p10.quiet", negative, profile));
      const contact = act(quiet, { type: "NEXT" });
      expect(contact.nodeId).toBe("p10.contact");
      expect(act(contact, { type: "BACK" })).toEqual(quiet);
      expect(decodeSnapshot(encodeSnapshot(contact))).toEqual(contact);
      let s = contact;
      for (let n = 0; n < 60 && s.nodeId !== "p9.cafe-opinion"; n++) s = act(s, { type: "BACK" });
      expect(s.nodeId).toBe("p9.cafe-opinion");
      s = act(read(s), { type: "CHOOSE", choice: "like" });
      for (let n = 0; n < 40 && s.nodeId !== "p10.here"; n++) {
        const node = catalog[s.nodeId]; s = node.kind === "choice" ? act(read(s), { type: "CHOOSE", choice: "stay" }) : advance(s);
      }
      expect(s.nodeId).toBe("p10.here");
      expect(s.transcript.some(line => line.nodeId === "p9.cafe-not")).toBe(false);
      expect(retrospective(s).some(item => item.after === "U17")).toBe(false); // not sent yet
    }
  });

  it("renders the time transition only after staying, and clarifies cup references and the order ellipsis before responding", () => {
    for (const stayed of [true, false]) {
      const s = reach("p10.contact", { ...negative, "p9.pause": stayed ? "stay" : "go" });
      const contexts = presentationCards(catalog[s.nodeId], s).map(c => c.context).join(" ");
      expect(contexts.includes("Depois de mais alguns minutos")).toBe(stayed);
      const html = renderToStaticMarkup(createElement(DemoExperience, { initial: { ...s, presentationStep: 1 } }));
      expect(html.includes("Depois de mais alguns minutos")).toBe(stayed);
    }
    for (const [id, phrase] of [["p4.same", "também pedi isso"], ["p4.new-cup", "que é seu"], ["p4.arrival-b", "próprio copo"]]) {
      expect(presentationCards(catalog[id]).some(card => card.context.includes(phrase))).toBe(true);
    }
    for (const node of nodes) if (node.kind === "response") {
      const skeleton = practice(node, "some").skeleton;
      if (skeleton) expect(normalizeAnswer(skeleton.replace(/___/g, ""))).not.toBe(normalizeAnswer(audio[node.response].text));
    }
    expect(practice(catalog["p6.warn"] as ResponseNode, "less").mode).toBe("send");
  });
});

describe("finite contextual writing repertoire and orthography", () => {
  const cases = [
    ["p2.send", "No, not mine.", "Yes, it's mine."], ["p3.ask", "What did you order?", "What do you order?"],
    ["p3.okay", "No problem.", "Not really."], ["p4.same", "I ordered the same.", "I'm tired too."],
    ["p4.mine", "Yes, this is mine.", "No, not mine."], ["p5.like", "I like the coffee.", "I don't like it."],
    ["p5.not", "I don't really like it.", "I like it."], ["p7.tired", "Oh, really?", "Me too."],
    ["p7.too", "I'm tired too.", "I ordered the same."], ["p7.not", "I'm not very tired.", "I don't really like this cafe."],
    ["p8.accept", "Sure!", "Not sure."], ["p8.english", "I am learning English.", "I learned English."],
    ["p8.job", "Do you like your work?", "Do you like your coffee?"], ["p9.english-like", "I like learning English.", "I like the coffee."],
    ["p9.english-not", "I don't really like learning English.", "I don't really like this cafe."], ["p9.cafe", "Do you like this cafe?", "Do you like your job?"],
    ["p9.cafe-like", "I like this cafe.", "I don't like this cafe."], ["p9.cafe-not", "I don't really like this cafe.", "I'm not very tired."],
    ["p9.stay", "I can stay a bit longer.", "I can't stay a bit longer."], ["p9.go", "I need to go.", "I don't have to go."],
    ["p10.here", "I like this place.", "I like it there."], ["p10.keep", "Could we keep in touch?", "Can we leave?"],
    ["p10.farewell", "It was nice talking to you.", "Nice to meet you."], ["p10.bye", "Goodbye!", "Hello!"],
  ];
  it("accepts contextual alternatives and rejects opposite polarity, referents, time or conversational functions across all writing nodes", () => {
    expect(cases.map(c => c[0]).sort()).toEqual(nodes.filter(n => n.kind === "response" && n.id !== "p6.warn").map(n => n.id).sort());
    for (const [id, accepted, rejected] of cases) {
      const node = catalog[id] as ResponseNode;
      expect(acceptsAnswer(accepted, node.response, id), `${id}: ${accepted}`).toBe(true);
      expect(acceptsAnswer(rejected, node.response, id), `${id}: ${rejected}`).toBe(false);
      for (const text of writtenRepertoire(node)) expect(acceptsAnswer(text, node.response, id)).toBe(true);
    }
  });
  it("preserves rejected drafts and accepted spelling, and marks repertoire consultation through the existing reveal event", () => {
    let s = read(reach("p8.accept"));
    s = act(s, { type: "TYPE", text: "Not sure." });
    const rejected = act(s, { type: "SEND_RESPONSE" });
    expect(rejected.draft).toBe("Not sure."); expect(rejected.evidence).toEqual(s.evidence);
    s = act(rejected, { type: "TYPE", text: "  SURE!  " });
    const revealed = act(s, { type: "REVEAL_MODEL" });
    expect(revealed.draft).toBe(s.draft); expect(revealed.phase).toBe(s.phase);
    const sent = act(revealed, { type: "SEND_RESPONSE" });
    expect(sent.evidence.at(-1)?.kind).toBe("supported");
    expect(sent.transcript.find(line => line.nodeId === "p8.accept")?.written).toBe("  SURE!  ");
    expect(decodeSnapshot(encodeSnapshot(sent))).toEqual(sent);
  });
  it("distinguishes use of an expression from an equivalent intention in the actual written history", () => {
    const base = createDemo("less", "lexical-history", 0);
    const same = { id: "p4.same:U04", nodeId: "p4.same", part: 4, role: "you" as const, audioId: "U04" as const, written: "I ordered the same." };
    expect(expressionHistory({ ...base, transcript: [same] }, "U04")).toBe("new");
    expect(expressionHistory({ ...base, transcript: [{ ...same, written: "Me too!" }] }, "U04")).toBe("used");
    const really = { ...same, audioId: "U09" as const, written: "Oh, really?" };
    expect(expressionHistory({ ...base, transcript: [really] }, "U09")).toBe("used");
    expect(expressionHistory({ ...base, transcript: [{ ...same, role: "character", audioId: "C08" }] }, "U04")).toBe("encountered");
    // Run the specific route: no C08 and no U04 model is shown in less support.
    let s = read(reach("p4.same", { "p5.opinion": "not" }));
    s = act(s, { type: "TYPE", text: "I ordered the same." }); s = act(s, { type: "SEND_RESPONSE" });
    for (let n = 0; n < 40 && s.nodeId !== "p7.too"; n++) {
      const node = catalog[s.nodeId];
      s = node.kind === "choice" ? act(read(s), { type: "CHOOSE", choice: node.id === "p5.opinion" ? "not" : "too" }) : advance(s);
    }
    expect(s.nodeId).toBe("p7.too"); expect(s.phase).toBe("write");
    expect(expressionHistory(s, "U04")).toBe("new");
  });

  it("allows edge punctuation, separated sentences, NFC and equivalent contractions without merging punctured words", () => {
    for (const normalize of [normalizeAnswer, normalizeStudy]) {
      expect(normalize("  NO, it’s not mine! ")).toBe(normalize("no it is not mine"));
      expect(normalize("That's okay. Bye! ")).toBe(normalize("That is okay bye"));
      expect(normalize("cafe\u0301")).toBe(normalize("café"));
      expect(normalize("n.o.t")).not.toBe(normalize("not"));
      expect(normalize("s,u,r,e")).not.toBe(normalize("sure"));
      expect(normalize("t.o")).not.toBe(normalize("to"));
    }
    expect(acceptsAnswer("I have got to go.", "U16", "p9.go")).toBe(true);
    expect(acceptsAnswer("s,u,r,e", "U10", "p8.accept")).toBe(false);
    const negativeWord = studySteps.find(x => x.step.id === "its-not")!.step.practice;
    for (const text of ["n.o.t", "no", "it's not", "It is not"]) expect(isCorrect(negativeWord, text)).toBe(false);
  });
});

describe("published story audio and diagnostic study", () => {
  it("links full clips and excerpts explicitly, never invents can-sit audio and avoids overlapping native players", () => {
    for (const { step } of studySteps) for (const ref of step.storyAudio) expect(audio[ref.id]).toBeDefined();
    const expected: Record<string, string[]> = { "iced-coffee": ["C03"], "sorry-okay": ["C02", "U03"], "careful-close": ["U08", "C11"], "work-job": ["C13", "C14"], "break-quiet": ["C23", "C27"], "can-sit": [] };
    for (const [id, ids] of Object.entries(expected)) {
      const step = studySteps.find(x => x.step.id === id)!.step;
      expect(step.storyAudio.map(ref => ref.id)).toEqual(ids);
      const published = Object.fromEntries(ids.map(id => [id, { key: "a".repeat(64), audioUrl: `https://example.test/${id}.mp3` }]));
      const html = renderToStaticMarkup(createElement(CachedAudio, { references: step.storyAudio, publishedAudio: published }));
      expect((html.match(/preload="none"/g) ?? []).length).toBe(ids.length);
      if (step.storyAudio.some(ref => ref.scope === "excerpt")) expect(html).toContain("fala completa da história");
      for (const ref of step.storyAudio) expect(html).toContain(audio[ref.id].text.replaceAll("&", "&amp;"));
    }
    const active = { paused: false, pause: vi.fn() }, other = { paused: false, pause: vi.fn() }, idle = { paused: true, pause: vi.fn() };
    pauseOtherStudyAudio({ querySelectorAll: () => [active, other, idle] } as unknown as ParentNode, active as unknown as HTMLAudioElement);
    expect(active.pause).not.toHaveBeenCalled(); expect(other.pause).toHaveBeenCalledOnce(); expect(idle.pause).not.toHaveBeenCalled();
  });
  it("provides a useful explanation for every choice distractor and keeps completion IDs and class eligibility", () => {
    for (const { step } of studySteps) if (step.practice.kind === "choice") {
      for (const option of step.practice.options) if (!isCorrect(step.practice, option)) expect(practiceFeedback(step.practice, option).length).toBeGreaterThan(30);
    }
    const old = JSON.stringify({ version: 1, position: 23, completed: studySteps.map(x => x.step.id), supported: ["mine-your"] });
    expect(parseStudySnapshot(old).studyCompleted).toBe(24);
    expect(savedStudyCompleted({ studySnapshot: old })).toBe(24);
    expect(JSON.parse(parseStudySnapshot(old).studySnapshot!)).toEqual(JSON.parse(old));
  });
});

describe("real pre-correction snapshots retain history", () => {
  const fixtures = JSON.parse(readFileSync("tests/fixtures/demo-cafe-v7-content.json", "utf8")).fixtures as { label: string; profile: string; snapshot: string; expected: DemoState }[];
  for (const fixture of fixtures) it(`${fixture.profile} ${fixture.label}`, () => {
    const restored = decodeSnapshot(fixture.snapshot)!; expect(restored).not.toBeNull();
    expect(restored.transcript).toEqual(fixture.expected.transcript);
    expect(restored.evidence).toEqual(fixture.expected.evidence);
    expect(restored.decisions).toEqual(fixture.expected.decisions);
    expect(restored.journal.slice(0, -1)).toEqual(JSON.parse(fixture.snapshot).journal);
    expect(decodeSnapshot(encodeSnapshot(restored))).toEqual(restored);
    if (fixture.label === "partial-draft") {
      expect(restored.draft).toBe(fixture.expected.draft); expect(restored.selected).toEqual(fixture.expected.selected); expect(restored.phase).toBe(fixture.expected.phase);
    } else if (fixture.label === "before-contradictory-response") {
      expect(restored.nodeId).toBe("p10.contact"); expect(restored.transcript.some(line => line.audioId === "U17")).toBe(false);
    } else {
      expect(restored.nodeId).toBe("end"); expect(restored.transcript.some(line => line.audioId === "U17")).toBe(true);
    }
    const back = act(restored, { type: "BACK" });
    expect(decodeSnapshot(encodeSnapshot(back))).toEqual(back);
  });
  it("preserves old recall phase decisions even when an old accepted spelling no longer counts as lexical use", () => {
    const raw = readFileSync("tests/fixtures/demo-cafe-v7-punctured-recall.json", "utf8");
    const restored = decodeSnapshot(raw)!;
    expect(restored).not.toBeNull(); expect(restored.nodeId).toBe("p7.too");
    expect(restored.phase).toBe("write"); expect(restored.checked).toContain("p7.too");
    expect(restored.transcript.find(line => line.nodeId === "p4.same")?.written).toBe("M.e too.");
    expect(expressionHistory(restored, "U04")).toBe("new");
    expect(decodeSnapshot(encodeSnapshot(restored))).toEqual(restored);
    const sent = act(act(read(restored), { type: "TYPE", text: "Me too." }), { type: "SEND_RESPONSE" });
    expect(sent.nodeId).toBe("p7.long-day");
    expect(decodeSnapshot(encodeSnapshot(sent))).toEqual(sent);
  });

  it("replays an old accepted punctured spelling honestly, then applies the corrected policy to a new attempt", () => {
    let s = createDemo("less", "old-spelling", 0, "cafe-v7");
    const legacyAct = (e: Action) => { s = replayEvent(s, { ...e, at: s.nodeId } as DemoEvent); };
    for (const at of ["p1.first", "p1.context", "p1.lucas", "p2.prompt"]) { expect(s.nodeId).toBe(at); legacyAct({ type: "NEXT" }); }
    legacyAct({ type: "ANSWER_MEANING", correct: true });
    legacyAct({ type: "TYPE", text: "No, it is n.o.t mine." }); legacyAct({ type: "SEND_RESPONSE" });
    expect(s.nodeId).toBe("p2.reaction");
    const restored = decodeSnapshot(encodeSnapshot(s))!;
    expect(restored.transcript).toEqual(s.transcript);
    expect(restored.transcript.at(-2)?.written).toContain("n.o.t");
    expect(acceptsAnswer("No, it is n.o.t mine.", "U01", "p2.send")).toBe(false);
  });
});
