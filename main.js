const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const categories = require('./data/kategorie.json');

async function main() {
    const browser = await puppeteer.launch({
        headless: true
    });

    const browserPage = await browser.newPage();

    for (let [category, url] of Object.entries(categories)) {
        const books = [];

        for (let page = 1; page <= 5; page++) {
            await browserPage.goto(url + page);
            const booksFromPage = await browserPage.$$eval('.listLibrary .authorAllBooks__single', parseBooks);

            console.log(`Page ${page} of 5. Books ${booksFromPage.length}. Total ${books.length}`);

            books.push(...booksFromPage);
        }

        await fs.writeFile(`${category}.json`, JSON.stringify(books, null, 2));
    }



    await browser.close();
}

function parseBooks(booksEls) {
    return booksEls.map(bookEl => {
        return {
            title: bookEl.querySelector('.authorAllBooks__singleTextTitle').innerText,
            author: bookEl.querySelector('.authorAllBooks__singleTextAuthor').innerText,
            url: bookEl.querySelector('.authorAllBooks__singleTextTitle').href,
            rating: Number.parseFloat(bookEl.querySelector('.listLibrary__ratingStarsNumber').innerText),
            numberOfRates: Number.parseInt(bookEl.querySelector('.listLibrary__ratingAll').innerText.split(' ')[0])
        }
    });
}


main()
    .catch(e => console.log('Unexpected error', e));