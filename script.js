/* ============================================================
   script.js — game state, rendering, ambient visuals,
   fireworks/rain effects, and audio-UI wiring.
   Depends on audio.js being loaded first (window.fairAudio).
   ============================================================ */

/* ================= DATA ================= */
const scenes = [
  { lines:["คุณเดินเข้ามาภายในงาน พนักงานคนหนึ่งยิ้มให้คุณ ก่อนจะยื่นริบบิ้นมาทั้งหมด 4 สี","คุณจะเลือกสีไหน"],
    choices:[["สีเหลือง",1],["สีฟ้า",3],["สีแดง",0],["สีขาว",2]], feedback:"เลือกได้ดี" },
  { lines:["กลิ่นอาหารที่โชยขึ้นมา ทำให้คุณเริ่มรู้สึกหิว","คุณจะเลือกซื้ออะไร"],
    choices:[["ของคาว",0],["ของหวาน",2],["เครื่องดื่ม",3],["ตัดสินใจยังไม่ซื้อ",1]], feedback:"น่าสนใจ" },
  { lines:["คุณเดินผ่านซุ้มปาลูกดอก พนักงานคนหนึ่งเรียกคุณไว้ เขายื่นลูกดอกให้คุณ 1 อัน","คุณจะเล็งไปที่ไหน"],
    choices:[["ของรางวัลอันใหญ่",1],["ตรงกลางเป้า",2],["เชื่อมั่นในสัญชาติญาณตนเอง",3],["หลับตาปา",0]], feedback:"เก่งมาก" },
  { lines:["ที่มุมหนึ่งของงาน คุณได้ยินเสียงเด็กคนหนึ่งกำลังร้องไห้ ดูเหมือนเด็กคนนั้นจะหลงทาง","คุณจะทำอย่างไร"],
    choices:[["ช่วยเด็กน้อยตามหาผู้ปกครอง",3],["ถามจากคนแถวนั้น",1],["พาไปจุดประชาสัมพันธ์",2],["เดินต่อไป",0]], feedback:"เด็กน้อยผู้น่าสงสาร" },
  { lines:["คุณเดินเข้าไปในเต๊นท์ ที่นั่นมีโชว์มายากล พิธีกรเชิญชวนให้ผู้ชมมาขึ้นเวที","คุณ…"],
    choices:[["ยกมือขึ้นอาสาออกไปเอง",3],["รอดูเพื่อนก่อน",2],["อยู่รอเชียร์ด้านล่าง",1],["พยายามหลบสายตา",0]], feedback:"โชว์สนุกใช่ไหมล่ะ" },
  { lines:["เมื่อเดินต่อไปได้สักพัก ฝนก็เทลงมา","คุณจะ…"],
    choices:[["วิ่ง",2],["เดินต่อชิลๆ",1],["หาที่หลบฝนใกล้ๆ",0],["กางร่มให้กับผู้อื่น",3]], feedback:"ระวังจะไม่สบาย", rain:true },
  { lines:["เหมือนฝนจะตกหนักขึ้น คุณเลยมาหลบที่ศาลาเซียมซี","แม่หมอยื่นเซียมซีมาให้คุณ"],
    choices:[["รับมาเสี่ยงทันที",3],["ลังเลครู่หนึ่ง",1],["สอบถามข้อมูลจากแม่หมอก่อน",2],["ขอผ่านดีกว่า",0]], feedback:"ก็ดีนะ", rain:true },
  { lines:["ฝนซาลงแล้วล่ะ คุณเดินมาถึงชิงช้าสวรรค์ มันเหลือเพียงกระเช้าเดียว","คุณจะขึ้นไหม"],
    choices:[["ขึ้นไปนั่งคนเดียว",2],["ชวนคนแปลกหน้าขึ้นไปกับคุณ",3],["ยกให้คนอื่น",1],["เดินผ่านไป",0]], feedback:"ลมเย็นดีนะ" },
  { lines:["ที่นี่จะมีซุ้มสอยดาวด้วยล่ะ คุณลองเดินไปดึงลงมาอันหนึ่งแบบไม่คิดอะไร","ดูเหมือนคุณจะดวงดีนะ"],
    choices:[["เก็บรางวัลนั้นไว้",1],["แบ่งมันให้เพื่อน",2],["แลกกับคนอื่น",0],["ยกให้เด็กน้อย",3]], feedback:"ใกล้จะจบแล้วล่ะ…" },
  { lines:["คุณเดินมาเจอทางแยก","คุณจะไปทางไหน"],
    choices:[["ทางที่เงียบสงบ",0],["ทางที่มีผู้คนพลุกพล่าน",3],["กลับไปทางเดิม",1],["จ้ำจี้มะเขือเปาะแปะ",2]], feedback:"น่าสนใจ" },
  { lines:["(เสียงพลุดังขึ้น)","โอ๊ะ เรามาถึงทีเด็ดของงานแล้วล่ะ"],
    choices:[["ถ่ายรูปเก็บไว้",1],["ซึมซับบรรยากาศผ่านสายตา",2],["ชวนคนอื่นๆมาดู",3],["เดินต่อไป",0]], feedback:"มันสวยใช่ไหม", firework:true },
  { lines:["เรามาถึงตอนจบของงานกันแล้วล่ะ ก่อนจะออกไป คุณเหลือบไปเห็นระฆังแขวนอยู่","คุณจะทำอะไรกับมัน"],
    choices:[["ตีมันสุดแรง",3],["ตีมันเบาๆหนึ่งครั้ง",2],["แตะมันเฉยๆ",1],["เดินผ่านมันไป",0]], feedback:"วันนี้สนุกรึเปล่า", sound:"bell" },
];

