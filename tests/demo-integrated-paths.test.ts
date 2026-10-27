import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { catalog, nodes } from "@/features/demo/content/catalog";
import { audio } from "@/features/demo/content/media";
import { presentationCards } from "@/features/demo/content/presentation";
import { listeningTarget, type AudioAccess } from "@/features/demo/model/listening";
import { practice, recognitionOptions } from "@/features/demo/model/practice";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { ending, retrospective } from "@/features/demo/model/retrospective";
import { PROFILES, type DemoEvent, type DemoState, type ResponseNode, type SupportProfile } from "@/features/demo/model/types";
import { decodeSnapshot, encodeSnapshot } from "@/features/demo/session/storage";

type WithoutAt<T> = T extends unknown ? Omit<T, "at"> : never;
type Action = WithoutAt<DemoEvent>;
type Choices = Record<string, string>;
const routeA: Choices = { "p3.intent": "ask", "p5.opinion": "like", "p7.opinion": "too", "p8.topic": "english", "p9.english-opinion": "like", "p9.cafe-opinion": "not", "p9.pause": "stay", "p10.contact": "contact" };
const routeB: Choices = { "p3.intent": "okay", "p5.opinion": "not", "p7.opinion": "not", "p8.topic": "job", "p9.english-opinion": "not", "p9.cafe-opinion": "not", "p9.pause": "go", "p10.contact": "bye" };
const render = (state: DemoState) => renderToStaticMarkup(createElement(DemoExperience, { initial: state }));

function reload(state: DemoState): DemoState {
  const restored = decodeSnapshot(encodeSnapshot(state));
  expect(restored).toEqual(state);
  return restored!;
}

class Journey {
  state: DemoState;
  checkpoints = new Map<string, DemoState>();
  activities = new Map<string, DemoState>();
  visited = new Set<string>();
  choices = new Set<string>();
  phases = new Set<string>();
  faults = new Set<string>();
  audioModes = new Set<AudioAccess>();

  constructor(initial: DemoState, readonly mode: AudioAccess, readonly helpAt?: string) { this.state = initial; }

  act(action: Action) {
    const before = this.state;
    this.state = transition(before, { ...action, at: before.nodeId } as DemoEvent);
    expect(this.state, `${before.nodeId}: ${action.type}`).not.toBe(before);
    expect(this.state.journal.some(event => ["TEST_FORWARD", "BLOCK", "SUBMIT", "UNDERSTAND", "USE_SUPPORT"].includes(event.type))).toBe(false);
    return this.state;
  }

  unchangedEvidence(before: DemoState) {
    expect(this.state.transcript).toEqual(before.transcript);
    expect(this.state.evidence).toEqual(before.evidence);
  }

  read() {
    for (let guard = 0; guard < 15; guard++) {
      const node = catalog[this.state.nodeId];
      const target = listeningTarget(this.state);
      if (target && !this.state.audioAccess[target.key]) {
        const before = this.state;
        // Simulated completion or explicit text access: no real playback is claimed.
        this.act({ type: "AUDIO_ACCESS", key: target.key, mode: this.mode });
        this.audioModes.add(this.mode);
        this.unchangedEvidence(before);
        expect(this.state.audioAccess[target.key]).toBe(this.mode);
        this.state = reload(this.state);
      } else if (this.state.presentationStep < presentationCards(node).length) {
        const before = this.state;
        this.act({ type: "ADVANCE_PRESENTATION" });
        expect(this.state.nodeId).toBe(before.nodeId);
        expect(this.state.presentationStep).toBe(before.presentationStep + 1);
        this.unchangedEvidence(before);
      } else return;
    }
    throw new Error(`Reading did not finish at ${this.state.nodeId}`);
  }

  prepare() {
    this.read();
    if (this.state.phase === "present" || this.state.phase === "recall") {
      const before = this.state;
      this.act({ type: this.state.phase === "present" ? "PREPARE" : "CHECK" });
      this.unchangedEvidence(before);
    }
    this.phases.add(this.state.phase);
    this.activities.set(this.state.nodeId, this.state);
  }

