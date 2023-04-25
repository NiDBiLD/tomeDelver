const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');

async function saveContentToFile(outputDir, pageTitle, content, turndownService) {
	const markdownTitle = `# ${pageTitle}\n\n`;
	const markdownContent = turndownService.turndown(content);
	const completeMarkdownContent = markdownTitle + markdownContent;
	const fileName = sanitize(pageTitle) + '.md';
	const outputPath = path.join(outputDir, fileName);
  
	try {
	  await fs.promises.writeFile(outputPath, completeMarkdownContent, 'utf8');
	  console.log(`Saved ${pageTitle} to ${outputPath}`);
	} catch (error) {
	  console.error(`Error saving ${pageTitle} to ${outputPath}: ${error.message}`);
	}
  }
  
  async function ensureOutputDirectoryExists(outputDir) {
	try {
		await fs.promises.access(outputDir);
	} catch (err) {
		if (err.code === 'ENOENT') {
			await fs.promises.mkdir(outputDir);
		} else {
			throw err;
		}
	}
}

module.exports = {
	saveContentToFile,
	ensureOutputDirectoryExists
};