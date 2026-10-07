(() => {
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  const label = loader.querySelector('.site-loader__label');
  const value = loader.querySelector('.site-loader__value');
  let progress = 8;
  let finished = false;

  const update = (next, text) => {
    progress = Math.max(progress, Math.min(100, Math.round(next)));
    if (value) value.textContent = `${progress}%`;
    if (text) label.textContent = text;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    update(100);
    loader.classList.add('is-complete');
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, 550);
    window.setTimeout(() => loader.remove(), 1100);
  };

  document.addEventListener('DOMContentLoaded', () => {
    update(18, 'Загружаю мир…');
    // Не блокируем интерфейс из-за медленной сети или слабого WebGL.
    window.setTimeout(finish, 1600);
  });
  window.addEventListener('portfolio:planet-progress', (event) => {
    const modelProgress = Number(event.detail?.progress) || 0;
    update(22 + modelProgress * .72, 'Загружаю мир…');
  });
  window.addEventListener('portfolio:planet-ready', finish, { once: true });
  window.addEventListener('portfolio:planet-error', finish, { once: true });

  // Страница должна оставаться доступной даже при медленном соединении или ошибке WebGL.
  window.setTimeout(finish, 5000);
})();
