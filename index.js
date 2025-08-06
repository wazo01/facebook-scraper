const puppeteer = require("puppeteer-core");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

// Grab your API key from Render's environment variables
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

app.get("/", (req, res) => {
  res.send("✅ Facebook scraper server is running.");
});

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`,
    });

    const page = await browser.newPage();
    await page.goto("https://example.com");
    const title = await page.title();

    await browser.close();

    res.json({ title });
  } catch (err) {
    console.error("❌ Scraping error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
