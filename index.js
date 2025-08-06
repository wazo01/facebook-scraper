const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Facebook scraper server is running.");
});

app.get("/scrape", async (req, res) => {
  try {
    console.log("🔍 Starting scrape...");

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://chrome.browserless.io?token=2SosroBHbe0gzA2b0d0d11f842ccca248d0f1dada432a698d`
});

    });

    const page = await browser.newPage();
    await page.goto("https://www.facebook.com/marketplace/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('input[placeholder="Search Marketplace"]');
    await page.type('input[placeholder="Search Marketplace"]', "iPhone 15 Pro Max");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(8000); // Adjust wait time if needed

    const listings = await page.evaluate(() => {
      const items = [];
      const nodes = document.querySelectorAll("a[href*='/marketplace/item/']");
      nodes.forEach((node) => {
        const title = node.innerText;
        const url = node.href;
        const priceMatch = title.match(/£(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1]) : null;

        if (price !== null && price <= 400) {
          items.push({ title, url, price });
        }
      });
      return items;
    });

    await browser.close();

    fs.writeFileSync("results.json", JSON.stringify(listings, null, 2));
    console.log("✅ Scrape successful. Results saved.");
    res.json({ message: "✅ Scrape successful", results: listings });

  } catch (err) {
    console.error("❌ Scraper failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
