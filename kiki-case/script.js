const overlay = document.getElementById('scenario-overlay');
const openButton = document.getElementById('open-scenario');
const closeButton = document.getElementById('close-scenario');
const mobileFrame = document.getElementById('mobile-scenario');

function openScenario() {
  mobileFrame.src = '../kiki-prototype/index.html?v=5';
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  closeButton.focus();
}

function closeScenario() {
  overlay.hidden = true;
  mobileFrame.removeAttribute('src');
  document.body.style.overflow = '';
  openButton.focus();
}

openButton.addEventListener('click', openScenario);
closeButton.addEventListener('click', closeScenario);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !overlay.hidden) closeScenario();
});