const endings = [
  { min:0, max:5, title:"ผู้ชมผู้แสนอบอุ่น",
    desc:"สำหรับคุณ งานวัดคือสถานที่แห่งความสุขและความทรงจำดีๆ คุณไม่จำเป็นต้องเป็นจุดเด่นของงาน ขอแค่ได้ใช้เวลาเหล่านี้ร่วมกับคนที่สำคัญก็เพียงพอแล้ว" },
  { min:6, max:11, title:"นักชิมแห่งงานวัด",
    desc:"คุณเป็นคนที่ให้คุณค่ากับช่วงเวลาเล็กๆรอบตัว สนุกกับการค้นหาสิ่งใหม่ๆ และมักสร้างบรรยากาศที่ดีให้กับคนรอบข้าง ผู้คนต่างสบายใจเมื่อคุณอยู่ข้างๆ" },
  { min:12, max:17, title:"เซียนซุ้มเกม",
    desc:"คุณชอบความท้าทายและการลองทำอะไรใหม่ๆ แม้ผลลัพธ์จะไม่แน่นอน แต่คุณก็พร้อมที่จะโยนเหรียญเพื่อเสี่ยงทายอยู่เสมอ" },
  { min:18, max:23, title:"ดาวเด่นประจำงาน",
    desc:"คุณกล้าที่จะก้าวออกไปเผชิญหน้ากับสิ่งใหม่ๆ มีพลังในการดึงดูดผู้คนให้เข้ามาหา และทำให้บรรยากาศรอบตัวคึกคักขึ้นมาได้เสมอ" },
  { min:24, max:29, title:"ผู้จุดประกายในยามค่ำคืน",
    desc:"คุณไม่ได้เป็นเพียงคนที่สนุกไปกับเทศกาล แต่คุณยังเป็นคนที่สร้างแรงบันดาลใจให้กับคนอื่นๆ คุณกล้าเริ่มต้น และพร้อมที่จะพาทุกคนก้าวไปข้างหน้าพร้อมกัน" },
  { min:30, max:35, title:"ภูติแห่งเทศกาล",
    desc:"ไม่ว่าคุณจะเดินไปทางไหน ความสนุกและเสียงหัวเราะต่างก็ตามคุณไปด้วยทุกที่ คุณพร้อมที่จะเปิดรับประสบการณ์ใหม่ๆ และทำให้ค่ำคืนนี้เป็นความทรงจำที่ดีของทุกคน" },
];
const specialEnding = {
  title:"เจ้าของตั๋วปริศนา",
  desc:"เมื่อคุณผ่านประตูทางออก ตั๋วในมือของคุณเปล่งแสงขึ้นอีกครั้ง “ในที่สุดก็มีคนเดินมาถึงจุดนี้” เสียงอันคุ้นเคยดังขึ้นในหัวของคุณ ตลอดการเดินทาง คุณไม่เคยลังเลที่จะเลือกเส้นทางของตนเอง งานวัดแห่งนี้ถูกสร้างขึ้นเพื่อรอคอยใครบางคน และในค่ำคืนนี้ คนคนนั้นก็คือ…คุณ ยินดีด้วย คุณได้ปลดล็อก Secret Ending"
};

/* ================= AUDIO MANIFEST =================
   Drop matching files under assets/audio/... — if a file is
   missing the game keeps working silently (see audio.js). */
