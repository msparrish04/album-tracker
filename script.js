let albums = [];
let currentSort = "";
let currentFilter = "all";
const genreSelect = new TomSelect("#genre", {
    create: true,
    sortField: { field: "text", direction: "asc" },
    placeholder: "Genre (optional)",
    createFilter: function (input) {
        return input.length >= 2;
    },
});
let currentSearch = "";

const form = document.getElementById("album-form");
const albumsContainer = document.getElementById("albums");

form.addEventListener("submit", function (e) {
    e.preventDefault(); // stops the page from refreshing

    const title = document.getElementById("title").value.trim();
    const artist = document.getElementById("artist").value.trim();
    const genre = genreSelect.getValue();
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
        rating: null,
        listened: false,
    };

    albums.push(album);
    saveAlbums();
    form.reset();
    genreSelect.clear();
    renderAlbums();
});

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
}

function getSortedAndFiltered() {
    let result = [...albums];

    if (currentSearch) {
        result = result.filter(a =>
            a.title.toLowerCase().includes(currentSearch) ||
            a.artist.toLowerCase().includes(currentSearch)
        );
    }

    // FILTER
    if (currentFilter === "listened") {
        result = result.filter(a => a.listened);
    } else if (currentFilter === "unlistened") {
        result = result.filter(a => !a.listened);
    }

    // SORT
    // Sort by title
    if (currentSort === "title") {
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Sort by artist
    if (currentSort === "artist") {
        result.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    // Sort by duration
    if (currentSort === "duration") {
        result.sort((a, b) => {
            if (a.duration === null) return 1;
            if (b.duration === null) return -1;
            return a.duration - b.duration;
        });
    }

    // Sort by genre
    if (currentSort === "genre") {
        result.sort((a, b) => {
            if (!a.genre) return 1;
            if (!b.genre) return -1;
            return a.genre.localeCompare(b.genre);
        });
    }

    // Sort by star rating
    if (currentSort === "rating") {
        result.sort((a, b) => {
            if (!a.listened && !b.listened) return 0;
            if (!a.listened) return 1;
            if (!b.listened) return -1;
            if (a.rating === null && b.rating === null) return 0;
            if (a.rating === null) return 1;
            if (b.rating === null) return -1;
            return b.rating - a.rating;
        });
    }

    return result;
}

// Render how many albums user has listened to, how many to go
function renderStats() {
    const total = albums.length;
    const listened = albums.filter(a => a.listened).length;
    const toGo = total - listened;

    const stats = document.getElementById("stats");

    if (total === 0) {
        stats.innerHTML = "";
        return;
    }

    stats.innerHTML = `${total} albums · ${listened} listened · ${toGo} to go`;
}

function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${rating >= i ? "filled" : ""}" data-value="${i}">★</span>`;
    }
    return `<div class="stars">${stars}</div>`;
}

function rateAlbum(id, rating) {
    albums = albums.map(function (album) {
        if (album.id === id) {
            return { ...album, rating: rating };
        }
        return album;
    });
    saveAlbums();
    renderAlbums();
}

// Render all albums to the page
function renderAlbums() {
    albumsContainer.innerHTML = "";
    renderStats();

    if (albums.length === 0) {
        albumsContainer.innerHTML = "<p style='color:#999'>No albums yet — add one above!</p>";
        return;
    }

    getSortedAndFiltered().forEach(function (album) {
        const card = document.createElement("div");
        card.classList.add("album-card");
        card.dataset.id = album.id;
        if (album.listened) card.classList.add("listened");

        card.innerHTML = `
      <div class="album-info">
        <h3>${album.title}</h3>
        <p class="artist">${album.artist}</p>
        ${album.genre ? `<p class="genre">${album.genre}</p>` : ""}
        ${album.duration ? `<p class="duration">${formatDuration(album.duration)}</p>` : ""}
        ${album.notes ? `<p class="notes">${album.notes}</p>` : ""}
        ${album.listened ? renderStars(album.rating) : ""}
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

    document.querySelectorAll(".star").forEach(function (star) {
        star.addEventListener("click", function () {
            const id = Number(star.closest(".album-card").dataset.id);
            const rating = Number(star.dataset.value);
            rateAlbum(id, rating);
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

// Listener for sorting albums
document.getElementById("sort").addEventListener("change", function () {
    currentSort = this.value;
    renderAlbums();
});

// Listener for filtering albums
document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        currentFilter = btn.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        renderAlbums();
    });
});

// Search listener
document.getElementById("search").addEventListener("input", function () {
    currentSearch = this.value.toLowerCase().trim();
    renderAlbums();
});

function loadAlbums() {
    const saved = localStorage.getItem("albums");
    if (saved) {
        albums = JSON.parse(saved);
    }
}

loadAlbums();
renderAlbums();