  answer(node: ResponseNode) {
    this.prepare();
    if (node.id === "p2.send" && this.state.phase === "build") {
      this.act({ type: "PLACE_BLOCK", block: "no" });
      const before = this.state;
      for (let error = 1; error <= 3; error++) {
        this.act({ type: "PLACE_BLOCK", block: "mine" });
        expect(this.state.selected).toEqual(error === 3 ? [] : ["no"]);
        expect(this.state.assemblyMistakes).toBe(error % 3);
        expect(this.state.returnedBlocks).toContain("mine");
        expect(this.state.help).toEqual(before.help);
        this.unchangedEvidence(before);
        this.state = reload(this.state);
      }
      this.faults.add("third-assembly-error");
    }
    if (node.id === "p2.send" && this.state.phase === "write") {
      this.act({ type: "TYPE", text: "This coffee is mine." });
      const before = this.state;
      this.act({ type: "SEND_RESPONSE" });
      expect(this.state.nodeId).toBe(node.id);
      expect(this.state.draft).toBe(before.draft);
      expect(this.state.help).toEqual(before.help);
      this.unchangedEvidence(before);
      this.faults.add("written-error");
    }
    if (node.id === "p3.okay" && this.state.phase === "select") {
      const wrong = recognitionOptions(node).find(id => id !== node.response)!;
      this.act({ type: "RECOGNIZE", response: wrong });
      const before = this.state;
      this.act({ type: "SEND_RESPONSE" });
      expect(this.state.nodeId).toBe(node.id);
      expect(this.state.recognized).toBeNull();
      expect(this.state.help).toEqual(before.help);
      this.unchangedEvidence(before);
      this.faults.add("recognition-error");
    }
    if (node.id === this.helpAt) {
      const before = this.state;
      expect(before.help[node.id]).toBeUndefined();
      this.act({ type: "REVEAL_MODEL" });
      expect(this.state.help[node.id]).toBe(node.help.length);
      expect(this.state.selected).toEqual(before.selected);
      expect(this.state.draft).toBe(before.draft);
      expect(this.state.audioAccess).toEqual(before.audioAccess);
      this.unchangedEvidence(before);
      this.state = reload(this.state);
    }
    if (this.state.phase === "build") {
      const exercise = practice(node, this.state.assistedBlocks ? "some" : this.state.activityProfile);
      for (const block of exercise.answer.slice(this.state.selected.length)) this.act({ type: "PLACE_BLOCK", block });
    } else if (this.state.phase === "write") {
      // Preserve an accepted literal variant in the transcript, rather than replacing it with the model.
      const text = node.id === "p2.send" ? "  NO, it isn't mine!  " : audio[node.response].text;
      this.act({ type: "TYPE", text });
    } else if (this.state.phase === "select") this.act({ type: "RECOGNIZE", response: node.response });
    const before = this.state;
    this.act({ type: "SEND_RESPONSE" });
    const sent = this.state;
    expect(sent.nodeId).toBe(node.next);
    expect(sent.evidence).toHaveLength(before.evidence.length + 1);
    expect(sent.transcript.slice(before.transcript.length).map(line => [line.role, line.audioId])).toEqual([
      ["you", node.response], ...(catalog[node.next].heard ?? []).map(id => ["character", id]),
    ]);
    if (before.phase === "write") expect(sent.transcript.find(line => line.nodeId === node.id && line.role === "you")?.written).toBe(before.draft);
    if (node.id === this.helpAt) expect(sent.evidence.at(-1)?.kind).toBe("supported");
    if (node.id === "p2.send") expect(sent.evidence.at(-1)?.kind).toBe(before.phase === "write" ? "written" : "blocks");
    if (node.id === "p10.bye") {
      expect(before.audioAccess["lucas:p10.bye"]).toBe(this.mode);
      expect(catalog[node.next].kind).toBe("end");
    } else {
      expect(listeningTarget(sent)?.kind).toBe("lucas");
      expect(listeningTarget(sent)?.audio).toEqual(catalog[node.next].heard);
    }
    expect(transition(sent, { at: node.id, type: "SEND_RESPONSE" })).toBe(sent);
    if (node.id === "p3.ask" || node.id === "p3.okay") {
      const rewound = transition(reload(sent), { at: sent.nodeId, type: "BACK" });
      expect(rewound).toEqual(before);
      expect(transition(reload(rewound), { at: node.id, type: "SEND_RESPONSE" })).toEqual(sent);
    }
  }

