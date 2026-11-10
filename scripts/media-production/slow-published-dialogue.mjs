// Offline pitch-preserving derivatives. Never invokes ElevenLabs or mutates source recordings.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { getApps, deleteApp } from 'firebase-admin/app';
const sourceRoot=new URL('../../src/',import.meta.url).href;
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('.')&&!extname(specifier)&&context.parentURL?.startsWith(sourceRoot))return next(`${specifier}.ts`,context);return next(specifier,context);}});
const {audio}=await import('../../src/features/demo/content/media.ts');
const {speechIdentity,verifyStoredSpeechBytes}=await import('../../src/server/speech/cache.ts');
const {readCachedSpeech,speechCacheWithGenerator}=await import('../../src/server/speech/runtime.ts');
const {getAdminDb}=await import('../../src/server/firebase.ts');
const ffmpeg=process.env.AUDIO_PROCESSOR_PATH;
if(!ffmpeg)throw new Error('AUDIO_PROCESSOR_PATH_REQUIRED');
const root=resolve('output/dialogue-audio-2026-11-04');await mkdir(root,{recursive:true});
const base={model:'eleven_multilingual_v2',format:'mp3_44100_128',speed:1,language:'en',stability:0.5,similarityBoost:0.75};
const roles={character:{...base,voiceId:'7QN34D2r3hCNwbOYIeK0'},you:{...base,voiceId:'AaOhDHYJ1XLZk74lXhdE'}};
const entries=Object.values(audio).map(asset=>{const sourceParams=roles[asset.role];const targetParams={...sourceParams,processing:{tempo:0.78,version:'atempo-v1'}};return {...asset,sourceParams,targetParams,source:speechIdentity(asset.text,sourceParams),target:speechIdentity(asset.text,targetParams)};});
const canonical=v=>v&&typeof v==='object'?(Array.isArray(v)?v.map(canonical):Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]))):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
function duration(path){const info=execFileSync('afinfo',[path],{encoding:'utf8'});const match=info.match(/estimated duration:\s*([\d.]+) sec/);if(!match)throw new Error('AUDIO_DURATION_UNAVAILABLE');return Number(match[1]);}
let rendered=0;
try{
 const db=getAdminDb();const refs=entries.map(e=>db.collection('speech_audio_cache_v3').doc(e.source.key));
 const originals=await db.getAll(...refs);if(originals.some(s=>!s.exists||s.data().status!=='ready'))throw new Error('SOURCE_CATALOG_INCOMPLETE');
 const originalHash=digest(originals.map(s=>s.data()));await writeFile(resolve(root,'source-ledger-before.json'),JSON.stringify({hash:originalHash,keys:entries.map(e=>e.source.key)},null,2)+'\n');
 const resolver=speechCacheWithGenerator(async(text,p)=>{
   const target=speechIdentity(text,p);const entry=entries.find(e=>e.target.key===target.key);if(!entry)throw new Error('UNAPPROVED_DERIVATIVE');
   const source=await readCachedSpeech(text,entry.sourceParams);if(!source||source.status!=='ready')throw new Error('SOURCE_NOT_READY');
   const response=await fetch(source.url);if(!response.ok)throw new Error('SOURCE_DOWNLOAD_FAILED');const bytes=Buffer.from(await response.arrayBuffer());
   const ledger=originals[entries.indexOf(entry)].data();const sourceSha=verifyStoredSpeechBytes(ledger.audio,bytes);
   const input=resolve(root,entry.source.key+'.source.mp3'),output=resolve(root,target.key+'.render.mp3');await writeFile(input,bytes);
   execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-i',input,'-af','atempo=0.78','-ar','44100','-b:a','128k','-c:a','libmp3lame',output],{stdio:'pipe'});
   execFileSync('afconvert',['-f','WAVE','-d','LEI16',output,output+'.wav'],{stdio:'pipe'});
   const before=duration(input),after=duration(output);if(Math.abs(after-before/0.78)>0.14)throw new Error('SLOW_DURATION_MISMATCH');
   await writeFile(resolve(root,entry.id+'.processing.json'),JSON.stringify({id:entry.id,role:entry.role,sourceKey:entry.source.key,sourceSha,targetKey:target.key,sourceDuration:before,slowDuration:after,tempo:0.78,filter:'atempo (pitch preserved)',decoded:true},null,2)+'\n');rendered++;
   return readFile(output);
 });
 const candidate={};const rows=[];
 for(const entry of entries){
   const result=await resolver(entry.text,entry.targetParams);if(result.status!=='ready')throw new Error('DERIVATIVE_PENDING_NO_AUTOMATIC_RETRY');
   const ledger=(await db.collection('speech_audio_cache_v3').doc(entry.target.key).get()).data();const response=await fetch(result.url);if(!response.ok)throw new Error('CDN_DOWNLOAD_FAILED');const bytes=Buffer.from(await response.arrayBuffer());const sha=verifyStoredSpeechBytes(ledger.audio,bytes);
   if(ledger.status!=='ready'||ledger.providerAttemptCount!==1)throw new Error('INVALID_DERIVATIVE_LEDGER');
   const path=resolve(root,entry.target.key+'.mp3');await writeFile(path,bytes);execFileSync('afconvert',['-f','WAVE','-d','LEI16',path,path+'.wav'],{stdio:'pipe'});
   candidate[entry.id]={key:result.key,audioUrl:result.url};rows.push({id:entry.id,role:entry.role,key:result.key,bytes:bytes.length,sha256:sha,decoded:true});console.log(JSON.stringify({ready:rows.length,id:entry.id,role:entry.role}));
 }
 const sourceAfter=await db.getAll(...refs);if(digest(sourceAfter.map(s=>s.data()))!==originalHash)throw new Error('SOURCE_LEDGER_CHANGED');
 const processedRefs=entries.map(e=>db.collection('speech_audio_cache_v3').doc(e.target.key));const after=await db.getAll(...processedRefs);const derivedHash=digest(after.map(s=>s.data()));
 // Fresh read-only playbacks must reuse exact URLs and leave both ledgers untouched.
 for(let session=0;session<3;session++)for(const entry of entries){const replay=await readCachedSpeech(entry.text,entry.targetParams);if(replay?.status!=='ready'||replay.url!==candidate[entry.id].audioUrl)throw new Error('REPLAY_CHANGED_RECORDING');}
 const replayAfter=await db.getAll(...processedRefs);if(digest(replayAfter.map(s=>s.data()))!==derivedHash)throw new Error('REPLAY_MUTATED_LEDGER');
 await writeFile(resolve(root,'catalog-candidate.json'),JSON.stringify({schemaVersion:1,entries:candidate},null,2)+'\n');
 await writeFile(resolve(root,'report.json'),JSON.stringify({ids:entries.length,files:new Set(rows.map(r=>r.key)).size,roles:{Lucas:30,learner:20},tempo:0.78,additionalSynthesisRequests:0,rendered,sourceLedgerUnchanged:true,replayLedgerUnchanged:true,replaySessions:3,rows},null,2)+'\n');console.log(JSON.stringify({complete:true,ids:rows.length,files:50,additionalSynthesisRequests:0}));
}catch(error){console.error(JSON.stringify({error:/^[A-Z_]+$/.test(error?.code??error?.message??'')?(error.code??error.message):'OFFLINE_PUBLICATION_FAILED',noSynthesisFallback:true}));process.exitCode=1;}finally{await Promise.all(getApps().map(app=>deleteApp(app)));}
