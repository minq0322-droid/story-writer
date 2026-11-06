// "# ", "## ", "### " typed at the start of a paragraph turn it into a heading.
// Headings build the outline (개요) on the desk and on the phone.
export function applyHeadingMarks(editor) {
  const selection = getSelection();
  const node = selection.anchorNode;
  const block = node && (node.nodeType === 1 ? node : node.parentElement)?.closest('p, h3, h4, h5');
  if (!block || !editor.contains(block) || block.tagName !== 'P') return false;
  const match = block.textContent.match(/^(#{1,3})[\s ]/);
  if (!match) return false;
  const heading = document.createElement(['h3', 'h4', 'h5'][match[1].length - 1]);
  heading.className = 'story-heading';
  heading.textContent = block.textContent.slice(match[0].length) || '​';
  block.replaceWith(heading);
  const range = document.createRange();
  range.setStart(heading.firstChild, heading.textContent === '​' ? 1 : 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
export function headingsOf(editor) {
  return [...editor.querySelectorAll('h3, h4, h5')].filter(element => element.textContent.replace('​', '').trim());
}
export function setBlock(editor, tag) {
  const selection = getSelection();
  const node = selection.anchorNode;
  const block = node && (node.nodeType === 1 ? node : node.parentElement)?.closest('p, h3, h4, h5, blockquote');
  if (!block || !editor.contains(block)) return;
  const next = document.createElement(tag);
  if (tag === 'blockquote') next.className = 'story-quote';
  else if (tag !== 'p') next.className = 'story-heading';
  if (block.dataset.paragraph) next.dataset.paragraph = block.dataset.paragraph;
  next.innerHTML = block.innerHTML;
  block.replaceWith(next);
}
