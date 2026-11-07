import { RealPlanet as LivingPlanet, forms, defaultSeeds, snapshotPath } from './planet.js?v=03f01c489f26';
import { AuthorSky, projects } from './sky.js?v=03f01c489f26';
import { cast, castFields, appearances } from './cast.js?v=03f01c489f26';
import { applyHeadingMarks, headingsOf } from './headings.js?v=03f01c489f26';


const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const htmlEntities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const escapeHTML=text=>String(text).replace(/[&<>"']/g,character=>htmlEntities[character]);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let selectedProject=0;
const state = {
  section: 'editor',
  chapter: 2,
  unfolded: null,
  growth: 64,
  goalTarget: 100000,
  goalDate: '2027-03-01',
  characterCount: 64000,
  stageRows: false,
  layout: false,
  placement: 'vertical',
  focus: false,
  toolTab: 'type',
  colorTarget: '전체',
  keyword: '전체',
  notesView: 'list',
  markFinished: false,
  bookPage: 0,
  layoutNames: ['집필', '전개와 함께', '넓게 읽기'],
  activeLayoutName: '집필',
  linkedNotes: [],
  recentColors: ['#101010', '#e7dcc4', '#76c7ff', '#3c3b37'],
  typeSize: 17,
  uiSize: 13,
  lineSize: 190,
  paragraphSize: 12,
  writingWidth: 580,
  margin: 24
};
const chapters = [
  { title: '마지막 등대', progress: 100, plot: '등대지기 소하는 바다가 물러난 자리에서 낯선 편지를 발견한다.', thread: '편지에 그려진 지도', gate: '수문이 닫힌 날' },
  { title: '모래 위의 우편함', progress: 100, plot: '배달되지 않은 편지를 모으던 소하는 지도에 없는 항구의 이름을 읽는다.', thread: '사라진 지명', gate: '오래된 열쇠' },
  { title: '물이 없는 항구', progress: 62, plot: '소하는 마른 항구에 도착한다. 물 없는 부두에 배의 그림자 하나가 남아 있다.', thread: '지도 밖의 항구를 발견', gate: '수문지기의 첫 증언' },
  { title: '일곱 번째 물결', progress: 38, plot: '밤마다 같은 시각에 모래가 젖는다. 소하는 그 흔적을 따라 방파제에 간다.', thread: '조수의 시간표', gate: '닫힌 문 너머의 소리' },
  { title: '기억의 수심', progress: 14, plot: '사람들은 자신이 잊은 바다의 색을 서로 다른 말로 설명한다.', thread: '기억으로 완성되는 지도', gate: '수문지기의 선택' },
  { title: '돌아오는 바다', progress: 0, plot: '소하는 마지막 편지를 들고 수문 앞에 선다.', thread: '지도의 끝', gate: '수문을 여는 새벽' }
];

const paragraphs = [
  '항구에 도착했을 때, 바다는 없었다. 소하는 부두 끝에 서서 한때 물이었을 자리를 내려다보았다. 모래 위에는 작은 배의 그림자만 남아 있었다.',
  '바람이 불 때마다 밧줄이 나무 기둥을 두드렸다. 그 소리는 먼 곳에서 누군가 문을 두드리는 것과 닮아 있었다. 소하는 가방 속 편지가 구겨지지 않았는지 손끝으로 살폈다.',
  '「여기가 맞아요?」',
  '대답 대신 노인이 방파제 쪽을 가리켰다. 그 끝에는 오래전에 멈춘 시계가 걸려 있었다. 바늘은 여섯 시와 일곱 시 사이를 가리켰지만 그림자는 조금씩 움직였다.',
  '소하는 지도를 펼쳤다. 종이에는 지금 서 있는 항구가 없었다. 등대와 수문, 오래된 우편함은 있었지만 그 셋을 잇는 길은 누구도 그려 두지 않았다.',
  '「없는 길은 걸으면서 그리면 되지.」',
  '노인은 손바닥에 작은 돌을 올려놓았다. 물속에 오래 있었던 돌처럼 매끄러웠다. 소하는 그것을 받아 주머니에 넣었다. 차가운 감촉이 한동안 손에 남았다.',
  '해가 기울자 모래 위에 희미한 선이 나타났다. 바다가 돌아오는 길일까. 소하는 편지를 꺼내 선 위에 비추었다. 봉투 안쪽에서 푸른빛이 새어 나왔다.',
  '기억하는 사람이 한 명이라도 있다면, 사라진 것은 아직 돌아올 수 있을 것이다. 소하는 그렇게 생각하며 처음으로 지도에 선을 그었다.',
  '먼 수문에서 낮은 종소리가 들려왔다. 소하는 고개를 들었다. 바람은 더 이상 밧줄을 흔들지 않았다. 대신 모래 아래 어딘가에서 물이 흐르는 소리가 들렸다.'
];
const bookContinuations = [
  [
    '수문으로 가는 길은 지도보다 짧았다. 노인은 걸음을 세지 말라고 했다. 걸음을 세기 시작하면 돌아오는 길의 길이가 달라진다는 것이었다. 소하는 주머니 속 돌을 쥔 채 발밑의 흰 모래를 바라보았다.',
    '한때 가게였을 건물 앞에 유리병들이 놓여 있었다. 병마다 다른 빛깔의 모래가 담겨 있었다. 푸른 모래가 든 병 하나에는 아무 이름도 붙어 있지 않았다. 소하가 그 병을 만지자 먼 종소리가 한 번 더 울렸다.',
    '「그건 아직 돌아오지 않은 바다야.」',
    '노인의 목소리는 유리병 안에서 들리는 것처럼 작았다. 소하는 병을 내려놓았다. 손바닥에 묻은 가느다란 모래가 빛을 내다가 사라졌다. 지도 한쪽의 빈자리에 항구 이름의 첫 글자가 떠올랐다.',
    '길 끝에서 아이 하나가 기다리고 있었다. 아이는 손에 작은 배를 들고 있었다. 돛은 없고 밑바닥에는 둥근 구멍이 뚫린 배였다. 소하가 어디로 가느냐고 묻자 아이는 수문 너머를 가리켰다.'
  ],
  [
    '아이는 배를 모래 위에 내려놓았다. 배는 쓰러지지 않았다. 보이지 않는 물결이 받쳐 주는 것처럼 천천히 앞뒤로 흔들렸다. 소하는 무릎을 굽혀 배의 바닥에 귀를 대었다. 노를 젓는 소리가 들렸다.',
    '「안에 누가 있니?」',
    '아이는 고개를 저었다. 안에 있는 것은 사람이 아니라 돌아오지 않은 목소리라고 했다. 소하는 가방에서 편지를 꺼냈다. 봉투의 푸른빛이 배의 그림자에 닿자 노 젓는 소리가 잠시 멎었다.',
    '그때 수문 위의 창 하나가 열렸다. 안쪽은 어두웠지만 창틀에 걸린 흰 손수건은 선명했다. 아이가 손을 흔들었다. 소하도 뒤늦게 손을 들었다. 창문은 닫히지 않았다. 세 사람은 한동안 말없이 서로를 바라보았다.',
    '노인은 먼저 계단을 올랐다. 낡은 계단은 발을 디딜 때마다 젖은 나무 냄새를 풍겼다. 소하는 편지가 든 가방을 품에 안았다. 아이가 놓아둔 배는 계단 아래에서 천천히 원을 그리고 있었다.'
  ],
  [
    '수문 안에는 시계가 없었다. 대신 벽마다 작은 선이 그어져 있었다. 선 옆의 숫자들은 날짜처럼 보이기도 했고 수심처럼 보이기도 했다. 소하는 자신이 아는 조수 시간표를 떠올렸지만 어느 숫자와도 맞지 않았다.',
    '창을 열었던 여자가 탁자에 찻잔 세 개를 놓았다. 찻잔은 비어 있었다. 여자는 빈 잔을 들어 창밖에 비추었다. 그러자 잔 안쪽에서 짙은 푸른빛이 반짝였다. 노인은 아무 말 없이 의자에 앉았다.',
    '「편지를 가져왔어요.」',
    '여자는 봉투를 받지 않았다. 소하의 주머니 쪽을 바라보며 돌부터 꺼내 달라고 했다. 소하는 손바닥을 폈다. 매끄럽던 돌의 표면에 가느다란 물길이 생겨 있었다. 그 물길은 지도에 그린 첫 선과 같은 모양이었다.',
    '누군가 바다를 기억하고 있었다. 소하는 처음으로 그 기억이 자신의 것이 아닐 수도 있겠다고 생각했다. 창밖의 작은 배가 방향을 바꾸었다. 멀리 등대 쪽 하늘에서 아직 켜지지 않은 빛이 희미하게 번졌다.'
  ],
  [
    '여자는 돌을 빈 찻잔에 넣었다. 아주 작은 소리가 났다. 소하는 그 소리가 첫 물방울이 떨어지는 소리인지, 오래 닫혀 있던 자물쇠가 열리는 소리인지 구별하지 못했다. 탁자 위의 그림자가 한 뼘쯤 길어졌다.',
    '봉투 안에는 편지가 없었다. 소하는 빈 봉투를 뒤집어 보았다. 안쪽의 푸른 물결이 종이 밖으로 흘러나와 탁자 가장자리에 닿았다. 노인이 의자를 뒤로 밀었다. 마른 바닥에 물소리가 퍼져 나갔다.',
    '「이제 길을 그릴 수 있겠네.」',
    '소하는 지도를 펼쳤다. 처음에는 선 하나만 보였다. 그다음에는 계단과 작은 배, 유리병이 놓인 가게가 나타났다. 가장 늦게 항구의 이름이 떠올랐다. 소하는 그 이름을 소리 내어 읽었다. 멀리서 누군가 같은 이름을 불렀다.',
    '돌아갈 길은 더 이상 비어 있지 않았다. 소하는 지도를 접지 않고 창가에 놓았다. 첫 물결이 수문 아래에 닿을 때까지 기다릴 생각이었다. 주머니가 가벼워진 자리에서 오래전 잊었던 파도 소리가 들렸다.',
    '지도를 놓아둔 창가에는 작은 물자국이 남았다. 소하는 손수건을 꺼내다가 다시 가방에 넣었다. 이 항구에서 처음 생긴 자국을 바로 지워 버리고 싶지 않았다. 창문 아래에서는 아이가 배를 띄울 자리를 고르고 있었다.',
    '아이는 배를 돌계단의 두 번째 단에 올려놓았다. 아직 물이 닿으려면 한참을 기다려야 했다. 그래도 아이는 손을 떼지 않았다. 소하는 옆에 앉아 배의 둥근 구멍을 들여다보았다. 그 안에 맑은 하늘 한 조각이 고여 있었다.'
  ]
];
const notes = [
  { id: 1, text: '바다는 사라졌지만 조수 시간표는 여전히 맞는다.', keywords: '바다', link: '' },
  { id: 2, text: '기억을 잃을 때마다 지도에서 길 하나가 지워진다면.', keywords: '기억', link: '' },
  { id: 3, text: '젖지 않는 편지. 봉투 안쪽에만 파란 물결이 있다.', keywords: '바다', link: '' },
  { id: 4, text: '수문지기는 자신이 마지막으로 들은 파도 소리를 판다.', keywords: '기억', link: '' },
  { id: 5, text: '마지막 장에서 첫 장의 등대 불빛이 돌아오도록.', keywords: '바다', link: '' }
];
const categories=['이어 쓰기','확인할 것','문장 다듬기'];
const wit={moon:true,save:true,comet:true,empty:true,satellite:true,idea:true};
let writtenCharacters=0;
let lastManuscriptLength=0;
const marks = [
  { id: 1, chapter: 0, paragraph: 1, text: '등대 불빛이 꺼진 시각을 뒤의 시간표와 맞추기.', quote: '소하는 불 꺼진 등대 아래에서 첫 편지를 주웠다.', done: false },
  { id: 2, chapter: 2, paragraph: 4, text: '지도에 항구가 없는 이유를 너무 일찍 밝히지 않기.', quote: paragraphs[4], done: false },
  { id: 3, chapter: 2, paragraph: 7, text: '푸른빛의 출처를 다음 장에 연결하기.', quote: paragraphs[7], done: false }
];
const sections = [
  ['ideas', '아이디어 노트', 'ideas-icon'],
  ['editor', '편집기', 'editor-icon'],
  ['plot', '플롯', 'plot-icon'],
  ['board', '작업보드', 'board-icon'],
  ['cast', '인물·장소', 'cast-icon'],
  ['analysis', '다른 작품 분석', 'analysis-icon'],
  ['universe', '우주로', 'universe-icon']
];
marks.forEach((mark,index)=>mark.category=categories[index%categories.length]);
let sampleChapters;
const sampleNotes=structuredClone(notes);
const sampleMarks=structuredClone(marks);
const projectDocuments=new Map();
let inWorkspace = false;
let entryAnimation = null;
let flightPending = false;
let toastTimer;
let saveTimer;
let dockTimer;
let dragNote = null;
let switchingWorld = false;
let pendingWorld = 0;
let draggedWorld = false;
let focusSavedTheme = 'night';
let savedScroll = 0;
let bookSelection = null;
let colorH = 220;
let colorS = 48;
let colorL = 13;
let previousColor = '#101010';
let layoutSnapshot;
const manuscriptBodies = new Map();
const savedLayouts = new Map();
const stageNames = ['발단', '전개', '위기', '절정', '결말'];
chapters.forEach(chapter => {
  chapter.stages = stageNames.map((name, index) => index === 0 ? '마른 항구에 도착한다.' : '다음 전개를 적으세요.');
});
sampleChapters=structuredClone(chapters);

window.mockDiagnostics = { fallback: null, transitionFrames: [], transitionDuration: 0, planet: null };
const planet = new LivingPlanet($('#planet'), reason => {
  document.documentElement.dataset.performance = 'static';
  window.mockDiagnostics.fallback = reason;
});
window.mockDiagnostics.planet = planet;
// Static snapshots are generated from this exact shader during local verification.
if (new URLSearchParams(location.search).has('fallback')) planet.fallback('검증용 정적 모드');
planet.stop();
const random = seed => {
  const x = Math.sin(seed * 72.731) * 43758.5453;
  return x - Math.floor(x);
};
$('#stars').innerHTML = Array.from({ length: 110 }, (_, index) => `<i class="${index % 17 === 0 ? 'bright' : ''}" style="left:${random(index + 1) * 100}%;
top:${random(index + 200) * 100}%">
</i>`).join('');

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $('#toast').hidden = true;
  }, 2600);
}
function saved() {
  $('#saveStatus').textContent = '저장 중';
  $('#saveStatus').classList.toggle('saving', wit.save && !reduced);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    $('#saveStatus').textContent = '저장됨';
    $('#saveStatus').classList.remove('saving');
    if(wit.save&&!reduced) {
      $('#saveStatus').classList.remove('save-orbit');
      void $('#saveStatus').offsetWidth;
      $('#saveStatus').classList.add('save-orbit');
    }
  }, 550);
}
function updateGrowth(value) {
  state.growth = Number(value);
  state.characterCount = Math.round(state.goalTarget * state.growth / 100);
  const percentage = Number(state.growth.toFixed(1));
  if(!inWorkspace) planet.setGrowth(Math.min(100,state.growth));
  else {
    planet.growth=Math.min(100,state.growth)/100;
    if(planet.uniforms)planet.uniforms.growth.value=planet.growth;
  }
  $('#growth').value = value;
  $('#growth').style.setProperty('--growth-stop', `${Math.min(100, value)}%`);
  $('#growthValue').textContent = `${percentage}%`;
  $('.growth-control').style.setProperty('--growth', Math.min(100, value));
  $('#universeCount').textContent = `${state.characterCount.toLocaleString('ko-KR')}자`;
  $('.project-stats span:nth-child(2) strong').textContent=(projects[selectedProject].chapters??chapters.length)+'장';
  $('.project-stats span:nth-child(3) strong').textContent=projects[selectedProject].today.toLocaleString('ko-KR')+'자';
  const dashboardRows=$$('.dashboard-row');
  $('span:last-child',dashboardRows[0]).textContent=projects[selectedProject].today.toLocaleString('ko-KR')+' / 1,500자';
  $('.daily-bar i').style.width=Math.min(100,projects[selectedProject].today/1500*100)+'%';
  $('span:last-child',dashboardRows[1]).textContent=projects[selectedProject].isNew?'약 0분':'약 8분';
  $('span:last-child',dashboardRows[2]).textContent=projects[selectedProject].isNew?'약 0쪽':'약 128쪽';
  $$('.outline-row').forEach(button=>button.hidden=!!projects[selectedProject].isNew);
  renderThreads();
  $('#goalCount').textContent = `${state.characterCount.toLocaleString('ko-KR')}자`;
  $('.goal-numbers > span:nth-child(3)').textContent=state.goalTarget.toLocaleString('ko-KR')+'자까지';
  $('#goalPercent').textContent = `${percentage}%의 세계`;
  $('#goalArc').style.strokeDashoffset = 224 * (1 - Math.min(100, value) / 100);
  $('.quiet-orbit span').textContent = state.characterCount >= state.goalTarget ? '목표 궤도에 도착했습니다.' : `다음 궤도까지 ${(state.goalTarget - state.characterCount).toLocaleString('ko-KR')}자`;
  const g = Math.min(100, Number(value));
  $$('.growth-control > div span').forEach((element, index) => element.textContent = ['용융', '표면', '완성'][index]);
  $('#growthCaption').textContent = g < 18 ? '뜨거운 빛에서 시작합니다.' : g < 30 ? '검은 재 사이로 균열이 빛납니다.' : g < 50 ? forms[planet.form] + '의 색이 깨어납니다.' : g < 80 ? '구름과 대기가 자리를 잡습니다.' : g < 100 ? '이 세계만의 빛이 깊어집니다.' : '하나의 세계가 완성되었습니다.';
  const volumes = projects[selectedProject]?.volumes || 0;
  $$('.orbit-moon').forEach((moon, index) => {
    moon.hidden = index >= volumes || g < 60;
    moon.style.opacity = String(Math.min(1, (g - 60) / 20));
    moon.title = (index + 1) + '권 완성';
  });
  $('.planet-orbit-field').style.opacity = String(Math.max(0, Math.min(1, (g - 55) / 25)));

}
$('#growth').addEventListener('input', event => updateGrowth(event.target.value));
updateGrowth(100);
// Prepare the translucent atmosphere layer before the first flight.
$('#cloudVeil').hidden = false;
$('#cloudVeil').inert = true;
$('#cloudVeil').style.opacity = '.001';

