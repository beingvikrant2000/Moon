  const audio = document.getElementById("bgSongs");

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
