// ===============================
// POSTS.JS — Two-column layout -> stacked layout after open
// ===============================

const urlParams = new URLSearchParams(window.location.search);
const chapterId = urlParams.get("chapter")?.trim().toLowerCase();

let chapterData = null;
let postsData = [];

Promise.all([
    fetch("./data/chapters.json").then((r) => r.json()),
    fetch("./data/posts.json").then((r) => r.json())
])
    .then(([chapters, posts]) => {
        chapterData = chapters.find(
            (c) => c.id?.trim().toLowerCase() === chapterId
        );
        postsData = posts.filter(
            (p) => p.chapter?.trim().toLowerCase() === chapterId
        );
        renderPage();
    })
    .catch((err) => console.error("Error loading data:", err));

function renderPage() {
    if (!chapterData) return;

    document.getElementById("chapterImage").src = chapterData.cover;
    document.getElementById("chapterTitle").textContent = chapterData.title;
    document.getElementById("chapterTheme").textContent =
        chapterData.theme || "";

    const rightList = document.getElementById("postsList");
    const leftList = document.getElementById("leftPostsList");
    rightList.innerHTML = "";
    leftList.innerHTML = "";

    if (!postsData.length) {
        rightList.innerHTML = `<p class="empty">No posts yet for this chapter.</p>`;
        return;
    }

    postsData.forEach((post) => {
        const item = createPostItem(post);
        rightList.appendChild(item);

        const clone = createPostItem(post);
        leftList.appendChild(clone);
    });
}

function createPostItem(post) {
    const el = document.createElement("div");
    el.className = "post-item";
    el.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
    `;
    el.addEventListener("click", () => openPostDetail(post, el));
    return el;
}

function openPostDetail(post, clickedEl) {
    const wrapper = document.querySelector(".posts-wrap");
    const detailEl = document.getElementById("postDetail");
    const rightList = document.getElementById("postsList");

    wrapper.classList.add("single-view");

    const leftPanel = document.querySelector(".post-side-text");
    const chapterHeading = document.querySelector(".chapter-text");
    if (leftPanel && chapterHeading) {
        const offset = chapterHeading.offsetTop - 30;
        leftPanel.scrollTo({ top: offset, behavior: "smooth" });
    }

    const title = clickedEl.querySelector("h3").textContent;
    document.querySelectorAll(".post-item.active").forEach((e) =>
        e.classList.remove("active")
    );
    document.querySelectorAll(".post-item").forEach((e) => {
        if (e.querySelector("h3").textContent === title) e.classList.add("active");
    });

    rightList.style.display = "none";
    detailEl.classList.add("active");

    // Convert \n\n into <br><br>
    const formattedContent = post.content
        ? post.content.replace(/\n\n/g, "<br><br>")
        : post.excerpt;

    detailEl.innerHTML = `
        <div style="margin-bottom:2rem;">
          <a href="#" id="backToList" style="text-decoration:none;color:#7a6c59;">← Back to list</a>
        </div>
        <h2>${post.title}</h2>
        <div class="post-full">${formattedContent}</div>
    `;

    document.getElementById("backToList").addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.remove("single-view");
        detailEl.classList.remove("active");
        detailEl.innerHTML = "";
        rightList.style.display = "block";
        document
            .querySelectorAll(".post-item.active")
            .forEach((e) => e.classList.remove("active"));
    });
}
