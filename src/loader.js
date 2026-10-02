(() => {
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  const label = loader.querySelector('.site-loader__label');
  let progress = 8;
  let finished = false;

  const update = (next, text) => {
    progress = Math.max(progress, Math.min(100, Math.round(next)));
    loader.style.setProperty('--loader-progress', `${progress}%`);
    if (text) label.textContent = text;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    update(100, 'Готово');
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, 260);
    window.setTimeout(() => loader.remove(), 1000);
  };

  document.addEventListener('DOMContentLoaded', () => update(18, 'Загружаю окружение…'));
  window.addEventListener('portfolio:planet-progress', (event) => {
    const modelProgress = Number(event.detail?.progress) || 0;
    update(22 + modelProgress * .72, 'Собираю 3D-мир…');
  });
  window.addEventListener('portfolio:planet-ready', finish, { once: true });
  window.addEventListener('portfolio:planet-error', finish, { once: true });

  // Страница должна оставаться доступной даже при медленном соединении или ошибке WebGL.
  window.setTimeout(finish, 18000);
})();
