/* =========================================================
   OPERADORA ZC — Shared behavior across all pages
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- AOS init (scroll reveal) ---- */
  if (window.AOS) {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  /* ---- Sticky header shrink + shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav toggle ---- */
  const burger = document.querySelector('.burger');
  const mainNav = document.querySelector('.main-nav');
  if (burger && mainNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mainNav.classList.toggle('open');
      document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  /* ---- Mega menu (click-to-toggle on touch/mobile, hover on desktop via CSS) ---- */
  document.querySelectorAll('li.has-mega > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  /* ---- Close mobile nav when a real link is tapped ---- */
  document.querySelectorAll('.main-nav a:not(.has-mega > a)').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 991) {
        mainNav.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  /* =========================================================
     Crossfade carousel (Sobre Nosotros)
     ========================================================= */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const imgs = carousel.querySelectorAll('img');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!imgs.length) return;
    let current = 0;
    imgs.forEach((img, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver imagen ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => show(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('button');
    function show(i) {
      imgs[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = i;
      imgs[current].classList.add('active');
      dots[current].classList.add('active');
    }
    let timer = setInterval(() => show((current + 1) % imgs.length), 4200);
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', () => {
      timer = setInterval(() => show((current + 1) % imgs.length), 4200);
    });
  });

  /* =========================================================
     Lightbox (Galería de productos)
     ========================================================= */
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (galleryItems.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.innerHTML = `
      <button class="lb-close" aria-label="Cerrar">&times;</button>
      <button class="lb-prev" aria-label="Anterior">&#8249;</button>
      <img src="" alt="">
      <button class="lb-next" aria-label="Siguiente">&#8250;</button>`;
    document.body.appendChild(overlay);
    const lbImg = overlay.querySelector('img');
    let idx = 0;
    function openAt(i) {
      idx = i;
      lbImg.src = galleryItems[idx].dataset.lightbox;
      lbImg.alt = galleryItems[idx].dataset.label || '';
      overlay.classList.add('open');
    }
    galleryItems.forEach((el, i) => el.addEventListener('click', () => openAt(i)));
    overlay.querySelector('.lb-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    overlay.querySelector('.lb-prev').addEventListener('click', () => openAt((idx - 1 + galleryItems.length) % galleryItems.length));
    overlay.querySelector('.lb-next').addEventListener('click', () => openAt((idx + 1) % galleryItems.length));
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') overlay.classList.remove('open');
      if (e.key === 'ArrowRight') openAt((idx + 1) % galleryItems.length);
      if (e.key === 'ArrowLeft') openAt((idx - 1 + galleryItems.length) % galleryItems.length);
    });
  }

  /* =========================================================
     EmailJS forms
     ---------------------------------------------------------
     TODO ()
     ========================================================= */
  const EMAILJS_PUBLIC_KEY = 'twUUBDlgyhzI_DsNB';
  const EMAILJS_SERVICE_ID  = 'service_4j92eso';
  const EMAILJS_TEMPLATE_ID = 'template_0ua37fc';

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  document.querySelectorAll('form[data-emailjs]').forEach(form => {
    const msgBox = form.querySelector('.form-msg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const submitBtn = form.querySelector('[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      const finish = (ok, text) => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        msgBox.textContent = text;
        msgBox.classList.remove('ok', 'err');
        msgBox.classList.add('show', ok ? 'ok' : 'err');
        if (ok) form.reset();
      };

      if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY') {
        console.warn('EmailJS no está configurado todavía con las credenciales reales.');
        finish(false, 'El formulario aún no está conectado a EmailJS. Configura tus credenciales en js/main.js.');
        return;
      }

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(() => finish(true, '¡Mensaje enviado! Nuestro equipo te contactará muy pronto.'))
        .catch((err) => {
          console.error(err);
          finish(false, 'Ocurrió un error al enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.');
        });
    });
  });

});
