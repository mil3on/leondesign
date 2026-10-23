(() => {
  const loader = document.querySelector('#site-loader');
  if (!loader) return;

  const label = loader.querySelector('.site-loader__label');
  const value = loader.querySelector('.site-loader__value');
  let progress = 8;
  let finished = false;

  // Broad elliptical orbits gently spiral toward the loading counter.
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const orbitDots = [...loader.querySelectorAll('.site-loader__dot')];
  let orbitFrame = 0;
  let previousTime = 0;
  let easedProgress = progress;
  const animateOrbits = (time) => {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    easedProgress += (progress - easedProgress) * (1 - Math.exp(-5 * delta));
    const convergence = Math.max(0, Math.min(1, (easedProgress - 8) / 92));
    const finalRadius = matchMedia('(max-width:520px)').matches ? 72 : 86;
    orbitDots.forEach((dot, index) => {
      const duration = 9500 + (index % 4) * 1400;
      const phase = (time + index * 730) / duration;
      const angle = index * Math.PI * 2 / orbitDots.length + phase * Math.PI * 2;
      const outerRadius = Math.min(205, innerWidth * .43) * (1 + (index % 3) * .035);
      const drift = 1 - .16 * Math.sin(phase * Math.PI * 2) * (1 - convergence);
      const radius = (outerRadius + (finalRadius - outerRadius) * convergence) * drift;
      const ellipse = .76 + .24 * convergence;
      dot.style.transform = 'translate(' + Math.cos(angle) * radius + 'px,' + Math.sin(angle) * radius * ellipse + 'px)';
    });
    orbitFrame = requestAnimationFrame(animateOrbits);
  };
  if (!reducedMotion.matches) {
    orbitDots.forEach((dot) => {
      dot.style.transition = 'none';
      dot.querySelector('i').style.animation = 'none';
    });
    orbitFrame = requestAnimationFrame(animateOrbits);
  }
  const stopOrbits = () => cancelAnimationFrame(orbitFrame);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && !finished) stopOrbits();
  });

  const update = (next, text) => {
    progress = Math.max(progress, Math.min(100, Math.round(next)));
    if (value) value.textContent = `${progress}%`;
    if (text) label.textContent = text;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    update(100);
    stopOrbits();
    // Preserve angular order and rotate the seating plan to minimize travel.
    const dots = [...loader.querySelectorAll('.site-loader__dot')].map((dot) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(dot).transform);
      return {dot, angle:Math.atan2(matrix.m42, matrix.m41), radius:Math.hypot(matrix.m41, matrix.m42)};
    }).sort((a, b) => a.angle - b.angle);
    const step = Math.PI * 2 / dots.length;
    const rotation = dots.reduce((sum, item, index) => sum + item.angle - index * step, 0) / dots.length;
    const radius = matchMedia('(max-width:520px)').matches ? 72 : 86;
    dots.forEach(({dot, angle, radius:startRadius}, index) => {
      const targetAngle = rotation + index * step;
      const frames = Array.from({length:33}, (_, frame) => {
        const t = frame / 32;
        const currentAngle = angle + (targetAngle - angle) * t;
        const currentRadius = startRadius + (radius - startRadius) * t;
        return {transform:'translate(' + Math.cos(currentAngle) * currentRadius + 'px,' + Math.sin(currentAngle) * currentRadius + 'px)', offset:t};
      });
      dot.style.transition = 'none';
      dot.style.transform = frames[frames.length - 1].transform;
      if (!reducedMotion.matches) dot.animate(frames, {duration:480, easing:'cubic-bezier(.22,.7,.25,1)'});
    });
    loader.classList.add('is-complete');
    // Rotate the whole formation immediately, including during the gathering.
    const orbit = loader.querySelector('.site-loader__orbit');
    orbit.style.animation = 'none';
    if (!reducedMotion.matches) {
      orbit.animate([
        {transform:'rotate(0deg)'},
        {transform:'rotate(360deg)'}
      ], {duration:5000, iterations:Infinity, easing:'linear'});
    }
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, 550);
    window.setTimeout(() => loader.remove(), 1100);
  };

  document.addEventListener('DOMContentLoaded', () => {
    update(18, 'Загружаю мир…');
  });
  window.addEventListener('portfolio:planet-progress', (event) => {
    const modelProgress = Number(event.detail?.progress) || 0;
    update(22 + modelProgress * .72, 'Загружаю мир…');
  });
  window.addEventListener('portfolio:planet-ready', finish, { once: true });
  window.addEventListener('portfolio:planet-error', () => {
    update(100, 'Не удалось загрузить мир');
    window.setTimeout(finish, 900);
  }, { once: true });
})();
