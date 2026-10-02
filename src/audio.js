(() => {
  const buttons = [...document.querySelectorAll('[data-audio-toggle]')];
  const nextButtons = [...document.querySelectorAll('[data-audio-next]')];
  const volumeInputs = [...document.querySelectorAll('[data-audio-volume]')];
  const playerContainers = [...document.querySelectorAll('.sound-player')];
  const soundtrack = document.querySelector('#soundtrack');
  if (!buttons.length || !soundtrack) return;

  const tracks = [
    { title: 'In Another', file: 'in-another.mp3', cover: 'in another cover.png' },
    { title: 'Dolphin Love', file: 'Dolphin Love.mp3', cover: 'dolphine love cover.webp' },
    { title: 'Highest In The Room', file: 'highest in the room.mp3', cover: 'highest in the room.webp' },
    { title: 'To The Ground', file: 'To The Ground.mp3', cover: 'to the ground cover.webp' },
  ];

  const STORAGE_KEY = 'portfolio-audio-state-v2';
  const WINDOW_NAME_PREFIX = 'portfolio-audio:';
  const DEFAULT_STATE = { enabled: false, trackIndex: 0, currentTime: 0, volume: 0.32, updatedAt: 0 };
  const audioBaseUrl = new URL('.', soundtrack.src);
  const iconBaseUrl = new URL('../icons/iconixto/linear/', audioBaseUrl);
  let desiredEnabled = false;
  let trackIndex = 0;
  let lastSavedAt = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function validState(value) {
    if (!value || typeof value !== 'object') return null;
    return {
      enabled: Boolean(value.enabled),
      trackIndex: Number.isFinite(Number(value.trackIndex)) ? clamp(Math.floor(Number(value.trackIndex)), 0, tracks.length - 1) : 0,
      currentTime: Number.isFinite(Number(value.currentTime)) ? Math.max(0, Number(value.currentTime)) : 0,
      volume: Number.isFinite(Number(value.volume)) ? clamp(Number(value.volume), 0, 1) : DEFAULT_STATE.volume,
      updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
    };
  }

  function readState() {
    const candidates = [];
    try {
      const saved = validState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
      if (saved) candidates.push(saved);
    } catch (_) { /* localStorage may be unavailable for file:// pages */ }
    try {
      if (window.name.startsWith(WINDOW_NAME_PREFIX)) {
        const saved = validState(JSON.parse(window.name.slice(WINDOW_NAME_PREFIX.length)));
        if (saved) candidates.push(saved);
      }
    } catch (_) { /* keep the default state */ }
    return candidates.sort((a, b) => b.updatedAt - a.updatedAt)[0] || { ...DEFAULT_STATE };
  }

  function trackUrl(file) {
    return new URL(file, audioBaseUrl).href;
  }

  function updateUi() {
    const track = tracks[trackIndex];
    const isPlaying = !soundtrack.paused && !soundtrack.ended;
    const stateIcon = isPlaying ? 'pause.svg' : 'play.svg';

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(isPlaying));
      button.setAttribute('aria-label', isPlaying ? `Поставить ${track.title} на паузу` : `Включить ${track.title}`);
    });
    document.querySelectorAll('[data-track-title], .case-sound-toggle small').forEach((label) => {
      label.textContent = track.title;
    });
    document.querySelectorAll('[data-track-cover]').forEach((cover) => {
      cover.src = trackUrl(track.cover);
      cover.alt = `Обложка трека ${track.title}`;
    });
    document.querySelectorAll('[data-audio-state-icon]').forEach((icon) => {
      icon.src = new URL(stateIcon, iconBaseUrl).href;
    });
    playerContainers.forEach((player) => {
      player.classList.toggle('is-playing', isPlaying);
      player.setAttribute('aria-label', isPlaying ? `Поставить ${track.title} на паузу` : `Включить ${track.title}`);
    });
  }

  function showPlaybackFeedback(source) {
    const component = source.closest('.sound-player, .case-sound-toggle');
    if (!component) return;
    component.classList.remove('audio-feedback');
    void component.offsetWidth;
    component.classList.add('audio-feedback');
    window.setTimeout(() => component.classList.remove('audio-feedback'), 420);
  }

  function updateVolumeUi() {
    const percent = Math.round(soundtrack.volume * 100);
    volumeInputs.forEach((input) => {
      input.value = String(percent);
      input.parentElement?.style.setProperty('--volume-percent', `${percent}%`);
    });
  }

  function writeState(force = false) {
    const now = Date.now();
    if (!force && now - lastSavedAt < 900) return;
    lastSavedAt = now;
    const state = {
      enabled: desiredEnabled,
      trackIndex,
      currentTime: Number.isFinite(soundtrack.currentTime) ? soundtrack.currentTime : 0,
      volume: soundtrack.volume,
      updatedAt: now,
    };
    const serialized = JSON.stringify(state);
    try { localStorage.setItem(STORAGE_KEY, serialized); } catch (_) { /* file:// fallback below */ }
    try { window.name = `${WINDOW_NAME_PREFIX}${serialized}`; } catch (_) { /* nothing else to do */ }
  }

  async function playIfWanted() {
    if (!desiredEnabled || !soundtrack.paused) return;
    try {
      await soundtrack.play();
      updateUi();
      writeState(true);
    } catch (error) {
      updateUi();
      console.info('Браузер ожидает жест пользователя, чтобы продолжить музыку', error);
    }
  }

  function loadTrack(index, { currentTime = 0, autoplay = desiredEnabled } = {}) {
    trackIndex = (index + tracks.length) % tracks.length;
    const track = tracks[trackIndex];
    soundtrack.src = trackUrl(track.file);
    soundtrack.load();
    updateUi();

    const restorePosition = () => {
      const duration = soundtrack.duration;
      soundtrack.currentTime = Number.isFinite(duration) && duration > 0 ? currentTime % duration : currentTime;
      if (autoplay) playIfWanted();
    };

    if (soundtrack.readyState >= 1) restorePosition();
    else soundtrack.addEventListener('loadedmetadata', restorePosition, { once: true });
  }

  function nextTrack() {
    const shouldContinue = desiredEnabled;
    loadTrack(trackIndex + 1, { currentTime: 0, autoplay: shouldContinue });
    writeState(true);
  }

  const savedState = readState();
  desiredEnabled = savedState.enabled;
  soundtrack.volume = savedState.volume;
  updateVolumeUi();

  const navigationDelay = desiredEnabled && savedState.updatedAt
    ? Math.max(0, (Date.now() - savedState.updatedAt) / 1000)
    : 0;
  loadTrack(savedState.trackIndex, {
    currentTime: savedState.currentTime + navigationDelay,
    autoplay: desiredEnabled,
  });

  async function togglePlayback(source) {
    if (!soundtrack.paused) {
      desiredEnabled = false;
      soundtrack.pause();
      updateUi();
      writeState(true);
      showPlaybackFeedback(source);
      return;
    }
    desiredEnabled = true;
    await playIfWanted();
    showPlaybackFeedback(source);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => togglePlayback(button));
  });
  playerContainers.forEach((player) => {
    player.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('[data-audio-toggle], [data-audio-next], .sound-volume')) return;
      togglePlayback(player);
    });
    player.addEventListener('keydown', (event) => {
      if (event.target !== player || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      togglePlayback(player);
    });
  });

  nextButtons.forEach((button) => button.addEventListener('click', nextTrack));
  volumeInputs.forEach((input) => {
    input.addEventListener('input', () => {
      soundtrack.volume = clamp(Number(input.value) / 100, 0, 1);
      updateVolumeUi();
      writeState(true);
    });
  });

  const unlockAudio = (event) => {
    if (event.target instanceof Element && event.target.closest('[data-audio-toggle], [data-audio-next], [data-audio-volume]')) return;
    playIfWanted();
  };
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  document.addEventListener('keydown', unlockAudio);
  soundtrack.addEventListener('play', () => {
    desiredEnabled = true;
    updateUi();
  });
  soundtrack.addEventListener('pause', updateUi);
  soundtrack.addEventListener('ended', nextTrack);
  soundtrack.addEventListener('timeupdate', () => writeState(false));
  window.addEventListener('pagehide', () => writeState(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') writeState(true);
  });

  if (window.location.protocol === 'file:') {
    const message = 'Откройте сайт через ОТКРЫТЬ_САЙТ.bat';
    document.querySelectorAll('.planet-loader, .model-loader').forEach((loader) => {
      loader.textContent = message;
    });
  }
})();
