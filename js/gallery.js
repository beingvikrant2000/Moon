document.addEventListener("DOMContentLoaded", () => {
  // if (localStorage.getItem("monologueCompleted") !== "true") {
  //   window.location.href = "welcome.html";
  //   return;
  // }

  const audio = document.getElementById("bgSong");

  const tryPlay = () => {
    audio.play()
      .then(() => {
        console.log("Audio unlocked by mousemove");
        window.removeEventListener("mousemove", tryPlay);
      })
      .catch(err => {
        console.warn("Blocked:", err);
      });
  };

  window.addEventListener("mousemove", tryPlay, { once: true });

  const scroller = document.getElementById("galleryImages");
  const col1 = scroller.querySelector(".scroll-1");
  const col2 = scroller.querySelector(".scroll-2");
  const col3 = scroller.querySelector(".scroll-3");

  const allImages = [
    "assets/gallery/gallery1.jpg",
    "assets/gallery/gallery2.jpg",
    "assets/gallery/gallery3.jpg",
    "assets/gallery/gallery4.jpg",
    "assets/gallery/gallery5.jpg",
    "assets/gallery/gallery6.jpg",
    "assets/gallery/gallery7.jpg",
    "assets/gallery/gallery8.jpg",
    "assets/gallery/gallery9.jpg",
    "assets/gallery/gallery10.jpg",
    "assets/gallery/gallery11.jpg",
    "assets/gallery/gallery13.jpg",
    "assets/gallery/gallery14.jpg",
    "assets/gallery/gallery15.jpg",
    "assets/gallery/gallery16.jpg",
    "assets/gallery/gallery17.jpg",
    "assets/gallery/gallery18.jpg",
    "assets/gallery/gallery19.jpg",
    "assets/gallery/gallery20.jpg",
    "assets/gallery/gallery21.jpg",
    "assets/gallery/gallery22.jpg",
    "assets/gallery/gallery23.jpg",
    "assets/gallery/gallery24.jpg",
    "assets/gallery/gallery25.jpg",
    "assets/gallery/gallery26.jpg",
    "assets/gallery/gallery27.jpg",
    "assets/gallery/gallery28.jpg",
    "assets/gallery/gallery29.jpg",
    "assets/gallery/gallery30.jpg",
    "assets/gallery/gallery31.jpg",
    "assets/gallery/gallery32.jpg",
    "assets/gallery/gallery33.jpg",
    "assets/gallery/gallery34.jpg",
    "assets/gallery/gallery35.jpg",
    "assets/gallery/gallery36.jpg",
    "assets/gallery/gallery37.jpg",
    "assets/gallery/gallery38.jpg",
    "assets/gallery/gallery39.jpg",
    "assets/gallery/gallery40.jpg",
    "assets/gallery/gallery41.jpg",
    "assets/gallery/gallery42.jpg",
    "assets/gallery/gallery43.jpg"
  ];


  let recentImages = [];

  const getRandomImage = () => {
    let available = allImages.filter(i => !recentImages.includes(i));
    if (!available.length) {
      recentImages = [];
      available = [...allImages];
    }
    const chosen = available[Math.floor(Math.random() * available.length)];
    recentImages.push(chosen);
    if (recentImages.length > 5) recentImages.shift();
    return chosen;
  };

  const makeBox = src => {
    const box = document.createElement("div");
    box.className = "img-box";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Memory";
    box.appendChild(img);
    return box;
  };

  const fadeIn = box =>
    gsap.fromTo(box, { opacity: 0, y: 40 }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    });

  const addImage = col => {
    const box = makeBox(getRandomImage());
    col.appendChild(box);
    fadeIn(box);
  };

  // preload initial set
  for (let i = 0; i < 12; i++) {
    addImage(col1);
    addImage(col2);
    addImage(col3);
  }

  // lazy load + cleanup
  scroller.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = scroller;

    if (scrollTop + clientHeight >= scrollHeight - 400) {
      [col1, col2, col3].forEach(addImage);
    }

    [col1, col2, col3].forEach(col => {
      if (col.children.length > 150)
        while (col.children.length > 100) col.removeChild(col.firstElementChild);
    });
  });

  // parallax offsets for each column
  let lastY = 0;
  let offset1 = 0, offset2 = 0, offset3 = 0;
  const RESET_LIMIT = 2000;

  const updateSpeeds = () => {
    const scrollY = scroller.scrollTop;
    const delta = scrollY - lastY;
    lastY = scrollY;

    offset1 += delta * 0.25;
    offset2 += delta * 0.4;
    offset3 += delta * 0.55;

    col1.style.transform = `translateY(${offset1}px)`;
    col2.style.transform = `translateY(${offset2}px)`;
    col3.style.transform = `translateY(${offset3}px)`;

    if (Math.abs(offset1) > RESET_LIMIT || Math.abs(offset2) > RESET_LIMIT || Math.abs(offset3) > RESET_LIMIT) {
      offset1 = offset2 = offset3 = 0;
      [col1, col2, col3].forEach(c => c.style.transform = "translateY(0)");
    }
  };
  gsap.ticker.add(updateSpeeds);

  // --------------------------
  // Auto-scroll with pause + resume
  // --------------------------
  let autoScrollActive = true;
  const autoScrollSpeed = 0.6; // cinematic slow drift
  let resumeTimeoutId = null;

  // drive smooth scroll
  gsap.ticker.add(() => {
    if (autoScrollActive) scroller.scrollTop += autoScrollSpeed;
  });

  // pause + resume logic
  function pauseThenResume() {
    autoScrollActive = false;
    if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
    resumeTimeoutId = setTimeout(() => {
      autoScrollActive = true;
    }, 3000); // resume after 3s of no input
  }

  // listen for real user input (not scroll)
  ["wheel", "touchstart", "mousedown", "keydown"].forEach(evt => {
    window.addEventListener(evt, pauseThenResume, { passive: true });
  });

  // text fade-in
  gsap.from(".gallery-text h1, .gallery-text p", {
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: "power3.out",
    stagger: 0.2
  });
});
