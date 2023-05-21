import { FetchMoviesSearch, fetchMovies, fetchMovieGenres, fetchModalMovie, trendingMovieData } from './js/movie-data-fetch';

export const refs = {
  failedSearchText: document.querySelector('.search-text__failed'),
  userMovieSearch: document.querySelector('.header__movie-search'),
  userMovieSearchContainer: document.querySelector('.movie-search__container'),
  homeLink: document.querySelector('.home-link'),
  libraryLink: document.querySelector('.library-link'),
  headerBtnContainer: document.querySelector('.header__buttons-container'),
  queueBtn: document.querySelector('.header__button-queue'),
  watchedBtn: document.querySelector('.header__button-watched'),
  mociePosterGalleryContainer: document.querySelector('.movie-poster__gallery-container'),
  moviePosterGallery: document.querySelector('.movie-poster__gallery'),
  logoLink: document.querySelector('.logo-link'),
  goitLink: document.querySelector('.footer-link'),
  movieModalContainer: document.querySelector('.movie-modal__container'),
  modalCloseBtn: document.querySelector('.movie-modal__close'),
}
let MOVIE__POSTERS__URL;
let movieModalPosterDimension;
let movieGalleryPosterDimension;
const watchedMovieList = JSON.parse(localStorage.getItem('watchedMovieList')) || {};
const queuedMovieList = JSON.parse(localStorage.getItem('queuedMovieList')) || {};
const notInListStyles = 'background: none; color: var(--secondary-text-color); border: 1px solid #000000;';
const inListStyles = 'background: var(--accent-color); color: var(--primary-text-color); border: none;';

function updateMoviePosterUrl() {
  if (window.innerWidth < 1024) {
    MOVIE__POSTERS__URL = `https://image.tmdb.org/t/p/w300`;
  } else {
    MOVIE__POSTERS__URL = `https://image.tmdb.org/t/p/w342`;
  }
};

function updateMovieModalPosterDimension() {
  if (window.innerWidth < 1024) {
    movieModalPosterDimension = `width="300" height="400"`;
  } else {
    movieModalPosterDimension = `width="396" height="477"`;
  };
};

function updateMovieGalleryPosterDimension() {
  if (window.innerWidth < 768) {
    movieGalleryPosterDimension = `width="280" height="398"`;
  } else if(window.innerWidth < 1024) {
    movieGalleryPosterDimension = `width="294" height="398"`;
  } else {
    movieGalleryPosterDimension = `width="274" height="398"`;
  };
};

async function moviePosterMarkup(movieData, modal) {
  updateMoviePosterUrl();
  updateMovieGalleryPosterDimension();
  if (!modal) {
    const moviePoster = await Promise.all(movieData.map(async (movie) => {
      const movieGenres = await fetchMovieGenres(movie.genre_ids);
      return `
    <li class="movie-poster__card" data="${movie.id}">
      <img class="movie-poster__img" src="${MOVIE__POSTERS__URL}${movie.poster_path}" alt="${movie.title}" ${movieGalleryPosterDimension} />
      <div class="movie-poster__info">
        <h5 class="movie-poster__title">${movie.title}</h5>
        <div class="movie-poster__details-container">
          <p class="movie-poster__details">${movieGenres.join(", ")} | ${movie.release_date}</p >
          <p class="movie-poster__rating">${movie.vote_average}</p>
        </div>
      </div>
    </li>`;
    }));
    return moviePoster.join('');
  };
};

export async function renderMoviePoster(moviePosterData) {
  const moviePosterHtml = await moviePosterMarkup(moviePosterData);
  refs.moviePosterGallery.innerHTML = moviePosterHtml;
  
};

function onHomeLinkClick(e) {
  if (e.target !== refs.homeLink) {
    return;
  }
  refs.moviePosterGallery.innerHTML = '';
  refs.userMovieSearch.value = '';
  refs.homeLink.classList.add('active');
  refs.libraryLink.classList.remove('active');
  document.body.classList.remove('my-library');
  refs.headerBtnContainer.style.display = 'none';
  refs.userMovieSearchContainer.style.display = 'flex';
  fetchMovies();
};

