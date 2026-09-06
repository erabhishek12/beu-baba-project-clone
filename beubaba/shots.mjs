import { chromium } from 'playwright';
const B='http://localhost:5173';
const b=await chromium.launch();
// Real device pixel ratio so the captures stay crisp inside a phone frame.
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});
const p=await ctx.newPage();
await p.route('**/rest/v1/rpc/next_eligible_banner', r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
await p.goto(B,{waitUntil:'domcontentloaded',timeout:120000});
await p.evaluate(()=>localStorage.setItem('beubaba:onboarded','1'));
await p.goto(B+'/login',{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForTimeout(2500);
await p.locator('input[type="email"]').first().fill('abhishekyadav954698@gmail.com');
await p.locator('input[type="password"]').first().fill('Abhi@2345');
await p.locator('button[type="submit"]').first().click();
await p.waitForTimeout(9000);
// suppress the weekly share nudge so it never lands in a marketing shot
await p.evaluate(()=>localStorage.setItem('beubaba:share-prompt',JSON.stringify({nextAt:Date.now()+6048e5,showOn:Date.now()+6048e5})));

const shots=[
  ['home','/'],
  ['quiz','/quiz'],
  ['study','/study'],
  ['planner','/study/planner'],
  ['tools','/tools'],
  ['mathmind','/tools/math-mind'],
  ['revision','/revision'],
  ['profile','/profile'],
];
for(const [name,path] of shots){
  await p.goto(B+path,{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForTimeout(4200);
  await p.screenshot({path:`public/promo/shots/${name}.png`});
  console.log('captured', name);
}
// one in-quiz shot (needs interaction)
await p.goto(B+'/quiz/bank-100102',{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForTimeout(4500);
const start=p.getByRole('button',{name:/start|begin/i}).first();
if(await start.count()){ await start.click().catch(()=>{}); await p.waitForTimeout(7000);
  await p.screenshot({path:'public/promo/shots/quiz-live.png'}); console.log('captured quiz-live'); }
await b.close();