function renderChapters() {
  $('#chapterList').innerHTML = chapters.map((chapter, index) => `<div class="chapter-entry" data-chapter="${index}">
<div class="chapter-row ${state.chapter === index ? 'selected' : ''}${wit.satellite && chapter.progress >= 100 ? ' complete' : ''}" style="--fill:${chapter.progress}">
<button class="chapter-select" data-select="${index}" aria-expanded="${state.unfolded === index}">
<span class="chapter-star">✦</span>
<span class="title">${index + 1}. ${escapeHTML(chapter.title)}</span>
</button>
<button class="chapter-progress" data-progress="${index}" aria-label="${escapeHTML(chapter.title)} 목표 ${chapter.progress}%">
<span>
<i>
</i>
</span>
</button>
</div>${state.unfolded === index ? `<div class="chapter-unfold">
<p>${escapeHTML(chapter.plot)}</p>
<div>
<button class="detail-open" data-detail="${index}">세부 전개</button>
<button class="fold-chapter" data-fold="${index}" aria-label="내용 접기">⌃</button>
</div>
</div>` : ''}</div>`).join('');
}
function renderManuscript() {
  const chapter = chapters[state.chapter];
  $('#chapterHeading').textContent = `제${state.chapter + 1}장　${chapter.title}`;
  $('#manuscript').innerHTML = chapterBody(state.chapter);
  $$('.memo-mark',$('#manuscript')).forEach(element=>{
    const memo=marks.find(mark=>mark.id===Number(element.dataset.memo));
    if(memo?.done)element.replaceWith(...element.childNodes);
  });
  $$('[data-paragraph]', $('#manuscript')).forEach(paragraph => {
    const marked = marks.some(mark => mark.chapter === state.chapter && mark.paragraph === Number(paragraph.dataset.paragraph) && !mark.done && !mark.selection);
    paragraph.classList.toggle('has-work-mark', marked);
  });
  $('#manuscript').dataset.placeholder=wit.empty?'아직 아무도 착륙하지 않은 곳입니다.':'첫 문장을 적으세요.';
  lastManuscriptLength=$('#manuscript').textContent.length;
  $('#wordCount').textContent=lastManuscriptLength.toLocaleString('ko-KR')+'자';
  $('#writingScroll').scrollTop = 0;
  renderThreads();
  renderOutline();
}
function selectChapter(index, unfold = true) {
  state.chapter = index;
  state.unfolded = unfold ? (state.unfolded === index ? null : index) : state.unfolded;
  renderChapters();
  renderManuscript();
  if (!$('#plotBar').hidden) renderPlotBar();
}
$('#chapterList').addEventListener('click', event => {
  const select = event.target.closest('[data-select]');
  const progress = event.target.closest('[data-progress]');
  const fold = event.target.closest('[data-fold]');
  const detail = event.target.closest('[data-detail]');
  if (select) selectChapter(Number(select.dataset.select));
  if (progress) chapterPopover(progress, Number(progress.dataset.progress));
  if (fold) {
    state.unfolded = null;
    renderChapters();
  }
  if (detail) {
    state.chapter = Number(detail.dataset.detail);
    $('#plotBar').hidden = false;
    renderPlotBar();
    if (state.layout) measureGuides();
  }
});
function renderThreads() {
  const names=projects[selectedProject].isNew?[]:['잃어버린 지도','닫힌 수문',...state.linkedNotes.map(note=>note.text)];
  $('#dashboardThreads').innerHTML=names.map(text=>`<div class="thread-item">${escapeHTML(text)}</div>`).join('');
}
function renderPlotBar() {
  const chapter = chapters[state.chapter];
  $('#plotBar').innerHTML = `<div class="pane-head">
<span>세부 전개</span>
<button class="pane-link" data-plot-table>플롯 표</button>
<button id="closePlotBar" aria-label="세부 전개 접기">⌃</button>
</div>
<div class="thread-list">${chapter.lines.map((line, index) => `<div class="thread-item">${pathBadge(line.path)}<button data-thread-open="${index}">${escapeHTML(line.text || '연결 내용을 적으세요.')}</button></div>`).join('')}${state.linkedNotes.map(note => `<div class="linked-note">✦ ${escapeHTML(note.text)}</div>`).join('')}</div>
<details>
<summary>메인 플롯</summary>
<p contenteditable="true" data-live-summary>${escapeHTML(chapter.plot)}</p>
</details><details><summary>발단~결말</summary>${stageNames.map((stage,index)=>`<div class="stage-beat"><span>${stage}</span><p contenteditable="true" data-live-stage="${index}">${escapeHTML(chapter.stages?.[index]||'다음 전개를 적으세요.')}</p></div>`).join('')}</details>`;
  $('#closePlotBar').onclick = () => {
    $('#plotBar').hidden = true;
    if (state.layout) measureGuides();
  };
  $('[data-live-summary]').addEventListener('input', event => {
    chapter.plot = event.target.textContent;
    renderChapters();
    saved();
  });
  $$('[data-live-stage]').forEach(cell => {
    cell.oninput = () => {
      chapter.stages ||= stageNames.map(() => '');
      chapter.stages[Number(cell.dataset.liveStage)] = cell.textContent;
      saved();
    };
  });
  $$('[data-thread-open]').forEach(button => {
    button.onclick = () => {
      const line = chapter.lines[Number(button.dataset.threadOpen)];
      openPopover(button, `<button class="main-action" id="saveThreadBeat">연결 내용 저장</button>
<textarea id="threadBeat" aria-label="실의 연결 내용" style="width:100%;
min-height:70px;
padding:4px">${escapeHTML(line.text)}</textarea>`);
      $('#saveThreadBeat').onclick = () => {
        line.text = $('#threadBeat').value;
        renderPlotBar();
        saved();
        closePopover();
      };
    };
  });
}
function chapterPopover(anchor, index) {
  const chapter = chapters[index];
  chapter.goal ||=4000;
  openPopover(anchor, `<button class="main-action" id="chapterComplete">${chapter.progress === 100 ? '완료 해제' : '챕터 완료'}</button>
<label>목표<input id="chapterGoal" type="number" min="1" value="4000">자</label>
<div class="number-row">
<span>진행</span>
<span>${chapter.progress}%</span>
</div>
<input id="chapterFill" aria-label="챕터 진행률" type="range" min="0" max="100" value="${chapter.progress}" style="width:100%">
<p>분량이 차오를수록 행의 빛이 깊어집니다.</p>`, 'beside');
  $('#chapterComplete').onclick = () => {
    chapter.progress = chapter.progress === 100 ? 62 : 100;
    renderChapters();
    closePopover();
    saved();
  };
  $('#chapterFill').oninput = event => {
    chapter.progress = Number(event.target.value);
    $('.number-row span:last-child', $('#popover')).textContent = `${chapter.progress}%`;
    renderChapters();
  };
  $('#chapterGoal').value=chapter.goal;
  $('#chapterGoal').onchange=()=>{
    chapter.goal=Math.max(1,Number($('#chapterGoal').value)||4000);
    saved();
  };
}

function openPopover(anchor, html, placement = 'below') {
  $('#popover').classList.remove('wide');
  $('#popover').innerHTML = html;
  $('#popover').hidden = false;
  const bounds = anchor.getBoundingClientRect();
  const box = $('#popover').getBoundingClientRect();
  const left = placement === 'beside' ? bounds.right + 6 : bounds.right - box.width;
  $('#popover').style.left = `${Math.max(6, Math.min(innerWidth - box.width - 6, left))}px`;
  $('#popover').style.top = `${Math.max(6, Math.min(innerHeight - box.height - 6, placement === 'beside' ? bounds.top : bounds.bottom + 4))}px`;
}
function closePopover() {
  $('#popover').hidden = true;
}
document.addEventListener('pointerdown', event => {
  if (!$('#popover').hidden && !event.target.closest('#popover') && !event.target.closest('#layoutButton, #viewButton, #goalButton, .chapter-progress')) closePopover();
  if (!event.target.closest('#library, #libraryButton, #libraryEdge')) $('#library').classList.remove('open');
});
function dialog(html, focusSelector) {
  closePopover();
  $('#dialog').innerHTML = html;
  $('#modalShade').hidden = false;
  $(focusSelector || 'input, textarea, button', $('#dialog'))?.focus();
}
function closeDialog() {
  previewPlanet?.dispose();
  previewPlanet = null;
  $('#dialog').classList.remove('form-dialog');
  $('#dialog').removeAttribute('aria-busy');
  $('#modalShade').hidden = true;
}
$('#modalShade').addEventListener('pointerdown', event => {
  if (event.target === $('#modalShade')) closeDialog();
});
$('#modalShade').addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const items = $$('button, input, textarea, select', $('#dialog')).filter(item => !item.disabled);
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function themeToggle() {
  const apply = () => {
    ['--bg', '--panel', '--paper', '--text', '--accent'].forEach(token => document.documentElement.style.removeProperty(token));
    ['#library', '#chaptersPane', '#plotBar', '#manuscriptPane', '#dashboard'].forEach(selector => {
      $(selector).style.backgroundColor = '';
    });
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
    $('#themeButton').textContent = document.documentElement.dataset.theme === 'night' ? '낮으로' : '밤으로';
    $('#themeEntry').textContent = `집필 화면: ${document.documentElement.dataset.theme === 'night' ? '밤' : '낮'}`;
    if (state.layout) measureGuides();
  };
  if (!reduced && inWorkspace && document.startViewTransition) {
    return document.startViewTransition(apply).updateCallbackDone;
  }
  apply();
  return Promise.resolve();
}
$$('[data-action="theme"]').forEach(button => {
  button.onclick = themeToggle;
});

let zoom=0;
let zoomStart=null;
let flightToSky=null;
let entrySection='editor';
const sunButton=document.createElement('button');
sunButton.id='sunButton';
sunButton.className='sun-body';
sunButton.setAttribute('aria-label','아이디어 노트 열기');
sunButton.innerHTML='<span class="sun-rays" aria-hidden="true"></span><span class="sun-caption"><strong>아이디어 노트</strong><span class="sun-count"></span></span>';
$('#wholeSky').append(sunButton);
sunButton.onclick=async()=>{
  sunButton.classList.add('flaring');
  entrySection='ideas';
  await selectWorld(0,false);
  await enterWorld();
  sunButton.classList.remove('flaring');
};
$('#skyIdeas').onclick=()=>sunButton.click();
const sky=new AuthorSky($('#skyCanvas'),index=>selectWorld(index),reduced);
window.mockDiagnostics.sky=sky;
if(new URLSearchParams(location.search).has('fallback')) sky.fallback();
sky.start();
$('#planet').style.visibility='hidden';
$('#universe').hidden=true;
$('#skyNew').onclick=()=>chooseForm(true);
$('#planetForm').onclick=()=>chooseForm(false);
$('#skyBack').onclick=flyOut;

