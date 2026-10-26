export const STORY_VERSION = "cafe-v7";
export const SCHEMA_VERSION = 1;
export const PROFILES = ["beginner", "some", "less"] as const;
export type SupportProfile = typeof PROFILES[number];
export type AudioId = `C${string}` | `U${string}`;
export type ImageId = `V${string}`;
export type Choice = { id: string; label: string; next: string };
export type Block = { id: string; text: string };

type BaseNode = {
  id: string; part: number; image: ImageId; context: string;
  heard?: AudioId[]; help: string[];
};
export type SceneNode = BaseNode & { kind: "scene"; next: string; button?: string; presentation?: "title" | "context" | "prompt" | "dialogue" };
export type ChoiceNode = BaseNode & { kind: "choice"; prompt: string; choices: Choice[] };
export type ComprehensionNode = BaseNode & { kind: "comprehension"; next: string };
export type ResponseNode = BaseNode & {
  kind: "response"; next: string; response: AudioId;
  mode: "blocks" | "whole" | "recall" | "recombine";
  blocks?: Block[]; answer?: string[]; skeleton?: string;
  teach?: boolean; button?: string;
};
export type EndNode = BaseNode & { kind: "end" };
export type DemoNode = SceneNode | ChoiceNode | ComprehensionNode | ResponseNode | EndNode;
export type TranscriptLine = { id: string; nodeId: string; part: number; audioId: AudioId; role: "character" | "you"; written?: string };
export type Evidence = { nodeId: string; response: AudioId; kind: "blocks" | "recombined" | "supported" | "written" | "recognized" };
export const REVIEW_VIEWS = ["end", "moments", "thanks", "feedback", "done"] as const;
export type ReviewView = typeof REVIEW_VIEWS[number];
export type DemoEvent = { at: string } & (
  | { type: "TEST_FORWARD" | "SEND_RESPONSE" | "REVEAL_MODEL" | "BACK" | "NEXT" | "ADVANCE_PRESENTATION" | "PREPARE" | "SUBMIT" | "CHECK" | "HELP" | "USE_SUPPORT" | "CLEAR" | "TOGGLE_MODEL" }
  | { type: "AUDIO_ACCESS"; key: string; mode: "heard" | "text" }
  | { type: "CHOOSE"; choice: string }
  | { type: "TYPE"; text: string }
  | { type: "RECOGNIZE"; response: AudioId }
  | { type: "USE_BLOCKS" | "WRITE_AGAIN" }
  | { type: "UNDERSTAND" | "ANSWER_MEANING"; correct: boolean }
  | { type: "BLOCK" | "PLACE_BLOCK"; block: string }
  | { type: "REMOVE_BLOCK" | "RETURN_BLOCKS"; index: number }
  | { type: "PROFILE"; profile: SupportProfile }
  | { type: "REVIEW"; view: ReviewView }
);
export type DemoState = {
  schemaVersion: number; storyVersion: string; runId: string; startedAt: number;
  initialProfile: SupportProfile; profile: SupportProfile; activityProfile: SupportProfile;
  nodeId: string; phase: "scene" | "present" | "build" | "recall" | "ready" | "write" | "select";
  presentationStep: number;
  audioAccess: Record<string, "heard" | "text">;
  assemblyMistakes: number; returnedBlocks: string[]; returnSerial: number;
  selected: string[]; draft: string; recognized: AudioId | null; assistedBlocks: boolean; help: Record<string, number>; checked: string[];
  decisions: Record<string, string>; transcript: TranscriptLine[]; evidence: Evidence[];
  journal: DemoEvent[]; notice: string;
  reviewView: ReviewView;
  modelHidden: boolean;
};
