const API_KEY = 'c00ac79a';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const resultsTitle = document.getElementById('resultsTitle');


let currentSearch = '';
let currentPage = 1;
let totalResults = 0;
let totalPages = 0;


function getSafeImageUrl(posterUrl) {
    if (posterUrl === 'N/A' || !posterUrl) {
        return null;
    }
    
    
    return `https://images.weserv.nl/?url=${encodeURIComponent(posterUrl.replace('http://', 'https://'))}&w=300&h=450&fit=cover`;
}


async function searchMovies(page = 1) {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Per favore, inserisci un titolo da cercare');
        return;
    }

    currentSearch = searchTerm;
    currentPage = page;

    showElement(loading);
    hideElement(resultsContainer);
    hideElement(error);
    hideElement(pagination);

    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`;
        
        console.log('🔍 Invio richiesta a:', url);
        
        const response = await fetch(url);
        const data = await response.json();

        console.log('📦 Risposta API:', data);

        if (data.Response === 'True') {
            displayMovies(data.Search);
            updatePagination(data.totalResults);
            resultsTitle.textContent = `Risultati per "${searchTerm}" (${data.totalResults} film trovati)`;
            showElement(resultsContainer);
        } else {
            console.log('❌ Errore API:', data.Error);
            showError();
        }
    } catch (err) {
        console.error('💥 Errore nella ricerca:', err);
        showError();
    } finally {
        hideElement(loading);
    }
}


function displayMovies(movies) {
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        const safeImageUrl = getSafeImageUrl(movie.Poster);
        
        movieCard.innerHTML = `
            <div class="movie-poster">
                ${safeImageUrl ? 
                    `<img src="${safeImageUrl}" alt="${movie.Title}" loading="lazy" onerror="handleImageError(this)">` : 
                    '<div class="no-poster">🎬<br>Immagine<br>non disponibile</div>'
                }
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">Anno: ${movie.Year}</p>
                <p class="movie-type">Tipo: ${movie.Type === 'movie' ? 'Film' : 
                                         movie.Type === 'series' ? 'Serie TV' : 'Episodio'}</p>
                <button class="details-btn" onclick="showMovieDetails('${movie.imdbID}')">
                    Dettagli
                </button>
            </div>
        `;
        
        moviesGrid.appendChild(movieCard);
    });
}


function handleImageError(img) {
    console.log('❌ Immagine non caricata:', img.src);
    img.style.display = 'none';
    const posterDiv = img.parentElement;
    posterDiv.innerHTML = '<div class="no-poster">🎬<br>Immagine<br>non caricata</div>';
}


async function showMovieDetails(imdbID) {
    try {
        showElement(loading);
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
        const movie = await response.json();

        if (movie.Response === 'True') {
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                    <h2 style="color: #333; margin-bottom: 15px;">${movie.Title} (${movie.Year})</h2>
                    <p><strong>Regista:</strong> ${movie.Director}</p>
                    <p><strong>Attori:</strong> ${movie.Actors}</p>
                    <p><strong>Genere:</strong> ${movie.Genre}</p>
                    <p><strong>Trama:</strong> ${movie.Plot}</p>
                    <p><strong>Valutazione IMDb:</strong> ${movie.imdbRating}/10</p>
                    <p><strong>Durata:</strong> ${movie.Runtime}</p>
                    <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Chiudi</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (err) {
        console.error('Errore nel caricamento dettagli:', err);
        alert('Errore nel caricamento dei dettagli');
    } finally {
        hideElement(loading);
    }
}


function updatePagination(total) {
    totalResults = parseInt(total);
    totalPages = Math.ceil(totalResults / 10);
    
    if (totalPages > 1) {
        pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
        showElement(pagination);
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    } else {
        hideElement(pagination);
    }
}


function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showError() {
    showElement(error);
    hideElement(resultsContainer);
    hideElement(pagination);
}


searchBtn.addEventListener('click', () => searchMovies(1));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies(1);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        searchMovies(currentPage - 1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        searchMovies(currentPage + 1);
    }
});

console.log('🚀 OMDB Search caricato!');