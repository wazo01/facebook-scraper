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
  await page.type('input[placeholder="Search Marketp]()
