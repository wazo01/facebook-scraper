const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.facebook.com/marketplace/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('input[placeholder="Search Marketplace"]');
    await page.type('input[placeholder="Search Marketplace"]', "iPhone 15 Pro Max");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(8000); // wait for results to load

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
    res.json({ message: "Scrape completed successfully." });
  } catch (err) {
    console.error("❌ Scraper failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Allow access to results.json directly in browser
app.use(express.static('.'));

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
