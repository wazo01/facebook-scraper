const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });

    const page = await browser.newPage();
    await page.goto("https://www.facebook.com/marketplace/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('input[placeholder="Search Marketplace"]');
    await page.type('input[placeholder="Search Marketplace"]', "iPhone 15 Pro Max");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(8000);

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
    res.json({ success: true, listings });
  } catch (error) {
    console.error("❌ Scraper failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/results.json", (req, res) => {
  try {
    const data = fs.readFileSync("results.json", "utf-8");
    res.type("application/json").send(data);
  } catch {
    res.status(404).json({ error: "File not found or unreadable" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

