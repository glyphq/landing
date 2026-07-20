import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const routes = ['','ecosystem','developers','community','open-source','roadmap','security','about','wallet','connect','explorer','sdk','cli','devkit','api','docs','trade','download','brand','privacy','terms','trademark','404'];
const viewports = [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const browser = await chromium.launch({headless:true});
const report = { routes: {}, violations: [] };
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: {width:viewport.width,height:viewport.height}, colorScheme:'light', reducedMotion:'reduce' });
  for (let i=0;i<routes.length;i++) {
    const route=routes[i], name=route||'home';
    console.log(`JCODE_PROGRESS ${JSON.stringify({current:i+1,total:routes.length,unit:'routes',message:`${viewport.name}: /${route}`})}`);
    const page=await context.newPage();
    const errors=[]; page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(`http://127.0.0.1:4173/${route}`,{waitUntil:'networkidle'});
    const data=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content'),canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,h1:document.querySelectorAll('h1').length}));
    await page.screenshot({path:`artifacts/screenshots/${viewport.name}/${name}.png`,fullPage:true});
    if(viewport.name==='desktop') {
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      const serious=axe.violations.filter(v=>['serious','critical'].includes(v.impact));
      report.violations.push(...serious.map(v=>({route:`/${route}`,id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help})));
    }
    report.routes[`${viewport.name}:/${route}`]={status:response?.status(),...data,errors};
    await page.close();
  }
  await context.close();
}
await browser.close();
await fs.writeFile('artifacts/qa-report.json',JSON.stringify(report,null,2));
const failures=Object.entries(report.routes).filter(([,x])=>x.status!==200||!x.title||!x.description||!x.canonical||x.overflow||x.h1!==1||x.errors.length);
console.log(JSON.stringify({failures,seriousViolations:report.violations},null,2));
if(failures.length||report.violations.length) process.exit(1);
