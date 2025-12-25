fetch("./data/chapters.json")
  .then((res) => res.json())
  .then((chapters) => renderChapters(chapters))
  .catch((err) => console.error("Error loading chapters:", err));

function renderChapters(chapters) {
  const list = document.getElementById("chaptersTable");
  list.innerHTML = "";

  chapters.forEach((chapter) => {
    const div = document.createElement("div");
    div.className = "chapter-row";
    div.innerHTML = `
      <div class="title">${chapter.title}</div>
      <div class="theme">${chapter.theme}</div>
      <div class="status">${chapter.status}</div>
    `;
    div.addEventListener("click", () => {
      window.location.href = `posts.html?chapter=${encodeURIComponent(
        chapter.id
      )}`;
    });
    list.appendChild(div);
  });
}
