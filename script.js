const accessKey = "gIniN1DIQAJywEpKnhDOOKzBP4SA2D58iDuQf3Zom9o";

let query = "";
let currentPage = 1;
let totalPages = 1;
let favorites = JSON.parse(localStorage.getItem('favImages')) || [];

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");
const loader = document.getElementById("loader");
const pagination = document.getElementById("pagination-controls");
const modal = document.getElementById("modal");

// --- Sam poisk ---
async function fetchImages(page) {

    loader.style.display = "block";
    resultsContainer.innerHTML = "";

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${accessKey}&per_page=12`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        totalPages = data.total_pages;
        displayImages(data.results);
        updatePagination();
    } catch (error) {
        resultsContainer.innerHTML = "<p>Error</p>";
    } finally {
        loader.style.display = "Loading...";
    }
}

// --- cards ---
function displayImages(images) {
    images.forEach(img => {
        const isFav = favorites.some(f => f.id === img.id);
        const card = document.createElement("div");
        card.className = "image-card";
        
        card.innerHTML = `
            <img src="${img.urls.small}" alt="${img.alt_description || 'image'}" onclick="openModal('${img.id}')">
            <button class="fav-btn" onclick="toggleFavorite('${img.id}', '${img.urls.small}', event)">
                ${isFav ? '★' : '☆'}
            </button>
        `;
        resultsContainer.appendChild(card);
    });
}

// --- info v modal window ---
async function openModal(id) {
    modal.style.display = "flex";
    const modalInfo = document.getElementById("modal-info");
    document.getElementById("modal-img").src = "";

    try {
        const res = await fetch(`https://api.unsplash.com/photos/${id}?client_id=${accessKey}`);
        const data = await res.json();

        document.getElementById("modal-img").src = data.urls.regular;
        modalInfo.innerHTML = `
            <h3>Автор: ${data.user.name}</h3>
            <p>❤️ Лайки: ${data.likes} | 📥 Скачивания: ${data.downloads || 'N/A'}</p>
            <p><b>Теги:</b> ${data.tags ? data.tags.map(t => t.title).join(', ') : 'нет'}</p>
        `;
    } catch (err) {
        modalInfo.innerHTML = "Error";
    }
}

// --- Close MOdal ---
document.querySelector(".close-modal").onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
window.onkeydown = (e) => { if (e.key === "Escape") modal.style.display = "none"; };

// --- pagination ---
function updatePagination() {
    pagination.style.display = "flex";
    document.getElementById("page-indicator").innerText = `Страница ${currentPage} из ${totalPages}`;
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = (currentPage === totalPages);
}

document.getElementById("next-btn").onclick = () => { currentPage++; fetchImages(currentPage); };
document.getElementById("prev-btn").onclick = () => { currentPage--; fetchImages(currentPage); };

// --- favorite ---
function toggleFavorite(id, url, event) {
    event.stopPropagation();
    const index = favorites.findIndex(f => f.id === id);
    if (index > -1) {
        favorites.splice(index, 1);
        event.target.innerText = '☆';
    } else {
        favorites.push({id, urls: {small: url}});
        event.target.innerText = '★';
    }
    localStorage.setItem('favImages', JSON.stringify(favorites));
}

document.getElementById("view-favorites").onclick = () => {
    pagination.style.display = "none";
    resultsContainer.innerHTML = favorites.length ? "" : "<p>Тут пока пусто</p>";
    displayImages(favorites);
};




searchForm.onsubmit = (e) => {
    e.preventDefault();
    query = searchInput.value;
    currentPage = 1;
    fetchImages(currentPage);
};