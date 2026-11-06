// Decision lab: real spacecraft-based maps give fine detail, a seeded warp makes each world its own,
// and one slider takes a world from a molten ball through ash to a finished planet.
import * as THREE from './vendor/three.module.min.js';

const noise = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylor(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylor(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p,int octaves){
  float sum=0.,amp=.5,norm=0.;
  for(int i=0;i<octaves;i++){sum+=amp*snoise(p);norm+=amp;amp*=.5;p=p*2.03+vec3(1.7,9.2,3.1);}
  return sum/norm;
}
float ridged(vec3 p,int octaves){
  float sum=0.,amp=.5,norm=0.;
  for(int i=0;i<octaves;i++){float n=1.-abs(snoise(p));sum+=amp*n*n;norm+=amp;amp*=.5;p=p*2.1+vec3(4.1,1.3,7.7);}
  return sum/norm;
}
vec3 directionAt(vec2 uv){
  float lon=(uv.x-.5)*6.28318530718;
  float lat=(uv.y-.5)*3.14159265359;
  return vec3(cos(lat)*cos(lon),sin(lat),cos(lat)*sin(lon));
}
vec2 uvOf(vec3 d){
  return vec2(atan(d.z,d.x)/6.28318530718+.5,asin(clamp(d.y,-1.,1.))/3.14159265359+.5);
}
`;

const bakeFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D source;
uniform sampler2D lights;
uniform float seed;
uniform float warp;
uniform float spin;
uniform float level;
uniform float contrast;
uniform int recipe;
${noise}
void main(){
  vec3 p=directionAt(vUv);
  vec3 s=p*.9+seed;
  vec3 offset=vec3(fbm(s+1.7,4),fbm(s+6.1,4),fbm(s+11.9,4));
  offset+=.1*vec3(fbm(s*2.4+2.,3),fbm(s*2.4+8.,3),fbm(s*2.4+14.,3));
  vec3 d=normalize(p+offset*warp);
  float c=cos(spin),n=sin(spin);
  d=vec3(d.x*c-d.z*n,d.y,d.x*n+d.z*c);
  vec2 uv=uvOf(d);
  vec3 color=texture2D(source,uv).rgb;
  float lum=dot(color,vec3(.3,.6,.1));
  float mask=0.;
  float ocean=smoothstep(.015,.07,color.b-color.r);
  if(recipe==1){
    mask=ocean;
  } else if(recipe==2){
    float keep=smoothstep(.2,.3,fbm(p*2.6+seed+30.,6)+.24);
    float land=(1.-ocean)*keep;
    float shoal=.5+.62*fbm(p*2.1+seed+4.,6);
    vec3 sea=mix(vec3(.01,.2,.27),vec3(.05,.5,.52),smoothstep(.1,.9,shoal));
    color=mix(sea,color,land);
    mask=1.-land;
  } else if(recipe==3){
    color=mix(vec3(.45,.56,.68),vec3(.97,.99,1.),smoothstep(.1,.75,lum));
    float cracks=pow(ridged(p*3.2+seed,5),9.);
    color=mix(color,vec3(.5,.34,.26),cracks*.85);
  } else if(recipe==4){
    color=vec3(.03,.034,.042)+lum*vec3(.07,.08,.095);
    mask=0.;
  } else if(recipe==5){
    color=mix(vec3(.5,.28,.08),vec3(.98,.76,.44),smoothstep(.15,.9,lum));
  } else if(recipe==6){
    vec3 land=mix(vec3(.05,.2,.09),vec3(.45,.68,.26),smoothstep(.15,.85,lum));
    color=mix(land,mix(vec3(.01,.13,.15),vec3(.04,.33,.3),smoothstep(.04,.34,lum)),ocean);
    mask=ocean;
  } else if(recipe==7){
    vec3 land=mix(vec3(.3,.17,.5),vec3(.93,.66,.84),smoothstep(.15,.85,lum));
    color=mix(land,mix(vec3(.05,.02,.17),vec3(.2,.1,.5),smoothstep(.04,.36,lum)),ocean);
    mask=ocean;
  } else if(recipe==8){
    // Violet glass: the source's own light and dark terrain become lilac highlands and deep indigo basins.
    float t=clamp((lum-level)*contrast+.5,0.,1.);
    float basin=1.-smoothstep(.32,.5,t);
    vec3 high=mix(vec3(.36,.16,.58),vec3(.8,.52,.9),smoothstep(.45,1.,t));
    vec3 low=mix(vec3(.04,.02,.16),vec3(.22,.11,.52),smoothstep(0.,.45,t));
    float vein=smoothstep(.55,.95,ridged(p*4.2+seed,4))*.35;
    color=mix(high,low,basin)+vec3(.25,.55,.9)*vein*(1.-basin);
    mask=basin;
  } else if(recipe==9){
    // Archipelago: only the brightest patches of the source rise above a shallow teal sea.
    float t=clamp((lum-level)*contrast+.5,0.,1.);
    float keep=smoothstep(.15,.35,fbm(p*2.3+seed+30.,5)+.3);
    float land=smoothstep(.56,.62,t)*keep;
    float shoal=smoothstep(.3,.58,t)*keep;
    vec3 sea=mix(vec3(.01,.16,.24),vec3(.06,.55,.55),shoal);
    vec3 ground=mix(vec3(.62,.56,.4),vec3(.2,.42,.22),smoothstep(.62,.9,t));
    color=mix(sea,ground,land);
    mask=1.-land;
  }
  gl_FragColor=vec4(color,mask);
}
`;

const ashFragment = `
precision highp float;
varying vec2 vUv;
uniform float seed;
${noise}
void main(){
  vec3 p=directionAt(vUv);
  vec3 s=p+seed+80.;
  vec3 w=vec3(fbm(s*1.4,3),fbm(s*1.4+5.,3),fbm(s*1.4+9.,3));
  float ash=fbm(s*3.+w,6)*.5+.5;
  float a=ridged(s*3.4+w*.8,6);
  float crack=smoothstep(.56,.82,a*a*1.35);
  float flow=fbm(s*5.+w*1.5,5)*.5+.5;
  float reveal=clamp(fbm(s*1.1+7.,4)*.62+.5,0.,1.);
  gl_FragColor=vec4(ash,crack,reveal,flow);
}
`;

const vertex = `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
void main(){
  vUv=uv;
  vNormal=normalize(mat3(modelMatrix)*normal);
  vec4 world=modelMatrix*vec4(position,1.);
  vWorld=world.xyz;
  gl_Position=projectionMatrix*viewMatrix*world;
}
`;

const planetFragment = `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
uniform sampler2D surface;
uniform sampler2D clouds;
uniform sampler2D ashMap;
uniform sampler2D detailMap;
uniform float hasClouds;
uniform float cloudTurn;
uniform vec3 lightDir;
uniform vec3 rimColor;
uniform vec3 cloudTint;
uniform vec3 flowColor;
uniform float rimPower;
uniform float exposure;
uniform float growth;
uniform int recipe;
vec3 toLinear(vec3 c){return pow(c,vec3(2.2));}
void main(){
  vec3 n=normalize(vNormal);
  vec3 v=normalize(cameraPosition-vWorld);
  float nl=dot(n,lightDir);
  float nv=max(dot(n,v),0.);
  vec4 map=texture2D(surface,vUv);
  vec4 ash=texture2D(ashMap,vUv);
  float molten=1.-smoothstep(.0,.3,growth);
  float cracksAlive=1.-smoothstep(.16,.52,growth);
  float wake=smoothstep(.26,.49,growth);
  float formed=smoothstep(ash.b-.22,ash.b+.22,wake);
  float finished=smoothstep(.48,.80,growth);
  vec3 rock=vec3(.006,.0055,.0055)+ash.r*ash.r*ash.r*vec3(.009,.008,.007)*smoothstep(.18,.5,growth);
  vec3 albedo=mix(rock,toLinear(map.rgb),formed);
  float soft=smoothstep(-.06,.34,nl)*pow(max(nl+.06,0.)/1.06,.7);
  float day=smoothstep(-.05,.2,nl);
  vec3 lit=albedo*(soft*2.3+.0012);
  float cloud=0.;
  if(hasClouds>.5){
    vec2 uv=vUv+vec2(cloudTurn,0.);
    cloud=smoothstep(.14,.9,pow(texture2D(clouds,uv).r,1.35))*finished;
    float shadow=smoothstep(.14,.9,pow(texture2D(clouds,uv+vec2(lightDir.x,-lightDir.y)*.003).r,1.35))*finished;
    lit*=1.-.5*shadow*day;
  }
  if(recipe==1||recipe==2||recipe==6||recipe==7||recipe==8||recipe==9){
    vec3 h=normalize(lightDir+v);
    float nh=max(dot(n,h),0.);
    lit+=vec3(1.,.95,.85)*(pow(nh,700.)*.55+pow(nh,60.)*.03)*map.a*(1.-cloud)*day*formed;
  }
  float finish=smoothstep(.8,1.,growth);
  vec4 detail=texture2D(detailMap,vUv);
  if(recipe!=4){
    float sea=recipe==0||recipe==3||recipe==5?.34:mix(.55,1.,map.a);
    vec3 current=mix(rimColor,flowColor,smoothstep(.38,.7,detail.b));
    vec3 paint=current*(.12+detail.b*detail.b*1.9+detail.r*2.4)*soft*1.5;
    lit=mix(lit,paint,detail.g*finish*sea*.86);
    float grey=dot(lit,vec3(.25,.6,.15));
    lit=max(mix(vec3(grey),lit,1.+finish*.5),vec3(0.));
    lit*=mix(vec3(1.),.62+rimColor*.75,finish*.32);
    lit*=1.+finish*.25;
  }
  if(hasClouds>.5){
    vec3 warm=mix(vec3(1.,.68,.45),vec3(1.),smoothstep(0.,.1,nl));
    lit=mix(lit,cloudTint*warm*(soft*1.9+.0015),cloud*mix(.96,.78,finish));
  }
  vec3 lava=mix(vec3(.9,.12,.01),vec3(1.,.5,.07),ash.g*ash.g);
  vec3 sea=mix(vec3(.2,.012,.002),vec3(.62,.1,.008),ash.a*ash.a);
  lit=mix(lit,sea,molten*molten*(1.-ash.g*.3));
  lit+=lava*ash.g*cracksAlive*(.8+.9*molten);
  if(recipe==4){
    float cities=max(0.,detail.r-.02)*1.3*smoothstep(.32,.62,growth);
    float bloom=texture2D(detailMap,vUv,3.).r*smoothstep(.45,.8,growth);
    vec3 warmth=mix(vec3(1.,.6,.24),vec3(1.,.95,.8),smoothstep(.15,.6,detail.r));
    lit+=warmth*cities*3.6+vec3(1.,.58,.22)*bloom*2.2;
    float network=smoothstep(.62,1.,growth);
    lit+=vec3(.07,.62,.95)*detail.g*network*(.45+.75*day)*1.9;
    lit+=vec3(.14,.8,.92)*detail.b*finish*(.35+.65*day)*1.2;
    lit+=vec3(1.,.42,.06)*detail.a*finish*1.2;
  }
  float side=mix(smoothstep(-.18,.42,nl),1.,molten);
  float rimGain=recipe==4?.2:1.;
  lit+=rimColor*pow(1.-nv,rimPower*1.7)*side*(.9+finish*2.)*rimGain;
  lit+=rimColor*(.9+finish*2.3)*pow(1.-nv,rimPower*4.)*(side*1.6+.03)*rimGain;
  // At 100% a thin luminous band wraps the whole limb, night side included, like the author's references 1 and 3.
  float wrap=pow(1.-nv,5.5)*finish*rimGain;
  lit+=rimColor*wrap*(1.1+side*1.4);
  lit+=mix(rimColor,vec3(1.),.35)*pow(1.-nv,14.)*finish*rimGain*(1.4+side*1.6);
  vec3 mapped=1.-exp(-lit*exposure);
  gl_FragColor=vec4(pow(mapped,vec3(1./2.2)),1.);
}
`;

const haloFragment = `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 lightDir;
uniform vec3 rimColor;
uniform float molten;
uniform float finish;
void main(){
  vec3 n=normalize(vNormal);
  vec3 v=normalize(cameraPosition-vWorld);
  float nv=max(dot(-n,v),0.);
  float edge=pow(nv,mix(3.4,2.4,finish));
  float lit=mix(mix(.02,1.,smoothstep(-.25,.45,dot(n,lightDir))),1.,molten);
  lit=max(lit,finish*.62);
  float gain=mix(.9,1.25,finish);
  gl_FragColor=vec4(rimColor*edge*lit*gain,edge*lit);
}
`;

const ringFragment = `
precision highp float;
varying vec3 vWorld;
varying vec2 vUv;
uniform sampler2D ring;
uniform vec3 lightDir;
uniform vec3 center;
uniform float opacity;
void main(){
  vec4 t=texture2D(ring,vec2(vUv.x,.5));
  vec3 rel=vWorld-center;
  float along=dot(rel,lightDir);
  float perp=length(rel-lightDir*along);
  float shade=along<0.?smoothstep(.97,1.05,perp):1.;
  shade=mix(.03,1.,shade);
  float band=.82+.18*sin(vUv.x*90.)*sin(vUv.x*23.);
  gl_FragColor=vec4(vec3(.86,.77,.62)*band*shade,t.a*.9*opacity);
}
`;

export const recipes = [
  { name: '푸른 대륙', map: 'earth_daymap.jpg', recipe: 1, warp: .34, clouds: true, rim: [.05, .3, 1], rimPower: 3.2, exposure: 1.05 },
  { name: '군도의 바다', map: 'eris_fictional.jpg', recipe: 9, level: .631, contrast: 3.87, warp: .28, clouds: true, rim: [.04, .62, .72], rimPower: 3.2, exposure: 1.1 },
  { name: '초록 숲', map: 'earth_daymap.jpg', recipe: 6, warp: .3, clouds: true, rim: [.16, .72, .42], rimPower: 3.2, exposure: 1.15 },
  { name: '보라 세계', map: 'haumea_fictional.jpg', recipe: 8, level: .58, contrast: 2.61, warp: .3, rim: [.5, .22, 1], rimPower: 3.2, exposure: 1.05 },
  { name: '붉은 사막', map: 'mars.jpg', recipe: 0, warp: .24, rim: [.75, .32, .14], rimPower: 3.6, exposure: .95 },
  { name: '얼음 세계', map: 'moon.jpg', recipe: 3, warp: .2, rim: [.4, .68, .95], rimPower: 3.6, exposure: .8 },
  { name: '고리 행성', map: 'saturn.jpg', recipe: 0, warp: .02, ring: true, rim: [.5, .4, .24], rimPower: 3.6, exposure: 1 },
  { name: '줄무늬 거대 행성', map: 'jupiter.jpg', recipe: 0, warp: .05, rim: [.5, .34, .2], rimPower: 3.4, exposure: 1 },
  { name: '기계 행성', map: 'mercury.jpg', recipe: 4, warp: .22, machine: true, rim: [.8, .5, .23], rimPower: 3.8, exposure: 1 },
  { name: '안개 세계', map: 'venus_atmosphere.jpg', recipe: 5, warp: .18, rim: [.85, .55, .25], rimPower: 2.6, exposure: .92 }
];

export const forms = recipes.map(form => form.name);
export const defaultSeeds = forms.map((_, index) => 11.3 + index * 5.1);
export const stages = [0, 25, 38, 60, 80, 100];
export function snapshotPath(form, growth, seed = defaultSeeds[form]) {
  const stage = stages.reduce((best, value) => Math.abs(value - growth) < Math.abs(best - growth) ? value : best);
  return `assets/bodies/${form}-${seed === defaultSeeds[form] ? '' : 'alt-'}${stage}.webp`;
}

// All costly noise runs only while baking. Per-frame work is texture lookup and light.
const detailFragment = `
precision highp float;
varying vec2 vUv;
uniform float seed;
uniform float machine;
uniform sampler2D lights;
${noise}
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)))+seed)*43758.5453);}
float city(vec2 p,float density){
  vec2 cell=floor(p);
  float result=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 id=cell+vec2(float(x),float(y));
    vec2 h=hash2(id);
    vec2 delta=fract(p)-vec2(float(x),float(y))-h;
    result=max(result,exp(-dot(delta,delta)*40.)*step(1.-density,h.x)*(.3+h.y));
  }
  return result;
}
// A hard core and a soft glow, so a line reads as lit rather than drawn.
float stroke(float d,float width){
  return 1.-smoothstep(width,width*2.2,d)+.2*exp(-d*150.);
}
void main(){
  vec3 p=directionAt(vUv);
  if(machine>.5){
    float lat=asin(p.y),lon=atan(p.z,p.x);
    float colat=1.5708-lat;
    float lower=1.-smoothstep(-.7,.5,p.y);
    // Meridians of uneven length converge on the polar works; width stays even toward the pole.
    float sector=lon*14./6.28318;
    float lane=floor(sector+.5);
    vec2 own=hash2(vec2(mod(lane+14.,14.),3.));
    float toLane=abs(sector-lane)*6.28318/14.*max(cos(lat),.02);
    float reach=smoothstep(-.3-own.x*1.05,-.25-own.x*1.05,lat)*smoothstep(.38,.42,colat);
    float broken=smoothstep(-.42,-.32,fbm(vec3(lane*3.1,lat*3.4,seed),3));
    float lines=stroke(toLane,.0028)*reach*broken;
    // Few latitude bands, each with gaps, and two great circles cutting across.
    for(int i=0;i<3;i++){
      float at=.62-float(i)*.52;
      float gap=step(.18,fract(lon*(2.+float(i))/6.28318+float(i)*.37));
      lines=max(lines,stroke(abs(lat-at),.0026)*gap*.8);
    }
    lines=max(lines,stroke(abs(dot(p,normalize(vec3(.42,.62,.5)))),.0028)*(1.-smoothstep(.1,.3,p.y))*.9);
    lines=max(lines,stroke(abs(dot(p,normalize(vec3(-.55,.38,.62)))),.0026)*(1.-smoothstep(0.,.25,p.y))*.75);
    // Concentric polar works: segmented rings and a band of radial ticks.
    for(int i=0;i<6;i++){
      float radius=.05+float(i)*.066;
      float count=3.+float(i)*3.;
      float arc=fract(lon*count/6.28318+float(i)*.29);
      float width=mod(float(i),2.)<.5?.0038:.0024;
      lines=max(lines,stroke(abs(colat-radius),width)*step(.14,arc)*1.15);
    }
    float tick=step(.62,fract(lon*48./6.28318));
    lines=max(lines,tick*step(.2,colat)*step(colat,.26)*.55);
    // Small bright wedges between the lanes, placed by chance rather than on a grid.
    vec2 grid=vec2(sector*3.1,lat*14.);
    vec2 own2=hash2(floor(grid)+7.);
    vec2 local=fract(grid)-.5;
    if(own2.y>.5)local.y=-local.y;
    float wedge=step(abs(local.x),(local.y+.34)*.42)*step(abs(local.y),.3);
    float panels=step(.91,own2.x)*wedge*smoothstep(.34,.42,colat)*smoothstep(.006,.014,toLane)*(.55+own2.y*.45);
    // A few circular hubs, after the second reference.
    float hubs=0.;
    for(int i=0;i<3;i++){
      float a=float(i)*2.1+seed*.13;
      vec3 center=normalize(vec3(cos(a),-.3+float(i)*.2,sin(a)));
      float d=length(p-center);
      float arc=step(.26,fract(atan(p.y-center.y,p.x-center.x)*1.27));
      hubs=max(hubs,stroke(abs(d-.13),.0032)*arc);
      hubs=max(hubs,stroke(abs(d-.075),.0022)*(1.-arc)*.8);
    }
    // City light gathers along the network and thickens in the lower half, with dark gaps.
    float region=smoothstep(-.16,.22,fbm(p*3.4+seed,5));
    float along=exp(-toLane*26.)*reach;
    float density=region*(.04+.9*lower)+along*.3;
    float cities=city(vUv*vec2(420.,210.),clamp(density,0.,.96));
    cities=max(cities,city(vUv*vec2(240.,120.)+17.,clamp(density*.8,0.,.88))*.95);
    float real=texture2D(lights,vUv+vec2(seed*.031,0.)).r;
    cities=max(cities,smoothstep(.06,.3,real)*lower*.6*region);
    gl_FragColor=vec4(clamp(cities,0.,1.),clamp(lines,0.,1.),panels,clamp(hubs,0.,1.));
  }else{
    // Double domain warp, stretched east to west: broad painted currents with fine filaments inside.
    vec3 q=vec3(fbm(p*1.3+seed,3),fbm(p*1.3+seed+5.2,3),fbm(p*1.3+seed+9.3,3));
    vec3 s=vec3(p.x,p.y*5.,p.z);
    vec3 r=vec3(fbm(s*.7+q*1.2+seed+1.,2),fbm(s*.7+q*1.2+seed+6.,2),fbm(s*.7+q*1.2+seed+11.,2));
    float marble=fbm(s*.7+r*1.5+seed,3)*.5+.5;
    float filament=smoothstep(.76,.98,ridged(s*.62+r*1.6+seed+3.,3));
    float band=1.-smoothstep(.04,.3,abs(p.y+.12+r.x*.3));
    float drift=smoothstep(.1,.5,fbm(p*1.1+seed+21.,2));
    float sheet=clamp(max(band,drift*.6),0.,1.)*smoothstep(.22,.56,marble+band*.14);
    gl_FragColor=vec4(filament,sheet,marble,1.);
  }
}
`;

const machineRingFragment = `
precision highp float;
varying vec2 vUv;
uniform float opacity;
float hash(float x){return fract(sin(x*12.9898)*43758.5453);}
void main(){
  vec2 c=vUv-.5;
  float a=atan(c.y,c.x);
  float across=(length(c)*3.28-1.4)/.24;
  float along=a*9.5493;
  float gap=smoothstep(0.,.05,fract(along))*smoothstep(1.,.95,fract(along));
  float plate=.45+.55*hash(floor(along));
  float light=.5+.5*cos(a-2.5);
  float rail=max(1.-smoothstep(.02,.08,abs(across-.12)),1.-smoothstep(.02,.08,abs(across-.88)));
  vec3 metal=vec3(.17,.145,.11)*plate*(.4+.6*light)*gap;
  metal+=vec3(.36,.3,.21)*rail*(.35+.65*light);
  metal*=.75+.25*step(.5,fract(across*5.));
  float slot=a*38.197;
  float pick=hash(floor(slot)+3.);
  float lane=pick<.5?.12:(pick<.8?.88:.5);
  vec2 lamp=vec2(fract(slot)-.5,(across-lane)*3.4);
  float lamps=step(.5,hash(floor(slot)+9.))*exp(-dot(lamp,lamp)*70.);
  gl_FragColor=vec4(metal+vec3(1.,.62,.24)*lamps*1.8,opacity*(.3+.7*gap));
}
`;


// Maps load on demand: only the shapes on screen are fetched, which matters on a phone.
const sources = {};
const pending = new Map();
function loadSources(names = ['earth_nightmap.jpg', 'saturn_ring_alpha.png']) {
  const loader = new THREE.TextureLoader();
  return Promise.all(names.map(name => {
    if (!pending.has(name)) {
      pending.set(name, loader.loadAsync(new URL('./lab/maps/' + name, import.meta.url).href).then(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        sources[name] = texture;
      }));
    }
    return pending.get(name);
  })).then(() => sources);
}
const smooth = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class RealPlanet {
  constructor(element, onFallback) {
    this.element = element;
    this.onFallback = onFallback;
    this.form = 0;
    this.seed = defaultSeeds[0];
    this.growth = 1;
    this.turn = -.6;
    this.frames = [];
    this.bakes = [];
    this.maps = new Map();
    this.active = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      if (new URLSearchParams(location.search).has('fallback')) throw new Error('정적 모드');
      this.renderer = new THREE.WebGLRenderer({ canvas: element.querySelector('canvas'), alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      this.renderer.setSize(1000, 1000, false);
      this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      this.scene = new THREE.Scene();
      // A common extent keeps every body the same size, including both rings.
      this.camera = new THREE.OrthographicCamera(-2.35, 2.35, 2.35, -2.35, .1, 30);
      this.camera.position.z = 8;
      this.lightDir = new THREE.Vector3(-.78, .34, .52).normalize();
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.uniforms = {
        surface: { value: null }, clouds: { value: null }, ashMap: { value: null }, detailMap: { value: null },
        hasClouds: { value: 1 }, cloudTurn: { value: 0 }, lightDir: { value: this.lightDir },
        rimColor: { value: new THREE.Vector3() }, cloudTint: { value: new THREE.Vector3() }, flowColor: { value: new THREE.Vector3() },
        rimPower: { value: 3.2 }, exposure: { value: 1 }, growth: { value: 1 }, recipe: { value: 1 }
      };
      this.sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: vertex, fragmentShader: planetFragment }));
      this.group.add(this.sphere);
      this.haloUniforms = { lightDir: { value: this.lightDir }, rimColor: this.uniforms.rimColor, molten: { value: 0 }, finish: { value: 0 } };
      this.halo = new THREE.Mesh(new THREE.SphereGeometry(1.065, 80, 56), new THREE.ShaderMaterial({ uniforms: this.haloUniforms, vertexShader: vertex, fragmentShader: haloFragment, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.group.add(this.halo);
      const auraCanvas = document.createElement('canvas');
      auraCanvas.width = auraCanvas.height = 128;
      const c = auraCanvas.getContext('2d');
      const gradient = c.createRadialGradient(64, 64, 26, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255,255,255,.62)');
      gradient.addColorStop(.5, 'rgba(255,255,255,.2)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gradient;
      c.fillRect(0, 0, 128, 128);
      this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(auraCanvas), color: 0xffffff, transparent: true, depthWrite: false }));
      this.aura.scale.set(3.5, 3.5, 1);
      this.aura.position.z = -1.5;
      this.group.add(this.aura);
      this.rings = new THREE.Mesh(new THREE.RingGeometry(1.25, 2.1, 192), new THREE.ShaderMaterial({ uniforms: { ring: { value: null }, lightDir: { value: this.lightDir }, center: { value: new THREE.Vector3() }, opacity: { value: 1 } }, vertexShader: vertex, fragmentShader: ringFragment, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      const positions = this.rings.geometry.attributes.position;
      const uv = this.rings.geometry.attributes.uv;
      for (let i = 0; i < positions.count; i++) uv.setXY(i, (Math.hypot(positions.getX(i), positions.getY(i)) - 1.25) / .85, .5);
      this.rings.rotation.set(-1.21, .18, -.2);
      this.group.add(this.rings);
      this.machineRing = new THREE.Group();
      this.machineRing.rotation.set(-1.15, .18, -.18);
      this.machineRingMaterial = new THREE.ShaderMaterial({ uniforms: { opacity: { value: 0 } }, vertexShader: vertex, fragmentShader: machineRingFragment, side: THREE.DoubleSide, transparent: true });
      const band = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.64, 480), this.machineRingMaterial);
      this.machineRing.add(band);
      const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(.012, .09, .006), new THREE.MeshBasicMaterial({ color: 0x6d5c42, transparent: true }), 96);
      const transform = new THREE.Object3D();
      for (let i = 0; i < 96; i++) {
        const a = i / 96 * Math.PI * 2;
        transform.position.set(Math.cos(a) * 1.68, Math.sin(a) * 1.68, 0);
        transform.rotation.z = a - Math.PI / 2;
        transform.updateMatrix();
        fins.setMatrixAt(i, transform.matrix);
      }
      this.fins = fins;
      this.machineRing.add(fins);
      this.group.add(this.machineRing);
      this.moonOrbits = new THREE.Group();
      this.moons = [];
      for (const [index, radius] of [1.26, 1.49].entries()) {
        const points = [];
        for (let i = 0; i <= 192; i++) {
          const angle = i / 192 * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -.2));
        }
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xa79b81, transparent: true, opacity: .15 }));
        const moon = new THREE.Mesh(new THREE.SphereGeometry(.045, 20, 12), new THREE.MeshBasicMaterial({ color: index ? 0x9b50da : 0xe6af32 }));
        const phase = index ? .6 : 2.4;
        moon.position.set(Math.cos(phase) * radius, Math.sin(phase) * radius, .1);
        this.moonOrbits.add(line, moon);
        this.moons.push(moon);
      }
      this.group.add(this.moonOrbits);
      this.showMoons = element.id !== 'planet';
      this.ready = loadSources().then(sources => {
        if (this.disposed) return;
        this.sources = sources;
        this.rings.material.uniforms.ring.value = sources['saturn_ring_alpha.png'];
        return this.setForm(this.form, this.seed);
      }).catch(error => this.fallback(error.message));
      this.renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        this.fallback('WebGL 컨텍스트 중단');
      });
    } catch (error) {
      this.ready = Promise.resolve();
      this.fallback(error.message);
    }
  }
  bake(fragmentShader, uniforms, width = 2048) {
    const target = new THREE.WebGLRenderTarget(width, width / 2, { depthBuffer: false });
    target.texture.wrapS = THREE.RepeatWrapping;
    target.texture.minFilter = THREE.LinearMipmapLinearFilter;
    target.texture.generateMipmaps = true;
    target.texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader, depthTest: false, depthWrite: false });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    this.renderer.setRenderTarget(target);
    this.renderer.render(scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    this.renderer.setRenderTarget(null);
    geometry.dispose();
    material.dispose();
    return target;
  }
  async getMaps(form, seed = defaultSeeds[form]) {
    const key = `${form}-${seed}`;
    if (this.maps.has(key)) return this.maps.get(key);
    const recipe = recipes[form];
    this.sources = await loadSources(['earth_nightmap.jpg', recipe.map, ...(recipe.clouds ? ['earth_clouds.jpg'] : [])]);
    const start = performance.now();
    const base = { seed: { value: seed }, warp: { value: recipe.warp }, spin: { value: seed * .7 + form }, recipe: { value: recipe.recipe }, level: { value: recipe.level ?? .5 }, contrast: { value: recipe.contrast ?? 1 }, lights: { value: this.sources['earth_nightmap.jpg'] } };
    const surface = this.bake(bakeFragment, { ...base, source: { value: this.sources[recipe.map] } });
    const ash = this.bake(ashFragment, { seed: { value: seed } }, 1024);
    const detail = this.bake(detailFragment, { seed: { value: seed }, machine: { value: recipe.machine ? 1 : 0 }, lights: base.lights });
    const clouds = recipe.clouds ? this.bake(bakeFragment, { ...base, source: { value: this.sources['earth_clouds.jpg'] }, recipe: { value: 0 }, warp: { value: .14 }, seed: { value: seed + 50 } }) : null;
    this.renderer.getContext().finish();
    this.bakes.push({ form, seed, ms: performance.now() - start });
    const maps = { surface, ash, detail, clouds };
    this.maps.set(key, maps);
    for (const [previous, targets] of this.maps) {
      if (previous !== key && previous.startsWith(form + '-')) {
        Object.values(targets).forEach(target => target?.dispose());
        this.maps.delete(previous);
      }
    }
    return maps;
  }
  useForm(form, seed, maps) {
    this.form = form;
    this.seed = seed;
    const recipe = recipes[form];
    this.uniforms.surface.value = maps.surface.texture;
    this.uniforms.ashMap.value = maps.ash.texture;
    this.uniforms.detailMap.value = maps.detail.texture;
    this.uniforms.clouds.value = maps.clouds?.texture ?? maps.surface.texture;
    this.uniforms.hasClouds.value = recipe.clouds ? 1 : 0;
    this.uniforms.cloudTint.value.set(...(recipe.cloudTint ?? [.93, .95, .98]));
    const currents = [[.08,.65,1],[.1,1,.7],[.68,1,.2],[.05,.8,1],[1,.68,.04],[.3,.8,1],[1,.75,.3],[1,.55,.1],[.1,.8,1],[1,.6,.08]];
    this.uniforms.flowColor.value.set(...currents[form]);
    this.uniforms.rimPower.value = recipe.rimPower;
    this.uniforms.exposure.value = recipe.exposure;
    this.uniforms.recipe.value = recipe.recipe;
    this.rings.visible = !!recipe.ring;
    this.machineRing.visible = !!recipe.machine;
    this.sphere.rotation.z = recipe.machine ? -.45 : .2;
    this.sphere.rotation.x = recipe.machine ? .5 : 0;
    this.setGrowth(this.growth * 100);
  }
  async setForm(form, seed = defaultSeeds[form]) {
    if (this.disposed) return;
    this.form = form;
    this.seed = seed;
    this.element.dataset.form = forms[form];
    if (this.isFallback) return this.updateImage();
    const maps = await this.getMaps(form, seed);
    if (form !== this.form || seed !== this.seed) return;
    this.useForm(form, seed, maps);
  }
  setGrowth(value) {
    this.growth = Math.min(100, Math.max(0, value)) / 100;
    if (this.isFallback) return this.updateImage();
    const g = this.growth;
    this.uniforms.growth.value = g;
    const molten = 1 - smooth(0, .3, g);
    this.haloUniforms.molten.value = molten;
    this.haloUniforms.finish.value = smooth(.8, 1, g);
    this.uniforms.rimColor.value.set(.025, .02, .018).lerp(new THREE.Vector3(...recipes[this.form].rim), smooth(.3, .8, g)).lerp(new THREE.Vector3(1, .32, .05), molten);
    this.aura.material.color.setRGB(...recipes[this.form].rim);
    this.aura.material.opacity = smooth(.8, 1, g) * .5;
    this.rings.material.uniforms.opacity.value = smooth(.55, .8, g);
    this.machineRingMaterial.uniforms.opacity.value = smooth(.8, 1, g);
    this.fins.material.opacity = smooth(.8, 1, g);
    this.moonOrbits.visible = this.showMoons && g >= .6;
    this.moonOrbits.children.forEach(object => {
      if (object.material.transparent) object.material.opacity = smooth(.6, .8, g) * .15;
      else object.scale.setScalar(Math.max(.001, smooth(.6, .8, g)));
    });
    this.render();
  }
  updateImage() {
    this.element.querySelector('img').src = new URL(snapshotPath(this.form, this.growth * 100, this.seed), import.meta.url).href;
  }
  fallback(reason) {
    this.stop();
    this.isFallback = true;
    this.element.classList.add('fallback');
    this.updateImage();
    this.onFallback?.(reason);
  }
  render() {
    if (this.isFallback || !this.uniforms.surface.value) return;
    this.sphere.rotation.y = this.turn;
    this.uniforms.cloudTurn.value = this.turn * .04;
    this.renderer.render(this.scene, this.camera);
  }
  snapshot(size = 320) {
    if (this.isFallback) return snapshotPath(this.form, this.growth * 100, this.seed);
    this.render();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    canvas.getContext('2d').drawImage(this.renderer.domElement, 0, 0, size, size);
    return canvas.toDataURL('image/webp', .88);
  }
  start() {
    if (this.active || this.isFallback || this.reduced) return;
    this.active = true;
    this.last = 0;
    const tick = now => {
      if (!this.active) return;
      const dt = this.last ? now - this.last : 16.67;
      if (this.last) this.frames.push(dt);
      if (this.frames.length > 360) this.frames.shift();
      this.turn += Math.min(dt, 50) * .000018;
      if (this.renderPreviews) this.renderPreviews();
      else this.render();
      this.last = now;
      if (this.frames.length === 180 && this.frames.reduce((sum, value) => sum + value, 0) / 180 > 36 && !location.search.includes('webgl')) {
        this.fallback('느린 렌더링 감지');
        return;
      }
      this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }
  stop() {
    this.active = false;
    cancelAnimationFrame(this.frameId);
  }
  dispose() {
    this.disposed = true;
    this.stop();
    this.maps.forEach(maps => Object.values(maps).forEach(target => target?.dispose()));
    this.scene?.traverse(object => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    this.aura?.material.map.dispose();
    this.renderer?.dispose();
  }
}