async function selectWorld(index,animate=true,target=1) {
  openProjectDocuments(index);
  selectedProject=index;
  const project=projects[index];
  const button=$('[data-project="'+index+'"]');
  const rect=button.getBoundingClientRect();
  zoomStart={left:rect.left+rect.width/2-20,top:rect.top+rect.height/2-20,width:40,height:40};
  $('#worldTitle').textContent=project.name;
  $('.universe-title p').textContent=project.subtitle;
  $('.project-name').textContent=project.name;
  $('#planetHit').setAttribute('aria-label',project.name+' 집필하기');
  state.goalTarget=Math.max(100000,Math.round(project.text/Math.max(1,project.growth)*100));
  updateGrowth(project.growth);
  await planet.setForm(project.form,project.seed??defaultSeeds[project.form]);
  updateGrowth(project.growth);
  $('#planet').style.visibility='visible';
  $('#universe').hidden=false;
  if(animate&&!reduced) {
    const begin=zoom;
    await zoomFlight(begin,1);
  } else setZoom(target);
  updateNeighbors();
  if(target===1) sky.stop();
  if(!reduced) planet.start();
}
function setZoom(value) {
  zoom=Math.max(0,Math.min(1,value));
  sky.bodies?.forEach((body,index)=>body.visible=!(index===selectedProject&&zoom>0));
  $('#wholeSky').hidden=zoom===1;
  $('#universe').hidden=zoom===0;
  $('#planet').style.visibility=zoom===0?'hidden':'visible';
  $('#universe').style.opacity=String(Math.max(0,(zoom-.45)/.55));
  $('#wholeSky').style.opacity=String(1-zoom);
  $('#wholeSky').style.transform='scale('+(1+zoom*.35)+')';
  const target=universeRect();
  if(zoomStart&&zoom<1) {
    const lerp=(a,b)=>a+(b-a)*zoom;
    Object.assign($('#planet').style,{left:lerp(zoomStart.left,target.left)+'px',top:lerp(zoomStart.top,target.top)+'px',width:lerp(zoomStart.width,target.width)+'px',height:lerp(zoomStart.height,target.height)+'px'});
  }
  $('#wholeSky').inert=zoom>.8;
  $('#universe').inert=zoom<.8;
}
function zoomFlight(from,to) {
  cancelAnimationFrame(flightToSky);
  if(reduced){setZoom(to);return Promise.resolve();}
  return new Promise(resolve=>{
    const start=performance.now();
    const tick=now=>{
      const t=Math.min(1,(now-start)/(matchMedia('(max-width: 760px)').matches ? 420 : 700));
      let lo=0;
      let hi=1;
      for(let i=0;i<12;i++) {
        const u=(lo+hi)/2;
        const x=3*(1-u)*(1-u)*u*.2+3*(1-u)*u*u*.18+u*u*u;
        if(x<t)lo=u;
        else hi=u;
      }
      const u=(lo+hi)/2;
      const ease=t===1?1:3*(1-u)*(1-u)*u*.75+3*(1-u)*u*u+u*u*u;
      setZoom(from+(to-from)*ease);
      if(t<1) flightToSky=requestAnimationFrame(tick);
      else resolve();
    };
    flightToSky=requestAnimationFrame(tick);
  });
}
async function flyOut() {
  planet.stop();
  projects[selectedProject].growth=state.growth;
  projects[selectedProject].text=state.characterCount;
  if(!planet.isFallback) {
    planet.render();
    sky.syncProject(selectedProject,planet.snapshot());
  }
  sky.start();
  await zoomFlight(zoom,0);
  $('#planet').style.visibility='hidden';
}
let previewPlanet=null;
function openProjectDocuments(index) {
  if(index===selectedProject) return;
  projectDocuments.set(selectedProject,{
    chapters:structuredClone(chapters),
    notes:structuredClone(notes),
    marks:structuredClone(marks),
    linkedNotes:structuredClone(state.linkedNotes),
    bodies:new Map(manuscriptBodies),
    chapter:state.chapter
  });
  const empty=projects[index].isNew;
  const model=projectDocuments.get(index)||{
    chapters:empty?[{title:'첫 장',progress:0,plot:'첫 전개를 적으세요.',thread:'',gate:'',stages:stageNames.map(()=> '')}]:structuredClone(sampleChapters),
    notes:empty?[]:structuredClone(sampleNotes),
    marks:empty?[]:structuredClone(sampleMarks),
    linkedNotes:[],
    bodies:empty?new Map([[0,'']]):new Map(),
    chapter:empty?0:2
  };
  chapters.splice(0,chapters.length,...model.chapters);
  notes.splice(0,notes.length,...model.notes);
  marks.splice(0,marks.length,...model.marks);
  manuscriptBodies.clear();
  model.bodies.forEach((body,key)=>manuscriptBodies.set(key,body));
  state.chapter=model.chapter;
  state.linkedNotes=model.linkedNotes;
  state.unfolded=null;
  renderChapters();
  renderManuscript();
  if(!$('#plotBar').hidden)renderPlotBar();
}
async function chooseForm(isNew) {
  const initialForm=planet.form;
  const initialSeed=planet.seed;
  let chosen=initialForm;
  const seeds=[...defaultSeeds];
  seeds[chosen]=initialSeed;
  dialog('<button class="primary" id="applyForm">'+(isNew?'이 세계로 시작하기':'이 모양으로 바꾸기')+'</button>'+(isNew?'<label>작품 이름<input id="newWorldName" placeholder="새 작품의 이름"></label>':'')+'<div class="form-options">'+forms.map((name,i)=>'<div class="form-option"><button data-form="'+i+'" aria-pressed="'+(i===chosen)+'"><canvas width="144" height="144"></canvas><span>'+name+'</span></button><button data-seed="'+i+'">다른 모양</button></div>').join('')+'</div><p class="small-copy">'+(isNew?'첫 문장 전의 모습':'현재 성장 '+state.growth+'%의 모습')+'</p>',isNew?'#newWorldName':'#applyForm');
  $('#dialog').classList.add('form-dialog');
  $('#applyForm').disabled = true;
  $('.form-options').inert = true;
  const previewCaption = $('.small-copy', $('#dialog'));
  const readyCaption = previewCaption.textContent;
  previewCaption.textContent = '세계를 준비하고 있습니다.';
  $('#dialog').setAttribute('aria-busy', 'true');
  const holder=document.createElement('div');
  holder.innerHTML='<img alt=""><canvas></canvas>';
  previewPlanet=new LivingPlanet(holder);
  const preview=previewPlanet;
  const canvases=$$('.form-option canvas');
  preview.renderer?.setPixelRatio(1);
  preview.renderer?.setSize(144,144,false);
  preview.stop();
  const cache=[];
  await preview.ready;
  if (preview !== previewPlanet || $('#modalShade').hidden) return;
  if(!preview.isFallback) await Promise.all(forms.map(async (_,i)=>{cache[i]=await preview.getMaps(i,seeds[i]);}));
  if (preview !== previewPlanet || $('#modalShade').hidden) return;
  $('#applyForm').disabled = false;
  $('.form-options').inert = false;
  previewCaption.textContent = readyCaption;
  $('#dialog').removeAttribute('aria-busy');
  function renderPreviews() {
    if ($('#modalShade').hidden || preview !== previewPlanet) return preview.stop();
    for (let i = 0; i < forms.length; i++) {
      if (preview.isFallback) continue;
      preview.useForm(i, seeds[i], cache[i]);
      preview.setGrowth(isNew ? 0 : state.growth);
      const context = canvases[i].getContext('2d');
      context.clearRect(0, 0, 144, 144);
      context.drawImage(preview.renderer.domElement, 0, 0);
    }
  }
  if (preview.isFallback) {
    canvases.forEach((canvas, i) => {
      const image = new Image();
      image.onload = () => canvas.getContext('2d').drawImage(image, 0, 0, 144, 144);
      image.src = snapshotPath(i, isNew ? 0 : state.growth, seeds[i]);
    });
  } else {
    renderPreviews();
    preview.renderPreviews = renderPreviews;
    if (!reduced) preview.start();
  }
  $$('[data-form]').forEach(button=>button.onclick=()=>{
    chosen=Number(button.dataset.form);
    $$('[data-form]').forEach(item=>item.setAttribute('aria-pressed',item===button));
  });
  $$('[data-seed]').forEach(button=>button.onclick=async()=>{
    const i=Number(button.dataset.seed);
    chosen=i;
    $$('[data-form]').forEach(item=>item.setAttribute('aria-pressed',Number(item.dataset.form)===i));
    seeds[i]=preview.isFallback?(seeds[i]===defaultSeeds[i]?defaultSeeds[i]+17:defaultSeeds[i]):seeds[i]+17;
    button.disabled=true;
    if(!preview.isFallback) cache[i]=await preview.getMaps(i,seeds[i]);
    if(!preview.isFallback) renderPreviews();
    else {
      const image=new Image();
      image.onload=()=>{
        const ctx=canvases[i].getContext('2d');
        ctx.clearRect(0,0,144,144);
        ctx.drawImage(image,0,0,144,144);
      };
      image.src = snapshotPath(i, isNew ? 0 : state.growth, seeds[i]);
    }
    button.disabled=false;
  });
  $('#applyForm').onclick=async()=>{
    const name=isNew?$('#newWorldName').value.trim()||'첫빛의 항구':projects[selectedProject].name;
    if(isNew) {
      projects.push({name,subtitle:'이 세계의 첫 문장을 시작합니다.',form:chosen,seed:seeds[chosen],growth:0,text:0,volumes:0,notes:0,today:0,radius:14,angle:1.1,isNew:true});
      openProjectDocuments(projects.length-1);
      selectedProject=projects.length-1;
      state.goalTarget=100000;
      zoomStart={left:innerWidth/2,top:innerHeight/2,width:20,height:20};
      $('#worldTitle').textContent=name;
      $('.universe-title p').textContent=projects[selectedProject].subtitle;
      $('.project-name').textContent=name;
      updateGrowth(0);
      setZoom(1);
      sky.stop();
    }
    projects[selectedProject].form=chosen;
    projects[selectedProject].seed=seeds[chosen];
    window.dispatchEvent(new CustomEvent('planet-shape', { detail: { id: projects[selectedProject].id, form: chosen, seed: seeds[chosen] } }));
    preview.stop();
    closeDialog();
    await planet.setForm(chosen,seeds[chosen]);
    updateGrowth(state.growth);
    sky.refreshProjects();
    if(!planet.isFallback)sky.syncProject(selectedProject,planet.snapshot());
    updateNeighbors();
    if(!reduced) planet.start();
  };
}
function universeRect() {
  const element = $('#planet');
  const visibility=element.style.visibility;
  element.style.cssText = '';
  element.style.visibility=visibility;
  element.classList.remove('in-workspace');
  return element.getBoundingClientRect();
}
function settlePlanet() {
  if(!inWorkspace) return;
  $('#planet').style.visibility='hidden';
  planet.stop();
  sky.stop();
}
async function enterWorld() {
  if (window.mobileShell?.active()) return window.mobileShell.openProject(selectedProject);
  if (inWorkspace || flightPending) return;
  flightPending = true;
  const requested = performance.now();
  planet.stop();
  if (!reduced) {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  window.mockDiagnostics.entryPreparation = performance.now() - requested;
  closePopover();
  const start = $('#planet').getBoundingClientRect();
  planet.stop();
  inWorkspace = true;
  $('#workspace').hidden = false;
  $('#workspace').inert = false;
  $('#workspace').style.opacity = '.001';
  $('#dock').hidden = false;
  $('#dockEdge').hidden = false;
  showSection(entrySection, false);
  entrySection = 'editor';
  const end = {left:start.left-start.width,top:start.top-start.height,width:start.width*3,height:start.height*3};
  if (reduced) {
    finishEntry();
    return;
  }
  // A slow approach: the world drifts toward the centre and grows a little while the sky recedes,
  // then the desk rises in front of it. No veil and no sudden blow-up.
  const element = $('#planet');
  const scale = 1.15;
  const dx = (innerWidth / 2 - (start.left + start.width / 2)) * .3;
  const dy = (innerHeight / 2 - (start.top + start.height / 2)) * .3 + start.height * .08;
  element.style.left = `${start.left}px`;
  element.style.top = `${start.top}px`;
  element.style.width = `${start.width}px`;
  element.style.height = `${start.height}px`;
  // The planet stays behind the workspace, so the desk rises in front of the receding world.
  const duration = 2400;
  window.mockDiagnostics.transitionFrames = [];
  const began = performance.now();
  let last = null;
  let running = true;
  const sample = time => {
    if (last !== null && time > last) window.mockDiagnostics.transitionFrames.push(time - last);
    last = time;
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
  const glide = 'cubic-bezier(.45,.05,.22,1)';
  entryAnimation = element.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate(${dx * .55}px,${dy * .55}px) scale(${1 + (scale - 1) * .55})`, opacity: 1, offset: .5 },
    { transform: `translate(${dx}px,${dy}px) scale(${scale})`, opacity: 0, offset: 1 }
  ], { duration, easing: glide, fill: 'forwards' });
  $('#universe').animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration * .45, easing: 'ease-out', fill: 'forwards' });
  $('#workspace').animate([{ opacity: .001, transform: 'translateY(14px)' }, { opacity: .001, transform: 'translateY(14px)', offset: .35 }, { opacity: 1, transform: 'translateY(0)' }], { duration, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
  try { await entryAnimation.finished; } catch { /* A skip cancels the shared motion. */ }
  running = false;
  window.mockDiagnostics.transitionDuration = performance.now() - began;
  finishEntry();
}
function finishEntry() {
  flightPending = false;
  entryAnimation?.cancel();
  entryAnimation = null;
  $('#cloudVeil').getAnimations().forEach(animation => animation.cancel());
  $('#cloudVeil').inert = true;
  $('#cloudVeil').style.opacity = '0';
  $('#universe').hidden = true;
  $('#workspace').getAnimations().forEach(animation => animation.cancel());
  $('#workspace').style.opacity = '1';
  $('#planet').style.zIndex = '';
  $('#planet').style.visibility='hidden';
  settlePlanet();
  if (wit.idea) setTimeout(() => { if (inWorkspace && state.section === 'editor') showIdea(); }, 700);
}
$('#planetHit').onclick = () => { if (!draggedWorld && !switchingWorld) enterWorld(); };
$('#skipEntry').onclick = finishEntry;
function backToUniverse() {
  exitFocus();
  hideIdea();
  if (state.layout) endLayout(false);
  inWorkspace = false;
  $('#workspace').hidden = true;
  $('#dock').hidden = true;
  $('#dockEdge').hidden = true;
  $('#universe').hidden = false;
  $('#universe').getAnimations().forEach(animation => animation.cancel());
  $('#planet').style.visibility='visible';
  setZoom(1);
  universeRect();
  updateNeighbors();
  if (!reduced) planet.start();
  closePopover();
  clearTimeout(toastTimer);
  $('#toast').hidden = true;
}
function updateNeighbors() {
  for (const [id, delta] of [['previousWorld', -1], ['nextWorld', 1]]) {
    const project = projects[(selectedProject + delta + projects.length) % projects.length];
    const button = $('#' + id);
    button.querySelector('img').src = project.preview || snapshotPath(project.form, project.growth, project.seed);
    button.querySelector('span').textContent = project.name;
    button.setAttribute('aria-label', project.name + ' 가까이 보기');
  }
}
async function moveWorld(delta) {
  if (inWorkspace || zoom < .99 || !$('#modalShade').hidden) return;
  if (switchingWorld) {
    pendingWorld += delta;
    return;
  }
  switchingWorld = true;
  planet.stop();
  projects[selectedProject].growth = state.growth;
  projects[selectedProject].text = state.characterCount;
  projects[selectedProject].preview = planet.snapshot();
  const elements = [$('#planet'), $('.universe-title'), $('#projectInfo')];
  const easing = getComputedStyle(document.documentElement).getPropertyValue('--orbit-ease').trim();
  const position = element => element.id === 'planet' ? '' : 'translateX(-50%) ';
  if (!reduced) await Promise.all(elements.map(element => element.animate([{ transform: position(element) + 'translateX(0)', opacity: 1 }, { transform: position(element) + 'translateX(' + (-delta * 90) + 'px)', opacity: 0 }], { duration: 180, easing }).finished));
  await selectWorld((selectedProject + delta + projects.length) % projects.length, false);
  if (!reduced) await Promise.all(elements.map(element => element.animate([{ transform: position(element) + 'translateX(' + (delta * 110) + 'px)', opacity: 0 }, { transform: position(element) + 'translateX(0)', opacity: 1 }], { duration: 420, easing }).finished));
  switchingWorld = false;
  if (pendingWorld) {
    const next = Math.sign(pendingWorld);
    pendingWorld -= next;
    moveWorld(next);
  }
}
$('#previousWorld').onclick = () => moveWorld(-1);
$('#nextWorld').onclick = () => moveWorld(1);
$('#previousPlanet').onclick = () => moveWorld(-1);
$('#nextPlanet').onclick = () => moveWorld(1);
addEventListener('keydown', event => {
  if (event.target.closest('input,textarea,[contenteditable="true"]') || inWorkspace || !$('#modalShade').hidden) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveWorld(event.key === 'ArrowRight' ? 1 : -1);
  }
});
let dragFrom = null;
$('#universe').addEventListener('pointerdown', event => {
  if (event.target.closest('input,a,button:not(#planetHit)')) return;
  draggedWorld = false;
  dragFrom = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
$('#universe').addEventListener('pointermove', event => {
  if (dragFrom && Math.abs(event.clientX - dragFrom.x) > 14) draggedWorld = true;
});
addEventListener('pointerup', event => {
  if (!dragFrom || event.pointerId !== dragFrom.id) return;
  const dx = event.clientX - dragFrom.x;
  const dy = event.clientY - dragFrom.y;
  dragFrom = null;
  if (pinch.size > 1) return;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    draggedWorld = true;
    moveWorld(dx < 0 ? 1 : -1);
  }
});
addEventListener('pointercancel', () => { dragFrom = null; });
$('#universe').addEventListener('wheel', event => {
  if (event.target.closest('input')) return;
  if (event.deltaY < 0 || zoom < 1) {
    event.preventDefault();
    setZoom(zoom + event.deltaY * .0015);
    if (zoom < 1) sky.start();
    else sky.stop();
    if (zoom > 0 && !reduced) planet.start();
    else planet.stop();
  }
}, { passive: false });
$('#universe').addEventListener('pointermove', event => {
  if (reduced || planet.isFallback || event.pointerType === 'touch') return;
  $('#stars').style.transform = `translate(${(event.clientX / innerWidth - .5) * -10}px,${(event.clientY / innerHeight - .5) * -8}px)`;
});

$('#dock').innerHTML = sections.map(([name, label, icon]) => `<button data-section="${name}" class="${name === 'editor' ? 'active' : ''}" aria-label="${label}">
<svg>
<use href="#${icon}"/>
</svg>
<span class="dock-label">${label}</span>
</button>`).join('');
function showDock() {
  clearTimeout(dockTimer);
  $('#dock').classList.remove('concealed');
}
function hideDockLater() {
  clearTimeout(dockTimer);
  dockTimer = setTimeout(() => {
    if (state.section === 'editor' && !state.layout) $('#dock').classList.add('concealed');
  }, 1200);
}
$('#dockEdge').onpointerenter = showDock;
document.addEventListener('pointermove', event => {
  if (inWorkspace && !state.layout && event.clientY >= innerHeight - 8) showDock();
  if (event.pointerType === 'mouse' && event.clientX > 218) $('#library').classList.remove('open');
});
$('#dock').onpointerenter = showDock;
$('#dock').addEventListener('focusin', showDock);
$('#dock').onpointerleave = () => {
  $$('#dock button').forEach(button => {
    button.style.transform = '';
  });
  hideDockLater();
};
$('#dock').onpointermove = event => {
  if (reduced || event.pointerType === 'touch') return;
  $$('#dock button').forEach(button => {
    const rect = button.getBoundingClientRect();
    const distance = Math.abs(event.clientX - rect.left - rect.width / 2);
    const scale = 1 + Math.max(0, 1 - distance / 100) * .3;
    button.style.transform = `scale(${scale}) translateY(${-(scale - 1) * 12}px)`;
  });
};
$('#dock').onclick = event => {
  const button = event.target.closest('[data-section]');
  if (!button) return;
  if (button.dataset.section === 'universe') backToUniverse();
  else showSection(button.dataset.section);
};
function showSection(name, animate = true) {
  $('#workspace').dataset.currentSection=name;
  closeMemoCard();
  hideIdea();
  if (state.focus) exitFocus();
  if (state.layout) endLayout(false);
  state.section = name;
  $$('.screen').forEach(screen => {
    screen.hidden = screen.id !== `${name}Screen`;
    screen.classList.remove('entering');
  });
  const screen = $(`#${name}Screen`);
  if (animate) {
    void screen.offsetWidth;
    screen.classList.add('entering');
  }
  $('#sectionName').textContent = sections.find(section => section[0] === name)[1];
  $$('#dock button').forEach(button => button.classList.toggle('active', button.dataset.section === name));
  $('#viewButton').hidden = name !== 'editor';
  $('#memoButton').hidden = name !== 'editor';
  $('#witButton').hidden = name !== 'editor';
  $('#layoutButton').hidden = name !== 'editor';
  if (name === 'ideas') renderNotes();
  if (name === 'plot') renderPlotTable();
  if (name === 'board') renderMarks();
  if (name === 'cast') renderCast();
  if (inWorkspace && !entryAnimation && animate) settlePlanet();
  showDock();
  closePopover();
}

$('#libraryEdge').onpointerenter = () => $('#library').classList.add('open');
$('#library').onpointerleave = () => $('#library').classList.remove('open');
$('#libraryButton').onclick = () => $('#library').classList.toggle('open');
$$('[data-library]').forEach(button => {
  button.onclick = () => {
    $$('[data-library]').forEach(item => item.classList.toggle('active', item === button));
    $('#libraryResult').textContent = button.dataset.library === 'resource' ? '자료 시트: 조수 시간표 / 항구 지도' : button.dataset.library === 'keywords' ? '바다 / 기억 / 편지 / 등대' : `${button.textContent.trim()}의 챕터를 표시합니다.`;
  };
});
$('#addChapter').onclick = () => {
  dialog('<button class="primary" id="createChapter">챕터 만들기</button><label>챕터 이름<input id="chapterName" placeholder="다음 장의 이름"></label>', '#chapterName');
  $('#createChapter').onclick = () => {
    manuscriptBodies.set(chapters.length,'');
    chapters.push({ title: $('#chapterName').value.trim() || '새로운 물결', progress: 0, plot: '새 장의 전개를 적으세요.', thread: '', gate: '',goal:4000,stages:stageNames.map(()=> ''), lines: [] });
    selectChapter(chapters.length - 1);
    closeDialog();
    saved();
  };
};
$('#goalButton').onclick = () => {
  openPopover($('#goalButton'), '<button class="main-action" id="applyGoal">목표 적용하기</button><label>목표 분량<input id="goalTarget" type="number" value="100000" min="1">자</label><label>마감일<input id="goalDate" type="date" value="2027-03-01"></label><div class="number-row"><span>오늘</span><span>1,280자</span></div><div class="number-row"><span>백업</span><span>백업됨</span></div>');
  $('#goalTarget').value = state.goalTarget;
  $('#goalDate').value = state.goalDate;
  $('#applyGoal').onclick = () => {
    const value = Math.max(1, Number($('#goalTarget').value) || 100000);
    const count = state.characterCount;
    state.goalTarget = value;
    state.goalDate = $('#goalDate').value;
    updateGrowth(count / value * 100);
    $('.goal-numbers > span:nth-child(3)').textContent = `${value.toLocaleString('ko-KR')}자까지`;
    closePopover();
    toast('목표를 적용했습니다.');
  };
};
$('#viewButton').onclick = () => {
  openPopover($('#viewButton'), '<button class="main-action" id="focusCommand">집중 모드</button><button id="bookCommand">책 미리보기</button><button id="chapterCommand">챕터 보기 / 접기</button><button id="dashboardCommand">대시보드 보기 / 접기</button>');
  $('#focusCommand').onclick = enterFocus;
  $('#bookCommand').onclick = openBook;
  $('#chapterCommand').onclick = () => {
    $('#editorScreen').classList.toggle('show-mobile-chapters');
    if (innerWidth > 560) $('#chaptersPane').hidden = !$('#chaptersPane').hidden;
    closePopover();
  };
  $('#dashboardCommand').onclick = () => {
    const hidden = !$('#dashboard').hidden;
    $('#dashboard').hidden = hidden;
    $('#editorScreen').style.gridTemplateColumns = hidden ? 'var(--chapter-width) minmax(0,1fr) 0' : '';
    $('#planet').style.opacity = hidden ? '0' : '1';
    closePopover();
    settlePlanet();
  };
};
$('#manuscript').addEventListener('input', () => {
  manuscriptBodies.set(state.chapter, $('#manuscript').innerHTML);
  $('#wordCount').textContent = `${$('#manuscript').textContent.length.toLocaleString('ko-KR')}자`;
  chapters[state.chapter].progress = Math.min(100,Math.floor($('#manuscript').textContent.length/(chapters[state.chapter].goal||4000)*100));
  renderChapters();
  saved();
  hideDockLater();
  if (state.focus) centerCaret();
});
$('#manuscript').addEventListener('keydown', hideDockLater);
// 인물·장소 on the desk: a list on the left, the entry on the right, and the chapters it appears in.
state.castType = 'character';
state.castSelected = null;
function renderCast() {
  const list = cast.filter(entry => entry.type === state.castType);
  if (!list.some(entry => entry.id === state.castSelected)) state.castSelected = list[0]?.id ?? null;
  const entry = cast.find(item => item.id === state.castSelected);
  $('#castCharacters').classList.toggle('active', state.castType === 'character');
  $('#castPlaces').classList.toggle('active', state.castType === 'place');
  $('#castList').innerHTML = list.map(item => `<button class="cast-row${item.id === state.castSelected ? ' active' : ''}" data-cast="${item.id}"><span class="cast-avatar ${item.type}">${escapeHTML(item.name.slice(0, 1))}</span><span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.line || '')}</small></span><em>${appearances(item, chapters, chapterBody).length}장</em></button>`).join('') || '<p class="small-copy">아직 없습니다.</p>';
  if (!entry) {
    $('#castCard').innerHTML = '<p class="small-copy">왼쪽 위 + 로 추가합니다.</p>';
  } else {
    const seen = appearances(entry, chapters, chapterBody);
    $('#castCard').innerHTML = `<div class="cast-head"><span class="cast-avatar big ${entry.type}">${escapeHTML(entry.name.slice(0, 1))}</span><div><input class="cast-name" data-cast-field="name" value="${escapeHTML(entry.name)}" aria-label="이름"><input class="cast-line" data-cast-field="line" value="${escapeHTML(entry.line || '')}" placeholder="한 줄 소개" aria-label="한 줄 소개"></div><button class="cast-remove" id="removeCast">지우기</button></div>
<div class="cast-fields"><label><span>다른 이름</span><input data-cast-field="aliases" value="${escapeHTML((entry.aliases || []).join(', '))}" placeholder="쉼표로 구분 · 원고에서 함께 찾습니다"></label>${castFields[entry.type].map(([key, label]) => `<label><span>${label}</span><textarea data-cast-field="${key}" rows="1">${escapeHTML(entry[key] || '')}</textarea></label>`).join('')}</div>
<div class="pane-head">나오는 장 <small>원고에서 이름을 찾아 셉니다</small></div><div class="cast-seen">${seen.map(item => `<button data-cast-chapter="${item.index}">${item.index + 1}. ${escapeHTML(item.title)}<i>${item.count}</i></button>`).join('') || '<span class="small-copy">아직 원고에 나오지 않습니다.</span>'}</div>`;
  }
  $$('[data-cast]').forEach(button => {
    button.onclick = () => {
      state.castSelected = Number(button.dataset.cast);
      renderCast();
    };
  });
  $$('[data-cast-field]').forEach(input => {
    const grow = () => {
      if (input.tagName !== 'TEXTAREA') return;
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
    };
    grow();
    input.oninput = () => {
      const key = input.dataset.castField;
      entry[key] = key === 'aliases' ? input.value.split(',').map(value => value.trim()).filter(Boolean) : input.value;
      grow();
      saved();
      if (key === 'name' || key === 'line') {
        const row = $(`[data-cast="${entry.id}"]`);
        if (row) {
          $('b', row).textContent = entry.name;
          $('small', row).textContent = entry.line;
        }
      }
    };
    input.onchange = () => {
      if (input.dataset.castField === 'name' || input.dataset.castField === 'aliases') renderCast();
    };
  });
  $$('[data-cast-chapter]').forEach(button => {
    button.onclick = () => {
      selectChapter(Number(button.dataset.castChapter), false);
      showSection('editor');
      requestAnimationFrame(() => findInManuscript(entry));
    };
  });
  const remove = $('#removeCast');
  if (remove) {
    remove.onclick = () => {
      cast.splice(cast.indexOf(entry), 1);
      state.castSelected = null;
      renderCast();
      toast('지웠습니다.');
    };
  }
}
function findInManuscript(entry) {
  const names = [entry.name, ...(entry.aliases || [])];
  const walker = document.createTreeWalker($('#manuscript'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const name = names.find(item => node.textContent.includes(item));
    if (!name) continue;
    const range = document.createRange();
    const at = node.textContent.indexOf(name);
    range.setStart(node, at);
    range.setEnd(node, at + name.length);
    if (window.Highlight && CSS.highlights) {
      CSS.highlights.set('cast-hit', new Highlight(range));
      setTimeout(() => CSS.highlights.delete('cast-hit'), 2400);
    }
    node.parentElement.scrollIntoView({ block: 'center', behavior: reduced ? 'instant' : 'smooth' });
    return;
  }
}
$('#castCharacters').onclick = () => {
  state.castType = 'character';
  renderCast();
};
$('#castPlaces').onclick = () => {
  state.castType = 'place';
  renderCast();
};
$('#addCast').onclick = () => {
  const entry = { id: Date.now(), type: state.castType, name: state.castType === 'place' ? '새 장소' : '새 인물', aliases: [], line: '' };
  cast.push(entry);
  state.castSelected = entry.id;
  renderCast();
  $('.cast-name').select();
};
// The outline (개요) is built from the chapter's own headings.
function renderOutline() {
  const headings = headingsOf($('#manuscript'));
  $('#dashboardOutline').innerHTML = headings.length
    ? headings.map((heading, index) => `<button class="outline-row level-${Number(heading.tagName.slice(1)) - 2}" data-outline="${index}"><i>${'#'.repeat(Number(heading.tagName.slice(1)) - 2)}</i>${escapeHTML(heading.textContent)}</button>`).join('')
    : '<p class="outline-hint">줄 앞에 <b>#</b> 을 쓰면 소제목이 되어 여기에 모입니다.</p>';
  $$('[data-outline]').forEach(button => {
    button.onclick = () => headings[Number(button.dataset.outline)].scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  });
}

function renderNotes() {
  const visible = notes.filter(note => state.keyword === '전체' || note.keywords.includes(state.keyword));
  $('#notesList').hidden = state.notesView !== 'list';
  $('#notesSky').hidden = state.notesView !== 'sky';
  $('#notesListButton').classList.toggle('active', state.notesView === 'list');
  $('#notesSkyButton').classList.toggle('active', state.notesView === 'sky');
  $('#notesList').innerHTML = visible.map(note => `<div class="note-row" data-note="${note.id}" draggable="true">
<span class="note-star" title="끌어서 연결">✦</span>
<span class="note-text">${escapeHTML(note.text)}</span>
<span class="note-keywords">${escapeHTML(note.keywords)}</span>
<button class="note-link" data-link-note="${note.id}">${escapeHTML(note.link || '연결하기')}</button>
</div>`).join('') || `<div class="empty">
<p>이 키워드의 아이디어가 없습니다.</p>
<button id="emptyNote" class="primary">바로 적기</button>
</div>`;
  const positions = [[13,18], [52,32], [28,59], [72,67], [65,9], [10,80]];
  const groups = new Map();
  visible.forEach((note, index) => {
    const group = groups.get(note.keywords) || [];
    const position = positions[index % 6];
    group.push(`${position[0] * 10 + 8},${position[1] * 5.8 + 15}`);
    groups.set(note.keywords, group);
  });
  const links = [...groups.values()].filter(group => group.length > 1).map(group => `<path class="constellation" d="M${group.join(' L')}"/>`).join('');
  $('#notesSky').innerHTML = `<svg viewBox="0 0 1000 580" preserveAspectRatio="none">${links}</svg>${visible.map((note, index) => `<div class="sky-note" draggable="true" data-note="${note.id}" style="left:${positions[index % 6][0]}%;
top:${positions[index % 6][1]}%">
<span class="star-glyph">✦</span>
<span>${escapeHTML(note.text)}</span>
<small>${escapeHTML(note.keywords)}</small>
<button data-link-note="${note.id}" class="note-link">${escapeHTML(note.link || '연결하기')}</button>
</div>`).join('')}`;
  $$('[data-note]').forEach(element => {
    element.ondragstart = event => {
      dragNote = Number(element.dataset.note);
      event.dataTransfer.setData('text/plain', String(dragNote));
      event.dataTransfer.effectAllowed = 'link';
    };
  });
  $$('[data-link-note]').forEach(button => {
    button.onclick = () => {
      dragNote = Number(button.dataset.linkNote);
      $$('.drop-target').forEach(target => target.classList.add('dragover'));
      $('#linkResult').textContent = '연결할 곳을 누르거나 별을 끌어 놓으세요.';
    };
  });
  $('#emptyNote')?.addEventListener('click', captureNote);
}
function linkNote(target) {
  if (!dragNote) return;
  const note = notes.find(item => item.id === dragNote);
  note.link = target === 'chapter' ? '제3장' : target === 'thread' ? '잃어버린 지도' : '젖지 않는 편지';
  if (!state.linkedNotes.some(item => item.id === note.id)) state.linkedNotes.push(note);
  $('#linkResult').textContent = `「${note.text}」를 ${note.link}에 연결했습니다.`;
  $$('.drop-target').forEach(element => element.classList.remove('dragover'));
  renderNotes();
  renderThreads();
  if (!$('#plotBar').hidden) renderPlotBar();
  dragNote = null;
  saved();
}
$$('.drop-target').forEach(target => {
  target.ondragover = event => {
    event.preventDefault();
    target.classList.add('dragover');
  };
  target.ondragleave = () => target.classList.remove('dragover');
  target.ondrop = event => {
    event.preventDefault();
    dragNote = Number(event.dataTransfer.getData('text/plain')) || dragNote;
    linkNote(target.dataset.target);
  };
  target.onclick = () => linkNote(target.dataset.target);
  target.tabIndex = 0;
  target.setAttribute('role', 'button');
  target.onkeydown = event => {
    if (event.key === 'Enter') linkNote(target.dataset.target);
  };
});
function addNote(text, keywords = '바다') {
  if (!text.trim()) return;
  projects[selectedProject].notes+=1;
  notes.unshift({ id: Date.now(), text: text.trim(), keywords: keywords.trim() || '바다', link: '' });
  renderNotes();
  saved();
}
$('#quickNote').onkeydown = event => {
  if (event.key === 'Enter' && !event.isComposing) {
    addNote(event.target.value);
    event.target.value = '';
  }
};
function captureNote() {
  dialog('<button class="primary" id="saveNote">아이디어 남기기</button><textarea id="noteDraft" aria-label="아이디어 내용" placeholder="지금 떠오른 생각"></textarea><label>키워드<input id="noteKeyword" value="바다"></label><p>Ctrl Enter로 남깁니다. 원고에는 들어가지 않습니다.</p>', '#noteDraft');
  const submit = () => {
    if (!$('#noteDraft').value.trim()) return $('#noteDraft').focus();
    addNote($('#noteDraft').value, $('#noteKeyword').value);
    closeDialog();
    toast('아이디어를 남겼습니다.');
  };
  $('#saveNote').onclick = submit;
  $('#noteDraft').onkeydown = event => {
    if (event.ctrlKey && event.key === 'Enter') submit();
  };
}
$('#captureButton').onclick = captureNote;
$('#notesListButton').onclick = () => {
  state.notesView = 'list';
  renderNotes();
};
$('#notesSkyButton').onclick = () => {
  state.notesView = 'sky';
  renderNotes();
};
$$('.keyword-filter').forEach(button => {
  button.onclick = () => {
    state.keyword = button.dataset.keyword;
    $$('.keyword-filter').forEach(item => item.classList.toggle('active', item === button));
    renderNotes();
  };
});
// Subplots split into branches (1-1, 1-2) because a subplot can fork inside itself.
// Every thread line in a chapter names one path: a subplot ("2") or one of its branches ("1-1").
const subplots = [
  { id: '1', name: '떡밥', color: '#3d74c9', branches: [{ id: '1-1', name: '지도' }, { id: '1-2', name: '편지' }] },
  { id: '2', name: '수문', color: '#b9652d', branches: [] }
];
chapters.forEach((chapter, index) => {
  chapter.lines ||= [{ path: index % 2 ? '1-2' : '1-1', text: chapter.thread || '' }, { path: '2', text: chapter.gate || '' }];
});
state.plotFilter = 'all';
function pathInfo(path) {
  const subplot = subplots.find(item => item.id === path.split('-')[0]) || subplots[0];
  const index = subplot.branches.findIndex(branch => branch.id === path);
  const branch = subplot.branches[index];
  const color = branch ? `color-mix(in srgb, ${subplot.color} ${84 - index * 16}%, #000)` : subplot.color;
  return { subplot, branch, label: branch ? branch.id : subplot.id, name: branch ? branch.name : subplot.name, color };
}
function allPaths() {
  return subplots.flatMap(subplot => [subplot.id, ...subplot.branches.map(branch => branch.id)]);
}
function pathBadge(path, attributes = '') {
  const info = pathInfo(path);
  return `<button class="path-badge" style="--badge:${info.color}" ${attributes}><span>${info.label}</span>${escapeHTML(info.name)}</button>`;
}
function matchesFilter(path) {
  const filter = state.plotFilter;
  return filter === 'all' || path === filter || path.startsWith(filter + '-');
}
function renderPlotFilters() {
  const chips = ['<button class="plot-filter" data-plot-filter="all">전체</button>'].concat(subplots.flatMap(subplot => [
    `<button class="plot-filter" data-plot-filter="${subplot.id}" style="--badge:${subplot.color}">${subplot.id} ${escapeHTML(subplot.name)}</button>`,
    ...subplot.branches.map(branch => `<button class="plot-filter branch" data-plot-filter="${branch.id}" style="--badge:${pathInfo(branch.id).color}">${branch.id} ${escapeHTML(branch.name)}</button>`)
  ]));
  $('#plotFilters').innerHTML = chips.join('');
  $$('[data-plot-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.plotFilter === state.plotFilter);
    button.onclick = () => {
      state.plotFilter = button.dataset.plotFilter;
      renderPlotTable();
    };
  });
}
function plotSaved() {
  $('#plotSaved').textContent = '저장 중';
  saved();
  setTimeout(() => {
    $('#plotSaved').textContent = '저장됨';
  }, 550);
}
function renderPlotTable() {
  renderPlotFilters();
  const filtering = state.plotFilter !== 'all';
  $('#plotRows').innerHTML = chapters.map((chapter, index) => {
    const lines = chapter.lines.map((line, lineIndex) => ({ line, lineIndex })).filter(({ line }) => matchesFilter(line.path));
    const quiet = filtering && !lines.length;
    const sub = lines.map(({ line, lineIndex }) => `<div class="subplot-line">${pathBadge(line.path, `data-line-path="${index}:${lineIndex}"`)}<span contenteditable="true" data-line-text="${index}:${lineIndex}">${escapeHTML(line.text)}</span></div>`).join('');
    const stages = state.stageRows ? `<tr class="stage-row"><td>발단~결말</td><td colspan="2">${chapter.stages.map((text, i) => `<div class="subplot-line"><span class="stage-name">${stageNames[i]}</span><span contenteditable="true" data-stage-chapter="${index}" data-stage-index="${i}">${escapeHTML(text)}</span></div>`).join('')}</td></tr>` : '';
    return `<tr class="${index === state.chapter ? 'current' : ''}${quiet ? ' quiet' : ''}"><td><div class="plot-title-cell"><span class="plot-number">${index + 1}.</span><span class="plot-title" contenteditable="true" data-title-index="${index}">${escapeHTML(chapter.title)}</span><button class="plot-open" data-plot-chapter="${index}" aria-label="${escapeHTML(chapter.title)} 편집기에서 열기">↗</button></div></td><td contenteditable="true" data-plot-index="${index}" data-field="plot">${escapeHTML(chapter.plot)}</td><td>${sub}<button class="add-line" data-add-line="${index}">+ 실</button></td></tr>${stages}`;
  }).join('');
  $$('[data-plot-index]').forEach(cell => {
    cell.oninput = () => {
      chapters[Number(cell.dataset.plotIndex)][cell.dataset.field] = cell.textContent;
      plotSaved();
      renderChapters();
      if (!$('#plotBar').hidden) renderPlotBar();
    };
  });
  $$('[data-title-index]').forEach(cell => {
    cell.oninput = () => {
      chapters[Number(cell.dataset.titleIndex)].title = cell.textContent.trim() || '이름 없는 챕터';
      plotSaved();
      renderChapters();
    };
    cell.onkeydown = event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        cell.blur();
      }
    };
  });
  $$('[data-line-text]').forEach(cell => {
    cell.oninput = () => {
      const [chapter, line] = cell.dataset.lineText.split(':').map(Number);
      chapters[chapter].lines[line].text = cell.textContent;
      plotSaved();
      if (!$('#plotBar').hidden) renderPlotBar();
    };
  });
  $$('[data-line-path]').forEach(button => {
    button.onclick = () => choosePath(button, ...button.dataset.linePath.split(':').map(Number));
  });
  $$('[data-add-line]').forEach(button => {
    button.onclick = () => {
      const chapter = chapters[Number(button.dataset.addLine)];
      const path = state.plotFilter === 'all' ? subplots[0].id : state.plotFilter;
      chapter.lines.push({ path, text: '' });
      renderPlotTable();
      const cells = $$(`[data-line-text^="${button.dataset.addLine}:"]`);
      cells.at(-1)?.focus();
      plotSaved();
    };
  });
  $$('[data-plot-chapter]').forEach(button => {
    button.onclick = () => {
      selectChapter(Number(button.dataset.plotChapter));
      showSection('editor');
    };
  });
  $$('[data-stage-chapter]').forEach(cell => {
    cell.oninput = () => {
      chapters[Number(cell.dataset.stageChapter)].stages[Number(cell.dataset.stageIndex)] = cell.textContent;
      saved();
      if (!$('#plotBar').hidden) renderPlotBar();
    };
  });
}
function choosePath(anchor, chapterIndex, lineIndex) {
  const line = chapters[chapterIndex].lines[lineIndex];
  openPopover(anchor, `<div class="path-menu"><p>이 실이 속한 갈래</p>${allPaths().map(path => pathBadge(path, `data-pick-path="${path}" aria-pressed="${path === line.path}"`)).join('')}<div class="menu-separator"></div><button id="removeLine">이 실 지우기</button></div>`, 'beside');
  $$('[data-pick-path]').forEach(button => {
    button.onclick = () => {
      line.path = button.dataset.pickPath;
      closePopover();
      renderPlotTable();
      plotSaved();
    };
  });
  $('#removeLine').onclick = () => {
    chapters[chapterIndex].lines.splice(lineIndex, 1);
    closePopover();
    renderPlotTable();
    plotSaved();
  };
}
function manageSubplots() {
  const rows = subplots.map((subplot, s) => `<div class="sub-manage"><div class="sub-row"><span class="sub-dot" style="--badge:${subplot.color}">${subplot.id}</span><input data-sub-name="${s}" value="${escapeHTML(subplot.name)}" aria-label="서브플롯 ${subplot.id} 이름"></div>${subplot.branches.map((branch, b) => `<div class="sub-row branch"><span class="sub-dot" style="--badge:${pathInfo(branch.id).color}">${branch.id}</span><input data-branch-name="${s}:${b}" value="${escapeHTML(branch.name)}" aria-label="${branch.id} 이름"></div>`).join('')}<button class="split-sub" data-split="${s}">+ ${subplot.id}-${subplot.branches.length + 1}로 나누기</button></div>`).join('');
  openPopover($('#manageSubplots'), `<div class="sub-panel">${rows}<button class="main-action" id="addSubplot">서브플롯 추가</button></div>`);
  $('#popover').classList.add('wide');
  $$('[data-sub-name]').forEach(input => {
    input.oninput = () => {
      subplots[Number(input.dataset.subName)].name = input.value.trim() || '이름 없음';
      renderPlotTable();
      plotSaved();
    };
  });
  $$('[data-branch-name]').forEach(input => {
    input.oninput = () => {
      const [s, b] = input.dataset.branchName.split(':').map(Number);
      subplots[s].branches[b].name = input.value.trim() || '이름 없음';
      renderPlotTable();
      plotSaved();
    };
  });
  $$('[data-split]').forEach(button => {
    button.onclick = () => {
      const subplot = subplots[Number(button.dataset.split)];
      subplot.branches.push({ id: `${subplot.id}-${subplot.branches.length + 1}`, name: '새 갈래' });
      renderPlotTable();
      manageSubplots();
      plotSaved();
    };
  });
  $('#addSubplot').onclick = () => {
    const palette = ['#3d74c9', '#b9652d', '#3f8f5a', '#8a4fc0', '#b23a5a', '#2c8c95'];
    subplots.push({ id: String(subplots.length + 1), name: '새 서브플롯', color: palette[subplots.length % palette.length], branches: [] });
    renderPlotTable();
    manageSubplots();
    plotSaved();
  };
}
$('#manageSubplots').onclick = manageSubplots;
$('#addPlotChapter').onclick = () => {
  manuscriptBodies.set(chapters.length, '');
  chapters.push({ title: '새 챕터', progress: 0, plot: '', thread: '', gate: '', goal: 4000, stages: stageNames.map(() => ''), lines: [] });
  renderChapters();
  renderPlotTable();
  const title = $(`[data-title-index="${chapters.length - 1}"]`);
  title.focus();
  getSelection().selectAllChildren(title);
  plotSaved();
};
// The plot table is reachable from the chapter pane and from 세부 전개, not only from the hidden Dock.
document.addEventListener('click', event => {
  if (!event.target.closest('[data-plot-table]')) return;
  showSection('plot');
  renderPlotTable();
});
$('#stageToggle').onclick = () => {
  state.stageRows = !state.stageRows;
  $('#stageToggle').textContent = state.stageRows ? '발단~결말 접기' : '발단~결말';
  renderPlotTable();
};

