const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

const lenis = prefersReducedMotion ? null : new Lenis({
  duration: 1.18,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.92
});

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  qsa("[data-theme-label]").forEach((label) => {
    label.textContent = nextTheme === "dark" ? "Light" : "Dark";
  });
  qsa("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(nextTheme === "dark"));
    button.setAttribute("title", `Switch to ${nextTheme === "dark" ? "light" : "dark"} mode`);
  });
}

applyTheme(localStorage.getItem("srcAcademyTheme") || "dark");

function initCursorLight() {
  const light = document.querySelector(".cursor-light");
  if (!light || prefersReducedMotion) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  }, { passive: true });

  function render() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    light.style.transform = `translate3d(${currentX - light.offsetWidth / 2}px, ${currentY - light.offsetHeight / 2}px, 0)`;
    requestAnimationFrame(render);
  }

  render();
}

function initParticles() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  const particles = [];
  const colors = ["0,87,255", "255,212,0", "255,255,255", "0,0,0"];
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(window.innerWidth * dpr);
    height = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    particles.length = 0;

    const total = Math.min(72, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < total; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.8 + 0.5) * dpr,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.5) * 0.18 * dpr,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.44 + 0.12
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 12);
      gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 12, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
}

function initReveals() {
  qsa(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 82%"
      }
    });
  });

  qsa(".reveal-stagger").forEach((group) => {
    gsap.to(qsa(":scope > *", group), {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      stagger: 0.1,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: group,
        start: "top 78%"
      }
    });
  });
}

function initHero() {
  qsa(".hero").forEach((hero) => {
    const media = hero.querySelector(".hero-media video, .hero-media img");
    const title = hero.querySelector("h1");
    const copy = hero.querySelector(".hero-copy");
    const actions = hero.querySelector(".hero-actions");

    gsap.timeline({ defaults: { ease: "power4.out" } })
      .fromTo(title, { opacity: 0, y: 46, filter: "blur(18px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.35 })
      .fromTo(copy, { opacity: 0, y: 24, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, "-=0.7")
      .fromTo(actions, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.55");

    if (media && !prefersReducedMotion) {
      gsap.to(media, {
        scale: 1.22,
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  });
}

function initParallax() {
  if (prefersReducedMotion) return;

  qsa("[data-parallax]").forEach((el) => {
    const depth = Number(el.dataset.parallax || 0.15);
    gsap.to(el, {
      yPercent: depth * -100,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section") || el,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  const story = document.querySelector(".story");
  if (story) {
    gsap.timeline({
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    })
      .to(".scene-back", { scale: 1.22, yPercent: -12, opacity: 0.36 }, 0)
      .to(".scene-mid", { scale: 1.1, yPercent: -26, rotateX: 7 }, 0)
      .to(".scene-front", { scale: 1.18, yPercent: -42, opacity: 0.65 }, 0)
      .fromTo(".story-copy h2", { opacity: 0.5, yPercent: 12 }, { opacity: 1, yPercent: -8 }, 0)
      .to(".story-copy .lead", { yPercent: -52, opacity: 0.72 }, 0.18);
  }
}

function initZoomPanels() {
  qsa(".zoom-panel").forEach((panel) => {
    const media = panel.querySelector("img, video");
    const caption = panel.querySelector(".zoom-caption");
    if (!media) return;

    gsap.to(media, {
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: "top 85%",
        end: "bottom 12%",
        scrub: true
      }
    });

    if (caption) {
      gsap.fromTo(caption,
        { opacity: 0, y: 38, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 52%"
          }
        }
      );
    }
  });
}

function initTilt() {
  qsa("[data-tilt]").forEach((card) => {
    if (prefersReducedMotion) return;

    let bounds = null;
    const strength = Number(card.dataset.tilt || 10);

    function enter() {
      bounds = card.getBoundingClientRect();
    }

    function move(event) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rx = ((y / bounds.height) - 0.5) * -strength;
      const ry = ((x / bounds.width) - 0.5) * strength;
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        z: 24,
        transformPerspective: 900,
        duration: 0.55,
        ease: "power3.out"
      });
    }

    function leave() {
      bounds = null;
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.75,
        ease: "elastic.out(1, 0.45)"
      });
    }

    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
  });
}

function initMagnetic() {
  if (prefersReducedMotion) return;

  qsa(".magnetic, .button, .nav-cta").forEach((el) => {
    let bounds = null;

    el.addEventListener("pointerenter", () => {
      bounds = el.getBoundingClientRect();
    });

    el.addEventListener("pointermove", (event) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      gsap.to(el, {
        x: x * 0.24,
        y: y * 0.34,
        duration: 0.45,
        ease: "power3.out"
      });
    });

    el.addEventListener("pointerleave", () => {
      bounds = null;
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: "elastic.out(1, 0.36)"
      });
    });
  });
}

function initCounters() {
  qsa("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.7,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = `${Math.round(state.value)}${suffix}`;
      },
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
        once: true
      }
    });
  });
}

