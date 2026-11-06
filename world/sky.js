import * as THREE from './vendor/three.module.min.js';
import {snapshotPath} from './planet.js';

// Inside the app the real works are handed over by the page that embeds the sky (see embed.js).
export const projects = window.__storyWorlds ?? [
  {name:'조수의 기록',subtitle:'사라진 바다를 기억하는 사람들.',form:0,growth:100,text:128000,volumes:2,notes:86,today:1280,radius:7.9,angle:2.72},
  {name:'유리 숲의 우편함',subtitle:'아직 도착하지 않은 계절의 편지.',form:3,growth:46,text:46000,volumes:1,notes:42,today:0,radius:5.8,angle:4.62},
  {name:'붉은 역의 밤',subtitle:'마지막 열차를 기다리는 도시.',form:4,growth:73,text:73000,volumes:1,notes:63,today:730,radius:10.4,angle:.38},
  {name:'바람을 수집하는 집',subtitle:'여덟 개의 창문과 서로 다른 하늘.',form:6,growth:31,text:31000,volumes:0,notes:24,today:0,radius:12.1,angle:3.88},
  {name:'이름 없는 물결',subtitle:'첫 문장을 기다리는 작은 빛.',form:1,growth:2,text:1800,volumes:0,notes:9,today:180,radius:3.7,angle:.3},
  {name:'안개의 도서관',subtitle:'책을 빌리면 길 하나가 생기는 곳.',form:9,growth:86,text:186000,volumes:3,notes:119,today:0,radius:13.4,angle:5.5}
];
const random=n=>{
  const x=Math.sin(n*78.233)*43758.5453;
  return x-Math.floor(x);
};
const pointVertex=`
attribute float size;
attribute vec3 tint;
varying vec3 color;
uniform float ratio;
void main(){
  color=tint;
  gl_PointSize=size*ratio;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
`;
const pointFragment=`
varying vec3 color;
void main(){
  float r=length(gl_PointCoord-.5)*2.;
  float a=exp(-r*r*3.)*(1.-smoothstep(.65,1.,r));
  gl_FragColor=vec4(color,a);
}
`;
export class AuthorSky {
  constructor(element,onSelect,reduced) {
    this.element=element;
    this.reduced=reduced;
    this.onSelect=onSelect;
    this.active=false;
    this.frames=[];
    this.time=0;
    this.labels=document.querySelector('#projectLabels');
    this.labels.innerHTML=projects.map((p,i)=>`<button class="project-body" data-project="${i}" aria-label="${p.name} 가까이 보기"><span class="project-caption">${p.name}</span><span class="hover-stats"><span>분량 ${p.text.toLocaleString('ko-KR')}자</span><span>${p.volumes}권 완성</span><span>오늘 ${p.today.toLocaleString('ko-KR')}자</span><span>아이디어 ${p.notes}</span></span></button>`).join('');
    this.labels.onclick=e=>{
      const button=e.target.closest('[data-project]');
      if(button) onSelect(Number(button.dataset.project));
    };
    try {
      this.renderer=new THREE.WebGLRenderer({canvas:element,alpha:false,antialias:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      this.renderer.setClearColor(0x101010,1);
      this.scene=new THREE.Scene();
      this.camera=new THREE.PerspectiveCamera(37,innerWidth/innerHeight,.1,180);
      this.camera.position.set(0,9.5,30);
      this.camera.lookAt(0,0,0);
      this.system=new THREE.Group();
      this.system.rotation.z=-.12;
      this.system.scale.setScalar(.78);
      this.system.position.x=1.5;
      this.scene.add(this.system);
      this.createStars();
      this.createAtmosphere();
      this.createSystem();
      this.resize();
      this.render();
      this.renderer.domElement.addEventListener('webglcontextlost',()=>this.fallback());
    } catch {
      this.fallback();
    }
    window.addEventListener('resize',()=>this.resize());
  }
  points(positions,sizes,colors) {
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
    geometry.setAttribute('tint',new THREE.Float32BufferAttribute(colors,3));
    return new THREE.Points(geometry,new THREE.ShaderMaterial({vertexShader:pointVertex,fragmentShader:pointFragment,uniforms:{ratio:{value:Math.min(devicePixelRatio,1.5)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  }
  createStars() {
    this.depths=[];
    for(let depth=0;depth<3;depth++) {
      const positions=[],sizes=[],colors=[];
      for(let i=0;i<550;i++) {
        const n=i+depth*800;
        positions.push((random(n+1)-.5)*100,(random(n+200)-.5)*60,-20-depth*22);
        sizes.push(.6+Math.pow(random(n+300),5)*(depth===0?3.7:2.3));
        const luminosity=.24+random(n+400)*.58;
        const type=random(n+500);
        colors.push(luminosity,type<.5?luminosity*.83:luminosity*.96,type<.5?luminosity*.65:luminosity);
      }
      const points=this.points(positions,sizes,colors);
      this.depths.push(points);
      this.scene.add(points);
    }
  }
  createAtmosphere() {
    const sprite = (paint, width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 384;
      const c = canvas.getContext('2d');
      c.scale(1.5, 1.5);
      paint(c);
      const body = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      body.scale.set(width, height, 1);
      this.scene.add(body);
      return body;
    };
    const fog = (c, x, y, radius, color, alpha) => {
      const gradient = c.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(' + color + ',' + alpha + ')');
      gradient.addColorStop(.4, 'rgba(' + color + ',' + alpha * .45 + ')');
      gradient.addColorStop(1, 'rgba(' + color + ',0)');
      c.fillStyle = gradient;
      c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };
    this.nebula = sprite(c => {
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 70; i++) {
        const cluster = i % 3;
        const x = [155, 260, 335][cluster] + (random(i + 34000) - .5) * 110;
        const y = [134, 100, 150][cluster] + (random(i + 37000) - .5) * 76;
        fog(c, x, y, 28 + random(i + 41000) * 62, '104,80,53', .018 + random(i + 43000) * .024);
      }
      // Dark lanes interrupt the cloud rather than outlining a tube.
      c.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 8; i++) fog(c, 130 + i * 27, 145 + Math.sin(i * 1.7) * 22, 24, '0,0,0', .25);
    }, 23, 11.5);
    this.nebula.position.set(-21, 6, -59);
    this.galaxy = sprite(c => {
      c.translate(256, 128);
      c.rotate(-.22);
      c.scale(1, .42);
      c.globalCompositeOperation = 'lighter';
      fog(c, 0, 0, 150, '138,119,88', .13);
      for (let arm = 0; arm < 2; arm++) {
        for (let i = 0; i < 380; i++) {
          const t = i / 380;
          const r = 14 + t * 168;
          const angle = t * 5.4 + arm * Math.PI;
          fog(c, Math.cos(angle) * r, Math.sin(angle) * r, 8 + t * 11, '133,117,91', .012 * (1 - t * .65));
        }
      }
      fog(c, 0, 0, 52, '181,155,109', .34);
      fog(c, 0, 0, 19, '216,190,146', .45);
    }, 13, 6.5);
    this.galaxy.position.set(19, -1, -49);
  }
  createSystem() {
    const loader=new THREE.TextureLoader();
    this.bodies=[];
    this.moons=[];
    this.disks=[];
    projects.forEach((project,i)=>{
      const orbit=[];
      for(let j=0;j<=256;j++) {
        const a=j/256*Math.PI*2;
        orbit.push(new THREE.Vector3(Math.cos(a)*project.radius,0,Math.sin(a)*project.radius));
      }
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbit),new THREE.LineBasicMaterial({color:0x9a8870,transparent:true,opacity:.19}));
      this.system.add(line);
      const texture=loader.load(project.preview || snapshotPath(project.form, project.growth, project.seed),()=>this.render());
      texture.colorSpace=THREE.SRGBColorSpace;
      const body=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
      const size=.24+Math.cbrt(project.text/186000)*.75;
      body.scale.set(size*2.35,size*2.35,1);
      this.bodies.push(body);
      this.system.add(body);
      for(let j=0;j<project.volumes;j++) {
        const moon=new THREE.Mesh(new THREE.SphereGeometry(.022,12,8),new THREE.MeshBasicMaterial({color:0x9f9889}));
        this.moons.push({moon,body,radius:size*.48+j*.1,phase:j*2});
        this.system.add(moon);
      }
      if(project.growth<5) {
        const positions=[],sizes=[],colors=[];
        for(let n=0;n<700;n++) {
          const a=random(n+61000)*Math.PI*2,r=.13+random(n+63000)*.25;
          positions.push(Math.cos(a)*r,(random(n+67000)-.5)*.025,Math.sin(a)*r);
          sizes.push(.6+random(n+70000)*1.2);
          colors.push(.14,.08,.03);
        }
        this.disk=this.points(positions,sizes,colors);
        this.diskProject=i;
        this.disks.push({disk:this.disk,index:i});
        this.system.add(this.disk);
      }
    });
    const positions=[],sizes=[],colors=[];
    this.asteroidCount=projects.reduce((sum,p)=>sum+p.notes*18,0);
    for(let n=0;n<20000;n++) {
      const a=random(n+75000)*Math.PI*2;
      const r=8.9+(random(n+78000)-.5)*.65;
      positions.push(Math.cos(a)*r,(random(n+81000)-.5)*.065,Math.sin(a)*r);
      sizes.push(.55+random(n+85000)*1.5);
      const c=.18+random(n+88000)*.22;
      colors.push(c,c*.87,c*.68);
    }
    this.belt=this.points(positions,sizes,colors);
    this.belt.geometry.setDrawRange(0,this.asteroidCount);
    this.system.add(this.belt);
    const starCanvas=document.createElement('canvas');
    starCanvas.width=128;
    starCanvas.height=128;
    const context=starCanvas.getContext('2d');
    const gradient=context.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'#fff9df');
    gradient.addColorStop(.07,'#fff0c4');
    gradient.addColorStop(.11,'#f5cf85');
    gradient.addColorStop(.2,'#c4842f70');
    gradient.addColorStop(.42,'#a56d2c2a');
    gradient.addColorStop(.7,'#a56d2c0c');
    gradient.addColorStop(1,'#a56d2c00');
    context.fillStyle=gradient;
    context.fillRect(0,0,128,128);
    const star=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(starCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    star.scale.set(4.9,4.9,1);
    this.star=star;
    this.system.add(star);
    const tailP=[],tailS=[],tailC=[];
    for(let i=0;i<250;i++) {
      const f=i/250;
      tailP.push(-f*2.3,(random(i+90000)-.5)*f*.12,(random(i+92000)-.5)*f*.15);
      tailS.push(1.4*(1-f)+.4);
      tailC.push((1-f)*.8,(1-f)*.73,(1-f)*.57);
    }
    this.comet=this.points(tailP,tailS,tailC);
    this.comet.visible=projects.some(p=>p.today>0);
    this.system.add(this.comet);
  }
  render() {
    if(!this.renderer||this.isFallback) return;
    const drift=this.reduced?0:Math.sin(this.time*.015)*.035;
    this.camera.position.x=drift;
    const sunButton=document.querySelector('#sunButton');
    if(sunButton&&this.star) {
      const center=this.star.getWorldPosition(new THREE.Vector3()).project(this.camera);
      sunButton.style.left=`${(center.x*.5+.5)*innerWidth}px`;
      sunButton.style.top=`${(-center.y*.5+.5)*innerHeight}px`;
      sunButton.querySelector('.sun-count').textContent=`떠오른 생각 ${projects.reduce((sum,p)=>sum+p.notes,0)}개`;
    }
    projects.forEach((project,i)=>{
      const a=project.angle+this.time*.0007/(i+1);
      const body=this.bodies[i];
      body.position.set(Math.cos(a)*project.radius,0,Math.sin(a)*project.radius);
      const position=body.getWorldPosition(new THREE.Vector3()).project(this.camera);
      const label=this.labels.children[i];
      const px=(position.x*.5+.5)*innerWidth,py=(-position.y*.5+.5)*innerHeight;
      label.style.left=`${px}px`;
      label.style.top=`${py}px`;
      label.dataset.x=px;
      label.dataset.y=py;
      if(innerWidth<760) {
        const offsets=[[-30,42],[-10,-55],[-55,56],[-60,-52],[-45,30],[-40,-70]];
        const [x,y]=offsets[i]||[-20,65];
        const caption=label.querySelector('.project-caption');
        caption.style.left=x+'px';
        caption.style.top=y+'px';
        let leader=label.querySelector('.project-leader');
        if(!leader) {
          leader=document.createElementNS('http://www.w3.org/2000/svg','svg');
          leader.classList.add('project-leader');
          leader.innerHTML='<path d="M22 22L'+(x+28)+' '+(y+(y<0?18:0))+'"/>';
          label.prepend(leader);
        }
      }
      else {
        const caption=label.querySelector('.project-caption');
        caption.style.left='';
        caption.style.top='';
      }
    });
    this.disks.forEach(({disk,index})=>disk.position.copy(this.bodies[index].position));
    this.moons.forEach(({moon,body,radius,phase})=>{
      moon.position.copy(body.position).add(new THREE.Vector3(Math.cos(this.time*.07+phase)*radius,.015,Math.sin(this.time*.07+phase)*radius));
    });
    this.belt.rotation.y=this.time*.0012;
    const crossing=(this.time%38)/38;
    this.comet.visible=projects.some(p=>p.today>0)&&crossing<.15;
    this.comet.position.set(-13+crossing*170,.3,-3+crossing*12);
    this.depths.forEach((points,i)=>points.position.x=drift*(i+1)*.5);
    this.galaxy.position.x=19+drift*.3;
    this.nebula.position.x=-21+drift*.15;
    this.renderer.render(this.scene,this.camera);
  }
  resize() {
    if(this.isFallback||!this.renderer) return;
    this.renderer.setSize(innerWidth,innerHeight,false);
    this.camera.aspect=innerWidth/innerHeight;
    if(innerWidth<760) {
      this.camera.fov=55;
      this.camera.position.set(0,23,48);
      this.camera.lookAt(0,0,0);
      this.system.position.x=0;
    } else {
      this.camera.fov=37;
      this.camera.position.set(0,9.5,30);
      this.camera.lookAt(0,0,0);
      this.system.position.x=1.5;
    }
    this.camera.updateProjectionMatrix();
    this.render();
  }
  refreshProjects() {
    if(!this.isFallback) {
      this.system.traverse(object => {
        object.geometry?.dispose();
        object.material?.map?.dispose();
        object.material?.dispose();
      });
      this.system.clear();
      this.createSystem();
    }
    this.labels.innerHTML=projects.map((p,i)=>`<button class="project-body" data-project="${i}" aria-label="${p.name} 가까이 보기"><span class="project-caption">${p.name.replace(/[<>&]/g,'')}</span><span class="hover-stats"><span>분량 ${p.text.toLocaleString('ko-KR')}자</span><span>${p.volumes}권 완성</span><span>오늘 ${p.today.toLocaleString('ko-KR')}자</span><span>아이디어 ${p.notes}</span></span></button>`).join('');
    const total=projects.reduce((sum,p)=>sum+p.text,0);
    const volumes=projects.reduce((sum,p)=>sum+p.volumes,0);
    const notes=projects.reduce((sum,p)=>sum+p.notes,0);
    document.querySelector('#skyTotals').textContent=`${total.toLocaleString('ko-KR')}자　${volumes}권　${notes}개의 아이디어`;
    document.querySelector('.sky-title p').textContent=`${projects.length}개의 세계가 자라고 있습니다.`;
    if(this.isFallback)this.fallback();
    else this.render();
  }
  syncProject(index,image) {
    projects[index].preview = image;
    if(this.isFallback) return;
    if(this.bodies.length!==projects.length)this.refreshProjects();
    const p=projects[index];
    const texture=new THREE.TextureLoader().load(image,()=>this.render());
    texture.colorSpace=THREE.SRGBColorSpace;
    this.bodies[index].material.map?.dispose();
    this.bodies[index].material.map=texture;
    const size=.24+Math.cbrt(p.text/186000)*.75;
    this.bodies[index].scale.set(size*2.35,size*2.35,1);
    this.asteroidCount=projects.reduce((sum,p)=>sum+p.notes*18,0);
    this.belt.geometry.setDrawRange(0,Math.min(20000,this.asteroidCount));
  }
  start() {
    if(this.active||this.isFallback||this.reduced) return;
    this.active=true;
    this.last=0;
    const tick=now=>{
      if(!this.active) return;
      const dt=this.last?now-this.last:16.67;
      if(this.last) this.frames.push(dt);
      if(this.frames.length>360) this.frames.shift();
      this.time+=Math.min(dt,50)/1000;
      this.render();
      this.last=now;
      if(this.frames.length===180&&this.frames.reduce((a,b)=>a+b,0)/180>36&&!location.search.includes('webgl')) {
        this.fallback();
        return;
      }
      this.frame=requestAnimationFrame(tick);
    };
    this.frame=requestAnimationFrame(tick);
  }
  stop() {
    this.active=false;
    cancelAnimationFrame(this.frame);
  }
  fallback() {
    this.stop();
    this.isFallback=true;
    document.querySelector('#wholeSky').classList.add('static-sky');
    this.labels.querySelectorAll('button').forEach((button,i)=>{
      const positions=[[35,53],[54,44],[78,59],[38,39],[64,54],[74,44]];
      button.style.left=(positions[i]?.[0]||50)+'%';
      button.style.top=(positions[i]?.[1]||70)+'%';
      const project=projects[i];
      button.style.backgroundImage=project.growth<5?'none':`url(${snapshotPath(project.form, project.growth, project.seed)})`;
      button.classList.toggle('disk-fallback',project.growth<5);
      button.style.backgroundSize=((8+Math.cbrt(project.text/186000)*28)*2.35)+'px';
      button.style.backgroundRepeat='no-repeat';
      button.style.backgroundPosition='center';
    });
    if(!this.loadingStaticLayout) {
      this.loadingStaticLayout=true;
      fetch('assets/sky-layout.json').then(response=>response.json()).then(layout=>{
        this.labels.querySelectorAll('button').forEach((button,i)=>{
          if(!layout[i])return;
          button.style.left=layout[i].x*100+'%';
          button.style.top=layout[i].y*100+'%';
        });
      });
    }
  }
}
