const url = require('url');
const entities = require('entities');
const validator = require('validator');
const cheerio = require('cheerio');

const {
  decodeHtmlEntities,
  removeArbitraryStrings,
} = require('./stringManipulation');

const { createHttpClient, retryWithExponentialBackoff } = require('./http');
const { createTurndownService } = require('./turndown');
const { saveContentToFile, ensureOutputDirectoryExists } = require('./fileHandler');

// Read the configuration from config.json
const config = require('./config.json');

const turndownService = createTurndownService();
const visited = new Set();
const outputDir = 'output';

async function scrapePage(http, pageUrl, depth) {
  if (visited.has(pageUrl) || depth > config.maxDepth || shouldSkipUrl(pageUrl)) {
    return;
  }

  visited.add(pageUrl);
  console.log(`Scraping ${pageUrl}`);
  const response = await retryWithExponentialBackoff(() => http.get(pageUrl), config.retryOptions);

  if (!response) {
    console.error(`Failed to fetch ${pageUrl} after max retries. Skipping this page.`);
    return;
  }

  const $ = cheerio.load(response.data.toString('utf8'));

  const contentHtml = $(config.contentSelector).html();
  const pageTitle = decodeHtmlEntities($(config.titleSelector).html());

  if (!contentHtml || !pageTitle) {
    console.error(`Error in page. Skipped ${pageUrl} due to missing content or title`);
    return;
  }

  const cleanedContent = $(`<div>${contentHtml}</div>`).find('a').replaceWith(function () {
    return $(this).text();
  }).end().html();
  const contentWithoutArbitraryStrings = removeArbitraryStrings(cleanedContent);

  if (!shouldSkipUrl(pageUrl)) {
    await saveContentToFile(outputDir, pageTitle, contentWithoutArbitraryStrings, turndownService);
  }

  if (depth < config.maxDepth) {
    const links = $('a[href]:not([href*="#"])');
    const linkPromises = links.get().map(async linkElement => {
      const link = $(linkElement).attr('href');
      const absoluteLink = url.resolve(config.baseUrl, link);
  
      if (validator.isURL(absoluteLink) && absoluteLink.startsWith(config.baseUrl) && !visited.has(absoluteLink)) {
        await scrapePage(http, absoluteLink, depth + 1);
      }
    });
  
    await Promise.all(linkPromises);
  }
}

async function main() {
  console.log('SCRAPER.JS');
  try {
    await ensureOutputDirectoryExists(outputDir);
    console.log('SCRAPING:');
    const http = createHttpClient();
    await scrapePage(http, config.baseUrl, 0);
  } catch (error) {
    console.error(`Error while scraping: ${error.message}`);
  }
}

function shouldSkipUrl(pageUrl) {
  return config.excludeList.some(term => pageUrl.includes(term));
}

main();