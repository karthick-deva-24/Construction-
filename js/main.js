/* ================================================================
   GASAP CONSTRUCTION — ANIMATIONS
   GSAP 3 (ScrollTrigger · SplitText-like · Magnetic · Parallax)
   + AOS (Animate On Scroll)
================================================================ */

/* ── wait for DOM ── */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Prevent CSS/JS animation conflicts by removing data-aos from elements GSAP handles.
  // This keeps opacities/transforms clean and avoids frozen blank/invisible elements.
  const gsapSelectors = [
    '.sec-h2', '.ph-h1', '.breadcrumb', '.sec-label', 
    '.cta-h', '.cta-tag', '.cta-sub', '.sc', '.tc', '.bc', 
    '.pc', '.vc', '.tm', '.oc', '.stat-item', '.srow', 
    '.srow-feats li', '.feat-img-box', '.feat-r', '.ps', 
    '.blog-feat-card', '.astrip-img', '.astrip-body', '.tl-item'
  ];
  gsapSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.removeAttribute('data-aos');
    });
  });

  // 2. Fallback for when AOS script fails to load/run (ensures elements aren't stuck at opacity:0)
  if (typeof AOS === 'undefined') {
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }

  // 3. Fallback for when GSAP or ScrollTrigger fails to load/run
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    document.querySelectorAll('.ph-h1, .breadcrumb, .hero-h1 .w, .hero-est, .hero-tagline, .hero-scroll').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
    return;
  }

  // 4. Initialize GSAP ScrollTrigger and start the page loading/boot sequence
  gsap.registerPlugin(ScrollTrigger);
  runLoader();
});

/* ================================================================
   1. PAGE LOADER
================================================================ */
function runLoader() {
  const loader = document.getElementById('loader');
  if (!loader) { bootAll(); return; }

  const fill = loader.querySelector('.ld-fill');
  const pct  = loader.querySelector('.ld-pct');
  const beams = loader.querySelectorAll('.ld-beam');
  let val = 0;

  const tick = setInterval(() => {
    val += Math.random() * 14 + 4;
    if (val >= 100) { val = 100; clearInterval(tick); }
    if (fill) fill.style.width = val + '%';
    if (pct)  pct.textContent  = Math.floor(val) + '%';

    // Draw the blueprint building wireframe in sync with progress
    if (beams.length) {
      beams.forEach(beam => {
        const offset = 400 - (val / 100) * 400;
        beam.style.strokeDashoffset = offset;
      });
    }

    if (val === 100) {
      setTimeout(() => {
        gsap.to(loader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power3.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            bootAll();
          }
        });
      }, 350);
    }
  }, 55);
}

/* ================================================================
   2. BOOT ALL MODULES
================================================================ */
function bootAll() {
  initNav();
  initHero();
  initHeroSlideshow();
  initParallax();
  initCounters();
  initSectionReveals();
  initCardStagger();
  initServiceRows();
  initFeaturedProject();
  initMagneticBtns();
  initMobileNav();
  initPageTransitions();
  initAOS();
  initForms();
  initLoginPage();
  initAboutStrip();
  initProcessSteps();
  initBlogFeatCard();
  initMarquee();
  initScrollProgress();
}


/* ================================================================
   4. NAVBAR
 ================================================================ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  /* entrance */
  gsap.from(nav, { y: -90, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1 });

  /* scroll solid */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 60);
  }, { passive: true });

  /* active link */
  const page = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('on');
  });
}

/* ================================================================
   5. HERO ANIMATIONS  (words fly up, meta fades)
 ================================================================ */