fairAudio.init({
  bgm: {
    theme: "assets/audio/bgm/theme.mp3",
  },
  ambient: {
    festival: "assets/audio/ambient/festival.mp3",
    rain: "assets/audio/ambient/rain.mp3",
  },
  sfx: {
    click: "assets/audio/sfx/click.mp3",
    select: "assets/audio/sfx/select.mp3",
    firework: "assets/audio/sfx/firework.mp3",
    bell: "assets/audio/sfx/bell.mp3",
    ending: "assets/audio/sfx/ending.mp3",
    thunder: "assets/audio/sfx/thunder.mp3",
  },
});

/* ================= STATE ================= */
let current = 0;
let score = 0;

/* ================= AMBIENT SKY SETUP ================= */
function buildStars(){
  const wrap = document.getElementById('stars');
  for(let i=0;i<80;i++){
    const s = document.createElement('div');
    s.className='star';
    s.style.left = Math.random()*100+'vw';
    s.style.top = Math.random()*60+'vh';
    s.style.animationDelay = (Math.random()*3.5)+'s';
    wrap.appendChild(s);
  }
}
/* Hanging string lights: a few drooping wires across the top,
   each strung with bulbs, instead of a flat straight row. */
function buildBunting(){
  const wrap = document.getElementById('bunting');
  const colors=['#ff4fa3','#f4b942','#3fe8c4','#fbf3df'];
  const W = 1200, H = 100;
  const anchorCount = 5;              // number of posts the wire hangs from
  const anchorY = 4;
  const droopY = 58;                  // how far each strand sags
  const bulbsPerSegment = 6;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio','none');

  const anchors = [];
  for(let i=0;i<anchorCount;i++){
    anchors.push({ x: (W/(anchorCount-1))*i, y: anchorY });
  }

  const quadPoint=(p0,p1,p2,t)=>({
    x:(1-t)**2*p0.x + 2*(1-t)*t*p1.x + t**2*p2.x,
    y:(1-t)**2*p0.y + 2*(1-t)*t*p1.y + t**2*p2.y
  });

  let colorIdx = 0;
  for(let i=0;i<anchors.length-1;i++){
    const p0 = anchors[i], p2 = anchors[i+1];
    const p1 = { x:(p0.x+p2.x)/2, y: droopY + (Math.random()*10-5) };

    const path = document.createElementNS(svgNS,'path');
    path.setAttribute('class','wire');
    path.setAttribute('d', `M ${p0.x},${p0.y} Q ${p1.x},${p1.y} ${p2.x},${p2.y}`);
    svg.appendChild(path);

    for(let b=1; b<bulbsPerSegment; b++){
      const t = b/bulbsPerSegment;
      const pt = quadPoint(p0,p1,p2,t);
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('class','bulb-dot');
      c.setAttribute('cx', pt.x);
      c.setAttribute('cy', pt.y + 5);
      c.setAttribute('r', 5.5);
      const color = colors[colorIdx % colors.length];
      c.setAttribute('fill', color);
      c.style.filter = `drop-shadow(0 0 6px ${color})`;
      // sequential delay = a slow twinkle wave travels along the strand, not random
      c.style.animationDelay = (colorIdx * 0.14) + 's';
      colorIdx++;
      svg.appendChild(c);
    }
  }
  wrap.appendChild(svg);
}

/* A few sparse hanging stars, spaced far apart — decorative, not a grid */
function buildHangStars(){
  const layer = document.getElementById('hang-star-layer');
  const spots = [12, 38, 68, 88]; // vw positions, spaced apart
  spots.forEach((leftVw, i)=>{
    const wrap = document.createElement('div');
    wrap.className = 'hang-star';
    wrap.style.left = leftVw + 'vw';
    const dropLen = 26 + (i%2===0 ? 10 : 0);

    const string = document.createElement('div');
    string.className = 'string';
    string.style.height = dropLen + 'px';

    const star = document.createElement('div');
    star.className = 'star-shape';
    star.style.animationDelay = (i*0.7)+'s';

    wrap.appendChild(string);
    wrap.appendChild(star);
    layer.appendChild(wrap);
  });
}
function spawnLantern(){
  const layer=document.getElementById('lantern-layer');
  const l=document.createElement('div');
  l.className='lantern';
  l.style.left=(Math.random()*90+2)+'vw';
  l.style.bottom='-5vh';
  l.style.animationDuration=(8+Math.random()*6)+'s';
  layer.appendChild(l);
  setTimeout(()=>l.remove(), 15000);
}
setInterval(spawnLantern, 2600);

