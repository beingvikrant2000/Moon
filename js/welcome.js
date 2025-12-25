// =========================
// Toggle for development (skip loader)
// =========================
const DEV_MODE = true; // set false for production

// =========================
// Loader logic with random pauses
// =========================
let percent = 0;
const percentText = document.getElementById("percent");
const bar = document.querySelector(".progress-bar");
const loader = document.querySelector(".loader");
const welcomeContent = document.getElementById("welcomeContent");

function updateLoader() {
  if (DEV_MODE) {
    loader.classList.add("hidden");
    welcomeContent.style.opacity = "1";
    initCursorTrail();
    stopTrailOnExperience();
    initIntroSection();
    initExperienceCards();
    return;
  }

  let loading = true;

  function tick() {
    if (!loading) return;

    const shouldPause = Math.random() < 0.2;
    if (shouldPause) {
      setTimeout(tick, 600 + Math.random() * 800);
      return;
    }

    percent += Math.floor(Math.random() * 4) + 1;
    if (percent > 100) percent = 100;

    percentText.textContent = percent;
    bar.style.height = percent + "%";

    if (percent < 100) {
      setTimeout(tick, 60 + Math.random() * 120);
    } else {
      loading = false;
      loader.classList.add("hidden");
      setTimeout(() => {
        welcomeContent.style.transition = "opacity 1.2s ease";
        welcomeContent.style.opacity = "1";
        initCursorTrail();
        stopTrailOnExperience();
        initIntroSection();
        initExperienceCards();
      }, 600);
    }
  }

  tick();
}
updateLoader();

// =========================
// Cursor Trail Effect — slight rotation added
// =========================
function initCursorTrail() {
  const container = document.querySelector(".cursor-trail");
  const sources = [
    "assets/images/trail1.jpg",
    "assets/images/trail2.jpg",
    "assets/images/trail3.jpg",
    "assets/images/trail4.jpg",
    "assets/images/trail5.jpg",
    "assets/images/trail6.jpg",
    "assets/images/trail7.jpg",
    "assets/images/trail8.jpg",
    "assets/images/trail9.jpg"
  ];

  const images = sources.map(src => {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("trail-img");
    container.appendChild(img);
    return img;
  });

  let index = 0;
  let lastX = 0;
  let lastY = 0;
  const minDistance = 125; // pixels before new image spawns

  window.addEventListener("mousemove", e => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) return;

    lastX = e.clientX;
    lastY = e.clientY;

    const img = images[index % images.length];
    index++;

    const startRotation = gsap.utils.random(-10, 10);

    gsap.killTweensOf(img);
    gsap.set(img, {
      x: e.clientX,
      y: e.clientY,
      opacity: 0,
      scale: 0.8,
      rotation: startRotation,
      filter: "blur(0px)"
    });

    gsap.to(img, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(img, {
          opacity: 0,
          scale: 1.1,
          rotation: startRotation + gsap.utils.random(-7, 7),
          duration: 1.8,
          ease: "power1.inOut",
          filter: "blur(5px)",
          onComplete: () => {
            gsap.set(img, { filter: "blur(0px)", rotation: 0 });
          }
        });
      }
    });
  });
}

// =========================
// Disable cursor trail once Experience section appears
// =========================
function stopTrailOnExperience() {
  const trailContainer = document.querySelector(".cursor-trail");
  const experienceSection = document.querySelector(".experience-cards");

  if (!trailContainer || !experienceSection) return;

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: experienceSection,
    start: "top 70%",
    onEnter: () => {
      gsap.to(trailContainer, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => (trailContainer.style.pointerEvents = "none"),
      });
    },
    onLeaveBack: () => {
      trailContainer.style.pointerEvents = "auto";
      gsap.to(trailContainer, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    },
  });
}

// =========================
// Intro Text: Split & Animate Characters
// =========================
function splitIntroTextPreserveItalic() {
  const paras = document.querySelectorAll(".intro-text p");

  paras.forEach(p => {
    const nodes = Array.from(p.childNodes);
    const frag = document.createDocumentFragment();

    nodes.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(c => {
          const span = document.createElement("span");
          span.textContent = c === " " ? "\u00A0" : c;
          frag.appendChild(span);
        });
      } else if (node.nodeType === 1) {
        const wrapper = node.cloneNode(false);
        node.textContent.split("").forEach(c => {
          const inner = document.createElement("span");
          inner.textContent = c === " " ? "\u00A0" : c;
          wrapper.appendChild(inner);
        });
        frag.appendChild(wrapper);
      }
    });

    p.innerHTML = "";
    p.appendChild(frag);
  });
}

function initCharacterReveal() {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll(".intro-text p").forEach(p => {
    const chars = p.querySelectorAll("span");

    gsap.fromTo(
      chars,
      { opacity: 0.15, y: 12 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.8,
        stagger: 0.03,
        scrollTrigger: {
          trigger: p,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

function initIntroSection() {
  splitIntroTextPreserveItalic();
  initCharacterReveal();
}

// =========================
// Experience cards fade-in animation
// =========================
function initExperienceCards() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".exp-card").forEach(card => {
    gsap.from(card, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
      }
    });
  });
}

// =========================
// Floating ↗ icon — instant lock to cursor
// =========================
function initHoverIcon() {
  const icon = document.createElement("div");
  icon.className = "hover-icon";
  icon.textContent = "↗";
  document.body.appendChild(icon);

  let isActive = false;

  // pure DOM updates — no GSAP movement
  document.addEventListener("mousemove", (e) => {
    if (!isActive) return;
    icon.style.left = e.clientX + "px";
    icon.style.top = e.clientY + "px";
  });

  document.querySelectorAll(".exp-card").forEach((card) => {
    card.addEventListener("mouseenter", (e) => {
      isActive = true;
      // spawn directly under cursor
      icon.style.left = e.clientX + "px";
      icon.style.top = e.clientY + "px";
      icon.style.transition = "none";
      icon.style.transform = "translate(-50%, -50%) scale(0)";
      icon.style.opacity = "0";
      // grow / fade in
      requestAnimationFrame(() => {
        icon.style.transition = "transform 0.12s ease, opacity 0.12s ease";
        icon.style.transform = "translate(-50%, -50%) scale(1)";
        icon.style.opacity = "1";
      });
    });

    card.addEventListener("mouseleave", () => {
      isActive = false;
      icon.style.transition = "transform 0.12s ease, opacity 0.12s ease";
      icon.style.transform = "translate(-50%, -50%) scale(0)";
      icon.style.opacity = "0";
    });
  });
}

initHoverIcon();


// =========================
// Gallery Unlock Logic
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const galleryCard = document.querySelector(".gallery-card");
  const lockModal = document.getElementById("lockModal");
  const closeModal = document.getElementById("closeModal");

  if (galleryCard) {
    galleryCard.addEventListener("click", event => {
      const unlocked = localStorage.getItem("monologueCompleted") === "true";
      if (!unlocked) {
        event.preventDefault(); // stop the link
        lockModal.classList.add("active");
      }
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      lockModal.classList.remove("active");
    });
  }
});
