const axios = require('axios');
const axiosRateLimit = require('axios-rate-limit');
const config = require('./config.json');

function createHttpClient() {
  const http = axiosRateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 200 });
  http.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
  return http;
}

async function retryWithExponentialBackoff(fn, retryOptions = { maxRetries: 7, initialDelay: 200 }) {
	let retries = 0;
	let delay = retryOptions.initialDelay;
  
	while (retries < retryOptions.maxRetries) {
	  try {
		const result = await fn(); // Execute the function
		console.log('Request successful:', result.config.url, 'Status:', result.status); // Add this line
		return result;
	  } catch (error) {
		retries++;
		console.error(
		  `Error (${error.name}): ${error.message}. Retrying in ${delay} ms... (attempt ${retries} of ${retryOptions.maxRetries})`,
		  error
		);
		await new Promise(resolve => setTimeout(resolve, delay));
		delay *= 2; // Double the delay for the next retry
	  }
	}
	console.error('Max retries reached. Skipping the current page.');
	return null;
  }

module.exports = {
  createHttpClient,
  retryWithExponentialBackoff
};