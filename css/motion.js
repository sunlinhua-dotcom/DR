/* DigiRepub — REMOTION-inspired motion effects V2 */
(function(){
  gsap.registerPlugin(ScrollTrigger);
  const isMobile=window.matchMedia('(max-width:900px)').matches;
  const noMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ── Lenis ──
  if(!isMobile&&!noMotion){
    const lenis=new Lenis({duration:1.12,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t))});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Progress bar ──
  const prog=document.getElementById('progress');
  ScrollTrigger.create({trigger:document.body,start:'top top',end:'bottom bottom',
    onUpdate:s=>prog.style.width=(s.progress*100)+'%'});

  // ── Nav hide on scroll ──
  ScrollTrigger.create({start:'top top',end:'bottom bottom',
    onUpdate:s=>{
      const nav=document.querySelector('nav.top');
      if(s.direction===1&&s.scroll()>200)nav.classList.add('hidden');
      else nav.classList.remove('hidden');
    }});

  // ── PARTICLE CANVAS ──
  const canvas=document.getElementById('particleCanvas');
  if(canvas&&!noMotion){
    const ctx=canvas.getContext('2d');
    let W,H,particles=[];
    function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
    resize();window.addEventListener('resize',resize);
    class Particle{
      constructor(){this.reset();}
      reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.r=Math.random()*1.5+.5;this.alpha=Math.random()*.4+.1;}
      update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W)this.vx*=-1;if(this.y<0||this.y>H)this.vy*=-1;}
      draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(227,30,36,${this.alpha})`;ctx.fill();}
    }
    const count=isMobile?30:80;
    for(let i=0;i<count;i++)particles.push(new Particle());
    function drawLines(){
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<150){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(227,30,36,${.06*(1-d/150)})`;ctx.lineWidth=.5;ctx.stroke();}
        }
      }
    }
    function animate(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw();});drawLines();requestAnimationFrame(animate);}
    animate();
  }

  // ── HERO KINETIC TYPOGRAPHY ──
  const chars=document.querySelectorAll('#heroTitle .char');
  if(chars.length){
    // 先隐藏, 然后动画显示
    gsap.set(chars,{y:'120%',opacity:0});
    gsap.to(chars,{y:'0%',opacity:1,duration:1.2,ease:'power4.out',stagger:.06,delay:.3});
  }

  // ── MANIFESTO word-by-word ──
  ScrollTrigger.create({
    trigger:'#manifesto',start:'top 75%',end:'bottom 35%',scrub:.5,
    onUpdate:self=>{
      const words=document.querySelectorAll('#manifesto .word');
      const count=Math.floor(self.progress*words.length*1.15);
      words.forEach((w,i)=>w.classList.toggle('lit',i<=count));
    }
  });

  // ── REVEAL — 修复：更激进的触发条件 ──
  gsap.utils.toArray('.reveal').forEach(el=>{
    // 直接设置初始状态
    gsap.set(el,{opacity:0,y:28});
    gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 95%',end:'top 60%',toggleActions:'play none none none'}});
  });

  // ── Section head stagger ──
  gsap.utils.toArray('.section-head').forEach(head=>{
    const tl=gsap.timeline({scrollTrigger:{trigger:head,start:'top 90%'}});
    tl.from(head.querySelector('.num'),{y:36,opacity:0,duration:1,ease:'power3.out'})
      .from(head.querySelector('h2'),{y:44,opacity:0,duration:1.1,ease:'power3.out'},'<0.12');
    const eb=head.querySelector('.eyebrow');
    if(eb)tl.from(eb,{y:22,opacity:0,duration:.9,ease:'power3.out'},'<0.2');
  });

  // ── Animated bars (Remotion AnimatedBar 风格) ──
  document.querySelectorAll('.animated-bar').forEach(bar=>{
    ScrollTrigger.create({
      trigger:bar,start:'top 90%',once:true,
      onEnter:()=>{
        const target=parseFloat(bar.dataset.value)||0;
        gsap.to(bar,{width:target+'%',duration:1.5,ease:'power2.out',delay:parseFloat(bar.dataset.delay)||0});
      }
    });
  });

  // ── Radial meter animation ──
  document.querySelectorAll('.radial-meter').forEach(meter=>{
    const circle=meter.querySelector('.meter-fill');
    if(!circle)return;
    const r=parseFloat(circle.getAttribute('r'))||40;
    const circ=2*Math.PI*r;
    const target=parseFloat(meter.dataset.value)||0;
    circle.style.strokeDasharray=circ;
    circle.style.strokeDashoffset=circ;
    ScrollTrigger.create({
      trigger:meter,start:'top 90%',once:true,
      onEnter:()=>{gsap.to(circle,{strokeDashoffset:circ*(1-target/100),duration:2,ease:'power2.out',delay:parseFloat(meter.dataset.delay)||0});}
    });
  });

  // ── Count-up numbers ──
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=parseFloat(el.dataset.count);
    const suffix=el.dataset.suffix||'';
    ScrollTrigger.create({
      trigger:el,start:'top 90%',once:true,
      onEnter:()=>{
        gsap.to({v:0},{v:target,duration:2,ease:'power2.out',
          onUpdate:function(){
            const v=this.targets()[0].v;
            el.textContent=(target>=100?Math.round(v):v.toFixed(1))+suffix;
          }});
      }
    });
  });

  // ── Product card hover ──
  document.querySelectorAll('.product-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      if(noMotion)return;
      const fills=card.querySelectorAll('.art .fill');
      gsap.fromTo(fills,{scale:1},{scale:1.5,duration:.35,yoyo:true,repeat:1,transformOrigin:'50% 50%',ease:'power2.inOut'});
    });
  });

  // ── Pathway path draw ──
  const pathLine=document.getElementById('pathLine');
  if(pathLine){
    const len=pathLine.getTotalLength();
    pathLine.style.strokeDasharray=len;
    pathLine.style.strokeDashoffset=len;
  }
  ScrollTrigger.create({
    trigger:'#pathwayVisual',start:'top 85%',once:true,
    onEnter:()=>{
      if(pathLine)gsap.to(pathLine,{strokeDashoffset:0,duration:2,ease:'power2.inOut'});
      document.querySelectorAll('#pathwayVisual g[data-phase]').forEach((g,i)=>{
        gsap.delayedCall(.4+i*.4,()=>{
          const n=g.querySelector('circle.node');const t=g.querySelector('text');
          if(n){n.style.fill='#E31E24';n.style.stroke='#E31E24';}
          if(t)t.style.fill='#fff';
        });
      });
      gsap.from('#pathwayVisual g[data-phase]',{opacity:0,y:18,duration:.7,stagger:.12,delay:.3,ease:'power3.out'});
    }
  });

  // ── Ecosystem lines draw ──
  const ecoLines=document.querySelectorAll('#ecoLines line');
  ecoLines.forEach(l=>{const len=l.getTotalLength();l.style.strokeDasharray=len;l.style.strokeDashoffset=len;});
  ScrollTrigger.create({
    trigger:'#ecoMap',start:'top 85%',once:true,
    onEnter:()=>{
      gsap.to('#ecoLines line',{strokeDashoffset:0,duration:1.5,stagger:.1,ease:'power2.inOut'});
      gsap.from('#ecoMap circle.eco-dot,#ecoMap circle.eco-center',{scale:0,opacity:0,transformOrigin:'50% 50%',duration:.8,stagger:.08,ease:'back.out(1.6)',delay:.3});
      gsap.from('#ecoMap text',{opacity:0,y:8,duration:.6,stagger:.05,delay:.6});
    }
  });

  // ── Image parallax ──
  if(!isMobile&&!noMotion){
    gsap.utils.toArray('.img-parallax').forEach(img=>{
      gsap.to(img,{y:-40,scale:1.08,ease:'none',
        scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }

  // ── Scanline on dark sections ──
  if(!noMotion){
    document.querySelectorAll('.dark-section').forEach(sec=>{
      const line=document.createElement('div');
      line.style.cssText='position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(227,30,36,.15),transparent);pointer-events:none;z-index:5';
      sec.style.position='relative';sec.appendChild(line);
      gsap.to(line,{top:'100%',duration:6,ease:'none',repeat:-1,
        scrollTrigger:{trigger:sec,start:'top bottom',end:'bottom top',toggleActions:'play pause resume pause'}});
    });
  }

  // ── Film grain ──
  if(!noMotion&&!isMobile){
    const grain=document.createElement('div');
    grain.style.cssText='position:fixed;inset:-80px;opacity:.035;mix-blend-mode:overlay;pointer-events:none;z-index:9999;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'320\'><filter id=\'g\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' seed=\'0\'/><feColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23g)\'/></svg>");background-size:320px';
    document.body.appendChild(grain);
    let seed=0;
    setInterval(()=>{seed=(seed+1)%16;grain.style.backgroundPosition=`${(seed*11%160)-80}px ${(seed*17%160)-80}px`;},100);
  }

  // ── Ticker tape (Remotion Ticker 风格) ──
  document.querySelectorAll('.ticker-tape').forEach(ticker=>{
    const inner=ticker.querySelector('.ticker-inner');
    if(!inner)return;
    // 复制内容实现无缝循环
    inner.innerHTML+=inner.innerHTML;
    gsap.to(inner,{x:'-50%',duration:20,ease:'none',repeat:-1});
  });

  // ── Shimmer sweep on cards ──
  if(!noMotion){
    document.querySelectorAll('.shimmer-card').forEach(card=>{
      const sh=document.createElement('div');
      sh.style.cssText='position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);pointer-events:none;z-index:10';
      card.style.position='relative';card.style.overflow='hidden';
      card.appendChild(sh);
      gsap.to(sh,{left:'200%',duration:4,ease:'power1.inOut',repeat:-1,repeatDelay:2});
    });
  }

  // ── Breathing effect on logos ──
  if(!noMotion){
    gsap.to('.closing-logo',{scale:1.04,duration:3,ease:'sine.inOut',repeat:-1,yoyo:true,transformOrigin:'center'});
  }
})();