  play(choices: Choices, stopAt?: string) {
    for (let guard = 0; guard < 100; guard++) {
      const node = catalog[this.state.nodeId];
      this.visited.add(node.id);
      if (node.kind === "end") return this;
      this.read();
      this.checkpoints.set(node.id, this.state);
      if (node.id === stopAt) return this;
      if (node.kind === "scene") this.act({ type: "NEXT" });
      else if (node.kind === "choice") {
        const selected = choices[node.id];
        expect(node.choices.some(choice => choice.id === selected), node.id).toBe(true);
        this.choices.add(`${node.id}:${selected}`);
        this.act({ type: "CHOOSE", choice: selected });
      } else if (node.kind === "comprehension") {
        const before = this.state;
        this.act({ type: "ANSWER_MEANING", correct: false });
        expect(this.state.nodeId).toBe(node.id);
        expect(this.state.help).toEqual(before.help);
        this.unchangedEvidence(before);
        this.faults.add("meaning-error");
        this.act({ type: "ANSWER_MEANING", correct: true });
      } else this.answer(node);
    }
    throw new Error(`No ending from ${this.state.nodeId}`);
  }
}

function verifyRetrospective(state: DemoState) {
  const lines = state.transcript;
  const responses = lines.filter(line => line.role === "you");
  expect(new Set(lines.map(line => line.id)).size).toBe(lines.length);
  expect(state.evidence).toHaveLength(responses.length);
  const highlighted = retrospective(state);
  for (const highlight of highlighted) {
    const after = lines.findIndex(line => line.role === "you" && line.audioId === highlight.after);
    expect(after).toBeGreaterThan(0);
    expect(lines.slice(0, after).some(line => line.audioId === highlight.before && line.role === highlight.beforeRole)).toBe(true);
  }
  const after = highlighted.map(item => item.after);
  expect(after.includes("U05")).toBe(state.decisions["p3.intent"] === "okay");
  expect(after.includes("U12")).toBe(state.decisions["p8.topic"] === "job");
  expect(after.includes("U13")).toBe(state.decisions["p8.topic"] === "english");
  expect(after.includes("U17")).toBe(state.decisions["p9.pause"] === "stay");
  expect(responses.some(line => line.audioId === "U18")).toBe(state.decisions["p10.contact"] === "contact");
  const moments = transition(state, { at: "end", type: "REVIEW", view: "moments" });
  expect(render(moments)).toContain("Esta conversa não comprova domínio ou memorização.");
  const thanks = transition(moments, { at: "end", type: "REVIEW", view: "thanks" });
  expect(render(thanks)).toContain('href="/demo/estudo"');
  expect(transition(reload(thanks), { at: "end", type: "BACK" })).toEqual(moments);
  reload(state);
}

const coverage: Record<string, unknown>[] = [];
afterAll(() => {
  if (process.env.BASEDSPEAK_STAGE3_REPORT !== "1") return;
  const directory = resolve(process.cwd(), "output/stage3-qa");
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, "percursos.json"), JSON.stringify({
    scope: "Directed model regression with current UI events after removal of test navigation",
    limitations: "Not browser traversal, real audio playback, editorial listening, physical devices or learner testing; heard/text are simulated events.",
    profilesPassed: coverage.length, catalogNodes: nodes.length,
    primaryCompletePaths: 6, resumedVariantSuffixes: 6, changedBranchSuffixes: 3, supportChanges: 3,
    existingGraphReference: "tests/demo-model.test.ts and tests/demo-presentation.test.ts already cover 128 narrative combinations per profile (384 total).",
    profiles: coverage,
  }, null, 2) + "\n");
});

