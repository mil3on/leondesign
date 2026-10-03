(() => {
  const players = [...document.querySelectorAll('[data-yandex-player]')];
  if (!players.length) return;

  const playlistUrl = 'https://music.yandex.ru/iframe/playlist/zuevleon17/1003';

  function repositionPopup(player) {
    const popup = player.querySelector('[data-yandex-popup]');
    if (!popup || !player.classList.contains('yandex-open')) return;

    popup.style.setProperty('--popup-shift-x', '0px');
    window.requestAnimationFrame(() => {
      const gutter = 12;
      const rect = popup.getBoundingClientRect();
      let shift = 0;
      if (rect.left < gutter) shift += gutter - rect.left;
      if (rect.right > window.innerWidth - gutter) shift -= rect.right - (window.innerWidth - gutter);
      popup.style.setProperty('--popup-shift-x', `${shift}px`);
    });
  }

  function closePlayer(player) {
    player.classList.remove('yandex-open');
    player.querySelector('[data-yandex-toggle]')?.setAttribute('aria-expanded', 'false');
    player.querySelector('[data-yandex-popup]')?.setAttribute('aria-hidden', 'true');
  }

  function openPlayer(player) {
    players.forEach((candidate) => {
      if (candidate !== player) closePlayer(candidate);
    });

    const frame = player.querySelector('[data-yandex-frame]');
    if (frame && !frame.src) frame.src = playlistUrl;
    player.classList.add('yandex-open');
    player.querySelector('[data-yandex-toggle]')?.setAttribute('aria-expanded', 'true');
    player.querySelector('[data-yandex-popup]')?.setAttribute('aria-hidden', 'false');
    repositionPopup(player);
  }

  players.forEach((player) => {
    const toggle = player.querySelector('[data-yandex-toggle]');
    const openButton = player.querySelector('[data-yandex-open]');
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let closeTimer = 0;
    let openTimer = 0;

    toggle?.addEventListener('click', () => {
      if (hasHover) openPlayer(player);
      else if (player.classList.contains('yandex-open')) closePlayer(player);
      else openPlayer(player);
    });
    openButton?.addEventListener('click', () => openPlayer(player));

    if (hasHover) {
      player.addEventListener('pointerenter', () => {
        window.clearTimeout(closeTimer);
        openTimer = window.setTimeout(() => openPlayer(player), 320);
      });
      player.addEventListener('pointerleave', () => {
        window.clearTimeout(openTimer);
        closeTimer = window.setTimeout(() => closePlayer(player), 180);
      });
    }
  });

  window.addEventListener('resize', () => {
    players.forEach(repositionPopup);
  });

  document.addEventListener('pointerdown', (event) => {
    players.forEach((player) => {
      if (player.classList.contains('yandex-open') && !player.contains(event.target)) closePlayer(player);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') players.forEach(closePlayer);
  });

  if (window.location.protocol === 'file:') {
    const message = 'Откройте сайт через ОТКРЫТЬ_САЙТ.bat';
    document.querySelectorAll('.planet-loader, .model-loader').forEach((loader) => {
      loader.textContent = message;
    });
  }
})();
