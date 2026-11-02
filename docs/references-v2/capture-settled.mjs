import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome',headless:true});
const results=[];
await Promise.all([['bruno','https://bruno-simon.com'],['jesper','https://jesperlandberg.com'],['lusion','https://lusion.co']].map(async([name,url])=>{
 const c=await b.newContext({viewport:{width:1440,height:960}});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000}); await p.waitForTimeout(20000);
  const buttons=await p.locator('button').allTextContents();
  const text=(await p.locator('body').innerText()).slice(0,1800);
  await p.screenshot({path:`docs/references-v2/${name}-settled.png`});
  await p.mouse.move(900,400);await p.mouse.wheel(0,800);await p.waitForTimeout(1000);
  await p.screenshot({path:`docs/references-v2/${name}-settled-scroll.png`});
  results.push({name,buttons,text,errors});console.log(name,JSON.stringify({buttons,text:text.slice(0,450),errors}));
 }catch(e){console.log(name,e.message)}
 await c.close();
}));await b.close();await writeFile('docs/references-v2/settled.json',JSON.stringify(results,null,2));
