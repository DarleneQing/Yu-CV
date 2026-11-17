const revealItems = [...document.querySelectorAll(".reveal")];
const heroVideo = document.querySelector(".hero-art video");
const siteHeader = document.querySelector(".site-header");
const educationCards = [...document.querySelectorAll(".work-card")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateHeader = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 28);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const group = [...entry.target.parentElement.querySelectorAll(":scope > .reveal")];
        const index = Math.max(group.indexOf(entry.target), 0);
        entry.target.style.transitionDelay = `${Math.min(index * 65, 260)}ms`;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Hero: the typing video loops at the top of the page. While the hero is pinned,
// scroll position picks one frame of the laptop closing and draws it on the canvas.
const heroPin = document.querySelector(".hero-pin");
const heroCanvas = document.querySelector(".hero-art canvas");
const HERO_FRAME_COUNT = 83;

if (prefersReducedMotion) {
  heroVideo?.pause();
} else if (heroPin && heroCanvas && heroVideo) {
  const context = heroCanvas.getContext("2d");
  const frames = Array.from({ length: HERO_FRAME_COUNT }, (_, index) => {
    const image = new Image();
    image.src = `./assets/hero-close/${String(index).padStart(3, "0")}.webp`;
    return image;
  });
  let drawnFrame = -1;

  const drawHeroFrame = () => {
    const distance = heroPin.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(window.scrollY / Math.max(distance, 1), 0), 1);
    const isScrubbing = progress > 0;

    if (isScrubbing !== heroCanvas.classList.contains("is-active")) {
      heroCanvas.classList.toggle("is-active", isScrubbing);
      if (isScrubbing) heroVideo.pause();
      else heroVideo.play().catch(() => {});
    }
    if (!isScrubbing) return;

    const frame = Math.round(progress * (HERO_FRAME_COUNT - 1));
    if (frame === drawnFrame || !frames[frame].complete || !frames[frame].naturalWidth) return;
    context.drawImage(frames[frame], 0, 0, heroCanvas.width, heroCanvas.height);
    drawnFrame = frame;
  };

  window.addEventListener("scroll", () => requestAnimationFrame(drawHeroFrame), { passive: true });
  window.addEventListener("resize", drawHeroFrame);
  // A frame that finishes loading after the scroll stopped still has to be drawn.
  frames.forEach((image) => image.addEventListener("load", drawHeroFrame, { once: true }));
  drawHeroFrame();
}

// The ribbon is fixed, so it would sit on top of the footer: slide it away there.
const ribbon = document.querySelector(".ribbon");
const footer = document.querySelector(".footer");
if (ribbon && footer) {
  new IntersectionObserver(([entry]) => ribbon.classList.toggle("is-hidden", entry.isIntersecting)).observe(footer);
}

educationCards.forEach((card) => {
  card.addEventListener("click", () => {
    const willOpen = !card.classList.contains("is-open");
    educationCards.forEach((item) => item.classList.remove("is-open"));
    card.classList.toggle("is-open", willOpen);
  });

  card.addEventListener("keydown", (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    card.click();
  });
});
