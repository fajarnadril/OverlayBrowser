const wrap = document.getElementById('wrap');

let isDragging = false;
let hasMoved   = false;
let startX, startY;

wrap.addEventListener('mouseenter', () => { if (!isDragging) wrap.classList.add('hover'); });
wrap.addEventListener('mouseleave', () => { if (!isDragging) wrap.classList.remove('hover'); });

wrap.addEventListener('mousedown', (e) => {
  isDragging = true;
  hasMoved   = false;
  startX = e.screenX;
  startY = e.screenY;
  wrap.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.screenX - startX;
  const dy = e.screenY - startY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    hasMoved = true;
    startX = e.screenX;
    startY = e.screenY;
    window.floatAPI.moveBy(dx, dy);
  }
});

document.addEventListener('mouseup', async () => {
  if (!isDragging) return;
  wrap.classList.remove('dragging');
  isDragging = false;

  if (!hasMoved) {
    // treated as a click → show main window
    await window.floatAPI.showMain();
  } else {
    // save final drag position
    await window.floatAPI.savePosition();
  }

  wrap.classList.remove('hover');
});
