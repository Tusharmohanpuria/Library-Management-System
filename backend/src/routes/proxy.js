import express from "express";
import axios from 'axios';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

const router = express.Router();

const handleApiError = (error) => {
  console.error('Error fetching data from Google Books API:', error);
  throw new Error('Failed to fetch data from Google Books API.');
};

const handleScrapingError = (error, site) => {
  console.error(`Error scraping ${site}:`, error);
  throw new Error(`Failed to scrape data from ${site}.`);
};

const fetchGoogleBooksData = async (isbn) => {
  try {
    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const axiosConfig = {
      timeout: 10000,
    };
    const response = await axios.get(googleBooksApiUrl, axiosConfig);

    if (response.data.items && response.data.items.length > 0) {
      const bookData = response.data.items[0].volumeInfo;

      // Check if 'industryIdentifiers' is defined and has elements
      const isbn10 = bookData.industryIdentifiers && bookData.industryIdentifiers[0] ? bookData.industryIdentifiers[0].identifier : '';
      const isbn13 = bookData.industryIdentifiers && bookData.industryIdentifiers[1] ? bookData.industryIdentifiers[1].identifier : '';

      const googleBooksData = {
        title: bookData.title || '',
        authors: bookData.authors ? bookData.authors.join(', ') : '',
        publisher: bookData.publisher || '',
        ISBN_10: isbn10,
        ISBN_13: isbn13,
        pageCount: bookData.pageCount || 0,
        description: bookData.description || '',
        coverImage: bookData.imageLinks ? bookData.imageLinks.thumbnail : '',
        infoLink: bookData.infoLink || '',
      };

      return googleBooksData;
    } else {
      return null;
    }
  } catch (error) {
    handleApiError(error);
  }
};

const fetchAdditionalData = async (infoLink) => {
  try {
    const response = await axios.get(infoLink);
    const $ = cheerio.load(response.data);

    // Extract relevant information using Cheerio selectors
    const title = $('.metadata_label:contains("Title") + .metadata_value span').text().trim();
    const author = $('.metadata_label:contains("Author") + .metadata_value a.primary span').text().trim();
    const publisher = $('.metadata_label:contains("Publisher") + .metadata_value span').text().trim();
    
    const isbnString = $('.metadata_label:contains("ISBN") + .metadata_value span').text().trim();
    const isbns = isbnString.split(',').map(isbn => isbn.trim());

    const pageCountString = $('.metadata_label:contains("Length") + .metadata_value span').text().trim();
    const pageCount = parseInt(pageCountString.replace(/\D/g, ''), 10) || 0;

    const isbn10 = isbns.find(isbn => isbn.length === 10);
    const isbn13 = isbns.find(isbn => isbn.length === 13);

    const additionalData = {
      title,
      author,
      publisher,
      isbn10,
      isbn13,
      pageCount,
    };

    return additionalData;
  } catch (error) {
    console.error('Error fetching additional data:', error.message);
  }
};

const consolidateData = (apiData, scrapedData) => {
  if (!apiData) {
    return scrapedData;
  }

  if (!apiData.ISBN_10 || !apiData.ISBN_13) {
    apiData.ISBN_10 = scrapedData.isbn10;
    apiData.ISBN_13 = scrapedData.isbn13;
  }
  if (!apiData.title) {
    apiData.title = scrapedData.title;
  }
  if (!apiData.authors) {
    apiData.authors = scrapedData.authors;
  }
  if (!apiData.publisher) {
    apiData.publisher = scrapedData.publisher;
  }
  if (apiData.pageCount === 0) {
    apiData.pageCount = scrapedData.pageCount;
  }
  if (!apiData.description) {
    apiData.description = scrapedData.description;
  }

  delete apiData.infoLink;

  return apiData;
};

const scrapeAmazonByISBN = async (isbn) => {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${isbn}&crid=2J6T0UNDZBI9K&sprefix=${isbn}&ref=nb_sb_noss`;

    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    // Extract the URL of the first search result
    const firstResultLink = $('.s-main-slot .s-result-item h2 a').attr('href');

    if (!firstResultLink) {
      return null;
    }

    // Construct the full URL of the product page and scrape its data
    const productPageUrl = `https://www.amazon.in${firstResultLink}`;
    const amazonProductData = await scrapeAmazonProduct(productPageUrl);

    return amazonProductData;
  } catch (error) {
    handleScrapingError(error, 'Amazon search results');
  }
};

const scrapeAmazonProduct = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();

    // Extract the product description
    let description = '';
    const descriptionContainer = $('#bookDescription_feature_div');

    // Check if the description container exists
    if (descriptionContainer.length > 0) {
      const descriptionElement = descriptionContainer.find('.a-expander-content span');

      // Check if the description is hidden and can be expanded
      if (descriptionElement.length > 0 && descriptionElement.text().trim() === '') {
        // Click the "Read more" link to expand the description
        await axios.post(url, { data: { csa: { data: { action: 'a-expander-toggle' } } } });
        
        // Wait for a brief moment to ensure the description is fully expanded
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Retrieve the expanded description
      description = descriptionContainer.find('.a-expander-content span').text().trim();
    }

    // Extract the cover image URL
    let coverImageJSON = $('#imgBlkFront').attr('data-a-dynamic-image');
    if (!coverImageJSON) {
      coverImageJSON = $('#landingImage').attr('data-a-dynamic-image');
    }

    // Parse the JSON to get the image URLs
    const coverImageObj = JSON.parse(coverImageJSON);
    
    const coverImageURL = Object.keys(coverImageObj)[0];

    return {
      title,
      description,
      coverImage: coverImageURL,
    };
  } catch (error) {
    handleScrapingError(error, 'Amazon product');
  }
};

const fetchAndConvertToBase64 = async (url) => {
  const response = await fetch(url);

  if (response.ok) {
    const buffer = await response.buffer();
    const base64Image = buffer.toString('base64');

    return base64Image;
  } else {
    console.error(`Failed to fetch image. Status code: ${response.status}`);
    return null;
  }
};

router.get('/proxy', async (req, res) => {
  const isbn = req.query.isbn;

  if (!isbn) {
    return res.status(400).json({ message: 'ISBN is required.' });
  }

  try {
    const googleBooksApiData = await fetchGoogleBooksData(isbn);

    if (!googleBooksApiData) {
      return res.status(404).json({ message: 'Book not found on Google Books.' });
    }

    const scrapedData = await fetchAdditionalData(googleBooksApiData.infoLink);
    const consolidatedData = consolidateData(googleBooksApiData, scrapedData);

    // Check if the description is null in consolidatedData and fetch from Amazon if needed
    if (consolidatedData && !consolidatedData.description && !consolidatedData.coverImage) {
      const amazonProductData = await scrapeAmazonByISBN(isbn);
      
      // Update the description in consolidatedData
      consolidatedData.description = amazonProductData ? amazonProductData.description : '';
      consolidatedData.coverImage = amazonProductData ? amazonProductData.coverImage : '';
    }

    if(consolidateData.coverImage){
      consolidateData.coverImage = await fetchAndConvertToBase64(consolidateData.coverImage);  
    }
    if (consolidatedData) {
      res.status(200).json(consolidatedData);
    } else {
      res.status(404).json({ message: 'Book not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;