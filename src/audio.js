(() => {
  const players = [...document.querySelectorAll('[data-yandex-player]')];
  if (!players.length) return;

  const tracks = [
    {
      title: 'In Another',
      artist: 'Artificial Intelligence Memory Disc',
      albumId: '43116656',
      trackId: '153777293',
      cover: 'https://avatars.yandex.net/get-music-content/20372582/e825ce71.a.43116656-1/200x200',
    },
    {
      title: 'Dolphin Love',
      artist: 'Dolphin Love',
      albumId: '34555298',
      trackId: '134276237',
      cover: 'https://avatars.yandex.net/get-music-content/14369544/2500c8e7.a.34555298-2/200x200',
    },
    {
      title: 'To The Ground',
      artist: 'Broosnica',
      albumId: '43181160',
      trackId: '118837907',
      cover: 'https://avatars.yandex.net/get-music-content/20013662/8dbd5d15.a.43181160-1/200x200',
    },
    {
      title: 'Sour Lofi Fruits',
      artist: 'Chillhop Music, Lofi Sleep Chill & Study, Lo Fi Hip Hop',
      albumId: '16905929',
      trackId: '87457110',
      cover: 'https://avatars.yandex.net/get-music-content/5207413/da6ec3ee.a.16905929-1/200x200',
    },
    {
      title: 'snowfall',
      artist: 'Øneheart, reidenshi',
      albumId: '20123688',
      trackId: '97576585',
      cover: 'https://avatars.yandex.net/get-music-content/4468850/b11c05f3.a.20123688-1/200x200',
    },
  ];

  const STORAGE_KEY = 'portfolio-yandex-track-v1';
  let trackIndex = 0;

  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(stored)) trackIndex = ((stored % tracks.length) + tracks.length) % tracks.length;
  } catch (_) { /* localStorage may be unavailable for file:// pages */ }

  function embedUrl(track) {
    return `https://music.yandex.ru/iframe/#track/${track.trackId}/${track.albumId}`;
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
    const track = tracks[trackIndex];
    if (frame && frame.dataset.trackId !== track.trackId) {
      frame.src = embedUrl(track);
      frame.dataset.trackId = track.trackId;
    }
    player.classList.add('yandex-open');
    player.querySelector('[data-yandex-toggle]')?.setAttribute('aria-expanded', 'true');
    player.querySelector('[data-yandex-popup]')?.setAttribute('aria-hidden', 'false');
  }

  function updateUi() {
    const track = tracks[trackIndex];
    document.querySelectorAll('[data-track-title]').forEach((label) => {
      label.textContent = track.title;
    });
    document.querySelectorAll('[data-track-cover]').forEach((cover) => {
      cover.src = track.cover;
      cover.alt = `Обложка трека ${track.title}`;
    });
    document.querySelectorAll('[data-yandex-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `Открыть ${track.title} — ${track.artist} в Яндекс Музыке`);
    });
    document.querySelectorAll('[data-audio-next]').forEach((button) => {
      button.setAttribute('aria-label', `Следующий трек после ${track.title}`);
    });
    players.forEach((player) => {
      const frame = player.querySelector('[data-yandex-frame]');
      if (frame && player.classList.contains('yandex-open')) {
        frame.src = embedUrl(track);
        frame.dataset.trackId = track.trackId;
      }
    });
  }

  function nextTrack() {
    trackIndex = (trackIndex + 1) % tracks.length;
    try { localStorage.setItem(STORAGE_KEY, String(trackIndex)); } catch (_) { /* keep session state */ }
    updateUi();
  }

  players.forEach((player) => {
    const toggle = player.querySelector('[data-yandex-toggle]');
    const close = player.querySelector('[data-yandex-close]');
    const next = player.querySelector('[data-audio-next]');

    toggle?.addEventListener('click', () => {
      if (player.classList.contains('yandex-open')) closePlayer(player);
      else openPlayer(player);
    });
    close?.addEventListener('click', () => closePlayer(player));
    next?.addEventListener('click', nextTrack);
  });

  document.addEventListener('pointerdown', (event) => {
    players.forEach((player) => {
      if (player.classList.contains('yandex-open') && !player.contains(event.target)) closePlayer(player);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') players.forEach(closePlayer);
  });

  updateUi();

  if (window.location.protocol === 'file:') {
    const message = 'Откройте сайт через ОТКРЫТЬ_САЙТ.bat';
    document.querySelectorAll('.planet-loader, .model-loader').forEach((loader) => {
      loader.textContent = message;
    });
  }
})();
