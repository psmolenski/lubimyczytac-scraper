//This scripts read games details from metacritic
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const ProgressBar = require('progress');

async function main() {
    const browser = await puppeteer.launch({
        headless: true
    });

    const browserPage = await browser.newPage();

    const games = require('./data/games.urls.json');
    const gamesDetails = [];

    for (let category of Object.keys(games)){
        const urls = games[category];
        const progress = new ProgressBar(category + ' :percent :bar :url', {total: urls.length});

        for (let url of urls) {
            progress.tick({
                url
            });
            await browserPage.goto(url);
            const game = await browserPage.$eval('#main', parseGameDetails, category);
            gamesDetails.push(game);
        }
    }

    await fs.writeFile(`games.details.json`, JSON.stringify(gamesDetails, null, 2));
    await browser.close();
}

function parseGameDetails(gameEl, category) {
    let dateStr = gameEl.querySelector('.summary_detail.release_data .data').innerText.trim();
    const date = new Date(Date.parse(dateStr));

    const ratingEl = gameEl.querySelector('.side_details .score_summary .metascore_w:not(.tbd)') || null;
    const numberOfRatingsEl = ratingEl ? gameEl.querySelector('.side_details .score_summary .count a') : null;

    return {
        title: gameEl.querySelector('.product_title h1').innerText.trim(),
        publisher: gameEl.querySelector('.summary_detail.publisher .data').innerText.trim(),
        platform: gameEl.querySelector('.platform').innerText.trim(),
        releaseDate: `${date.getFullYear()}-${new String(date.getMonth()).padStart(2, '0')}-${new String(date.getDay()).padStart(2, '0')}`,
        rating: ratingEl ? Number.parseFloat(ratingEl.innerText.trim()) : null,
        numberOfRatings: numberOfRatingsEl ? Number.parseInt(numberOfRatingsEl.innerText.trim()) : null,
        numberOfPrizes: gameEl.querySelectorAll('.rankings tbody tr').length,
        category: category
    }
}


main()
    .catch(e => console.log('Unexpected error', e));
