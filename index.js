const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  console.log("Opening Facebook Marketplace...");
  await page.goto("https://www.facebook.com/marketplace/", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector('input[placeholder="Search Marketplace"]');
  console.log("Searching for iPhone 15 Pro Max...");
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

  console.log("Listings found:", listings); // Debug log
  fs.writeFileSync("results.json", JSON.stringify(listings, null, 2));
  console.log("Saved listings to results.json");
})();

// Setup express server
app.get("/results.json", (req, res) => {
  fs.readFile("results.json", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "File not found or unreadable" });
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
