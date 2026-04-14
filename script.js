let albums = [];

const form = document.getElementById("album-form");
const albumsContainer = document.getElementById("albums");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // stops the page from refreshing

  const title = document.getElementById("title").value.trim();
  const artist = document.getElementById("artist").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const duration = parseInt(document.getElementById("duration").value) || null;

  // Album object
  const album = {
    id: Date.now(), // unique id based on timestamp
    title,
    artist,
    genre,
    duration,
    notes,
    listened: false,
  };

  albums.push(album);
  saveAlbums();
  form.reset();
  renderAlbums();
});

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// Render all albums to the page
function renderAlbums() {
  albumsContainer.innerHTML = "";

  if (albums.length === 0) {
    albumsContainer.innerHTML = "<p style='color:#999'>No albums yet — add one above!</p>";
    return;
  }

  albums.forEach(function (album) {
    const card = document.createElement("div");
    card.classList.add("album-card");
    if (album.listened) card.classList.add("listened");

    card.innerHTML = `
      <div class="album-info">
        <h3>${album.title}</h3>
        <p class="artist">${album.artist}</p>
        ${album.genre ? `<p class="genre">${album.genre}</p>` : ""}
        ${album.duration ? `<p class="duration">${formatDuration(album.duration)}</p>` : ""}
        ${album.notes ? `<p class="notes">${album.notes}</p>` : ""}
      </div>
      <div class="album-actions">
        <button class="btn-listened" data-id="${album.id}">
          ${album.listened ? "Mark unlistened" : "Mark listened"}
        </button>
        <button class="btn-delete" data-id="${album.id}">Delete</button>
      </div>
    `;

    albumsContainer.appendChild(card);
  });

  document.querySelectorAll(".btn-listened").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggleListened(Number(btn.dataset.id));
    });
  });

  document.querySelectorAll(".btn-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteAlbum(Number(btn.dataset.id));
    });
  });
}

function toggleListened(id) {
  albums = albums.map(function (album) {
    if (album.id === id) {
      return { ...album, listened: !album.listened };
    }
    return album;
  });
  saveAlbums();
  renderAlbums();
}

function deleteAlbum(id) {
  albums = albums.filter(function (album) {
    return album.id !== id;
  });
  saveAlbums();
  renderAlbums();
}

// Use local Storage to save albums
function saveAlbums() {
  localStorage.setItem("albums", JSON.stringify(albums));
}

function loadAlbums() {
  const saved = localStorage.getItem("albums");
  if (saved) {
    albums = JSON.parse(saved);
  }
}

loadAlbums();
renderAlbums();