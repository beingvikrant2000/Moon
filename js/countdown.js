// floating triangles animation
(function() {
  const triangles = document.querySelector(".triangles");
  const fullTimeline = new TimelineMax();
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  for (let i = 0; i < 60; i++) {
    const triangle = document.createElement("div");
    triangle.className = "triangle";
    triangle.style.left = random(0, window.innerWidth) + "px";
    triangle.style.top = "-20px";
    triangles.appendChild(triangle);

    const tl = new TimelineMax({ repeat: -1 });
    const dir = random(1, 2) === 1 ? -1 : 1;
    const delay = random(0, 100) / 100;
    const duration = random(3, 6);

    tl.set(triangle, { scale: random(10, 20) / 10 }, delay)
      .to(triangle, duration * 0.5, { opacity: 1 }, delay)
      .to(triangle, duration, {
        top: "110%",
        rotationZ: random(180, 360) * dir,
        rotationX: random(180, 360) * dir
      }, delay)
      .to(triangle, duration * 0.5, { opacity: 0 }, delay + duration * 0.6);
    fullTimeline.add(tl, 0);
  }

  TweenMax.to(triangles, 2, { opacity: 1 });
})();

// teasing text rotation
const phrases = [
  "Not yet...",
  "Almost there...",
  "She has no idea what's coming...",
  "Keep your eyes here...",
  "It's her moment soon..."
];
let i = 0;
const teaseText = document.getElementById("teaseText");

setInterval(() => {
  teaseText.textContent = phrases[i];
  i = (i + 1) % phrases.length;
}, 8000);

// countdown timer
const targetDate = new Date("Dec 29, 2025 00:00:00").getTime();
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const timer = setInterval(() => {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    clearInterval(timer);
    document.body.style.transition = "opacity 2s ease";
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = "welcome.html";
    }, 2000);
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }
}, 1000);
