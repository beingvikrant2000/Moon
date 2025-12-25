// /js/experience.js
// CINEMATIC INTERACTIVE STORY ENGINE

// DOM ELEMENTS
const els = {
    video: document.getElementById("bgVideo"),
    chapter: document.getElementById("chapterLabel"),
    narration: document.getElementById("narration"),
    choices: document.getElementById("choices"),
    response: document.getElementById("response"),
    continueBtn: document.getElementById("continueBtn"),
    card: document.querySelector(".card"),
    hud: document.getElementById("hud")
};

let currentIndex = 0;
let SCENES = [];

// -----------------------------------------------------
// LOAD SCENES FROM JSON
// -----------------------------------------------------
fetch("./data/experienceData.json")
    .then((res) => res.json())
    .then((data) => {
        SCENES = data;
        renderScene(0);
    })
    .catch((err) => console.error("Error loading JSON:", err));


// -----------------------------------------------------
// TYPEWRITER
// -----------------------------------------------------
async function typeText(el, text, speed = 18) {
    el.innerHTML = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);

    for (let i = 0; i < text.length; i++) {
        caret.insertAdjacentText("beforebegin", text[i]);
        await new Promise((r) => setTimeout(r, speed));
    }

    caret.remove();
}


// -----------------------------------------------------
// BACKGROUND VIDEO HANDLER WITH FADE
// -----------------------------------------------------
function setBackgroundVideo(src) {
    const video = els.video;

    gsap.to(video, {
        opacity: 0,
        duration: 0.6,
        onComplete() {
            video.src = src;
            video.load();

            video.play().catch(() => {
                console.warn("Autoplay blocked — delaying playback.");
            });

            gsap.to(video, { opacity: 1, duration: 0.8 });
        }
    });
}


// -----------------------------------------------------
// RENDER A SCENE (MAIN FUNCTION)
// -----------------------------------------------------
async function renderScene(index) {
    const scene = SCENES[index];
    if (!scene) return;

    currentIndex = index;

    // ------------------------------------------------------
    // RESET UI for a clean cinematic start
    // ------------------------------------------------------

    // hide the card BEFORE the next video starts
    els.card.classList.remove("show");
    els.card.style.opacity = 0;
    els.card.style.pointerEvents = "none";

    // remove old responses & choices
    els.choices.innerHTML = "";
    els.response.textContent = "";
    els.response.classList.remove("show");

    // reset subtitles
    els.narration.textContent = "";

    // remove old handlers
    els.video.onended = null;
    els.video.onplay = null;

    // update chapter label
    els.chapter.textContent = scene.chapter;
    els.hud.textContent = scene.id;

    // ------------------------------------------------------
    // load and fade-in the next video
    // ------------------------------------------------------
    setBackgroundVideo(scene.video);

    // ------------------------------------------------------
    // start narration ONLY when video begins playing
    // ------------------------------------------------------
    els.video.onplay = () => {
        typeText(els.narration, scene.narration);
    };

    // fallback if autoplay is delayed
    setTimeout(() => {
        if (!els.narration.textContent) {
            typeText(els.narration, scene.narration);
        }
    }, 800);

    // ------------------------------------------------------
    // after video ends → show interaction prompt
    // ------------------------------------------------------
    els.video.onended = () => {
        showPrompt(scene);
    };
}


// -----------------------------------------------------
// SHOW PROMPT + CHOICES AFTER VIDEO ENDS
// -----------------------------------------------------
function showPrompt(scene) {
    els.card.classList.add("show");
    els.card.style.opacity = "";
    els.card.style.pointerEvents = "";


    // replace narration with the prompt text
    els.narration.textContent = scene.prompt;

    els.choices.innerHTML = "";
    els.response.textContent = "";
    els.response.classList.remove("show");

    scene.choices.forEach((choiceObj, i) => {
        const b = document.createElement("button");
        b.className = "choice-btn";
        b.textContent = choiceObj.text;

        b.addEventListener("click", () => handleChoice(choiceObj, scene));

        els.choices.appendChild(b);

        gsap.fromTo(
            b,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, delay: 0.1 * i }
        );
    });
}


// -----------------------------------------------------
// HANDLE A CHOICE → SHOW RESPONSE → NEXT SCENE
// -----------------------------------------------------
function handleChoice(choice, scene) {
    Array.from(els.choices.children).forEach((btn) => {
        btn.disabled = true;
        btn.style.opacity = 0.55;
    });

    els.response.classList.add("show");

    typeText(els.response, choice.response, 16).then(() => {
        setTimeout(() => {
            if (!scene.next) return;

            const nextIndex = SCENES.findIndex((s) => s.id === scene.next);
            if (nextIndex !== -1) {
                gsap.to(".card", {
                    opacity: 0,
                    y: 6,
                    duration: 0.4,
                    onComplete() {
                        // DO NOT FADE BACK IN
                        renderScene(nextIndex);
                    }
                });
            }
        }, 2500);
    });

}


// -----------------------------------------------------
// OPTIONAL MANUAL CONTINUE BUTTON
// -----------------------------------------------------
els.continueBtn.addEventListener("click", () => {
    const nextId = SCENES[currentIndex]?.next;
    if (!nextId) return;

    const nextIndex = SCENES.findIndex((s) => s.id === nextId);
    if (nextIndex !== -1) renderScene(nextIndex);
});
