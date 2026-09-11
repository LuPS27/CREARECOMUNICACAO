'use strict';
const projects={myglass:{title:'My Glass',image:'assets/my-glass.webp',description:'Uma identidade de linhas geométricas e tons neutros para uma empresa de fornecimento e instalação de vidros. O projeto apresenta símbolo, assinatura e aplicações em diferentes pontos de contato.',alt:'Identidade My Glass aplicada em uma recepção'},leev:{title:'LEEV',image:'assets/leev.webp',description:'Verde profundo, uma assinatura delicada e detalhes em dourado. Uma composição visual que explora formas orgânicas e aparece em aplicações de embalagens e produtos.',alt:'Logo LEEV em dourado sobre verde'},deborah:{title:'Déborah Teixeira',image:'assets/deborah.webp',description:'Uma identidade lúdica para psicologia infantil ABA. Ilustração, cores suaves e uma assinatura expressiva compõem uma linguagem visual voltada ao universo infantil.',alt:'Logo ilustrado de Déborah Teixeira'}};
const dialog=document.getElementById('project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{const project=projects[button.dataset.project];document.getElementById('dialog-title').textContent=project.title;document.getElementById('dialog-description').textContent=project.description;const image=document.getElementById('dialog-image');image.src=project.image;image.alt=project.alt;dialog.showModal();document.body.style.overflow='hidden';}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';});

// The canvas stays outside the hero grid so it cannot displace its content.
(()=>{
  const hero=document.querySelector('.hero');
  if(!hero)return;
  const track=document.createElement('div'),stage=document.createElement('div');
  track.className='sequence-track';stage.className='sequence-stage';
  hero.before(track);track.append(stage);stage.append(hero);
  const canvas=document.createElement('canvas');canvas.className='hero-sequence-canvas';
  canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const frames=new Array(50), pending=new Set();
  let current=0,target=0,dirty=true,last=0,width=0,height=0,dpr=0;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const load=async i=>{
    if(frames[i]||pending.has(i))return;
    pending.add(i);
    const img=new Image();img.decoding='async';
    img.src='assets/sequence/ezgif-frame-'+String(i+1).padStart(3,'0')+'.png';
    try{await img.decode();frames[i]=img;dirty=true;}catch{}finally{pending.delete(i);}
  };
  const resize=()=>{
    const w=stage.clientWidth,h=stage.clientHeight,d=window.devicePixelRatio||1;
    if(w===width&&h===height&&d===dpr)return;
    width=w;height=h;dpr=d;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);
    ctx.setTransform(d,0,0,d,0,0);dirty=true;
  };
  const measure=()=>{
    target=motion.matches?0:clamp(-track.getBoundingClientRect().top/Math.max(1,track.offsetHeight-stage.offsetHeight))*49;
  };
  const draw=()=>{
    const index=Math.round(current);
    let img=frames[index];
    if(!img){for(let n=1;n<50&&!img;n++)img=frames[index-n]||frames[index+n];}
    if(!img)return;
    ctx.fillStyle='#0b0d13';ctx.fillRect(0,0,width,height);
    // Fit the portrait footage to the viewport height instead of a 400vh canvas.
    const scale=Math.max(height/img.naturalHeight,Math.min(width/img.naturalWidth,height/img.naturalHeight*1.2));
    const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    ctx.drawImage(img,(width-w)/2,(height-h)/2,w,h);
    canvas.dataset.frame=String(index+1);dirty=false;
  };
  const tick=time=>{
    resize();measure();
    const before=current;
    current=motion.matches?0:current+(target-current)*(1-Math.exp(-Math.min(64,time-last)/90));
    last=time;if(Math.abs(target-current)<.002)current=target;
    if(before!==current||dirty)draw();
    requestAnimationFrame(tick);
  };
  window.addEventListener('scroll',measure,{passive:true});
  window.addEventListener('resize',()=>{dirty=true;measure();},{passive:true});
  motion.addEventListener('change',()=>{current=0;dirty=true;measure();});
  (async()=>{await load(0);for(let i=1;i<50;i+=3)await Promise.all([i,i+1,i+2].filter(n=>n<50).map(load));})();
  requestAnimationFrame(tick);
})();
