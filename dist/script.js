'use strict';
const projects={myglass:{title:'My Glass',image:'assets/my-glass.webp',description:'Uma identidade de linhas geométricas e tons neutros para uma empresa de fornecimento e instalação de vidros. O projeto apresenta símbolo, assinatura e aplicações em diferentes pontos de contato.',alt:'Identidade My Glass aplicada em uma recepção'},leev:{title:'LEEV',image:'assets/leev.webp',description:'Verde profundo, uma assinatura delicada e detalhes em dourado. Uma composição visual que explora formas orgânicas e aparece em aplicações de embalagens e produtos.',alt:'Logo LEEV em dourado sobre verde'},deborah:{title:'Déborah Teixeira',image:'assets/deborah.webp',description:'Uma identidade lúdica para psicologia infantil ABA. Ilustração, cores suaves e uma assinatura expressiva compõem uma linguagem visual voltada ao universo infantil.',alt:'Logo ilustrado de Déborah Teixeira'}};
const dialog=document.getElementById('project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{const project=projects[button.dataset.project];document.getElementById('dialog-title').textContent=project.title;document.getElementById('dialog-description').textContent=project.description;const image=document.getElementById('dialog-image');image.src=project.image;image.alt=project.alt;dialog.showModal();document.body.style.overflow='hidden';}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';});

// Scroll-controlled cinematic frame sequence behind the existing hero.
(()=>{
  const hero=document.querySelector('.hero');
  if(!hero)return;
  hero.classList.add('sequence-hero');
  const canvas=document.createElement('canvas');
  canvas.className='hero-sequence-canvas';
  canvas.setAttribute('aria-hidden','true');
  hero.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:false});
  const frameUrls=Array.from({length:50},(_,i)=>`assets/sequence/ezgif-frame-${String(i+1).padStart(3,'0')}.png`);
  const frames=frameUrls.map(src=>{const image=new Image();image.decoding='async';image.src=src;return image;});
  let width=0,height=0,target=0,current=0,raf=0,ready=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const resize=()=>{const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);width=Math.max(1,Math.floor(rect.width*dpr));height=Math.max(1,Math.floor(rect.height*dpr));canvas.width=width;canvas.height=height;ctx.setTransform(dpr,0,0,dpr,0,0);draw()};
  const draw=()=>{const image=frames[Math.round(current)]||frames[0];if(!image||!image.complete||!image.naturalWidth)return;const w=canvas.clientWidth,h=canvas.clientHeight;ctx.fillStyle='#080807';ctx.fillRect(0,0,w,h);const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;ctx.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh)};
  const updateTarget=()=>{const rect=hero.getBoundingClientRect();const progress=clamp((window.innerHeight-rect.top)/(rect.height+window.innerHeight),0,1);target=progress*(frames.length-1)};
  const tick=()=>{current+=(target-current)*.14;if(Math.abs(target-current)<.01)current=target;draw();raf=requestAnimationFrame(tick)};
  frames.forEach((image,index)=>image.addEventListener('load',()=>{ready++;if(index===0||ready%4===0)draw()},{once:true}));
  window.addEventListener('resize',resize,{passive:true});window.addEventListener('scroll',updateTarget,{passive:true});
  resize();updateTarget();
  if(reduced){current=0;draw();return}
  cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
})();