// Work board: one column that also fits a phone. Badges on top filter by category;
// memos follow chapter order, each block starts with its chapter.
state.markCategory = 'all';
const categoryTones = ['#5aa9e6', '#e3a75a', '#9a86e8', '#5fbf94', '#e07a8a', '#6fc3c9'];
const sampleHeadings = { 0: '항구의 아침', 3: '낯선 배의 그림자', 7: '기억을 건네는 사람' };
function chapterBody(index) {
  return manuscriptBodies.get(index) ?? `<h2>${escapeHTML(chapters[index].title)}</h2>${paragraphs.map((paragraph, i) => `${sampleHeadings[i] ? `<h3 class="story-heading">${sampleHeadings[i]}</h3>` : ''}<p data-paragraph="${i}">${escapeHTML(paragraph)}</p>`).join('')}`;
}
function renderBoardFilters(pool) {
  const chip = (key, label, count, tone) => `<button class="board-filter${state.markCategory === key ? ' active' : ''}" data-board-filter="${escapeHTML(key)}" style="--tone:${tone}">${escapeHTML(label)}<span>${count}</span></button>`;
  $('#boardFilters').innerHTML = chip('all', '전체', pool.length, 'var(--accent)') + categories.map((name, index) => chip(name, name, pool.filter(mark => mark.category === name).length, categoryTones[index % categoryTones.length])).join('');
  $$('[data-board-filter]').forEach(button => {
    button.onclick = () => {
      state.markCategory = button.dataset.boardFilter;
      renderMarks();
    };
    button.ondblclick = () => {
      if (button.dataset.boardFilter === 'all') return;
      renameCategory(button, categories.indexOf(button.dataset.boardFilter));
    };
  });
}
function renderMarks() {
  const pool = marks.filter(mark => mark.done === state.markFinished);
  if (state.markCategory !== 'all' && !categories.includes(state.markCategory)) state.markCategory = 'all';
  const visible = pool.filter(mark => state.markCategory === 'all' || mark.category === state.markCategory).sort((a, b) => a.chapter - b.chapter || a.paragraph - b.paragraph || a.id - b.id);
  $('#pendingMarks').classList.toggle('active', !state.markFinished);
  $('#finishedMarks').classList.toggle('active', state.markFinished);
  renderBoardFilters(pool);
  let lastChapter = -1;
  $('#marksList').innerHTML = visible.map((mark, index) => {
    const tone = categoryTones[categories.indexOf(mark.category) % categoryTones.length] || 'var(--muted)';
    const firstOfChapter = mark.chapter !== lastChapter;
    lastChapter = mark.chapter;
    return `<article class="board-item" data-board-item="${mark.id}" style="--tone:${tone};--star-x:${[10, 22, 15, 26, 8][index % 5]}px">
<span class="board-star${firstOfChapter ? ' planet' : ''}" aria-hidden="true"></span>
<button class="board-chapter" data-mark-peek="${mark.id}" aria-expanded="false">제${mark.chapter + 1}장 ${escapeHTML(chapters[mark.chapter]?.title || '')}<i>본문</i></button>
<div class="board-body"><div class="board-text" data-mark-edit="${mark.id}" tabindex="0">${escapeHTML(mark.text)}</div>
<footer><button class="cat-badge" data-mark-category="${mark.id}">${escapeHTML(mark.category)}</button>${mark.quote ? `<span class="board-quote">${escapeHTML(mark.quote)}</span>` : ''}<button class="board-done" data-mark-done="${mark.id}">${mark.done ? '되돌리기' : '완료'}</button></footer></div>
<div class="board-peek" data-peek="${mark.id}" hidden></div>
</article>`;
  }).join('') || `<p class="board-empty">${state.markFinished ? '완료한 메모가 없습니다.' : '문장을 선택하고 위 막대의 메모로 남기세요.'}</p>`;
  $$('[data-mark-edit]').forEach(element => {
    element.onclick = () => editMark(element);
    element.onkeydown = event => {
      if (event.key === 'Enter' && !element.isContentEditable) {
        event.preventDefault();
        editMark(element);
      }
    };
  });
  $$('[data-mark-peek]').forEach(button => {
    button.onclick = () => togglePeek(button);
  });
  $$('[data-mark-category]').forEach(button => {
    button.onclick = () => {
      const mark = marks.find(item => item.id === Number(button.dataset.markCategory));
      openPopover(button, `<p>구분 바꾸기</p>${categories.map((name, index) => `<button data-set-category="${index}">${name === mark.category ? '● ' : ''}${escapeHTML(name)}</button>`).join('')}`);
      $$('[data-set-category]').forEach(choice => {
        choice.onclick = () => {
          mark.category = categories[Number(choice.dataset.setCategory)];
          closePopover();
          renderMarks();
          saved();
        };
      });
    };
  });
  $$('[data-mark-done]').forEach(button => {
    button.onclick = () => {
      const mark = marks.find(item => item.id === Number(button.dataset.markDone));
      mark.done = !mark.done;
      renderMarks();
      renderManuscript();
      saved();
      toast(mark.done ? '메모를 완료했습니다.' : '메모를 다시 열었습니다.');
    };
  });
  requestAnimationFrame(drawConstellation);
}
function editMark(element) {
  if (element.isContentEditable) return;
  const mark = marks.find(item => item.id === Number(element.dataset.markEdit));
  element.contentEditable = 'true';
  element.classList.add('editing');
  element.focus();
  getSelection().selectAllChildren(element);
  getSelection().collapseToEnd();
  const finish = keep => {
    element.contentEditable = 'false';
    element.classList.remove('editing');
    if (keep) {
      mark.text = element.textContent.trim() || mark.text;
      saved();
    }
    element.textContent = mark.text;
  };
  element.onblur = () => finish(true);
  element.onkeydown = event => {
    if (event.key === 'Escape') {
      element.onblur = null;
      finish(false);
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey || !event.shiftKey)) {
      event.preventDefault();
      element.blur();
    }
  };
}
// The chapter line opens the passage below the memo in focus-mode style; nothing navigates away.
function togglePeek(button) {
  const mark = marks.find(item => item.id === Number(button.dataset.markPeek));
  const peek = $(`[data-peek="${mark.id}"]`);
  const open = peek.hidden;
  button.setAttribute('aria-expanded', String(open));
  peek.hidden = !open;
  if (!open) {
    peek.innerHTML = '';
    requestAnimationFrame(drawConstellation);
    return;
  }
  peek.innerHTML = `<div class="peek-scroll"><div class="peek-text" contenteditable="true" spellcheck="false">${chapterBody(mark.chapter)}</div></div><div class="peek-foot"><span>집중 모드 · 여기서 바로 고칠 수 있습니다</span><button data-peek-open>편집기에서 열기</button></div>`;
  const text = $('.peek-text', peek);
  const target = $(`[data-paragraph="${mark.paragraph}"]`, text) || $('p', text);
  $$('p, h2', text).forEach(element => {
    const distance = Math.abs(Number(element.dataset.paragraph ?? -1) - mark.paragraph);
    element.style.opacity = element === target ? '1' : String(Math.max(.16, .62 - distance * .16));
  });
  $$(`.memo-mark[data-memo="${mark.id}"]`, text).forEach(element => element.classList.add('peek-hit'));
  target?.classList.add('peek-target');
  const scroller = $('.peek-scroll', peek);
  if (target) scroller.scrollTop = target.offsetTop - scroller.clientHeight / 2 + target.offsetHeight / 2;
  text.oninput = () => {
    $$('p, h2', text).forEach(element => element.style.removeProperty('opacity'));
    const clean = text.cloneNode(true);
    $$('.peek-target, .peek-hit', clean).forEach(element => element.classList.remove('peek-target', 'peek-hit'));
    $$('[class=""]', clean).forEach(element => element.removeAttribute('class'));
    manuscriptBodies.set(mark.chapter, clean.innerHTML);
    saved();
  };
  $('[data-peek-open]', peek).onclick = () => {
    selectChapter(mark.chapter, false);
    showSection('editor');
  };
  requestAnimationFrame(drawConstellation);
}
// A faint dotted constellation joins the memo stars; a new chapter starts at a small ringed planet.
function drawConstellation() {
  const list = $('#marksList');
  const svg = $('#boardConstellation');
  if (!list || !svg || $('#boardScreen').hidden) return;
  const base = list.getBoundingClientRect();
  const points = $$('.board-star', list).map(star => {
    const rect = star.getBoundingClientRect();
    return [rect.left + rect.width / 2 - base.left, rect.top + rect.height / 2 - base.top + list.scrollTop];
  });
  svg.setAttribute('width', String(list.scrollWidth));
  svg.setAttribute('height', String(list.scrollHeight));
  svg.innerHTML = points.slice(1).map((point, index) => {
    const [x1, y1] = points[index];
    const [x2, y2] = point;
    const bend = (index % 2 ? 1 : -1) * 14;
    return `<path d="M${x1} ${y1 + 6} Q${(x1 + x2) / 2 + bend} ${(y1 + y2) / 2} ${x2} ${y2 - 6}"/>`;
  }).join('');
}
addEventListener('resize', () => requestAnimationFrame(drawConstellation));
function renameCategory(anchor, index) {
  openPopover(anchor, `<p>구분 이름</p><input id="categoryRename" value="${escapeHTML(categories[index])}" style="width:100%;height:28px;padding:0 6px"><button class="main-action" id="saveRename" style="margin-top:6px">바꾸기</button>`);
  $('#categoryRename').focus();
  $('#categoryRename').select();
  const store = () => {
    const name = $('#categoryRename').value.trim();
    if (!name || (categories.includes(name) && categories[index] !== name)) return $('#categoryRename').focus();
    marks.forEach(mark => {
      if (mark.category === categories[index]) mark.category = name;
    });
    if (state.markCategory === categories[index]) state.markCategory = name;
    categories[index] = name;
    closePopover();
    renderMarks();
    saved();
  };
  $('#saveRename').onclick = store;
  $('#categoryRename').onkeydown = event => {
    if (event.key === 'Enter') store();
  };
}
// The memo card floats beside the selected passage. Nothing behind it is dimmed or blurred,
// so the manuscript stays readable while the note is written.
let pendingMemo = null;
function closeMemoCard() {
  pendingMemo = null;
  CSS.highlights?.delete('memo-pending');
  $('#memoCard').hidden = true;
}
function placeMemoCard(range) {
  const card = $('#memoCard');
  const spot = range.getBoundingClientRect();
  const column = $('#manuscript').getBoundingClientRect();
  const box = card.getBoundingClientRect();
  const besideRoom = innerWidth - column.right - 24;
  const beside = besideRoom >= box.width;
  const left = beside ? column.right + 20 : Math.min(spot.left, innerWidth - box.width - 12);
  let top = beside ? spot.top - 6 : spot.bottom + 10;
  if (top + box.height > innerHeight - 12) top = Math.max(56, spot.top - box.height - 10);
  card.style.left = `${Math.max(12, left)}px`;
  card.style.top = `${Math.max(56, Math.min(innerHeight - box.height - 12, top))}px`;
}
function newMark() {
  const selection = getSelection();
  const range = selection.rangeCount && $('#manuscript').contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
  if (!range || range.collapsed) {
    toast('메모할 문장을 먼저 선택하세요.');
    return;
  }
  closePopover();
  const first = range.startContainer.parentElement.closest('[data-paragraph]');
  pendingMemo = { range, quote: range.toString(), paragraph: Number(first?.dataset.paragraph || 0), category: categories[0] };
  if (window.Highlight && CSS.highlights) CSS.highlights.set('memo-pending', new Highlight(range));
  const card = $('#memoCard');
  const chips = categories.map((name, index) => `<button role="radio" aria-checked="${index === 0}" data-memo-category="${index}">${escapeHTML(name)}</button>`).join('');
  card.innerHTML = `<div class="memo-card-head" id="memoGrip"><span class="memo-card-title">메모</span><button class="memo-close" id="memoClose" aria-label="메모 닫기">×</button></div>
<textarea id="markDraft" aria-label="메모 내용" placeholder="이 부분에 남길 말"></textarea>
<div class="memo-chips" role="radiogroup" aria-label="구분">${chips}</div>
<div class="memo-card-foot"><span class="memo-hint">Ctrl+Enter</span><button id="cancelMark">취소</button><button class="primary" id="saveMark">남기기</button></div>`;
  card.hidden = false;
  placeMemoCard(range);
  $('#markDraft').focus();
  $$('[data-memo-category]', card).forEach(button => {
    button.onclick = () => {
      pendingMemo.category = categories[Number(button.dataset.memoCategory)];
      $$('[data-memo-category]', card).forEach(other => other.setAttribute('aria-checked', String(other === button)));
    };
  });
  $('#memoClose').onclick = closeMemoCard;
  $('#cancelMark').onclick = closeMemoCard;
  $('#saveMark').onclick = saveMark;
  card.onkeydown = event => {
    if (event.key === 'Escape') closeMemoCard();
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) saveMark();
  };
  $('#memoGrip').onpointerdown = event => {
    if (event.target.closest('button')) return;
    const offsetX = event.clientX - card.offsetLeft;
    const offsetY = event.clientY - card.offsetTop;
    const follow = moveEvent => {
      card.style.left = `${Math.max(0, Math.min(innerWidth - card.offsetWidth, moveEvent.clientX - offsetX))}px`;
      card.style.top = `${Math.max(0, Math.min(innerHeight - card.offsetHeight, moveEvent.clientY - offsetY))}px`;
    };
    addEventListener('pointermove', follow);
    addEventListener('pointerup', () => removeEventListener('pointermove', follow), { once: true });
  };
}
function saveMark() {
  if (!pendingMemo) return;
  const note = $('#markDraft').value.trim();
  if (!note) return $('#markDraft').focus();
  const { range, quote, paragraph, category } = pendingMemo;
  const id = Date.now();
  marks.push({ id, chapter: state.chapter, paragraph, text: note, quote, category, done: false, selection: true });
  const walker = document.createTreeWalker($('#manuscript'), NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (range.intersectsNode(walker.currentNode)) nodes.push(walker.currentNode);
  nodes.reverse().forEach(node => {
    const part = document.createRange();
    part.setStart(node, node === range.startContainer ? range.startOffset : 0);
    part.setEnd(node, node === range.endContainer ? range.endOffset : node.length);
    if (part.collapsed) return;
    const mark = document.createElement('mark');
    mark.className = 'memo-mark';
    mark.dataset.memo = id;
    part.surroundContents(mark);
  });
  manuscriptBodies.set(state.chapter, $('#manuscript').innerHTML);
  closeMemoCard();
  toast('선택한 문장에 메모를 남겼습니다.');
  saved();
}
$('#memoButton').onpointerdown=event=>event.preventDefault();
$('#memoButton').onclick=newMark;
$('#addCategory').onclick=()=>{
  openPopover($('#addCategory'),'<p>새 구분</p><input id="categoryName" placeholder="구분 이름" style="width:100%;height:28px;padding:0 6px"><button class="main-action" id="saveCategory" style="margin-top:6px">구분 만들기</button>');
  $('#categoryName').focus();
  const store=()=>{
    const name=$('#categoryName').value.trim();
    if(!name||categories.includes(name)) return $('#categoryName').focus();
    categories.push(name);
    closePopover();
    renderMarks();
  };
  $('#saveCategory').onclick=store;
  $('#categoryName').onkeydown=event=>{if(event.key==='Enter')store();};
};
$('#pendingMarks').onclick = () => {
  state.markFinished = false;
  renderMarks();
};
$('#finishedMarks').onclick = () => {
  state.markFinished = true;
  renderMarks();
};
$('#newAnalysis').onclick = () => {
  $('#analysisNotes').innerHTML = '<div class="pane-head">가상의 작품 / 유리 숲의 우편함</div><textarea aria-label="분석 노트" placeholder="장면의 구조와 발견한 점을 적으세요."></textarea>';
  $('#analysisNotes textarea').focus();
  $('#analysisNotes textarea').oninput = saved;
};

function enterFocus() {
  closePopover();
  state.focus = true;
  focusSavedTheme = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = 'night';
  savedScroll = $('#writingScroll').scrollTop;
  $('#workspace').classList.add('focus-mode');
  $('#focusHint').hidden = false;
  $('#planet').style.opacity = '0';
  $('#dock').classList.add('concealed');
  const lineHeight = parseFloat(getComputedStyle($('#manuscript')).lineHeight);
  const center = innerHeight / 2 - $('#writingScroll').getBoundingClientRect().top;
  $('#workspace').style.setProperty('--focus-band-center', `${center}px`);
  $('#workspace').style.setProperty('--focus-falloff', `${lineHeight * 6}px`);
  $('#workspace').style.setProperty('--focus-half-line', `${lineHeight / 2}px`);
  const paragraph = $('[data-paragraph="4"]')||$('#manuscript');
  const range = document.createRange();
  const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
  const firstText = walker.nextNode();
  range.setStart(firstText || paragraph, 0);
  range.collapse(true);
  getSelection().removeAllRanges();
  getSelection().addRange(range);
  $('#manuscript').focus({ preventScroll: true });
  getSelection().removeAllRanges();
  getSelection().addRange(range);
  centerCaret();
}
function centerCaret() {
  if (!state.focus) return;
  const selection = getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rect = range.getBoundingClientRect();
  const scroller = $('#writingScroll');
  if (rect.height) scroller.scrollTop += rect.top + rect.height / 2 - innerHeight / 2;
}
document.addEventListener('selectionchange', () => {
  if (state.focus) requestAnimationFrame(centerCaret);
});
function exitFocus() {
  if (!state.focus) return;
  state.focus = false;
  $('#workspace').classList.remove('focus-mode');
  $('#focusHint').hidden = true;
  document.documentElement.dataset.theme = focusSavedTheme;
  $('#writingScroll').scrollTop = savedScroll;
  settlePlanet();
  showDock();
}
$('#exitFocus').onclick = exitFocus;

function openBook() {
  if(!$('#manuscript').textContent.trim()) {
    toast('미리 볼 문장을 먼저 적으세요.');
    return;
  }
  closePopover();
  const selection = getSelection();
  bookSelection = selection.rangeCount && $('#manuscript').contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
  savedScroll = $('#writingScroll').scrollTop;
  state.bookPage = 0;
  $('#bookPreview').hidden = false;
  renderBook();
  $('#closeBook').focus();
}
let measuredPages=[];
function paginateBook() {
  const page=document.createElement('article');
  page.className='book-page';
  page.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;';
  page.innerHTML='<div class="book-body"></div>';
  $('#bookSpread').append(page);
  const body=page.firstElementChild;
  const content=[...paragraphs,...bookContinuations.flat()];
  const pages=[];
  const capacity=body.clientHeight;
  const title='<h2>'+escapeHTML(chapters[state.chapter].title)+'</h2>';
  let html=title;
  let text='';
  for(const paragraph of content) {
    const characters=Array.from(paragraph);
    let remaining=characters.join('');
    while(remaining) {
      let low=0,high=remaining.length;
      while(low<high) {
        const mid=Math.ceil((low+high)/2);
        body.innerHTML=html+'<p>'+escapeHTML(text+remaining.slice(0,mid))+'</p>';
        if(body.scrollHeight<=capacity+1) low=mid;
        else high=mid-1;
      }
      if(low===0&&html==='') low=1;
      text+=remaining.slice(0,low);
      remaining=remaining.slice(low);
      if(remaining) {
        html+='<p>'+escapeHTML(text)+'</p>';
        pages.push(html);
        html='';
        text='';
      }
    }
    html+='<p>'+escapeHTML(text)+'</p>';
    text='';
  }
  if(html) pages.push(html);
  page.remove();
  measuredPages=pages;
  window.mockDiagnostics.book={pages:pages.length,capacity};
}
function renderBook(direction=0) {
  paginateBook();
  const facing=innerWidth>760;
  const number=facing?2:1;
  const lastSpread=Math.floor((measuredPages.length-1)/number)*number;
  state.bookPage=Math.min(state.bookPage,lastSpread);
  $('#bookSpread').innerHTML=Array.from({length:number},(_,i)=>{
    const n=state.bookPage+i;
    if(n>=measuredPages.length)return '<article class="book-page blank-page" aria-label="빈 쪽"></article>';
    return '<article class="book-page '+(direction?'turn-forward':'')+'" data-page-edge="'+(i===0?-1:1)+'"><div class="book-body">'+(measuredPages[n]||'')+'</div><span class="page-number">'+(n+1)+'</span></article>';
  }).join('');
  $('#pageCount').textContent=(state.bookPage+1)+(facing?'–'+Math.min(measuredPages.length,state.bookPage+2):'')+' / '+measuredPages.length;
  $('#prevPage').disabled=state.bookPage===0;
  $('#nextPage').disabled=state.bookPage>=lastSpread;
}
function turnBook(direction) {
  const amount=innerWidth>760?2:1;
  const lastSpread=Math.floor((measuredPages.length-1)/amount)*amount;
  state.bookPage=Math.max(0,Math.min(lastSpread,state.bookPage+direction*amount));
  renderBook(direction);
}
function closeBook() {
  $('#bookPreview').hidden = true;
  $('#writingScroll').scrollTop = savedScroll;
  $('#manuscript').focus({ preventScroll: true });
  if (bookSelection) {
    getSelection().removeAllRanges();
    getSelection().addRange(bookSelection);
  }
}
$('#closeBook').onclick = closeBook;
$('#bookTheme').onclick = themeToggle;
$('#nextPage').onclick = () => turnBook(1);
$('#prevPage').onclick = () => turnBook(-1);
$('#bookSpread').onclick = event => {
  const page = event.target.closest('.book-page');
  if (!page) return;
  const bounds = page.getBoundingClientRect();
  if (event.clientX < bounds.left + 45) turnBook(-1);
  if (event.clientX > bounds.right - 45) turnBook(1);
};
let swipeStart = null;
$('#bookSpread').addEventListener('pointerdown', event => {
  swipeStart = event.clientX;
});
$('#bookSpread').addEventListener('pointerup', event => {
  if (swipeStart !== null && Math.abs(event.clientX - swipeStart) > 45) turnBook(event.clientX < swipeStart ? 1 : -1);
  swipeStart = null;
});
$('#bookSpread').addEventListener('pointercancel', () => {
  swipeStart = null;
});

// Layout tools use the same pane tokens as all working screens.
$('#layoutButton').onclick = () => {
  openPopover($('#layoutButton'), `<button class="main-action" id="editLayout">레이아웃 편집</button>${state.layoutNames.map((name, index) => `<button data-preset="${index}">${escapeHTML(name)}</button>`).join('')}`);
  $('#editLayout').onclick = beginLayout;
  $$('[data-preset]').forEach(button => {
    button.onclick = () => {
      const index = Number(button.dataset.preset);
      const name = state.layoutNames[index];
      state.activeLayoutName = name;
      if (savedLayouts.has(name)) {
        applySavedLayout(savedLayouts.get(name));
        closePopover();
        toast(`「${name}」을 적용했습니다.`);
        return;
      }
      state.placement = index === 1 ? 'horizontal' : 'vertical';
      $('#editorColumn').classList.toggle('horizontal', index === 1);
      $('#plotBar').hidden = index !== 1;
      if (index === 1) renderPlotBar();
      state.writingWidth = index === 2 ? 720 : 580;
      document.documentElement.style.setProperty('--writing-width', `${state.writingWidth}px`);
      closePopover();
      toast(`「${state.layoutNames[index]}」을 적용했습니다.`);
    };
  });
};
function beginLayout() {
  hideIdea();
  closePopover();
  state.layout = true;
  $('#workspace').classList.add('layout-edit');
  layoutSnapshot = { style: document.documentElement.getAttribute('style'), theme: document.documentElement.dataset.theme, placement: state.placement, plotHidden: $('#plotBar').hidden, chapterHidden: $('#chaptersPane').hidden, dashboardHidden: $('#dashboard').hidden, editorStyle: $('#editorScreen').getAttribute('style'), state: { ...state }, paneStyles: ['#library', '#chaptersPane', '#plotBar', '#manuscriptPane', '#dashboard', '#manuscript'].map(selector => [selector, $(selector).getAttribute('style')]) };
  $('#normalActions').hidden = true;
  $('#editActions').hidden = false;
  $('#layoutOverlay').hidden = false;
  $('#layoutTools').hidden = false;
  $('#dock').hidden = true;
  renderTools();
  measureGuides();
  showDock();
}
function endLayout(commit) {
  if (!state.layout) return;
  if (!commit && layoutSnapshot) {
    document.documentElement.setAttribute('style', layoutSnapshot.style || '');
    document.documentElement.dataset.theme = layoutSnapshot.theme;
    Object.assign(state, layoutSnapshot.state);
    state.placement = layoutSnapshot.placement;
    $('#plotBar').hidden = layoutSnapshot.plotHidden;
    $('#chaptersPane').hidden = layoutSnapshot.chapterHidden;
    $('#dashboard').hidden = layoutSnapshot.dashboardHidden;
    $('#editorScreen').setAttribute('style', layoutSnapshot.editorStyle || '');
    layoutSnapshot.paneStyles.forEach(([selector, style]) => $(selector).setAttribute('style', style || ''));
    $('#editorColumn').classList.toggle('horizontal', state.placement === 'horizontal');
  }
  state.layout = false;
  $('#workspace').classList.remove('layout-edit');
  $('#normalActions').hidden = false;
  $('#editActions').hidden = true;
  $('#layoutOverlay').hidden = true;
  $('#layoutTools').hidden = true;
  $('#dock').hidden = false;
  settlePlanet();
  if (commit) toast('레이아웃을 저장했습니다.');
}
function captureLayout() {
  return {
    style: document.documentElement.getAttribute('style'),
    theme: document.documentElement.dataset.theme,
    placement: state.placement,
    plotHidden: $('#plotBar').hidden,
    chapterHidden: $('#chaptersPane').hidden,
    dashboardHidden: $('#dashboard').hidden,
    editorStyle: $('#editorScreen').getAttribute('style'),
    paneStyles: ['#library', '#chaptersPane', '#plotBar', '#manuscriptPane', '#dashboard', '#manuscript'].map(selector => [selector, $(selector).getAttribute('style')]),
    values: { typeSize: state.typeSize, uiSize: state.uiSize, lineSize: state.lineSize, paragraphSize: state.paragraphSize, writingWidth: state.writingWidth, margin: state.margin }
  };
}
function applySavedLayout(layout) {
  document.documentElement.setAttribute('style', layout.style || '');
  document.documentElement.dataset.theme = layout.theme;
  $('#themeButton').textContent = layout.theme === 'night' ? '낮으로' : '밤으로';
  state.placement = layout.placement;
  Object.assign(state, layout.values);
  $('#plotBar').hidden = layout.plotHidden;
  $('#chaptersPane').hidden = layout.chapterHidden;
  $('#dashboard').hidden = layout.dashboardHidden;
  $('#editorScreen').setAttribute('style', layout.editorStyle || '');
  $('#editorColumn').classList.toggle('horizontal', state.placement === 'horizontal');
  layout.paneStyles.forEach(([selector, style]) => $(selector).setAttribute('style', style || ''));
  if (!layout.plotHidden) renderPlotBar();
  settlePlanet();
}
$('#saveLayout').onclick = () => {
  savedLayouts.set(state.activeLayoutName, captureLayout());
  endLayout(true);
};
$('#cancelLayout').onclick = () => endLayout(false);
$('#saveAsLayout').onclick = () => {
  dialog('<button class="primary" id="confirmLayoutName">새 이름으로 저장</button><label>이름<input id="layoutName" value="나의 궤도"></label>', '#layoutName');
  $('#confirmLayoutName').onclick = () => {
    const name = $('#layoutName').value.trim() || '나의 궤도';
    if (!state.layoutNames.includes(name)) state.layoutNames.push(name);
    state.activeLayoutName = name;
    savedLayouts.set(name, captureLayout());
    closeDialog();
    endLayout(true);
  };
};
function stepper(name, value, suffix) {
  return `<div class="stepper">
<output id="value-${name}">${value}${suffix}</output>
<div>
<button data-step="${name}" data-direction="1" aria-label="${name} 올리기">▲</button>
<button data-step="${name}" data-direction="-1" aria-label="${name} 내리기">▼</button>
</div>
</div>`;
}
function renderTools() {
  const color = state.toolTab === 'color';
  $('#layoutTools').innerHTML = `<div class="tool-tabs" role="tablist" aria-label="레이아웃 도구">
<button role="tab" aria-selected="${!color}" id="typeTab" class="${!color ? 'active' : ''}">조판과 배치</button>
<button role="tab" aria-selected="${color}" id="colorTab" class="${color ? 'active' : ''}">색상</button>
</div>
<div id="typeTools" ${color ? 'hidden' : ''}>
<div class="tool-row">
<label for="fontChoice">글꼴</label>
<select id="fontChoice">
<option value="sans">고딕 / 맑은 고딕</option>
<option value="serif">명조 / 바탕</option>
</select>
</div>
<div class="tool-row">
<label for="fontTarget">적용 대상</label>
<select id="fontTarget">
<option>원고</option>
<option>화면</option>
</select>
</div>
<div class="tool-row">
<span>글자 크기</span>${stepper('글자', state.typeSize, 'px')}</div>
<div class="tool-row">
<span>줄 간격</span>${stepper('줄', state.lineSize, '%')}</div>
<div class="tool-row">
<span>문단 간격</span>${stepper('문단', state.paragraphSize, 'px')}</div>
<div class="tool-row">
<span>원고 폭</span>${stepper('폭', state.writingWidth, 'px')}</div>
<div class="tool-row">
<span>좌우 여백</span>${stepper('여백', state.margin, 'px')}</div>
<div class="tool-row tool-section">
<span>세부 전개 배치</span>
<div class="segmented">
<button id="placeVertical" class="${state.placement === 'vertical' ? 'active' : ''}">세로</button>
<button id="placeHorizontal" class="${state.placement === 'horizontal' ? 'active' : ''}">가로</button>
</div>
</div>
<div class="tool-row">
<span>화면</span>
<button id="layoutTheme">${document.documentElement.dataset.theme === 'night' ? '낮으로' : '밤으로'}</button>
</div>
<div class="pane-checks tool-section">
<label>
<input id="showChapters" type="checkbox" ${!$('#chaptersPane').hidden ? 'checked' : ''}>챕터</label>
<label>
<input id="showPlot" type="checkbox" ${!$('#plotBar').hidden ? 'checked' : ''}>세부 전개</label>
<label>
<input id="showDashboard" type="checkbox" ${!$('#dashboard').hidden ? 'checked' : ''}>대시보드</label>
</div>
</div>
<div id="colorTools" ${color ? '' : 'hidden'}>${colorToolsHTML()}</div>`;
  $('#typeTab').onclick = () => {
    state.toolTab = 'type';
    renderTools();
  };
  $('#colorTab').onclick = () => {
    state.toolTab = 'color';
    renderTools();
  };
  $('#fontChoice').onchange = event => {
    const family = event.target.value === 'serif' ? '"Batang", "AppleMyungjo", Georgia, serif' : '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    const target = $('#fontTarget').value;
    document.documentElement.style.setProperty(target === '화면' ? '--ui' : '--body', family);
  };
  $('#fontTarget').onchange = () => {
    $('#value-글자').textContent = `${$('#fontTarget').value === '화면' ? state.uiSize : state.typeSize}px`;
  };
  $$('[data-step]').forEach(button => {
    button.onclick = () => {
      const sizeTarget = $('#fontTarget').value === '화면' ? ['uiSize', '--ui-size', 'px', 10, 24] : ['typeSize', '--writing-size', 'px', 10, 30];
      const configuration = { '글자': sizeTarget, '줄': ['lineSize', '--writing-leading', '%', 100, 250], '문단': ['paragraphSize', '--paragraph-gap', 'px', 0, 64], '폭': ['writingWidth', '--writing-width', 'px', 300, 800], '여백': ['margin', null, 'px', 12, 100] }[button.dataset.step];
      const [key, token, suffix, min, max] = configuration;
      state[key] = Math.max(min, Math.min(max, state[key] + Number(button.dataset.direction)));
      if (token) document.documentElement.style.setProperty(token, `${state[key]}${suffix}`);
      else {
        $('#manuscript').style.paddingLeft = `${state.margin}px`;
        $('#manuscript').style.paddingRight = `${state.margin}px`;
      }
      $(`#value-${button.dataset.step}`).textContent = `${state[key]}${suffix}`;
      measureGuides();
    };
  });
  const placement = value => {
    state.placement = value;
    $('#editorColumn').classList.toggle('horizontal', value === 'horizontal');
    $('#plotBar').hidden = false;
    renderPlotBar();
    renderTools();
    measureGuides();
  };
  $('#placeVertical').onclick = () => placement('vertical');
  $('#placeHorizontal').onclick = () => placement('horizontal');
  $('#layoutTheme').onclick = async () => {
    await themeToggle();
    renderTools();
  };
  $('#showChapters').onchange = event => {
    $('#chaptersPane').hidden = !event.target.checked;
    document.documentElement.style.setProperty('--chapter-width', event.target.checked ? '206px' : '0px');
    measureGuides();
  };
  $('#showPlot').onchange = event => {
    $('#plotBar').hidden = !event.target.checked;
    if (event.target.checked) renderPlotBar();
    measureGuides();
  };
  $('#showDashboard').onchange = event => {
    $('#dashboard').hidden = !event.target.checked;
    document.documentElement.style.setProperty('--dash-width', event.target.checked ? '258px' : '0px');
    measureGuides();
    settlePlanet();
  };
  bindColorTools();
}
const colorTargets = ['전체', '보관함', '챕터', '세부 전개', '편집기', '대시보드', '글자'];
function colorToolsHTML() {
  const targets = { '전체': '#manuscriptPane', '보관함': '#library', '챕터': '#chaptersPane', '세부 전개': '#plotBar', '편집기': '#manuscriptPane', '대시보드': '#dashboard', '글자': '#manuscriptPane' };
  const style = getComputedStyle($(targets[state.colorTarget]));
  const rgb = (state.colorTarget === '글자' ? style.color : style.backgroundColor).match(/[\d.]+/g).slice(0, 3).map(Number);
  const currentColor = `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
  [colorH, colorS, colorL] = rgbToHSL(rgb);
  const position = spectrumPosition();
  return `<div class="color-targets" role="tablist" aria-label="색상 적용 대상">${colorTargets.map(target => `<button role="tab" data-color-target="${target}" aria-selected="${target === state.colorTarget}" class="${target === state.colorTarget ? 'active' : ''}">${target}</button>`).join('')}</div>
<div id="colorSpectrum" class="color-spectrum" style="--hue:${colorH}" aria-label="채도와 밝기" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${colorS}">
<span class="spectrum-cursor" style="left:${position.x}%;
top:${position.y}%">
</span>
</div>
<input id="colorHue" class="color-hue" type="range" aria-label="색상" min="0" max="360" value="${colorH}">
<div class="tool-row">
<label for="colorLight">밝기</label>
<input id="colorLight" class="color-light" type="range" min="0" max="100" value="${colorL}">
</div>
<div class="tool-row">
<label for="hexValue">HEX</label>
<input id="hexValue" class="hex-input" value="${currentColor}">
<label for="hslValue">HSL</label>
<input id="hslValue" class="hsl-input" value="${colorH}, ${colorS}%, ${colorL}%">
</div>
<div class="color-comparison">
<button id="currentColor" style="background:${currentColor};
color:${contrast(currentColor, '#101010') >= 4.5 ? '#101010' : '#f7f4e9'}">현재</button>
<button id="previousColor" style="background:${previousColor};
color:${contrast(previousColor, '#101010') >= 4.5 ? '#101010' : '#f7f4e9'}">이전</button>
</div>
<div class="color-swatches" aria-label="최근 색">${state.recentColors.map(color => `<button data-swatch="${color}" aria-label="최근 색 ${color}" style="background:${color}">
</button>`).join('')}</div>
<div class="palette-row">${['밤', '새벽', '모래', '심해'].map(name => `<button data-palette="${name}">${name}</button>`).join('')}</div>
<p class="contrast-result" id="contrastResult">
</p>`;
}
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function rgbToHSL(rgb) {
  const [r, g, b] = rgb.map(value => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return [Math.round((h * 60 + 360) % 360), Math.round(s * 100), Math.round(l * 100)];
}
function spectrumPosition() {
  const l = colorL / 100;
  const s = colorS / 100;
  const value = l + s * Math.min(l, 1 - l);
  return { x: value ? 200 * (1 - l / value) : 0, y: 100 * (1 - value) };
}
function syncColorControls(color) {
  [colorH, colorS, colorL] = rgbToHSL(color.slice(1).match(/../g).map(value => parseInt(value, 16)));
  $('#colorHue').value = colorH;
  $('#colorLight').value = colorL;
  $('#hslValue').value = `${colorH}, ${colorS}%, ${colorL}%`;
  $('#colorSpectrum').style.setProperty('--hue', colorH);
  const position = spectrumPosition();
  $('.spectrum-cursor').style.left = `${position.x}%`;
  $('.spectrum-cursor').style.top = `${position.y}%`;
  $('#previousColor').style.backgroundColor = previousColor;
  $('#previousColor').style.color = contrast(previousColor, '#101010') >= 4.5 ? '#101010' : '#f7f4e9';
}
function renderRecentColors() {
  $('.color-swatches').innerHTML = state.recentColors.map(color => `<button data-swatch="${color}" aria-label="최근 색 ${color}" style="background:${color}"></button>`).join('');
  $$('[data-swatch]').forEach(button => {
    button.onclick = () => {
      previousColor = $('#hexValue').value;
      setColor(button.dataset.swatch, true);
    };
  });
}
function luminance(rgb) {
  const parts = rgb.map(value => {
    const v = value / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  });
  return parts[0] * .2126 + parts[1] * .7152 + parts[2] * .0722;
}
function contrast(first, second) {
  const parse = value => value.startsWith('#') ? value.slice(1).match(/../g).map(part => parseInt(part, 16)) : value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const a = luminance(parse(first));
  const b = luminance(parse(second));
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
function setColor(color, remember = false) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return;
  const map = { '보관함': '#library', '챕터': '#chaptersPane', '세부 전개': '#plotBar', '편집기': '#manuscriptPane', '대시보드': '#dashboard' };
  if (state.colorTarget === '전체') {
    document.documentElement.style.setProperty('--bg', color);
    document.documentElement.style.setProperty('--panel', color);
    document.documentElement.style.setProperty('--paper', color);
  } else if (state.colorTarget === '글자') document.documentElement.style.setProperty('--text', color);
  else $(map[state.colorTarget]).style.backgroundColor = color;
  $('#hexValue').value = color;
  $('#currentColor').style.backgroundColor = color;
  $('#currentColor').style.color = contrast(color, '#101010') >= 4.5 ? '#101010' : '#f7f4e9';
  syncColorControls(color);
  const pane = state.colorTarget === '글자' || state.colorTarget === '전체' ? $('#manuscriptPane') : $(map[state.colorTarget]);
  const computed = getComputedStyle(pane);
  const ratio = contrast(computed.backgroundColor, computed.color);
  $('#contrastResult').textContent = ratio < 4.5 ? `${ratio.toFixed(2)}:1 — 글자를 읽기 어렵습니다. 4.5:1 이상으로 조절하세요.` : `${ratio.toFixed(2)}:1 — 본문 대비 기준을 충족합니다.`;
  $('#contrastResult').classList.toggle('warn', ratio < 4.5);
  if (remember && !state.recentColors.includes(color)) {
    state.recentColors.unshift(color);
    state.recentColors = state.recentColors.slice(0, 7);
  }
  if (remember) renderRecentColors();
}
function bindColorTools() {
  $$('[data-color-target]').forEach(button => {
    button.onclick = () => {
      state.colorTarget = button.dataset.colorTarget;
      renderTools();
    };
  });
  const applyHSL = () => {
    $('#colorSpectrum').style.setProperty('--hue', colorH);
    $('#colorSpectrum').setAttribute('aria-valuenow', colorS);
    setColor(hslToHex(colorH, colorS, colorL));
  };
  $('#colorHue').oninput = event => {
    colorH = Number(event.target.value);
    applyHSL();
  };
  $('#colorLight').oninput = event => {
    colorL = Number(event.target.value);
    applyHSL();
  };
  let choosing = false;
  const pick = event => {
    const bounds = $('#colorSpectrum').getBoundingClientRect();
    const saturation = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const value = Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height));
    const light = value * (1 - saturation / 2);
    colorL = Math.round(light * 100);
    colorS = light === 0 || light === 1 ? 0 : Math.round((value - light) / Math.min(light, 1 - light) * 100);
    $('#colorLight').value = colorL;
    applyHSL();
  };
  $('#colorSpectrum').onpointerdown = event => {
    choosing = true;
    previousColor = $('#hexValue').value;
    event.target.setPointerCapture(event.pointerId);
    pick(event);
  };
  $('#colorSpectrum').onpointermove = event => {
    if (choosing) pick(event);
  };
  $('#colorSpectrum').onpointerup = () => {
    choosing = false;
    setColor($('#hexValue').value, true);
  };
  $('#colorSpectrum').onkeydown = event => {
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') colorS = Math.max(0, colorS - 1);
    if (event.key === 'ArrowRight') colorS = Math.min(100, colorS + 1);
    if (event.key === 'ArrowUp') colorL = Math.min(100, colorL + 1);
    if (event.key === 'ArrowDown') colorL = Math.max(0, colorL - 1);
    applyHSL();
  };
  $('#hexValue').onchange = event => {
    previousColor = hslToHex(colorH, colorS, colorL);
    setColor(event.target.value, true);
  };
  $('#hslValue').onchange = event => {
    const values = event.target.value.match(/[\d.]+/g)?.map(Number);
    if (values?.length === 3) {
      [colorH, colorS, colorL] = values;
      applyHSL();
    }
  };
  $('#currentColor').onclick = () => {
    setColor($('#hexValue').value, true);
    toast('현재 색을 최근 색에 남겼습니다.');
  };
  $('#previousColor').onclick = () => {
    const next = previousColor;
    previousColor = $('#hexValue').value;
    setColor(next, true);
  };
  renderRecentColors();
  $$('[data-palette]').forEach(button => {
    button.onclick = () => {
      const palettes = { '밤': ['#101010', '#181818', '#1d1d1c', '#e7dcc4', '#76c7ff'], '새벽': ['#252524', '#2d2d2c', '#30302e', '#f0dfca', '#76c7ff'], '모래': ['#d8cdb6', '#e1d5bd', '#ebe0c9', '#292823', '#155c8c'], '심해': ['#121212', '#181818', '#20201f', '#e1dfca', '#76c7ff'] };
      document.documentElement.dataset.theme = button.dataset.palette === '모래' ? 'day' : 'night';
      $('#themeButton').textContent = document.documentElement.dataset.theme === 'night' ? '낮으로' : '밤으로';
      const [bg, panel, paper, text, accent] = palettes[button.dataset.palette];
      ['--bg', '--panel', '--paper', '--text', '--accent'].forEach((token, index) => document.documentElement.style.setProperty(token, [bg, panel, paper, text, accent][index]));
      ['#library', '#chaptersPane', '#plotBar', '#manuscriptPane', '#dashboard'].forEach(selector => {
        $(selector).style.backgroundColor = '';
      });
      setColor(state.colorTarget === '글자' ? text : state.colorTarget === '편집기' ? paper : bg, true);
    };
  });
  if (state.toolTab === 'color') {
    const computed = getComputedStyle($('#manuscriptPane'));
    const ratio = contrast(computed.backgroundColor, computed.color);
    $('#contrastResult').textContent = `${ratio.toFixed(2)}:1 — ${ratio >= 4.5 ? '본문 대비 기준을 충족합니다.' : '글자를 읽기 어렵습니다. 4.5:1 이상으로 조절하세요.'}`;
    $('#contrastResult').classList.toggle('warn', ratio < 4.5);
  }
}
function measureGuides() {
  if(!state.layout) return;
  const manuscript=$('#manuscript').getBoundingClientRect();
  const scroller=$('#writingScroll').getBoundingClientRect();
  const overlay=$('#layoutOverlay').getBoundingClientRect();
  const rect={left:manuscript.left+state.margin-8,top:scroller.top-overlay.top+3,width:manuscript.width-state.margin*2+16,height:scroller.height-4};
  Object.assign($('#writingBoundary').style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
  Object.assign($('.grip-writing').style,{left:rect.left-35+'px',top:rect.top+12+'px'});
  Object.assign($('.label-writing').style,{left:rect.left+40+'px',top:'8px'});
  $('.label-writing').textContent=Math.round(rect.width)+'px';
  $('.label-chapter').textContent=Math.round($('#chaptersPane').getBoundingClientRect().width)+'px';
  $('.label-dashboard').textContent=Math.round($('#dashboard').getBoundingClientRect().width)+'px';
  const hidden=$('#plotBar').hidden;
  $('#boundaryPlot').hidden=hidden;
  $('.grip-plot').hidden=hidden;
  $('.label-plot').hidden=hidden;
  if(!hidden) {
    const p=$('#plotBar').getBoundingClientRect();
    if(state.placement==='horizontal') {
      $('#boundaryPlot').className='boundary horizontal';
      $('#boundaryPlot').style.cssText='left:'+p.left+'px;top:'+(p.bottom-overlay.top)+'px;width:'+p.width+'px;bottom:auto;';
      $('.grip-plot').style.cssText='left:'+(p.left+8)+'px;top:'+(p.bottom-overlay.top+9)+'px;cursor:ns-resize;';
      $('.label-plot').style.cssText='left:'+(p.left+42)+'px;top:'+(p.bottom-overlay.top+9)+'px;';
      $('.label-plot').textContent=Math.round(p.height)+'px';
    } else {
      $('#boundaryPlot').className='boundary vertical';
      $('#boundaryPlot').style.cssText='left:'+p.right+'px;top:0;bottom:0;';
      $('.grip-plot').style.cssText='left:'+(p.right+9)+'px;top:8px;';
      $('.label-plot').style.cssText='left:'+(p.right+42)+'px;top:8px;';
      $('.label-plot').textContent=Math.round(p.width)+'px';
    }
  }
}
$$('[data-grip]').forEach(grip => {
  grip.onpointerdown = event => {
    event.preventDefault();
    grip.setPointerCapture(event.pointerId);
    const began = event.clientX;
    const initialChapter = $('#chaptersPane').getBoundingClientRect().width;
    const initialDash = $('#dashboard').getBoundingClientRect().width;
    const initialWriting = state.writingWidth;
    const initialPlot = $('#plotBar').getBoundingClientRect();
    const beganY = event.clientY;
    const move = next => {
      const delta = next.clientX - began;
      if (grip.dataset.grip === 'chapter') document.documentElement.style.setProperty('--chapter-width', `${Math.max(140, Math.min(300, initialChapter + delta))}px`);
      else if (grip.dataset.grip === 'dashboard') document.documentElement.style.setProperty('--dash-width', `${Math.max(180, Math.min(360, initialDash - delta))}px`);
      else if (grip.dataset.grip === 'plot') {
        if (state.placement === 'horizontal') {
          const height = Math.max(100, Math.min(320, initialPlot.height + next.clientY - beganY));
          $('#plotBar').style.height = `${height}px`;
          $('#plotBar').style.minHeight = `${height}px`;
        } else {
          const width = Math.max(150, Math.min(300, initialPlot.width + delta));
          $('#plotBar').style.width = `${width}px`;
          $('#plotBar').style.minWidth = `${width}px`;
        }
      } else {
        state.writingWidth = Math.max(300, Math.min(800, initialWriting - delta * 2));
        document.documentElement.style.setProperty('--writing-width', `${state.writingWidth}px`);
      }
      measureGuides();
      settlePlanet();
    };
    grip.onpointermove = move;
    grip.onpointerup = () => {
      grip.onpointermove = null;
    };
  };
});
document.addEventListener('keydown', event => {
  if (event.altKey && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    captureNote();
  }
  if (!$('#bookPreview').hidden && event.key === 'ArrowRight') {
    event.preventDefault();
    turnBook(1);
  }
  if (!$('#bookPreview').hidden && event.key === 'ArrowLeft') {
    event.preventDefault();
    turnBook(-1);
  }
  if (event.key === 'Escape') {
    if (!$('#modalShade').hidden) closeDialog();
    else if (!$('#bookPreview').hidden) closeBook();
    else if (state.focus) exitFocus();
    else if (entryAnimation) finishEntry();
    else if (state.layout) endLayout(false);
    else closePopover();
  }
});
window.addEventListener('resize', () => {
  if (inWorkspace) settlePlanet();
  if (state.layout) measureGuides();
  if (!$('#bookPreview').hidden) renderBook();
});
document.addEventListener('visibilitychange', () => {
  if(document.hidden) {planet.stop();sky.stop();}
  else if(!inWorkspace&&!reduced) {if(zoom===0)sky.start();else planet.start();}
});
renderChapters();
renderManuscript();
renderNotes();
// Lay out the first working surface beneath the opaque universe once.
// It stays inert until entry; the manuscript never leaves memory.
$('#workspace').hidden = false;
$('#workspace').inert = true;
$('#workspace').style.zIndex = '2';
$('#workspace').style.opacity = '.001';
$('#universe').style.zIndex = '1';



let dateOverride=null;
function moonPhase(date) {
  const period=29.530588853;
  const days=(date.getTime()-Date.UTC(2000,0,6,18,14))/86400000;
  const phase=((days/period)%1+1)%1;
  const names=['삭','초승달','상현달','차오르는 달','보름달','기우는 달','하현달','그믐달'];
  return {phase,illumination:(1-Math.cos(phase*Math.PI*2))/2,name:names[Math.floor(phase*8+.5)%8]};
}
function updateWit() {
  const date=dateOverride||new Date();
  const moon=moonPhase(date);
  const size=24;
  const canvas=document.createElement('canvas');
  canvas.width=size;
  canvas.height=size;
  const ctx=canvas.getContext('2d');
  const image=ctx.createImageData(size,size);
  const angle=moon.phase*Math.PI*2;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const nx=(x-11.5)/11.5,ny=(y-11.5)/11.5;
    if(nx*nx+ny*ny>1) continue;
    const nz=Math.sqrt(1-nx*nx-ny*ny);
    const light=nx*Math.sin(angle)-nz*Math.cos(angle);
    const brightness=light>0?.92:.18;
    const i=(y*size+x)*4;
    image.data[i]=231*brightness;
    image.data[i+1]=220*brightness;
    image.data[i+2]=196*brightness;
    image.data[i+3]=255;
  }
  ctx.putImageData(image,0,0);
  $('#tonightMoon').style.background='url('+canvas.toDataURL()+') center / contain';
  $('#tonightMoon').title='오늘 달: '+moon.name;
  $('#tonightMoon').setAttribute('aria-label','오늘 달: '+moon.name);
  $('#tonightMoon').hidden=!wit.moon;
  $('#nightDate').textContent=(date.getMonth()+1)+'월 '+date.getDate()+'일';
  $('#manuscript').dataset.placeholder=wit.empty?'아직 아무도 착륙하지 않은 곳입니다.':'첫 문장을 적으세요.';
}
// Most wit touches appear only at a particular moment (a save, every 1,000 characters,
// a finished chapter, an empty chapter, entering the desk). Each row can play its moment on demand.
const witItems = [
  ['moon', '달', '위 막대에 오늘 밤의 달 모양'],
  ['save', '저장 궤도', '저장될 때 작은 궤도를 한 바퀴'],
  ['comet', '혜성', '1,000자마다 원고 위를 지나감'],
  ['empty', '빈 장', '빈 장의 첫 줄 문구'],
  ['satellite', '완성 표시', '목표를 채운 챕터가 금빛으로'],
  ['idea', '떠오른 아이디어', '집필 창에 들어오면 노트 한 줄이 별똥별처럼']
];
let witPreviewTimer = null;
let ideaTimer = null;
function pulse(element) {
  element.classList.remove('wit-pulse');
  void element.offsetWidth;
  element.classList.add('wit-pulse');
}
function playComet(path = 'across') {
  const comet = $('#writingComet');
  if (reduced) return Promise.resolve();
  comet.hidden = false;
  comet.getAnimations().forEach(animation => animation.cancel());
  const frames = path === 'idea'
    ? [{ transform: 'translate(0,0) rotate(18deg)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'translate(46vw,22vh) rotate(18deg)', opacity: 0 }]
    : [{ transform: 'translate(0,0) rotate(14deg)', opacity: 0 }, { opacity: 1, offset: .18 }, { transform: 'translate(70vw,16vh) rotate(14deg)', opacity: 0 }];
  return comet.animate(frames, { duration: 1500, easing: 'cubic-bezier(.3,.1,.2,1)' }).finished.then(() => {
    comet.hidden = true;
  });
}
function hideIdea() {
  clearTimeout(ideaTimer);
  $('#ideaSpark').hidden = true;
}
async function showIdea() {
  const pool = notes.filter(note => note.text.trim());
  if (!pool.length) return;
  const note = pool[Math.floor(Math.random() * pool.length)];
  await playComet('idea');
  const spark = $('#ideaSpark');
  spark.innerHTML = `<span class="idea-star" aria-hidden="true"><svg><use href="#star"/></svg></span><div><small>아이디어 노트에서 떨어진 별</small><p>${escapeHTML(note.text)}</p></div><button id="ideaOpen">노트</button><button id="ideaClose" aria-label="닫기">×</button>`;
  spark.hidden = false;
  $('#ideaClose').onclick = hideIdea;
  $('#ideaOpen').onclick = () => {
    hideIdea();
    showSection('ideas');
  };
  clearTimeout(ideaTimer);
  ideaTimer = setTimeout(hideIdea, 12000);
}
function gleamCompleted() {
  $$('.chapter-row.complete').forEach(row => {
    row.classList.remove('gleam');
    void row.offsetWidth;
    row.classList.add('gleam');
  });
}
function previewWit(key) {
  if (key === 'moon') {
    $('#tonightMoon').hidden = false;
    pulse($('#tonightMoon'));
    toast($('#tonightMoon').title);
  }
  if (key === 'save') {
    $('#saveStatus').textContent = '저장됨';
    $('#saveStatus').classList.remove('save-orbit');
    void $('#saveStatus').offsetWidth;
    $('#saveStatus').classList.add('save-orbit');
  }
  if (key === 'comet') {
    closePopover();
    playComet();
  }
  if (key === 'empty') {
    const manuscript = $('#manuscript');
    const body = manuscript.innerHTML;
    manuscript.dataset.placeholder = '아직 아무도 착륙하지 않은 곳입니다.';
    manuscript.contentEditable = 'false';
    manuscript.innerHTML = '';
    clearTimeout(witPreviewTimer);
    witPreviewTimer = setTimeout(() => {
      manuscript.innerHTML = body;
      manuscript.contentEditable = 'true';
      updateWit();
    }, 2600);
  }
  if (key === 'satellite') {
    const enabled = wit.satellite;
    wit.satellite = true;
    renderChapters();
    gleamCompleted();
    if (!enabled) {
      setTimeout(() => {
        wit.satellite = enabled;
        renderChapters();
      }, 2600);
    }
  }
  if (key === 'idea') {
    closePopover();
    showIdea();
  }
}
$('#witButton').onclick = () => {
  const rows = witItems.map(([key, label, note]) => `<div class="wit-row"><label><input type="checkbox" data-wit="${key}" ${wit[key] ? 'checked' : ''}><span><b>${label}</b><small>${note}</small></span></label><button data-wit-preview="${key}">보기</button></div>`).join('');
  openPopover($('#witButton'), `<div class="wit-panel"><div class="wit-head"><span>위트 시안</span><button id="witOff">모두 끄기</button></div>${rows}</div>`);
  $('#popover').classList.add('wide');
  $$('[data-wit]').forEach(input => {
    input.onchange = () => {
      wit[input.dataset.wit] = input.checked;
      renderChapters();
      updateWit();
    };
  });
  $$('[data-wit-preview]').forEach(button => {
    button.onclick = () => previewWit(button.dataset.witPreview);
  });
  $('#witOff').onclick = () => {
    Object.keys(wit).forEach(key => {
      wit[key] = false;
    });
    $$('[data-wit]').forEach(input => {
      input.checked = false;
    });
    renderChapters();
    updateWit();
  };
};
// A memo left on the text opens again when its underline is clicked.
$('#manuscript').addEventListener('click', event => {
  const element = event.target.closest('.memo-mark');
  if (!element || !getSelection().isCollapsed) return;
  const mark = marks.find(item => item.id === Number(element.dataset.memo));
  if (!mark) return;
  openMemoView(mark, element.getBoundingClientRect());
});
function openMemoView(mark, spot) {
  closePopover();
  const card = $('#memoCard');
  const chips = categories.map((name, index) => `<button role="radio" aria-checked="${name === mark.category}" data-memo-category="${index}">${escapeHTML(name)}</button>`).join('');
  card.innerHTML = `<div class="memo-card-head" id="memoGrip"><span class="memo-card-title">메모 · 제${mark.chapter + 1}장</span><button class="memo-close" id="memoClose" aria-label="메모 닫기">×</button></div>
<textarea id="markDraft" aria-label="메모 내용">${escapeHTML(mark.text)}</textarea>
<div class="memo-chips" role="radiogroup" aria-label="구분">${chips}</div>
<div class="memo-card-foot"><button id="finishMark">완료</button><span class="memo-hint">Ctrl+Enter</span><button class="primary" id="saveMark">저장</button></div>`;
  card.hidden = false;
  const box = card.getBoundingClientRect();
  card.style.left = `${Math.max(12, Math.min(innerWidth - box.width - 12, spot.left))}px`;
  card.style.top = `${spot.bottom + 10 + box.height > innerHeight ? Math.max(56, spot.top - box.height - 10) : spot.bottom + 10}px`;
  pendingMemo = null;
  let category = mark.category;
  $$('[data-memo-category]', card).forEach(button => {
    button.onclick = () => {
      category = categories[Number(button.dataset.memoCategory)];
      $$('[data-memo-category]', card).forEach(other => other.setAttribute('aria-checked', String(other === button)));
    };
  });
  const store = () => {
    mark.text = $('#markDraft').value.trim() || mark.text;
    mark.category = category;
    closeMemoCard();
    saved();
  };
  $('#memoClose').onclick = closeMemoCard;
  $('#saveMark').onclick = store;
  $('#finishMark').onclick = () => {
    mark.done = true;
    closeMemoCard();
    renderManuscript();
    saved();
    toast('메모를 완료했습니다.');
  };
  card.onkeydown = event => {
    if (event.key === 'Escape') closeMemoCard();
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) store();
  };
}
$('#manuscript').addEventListener('input',()=>{
  hideIdea();
  if(applyHeadingMarks($('#manuscript'))) manuscriptBodies.set(state.chapter,$('#manuscript').innerHTML);
  renderOutline();
  const length=$('#manuscript').textContent.length;
  const previous=writtenCharacters;
  const delta=length-lastManuscriptLength;
  projects[selectedProject].today+=Math.max(0,delta);
  updateGrowth(Math.max(0,state.characterCount+delta)/state.goalTarget*100);
  writtenCharacters+=Math.max(0,length-lastManuscriptLength);
  lastManuscriptLength=length;
  if(wit.comet&&Math.floor(previous/1000)<Math.floor(writtenCharacters/1000)) playComet();
  updateWit();
});
updateWit();
window.mockV3={
  state,projects,marks,categories,wit,selectWorld,flyOut,chooseForm,moonPhase,enterWorld,backToUniverse,showSection,measureGuides,
  cast,chapters,paragraphs,manuscriptBodies,notes,subplots,stageNames,pathBadge,pathInfo,allPaths,categoryTones,chapterBody,saved,toast,escapeHTML,playComet,
  get selectedProject(){return selectedProject;},
  setDate(date){dateOverride=new Date(date);updateWit();},
  setWritten(value){writtenCharacters=value;},
  setZoom, moveWorld,
  get zoom(){return zoom;}
};
$('#wholeSky').addEventListener('wheel',async event=>{
  if(event.target.closest('button,a')) return;
  event.preventDefault();
  if(event.deltaY<=0&&zoom===0) return;
  if(zoom===0) await selectWorld(0,false,.02);
  setZoom(Math.min(1,Math.max(0,zoom+event.deltaY*.001)));
  if(zoom===1)sky.stop();
  else sky.start();
},{passive:false});
const pinch=new Map();
let pinchDistance=0;
for(const surface of [$('#wholeSky'),$('#universe')]) {
  surface.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch') return;
    pinch.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch.size===2) {
      dragFrom = null;
      const [a,b]=[...pinch.values()];
      pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);
      if(zoom===0) selectWorld(0,false,.02);
    }
  });
  surface.addEventListener('pointermove',event=>{
    if(!pinch.has(event.pointerId)) return;
    pinch.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch.size!==2) return;
    const [a,b]=[...pinch.values()];
    const distance=Math.hypot(a.x-b.x,a.y-b.y);
    setZoom(zoom+(distance-pinchDistance)*.004);
    if(zoom<1)sky.start();else sky.stop();
    if(zoom>0&&!reduced)planet.start();else planet.stop();
    pinchDistance=distance;
  });
  surface.addEventListener('pointerup',event=>pinch.delete(event.pointerId));
  surface.addEventListener('pointercancel',event=>pinch.delete(event.pointerId));
}
if(new URLSearchParams(location.search).has('editor')) {
  await selectWorld(0,false);
  enterWorld();
}
