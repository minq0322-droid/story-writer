// When the sky runs inside the writing app, the app owns the works and the desk.
// The mock keeps working on its own when it is opened directly.
const host = window.parent !== window ? window.parent : null;
if (host && window.__storyWorlds) {
  const $ = selector => document.querySelector(selector);
  const post = message => host.postMessage({ source: 'story-world', ...message }, location.origin);
  document.documentElement.classList.add('embedded');
  const wait = () => new Promise(resolve => {
    const check = () => window.mockV3 ? resolve() : requestAnimationFrame(check);
    check();
  });
  await wait();
  const mock = window.mockV3;
  // Totals and the count line come from the real works, not the mock's sample sky.
  const total = mock.projects.reduce((sum, work) => sum + work.text, 0);
  const volumes = mock.projects.reduce((sum, work) => sum + work.volumes, 0);
  const notes = mock.projects.reduce((sum, work) => sum + work.notes, 0);
  const totals = $('#skyTotals');
  if (totals) totals.textContent = `${total.toLocaleString('ko-KR')}자　${volumes}권　${notes}개의 아이디어`;
  const line = $('.sky-title p');
  if (line) line.textContent = mock.projects.length === 1 ? '한 개의 세계가 자라고 있습니다.' : `${mock.projects.length}개의 세계가 자라고 있습니다.`;
  // A single work has no neighbours to swipe to.
  if (mock.projects.length < 2) document.documentElement.classList.add('single-world');
  const current = () => mock.projects[mock.selectedProject];
  // Entering a world: the planet glides and fades while the app raises its desk underneath.
  const enter = () => {
    const work = current();
    if (!work) return;
    post({ type: 'enter', id: work.id });
    const planet = $('#planet');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !planet) return;
    const box = planet.getBoundingClientRect();
    const dx = (innerWidth / 2 - (box.left + box.width / 2)) * .3;
    const dy = (innerHeight / 2 - (box.top + box.height / 2)) * .3 + box.height * .08;
    const duration = matchMedia('(max-width: 700px)').matches ? 420 : 840;
    const glide = 'cubic-bezier(.2,.75,.18,1)';
    planet.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * .55}px,${dy * .55}px) scale(1.08)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(1.15)`, opacity: 0 }], { duration, easing: glide, fill: 'forwards' });
    $('#universe')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.min(420, duration), easing: 'ease-out', fill: 'forwards' });
  };
  mock.enterWorld = enter;
  $('#planetHit').onclick = enter;
  // Sun = idea notes, + = a new work, both handled by the app.
  $('#sunButton')?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    post({ type: 'ideas', id: current()?.id });
  }, true);
  const plus = $('#skyNew');
  if (plus) plus.onclick = () => post({ type: 'new' });
  // Growth follows the real goal; shape choices are kept by the app.
  const growth = $('#growth');
  if (growth) growth.disabled = true;
  window.addEventListener('planet-shape', event => post({ type: 'shape', ...event.detail }));
  const shapeStatus = document.createElement('small');
  shapeStatus.setAttribute('role', 'status');
  $('#planetForm')?.after(shapeStatus);
  document.querySelectorAll('a[href="states.html"]').forEach(link => link.setAttribute('hidden', ''));
  // The app asks the sky to show again (Dock → 우주로) and to reset after an entry.
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.source !== 'story-app') return;
    if (event.source !== host) return;
    if (event.data.type === 'shape-error') shapeStatus.textContent = '모양 저장 실패 · 다시 선택해 주세요';
    if (event.data.type === 'shape-saved') shapeStatus.textContent = '저장됨';
    if (event.data.type === 'reset') {
      document.getAnimations().forEach(animation => animation.cancel());
      mock.flyOut?.();
    }
  });
  post({ type: 'ready' });
}