function onLibraryLinkClick(e) {
  if (e.target !== refs.libraryLink) {
    return;
  }
  refs.moviePosterGallery.innerHTML = '';
  refs.userMovieSearch.value = '';
  refs.libraryLink.classList.add('active');
  refs.homeLink.classList.remove('active');
  refs.userMovieSearchContainer.style.display = 'none';
  refs.headerBtnContainer.style.display = 'flex';
  document.body.classList.add('my-library');
  refs.queueBtn.disabled = true;
  refs.watchedBtn.disabled = false;
  renderMovieList(null, queuedMovieList);
};

function onQueueBtnClick(e) {
  if (e.target !== refs.queueBtn) {
    return;
  }
  refs.watchedBtn.classList.remove('active-btn');
  refs.queueBtn.classList.add('active-btn');
  refs.moviePosterGallery.innerHTML = '';
  refs.userMovieSearch.value = '';
  refs.watchedBtn.disabled = false;
  refs.queueBtn.disabled = true;
  renderMovieList(null, queuedMovieList);
};

function onWatchedBtnClick(e) {
  if (e.target !== refs.watchedBtn) {
    return;
  }
  refs.queueBtn.classList.remove('active-btn');
  refs.watchedBtn.classList.add('active-btn');
  refs.moviePosterGallery.innerHTML = '';
  refs.userMovieSearch.value = '';
  refs.queueBtn.disabled = false;
  refs.watchedBtn.disabled = true;
  renderMovieList(watchedMovieList, null);
};

function onMoviePosterClick(e) {
  let targetElement = e.target.closest('LI');
  if (!targetElement || !targetElement.classList.contains('movie-poster__card')) {
    return;
  }
  movieId = Number(targetElement.getAttribute('data'));
  fetchModalMovie(movieId);
}

function movieModalMarkup(movieData) {
  updateMovieModalPosterDimension();
  let movieGenre = movieData.genres.map(genre => genre.name);
  return `
    <div class="movie-modal__card">
      <div class="movie-modal__img-container">
        <img class="movie-modal__poster" src="${MOVIE__POSTERS__URL}${movieData.poster_path}" alt="${movieData.title}" ${movieModalPosterDimension} />
      </div>
      <div class="movie-modal__info-container">
        <div class="movie-modal__title">
          <h2 class="movie-modal__title">${movieData.title}</h2>
        </div>
        <ul class="movie__info-list">
          <li class="movie__info-item movie-modal__votes">Vote/Votes</li>
          <li class="movie__info-item vote-data">
            <span class="movie-poster__rating">${movieData.vote_average}</span>/
            <span class="movie-poster__votes">${movieData.vote_count}</span>
          </li>
          <li class="movie__info-item movie-modal__rating">Popularity</li>
          <li class="movie__info-item popularity-data"> ${movieData.popularity}</li>
          <li class="movie__info-item movie-modal__original-title">Original Title</li>
          <li class="movie__info-item og-title">${movieData.original_title}</li>
          <li class="movie__info-item movie-modal__genres">Genre</li>
          <li class="movie__info-item genres">${movieGenre.join(", ")}</li>
          <li class="movie__info-item movie-modal__release-date">Release Date</li>
          <li class="movie__info-item release-date">${movieData.release_date}</li>
        </ul>
        <div class="movie-modal__overview-container">
          <p class="movie-modal__overview-title">About</p>
          <p class="movie-modal__info-item-overview">${movieData.overview}</p>
        </div>
        <div class="movie-modal__buttons-container">
          <button class="movie-modal__button movie-modal__watched not-in-list">Add to watched</button>
          <button class="movie-modal__button movie-modal__queue not-in-list">Add to queue</button>
        </div>
      </div>
      <div class="movie-modal__close-container">
        <span class="movie-modal__close">&times;</span>
    </div>
    </div>
  `;
};

export function renderMovieModal(movieModalData, movieId) {
  const movieModalHtml = movieModalMarkup(movieModalData);
  refs.movieModalContainer.innerHTML = movieModalHtml;
  refs.movieModalContainer.style.display = 'flex';
  if (`${movieId}` in watchedMovieList) {
    const watchListBtn = document.querySelector('.movie-modal__watched');
    watchListBtn.classList.add('in-list');
    watchListBtn.classList.remove('not-in-list');
    watchListBtn.innerHTML = 'REMOVE FROM WATCHED';
  };
  if (`${movieId}` in queuedMovieList) {
    const queueListBtn = document.querySelector('.movie-modal__queue');
    queueListBtn.classList.add('in-list');
    queueListBtn.classList.remove('not-in-list');
    queueListBtn.innerHTML = 'REMOVE FROM QUEUE';
  };
};

