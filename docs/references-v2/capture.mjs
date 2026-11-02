import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const sites=[['bruno','https://bruno-simon.com'],['jesper','https://jesperlandberg.com'],['dennis','https://dennissnellenberg.com'],['lusion','https://lusion.co'],['aristide','https://aristidebenoist.com'],['rauno','https://rauno.me']];
const b=await chromium.launch({channel:'chrome',headless:true});
const records=[];
try{
 for(const [name,url] of sites){
  const c=await b.newContext({viewport:{width:1440,height:960}});const p=await c.newPage();
  try{
   const response=await p.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
   await p.waitForTimeout(3500);
   const body=await p.locator('body').innerText().catch(()=> '');
   await p.screenshot({path:`docs/references-v2/${name}-desktop.png`});
   await p.evaluate(()=>window.scrollBy(0,window.innerHeight*.85));await p.waitForTimeout(900);
   await p.screenshot({path:`docs/references-v2/${name}-scroll.png`});
   records.push({name,url,status:response?.status(),title:await p.title(),text:body.slice(0,5000),canvas:await p.locator('canvas').count(),scrollHeight:await p.evaluate(()=>document.documentElement.scrollHeight)});
   console.log(name,response?.status(),await p.title());
  }catch(e){records.push({name,url,error:e.message});console.log(name,e.message.slice(0,120));}
  await c.close();
 }
}finally{await b.close();await writeFile('docs/references-v2/captures.json',JSON.stringify(records,null,2));}
