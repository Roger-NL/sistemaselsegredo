import "server-only";
import { LearningConflictError } from "@/server/workspace/conflict";
import { getAdminDb } from "@/server/firebase";
import type { RequestPrincipal } from "@/server/auth/principal";
import { RequestAuthError } from "@/server/auth/request-auth";
import { RequestPayloadError, assertOnlyKeys } from "@/server/http/request";
import { consumeRateLimit } from "@/server/http/rate-limit";
import { learningRef, userRef, studentActivityRef } from "@/server/workspace/service";
import { accountStatus, learningFromData, parseDemoSnapshot, parseStudySnapshot } from "@/server/workspace/validation";
import { requireTestOwner } from "./policy";
import { applyTestAction, testActions, type TestAction } from "@/features/superuser/actions";
import { catalog } from "@/features/demo/content/catalog";
import { PROFILES, REVIEW_VIEWS } from "@/features/demo/model/types";
import { studySteps } from "@/features/theory/progress";
export function validateTestAction(body: Record<string, unknown>): TestAction {
  assertOnlyKeys(body,["action","saveVersion","revision","profile","part","node","step","view"]);
  const action = body.action as TestAction["action"];
  if (!Number.isSafeInteger(body.saveVersion) || Number(body.saveVersion)<0 || !testActions.includes(action) || !Number.isSafeInteger(body.revision) || Number(body.revision)<0) throw new RequestPayloadError("Ação ou revisão inválida.");
  const fields = action === "jump-part" || action === "complete-part" ? ["part","profile"] : action === "jump-node" ? ["node","profile"] : ["start-demo","profile"].includes(action) ? ["profile"] : action.startsWith("study-") ? ["step"] : action === "review" ? ["view"] : [];
  for (const key of ["profile","part","node","step","view"]) if (key in body && !fields.includes(key)) throw new RequestPayloadError("Parâmetro incompatível com a ação.");
  if (body.profile !== undefined && !PROFILES.includes(body.profile as never)) throw new RequestPayloadError("Apoio inválido.");
  if (fields.includes("part") && (!Number.isInteger(body.part) || Number(body.part)<1 || Number(body.part)>10)) throw new RequestPayloadError("Parte inválida.");
  if (fields.includes("node") && (typeof body.node!=="string" || !catalog[body.node])) throw new RequestPayloadError("Momento inválido.");
  if (fields.includes("step") && (!Number.isInteger(body.step) || Number(body.step)<0 || Number(body.step)>=studySteps.length)) throw new RequestPayloadError("Etapa inválida.");
  if (fields.includes("view") && !REVIEW_VIEWS.includes(body.view as never)) throw new RequestPayloadError("Tela de revisão inválida.");
  return body as TestAction;
}
export async function mutateTestProgress(principal: RequestPrincipal, body: Record<string,unknown>) {
  await requireTestOwner(principal);
  const action = validateTestAction(body);
  await consumeRateLimit({namespace:"test-controls",identifier:principal.uid,limit:120,windowMs:60_000});
  return getAdminDb().runTransaction(async tx => {
    const [saved,profile] = await Promise.all([tx.get(learningRef(principal.uid)),tx.get(userRef(principal.uid))]);
    if (!profile.exists || !["active","pending"].includes(accountStatus(profile.data()?.accountStatus))) throw new RequestAuthError("A conta está indisponível.",403);
    const previous = learningFromData(saved.data());
    if (previous.revision !== body.revision) throw new RequestAuthError("O progresso mudou em outra aba. Atualize antes de aplicar o controle.",409);
    if (previous.saveVersion !== body.saveVersion) throw new LearningConflictError();
    const cleanHistory = ["reset-all","reset-real"].includes(action.action) ? await tx.get(studentActivityRef(principal.uid).where("kind","==","learning").limit(450)) : null;
    if (cleanHistory && cleanHistory.size >= 450) throw new RequestAuthError("O histórico é grande demais para um reset atômico. Nenhum dado foi alterado.",409);
    const changed = applyTestAction(previous,action);
    const next = { ...changed, ...parseDemoSnapshot(changed.demoSnapshot), ...parseStudySnapshot(changed.studySnapshot), revision:previous.revision+1, saveVersion:previous.saveVersion+1, updatedAt:new Date().toISOString() };
    if (["reset-all","reset-real","reset-presentation","complete-presentation","complete-all"].includes(action.action)) {
      const revision=Number(profile.data()?.presentationRevision)||0;
      tx.update(userRef(principal.uid), {presentationCompletedAt:["complete-presentation","complete-all"].includes(action.action)?next.updatedAt:null,presentationRevision:revision+1});
    }
    tx.set(learningRef(principal.uid),next);
    for (const item of cleanHistory?.docs ?? []) tx.delete(item.ref);
    tx.create(getAdminDb().collection("learning_test_audit").doc(),{userId:principal.uid,action:action.action,fromRevision:previous.revision,toRevision:next.revision,testMode:next.testMode,at:next.updatedAt});
    return { learning:next };
  });
}
