document.addEventListener('DOMContentLoaded', render);


async function getAllCharacters(pageNumber) {
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character?page=${pageNumber}`);

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Data receiving error: ${response.status}`);
        }
    } catch (ex) {
        alert(ex.message);
    }
}


async function getCharacter(id) {
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);

        if (response.ok) {

            return await response.json();
        } else {
            throw new Error(`Data receiving error: ${response.status}`);
        }
    } catch (ex) {
        alert(ex.message);
    }
}


async function render() {
    const contentContainer = document.getElementsByClassName('content-container')[0];
    
    contentContainer.innerHTML += await getContentHTML();
    
    const pagesCount = await renderCards();

    showHideSetUpBtn();
    setUpBtnAction();
    toggleViewMode(pagesCount);
}


async function getContentHTML() {
    return `
        <div class="pages-btns pages-btns_hidden">
            <button class="btn prev-btn">Previous</button>
            <div class="current-page" data-page-number="1">Page 1</div>
            <button class="btn next-btn">Next</button>
        </div>
        <div class="cards-wrapper"></div>
        <button class="btn up-btn up-btn_hidden">UP</button>
    `;
}


async function renderCards(pageNumber = 1, paginationModeOn) {
    const charCards = document.getElementsByClassName('cards-wrapper')[0],
        pageData = await getAllCharacters(pageNumber),
        charsData = pageData.results;

    if (paginationModeOn) {
        charCards.innerHTML = `${charsData.map(card => getCardPreviewHTML(card)).join('\n ')}`;
    } else {
        charCards.insertAdjacentHTML('beforeend', `${charsData.map(card => getCardPreviewHTML(card)).join('\n ')}`);

        setInfiniteFeed(pageNumber);
    }

    afterRender(charCards, charsData);
    
    return pageData.info.pages;
}


function getCardPreviewHTML(card) {
    return `
        <div class="char-card" data-char-id="${card.id}">
            <img class="char-card__img" src="${card.image}" alt="character image"></img>
            <div class="char-card__name">${card.name}</div>
        </div>
    `;
}


function setInfiniteFeed(pageNumber = 1) {

    window.onscroll = () => {
        let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

        if (windowRelativeBottom < document.documentElement.clientHeight + 100) {
            window.onscroll = null;

            renderCards(++pageNumber);
        }
    };
}


function showHideSetUpBtn() {
    const upBtn = document.getElementsByClassName('up-btn')[0];

    window.addEventListener('scroll', () => {
        window.scrollY > 300 ? upBtn.classList.remove('up-btn_hidden') : upBtn.classList.add('up-btn_hidden');
    });
}


function setUpBtnAction() {
    const upBtn = document.getElementsByClassName('up-btn')[0];

    upBtn.onclick = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    };
}


function afterRender(charCards) {
    charCards.onclick = evt => {
        const target = evt.target;

        target.parentElement.classList.contains('char-card') && showCharCard(target.parentElement.dataset.charId);    
    };
}


async function showCharCard(charId) {
    const body = document.body,
        card = await getCharacter(charId),
        episode = card.episode[0];

    body.insertAdjacentHTML('beforeend',
        `<div class="modal">
            <div class="modal__content">
                <div class="char-full-card">
                    <div class="char-full-card__img"><img src="${card.image}" alt="character image"></img></div>
                    <div class="card-info">
                        <div class="card-info__item">Name:<br><span>${card.name}</span></div>
                        <div class="card-info__item">Status:<br><span>${card.status}</span></div>
                        <div class="card-info__item">Species:<br><span>${card.species}</span></div>
                        <div class="card-info__item">Origin:<br><span>${card.origin.name}</span></div>
                    </div>
                    <div class="card-info">
                        <div class="card-info__item">Location:<br><span>${card.location.name}</span></div>
                        <div class="card-info__item">Gender:<br><span>${card.gender}</span></div>
                        <div class="card-info__item">First appearance:<br><span>episode ${episode.match(/\d+$/)[0]}</span></div>
                    </div>
                </div>
            </div>
        </div>
        `
    );

    afterModalWindowRender(body);
}


function afterModalWindowRender(body) {
    body.onclick = evt => {
        const target = evt.target;
        target.classList.contains('modal') && target.remove();
    };
}


function toggleViewMode(pagesCount) {
    const toggleBtn = document.getElementsByClassName('toggle-btn')[0],
        charCards = document.getElementsByClassName('cards-wrapper')[0],
        pagesBtns = document.getElementsByClassName('pages-btns')[0],
        prevBtn = document.getElementsByClassName('prev-btn')[0],
        currentPageEl = document.getElementsByClassName('current-page')[0];

    toggleBtn.onclick = () => {
        if (toggleBtn.dataset.mode == 'pagination') {
            pagesBtns.classList.remove('pages-btns_hidden');
            toggleBtn.dataset.mode = 'infinite-feed';
            toggleBtn.innerText = 'Infinite feed';
            currentPageEl.dataset.pageNumber = 1;
            currentPageEl.innerText = 'Page 1';
            prevBtn.disabled = true;
            window.onscroll = null;

            getPageBtnsSetActions(pagesCount);
            renderCards( currentPageEl.dataset.pageNumber, true);
        } else {
            charCards.innerHTML = '';
            pagesBtns.classList.add('pages-btns_hidden');
            toggleBtn.dataset.mode = 'pagination';
            toggleBtn.innerText = 'Pages mode';

            renderCards();
            setInfiniteFeed();
        }
    };
}


function getPageBtnsSetActions(pagesCount) {
    const currentPageEl = document.getElementsByClassName('current-page')[0],
        prevBtn = document.getElementsByClassName('prev-btn')[0],
        nextBtn = document.getElementsByClassName('next-btn')[0];
    let currentPageNumber = currentPageEl.dataset.pageNumber;

    prevBtn.onclick = () => {
        currentPageEl.dataset.pageNumber = --currentPageNumber;

        renderPage(currentPageEl, currentPageNumber, prevBtn, nextBtn, pagesCount);
    };
    nextBtn.onclick = () => {
        currentPageEl.dataset.pageNumber = ++currentPageNumber;

        renderPage(currentPageEl, currentPageNumber, prevBtn, nextBtn, pagesCount);
    };  
}

function renderPage(currentPageEl, currentPageNumber, prevBtn, nextBtn, pagesCount) {
    currentPageEl.innerText = `Page ${currentPageNumber}`;
    currentPageNumber == 1 ? prevBtn.disabled = true : prevBtn.disabled = false;
    currentPageNumber == pagesCount ? nextBtn.disabled = true : nextBtn.disabled = false;

    renderCards(currentPageNumber, true);
}
