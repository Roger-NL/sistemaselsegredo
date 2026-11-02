import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";
const fake = vi.hoisted(()=>{
  const docs=new Map<string,Record<string,unknown>>();
  const identity={uid:"FvhS6SDcIJfGiDteKjAlGzBJAQq1",email:"raugerac@gmail.com",emailVerified:true,disabled:false};
  const principal=vi.fn();
  function ref(path:string) {return {path,id:path.split('/').at(-1),collection:(n:string)=>query(path+'/'+n),get:async()=>snap(path)};}
  function snap(path:string) {return {exists:docs.has(path),data:()=>docs.get(path),ref:ref(path)};}
  function query(path:string,filter?:[string,unknown],limit=1000) {return {doc:(id=crypto.randomUUID())=>ref(path+'/'+id),where:(k:string,_op:string,v:unknown)=>query(path,[k,v]),limit:(n:number)=>query(path,filter,n),get:async()=>{const selected=[...docs].filter(([k,v])=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')&&(!filter||v[filter[0]]===filter[1])).slice(0,limit);return {size:selected.length,docs:selected.map(([k])=>snap(k))};}};}
  let queue=Promise.resolve();
  const db={collection:query,runTransaction:async<T>(fn:(tx:unknown)=>Promise<T>)=>{
    let release!:()=>void;const before=queue;queue=new Promise(r=>{release=r});await before;
    const writes:(()=>void)[]=[];
    const tx={get:(r:{get:()=>Promise<unknown>})=>r.get(),set:(r:{path:string},v:Record<string,unknown>)=>writes.push(()=>docs.set(r.path,structuredClone(v))),create:(r:{path:string},v:Record<string,unknown>)=>writes.push(()=>docs.set(r.path,structuredClone(v))),update:(r:{path:string},v:Record<string,unknown>)=>writes.push(()=>docs.set(r.path,{...docs.get(r.path),...structuredClone(v)})),delete:(r:{path:string})=>writes.push(()=>{docs.delete(r.path)})};
    try {const result=await fn(tx);writes.forEach(w=>w());return result;}finally{release();}
  }};
  const auth={getUser:vi.fn(async()=>({...identity}))};
  return {docs,identity,principal,db,auth};
});
vi.mock("@/server/firebase",()=>({getAdminDb:()=>fake.db,getAdminAuth:()=>fake.auth}));
vi.mock("@/server/auth/principal",()=>({getRequestPrincipal:fake.principal}));
vi.mock("@/server/http/rate-limit",()=>({consumeRateLimit:vi.fn(async()=>{})}));
const effects=vi.hoisted(()=>({prepare:vi.fn(async(tx:unknown,events:unknown[])=>{void tx;void events;return ()=>[];}),schedule:vi.fn()}));
vi.mock("@/server/notifications/outbox",()=>({prepareOperationalNotifications:effects.prepare,writeOperationalNotifications:vi.fn(()=>[])}));
vi.mock("@/server/notifications/background",()=>({scheduleOperationalNotifications:effects.schedule}));
import { GET,POST } from "@/app/api/student/test-controls/route";
import { isTestOwner } from "@/server/superuser/policy";
import { mutateTestProgress,validateTestAction } from "@/server/superuser/service";
import { completePresentation } from "@/server/presentation/service";
import { saveLearning,createConversation } from "@/server/workspace/service";
import { testActionDestination, applyTestAction } from "@/features/superuser/actions";
import { emptyGuestLearning } from "@/features/dashboard/guest-learning";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { decodeProgress,studySteps } from "@/features/theory/progress";
import { parseDemoSnapshot } from "@/server/workspace/validation";
import { catalog,nodes } from "@/features/demo/content/catalog";
const owner:RequestPrincipal={uid:fake.identity.uid,email:fake.identity.email,role:"student",source:"session_cookie",subscriptionStatus:"free"};
const request=(method:string,body={},origin="https://basedspeak.test",uid=owner.uid)=>new Request("https://basedspeak.test/api/student/test-controls",{method,headers:{origin,"content-type":"application/json","x-workspace-uid":uid},...(method==="POST"?{body:JSON.stringify(body)}:{})});
beforeEach(()=>{vi.clearAllMocks();fake.docs.clear();fake.auth.getUser.mockResolvedValue({...fake.identity});fake.principal.mockResolvedValue(owner);fake.docs.set(`users/${owner.uid}`,{accountStatus:"active"});});
describe("exclusive server-bound test owner",()=>{
  it("binds UID plus current verified email; manager and browser claims grant nothing",async()=>{
    for(const patch of [{uid:"other"},{email:"other@example.com"},{emailVerified:false},{disabled:true}]) expect(isTestOwner({...fake.identity,...patch})).toBe(false);
    for(const role of ["admin","student"]) {fake.principal.mockResolvedValue({...owner,uid:"other",role});expect((await GET(request("GET"))).status).toBe(403);expect((await POST(request("POST",{action:"complete-all",revision:0},undefined,"other"))).status).toBe(403);}
    expect(fake.docs.size).toBe(1);
  });
  it("rejects anonymous, cross-origin, account mismatch and forged fields without writes",async()=>{
    fake.principal.mockResolvedValue(null);expect((await GET(request("GET"))).status).toBe(401);expect((await POST(request("POST"))).status).toBe(401);
    fake.principal.mockResolvedValue(owner);
    expect((await POST(request("POST",{},"https://evil.test"))).status).toBe(403);
    expect((await POST(request("POST",{},undefined,"other"))).status).toBe(409);
    for(const body of [{action:"complete-all",revision:0,userId:"other"},{action:"complete-all",revision:0,testMode:false},{action:"jump-part",revision:0,part:11},{action:"study-position",revision:0,step:24},{action:"jump-node",revision:0,node:"missing"},{action:"forward",revision:0,profile:"beginner"}]) expect((await POST(request("POST",body))).status).toBe(400);
    expect(fake.docs.size).toBe(1);
  });
  it("executes a reset directly without a typed phrase or confirmation field",async()=>{
    const response=await POST(request("POST",{action:"reset-all",revision:0}));
    expect(response.status).toBe(200);
    expect((await response.json()).learning).toMatchObject({revision:1,demoSnapshot:null,studySnapshot:null,testMode:true});
    expect(fake.docs.get(`learning_states/${owner.uid}`)?.revision).toBe(1);
  });
  it("rechecks canonical identity for every action and GET",async()=>{
    expect((await GET(request("GET"))).status).toBe(200);
    fake.auth.getUser.mockResolvedValue({...fake.identity,emailVerified:false});
    expect((await GET(request("GET"))).status).toBe(403);expect((await POST(request("POST",{action:"complete-all",revision:0}))).status).toBe(403);
  });
});
describe("transactional persisted progress controls",()=>{
  it("resets onboarding in the database and rejects an old presentation completion",async()=>{
    fake.docs.set(`users/${owner.uid}`,{accountStatus:"active",presentationCompletedAt:"2026-10-01",name:"keep"});
    await mutateTestProgress(owner,{action:"reset-presentation",revision:0});
    expect(fake.docs.get(`users/${owner.uid}`)).toMatchObject({presentationCompletedAt:null,presentationRevision:1,name:"keep"});
    await expect(completePresentation(owner.uid,0)).rejects.toMatchObject({status:409});
    expect(await completePresentation(owner.uid,1)).toMatchObject({completed:true,revision:1});
    await mutateTestProgress(owner,{action:"reset-all",revision:1});
    expect(fake.docs.get(`users/${owner.uid}`)).toMatchObject({presentationCompletedAt:null,presentationRevision:2,name:"keep"});
  });
  it("persists completion then resets own learning and learning events without touching operational records",async()=>{
    const preserved={booking:{status:"confirmed"},message:{body:"keep"},other:{studyCompleted:24},media:{url:"keep"},contact:{kind:"contact"}};
    for(const [path,value] of Object.entries({[`demo_live_classes/${owner.uid}`]:preserved.booking,[`teacher_conversations/one`]:preserved.message,[`learning_states/other`]:preserved.other,[`media/global`]:preserved.media,[`users/${owner.uid}/student_activity/contact`]:preserved.contact}))fake.docs.set(path,value);
    fake.docs.set(`users/${owner.uid}/student_activity/old`,{kind:"learning"});
    const completed=await mutateTestProgress(owner,{action:"complete-all",revision:0});
    expect(completed.learning).toMatchObject({revision:1,testMode:true,studyCompleted:24});expect(decodeSnapshot(completed.learning.demoSnapshot!)?.nodeId).toBe("end");
    expect(fake.docs.get(`learning_states/${owner.uid}`)).toEqual(completed.learning);
    const reset=await mutateTestProgress(owner,{action:"reset-all",revision:1});
    expect(reset.learning).toMatchObject({revision:2,testMode:true,demoSnapshot:null,studySnapshot:null});
    expect(fake.docs.has(`users/${owner.uid}/student_activity/old`)).toBe(false);
    expect(fake.docs.get(`demo_live_classes/${owner.uid}`)).toEqual(preserved.booking);expect(fake.docs.get('teacher_conversations/one')).toEqual(preserved.message);expect(fake.docs.get('learning_states/other')).toEqual(preserved.other);expect(fake.docs.get('media/global')).toEqual(preserved.media);expect(fake.docs.get(`users/${owner.uid}/student_activity/contact`)).toEqual(preserved.contact);
    expect([...fake.docs.keys()].filter(p=>p.startsWith('learning_test_audit/'))).toHaveLength(2);
    expect(effects.prepare).not.toHaveBeenCalled();expect(effects.schedule).not.toHaveBeenCalled();
  });
  it("rejects stale normal saves and competing tweaks; normal mode requires a fresh reset",async()=>{
    const first=await mutateTestProgress(owner,{action:"complete-all",revision:0});
    await expect(saveLearning(owner,{revision:0,demoSnapshot:null})).rejects.toMatchObject({status:409});
    const races=await Promise.allSettled([mutateTestProgress(owner,{action:"reset-study",revision:1}),mutateTestProgress(owner,{action:"reset-all",revision:1})]);
    expect(races.filter(r=>r.status==="fulfilled")).toHaveLength(1);
    await expect(mutateTestProgress(owner,{action:"forward",revision:first.learning.revision})).rejects.toMatchObject({status:409});
    const normal=await mutateTestProgress(owner,{action:"reset-real",revision:2});
    expect(normal.learning).toMatchObject({testMode:false,revision:3,demoSnapshot:null,studySnapshot:null});
  });
  it("blocks test evaluations and stale evaluation tabs before creating messages",async()=>{
    await mutateTestProgress(owner,{action:"complete-all",revision:0});
    for(const learningRevision of [0,1]) await expect(createConversation(owner,{subject:"Avaliação da conversa da cafeteria",body:"test",learningRevision})).rejects.toMatchObject({status:409});
    expect([...fake.docs.keys()].some(p=>p.startsWith("teacher_conversations/"))).toBe(false);
    await mutateTestProgress(owner,{action:"reset-real",revision:1});
    await expect(createConversation(owner,{subject:"Avaliação da conversa da cafeteria",body:"stale",learningRevision:1})).rejects.toMatchObject({status:409});
  });
  it("continuing a test journey suppresses completion notifications and learning activity",async()=>{
    await mutateTestProgress(owner,{action:"start-demo",revision:0});
    const completed=applyTestAction(emptyGuestLearning(),{action:"complete-all"});
    await saveLearning(owner,{revision:1,demoSnapshot:completed.demoSnapshot,studySnapshot:completed.studySnapshot});
    expect(effects.prepare.mock.calls[0]?.[1]).toEqual([]);
    expect([...fake.docs.keys()].some(p=>p.includes('/student_activity/'))).toBe(false);
    expect(fake.docs.get(`learning_states/${owner.uid}`)?.testMode).toBe(true);
  });
});
describe("coherent controls for every support, part and branch",()=>{
  it("full resets return to a clean dashboard URL instead of retaining the old lesson fragment",()=>{
    expect(testActionDestination("reset-all")).toBe("/dashboard");
    expect(testActionDestination("reset-real")).toBe("/dashboard");
    expect(testActionDestination("forward")).toBeNull();
  });
  for(const profile of ["beginner","some","less"] as const) it(`covers all parts, nodes, back/forward and review for ${profile}`,()=>{
    for(let part=1;part<=10;part++) {
      const started=applyTestAction(emptyGuestLearning(),{action:"jump-part",part,profile});const state=decodeSnapshot(started.demoSnapshot!)!;expect(catalog[state.nodeId].part).toBe(part);expect(state.profile).toBe(profile);
      const completed=applyTestAction(started,{action:"complete-part",part,profile});expect(catalog[decodeSnapshot(completed.demoSnapshot!)!.nodeId].part).toBe(part===10?10:part+1);expect(()=>parseDemoSnapshot(completed.demoSnapshot)).not.toThrow();
      const next=applyTestAction(started,{action:"forward"});expect(decodeSnapshot(next.demoSnapshot!)!.nodeId).not.toBe(state.nodeId);
      const back=applyTestAction(next,{action:"back"});expect(()=>parseDemoSnapshot(back.demoSnapshot)).not.toThrow();
    }
    for(const n of nodes) {const reached=applyTestAction(emptyGuestLearning(),{action:"jump-node",node:n.id,profile});expect(decodeSnapshot(reached.demoSnapshot!)!.nodeId).toBe(n.id);}
    for(const view of ["end","moments","thanks","done"] as const) expect(decodeSnapshot(applyTestAction(emptyGuestLearning(),{action:"review",view}).demoSnapshot!)?.reviewView).toBe(view);
  });
  it("marks only the selected practice, removes it and preserves unrelated completions",()=>{
    let p=emptyGuestLearning();
    for(let step=0;step<24;step++)p=applyTestAction(p,validateTestAction({action:"study-complete",step,revision:0}));
    expect(decodeProgress(p.studySnapshot).supported).toHaveLength(24);
    p=applyTestAction(p,{action:"study-uncomplete",step:9});expect(decodeProgress(p.studySnapshot).completed).toHaveLength(23);expect(decodeProgress(p.studySnapshot).completed).not.toContain(studySteps[9].step.id);
    p=applyTestAction(p,{action:"study-position",step:3});expect(decodeProgress(p.studySnapshot).position).toBe(3);expect(decodeProgress(p.studySnapshot).completed).toHaveLength(23);
  });
});
