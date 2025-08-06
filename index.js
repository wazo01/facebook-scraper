const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const fs = require('fs');                    // ✔️ For writing results.json
const express = require('express');          // ✔️ For server

const app = express();
const PORT = process.env.PORT || 10000;


app.get("/", (req, res) => {
  res.send("✅ Facebook scraper server is running.");
});

app.get("/scrape", async (req, res) => {
  try {
    console.log("🔍 Starting scrape...");

 const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});

    });

    const page = await browser.newPage();
    await page.goto("https://www.facebook.com/marketplace/", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('input[placeholder="Search Marketplace"]');
    await page.type('input[placeholder="Search Marketplace"]', "iPhone 15 Pro Max");
    await page.keyboard.press("Enter");

    await new Promise(resolve => setTimeout(resolve, 8000));


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
    res.json({ status: "success", listings });
  } catch (err) {
    console.error("❌ Scraper failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/results.json", (req, res) => {
  if (fs.existsSync("results.json")) {
    res.sendFile(__dirname + "/results.json");
  } else {
    res.status(404).json({ error: "File not found or unreadable" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
