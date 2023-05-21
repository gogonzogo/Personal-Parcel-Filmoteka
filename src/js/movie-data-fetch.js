import { renderMoviePoster, renderMovieModal, trendingMovieData, movieId } from '../index';
import debounce from 'lodash.debounce';

const refs = {
  userMovieSearch: document.querySelector('.header__movie-search'),
  homeLink: document.querySelector('.home-link'),
  libraryLink: document.querySelector('.library-link'),
  moviePosterGallery: document.querySelector('.movie-poster__gallery'),
  logoLink: document.querySelector('.logo-link'),
  goitLink: document.querySelector('.footer-link'),
  failedSearchText: document.querySelector('.search-text__failed'),
  previosPageBtn: document.querySelector('.btn__previous-page'),
  nextPageBtn: document.querySelector('.btn__next-page'),
  currentPageEl: document.querySelector('.current-page'),
  paginationContainer: document.querySelector('.pagination__container'),
  paginationList: document.querySelector('.pagination__list'),
  movieModalContainer: document.querySelector('.movie-modal__container'),
};
let movieId;
let userInput;
let currentPage;
let page = 1;
let totalPages;
const MOVIE_GENRE_LOCALSTORAGE_KEY = 'movieGenres';
const API__KEY = `5d8e08b77a668b368d7194faf94b14f5`;
const BASE__URL = `https://api.themoviedb.org/3/`;
const TRENDING__URL = `movie/popular?api_key=${API__KEY}&language=en-US`;
const GENRE__URL = `genre/movie//list?api_key=${API__KEY}&language=en-US`;
const SEARCH__URL = `search/movie?api_key=${API__KEY}&language=en-US`;

export async function fetchMovies(page) {
  if (userInput) {
    fetchMoviesSearch(userInput, page);
  } else if (!userInput) {
    try {
      refs.failedSearchText.style.display = 'none';
      const trendingMovieFetch = await fetch(`${BASE__URL}${TRENDING__URL}&page=${page}`);
      const trendingMovieData = await trendingMovieFetch.json();
      currentPage = trendingMovieData.page;
      totalPages = trendingMovieData.total_pages;
      const trendingMovies = trendingMovieData.results;
      createPagination(totalPages, currentPage);
      renderMoviePoster(trendingMovies);
    }
    catch (error) {
      console.log(error);
    }
  };
};

export async function fetchMovieGenres(genreIds) {
  try {
    const url = `${BASE__URL}${GENRE__URL}`;
    const movieGenresFetch = await fetch(url);
    const movieGenresData = await movieGenresFetch.json();
    const genres = genreIds.map(genreId => {
      const genre = movieGenresData.genres.find(genre => genre.id === genreId);
      return genre.name;
    })
    localStorage.setItem('movieGenres', JSON.stringify(movieGenresData));
    return genres;
  }
  catch (error) {
    console.log(error);
  }
};

export async function fetchMoviesSearch(userInput, page) {
  try {
    const url = `${BASE__URL}${SEARCH__URL}&query=${userInput}&page=${page}&include_adult=false`;
    const movieSearchFetch = await fetch(url);
    const movieSearchData = await movieSearchFetch.json();
    currentPage = movieSearchData.page;
    totalPages = movieSearchData.total_pages;
    const movieSearch = movieSearchData.results;
    createPagination(totalPages, currentPage);
    renderMoviePoster(movieSearch);

    if (movieSearch.length === 0) {
      refs.failedSearchText.style.display = 'flex';
    } else if(movieSearch.length > 0) {
      refs.failedSearchText.style.display = 'none';
    }
  }
  catch (error) {
    console.log(error);
  }
};

export async function fetchModalMovie(movieId) {
  try {
    const url = `${BASE__URL}movie/${movieId}?api_key=${API__KEY}&language=en-US`;
    const movieByIdFetch = await fetch(url);
    const movieByIdData = await movieByIdFetch.json();
    renderMovieModal(movieByIdData, movieId);
  }
  catch (error) {
    console.log(error);
  }
};

function onUserMovieSearch(e) {
  userInput = e.target.value;
  if (!userInput) {
    fetchMovies(page);
  }
  refs.moviePosterGallery.innerHTML = '';
  fetchMoviesSearch(userInput, page);
  createPagination(totalPages, currentPage);
};

function onPaginationItemClick(e) {
  if (!e.target.closest('LI').classList.contains('pagination__item')) {
    return;
  } if (e.target.closest('LI').classList.contains('next-page')) {
    page++;
    fetchMovies(page);
  } if (e.target.closest('LI').classList.contains('previous-page')) {
    page--;
    fetchMovies(page);
  } if (e.target.closest('LI').classList.contains('page-number')) {
    page = Number(e.target.textContent);
    fetchMovies(page);
  };
};

