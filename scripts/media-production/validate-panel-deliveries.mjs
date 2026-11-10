// Local full-decode gate before a browser download enters the durable cache.
import { readdir, readFile, rename, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=resolve('output/warren-voice-2026-11-04');const folder=resolve(root,'panel-imports');
for(;;){
  for(const file of await readdir(folder)){
    if(!/^[a-f0-9]{64}\.mp3\.incoming$/.test(file))continue;
    const source=resolve(folder,file),destination=source.slice(0,-'.incoming'.length);
    const bytes=await readFile(source);
    if(bytes.length<1000)throw new Error('INCOMPLETE_PANEL_DOWNLOAD');
    execFileSync('afconvert',['-f','WAVE','-d','LEI16',source,source+'.wav'],{stdio:'pipe'});
    try{await access(destination);throw new Error('REFUSE_PANEL_OVERWRITE');}catch(error){if(error.code!=='ENOENT')throw error;}
    await writeFile(destination+'.verified.json',JSON.stringify({bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),decodedBeforeAdmission:true,at:new Date().toISOString()})+'\n',{flag:'wx'});
    await rename(source,destination);
    console.log(JSON.stringify({verified:file.slice(0,64),bytes:bytes.length,decodedBeforeAdmission:true}));
  }
  try{await access(resolve(root,'complete.json'));break;}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
}