/* gondola ring (progress lights around the ferris wheel) */
const GOND_COUNT = 12;
function buildGondolas(){
  const svg = document.getElementById('gondola-ring');
  const cx=100, cy=100, r=82;
  for(let i=0;i<GOND_COUNT;i++){
    const angle = (i/GOND_COUNT)*Math.PI*2 - Math.PI/2;
    const x = cx + r*Math.cos(angle);
    const y = cy + r*Math.sin(angle);
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',7);
    c.setAttribute('fill', '#2e1354');
    c.setAttribute('stroke', 'rgba(244,185,66,.4)');
    c.setAttribute('id','gondola-'+i);
    svg.appendChild(c);
  }
}
function updateGondolas(litCount){
  for(let i=0;i<GOND_COUNT;i++){
    const el=document.getElementById('gondola-'+i);
    if(!el) continue;
    if(i<litCount){
      el.setAttribute('fill','#f4b942');
      el.style.filter='drop-shadow(0 0 6px #f4b942)';
    } else {
      el.setAttribute('fill','#2e1354');
      el.style.filter='none';
    }
  }
}

/* ================= FIREWORKS ================= */
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
let particles=[];
const fwColors=['#ff4fa3','#f4b942','#3fe8c4','#ffe1a3','#ffffff'];
const fwFlash = document.getElementById('firework-flash');

function flashScreen(){
  fwFlash.classList.remove('pulse');
  // force reflow so the animation can retrigger
  void fwFlash.offsetWidth;
  fwFlash.classList.add('pulse');
  setTimeout(()=>fwFlash.classList.remove('pulse'), 90);
}

function launchFirework(x,y,big,playSound){
  const count = big? 70:30;
  const color = fwColors[Math.floor(Math.random()*fwColors.length)];
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2*i)/count;
    const speed = (big? 3.4:2)*(0.6+Math.random()*0.7);
    particles.push({
      x,y,
      vx:Math.cos(angle)*speed,
      vy:Math.sin(angle)*speed,
      life:1,
      decay:0.012+Math.random()*0.012,
      color,
      sparkle: Math.random()<0.3
    });
  }
  if(big) flashScreen();
  if(playSound) fairAudio.playSfx('firework', { volume: big ? 0.85 : 0.3 });
}
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.life-=p.decay;
    const alpha = p.sparkle ? Math.max(p.life,0)*(0.5+0.5*Math.sin(p.life*40)) : Math.max(p.life,0);
    ctx.globalAlpha=alpha;
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,2.2,0,Math.PI*2);
    ctx.fill();
  });
  particles = particles.filter(p=>p.life>0);
  ctx.globalAlpha=1;
  requestAnimationFrame(loop);
}
loop();
function ambientFireworks(){
  if(Math.random()<0.5){
    launchFirework(Math.random()*window.innerWidth*0.7+window.innerWidth*0.15,
                    Math.random()*window.innerHeight*0.35+40, false, false);
  }
  setTimeout(ambientFireworks, 3200+Math.random()*2600);
}
ambientFireworks();

/* A ~9s firework "show": several bursts fired over the duration, one
   firework sound played once at the start (matches the sfx clip length).
   Used only for the firework scene and the ending — not the ambient sparkle above. */
function runFireworkShow(centerXFrac, topFrac, durationMs){
  durationMs = durationMs || 9000;
  const startTime = performance.now();
  fairAudio.playSfx('firework', { volume: 0.9 });

  function fireBurst(){
    const elapsed = performance.now() - startTime;
    if(elapsed >= durationMs) return;
    const x = window.innerWidth * (centerXFrac + (Math.random()-0.5)*0.34);
    const y = window.innerHeight * (topFrac + (Math.random()-0.5)*0.08);
    launchFirework(x, y, true, false);
    setTimeout(fireBurst, 500 + Math.random()*650);
  }
  fireBurst();
}

/* ================= RAIN ================= */
const rainEl = document.getElementById('rain');
const splashLayer = document.getElementById('rain-splash-layer');
const thunderFlash = document.getElementById('thunder-flash');
let rainActive = false;
let thunderTimeoutId = null;

function buildRain(){
  for(let i=0;i<60;i++){
    const d=document.createElement('div');
    d.className='drop';
    d.style.left=Math.random()*100+'vw';
    d.style.animationDuration=(0.5+Math.random()*0.4)+'s';
    d.style.animationDelay=(Math.random()*1)+'s';
    rainEl.appendChild(d);
  }
}
buildRain();

function spawnSplash(){
  if(!rainActive) return;
  const s=document.createElement('div');
  s.className='splash';
  s.style.left=Math.random()*100+'vw';
  s.style.bottom=(Math.random()*4)+'vh';
  splashLayer.appendChild(s);
  setTimeout(()=>s.remove(), 600);
}
setInterval(spawnSplash, 90);