function initHero() {
  const words    = document.querySelectorAll('.hero-h1 .w');
  const est      = document.querySelector('.hero-est');
  const tagline  = document.querySelector('.hero-tagline');
  const scroll   = document.querySelector('.hero-scroll');
  const controls = document.querySelector('.hero-controls');

  if (!words.length) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    .to(words, {
      y: 0, opacity: 1,
      duration: 1.15,
      stagger: 0.07,
      delay: 0.25
    })
    .to(est,      { opacity: 1, y: 0, duration: 0.8 }, '-=0.55')
    .to(tagline,  { opacity: 1, y: 0, duration: 0.8 }, '-=0.65')
    .to(controls, { opacity: 1, duration: 0.8 }, '-=0.5')
    .to(scroll,   { opacity: 1, duration: 0.6 }, '-=0.3');
}

/* ================================================================
   5a. HERO BACKGROUND SLIDESHOW (GSAP cross-fade + kinetic scale)
 ================================================================ */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.hero-dots');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!slides.length) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let autoplayTimer = null;
  const autoplayDelay = 6000;

  // Initialize visibility of slides
  slides.forEach((slide, idx) => {
    if (idx === currentIndex) {
      gsap.set(slide, { opacity: 1, visibility: 'visible', scale: 1 });
    } else {
      gsap.set(slide, { opacity: 0, visibility: 'hidden', scale: 1.08 });
    }
  });

  // Create dot indicators dynamically
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `hero-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        if (idx === currentIndex || isTransitioning) return;
        goToSlide(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(nextIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    resetAutoplay();

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[nextIndex];
    const dots = document.querySelectorAll('.hero-dot');

    // Update dots active class
    if (dots.length) {
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === nextIndex);
      });
    }

    // Set z-index for overlapping transition
    gsap.set(nextSlide, { zIndex: 1, visibility: 'visible' });
    gsap.set(currentSlide, { zIndex: 0 });

    // Premium transition: cross-fade combined with kinetic zoom-out
    gsap.killTweensOf([currentSlide, nextSlide]);

    // Animate next slide in
    gsap.fromTo(nextSlide, 
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }
    );

    // Animate current slide out
    gsap.to(currentSlide, {
      opacity: 0,
      duration: 1.4,
      ease: 'power2.out',
      onComplete: () => {
        currentSlide.classList.remove('active');
        gsap.set(currentSlide, { visibility: 'hidden', zIndex: 0 });
        nextSlide.classList.add('active');
        currentIndex = nextIndex;
        isTransitioning = false;
      }
    });
  }

  // Navigation handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = slides.length - 1;
      goToSlide(prevIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      goToSlide(nextIndex);
    });
  }

  // Autoplay controls
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      goToSlide(nextIndex);
    }, autoplayDelay);
  }

  function resetAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
  }

  startAutoplay();
}

/* ================================================================
   6. PARALLAX  (hero bg slides · CTA bg)
 ================================================================ */
function initParallax() {
  /* hero bg slides */
  const heroSlides = document.querySelector('.hero-slides');
  if (heroSlides) {
    gsap.to(heroSlides, {
      yPercent: 28,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
  }

  /* CTA band bg */
  const ctaBg = document.querySelector('.cta-bg');
  if (ctaBg) {
    gsap.to(ctaBg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  }

  /* page hero bg */
  const pgBg = document.querySelector('.page-hero-bg');
  if (pgBg) {
    gsap.to(pgBg, {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
  }

  /* live section bg */
  const liveBg = document.querySelector('.live-bg');
  if (liveBg) {
    gsap.to(liveBg, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: { trigger: '.live-sec', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
  }
}

/* ================================================================
   7. COUNTER ANIMATION
================================================================ */
function initCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = +el.dataset.target;
    const sup = el.querySelector('sup');
    const supTxt = sup ? sup.outerHTML : '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        let current = 0;
        const step = target / 55;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.innerHTML = Math.floor(current) + supTxt;
          if (current >= target) clearInterval(timer);
        }, 22);
      }
    });
  });
}

/* ================================================================
   8. SECTION TITLE REVEALS  (all .sec-h2, .ph-h1)
================================================================ */
function initSectionReveals() {
  /* big headings — only scroll-trigger for non-page-hero ones */
  gsap.utils.toArray('.sec-h2').forEach(el => {
    gsap.from(el, {
      y: 64, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  /* page hero title — animate immediately on load (it's always at top) */
  const phH = document.querySelector('.ph-h1');
  if (phH) {
    gsap.from(phH, { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 });
  }
  const bc = document.querySelector('.breadcrumb');
  if (bc) {
    gsap.from(bc, { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 });
  }

  /* section labels */
  gsap.utils.toArray('.sec-label').forEach(el => {
    gsap.from(el, {
      x: -24, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* CTA heading */
  gsap.utils.toArray('.cta-h, .cta-tag, .cta-sub').forEach((el, i) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      delay: i * 0.14
    });
  });

  /* live section title */
  const liveH = document.querySelector('.live-body .cta-h');
  if (liveH) {
    gsap.from(liveH, {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.live-sec', start: 'top 70%', once: true }
    });
  }
}

/* ================================================================
   9. CARD STAGGER REVEALS
================================================================ */
function initCardStagger() {
  /* service cards */
  const scards = gsap.utils.toArray('.sc');
  if (scards.length) {
    scards.forEach((card, i) => {
      gsap.from(card, {
        y: 56, opacity: 0, duration: 0.75, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        delay: (i % 3) * 0.1
      });
    });
  }

  /* testimonial cards */
  gsap.utils.toArray('.tc').forEach((card, i) => {
    gsap.from(card, {
      y: 48, opacity: 0, duration: 0.75, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: i * 0.12
    });
  });

  /* blog cards */
  gsap.utils.toArray('.bc').forEach((card, i) => {
    gsap.from(card, {
      y: 48, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: (i % 3) * 0.1
    });
  });

  /* project cards */
  gsap.utils.toArray('.pc').forEach((card, i) => {
    gsap.from(card, {
      y: 56, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      delay: (i % 3) * 0.1
    });
  });

  /* value cards */
  gsap.utils.toArray('.vc').forEach((card, i) => {
    gsap.from(card, {
      y: 48, opacity: 0, duration: 0.75, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: i * 0.1
    });
  });

  /* team cards */
  gsap.utils.toArray('.tm').forEach((card, i) => {
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: i * 0.1
    });
  });

  /* office cards */
  gsap.utils.toArray('.oc').forEach((card, i) => {
    gsap.from(card, {
      y: 36, opacity: 0, duration: 0.65, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      delay: i * 0.1
    });
  });

  /* stat items */
  gsap.utils.toArray('.stat-item').forEach((item, i) => {
    gsap.from(item, {
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: item, start: 'top 90%', once: true },
      delay: i * 0.1
    });
  });
}

/* ================================================================
   10. SERVICE ROWS (alternating slide-in)
================================================================ */
function initServiceRows() {
  gsap.utils.toArray('.srow').forEach((row, i) => {
    const img  = row.querySelector('.srow-img');
    const body = row.querySelector('.srow-body');
    const isEven = i % 2 === 1;

    if (img) {
      gsap.from(img, {
        x: isEven ? 80 : -80, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 80%', once: true }
      });
    }
    if (body) {
      gsap.from(body, {
        x: isEven ? -80 : 80, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 80%', once: true },
        delay: 0.08
      });
    }

    /* feature list items stagger */
    const feats = row.querySelectorAll('.srow-feats li');
    if (feats.length) {
      gsap.from(feats, {
        x: 20, opacity: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: body, start: 'top 75%', once: true },
        delay: 0.4
      });
    }
  });
}

/* ================================================================
   11. FEATURED PROJECT (image left, content right)
================================================================ */
function initFeaturedProject() {
  const imgBox = document.querySelector('.feat-img-box');
  const featR  = document.querySelector('.feat-r');
  const featL  = document.querySelector('.feat-l');

  if (imgBox) {
    gsap.from(imgBox, {
      x: -80, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.feat-proj', start: 'top 80%', once: true }
    });
  }
  if (featR) {
    gsap.from(featR.children, {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: '.feat-proj', start: 'top 78%', once: true },
      delay: 0.3
    });
  }

  /* stat number count */
  const statN = document.querySelector('.feat-stat-n[data-target]');
  if (statN) {
    const target = +statN.dataset.target;
    ScrollTrigger.create({
      trigger: statN, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.from(statN, { textContent: 0, duration: 1.2, ease: 'power2.out',
          onUpdate: function() { statN.textContent = Math.ceil(this.targets()[0]._gsap.textContent || 0); },
          snap: { textContent: 1 }
        });
      }
    });
  }
}

/* ================================================================
   12. MAGNETIC BUTTONS
================================================================ */
function initMagneticBtns() {
  document.querySelectorAll('.btn-white,.btn-gold,.btn-solid-g,.sub-btn,.login-sub,.btn-outline-w').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      gsap.to(btn, { x: x * 0.22, y: y * 0.22, duration: 0.45, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' });
    });
  });

  /* service icon tilt on hover */
  document.querySelectorAll('.sc').forEach(card => {
    const icon = card.querySelector('.sc-icon');
    if (!icon) return;
    card.addEventListener('mouseenter', () => gsap.to(icon, { rotation: 8, scale: 1.12, duration: 0.4 }));
    card.addEventListener('mouseleave', () => gsap.to(icon, { rotation: 0, scale: 1, duration: 0.4 }));
  });
}

/* ================================================================
   13. MOBILE NAV
================================================================ */
function initMobileNav() {
  const ham = document.querySelector('.ham');
  const mob = document.querySelector('.mob-nav');
  if (!ham || !mob) return;

  const spans = ham.querySelectorAll('span');
  let open = false;

  ham.addEventListener('click', () => {
    open = !open;
    mob.classList.toggle('open', open);

    if (open) {
      gsap.to(spans[0], { rotation: 45,  y: 6.5, duration: 0.32 });
      gsap.to(spans[1], { opacity: 0,          duration: 0.18 });
      gsap.to(spans[2], { rotation: -45, y: -6.5, duration: 0.32 });
      /* stagger links */
      gsap.from(mob.querySelectorAll('a'), {
        y: 40, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.15
      });
    } else {
      gsap.to(spans, { rotation: 0, y: 0, opacity: 1, duration: 0.32 });
    }
  });

  mob.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      open = false;
      mob.classList.remove('open');
      gsap.to(spans, { rotation: 0, y: 0, opacity: 1, duration: 0.32 });
    });
  });
}

/* ================================================================
   14. PAGE TRANSITIONS
================================================================ */
function initPageTransitions() {
  /* entrance wipe */
  const trans = document.createElement('div');
  trans.className = 'page-trans';
  document.body.appendChild(trans);

  /* fade out on arrival */
  gsap.set(trans, { opacity: 1 });
  gsap.to(trans, { opacity: 0, duration: 0.55, ease: 'power2.inOut', delay: 0.05,
    onComplete: () => trans.style.pointerEvents = 'none' });

  /* intercept link clicks */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      trans.style.pointerEvents = 'all';
      gsap.to(trans, {
        opacity: 1, duration: 0.45, ease: 'power2.inOut',
        onComplete: () => location.href = href
      });
    });
  });
}

/* ================================================================
   15. AOS INIT
================================================================ */
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 850,
    easing: 'ease-out-cubic',
    once: true,
    offset: 70,
    delay: 0
  });
}

/* ================================================================
   16. ABOUT STRIP  (image + content)
================================================================ */
function initAboutStrip() {
  if (!document.querySelector('.astrip-img')) return;
  ScrollTrigger.create({
    trigger: '.astrip-img',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from('.astrip-img', { x: -80, opacity: 0, duration: 1.2, ease: 'power3.out' });
      gsap.from('.astrip-body', { x: 80,  opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 });
      gsap.from('.tl-item', {
        x: 20, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12, delay: 0.5
      });
    }
  });
}

/* ================================================================
   17. PROCESS STEPS STAGGER
================================================================ */
function initProcessSteps() {
  gsap.utils.toArray('.ps').forEach((ps, i) => {
    gsap.from(ps, {
      y: 48, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: ps, start: 'top 88%', once: true },
      delay: i * 0.1
    });
  });
}

/* ================================================================
   18. BLOG FEATURED CARD
================================================================ */
function initBlogFeatCard() {
  if (!document.querySelector('.blog-feat-card')) return;
  ScrollTrigger.create({
    trigger: '.blog-feat-card',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from('.blog-feat-card > *:first-child', { x: -70, opacity: 0, duration: 1.1, ease: 'power3.out' });
      gsap.from('.bfc-body',                        { x: 70,  opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.1 });
    }
  });
}

/* ================================================================
   19. HORIZONTAL SCROLL MARQUEE  (optional logo/ticker strip)
================================================================ */
function initMarquee() {
  gsap.utils.toArray('.marquee-inner').forEach(el => {
    gsap.to(el, { xPercent: -50, duration: 18, ease: 'none', repeat: -1 });
  });
}

/* ================================================================
   20. SCROLL PROGRESS BAR
================================================================ */
function initScrollProgress() {
  const progBar = document.getElementById('scroll-progress');
  if (progBar) {
    gsap.to(progBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 0 }
    });
  }
}

/* ================================================================
   21. FORMS
================================================================ */
function initForms() {
  const cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', e => {
      e.preventDefault();
      const btn = cf.querySelector('.sub-btn');
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });

      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
        btn.style.background = '#2ecc71';
        btn.style.color = '#fff';
        gsap.from(btn, { scale: 0.9, duration: 0.5, ease: 'back.out(2)' });
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          cf.reset();
        }, 3000);
      }, 1800);
    });
  }
}

/* ================================================================
   22. LOGIN PAGE
================================================================ */
function initLoginPage() {
  const lf = document.getElementById('loginForm');
  if (!lf) return;

  /* entrance */
  gsap.from('.lf-side', { x: 80, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
  gsap.from('.lv-body .nav-logo', { y: -28, opacity: 0, duration: 0.75, delay: 0.4 });
  gsap.from('.lv-bot', { y: 44, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.6 });
  gsap.from('.lv-stats > div', { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12, delay: 0.9 });
  gsap.from('.lf-head', { y: 28, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.45 });
  gsap.from('.lf-form > *', { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out', stagger: 0.07, delay: 0.7 });

  /* password toggle */
  const pwEye = document.querySelector('.pw-eye');
  const pwInput = document.getElementById('loginPassword');
  if (pwEye && pwInput) {
    pwEye.addEventListener('click', () => {
      const icon = pwEye.querySelector('i');
      if (pwInput.type === 'password') {
        pwInput.type = 'text';
        if (icon) {
          icon.className = 'fa-regular fa-eye-slash';
        } else {
          pwEye.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        }
      } else {
        pwInput.type = 'password';
        if (icon) {
          icon.className = 'fa-regular fa-eye';
        } else {
          pwEye.innerHTML = '<i class="fa-regular fa-eye"></i>';
        }
      }
    });
  }

  /* submit */
  lf.addEventListener('submit', e => {
    e.preventDefault();
    const btn = lf.querySelector('.login-sub');
    const roleSelect = document.getElementById('loginRole');
    const role = roleSelect ? roleSelect.value : 'customer';
    
    btn.textContent = 'Authenticating…';
    btn.disabled = true;
    gsap.to(btn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Welcome Back!';
      btn.style.background = 'var(--gold)';
      gsap.from(btn, { scale: 0.9, duration: 0.5, ease: 'back.out(2)' });
      setTimeout(() => {
        if (role === 'engineer') {
          window.location.href = 'dashboard-engineer.html';
        } else {
          window.location.href = 'dashboard-customer.html';
        }
      }, 1000);
    }, 1600);
  });
}
