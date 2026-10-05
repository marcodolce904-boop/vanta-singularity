'use strict';
/*
 * Verifica di TUTTI i componenti della libreria in un browser vero (Chromium), con un'anteprima uguale a quella dell'app
 * (iframe isolato). A 375 e 1000 px clicca ogni pulsante e link visibile e segnala: errori di script, anteprima che
 * si svuota, elementi con JavaScript dove nessun clic cambia qualcosa.
 * Alcune segnalazioni sono attese (menu mobili a 1000 px, scroll, digitazione, clic destro, trascinamento).
 *
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *   node scripts/verifica-componenti.js
 */
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');
const {createApi}=require('../lib/api');
const SH=require('../lib/shared');
(async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'au-'));
  const api=createApi({configFile:path.join(dir,'c.json'),defaultDataDir:path.join(dir,'d'),ui:{}});
  const g=await api.getGlobalCss();
  const b=await chromium.launch();
  const jobs=[];
  for(const kind of ['strutture','componenti','animazioni','interazioni'])for(const it0 of await api.list(kind)){const it=await api.get(kind,it0.id);for(const w of [375,1000])jobs.push({kind,it,w});}
  const out=[];
  async function run({kind,it,w}){
    const doc=SH.applyPreviewOptions(SH.addPreviewShim(SH.buildPreviewDoc({html:it.html,css:it.css,js:it.js,rootCss:g.rootCss,classiCss:g.classiCss})),{});
    const pg=await b.newPage({viewport:{width:w,height:800}});
    const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    await pg.setContent('<body style="margin:0"><iframe id=f sandbox="allow-scripts allow-forms allow-modals" style="width:'+w+'px;height:780px;border:0"></iframe>');
    await pg.evaluate(d=>{document.getElementById('f').srcdoc=d},doc);
    await pg.waitForTimeout(120);
    const fr=()=>pg.frames().find(f=>f!==pg.mainFrame());
    const snap=()=>fr().evaluate(()=>document.body.innerHTML+'|'+[...document.body.querySelectorAll('*')].map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.display+c.visibility+c.transform+c.opacity+Math.round(r.height)+Math.round(r.left)}).join(',')+document.documentElement.className+document.body.className+document.body.style.cssText);
    let blank=false,changed=0,tried=0,total=0;
    const sel='button,[role=tab],summary,a[href],input,label,select,[aria-controls],[aria-expanded],[tabindex="0"]';
    total=(await fr().$$(sel)).length;
    for(let i=0;i<Math.min(total,16);i++){
      const els=await fr().$$(sel);const t=els[i];if(!t)break;
      try{
        if(!(await t.isVisible()))continue;
        const s0=await snap();
        await t.click({timeout:400,noWaitAfter:true});tried++;await pg.waitForTimeout(350);
        const body=await fr().evaluate(()=>document.body?document.body.innerHTML.length:0).catch(()=>0);
        if(body<30){blank=true;break}
        if(await snap()!==s0)changed++;
      }catch(e){}
    }
    const hasJs=(it.js||'').trim().length>0;
    if(errs.length||blank||(hasJs&&tried>0&&changed===0)||(hasJs&&tried===0&&total>0)) out.push({kind,nome:it.nome,w,errs:[...new Set(errs)].slice(0,2),blank,tried,changed,total});
    await pg.close();
  }
  let idx=0;await Promise.all(Array.from({length:6},async()=>{while(idx<jobs.length){const j=jobs[idx++];try{await run(j)}catch(e){out.push({nome:j.it.nome,w:j.w,fatal:e.message.slice(0,80)})}}}));
  out.sort((a,b)=>(a.nome+a.w).localeCompare(b.nome+b.w));
    console.log(out.map(o=>JSON.stringify(o)).join('\n'));console.log('DONE',out.length);
  await b.close();
})();
