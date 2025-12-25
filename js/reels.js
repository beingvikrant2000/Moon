const playerPane = document.getElementById("playerPane");
const libraryPane = document.getElementById("libraryPane");
const mainVideo = document.getElementById("mainVideo");
const positionTag = document.getElementById("positionTag");
const playOverlay = document.getElementById("playOverlay");

let userHasInteracted = false;
let reels = [];
let index = 0;

// Load JSON data
fetch("data/reels.json")
  .then((res) => res.json())
  .then((data) => {
    reels = data;
    initLibrary();
    loadReel(0);
  })
  .catch((err) => console.error("Error loading reels:", err));

/* ============================================================
   LOADING A REEL
============================================================ */
function loadReel(i) {
  if (!reels[i]) return;
  index = i;

  // Load new video
  mainVideo.src = reels[i].src;
  mainVideo.load();

  // Show play button (until user taps)
  playOverlay.classList.add("show");

  // Update reel position tag
  positionTag.textContent = `${index + 1} / ${reels.length}`;

  // Set active thumb + keep in view
  updateActiveThumb();

  // Preload nearby videos
  preloadNearby(i);

  // If user previously unlocked interaction, auto-play on scroll visibility
  setTimeout(autoPlayOnScroll, 200);
}

/* ============================================================
   PLAY / PAUSE CONTROLS
============================================================ */

// Center play button
playOverlay.addEventListener("click", () => {
  userHasInteracted = true;
  playOverlay.classList.remove("show");
  mainVideo.play();
});

// Tap video to toggle
mainVideo.addEventListener("click", () => {
  if (!userHasInteracted) {
    userHasInteracted = true;
    playOverlay.classList.remove("show");
    return mainVideo.play();
  }

  if (mainVideo.paused) {
    playOverlay.classList.remove("show");
    mainVideo.play();
  } else {
    playOverlay.classList.add("show");
    mainVideo.pause();
  }
});

/* ============================================================
   AUTO PLAY WHEN VIDEO IS VISIBLE IN VIEWPORT
============================================================ */

function autoPlayOnScroll() {
  const rect = mainVideo.getBoundingClientRect();
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

  if (fullyVisible && userHasInteracted) {
    mainVideo.play();
    playOverlay.classList.remove("show");
  } else {
    mainVideo.pause();
    playOverlay.classList.add("show");
  }
}

window.addEventListener("scroll", autoPlayOnScroll);


/* ============================================================
   PRELOAD NEIGHBORING REELS
============================================================ */
function preloadNearby(i) {
  for (let offset = -3; offset <= 3; offset++) {
    const n = i + offset;
    if (n >= 0 && n < reels.length && n !== i) {
      const v = document.createElement("video");
      v.src = reels[n].src;
      v.preload = "metadata";
    }
  }
}

/* ============================================================
   LIBRARY (RIGHT PANEL) + THUMBNAILS
============================================================ */
function initLibrary() {
  libraryPane.innerHTML = reels
    .map(
      (reel, i) => `
      <div class="thumb" data-index="${i}">
        <img src="" alt="${reel.title}" />
        <div class="meta">
          <div class="t">${reel.title}</div>
          <div class="s">${reel.subtitle}</div>
        </div>
      </div>`
    )
    .join("");

  libraryPane.querySelectorAll(".thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const idx = parseInt(thumb.dataset.index);
      loadReel(idx);
      window.scrollTo(0, 0); // reset viewport for autoplay logic
    });
  });

  generateThumbnails();
}

/* ============================================================
   THUMBNAILS — SEQUENTIAL & STABLE
============================================================ */
async function generateThumbnails() {
  for (let i = 0; i < reels.length; i++) {
    const videoPath = reels[i].src;
    const thumbEl = libraryPane.querySelector(`.thumb[data-index="${i}"] img`);

    try {
      const thumbData = await captureThumbnail(videoPath);
      if (thumbData) thumbEl.src = thumbData;
      else thumbEl.style.background = "linear-gradient(135deg,#222,#444)";
    } catch {
      thumbEl.style.background = "linear-gradient(135deg,#222,#444)";
    }
  }
}

function captureThumbnail(videoPath) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = videoPath;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    const failTimer = setTimeout(() => resolve(null), 8000);

    video.addEventListener("loadeddata", () => {
      video.play().then(() => {
        setTimeout(() => drawAndResolve(), 500);
      });
    });

    const drawAndResolve = () => {
      clearTimeout(failTimer);
      video.pause();

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 356;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };

    video.addEventListener("error", () => resolve(null));
  });
}

/* ============================================================
   ACTIVE THUMB — AUTO SCROLLING TO KEEP IT CENTERED
============================================================ */
function updateActiveThumb() {
  libraryPane.querySelectorAll(".thumb").forEach((el) =>
    el.classList.remove("active")
  );
  const active = libraryPane.querySelector(`.thumb[data-index="${index}"]`);
  if (!active) return;

  active.classList.add("active");

  const activeRect = active.getBoundingClientRect();
  const paneRect = libraryPane.getBoundingClientRect();

  const overTop = activeRect.top < paneRect.top + 40;
  const overBottom = activeRect.bottom > paneRect.bottom - 40;

  if (overTop) {
    libraryPane.scrollTop -= paneRect.top - activeRect.top + 40;
  } else if (overBottom) {
    libraryPane.scrollTop += activeRect.bottom - paneRect.bottom + 40;
  }
}

/* ============================================================
   NEXT / PREV (WHEEL, KEYBOARD, SWIPE)
============================================================ */
function next() {
  if (index < reels.length - 1) loadReel(index + 1);
}
function prev() {
  if (index > 0) loadReel(index - 1);
}

window.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) next();
  else if (e.deltaY < 0) prev();
});

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "PageUp"].includes(e.key)) prev();
  if (["ArrowDown", "PageDown"].includes(e.key)) next();
});

/* Touch swipe */
let touchStartY = 0;
let touchEndY = 0;
const swipeThreshold = 50;

playerPane.addEventListener("touchstart", (e) => {
  touchStartY = e.changedTouches[0].screenY;
});

playerPane.addEventListener("touchend", (e) => {
  touchEndY = e.changedTouches[0].screenY;
  const deltaY = touchStartY - touchEndY;

  if (Math.abs(deltaY) < swipeThreshold) return;
  if (deltaY > 0) next();
  else prev();
});