function scheduleThunder(){
  clearTimeout(thunderTimeoutId);
  if(!rainActive) return;
  thunderTimeoutId = setTimeout(()=>{
    if(rainActive){
      thunderFlash.classList.remove('flash');
      void thunderFlash.offsetWidth;
      thunderFlash.classList.add('flash');
      fairAudio.playSfx('thunder', { volume: 0.5 });
    }
    scheduleThunder();
  }, 5000 + Math.random()*7000);
}

function setRain(active){
  rainActive = active;
  rainEl.classList.toggle('active', active);
  splashLayer.classList.toggle('active', active);
  // scene 1 (index 0) = still at the entrance, no crowd ambience yet.
  // scene 2 onward = festival chatter, swapping to rain during rain scenes.
  const ambientTrack = current === 0 ? null : (active ? 'rain' : 'festival');
  fairAudio.crossfadeAmbient(ambientTrack, 1400);
  if(active) scheduleThunder(); else clearTimeout(thunderTimeoutId);
}

/* ================= SCREEN NAV ================= */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ================= INTRO ================= */
const ticket = document.getElementById('ticket');
ticket.addEventListener('click', ()=>{
  fairAudio.unlock();
  fairAudio.playSfx('click');
  ticket.classList.toggle('flipped');
});
document.getElementById('btn-start').addEventListener('click', ()=>{
  fairAudio.unlock();
  fairAudio.playSfx('click');
  fairAudio.playBgm('theme', 2000);
  current=0; score=0;
  renderScene();
  showScreen('screen-scene');
});

/* ================= DOT PROGRESS ================= */
function buildDots(){
  const wrap=document.getElementById('dot-progress');
  wrap.innerHTML='';
  for(let i=0;i<scenes.length;i++){
    const d=document.createElement('span');
    wrap.appendChild(d);
  }
}
function updateDots(){
  const dots=document.querySelectorAll('#dot-progress span');
  dots.forEach((d,i)=> d.classList.toggle('done', i<current));
}
buildDots();
buildStars();
buildBunting();
buildHangStars();
buildGondolas();

/* ================= RENDER SCENE ================= */
function renderScene(){
  const s = scenes[current];
  document.getElementById('scene-label').textContent = 'ฉากที่ '+(current+1);
  updateDots();
  updateGondolas(current);

  setRain(!!s.rain);

  const textWrap = document.getElementById('scene-text');
  textWrap.innerHTML='';
  s.lines.forEach((txt, i)=>{
    const p=document.createElement('p');
    p.className='line'+(i===s.lines.length-1 && s.lines.length>1 ? ' question':'');
    p.textContent=txt;
    p.style.animationDelay=(i*0.45)+'s';
    textWrap.appendChild(p);
  });

  const choicesWrap = document.getElementById('choices');
  choicesWrap.innerHTML='';
  const revealDelay = s.lines.length*0.45 + 0.15;
  s.choices.forEach(([label,pts], i)=>{
    const btn=document.createElement('button');
    btn.className='choice';
    btn.textContent=label;
    btn.style.animationDelay=(revealDelay + i*0.09)+'s';
    btn.addEventListener('click', ()=>selectChoice(btn, pts, s.feedback, s.firework, s.sound));
    choicesWrap.appendChild(btn);
  });

  document.getElementById('scene-toast').classList.remove('show');
}

function selectChoice(btn, pts, feedbackText, firework, soundName){
  document.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  btn.classList.add('picked');
  score += pts;

  fairAudio.playSfx(soundName || 'select');
  showSceneToast(feedbackText);

  if(firework){
    runFireworkShow(0.5, 0.32, 9000);
  }

  const delay = 1900;
  setTimeout(()=>{
    current++;
    if(current>=scenes.length){
      updateGondolas(scenes.length);
      setRain(false);
      showEnding();
    } else {
      renderScene();
    }
  }, delay);
}

function showSceneToast(text){
  const toast = document.getElementById('scene-toast');
  const textEl = document.getElementById('toast-text');
  toast.classList.remove('show');
  void toast.offsetWidth; // reflow so the animation restarts cleanly each time
  textEl.textContent = text;
  toast.classList.add('show');
}

/* ================= ENDING ================= */
let lastEndingResult = null; // { title, desc, special } — read by the share-image generator

function showEnding(){
  let title, desc, special=false;
  if(score>=36){
    title=specialEnding.title; desc=specialEnding.desc; special=true;
  } else {
    const e = endings.find(e=>score>=e.min && score<=e.max) || endings[0];
    title=e.title; desc=e.desc;
  }
  lastEndingResult = { title, desc, special };
  const titleEl=document.getElementById('ending-title');
  titleEl.textContent=title;
  titleEl.classList.toggle('special', special);
  document.getElementById('ending-desc').textContent=desc;
  document.getElementById('ending-badge').textContent = special ? 'Secret Ending ปลดล็อกแล้ว' : 'ผลลัพธ์ของคุณ';

  showScreen('screen-ending');
  fairAudio.playSfx('ending', { volume: special ? 1 : 0.85 });
  runFireworkShow(0.5, 0.3, 9000);
}

