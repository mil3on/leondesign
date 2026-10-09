(() => {
  const STORAGE_KEY = 'leonid-cookie-consent-v1';
  const METRIKA_ID = 113367855;

  function loadMetrika() {
    if (window.__leonidMetrikaLoaded) return;
    window.__leonidMetrikaLoaded = true;
    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;
    document.head.append(script);

    window.ym(METRIKA_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  }

  function accepted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch {
      return false;
    }
  }

  function rememberAcceptance() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // Consent still applies for the current page when storage is unavailable.
    }
  }

  function showNotice() {
    if (document.querySelector('.cookie-notice')) return;

    const style = document.createElement('style');
    style.textContent = `
      .cookie-notice{position:fixed;z-index:10001;right:20px;bottom:20px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:end;width:min(430px,calc(100% - 40px));padding:20px;border:1px solid rgba(255,255,255,.24);border-radius:28px;background:rgba(29,34,31,.88);box-shadow:0 24px 70px rgba(0,0,0,.22);color:#fff;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);opacity:0;transform:translateY(14px);transition:opacity .3s ease,transform .3s cubic-bezier(.2,.8,.2,1)}
      .cookie-notice.is-visible{opacity:1;transform:none}
      .cookie-notice__copy{min-width:0}.cookie-notice__copy strong{display:block;margin-bottom:7px;font:800 20px/1.05 Machina,Manrope,Arial,sans-serif;letter-spacing:-.035em}.cookie-notice__copy p{margin:0;color:rgba(255,255,255,.68);font:500 13px/1.45 Manrope,Arial,sans-serif}
      .cookie-notice button{min-width:78px;min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#fff;color:#111;font:700 13px/1 Manrope,Arial,sans-serif;cursor:pointer;transition:background .18s ease,transform .18s ease}.cookie-notice button:hover{background:#eeefec;transform:translateY(-1px)}
      @media(max-width:560px){.cookie-notice{right:12px;bottom:12px;left:12px;width:auto;grid-template-columns:1fr;padding:18px;border-radius:24px}.cookie-notice button{width:100%}}
      @media(prefers-reduced-motion:reduce){.cookie-notice{transition:none}}
    `;
    document.head.append(style);

    const notice = document.createElement('aside');
    notice.className = 'cookie-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-labelledby', 'cookie-notice-title');
    notice.innerHTML = `
      <div class="cookie-notice__copy">
        <strong id="cookie-notice-title">Собираю куки</strong>
        <p>Интересны метрики, хочу знать чуть больше</p>
      </div>
      <button type="button">Окей</button>
    `;
    document.body.append(notice);
    requestAnimationFrame(() => notice.classList.add('is-visible'));

    notice.querySelector('button').addEventListener('click', () => {
      rememberAcceptance();
      loadMetrika();
      notice.classList.remove('is-visible');
      notice.addEventListener('transitionend', () => notice.remove(), { once: true });
      window.setTimeout(() => notice.remove(), 350);
    });
  }

  if (accepted()) {
    loadMetrika();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showNotice, { once: true });
  } else {
    showNotice();
  }
})();
