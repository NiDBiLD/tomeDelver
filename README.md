# Tome Delver

A simple web scraper that extracts content from websites and saves it as markdown files. This was custom-made to salvage game rule content from an unsecured bot-infected, old-as-dirt TTRPG wiki that had attracted a lot of spam and nonsense content over the years.

This means the scraper includes a lot of versatile filtering options, both for selecting parts of pages to scrape, as well as settings for which links to ignore while scraping.

The output should be well-formed git-style markup. If this is not the output in some cases, push a PR, I'll be super happy.

## Features

- Scrape content from specified websites
- Follow links to a configurable depth
- Exclude specific pages and sections
- Output content as markdown files

## Installation

Clone this repository:

```bash
git clone https://github.com/NiDBiLD/tomeDelver.git
```

Navigate to the project directory:

```bash
cd tomeDelver
```

Install the required dependencies:

```bash
npm install
```

Create a `config.json` file in the project directory, and configure the tomeDelver according to your needs. See the example below:

```json
{
	"baseUrl": "https://example.com",
	"contentSelector": "#main-content",
	"titleSelector": "h1",
	"maxDepth": 2,
	"excludeList": ["exclude-urls-that-include-this-string"],
	"retryOptions": {
 		"maxRetries": 7,
 		"initialDelay": 200
	},
	"removeStrings": ["regexToRemove"],
	"removeClasses": ["classToRemove"],
	"stringReplacements": [
 		{
   			"find": "regexToFind",
   			"replace": "replacementString"
 		}
	]
}
```
## Usage

To delve the tomes, execute the following command:

```bash
node tomeDelver.js
```

The scraped content will be saved as markdown files in the output directory.

## Future development

- Make a wrapper module that takes an array of config objects and runs tomeDelver on multiple pages?
- Provide multiple choices for output formats

## License

Shrug License. ¯\\\_(ツ)_/¯ Do whatever you want, I don't care, but keep it under Shrug License.
