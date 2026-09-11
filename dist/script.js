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
  const texture=new Image();texture.src='assets/camera-clean-texture.png';
  const textureReady=texture.decode();
  const patches=new WeakMap();
  const logoCenters=[[1,295],[4,298],[8,308],[9,328],[10,358],[11,410],[12,452],[13,460],[14,465],[15,469],[17,475],[18,484],[19,504],[20,550],[21,613],[22,654],[23,666],[40,668],[50,660]];
  const makePatch=(img,frame)=>{
    let a=logoCenters[0],b=logoCenters[logoCenters.length-1];
    for(let j=1;j<logoCenters.length;j++)if(frame<=logoCenters[j][0]){a=logoCenters[j-1];b=logoCenters[j];break;}
    const cy=a[1]+(b[1]-a[1])*(frame-a[0])/(b[0]-a[0]);
    const probe=document.createElement('canvas');probe.width=img.naturalWidth;probe.height=img.naturalHeight;
    const p=probe.getContext('2d',{willReadFrequently:true});p.drawImage(img,0,0);
    const y0=Math.round(cy-30),pixels=p.getImageData(455,y0,240,60).data;
    let x1=240,y1=60,x2=0,y2=0;
    for(let y=0;y<60;y++)for(let x=0;x<240;x++){const k=(y*240+x)*4;if(Math.min(pixels[k],pixels[k+1],pixels[k+2])>160){x1=Math.min(x1,x);x2=Math.max(x2,x);y1=Math.min(y1,y);y2=Math.max(y2,y);}}
    if(x2<=x1)return;
    const x=455+x1-6,y=y0+y1-6,w=x2-x1+13,h=y2-y1+13;
    const patch=document.createElement('canvas');patch.width=w;patch.height=h;
    const pc=patch.getContext('2d');pc.drawImage(texture,0,0,w,h);
    // Feather only the outside edge; the center fully covers the lettering.
    pc.globalCompositeOperation='destination-in';
    const mask=document.createElement('canvas');mask.width=w;mask.height=h;
    const mc=mask.getContext('2d');mc.filter='blur(2px)';mc.fillRect(3,3,w-6,h-6);
    pc.drawImage(mask,0,0);patches.set(img,{image:patch,x,y,w,h});
  };
  let current=0,target=0,dirty=true,last=0,width=0,height=0,dpr=0;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const load=async i=>{
    if(frames[i]||pending.has(i))return;
    pending.add(i);
    const img=new Image();img.decoding='async';
    img.src='assets/sequence/ezgif-frame-'+String(i+1).padStart(3,'0')+'.png';
    try{await img.decode();await textureReady;makePatch(img,i+1);frames[i]=img;dirty=true;}catch{}finally{pending.delete(i);}
  };
  const resize=()=>{
    const w=stage.clientWidth,h=stage.clientHeight,d=window.devicePixelRatio||1;
    if(w===width&&h===height&&d===dpr)return;
    width=w;height=h;dpr=d;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);
    ctx.setTransform(d,0,0,d,0,0);dirty=true;
  };
  const measure=()=>{
    target=clamp(-track.getBoundingClientRect().top/Math.max(1,track.offsetHeight-stage.offsetHeight))*49;
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
    const patch=patches.get(img);
    if(patch)ctx.drawImage(patch.image,(width-w)/2+patch.x*scale,(height-h)/2+patch.y*scale,patch.w*scale,patch.h*scale);
    canvas.dataset.frame=String(index+1);dirty=false;
  };
  const tick=time=>{
    resize();measure();
    const before=current;
    current=motion.matches?target:current+(target-current)*(1-Math.exp(-Math.min(64,time-last)/90));
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

