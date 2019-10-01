const $app = document.getElementById('app');
const $observe = document.getElementById('observe');
const API = 'https://rickandmortyapi.com/api/character/';

/**
 * Make a request for an API, if everything sells well returns the object of the response,
 * if the status code is different than two hundred creates a new error
 * @param {string} api 
 */
function getData(api) {
  return fetch(api)
    .then(response => {
      if (response.status !== 200) throw new Error('Ups al parecer algo salio mal');
      return response.json();
    })
    .catch(buildAndRenderError);
}

/**
 * Validate that next_fetch has a url validate
 * If not is valid render a message and destroy observer
 */
function nextFetchIsValid() {
  if(localStorage.getItem('next_fetch') === "") {
    const html = `<h2>Ya no hay mas personajes</h2>`;
    renderHTML(html, $app);
    intersectionObserver.disconnect(); 
    return false;
  }
  return true;
}

/**
 * Save in the local storage a url with name key next_fetch
 * @param {string} url 
 */
function saveNextFetch(url) {
  localStorage.setItem('next_fetch', url);
}

/**
 * Validate that exist in the local storage a url with name key next_fetch
 */
function existNextFetch() {
  if (localStorage.getItem('next_fetch') !== null) return true; 
  return false;
}

/**
 * Load all information in our DOM
 */
async function loadData() { 
  try {
    let api;
    (existNextFetch()) 
      ? api = localStorage.getItem('next_fetch') 
      : api = API
    const res = await getData(api);    
    const characters = res.results;
    const html = buildCardsOfCharacters(characters);
    renderHTML(html, $app);
    const nextURL = res.info.next;
    saveNextFetch(nextURL);
  } catch(err) {
    buildAndRenderError(err.message);
  }
}

/**
 * Build html of characters
 * @param {*} characters 
 */
function buildCardsOfCharacters(characters) {
  return characters.map(character => {
    return `
      <article class="Card">
        <img src="${character.image}"/>
        <h2>${character.name}<span>${character.species}</span></h2>
      </article>
    `;
  }).join('');
} 

/**
 * Insert html in HTML Element
 * @param {string} html
 * @param {HTMLElement} DOM 
 */
function renderHTML(html, DOM) {
  const newItem = document.createElement('container');
  newItem.classList.add('Items');
  newItem.innerHTML = html;
  DOM.appendChild(newItem);
}

/**
 * Render a error if something is wrong
 * @param {Error} error
 * @param {HTMLElement} DOM 
 */
function buildAndRenderError(error, DOM = document.getElementById('app')) {
  const html = `<p>Error: ${error.message}</p>`;
  renderHTML(html, DOM);
}

const intersectionObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    if(!nextFetchIsValid()) return;
    loadData();
  }
}, {
  rootMargin: '0px 0px 100% 0px',
});

intersectionObserver.observe($observe);

/**
 * Event listening to the page reload
 */
window.onbeforeunload = function () {
  localStorage.removeItem('next_fetch');
}
window.onbeforeunload();