function initTextSplits() {
  qsa("[data-text-reveal]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((word) => `<span class="word-mask"><span class="word">${word}</span></span>`).join(" ");

    gsap.fromTo(el.querySelectorAll(".word"),
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.035,
        duration: 0.78,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%"
        }
      }
    );
  });
}

function markActiveNav() {
  const file = location.pathname.split("/").pop() || "index.html";
  qsa(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === file) link.classList.add("active");
  });
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initThemeToggle() {
  qsa("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("srcAcademyTheme", next);
      applyTheme(next);
    });
  });
}

function initAcademySearch() {
  const input = document.querySelector("[data-site-search]");
  const results = document.querySelector("[data-search-results]");
  if (!input || !results || !window.jQuery) return;

  const pages = [
    { title: "Sports Programs", url: "activities.html", text: "wrestling taekwondo judo volleyball football rugby ballet table tennis handball gymnastics new activities" },
    { title: "Book Training", url: "booking.html", text: "booking sessions training schedule email based submission community members" },
    { title: "Register", url: "register.html", text: "registration newsletter subscription confirmation captcha students parents athletes" },
    { title: "Events", url: "events.html", text: "fixtures competitions schedules attendance sports events" },
    { title: "Blog", url: "blog.html", text: "academy announcements coaches university sports news community engagement" },
    { title: "About SRC Sports Academy", url: "about.html", text: "mission vision values funding community sports bodies" }
  ];

  const $input = window.jQuery(input);
  const $results = window.jQuery(results);

  $input.on("input", function onSearch() {
    const term = this.value.trim().toLowerCase();
    if (!term) {
      $results.empty().attr("hidden", true);
      return;
    }

    const matches = pages.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(term)).slice(0, 5);
    if (!matches.length) {
      $results.html('<p class="search-empty">No academy results found.</p>').removeAttr("hidden");
      return;
    }

    $results.html(matches.map((item) => `<a href="${item.url}">${item.title}</a>`).join("")).removeAttr("hidden");
  });
}

function initVisitorCounter() {
  const counter = document.querySelector("[data-visitor-counter]");
  if (!counter) return;

  const key = "srcSportsAcademyVisits";
  const visits = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(visits));
  counter.textContent = visits.toLocaleString();
}

function initCaptchaForms() {
  qsa("[data-academy-form]").forEach((form) => {
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 5) + 3;
    const challenge = form.querySelector("[data-captcha-question]");
    const input = form.querySelector("[data-captcha-answer]");
    const status = form.querySelector("[data-form-status]");

    if (challenge) challenge.textContent = `${a} + ${b}`;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = form.checkValidity();
      const captchaOk = input && Number(input.value) === a + b;

      if (!valid || !captchaOk) {
        if (status) status.textContent = captchaOk ? "Please complete the required fields." : "Verification failed. Check the answer and try again.";
        form.classList.add("form-error");
        return;
      }

      form.classList.remove("form-error");
      form.reset();
      if (status) status.textContent = "Submitted. A confirmation email would be sent in the live system.";
    });
  });
}

function initProgramSlider() {
  qsa("[data-program-slider]").forEach((slider) => {
    const slides = qsa(".program-slide", slider);
    const dots = qsa(".slider-dots span", slider);
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    if (slides.length < 2) return;

    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function start() {
      if (prefersReducedMotion) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => render(index + 1), 4200);
    }

    prev?.addEventListener("click", () => {
      render(index - 1);
      start();
    });

    next?.addEventListener("click", () => {
      render(index + 1);
      start();
    });

    slider.addEventListener("pointerenter", () => window.clearInterval(timer));
    slider.addEventListener("pointerleave", start);
    render(0);
    start();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initCursorLight();
  initParticles();
  initHero();
  initReveals();
  initParallax();
  initZoomPanels();
  initTilt();
  initMagnetic();
  initCounters();
  initTextSplits();
  markActiveNav();
  initMenu();
  initThemeToggle();
  initAcademySearch();
  initVisitorCounter();
  initCaptchaForms();
  initProgramSlider();
});
