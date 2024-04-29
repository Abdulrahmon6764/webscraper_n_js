const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// Function to fetch website content
async function fetchWebsite(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching website:", error);
    return null;
  }
}

// Function to extract website code, images, and videos
async function scrapeWebsite(url) {
  const websiteContent = await fetchWebsite(url);
  if (!websiteContent) {
    return console.log("failed to fetch web");
  }

  const $ = cheerio.load(websiteContent);
  const websiteData = {
    code: $("html").html(), // Website HTML code
    images: [],
    videos: [],
  };

  // Extract image URLs
  $("img").each((index, element) => {
    const imageUrl = $(element).attr("src");
    if (imageUrl) {
      websiteData.images.push(imageUrl);
    }
  });

  // Extract video URLs
  $("video").each((index, element) => {
    const videoUrl = $(element).attr("src");
    if (videoUrl) {
      websiteData.videos.push(videoUrl);
    }
  });

  return websiteData;
}

// Example usage
const websiteUrl = "https://example.com/";
scrapeWebsite(websiteUrl)
  .then((websiteData) => {
    if (websiteData) {
      // Save website code to a file
      fs.writeFileSync(
        path.join(__dirname, "website_code.html"),
        websiteData.code
      );

      // Save images to files
      websiteData.images.forEach((imageUrl, index) => {
        axios({
          method: "get",
          url: imageUrl,
          responseType: "stream",
        })
          .then((response) => {
            response.data.pipe(
              fs.createWriteStream(path.join(__dirname, `image_${index}.jpg`))
            );
          })
          .catch((error) => {
            console.error("Error fetching image:", error);
          });
      });
    }
  })
  .catch((error) => {
    console.error("Error scraping website:", error);
  });