describe("integrated current-event café paths", () => {
  for (const profile of PROFILES) it(`covers complementary paths, missing variants, resumption and honest evidence in ${profile}`, () => {
    const a = new Journey(createDemo(profile, `stage3-${profile}-A`, 0), "heard", "p8.english").play(routeA);
    const b = new Journey(createDemo(profile, `stage3-${profile}-B`, 0), "text").play(routeB);
    const englishNot = new Journey(reload(a.checkpoints.get("p9.english-opinion")!), "heard")
      .play({ ...routeA, "p9.english-opinion": "not", "p10.contact": "bye" });
    const cafeLike = new Journey(reload(b.checkpoints.get("p9.cafe-opinion")!), "text")
      .play({ ...routeB, "p9.cafe-opinion": "like" });
    const journeys = [a, b, englishNot, cafeLike];
    const visited = new Set(journeys.flatMap(journey => [...journey.visited]));
    const choices = new Set(journeys.flatMap(journey => [...journey.choices]));
    expect([...visited].sort()).toEqual(nodes.map(node => node.id).sort());
    expect([...choices].sort()).toEqual(nodes.flatMap(node => node.kind === "choice" ? node.choices.map(choice => `${node.id}:${choice.id}`) : []).sort());
    expect(new Set(journeys.map(journey => ending(journey.state))).size).toBe(3);
    for (const journey of journeys) verifyRetrospective(journey.state);
    expect(a.state.evidence.some(item => item.nodeId === "p8.english" && item.kind === "supported")).toBe(true);
    expect(b.state.evidence.some(item => item.nodeId === "p8.english")).toBe(false);
    expect(Object.values(a.state.audioAccess).every(mode => mode === "heard")).toBe(true);
    expect(Object.values(b.state.audioAccess).every(mode => mode === "text")).toBe(true);
    expect(a.faults).toContain("meaning-error");
    expect(a.faults).toContain(profile === "less" ? "written-error" : "third-assembly-error");
    if (profile === "beginner") expect(b.faults).toContain("recognition-error");

    // Rewind a completed English branch, reload it, and choose work instead.
    let rewound = reload(a.state);
    for (let guard = 0; rewound.nodeId !== "p8.topic"; guard++) {
      expect(guard).toBeLessThan(100);
      const before = rewound;
      rewound = transition(rewound, { at: rewound.nodeId, type: "BACK" });
      expect(rewound.journal.length).toBeLessThan(before.journal.length);
      rewound = reload(rewound);
    }
    expect(rewound.decisions["p8.topic"]).toBeUndefined();
    const changed = new Journey(rewound, "text").play(routeB);
    expect(changed.state.transcript.some(line => line.audioId === "U11" || line.audioId === "U13")).toBe(false);
    expect(retrospective(changed.state).some(item => item.after === "U12")).toBe(true);
    expect(retrospective(changed.state).some(item => item.after === "U13")).toBe(false);
    verifyRetrospective(changed.state);

    // The chosen support changes the next activity, preserving this activity's draft and rules.
    const nextProfile: SupportProfile = profile === "beginner" ? "less" : profile === "some" ? "beginner" : "some";
    const partial = new Journey(reload(a.activities.get("p3.ask")!), "text");
    if (partial.state.phase === "write") partial.act({ type: "TYPE", text: "What did" });
    else partial.act({ type: "PLACE_BLOCK", block: "what" });
    const beforeSwitch = partial.state;
    partial.act({ type: "PROFILE", profile: nextProfile });
    expect(partial.state.activityProfile).toBe(profile);
    expect(partial.state.profile).toBe(nextProfile);
    expect(partial.state.draft).toBe(beforeSwitch.draft);
    expect(partial.state.selected).toEqual(beforeSwitch.selected);
    partial.unchangedEvidence(beforeSwitch);
    partial.state = reload(partial.state);
    partial.play(routeA, "p4.same");
    expect(partial.state.activityProfile).toBe(nextProfile);
    expect(partial.state.phase).toBe(nextProfile === "beginner" ? "present" : nextProfile === "less" ? "write" : "build");

    coverage.push({ profile, visitedNodes: [...visited].sort(), choices: [...choices].sort(), endings: [...new Set(journeys.map(journey => ending(journey.state)))],
      primaryPaths: [{ choices: a.state.decisions, audio: "simulated heard", responses: a.state.evidence.length }, { choices: b.state.decisions, audio: "simulated text fallback", responses: b.state.evidence.length }],
      faults: [...new Set(journeys.flatMap(journey => [...journey.faults]))], responsePhases: [...new Set(journeys.flatMap(journey => [...journey.phases]))], supportChangedTo: nextProfile });
  });
});
