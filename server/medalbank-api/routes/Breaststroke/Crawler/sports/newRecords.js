const axios = require('axios');
const cheerio = require('cheerio');

// The URL to be crawled
const url = 'https://www.korswim.co.kr/page/14';

// Function to crawl the page
async function crawlPage() {
  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);
    
    // Load the HTML content into cheerio
    const $ = cheerio.load(data);
    
    // Extract the desired data
    // This is a generic example; you should adjust the selectors based on the actual structure of the page
    const results = [];
    $('.item').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const link = $(element).find('a').attr('href');
      results.push({ title, link });
    });
    
    // Print the extracted data
    console.log(results);
  } catch (error) {
    console.error('Error crawling the page:', error);
  }
}

// Run the crawlPage function
crawlPage();