document.getElementById('btn-restart').addEventListener('click', ()=>{
  fairAudio.playSfx('click');
  current=0; score=0;
  setRain(false);
  showScreen('screen-intro');
  ticket.classList.remove('flipped');
});

/* ================= AUDIO UI WIRING ================= */
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioPanelBtn = document.getElementById('audio-panel-btn');
const audioPanel = document.getElementById('audio-panel');
const volBgm = document.getElementById('vol-bgm');
const volAmbient = document.getElementById('vol-ambient');
const volSfx = document.getElementById('vol-sfx');

function syncAudioUI(){
  const muted = fairAudio.settings.muted;
  audioToggleBtn.classList.toggle('is-muted', muted);
  audioToggleBtn.setAttribute('aria-pressed', String(muted));
  audioToggleBtn.setAttribute('aria-label', muted ? 'เปิดเสียง' : 'ปิดเสียง');
  volBgm.value = fairAudio.settings.bgm;
  volAmbient.value = fairAudio.settings.ambient;
  volSfx.value = fairAudio.settings.sfx;
}
syncAudioUI();

audioToggleBtn.addEventListener('click', ()=>{
  fairAudio.unlock();
  fairAudio.toggleMute();
  syncAudioUI();
});

audioPanelBtn.addEventListener('click', ()=>{
  const isHidden = audioPanel.hidden;
  audioPanel.hidden = !isHidden;
  audioPanelBtn.setAttribute('aria-expanded', String(isHidden));
});
document.addEventListener('click', (e)=>{
  if(!audioPanel.hidden && !e.target.closest('#audio-ui')){
    audioPanel.hidden = true;
    audioPanelBtn.setAttribute('aria-expanded','false');
  }
});

volBgm.addEventListener('input', ()=> fairAudio.setCategoryVolume('bgm', parseFloat(volBgm.value)));
volAmbient.addEventListener('input', ()=> fairAudio.setCategoryVolume('ambient', parseFloat(volAmbient.value)));
volSfx.addEventListener('input', ()=> fairAudio.setCategoryVolume('sfx', parseFloat(volSfx.value)));

/* ================= SHARE RESULT AS IMAGE (IG Story) ================= */

// Wrap Thai (space-optional) text to fit maxWidth on a canvas context.
function wrapCanvasText(ctx, text, maxWidth){
  const words = text.split(' ');
  const lines = [];
  let line = '';
  const pushChar = (chunkStart)=>{
    let chunk = chunkStart;
    return chunk;
  };
  for(let w of words){
    const candidate = line ? line + ' ' + w : w;
    if(ctx.measureText(candidate).width <= maxWidth){
      line = candidate;
      continue;
    }
    if(line) lines.push(line);
    if(ctx.measureText(w).width <= maxWidth){
      line = w;
    } else {
      // word itself too wide (common in Thai, which has no spaces) — break by character
      let chunk = '';
      for(const ch of w){
        const test = chunk + ch;
        if(ctx.measureText(test).width <= maxWidth){
          chunk = test;
        } else {
          if(chunk) lines.push(chunk);
          chunk = ch;
        }
      }
      line = chunk;
    }
  }
  if(line) lines.push(line);
  return lines;
}

