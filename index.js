const puppeteer = require("puppeteer-core");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Facebook scraper server is running.");
});

app.get("/scrape", async (req, res) => {
  try {
    console.log("🔄 Starting scrape...");

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=2SosroBHbe0gzA2b0d0d11f842ccca248d0f1dada432a698d` // Replace this
    });

    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    const pageTitle = await page.title();
    await browser.close();

    res.json({ title: pageTitle });
  } catch (err) {
    console.error("❌ Error during scraping:", err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Your service is live 🎉");
});
