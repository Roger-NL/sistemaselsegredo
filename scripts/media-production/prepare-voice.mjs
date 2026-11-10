// Authorized, resumable one-time publication through the SAME durable speech cache.
// node --env-file=.env.local --experimental-transform-types --conditions=react-server scripts/media-production/prepare-voice.mjs [--generate] [--limit=1]
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { getApps, deleteApp } from 'firebase-admin/app';
const sourceRoot = new URL('../../src/', import.meta.url).href;
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !extname(specifier) && context.parentURL?.startsWith(sourceRoot)) return next(`${specifier}.ts`, context);
  return next(specifier, context);
} });
const { audio } = await import('../../src/features/demo/content/media.ts');
const { speechIdentity, verifyStoredSpeechBytes } = await import('../../src/server/speech/cache.ts');
const { speechParameters, resolveCachedSpeech, readCachedSpeech, speechCacheWithGenerator } = await import('../../src/server/speech/runtime.ts');
const { getAdminDb } = await import('../../src/server/firebase.ts');
const panel = process.argv.includes('--via-panel');
const parameters = { ...speechParameters(), processing:undefined, voiceId: '7QN34D2r3hCNwbOYIeK0', ...(panel ? {model:'eleven_multilingual_v2',speed:1,stability:0.5} : {}) };
const directory = resolve('output/warren-voice-2026-11-04');
await mkdir(directory, { recursive:true });
const learnerParameters = { ...parameters, voiceId: 'AaOhDHYJ1XLZk74lXhdE' };
const entries = Object.values(audio).map(asset => {
  const selected = asset.role === 'you' ? learnerParameters : parameters;
  return { id:asset.id, role:asset.role, text:asset.text, parameters:selected, ...speechIdentity(asset.text, selected) };
});
const unique = [...new Map(entries.map(entry => [entry.key, entry])).values()];
const hashes = Object.fromEntries(unique.map(entry => [entry.key, createHash('sha256').update(entry.text).digest('hex')]));
const generate = process.argv.includes('--generate');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : unique.length;
if (!Number.isInteger(limit) || limit < 1 || limit > unique.length) throw new Error('INVALID_LIMIT');
let providerFailure;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (String(args[0]).startsWith('https://api.elevenlabs.io/v1/text-to-speech/') && !response.ok) {
    let reason; try { const data = await response.clone().json(); const code = data.detail?.status; if (typeof code === 'string' && /^[a-z_]+$/.test(code)) reason = code; } catch { /* No upstream content is logged. */ }
    providerFailure = { status:response.status, reason };
  }
  return response;
};
try {
  const db = getAdminDb();
  const refs = unique.map(entry => db.collection('speech_audio_cache_v3').doc(entry.key));
  const before = await db.getAll(...refs);
  const statuses = Object.fromEntries(before.map(doc => [doc.id, doc.exists ? {status:doc.data().status,attempts:doc.data().providerAttemptCount} : null]));
  const plan = { voices:{character:'Warren',you:'Caleb'}, parameters, learnerParameters, ids:entries.length, uniqueFiles:unique.length, uniqueCharacters:unique.reduce((sum,e)=>sum+e.text.length,0), generate, limit, statuses, textHashes:hashes };
  await writeFile(resolve(directory,'plan.json'),JSON.stringify(plan,null,2)+'\n');
  console.log(JSON.stringify({ids:plan.ids,uniqueFiles:plan.uniqueFiles,characters:plan.uniqueCharacters,existing:before.filter(doc=>doc.exists).length,generate,limit}));
  if (generate) {
    const importer = panel ? speechCacheWithGenerator(async (text, params) => {
      const identity=speechIdentity(text, params);
      const folder=resolve(directory,'panel-imports');await mkdir(folder,{recursive:true});
      const destination=resolve(folder,identity.key+'.mp3');
      const job={key:identity.key,text,parameters:params,destination,createdAt:new Date().toISOString()};
      await writeFile(resolve(directory,'pending.next.json'),JSON.stringify(job,null,2)+'\n');
      await rename(resolve(directory,'pending.next.json'),resolve(directory,'pending.json'));
      console.log(JSON.stringify({waitingForPanel:true,key:identity.key,text}));
      const deadline=Date.now()+600_000;
      while(Date.now()<deadline){
        try {
          const bytes=await readFile(destination);
          execFileSync('afconvert',['-f','WAVE','-d','LEI16',destination,destination+'.checked.wav'],{stdio:'pipe'});
          return bytes;
        } catch(error) { if(error.code!=='ENOENT') throw error; }
        await new Promise(resolve=>setTimeout(resolve,500));
      }
      throw new Error('PANEL_IMPORT_TIMEOUT_DO_NOT_GENERATE_AGAIN');
    }) : resolveCachedSpeech;
    let processed=0;
    for (const entry of unique.slice(0,limit)) {
      const result = await importer(entry.text, entry.parameters);
      if (result.status !== 'ready') throw new Error('CACHE_NOT_READY_DO_NOT_RETRY_PROVIDER');
      const cached = await readCachedSpeech(entry.text, entry.parameters);
      if (!cached || cached.status !== 'ready' || cached.key !== entry.key || cached.url !== result.url) throw new Error('CACHE_FINALIZATION_MISMATCH');
      const response = await fetch(result.url);
      if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/mpeg')) throw new Error('STORED_AUDIO_UNAVAILABLE');
      const bytes=Buffer.from(await response.arrayBuffer());
      const ledger=(await refs[unique.indexOf(entry)].get()).data();
      if (ledger.status !== 'ready' || ledger.providerAttemptCount !== 1 || !ledger.audio) throw new Error('INVALID_STORED_AUDIO');
      const checksum=verifyStoredSpeechBytes(ledger.audio,bytes);
      await writeFile(resolve(directory,entry.key+'.verified.json'),JSON.stringify({key:entry.key,checksum,bytes:bytes.length,checksumRecovered:!ledger.audio.checksum})+'\n');
      const path=resolve(directory,entry.key+'.mp3');await writeFile(path,bytes);
      execFileSync('afconvert',['-f','WAVE','-d','LEI16',path,resolve(directory,entry.key+'.wav')],{stdio:'pipe'});
      console.log(JSON.stringify({processed:++processed,id:entry.id,status:'ready',providerAttempts:ledger.providerAttemptCount,bytes:bytes.length,decoded:true}));
    }
    if (limit === unique.length) {
      const candidate={};
      for (const entry of entries) {
        const result=await readCachedSpeech(entry.text,entry.parameters);
        if (!result || result.status !== 'ready') throw new Error('INCOMPLETE_VOICE_CATALOG');
        candidate[entry.id]={key:result.key,audioUrl:result.url};
      }
      await writeFile(resolve(directory,'catalog-candidate.json'),JSON.stringify({schemaVersion:1,entries:candidate},null,2)+'\n');
      await writeFile(resolve(directory,'complete.json'),JSON.stringify({complete:true,ids:entries.length,uniqueFiles:unique.length,parameters,learnerParameters},null,2)+'\n');
      console.log(JSON.stringify({complete:true,ids:entries.length,uniqueFiles:unique.length,candidateOnly:true}));
    }
  }
} catch (error) {
  const code = error?.code || error?.message;
  const safeCode = typeof code === 'string' && /^[A-Z_]+$/.test(code) ? code : 'VOICE_PREPARATION_FAILED';
  await writeFile(resolve(directory,'failure.json'),JSON.stringify({code:safeCode,providerFailure},null,2)+'\n');
  console.error(JSON.stringify({error:safeCode,providerFailure,noAutomaticRetry:true}));process.exitCode=1;
} finally {globalThis.fetch=originalFetch;await Promise.all(getApps().map(app=>deleteApp(app)));}
