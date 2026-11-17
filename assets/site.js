// RunShore static website interactions: mobile navigation and the presentation carousel.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  if (slides.length) {
    let current = 0;
    const counter = document.querySelector('[data-slide-counter]');
    const show = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (counter) counter.textContent = `Slide ${current + 1} of ${slides.length}`;
    };
    document.querySelector('[data-slide-prev]')?.addEventListener('click', () => show(current - 1));
    document.querySelector('[data-slide-next]')?.addEventListener('click', () => show(current + 1));
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') show(current + 1);
      if (event.key === 'ArrowLeft') show(current - 1);
    });
    show(0);
  }
});
