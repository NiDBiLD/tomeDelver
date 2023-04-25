const cheerio = require('cheerio');
const config = require('./config.json');
const entities = require('entities');

function decodeHtmlEntities(text) {
  return text ? entities.decodeHTML(text) : '';
}

function replaceStrings(content) {
  config.stringReplacements.forEach(replacement => {
    const regex = new RegExp(replacement.find, 'gm');
    content = content.replace(regex, replacement.replace);
  });

  return content;
}

function removeArbitraryStrings(content) {
  // Remove strings based on regex patterns
  config.removeStrings.forEach(pattern => {
    const regex = new RegExp(pattern, 'gm');
    content = content.replace(regex, '');
  });

  // Remove elements with specified classes
  content = removeElementsByClass(content, config.removeClasses);

  // Replace specified strings
  content = replaceStrings(content);

  // Remove line breaks from table cells
  content = processTableCells(content);

  return content;
}

function processTableCells(content) {
  const $ = cheerio.load(content);

  $('table td, table th').each((_, element) => {
    let cellContent = $(element).html();
    cellContent = processParagraphs(cellContent);
    cellContent = processLists(cellContent);
    cellContent = processLineBreaks(cellContent);
    $(element).html(cellContent);
  });

  return $.html();
}

function processParagraphs(content) {
  return content.replace(/<p>/gi, '').replace(/<\/p>/gi, '  \n');
}

function processLists(content) {
  return content
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li>/gi, '* ')
    .replace(/<\/li>/gi, '  \n');
}

function processLineBreaks(content) {
  return content.replace(/<br(\s*\/)?>/gi, '  \n');
}

function removeElementsByClass(content, classList) {
  const $ = cheerio.load(content);

  classList.forEach(classToRemove => {
    $(`.${classToRemove}`).remove();
  });

  return $.html();
}

module.exports = {
    decodeHtmlEntities,
    removeArbitraryStrings,
};