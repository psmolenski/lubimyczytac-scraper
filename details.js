//This scripts read book details
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function main() {
    const browser = await puppeteer.launch({
        headless: true
    });

    const browserPage = await browser.newPage();

    const urls = require('./data/romans.urls.json');
    const booksDetails = [];

    for (let url of urls) {
        console.log(url);
        await browserPage.goto(url);
        const bookDetails = await browserPage.$eval('.book', parseBookDetails);
        booksDetails.push(bookDetails);
    }

    await fs.writeFile(`romans.details.json`, JSON.stringify(booksDetails, null, 2));
    await browser.close();
}

function parseBookDetails(bookEl) {
    const detailsEls = Array.from(bookEl.querySelectorAll('#book-details dt'));
    const numberOfPagesLabelEl = detailsEls.find(dt => dt.innerText.trim() === 'Liczba stron:');
    const yearOfPublishLabelEl = detailsEls.find(dt => dt.innerText.trim() === 'Data wydania:');

    return {
        title: bookEl.querySelector('.book__title').innerText.trim(),
        author: bookEl.querySelector('.author').innerText.trim(),
        publisher: bookEl.querySelector('.book__txt a').innerText,
        rating: Number.parseFloat(bookEl.querySelector('.rating-value .big-number').innerText.replace(',', '.')),
        numberOfRatings: Number.parseInt(bookEl.querySelector('.rating .book-pages').innerText.trim().split(' ')[0]),
        numberOfPages: numberOfPagesLabelEl ? Number.parseInt(numberOfPagesLabelEl.nextElementSibling.innerText.trim()) : null,
        yearOfPublish: yearOfPublishLabelEl ? Number.parseInt(yearOfPublishLabelEl.nextElementSibling.innerText.trim().split('-')[0]) : null,
    }
}


main()
    .catch(e => console.log('Unexpected error', e));