function roundRectPath(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawSparkle(ctx,x,y,size,color){
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(0,-size);
  ctx.quadraticCurveTo(size*0.15,-size*0.15,size,0);
  ctx.quadraticCurveTo(size*0.15,size*0.15,0,size);
  ctx.quadraticCurveTo(-size*0.15,size*0.15,-size,0);
  ctx.quadraticCurveTo(-size*0.15,-size*0.15,0,-size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMiniFerris(ctx,x,y,r){
  ctx.save();
  ctx.translate(x,y);
  ctx.strokeStyle='rgba(244,185,66,.9)';
  ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
  const spokeColors=['#ff4fa3','#f4b942','#3fe8c4','#ffe1a3','#ff4fa3','#3fe8c4'];
  for(let i=0;i<6;i++){
    const a=(Math.PI*2/6)*i;
    ctx.strokeStyle='rgba(244,185,66,.55)';
    ctx.lineWidth=1.6;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    ctx.stroke();
    ctx.fillStyle = spokeColors[i];
    ctx.beginPath(); ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 4,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#f4b942';
  ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawMiniFirework(ctx,x,y,r){
  ctx.save();
  ctx.translate(x,y);
  const colors=['#ff4fa3','#f4b942','#3fe8c4','#ffe1a3'];
  for(let i=0;i<10;i++){
    const a=(Math.PI*2/10)*i;
    const len=r*(0.7+((i*37)%10)/10*0.3);
    const color=colors[i%colors.length];
    ctx.strokeStyle=color;
    ctx.lineWidth=2.4;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*len, Math.sin(a)*len);
    ctx.stroke();
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(Math.cos(a)*len, Math.sin(a)*len, 3,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawMiniLantern(ctx,x,y,scale){
  ctx.save();
  ctx.translate(x,y);
  const g=ctx.createRadialGradient(0,0,2,0,0,20*scale);
  g.addColorStop(0,'#ffe1a3'); g.addColorStop(1,'#f4b942');
  ctx.fillStyle=g;
  ctx.shadowColor='#f4b942'; ctx.shadowBlur=22;
  ctx.beginPath(); ctx.ellipse(0,0,13*scale,17*scale,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(120,70,20,.5)'; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(-13*scale,0); ctx.lineTo(13*scale,0); ctx.stroke();
  ctx.restore();
}

async function buildShareImageBlob(result){
  await (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve());

  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d');

  const cardX = 70, cardW = W - 140;
  const innerWidth = cardW - 110;

  // ---- measure content first so the card hugs it — no big empty gap ----
  c.font = '400 34px Sarabun, sans-serif';
  const descLines = wrapCanvasText(c, result.desc, innerWidth);
  const lineHeight = 54;

  const titleMaxWidth = cardW - 100;
  let titleFontSize = 68;
  c.font = `800 ${titleFontSize}px Kanit, sans-serif`;
  while(c.measureText(result.title).width > titleMaxWidth && titleFontSize > 36){
    titleFontSize -= 2;
    c.font = `800 ${titleFontSize}px Kanit, sans-serif`;
  }

  const topPad = 78, eyebrowH = 56, badgeH = 66, titleH = 76, dividerGap = 54;
  const descBlockH = descLines.length * lineHeight;
  const decorGap = 50, decorRowH = 74, footerGap = 46, footerH = 34, bottomPad = 64;

  let cardH = topPad + eyebrowH + badgeH + titleH + dividerGap + descBlockH + decorGap + decorRowH + footerGap + footerH + bottomPad;
  cardH = Math.max(760, Math.min(cardH, 1280));
  const cardY = Math.max(360, (H - cardH) / 2 + 40);

  // ---- background ----
  const bg = c.createRadialGradient(W*0.5,-100,200, W*0.5,H*0.55,1500);
  bg.addColorStop(0,'#3a1a66');
  bg.addColorStop(0.55,'#1c1044');
  bg.addColorStop(1,'#0a0620');
  c.fillStyle = bg;
  c.fillRect(0,0,W,H);

  const starSeed = mulberry32(42);
  for(let i=0;i<90;i++){
    const x = starSeed()*W, y = starSeed()*H*0.9;
    const r = starSeed()*1.6+0.4;
    c.globalAlpha = 0.25 + starSeed()*0.55;
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
  }
  c.globalAlpha = 1;

  // hanging bulb garland across the very top
  const bulbColors = ['#ff4fa3','#f4b942','#3fe8c4','#fbf3df'];
  const anchors = [0, W*0.33, W*0.66, W];
  c.lineWidth = 2;
  c.strokeStyle = 'rgba(120,90,60,.5)';
  for(let i=0;i<anchors.length-1;i++){
    const p0={x:anchors[i],y:10}, p2={x:anchors[i+1],y:10};
    const p1={x:(p0.x+p2.x)/2,y:70};
    c.beginPath();
    c.moveTo(p0.x,p0.y);
    c.quadraticCurveTo(p1.x,p1.y,p2.x,p2.y);
    c.stroke();
    for(let b=1;b<7;b++){
      const t=b/7;
      const x=(1-t)**2*p0.x+2*(1-t)*t*p1.x+t**2*p2.x;
      const y=(1-t)**2*p0.y+2*(1-t)*t*p1.y+t**2*p2.y;
      const color = bulbColors[(i*6+b)%bulbColors.length];
      c.fillStyle=color;
      c.shadowColor=color; c.shadowBlur=14;
      c.beginPath(); c.arc(x,y+8,6,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
    }
  }

  // floating lanterns for atmosphere — a couple above the card, a couple below it
  [[W*0.14,H*0.16],[W*0.87,H*0.22],[W*0.16,cardY+cardH+70],[W*0.85,cardY+cardH+50]].forEach(([lx,ly])=>{
    if(ly < H-40) drawMiniLantern(c, lx, ly, 1.3);
  });

  // sparkle accents flanking the card top
  drawSparkle(c, cardX+40, cardY-18, 16, '#3fe8c4');
  drawSparkle(c, cardX+cardW-40, cardY-18, 16, '#ff4fa3');

  // ---- card panel ----
  roundRectPath(c,cardX,cardY,cardW,cardH,36);
  c.fillStyle='rgba(18,9,36,.74)';
  c.fill();
  c.lineWidth=2;
  c.strokeStyle='rgba(244,185,66,.55)';
  c.stroke();

  const centerX = W/2;
  let cy = cardY + topPad;

  c.textAlign='center';
  c.fillStyle='#3fe8c4';
  c.font='600 30px Kanit, sans-serif';
  c.fillText('ตั๋วปริศนา: ราตรีงานวัด', centerX, cy);
  cy += eyebrowH;

  c.fillStyle = '#ff4fa3';
  c.font='600 26px Kanit, sans-serif';
  c.fillText(result.special ? 'SECRET ENDING ปลดล็อกแล้ว' : 'ผลลัพธ์ของคุณคือ', centerX, cy);
  cy += badgeH;

  c.font = `800 ${titleFontSize}px Kanit, sans-serif`;
  const titleGrad = c.createLinearGradient(centerX-200,0,centerX+200,0);
  if(result.special){
    titleGrad.addColorStop(0,'#ff4fa3');
    titleGrad.addColorStop(0.5,'#f4b942');
    titleGrad.addColorStop(1,'#3fe8c4');
  } else {
    titleGrad.addColorStop(0,'#ffe1a3');
    titleGrad.addColorStop(1,'#f4b942');
  }
  c.fillStyle = titleGrad;
  c.fillText(result.title, centerX, cy);
  cy += titleH;

  c.strokeStyle='rgba(244,185,66,.4)';
  c.lineWidth=2;
  c.beginPath(); c.moveTo(centerX-60,cy-16); c.lineTo(centerX+60,cy-16); c.stroke();
  cy += dividerGap - 16;

  c.font='400 34px Sarabun, sans-serif';
  c.fillStyle='rgba(251,243,223,.92)';
  descLines.forEach(line=>{
    c.fillText(line, centerX, cy);
    cy += lineHeight;
  });

  cy += decorGap;

  // decorative bulb-strand divider — pure color/fill, echoes the site's garland motif
  const dotCount = 9;
  const dotSpan = innerWidth * 0.72;
  const dotStartX = centerX - dotSpan/2;
  for(let i=0;i<dotCount;i++){
    const dx = dotStartX + (dotSpan/(dotCount-1))*i;
    const color = bulbColors[i%bulbColors.length];
    c.fillStyle = color;
    c.shadowColor = color; c.shadowBlur = 10;
    c.beginPath(); c.arc(dx, cy - 20, 5, 0, Math.PI*2); c.fill();
    c.shadowBlur = 0;
  }

  // three little themed icons so the bottom of the card is never bare
  const iconY = cy + 18;
  drawMiniFerris(c, centerX - 130, iconY, 30);
  drawMiniFirework(c, centerX, iconY, 28);
  drawMiniLantern(c, centerX + 130, iconY, 1.6);
  cy += decorRowH;

  cy += footerGap;
  c.font='500 26px Sarabun, sans-serif';
  c.fillStyle='rgba(251,243,223,.55)';
  c.fillText('เล่นเกมทดสอบตัวตนธีมงานวัด • ตั๋วปริศนา', centerX, cy);

  return await new Promise(resolve=> canvas.toBlob(resolve, 'image/png', 0.95));
}

// small deterministic PRNG so the star field looks intentional, not re-randomized noisily
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

const btnShare = document.getElementById('btn-share');
const shareStatus = document.getElementById('share-status');

btnShare.addEventListener('click', async ()=>{
  if(!lastEndingResult) return;
  fairAudio.playSfx('click');
  btnShare.disabled = true;
  const originalLabel = btnShare.innerHTML;
  btnShare.innerHTML = 'กำลังสร้างรูป…';
  shareStatus.textContent = '';

  try{
    const blob = await buildShareImageBlob(lastEndingResult);
    if(!blob) throw new Error('canvas-to-blob failed');
    downloadBlob(blob, 'temple-fair-ending.png');
    shareStatus.textContent = 'บันทึกรูปลงเครื่องแล้ว — นำไปโพสต์ลง IG Story ได้เลย';
  }catch(err){
    console.warn('[share] failed to generate image', err);
    shareStatus.textContent = 'สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้งนะ';
  }finally{
    btnShare.disabled = false;
    btnShare.innerHTML = originalLabel;
  }
});
