const TurndownService = require('turndown');
const gfm = require('turndown-plugin-gfm');

function createTurndownService() {
	const turndownService = new TurndownService();
	turndownService.use(gfm.gfm);
	return turndownService;
}

module.exports = {
	createTurndownService,
};