function createPagination(totalPages, page) {
  let paginationItem = '';
  let active;
  let firstLiPage = (page >= 6) ? page - 5 : 1;
  let beforePage = page - 2;
  let afterPage = page + 2;
  if (window.innerWidth > 767) {

    if (page > 1) { //show the previous button if the page value is greater than 1
      paginationItem += ` 
      <li class="pagination__item previous-page page-control">
        <svg class="previous-icon pagination-icon" width="16" height="16">
          <use href="/images/sprite.svg#icon-arrow-right"></use>
        </svg>
      </li>`;
    }

    if (page > 3) { //if page value is greater than 3 then add first li or page
      paginationItem += `<li class="pagination__item page-number page-control">${firstLiPage}</li>`;
      if (page > 4) { //if page value is greater than 5 then add this (...) after the first li or page
        paginationItem += `<li class="pagination__item pagination-dots"><span class="page-dots">...</span></li>`;
      }
    }

    // how many pages or li show before the current li
    if (beforePage < 1) {
      beforePage = 1;
    }

    // how many pages or li show after the current li
    if (afterPage > totalPages) {
      afterPage = totalPages;
    }

    for (let pageCount = beforePage; pageCount <= afterPage; pageCount++) {
      if (pageCount > totalPages) { //if pageCount is greater than totalPage length then continue
        continue;
      }
      if (pageCount == 0) { //if pageCount is 0 than add +1 in pageCount value
        pageCount = pageCount + 1;
      }
      if (page == pageCount) { //if page is equal to pageCount than assign active string in the active variable
        active = "current-page";
      } else { //else leave empty to the active variable
        active = "";
      }
      paginationItem += `<li class="pagination__item page-number page-control ${active}">${pageCount}</li>`;
    }

    if (page < totalPages - 2) { //if page value is less than totalPage value by -2 then add this (...) before the last li or page
      if (page < totalPages - 4) {
        paginationItem += `<li class="pagination__item pagination-dots"><span class="page-dots">...</span></li>`;
      }
      paginationItem += `<li class="pagination__item page-number page-control">${page + 5}</li>`;
    }

    if (page < totalPages) { //show the next button if the page value is less than totalPage(20)
      paginationItem += `
      <li class="pagination__item next-page page-control">
        <svg class="next-icon pagination-icon" width="16" height="16">
          <use href="./images/sprite.svg#icon-arrow-right"></use>
        </svg>
      </li>`;
    }
    refs.paginationList.innerHTML = paginationItem;
    //add li tag inside ul tag
    return paginationItem; //return the li tag
  } else if (window.innerWidth < 768) {
    beforePage = page - 1;
    afterPage = page + 1;

    if (page > 1) { //show the previous button if the page value is greater than 1
      paginationItem += ` 
      <li class="pagination__item previous-page page-control">
        <svg class="previous-icon pagination-icon" width="16" height="16">
          <use href="/images/sprite.svg#icon-arrow-right"></use>
        </svg>
      </li>`;
    }

    if (page > 2) {
      paginationItem += `<li class="pagination__item page-number page-control">${firstLiPage}</li>`;
    }

    if (page == totalPages) {
      beforePage = beforePage - 2;
    } else if (page == totalPages - 1) {
      beforePage = beforePage - 1;
    }
    // how many pages or li show after the current li
    if (page == 1) {
      afterPage = afterPage + 2;
    } else if (page == 2) {
      afterPage = afterPage + 1;
    }

    for (let pageCount = beforePage; pageCount <= afterPage; pageCount++) {
      if (pageCount > totalPages) { //if pageCount is greater than totalPage length then continue
        continue;
      }
      if (pageCount == 0) { //if pageCount is 0 than add +1 in pageCount value
        pageCount = pageCount + 1;
      }
      if (page == pageCount) { //if page is equal to pageCount than assign active string in the active variable
        active = "current-page";
      } else { //else leave empty to the active variable
        active = "";
      }
      paginationItem += `<li class="pagination__item page-number page-control ${active}">${pageCount}</li>`;
    }

    if (page < totalPages - 1) { //if page value is less than totalPage value by -2 then add this (...) before the last li or page
      paginationItem += `<li class="pagination__item page-number page-control">${page + 5}</li>`;
    }

    if (page < totalPages) { //show the next button if the page value is less than totalPage(20)
      paginationItem += `
      <li class="pagination__item next-page page-control">
        <svg class="next-icon pagination-icon" width="16" height="16">
          <use href="./images/sprite.svg#icon-arrow-right"></use>
        </svg>
      </li>`;
    }
    refs.paginationList.innerHTML = paginationItem;
    return paginationItem; //reurn the li tag
  }
};

fetchMovies(page);

refs.userMovieSearch.addEventListener('input', debounce(onUserMovieSearch, 500));
refs.paginationContainer.addEventListener('click', onPaginationItemClick);
