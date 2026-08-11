import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const routes = ['','ecosystem','community','open-source','roadmap','security','about','wallet','connect','explorer','sdk','cli','devkit','api','docs','trade','download','support','brand','privacy','terms','trademark','404'];
const viewports = [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const browser = await chromium.launch({headless:true});
const report = { routes: {}, violations: [] };
const journeyFailures = [];
const redirectFailures = [];
const expectedArchitectureLinks = ['/wallet','/explorer','/trade','/connect','/sdk','/cli','/devkit','/docs','/api'];
const redirects=await fs.readFile('out/_redirects','utf8').catch(()=>"");
if(!/^\/developers\/?\s+https:\/\/docs\.glyphq\.org\s+301!?$/m.test(redirects)) redirectFailures.push({check:'/developers has a permanent external redirect to Docs'});
if(await fs.stat('out/developers/index.html').then(()=>true).catch(()=>false)) redirectFailures.push({check:'/developers is not emitted as a duplicate Landing page'});
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: {width:viewport.width,height:viewport.height}, colorScheme:'light', reducedMotion:'reduce' });
  for (let i=0;i<routes.length;i++) {
    const route=routes[i], name=route||'home';
    console.log(`JCODE_PROGRESS ${JSON.stringify({current:i+1,total:routes.length,unit:'routes',message:`${viewport.name}: /${route}`})}`);
    const page=await context.newPage();
    const errors=[]; page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(`http://127.0.0.1:4173/${route}`,{waitUntil:'networkidle'});
    const data=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content'),canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,h1:document.querySelectorAll('h1').length,deadLinks:Array.from(document.querySelectorAll('a[href^="/developers"]')).map((link)=>link.getAttribute('href'))}));
    if(data.deadLinks.length) redirectFailures.push({route:`/${route}`,check:'no internal links target removed /developers',links:data.deadLinks});
    const journey=await page.evaluate((currentRoute)=>{
      const normalize=(value)=>value?.startsWith('/') ? value.replace(/\/$/,'') : value;
      const href=(selector)=>normalize(document.querySelector(selector)?.getAttribute('href')) ?? null;
      const links=(selector)=>Array.from(document.querySelectorAll(selector)).map((link)=>normalize(link.getAttribute('href')));
      const buttonStyles=()=>{
        const button=document.querySelector('.page-hero .button, .hero .button');
        if(!button) return null;
        const before=getComputedStyle(button);
        button.focus();
        const focused=getComputedStyle(button);
        return { boxShadow:before.boxShadow, transitionProperty:before.transitionProperty, focusOutline:focused.outlineStyle };
      };
      if(currentRoute==='wallet') return {
        download:href('main.product-page a.button[href^="/download"]'),
        release:href('main.product-page a[href*="github.com/glyphq/wallet/releases/tag/v0.14.3"]'),
        repository:href('main.product-page a[href="https://github.com/glyphq/wallet"]'),
        buttonStyles:buttonStyles(),
      };
      if(currentRoute==='') return {
        heroButtons:links('.hero .actions a.button'),
        ecosystem:href('.hero .actions a[href^="/ecosystem"]'),
        download:href('.hero .actions a[href^="/download"]'),
      };
      if(currentRoute==='ecosystem') return { architecture:links('.architecture-product-link'), boundary:href('.architecture-boundary a') };
      if(currentRoute==='connect' || currentRoute==='docs') return { documentation:href('main.product-page a[href="https://github.com/glyphq/connect#readme"]') };
      return null;
    },route);
    if(viewport.name==='desktop' && route==='wallet') {
      await page.emulateMedia({ reducedMotion:'no-preference' });
      const motionButtonStyles=await page.evaluate(()=>{
        const button=document.querySelector('.page-hero .button, .hero .button');
        if(!button) return null;
        const before=getComputedStyle(button);
        button.focus();
        const focused=getComputedStyle(button);
        return { boxShadow:before.boxShadow, transitionProperty:before.transitionProperty, focusOutline:focused.outlineStyle };
      });
      await page.emulateMedia({ reducedMotion:'reduce' });
      if(journey) journey.buttonStyles={motion:motionButtonStyles,reduced:journey.buttonStyles};
    }
    await page.screenshot({path:`artifacts/screenshots/${viewport.name}/${name}.png`,fullPage:true});
    if(viewport.name==='desktop') {
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      const serious=axe.violations.filter(v=>['serious','critical'].includes(v.impact));
      report.violations.push(...serious.map(v=>({route:`/${route}`,id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help})));
    }
    report.routes[`${viewport.name}:/${route}`]={status:response?.status(),...data,journey,errors};
    if(viewport.name==='desktop') {
      if(route==='wallet') {
        if(journey?.download!=='/download') journeyFailures.push({route:'/wallet',check:'primary download CTA targets /download'});
        if(!journey?.release) journeyFailures.push({route:'/wallet',check:'release link remains available'});
        if(!journey?.repository) journeyFailures.push({route:'/wallet',check:'repository link remains available'});
        const buttonStyles=journey?.buttonStyles;
        if(!buttonStyles?.motion || buttonStyles.motion.boxShadow==='none' || !buttonStyles.motion.transitionProperty.includes('transform') || buttonStyles.motion.focusOutline==='none' || !buttonStyles.reduced || buttonStyles.reduced.boxShadow==='none' || buttonStyles.reduced.transitionProperty!=='none' || buttonStyles.reduced.focusOutline==='none') journeyFailures.push({route:'/wallet',check:'shared button treatment provides elevation, press motion, and focus visibility'});
      }
      if(route==='') {
        if(journey?.heroButtons?.length!==2) journeyFailures.push({route:'/',check:'home hero has exactly two CTA buttons'});
        if(journey?.ecosystem) journeyFailures.push({route:'/',check:'home hero removes the ecosystem CTA'});
        if(journey?.download!=='/download') journeyFailures.push({route:'/',check:'home hero Download CTA targets /download'});
      }
      if(route==='ecosystem') {
        const architecture=[...(journey?.architecture ?? [])].sort();
        if(architecture.length!==expectedArchitectureLinks.length || architecture.some((link,index)=>link!==[...expectedArchitectureLinks].sort()[index])) journeyFailures.push({route:'/ecosystem',check:'architecture product entries link to internal product pages'});
        if(journey?.boundary) journeyFailures.push({route:'/ecosystem',check:'Qubic integration boundary remains non-product content'});
      }
      if((route==='connect' || route==='docs') && journey?.documentation!=='https://github.com/glyphq/connect#readme') journeyFailures.push({route:`/${route}`,check:'model-provided documentation link renders'});
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
await fs.writeFile('artifacts/qa-report.json',JSON.stringify(report,null,2));
const failures=Object.entries(report.routes).filter(([,x])=>x.status!==200||!x.title||!x.description||!x.canonical||x.overflow||x.h1!==1||x.errors.length);
console.log(JSON.stringify({failures,journeyFailures,redirectFailures,seriousViolations:report.violations},null,2));
if(failures.length||journeyFailures.length||redirectFailures.length||report.violations.length) process.exit(1);
