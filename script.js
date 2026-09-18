(()=>{
  const DATA=window.PORTFOLIO_DATA||{works:[],videos:[],featured:[],testimonials:[]};
  const root=document.documentElement;
  const q=(s,c=document)=>c.querySelector(s), qa=(s,c=document)=>[...c.querySelectorAll(s)];
  const overlay=q('#pageTransition');

  function syncTheme(){
    const dark=root.dataset.theme!=='light';
    qa('.theme-toggle span').forEach(x=>x.textContent=dark?'LIGHT':'DARK');
    const meta=q('meta[name="theme-color"]'); if(meta) meta.setAttribute('content',dark?'#090909':'#e8e8e3');
  }
  function initTheme(){
    const saved=localStorage.getItem('ia-theme'); if(saved) root.dataset.theme=saved;
    syncTheme();
    qa('.theme-toggle').forEach(btn=>btn.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('ia-theme',root.dataset.theme);syncTheme()}));
  }

  function runTransition(fn){
    if(!overlay){fn();return}
    overlay.classList.remove('exit'); overlay.classList.add('active');
    setTimeout(()=>{fn();},320);
    setTimeout(()=>{overlay.classList.add('exit')},700);
    setTimeout(()=>overlay.classList.remove('active','exit'),1180);
  }

  function attachInternalLinks(scope=document){
    qa('a',scope).forEach(a=>{
      const href=a.getAttribute('href');
      if(!href||href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('https://wa.me')||a.hasAttribute('download'))return;
      if(a.dataset.bound)return; a.dataset.bound='1';
      a.addEventListener('click',e=>{
        if(href.startsWith('#'))return;
        e.preventDefault(); runTransition(()=>location.href=href);
      });
    });
  }

  function observeReveal(){
    const els=qa('.reveal:not(.visible)'); if(!els.length)return;
    if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('visible'));return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    els.forEach(x=>io.observe(x));
  }

  function setView(mode,animate=true){
  const views={
    profile:q('#profileView'),
    work:q('#workView'),
    gallery:q('#galleryView')
  };

  const target=views[mode]||views.profile;

  const change=()=>{
    qa('.view').forEach(v=>{
      v.classList.toggle('active',v===target);
    });

    qa('[data-mode]').forEach(b=>{
      b.classList.toggle('active',b.dataset.mode===mode);
    });

    const url=
      mode==='profile'
        ? location.pathname
        : `${location.pathname}#${mode}`;

    history.replaceState(null,'',url);

    window.scrollTo({
      top:0,
      behavior:'instant'
    });

    observeReveal();
  };

  animate?runTransition(change):change();
}
  function initViewSwitch(){
  if(!q('#profileView'))return;

  qa('[data-mode]').forEach(b=>{
    b.addEventListener('click',()=>{
      setView(b.dataset.mode,true);
    });
  });

  qa('[data-view="profile"]').forEach(b=>{
    b.addEventListener('click',()=>{
      setView('profile',true);
    });
  });

  const requested=location.hash.replace('#','');

  setView(
    requested==='work'||requested==='gallery'
      ? requested
      : 'profile',
    false
  );
}

  function initRoleCycler(){
    const el=q('#roleText');if(!el)return;
    const roles=['visual designer.','video editor.','campaign designer.','motion editor.','creative communicator.'];let i=0;
    setInterval(()=>{i=(i+1)%roles.length;el.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-7px)'},{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.18,.76,.18,1)'});setTimeout(()=>el.textContent=roles[i],210)},2700);
  }

  function initClock(){
    if(!q('#digitalClock'))return;
    const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const partsFmt=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',hour:'numeric',minute:'numeric',second:'numeric',hour12:false});
    const update=()=>{
      const now=new Date();q('#digitalClock').textContent=fmt.format(now)+' / DHAKA';
      const ps=partsFmt.formatToParts(now);const v=t=>+ps.find(p=>p.type===t).value;const h=v('hour')%12,m=v('minute'),s=v('second');
      q('#hourHand').style.transform=`rotate(${h*30+m*.5}deg)`;q('#minuteHand').style.transform=`rotate(${m*6+s*.1}deg)`;q('#secondHand').style.transform=`rotate(${s*6}deg)`;
    };update();setInterval(update,1000);
  }

  function initGlobe(){
    const canvas=q('#globeCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');
    const continents=[
      [[-168,72],[-140,70],[-125,60],[-130,52],[-125,42],[-117,32],[-103,25],[-90,20],[-80,28],[-74,40],[-64,48],[-57,58],[-82,68],[-112,74],[-145,74]],
      [[-82,12],[-72,8],[-62,4],[-50,-7],[-45,-20],[-53,-35],[-64,-53],[-72,-43],[-77,-24],[-80,-3]],
      [[-12,36],[0,44],[14,42],[26,48],[40,54],[31,64],[10,63],[-5,56],[-12,47]],
      [[-17,34],[8,37],[27,31],[42,12],[35,-10],[20,-35],[5,-35],[-10,-17],[-17,4],[-7,21]],
      [[30,36],[43,48],[67,56],[91,72],[115,66],[141,55],[160,45],[145,35],[128,22],[110,8],[92,8],[75,22],[57,30],[45,32]],
      [[70,30],[83,24],[91,21],[99,12],[106,6],[116,-3],[125,-6]],
      [[112,-10],[133,-10],[153,-26],[146,-39],[122,-35],[113,-21]],
      [[166,-34],[174,-40],[178,-46],[172,-47],[167,-42]]
    ];
    const markers=[{n:'Bangladesh',lon:90,lat:24,c:'--cyan'},{n:'United States',lon:-98,lat:39,c:'--orange'},{n:'New Zealand',lon:174,lat:-41,c:'--violet'}];
    const pointInPoly=(x,y,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];const hit=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/((yj-yi)||1e-9)+xi);if(hit)inside=!inside}return inside};
    const landDots=[];for(let lat=-55;lat<=75;lat+=4){for(let lon=-176;lon<=176;lon+=4){if(continents.some(poly=>pointInPoly(lon,lat,poly)))landDots.push([lon,lat])}}
    let rot=-118,drag=false,startX=0,startRot=0,hover=null,dpr=1,lastFrame=0,resumeAuto=1;
    const AUTO_ROTATION_DEG_PER_SEC=10.5;
    const css=n=>getComputedStyle(root).getPropertyValue(n).trim();
    function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
    function project(lon,lat,cx,cy,R){const lam=(lon-rot)*Math.PI/180,phi=lat*Math.PI/180;const x=Math.cos(phi)*Math.sin(lam),y=Math.sin(phi),z=Math.cos(phi)*Math.cos(lam);return{x:cx+x*R,y:cy-y*R,z}}
    function draw(ts=0){
      const dt=lastFrame?Math.min((ts-lastFrame)/1000,.12):0;lastFrame=ts;
      const r=canvas.getBoundingClientRect(),cx=r.width/2,cy=r.height/2,R=Math.min(r.width,r.height)*.405;ctx.clearRect(0,0,r.width,r.height);
      const halo=ctx.createRadialGradient(cx,cy,R*.86,cx,cy,R*1.26);halo.addColorStop(0,'rgba(255,255,255,.12)');halo.addColorStop(.64,'rgba(255,255,255,.05)');halo.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=halo;ctx.fillRect(cx-R*1.42,cy-R*1.42,R*2.84,R*2.84);
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();
      ctx.fillStyle='#020202';ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=.6;
      for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();let pen=false;for(let lon=-180;lon<=180;lon+=4){const p=project(lon,lat,cx,cy,R);if(p.z>0){pen?ctx.lineTo(p.x,p.y):(ctx.moveTo(p.x,p.y),pen=true)}else pen=false}ctx.stroke()}
      for(let lon=-150;lon<=150;lon+=30){ctx.beginPath();let pen=false;for(let lat=-85;lat<=85;lat+=3){const p=project(lon,lat,cx,cy,R);if(p.z>0){pen?ctx.lineTo(p.x,p.y):(ctx.moveTo(p.x,p.y),pen=true)}else pen=false}ctx.stroke()}
      ctx.fillStyle='rgba(255,255,255,.95)';
      landDots.forEach(([lon,lat])=>{const p=project(lon,lat,cx,cy,R);if(p.z>.02){const rad=.85+Math.max(0,p.z)*.45;ctx.globalAlpha=.38+Math.max(0,p.z)*.62;ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.fill()}});ctx.globalAlpha=1;
      const shade=ctx.createRadialGradient(cx+R*.16,cy,R*.12,cx+R*.2,cy,R*1.05);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.68,'rgba(0,0,0,.08)');shade.addColorStop(1,'rgba(0,0,0,.33)');ctx.fillStyle=shade;ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.restore();
      ctx.save();ctx.strokeStyle='rgba(255,255,255,.94)';ctx.lineWidth=1.4;ctx.shadowColor='rgba(255,255,255,.9)';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();ctx.restore();
      hover=null;
      markers.forEach(m=>{const p=project(m.lon,m.lat,cx,cy,R);if(p.z<=0)return;const c=css(m.c);ctx.shadowColor=c;ctx.shadowBlur=14;ctx.fillStyle=c;ctx.beginPath();ctx.arc(p.x,p.y,4.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=c;ctx.globalAlpha=.85;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,9.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;if(canvas._mx!=null&&Math.hypot(canvas._mx-p.x,canvas._my-p.y)<15){hover=m;ctx.font='10px Arial';const w=ctx.measureText(m.n).width+18;ctx.fillStyle='rgba(5,5,5,.92)';ctx.fillRect(p.x-w/2,p.y-32,w,20);ctx.fillStyle='#fff';ctx.fillText(m.n,p.x-w/2+9,p.y-18)}});
      canvas.style.cursor=drag?'grabbing':'grab';
      if(drag){resumeAuto=0}else{resumeAuto=Math.min(1,resumeAuto+dt*2.25);rot=(rot+AUTO_ROTATION_DEG_PER_SEC*dt*resumeAuto)%360}
      requestAnimationFrame(draw)
    }
    resize();window.addEventListener('resize',resize);
    canvas.addEventListener('pointerdown',e=>{drag=true;resumeAuto=0;startX=e.clientX;startRot=rot;canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();canvas._mx=e.clientX-r.left;canvas._my=e.clientY-r.top;if(drag)rot=startRot-(e.clientX-startX)*.45});
    canvas.addEventListener('pointerup',e=>{drag=false;try{canvas.releasePointerCapture(e.pointerId)}catch{}});canvas.addEventListener('pointerleave',()=>{canvas._mx=null;canvas._my=null});requestAnimationFrame(draw)
  }

  function projectHref(slug){return `project.html?slug=${encodeURIComponent(slug)}`}
  function esc(s=''){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}


  const VIBE_ROWS=[
    [
      {kind:'image',src:'assets/vibing-gallery/academy-showcase.webp',alt:"Let's Create Academy visual system showcase",title:"Let's Create Academy",tag:'Case Study'},
      {kind:'image',src:'assets/vibing-gallery/academy-ui.webp',alt:"Let's Create Academy interface presentation",title:'Interface System',tag:'Case Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/auvra-brand-board.webp',alt:'AUVRA concept brand board',title:'AUVRA Identity',tag:'Concept Study'},
      {kind:'image',src:'assets/vibing-gallery/auvra-product.webp',alt:'AUVRA concept product presentation',title:'AUVRA Product',tag:'Concept Study'},
      {kind:'image',src:'assets/vibing-gallery/auvra-campaign.webp',alt:'AUVRA concept campaign art',title:'AUVRA Campaign',tag:'Concept Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/typography-clarity.webp',alt:'Clarity Creates Impact typography study',title:'Clarity Creates Impact',tag:'Typography Study'},
      {kind:'image',src:'assets/vibing-gallery/typography-ideas.webp',alt:'Make Ideas Move typography study',title:'Make Ideas Move',tag:'Typography Study'},
      {kind:'image',src:'assets/vibing-gallery/typography-quiet.webp',alt:'Quiet Is A Power Move typography study',title:'Quiet Is A Power Move',tag:'Typography Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/edit-market.webp',alt:'Market background cleanup before and after comparison',title:'Background Cleanup',tag:'Editing Study'},
      {kind:'image',src:'assets/vibing-gallery/edit-studio.webp',alt:'Studio background replacement before and after comparison',title:'Background Replace',tag:'Editing Study'}
    ],
    [
      {kind:'video',src:'assets/vibing-gallery/motion-data-discovery.mp4',title:'Data to Discovery',tag:'Motion Study'},
      {kind:'video',src:'assets/vibing-gallery/motion-aera-product.mp4',title:'AERA Product Film',tag:'Motion Study'},
      {kind:'video',src:'assets/vibing-gallery/motion-research-ui.mp4',title:'Research UI Motion',tag:'Motion Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/auvra-landing.webp',alt:'AUVRA concept landing page',title:'AUVRA Digital',tag:'Concept Study'},
      {kind:'image',src:'assets/vibing-gallery/auvra-editorial.webp',alt:'AUVRA concept editorial spread',title:'AUVRA Editorial',tag:'Concept Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/typography-pattern.webp',alt:'Break The Pattern typography study',title:'Break The Pattern',tag:'Typography Study'},
      {kind:'image',src:'assets/vibing-gallery/typography-people.webp',alt:'Design For People typography study',title:'Design For People',tag:'Typography Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/grade-interior.webp',alt:'Natural editorial grade before and after comparison',title:'Natural Editorial Grade',tag:'Color Study'},
      {kind:'image',src:'assets/vibing-gallery/grade-city.webp',alt:'Moody teal and amber grade before and after comparison',title:'Teal + Amber Grade',tag:'Color Study'},
      {kind:'image',src:'assets/vibing-gallery/grade-cafe.webp',alt:'Warm film grade before and after comparison',title:'Warm Film Grade',tag:'Color Study'}
    ],
    [
      {kind:'image',src:'assets/vibing-gallery/academy-problems.webp',alt:"Let's Create Academy problem framework visual",title:'Visual Problem Framework',tag:'Case Study'}
    ]
  ];

  function renderFeatured(){
    const host=q('#featuredGrid');if(!host)return;host.innerHTML='';
    const items=DATA.featured.map(s=>DATA.works.find(w=>w.slug===s)).filter(Boolean);
    const makeCard=(w,i)=>{const a=document.createElement('a');a.href=projectHref(w.slug);a.className=`featured-card f${i} glow-border`;a.innerHTML=`<span class="work-badge">${esc(w.type)}</span><img src="${w.image}" alt="${esc(w.title)}"><div class="project-overlay"><div><strong>${esc(w.title)}</strong><small>${esc(w.category)} / ${esc(w.year)}</small></div><span>${w.index} ↗</span></div>`;return a};
    const top=document.createElement('div');top.className='featured-row featured-row-top';
    const bottom=document.createElement('div');bottom.className='featured-row featured-row-bottom';
    items.forEach((w,i)=>(i<2?top:bottom).appendChild(makeCard(w,i)));
    host.append(top,bottom);attachInternalLinks(host)
  }
  function renderProjects(filter='all'){
    const host=q('#projectGrid');if(!host)return;const featured=new Set(DATA.featured);const list=DATA.works.filter(w=>!featured.has(w.slug)&&(filter==='all'||w.category===filter));host.innerHTML='';
    list.forEach(w=>{const a=document.createElement('a');a.href=projectHref(w.slug);a.className='work-card glow-border';a.innerHTML=`<span class="work-badge">${esc(w.type)}</span><img loading="lazy" src="${w.image}" alt="${esc(w.title)}"><div class="work-card-info"><div><strong>${esc(w.title)}</strong><small>${esc(w.category)} / ${esc(w.year)}</small></div><span>${w.index} ↗</span></div>`;host.appendChild(a)});attachInternalLinks(host)
  }
  function renderFilters(){const host=q('#filters');if(!host)return;const labels={all:'All',brand:'Brand',content:'Content',campaign:'Campaign',editorial:'Editorial',education:'Education',product:'Product',gaming:'Gaming',sports:'Sports',thumbnail:'Thumbnail'};const cats=['all',...new Set(DATA.works.filter(w=>!DATA.featured.includes(w.slug)).map(w=>w.category))];host.innerHTML='';cats.forEach((c,i)=>{const b=document.createElement('button');b.className='filter-btn'+(i===0?' active':'');b.textContent=labels[c]||c;b.dataset.cat=c;b.addEventListener('click',()=>{qa('.filter-btn',host).forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProjects(c)});host.appendChild(b)})}
  function renderVideos(){const host=q('#videoGrid');if(!host)return;host.innerHTML='';DATA.videos.forEach(v=>{const a=document.createElement('a');a.href=projectHref(v.slug);a.className=`video-card glow-border ${v.orientation==='portrait'?'portrait':''}`;a.innerHTML=`<div class="video-preview"><span class="play-pill">${esc(v.type)} · VIEW ↗</span><video muted loop playsinline preload="metadata" poster="${v.poster}"><source src="${v.video}" type="video/mp4"></video></div><div class="video-info"><span>${esc(v.type)} / ${esc(v.year)}</span><b>${esc(v.title)}</b><p>${esc(v.summary)}</p></div>`;const vid=q('video',a);a.addEventListener('mouseenter',()=>vid.play().catch(()=>{}));a.addEventListener('mouseleave',()=>{vid.pause();vid.currentTime=0});host.appendChild(a)});attachInternalLinks(host)}


  function initVibingPerspective(host){
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;
    if(reduced||!finePointer)return;
    qa('.vibe-item',host).forEach(card=>{
      let raf=0;
      const reset=()=>{cancelAnimationFrame(raf);card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--mx','0px');card.style.setProperty('--my','0px')};
      card.addEventListener('pointermove',e=>{
        cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
          const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
          card.style.setProperty('--rx',`${(-y*5.2).toFixed(2)}deg`);
          card.style.setProperty('--ry',`${(x*5.8).toFixed(2)}deg`);
          card.style.setProperty('--mx',`${(-x*8).toFixed(2)}px`);
          card.style.setProperty('--my',`${(-y*7).toFixed(2)}px`)
        })
      });
      card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset)
    })
  }

  function initVibingVideos(host){
    const videos=qa('video[data-vibe-video]',host);if(!videos.length)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prepare=v=>{if(v.dataset.loaded)return;const source=q('source[data-src]',v);if(source){source.src=source.dataset.src;source.removeAttribute('data-src');v.load()}v.dataset.loaded='1'};
    if(!('IntersectionObserver'in window)){videos.forEach(v=>{prepare(v);if(!reduced)v.play().catch(()=>{})});return}
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const v=entry.target;
      if(entry.isIntersecting){prepare(v);if(!reduced&&entry.intersectionRatio>.2)v.play().catch(()=>{})}
      else v.pause()
    }),{threshold:[0,.2,.55],rootMargin:'240px 0px 240px 0px'});
    videos.forEach(v=>io.observe(v));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause())})
  }

  function renderVibingGallery(){
    const host=q('#vibingWall');if(!host)return;
    host.innerHTML=VIBE_ROWS.map(row=>`<div class="vibe-row cols-${row.length}">${row.map(item=>{
      const media=item.kind==='video'
        ?`<video data-vibe-video muted loop playsinline preload="none" aria-label="${esc(item.title)}"><source data-src="${item.src}" type="video/mp4"></video>`
        :`<img loading="lazy" decoding="async" src="${item.src}" alt="${esc(item.alt||item.title)}">`;
      return `<article class="vibe-item${item.kind==='video'?' is-video':''}"><div class="vibe-media">${media}</div><div class="vibe-meta"><strong>${esc(item.title)}</strong><span>${esc(item.tag)}</span></div></article>`
    }).join('')}</div>`).join('');
    initVibingPerspective(host);initVibingVideos(host)
  }

  function renderTestimonials(){
    const main=q('#testimonialMain'),side=q('#testimonialSide'),logo=q('#clientLogoTrack'),dots=q('#testimonialDots');if(!main||!side||!logo)return;let idx=0,timer;
    const logoClass=t=>t.image.includes('aalap')?'logo-light':(t.image.includes('assets/logos/')?'logo-plain':'');
    const itemHtml=t=>`<div class="client-item ${logoClass(t)}"><img src="${t.image}" alt=""><b>${esc(t.name)}</b></div>`;
    const oneSet=DATA.testimonials.map(itemHtml).join('');logo.innerHTML=`<div class="client-set">${oneSet}</div><div class="client-set" aria-hidden="true">${oneSet}</div>`;
    dots.innerHTML=DATA.testimonials.map((_,i)=>`<i data-i="${i}"></i>`).join('');
    const show=(i,dir=1)=>{idx=(i+DATA.testimonials.length)%DATA.testimonials.length;const t=DATA.testimonials[idx];const light=logoClass(t)?` ${logoClass(t)}`:'';main.innerHTML=`<div class="client-photo${light}"><img src="${t.image}" alt="${esc(t.name)}"></div><div class="testimonial-copy"><blockquote>“${esc(t.quote)}”</blockquote><strong>${esc(t.name)}</strong><small>${esc(t.country)} · ${esc(t.role)}</small></div>`;side.innerHTML=`<div><div class="service">Service</div><h3>${esc(t.service)}</h3></div><p>CLIENT ${String(idx+1).padStart(2,'0')} / ${String(DATA.testimonials.length).padStart(2,'0')}</p>`;qa('i',dots).forEach((d,j)=>d.classList.toggle('active',j===idx));qa('i',dots).forEach(d=>d.onclick=()=>{const next=+d.dataset.i;show(next,next>=idx?1:-1);restart()});const keyframes=[{opacity:.2,transform:`translateX(${dir*14}px)`},{opacity:1,transform:'translateX(0)'}];main.animate(keyframes,{duration:440,easing:'cubic-bezier(.2,.72,.16,1)'});side.animate(keyframes,{duration:480,easing:'cubic-bezier(.2,.72,.16,1)'})};
    const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(idx+1,1),6500)};q('#testimonialPrev').onclick=()=>{show(idx-1,-1);restart()};q('#testimonialNext').onclick=()=>{show(idx+1,1);restart()};show(0,1);restart();q('.testimonial-stage')?.addEventListener('mouseenter',()=>clearInterval(timer));q('.testimonial-stage')?.addEventListener('mouseleave',restart)
  }

  function initCv(){const modal=q('#cvModal');if(!modal)return;const open=()=>modal.showModal();['#openCv','#openCv2','#openCv3'].forEach(s=>q(s)?.addEventListener('click',open));['#closeCv','#closeCv2'].forEach(s=>q(s)?.addEventListener('click',()=>modal.close()));modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})}

  function renderProjectPage(){
    const app=q('#projectApp');if(!app)return;const slug=new URLSearchParams(location.search).get('slug');const all=[...DATA.works,...DATA.videos];const item=all.find(x=>x.slug===slug);if(!item){app.innerHTML='<main class="not-found"><span>PROJECT NOT FOUND</span><h1>THIS CASE STUDY DOESN\'T EXIST.</h1><a href="index.html#work">BACK TO WORK ↗</a></main>';attachInternalLinks(app);return}
    document.title=`${item.title} — Ishtiak Rahman Azmi`;
    const isVideo=!!item.video;const gallery=item.gallery||[];const idx=all.indexOf(item),next=all[(idx+1)%all.length];
    const hero=isVideo?`<video controls playsinline poster="${item.poster}"><source src="${item.video}" type="video/mp4"></video>`:`<img src="${item.image}" alt="${esc(item.title)}">`;
    const notes=(item.designNotes||[]).map(n=>`<div class="note">${esc(n)}</div>`).join('');
    const galleryHtml=gallery.length?`<section class="project-chapter reveal"><div class="chapter-label">05 / VISUALS</div><div class="chapter-content"><h2>Selected project visuals.</h2><p>${gallery.length>4?'The full sequence is included so the work can be judged as a system, not only by the cover.':'Final work and supporting source material are shown together to make the design process easier to understand.'}</p></div></section><section class="gallery reveal">${gallery.map((g,i)=>`<figure><img loading="lazy" src="${g}" alt="${esc(item.title)} visual ${i+1}"><figcaption>${i===0?'Primary / Final Visual':`Visual ${String(i+1).padStart(2,'0')}`}</figcaption></figure>`).join('')}</section>`:'';
    app.innerHTML=`
      <section class="project-hero ${isVideo?'project-video':''} reveal">${hero}<div class="project-title"><div><div class="label">${esc(item.type)} · ${esc(item.year)}</div><h1>${esc(item.title)}</h1></div><p>${esc(item.summary)}</p></div></section>
      <section class="project-meta reveal"><div class="meta-card"><span>Client / Context</span><strong>${esc(item.client)}</strong></div><div class="meta-card"><span>Role</span><strong>${esc(item.role)}</strong></div><div class="meta-card"><span>Deliverables</span><strong>${esc(item.deliverables)}</strong></div><div class="meta-card"><span>Project Type</span><strong>${esc(item.type)}</strong></div></section>
      <section class="project-chapter reveal"><div class="chapter-label">01 / THE BRIEF</div><div class="chapter-content"><h2>${esc(item.brief)}</h2></div></section>
      <section class="project-chapter reveal"><div class="chapter-label">02 / CHALLENGE</div><div class="chapter-content"><p>${esc(item.challenge)}</p></div></section>
      <section class="project-chapter reveal"><div class="chapter-label">03 / DIRECTION</div><div class="chapter-content"><p>${esc(item.approach)}</p></div></section>
      <section class="project-chapter reveal"><div class="chapter-label">04 / DESIGN NOTES</div><div class="chapter-content"><div class="notes-grid">${notes}</div></div></section>
      ${galleryHtml}
      <section class="project-outcome reveal"><span>06 / OUTCOME</span><p>${esc(item.outcome)}</p></section>
      <div class="project-actions reveal"><a href="index.html#work">ALL WORK</a>${item.external?`<a href="${item.external}" target="_blank" rel="noopener">OPEN EXTERNAL ↗</a>`:''}</div>
      <section class="next-project reveal"><div><span>Next case study</span><strong>${esc(next.title)}</strong></div><a href="project.html?slug=${encodeURIComponent(next.slug)}">OPEN NEXT ↗</a></section>`;
    attachInternalLinks(app);observeReveal()
  }

  initTheme();initViewSwitch();initRoleCycler();initClock();initGlobe();renderFeatured();renderFilters();renderProjects();renderVideos();renderVibingGallery();renderTestimonials();initCv();renderProjectPage();attachInternalLinks();observeReveal();
})();