function onModalClick(e) {
  const watchListBtn = document.querySelector('.movie-modal__watched');
  const queueListBtn = document.querySelector('.movie-modal__queue');
  const modalCloseBtn = document.querySelector('.movie-modal__close');
  if (e.target === modalCloseBtn) {
    refs.movieModalContainer.style.display = 'none';
    refs.movieModalContainer.innerHTML = '';
  };
  if (e.target === watchListBtn) {
    updateList(watchListBtn);
  } else if (e.target === queueListBtn) {
    updateList(queueListBtn);
  };
};

function updateList(target) {
  const watchListBtn = document.querySelector('.movie-modal__watched');
  const queueListBtn = document.querySelector('.movie-modal__queue');
  const movieModalContent = document.querySelector('.movie-modal__card');
  let list;
  let LOCAL_STORAGE_KEY;
  let btnTextRemove;
  let btnTextAdd;
  if (target === watchListBtn) {
    list = watchedMovieList;
    LOCAL_STORAGE_KEY = 'watchedMovieList';
    btnTextRemove = 'REMOVE FROM WATCHED';
    btnTextAdd = 'ADD TO WATCHED';
    renderMovieList(watchedMovieList, null);
  } else if (target === queueListBtn) {
    list = queuedMovieList;
    LOCAL_STORAGE_KEY = 'queuedMovieList';
    btnTextRemove = 'REMOVE FROM QUEUE';
    btnTextAdd = 'ADD TO QUEUE';
  };
  if (`${movieId}` in list) {
    delete list[movieId];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    target.classList.remove('in-list');
    target.classList.add('not-in-list')
    target.style.cssText = `${notInListStyles}`;
    target.innerHTML = `${btnTextAdd}`;
  } else {
    const movieObj = {
      poster: movieModalContent.querySelector('.movie-modal__poster').src.trim(''),
      title: movieModalContent.querySelector('.movie-modal__title').textContent.trim(''),
      ogTitle: movieModalContent.querySelector('.og-title').textContent.trim(''),
      rating: movieModalContent.querySelector('.movie-poster__rating').textContent.trim(''),
      vote: movieModalContent.querySelector('.movie-poster__votes').textContent.trim(''),
      popularity: movieModalContent.querySelector('.popularity-data').textContent.trim(''),
      genre: movieModalContent.querySelector('.genres').textContent.trim(''),
      release: movieModalContent.querySelector('.release-date').textContent.trim(''),
      overview: movieModalContent.querySelector('.movie-modal__info-item-overview').textContent.trim(''),
    }
    list[movieId] = movieObj;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    target.classList.add('in-list')
    target.classList.remove('not-in-list');
    target.style.cssText = `${inListStyles}`;
    target.innerHTML = `${btnTextRemove}`;
  };
};

function renderMovieList(watchedMovieList, queuedMovieList) {
  let movies;
  if (queuedMovieList === null) {
    movies = watchedMovieList;
  } else {
    movies = queuedMovieList;
  }
  for (const movieID in movies) {
    if (movies.hasOwnProperty(movieID)) {
      const movie = movies[movieID];
      const movieElement = document.createElement('ul');
      movieElement.classList.add('movie-poster__gallery');
      movieElement.innerHTML = `
        <li class="movie-poster__card" data="${movieID}">
          <img class="movie-poster__img" src="${movie.poster}" alt="${movie.title}" ${movieGalleryPosterDimension}/>
          <div class="movie-poster__info">
            <h5 class="movie-poster__title">${movie.title}</h5>
            <div class="movie-poster__details-container">
              <p class="movie-poster__details">${movie.genre} | ${movie.release}</p >
              <p class="movie-poster__rating">${movie.rating}</p>
            </div>
          </div>
        </li>`;
      refs.moviePosterGallery.appendChild(movieElement);
    }
  };
};

refs.libraryLink.addEventListener('click', onLibraryLinkClick);
refs.homeLink.addEventListener('click', onHomeLinkClick);
refs.queueBtn.addEventListener('click', onQueueBtnClick);
refs.watchedBtn.addEventListener('click', onWatchedBtnClick);
refs.moviePosterGallery.addEventListener('click', onMoviePosterClick);
refs.movieModalContainer.addEventListener('click', onModalClick);