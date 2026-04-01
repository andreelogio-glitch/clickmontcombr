import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bannersDir = path.join(__dirname);

const browsers = [
  { name: 'banner-instagram-post-1080x1080.html', width: 1080, height: 1080 },
  { name: 'banner-instagram-story-1080x1920.html', width: 1080, height: 1920 },
  { name: 'banner-facebook-cover-820x312.html', width: 820, height: 312 },
  { name: 'banner-twitter-header-1500x500.html', width: 1500, height: 500 },
  { name: 'banner-website-hero-1500x600.html', width: 1500, height: 600 },
];

async function screenshot(htmlFile, width, height) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  
  const filePath = `file://${path.join(bannersDir, htmlFile)}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  const outputName = htmlFile.replace('.html', '.png');
  const outputPath = path.join(bannersDir, outputName);
  
  await page.screenshot({ path: outputPath, omitBackground: false });
  
  await browser.close();
  console.log(`Screenshot: ${outputName}`);
}

async function main() {
  for (const banner of browsers) {
    try {
      await screenshot(banner.name, banner.width, banner.height);
    } catch (e) {
      console.error(`Error with ${banner.name}: ${e.message}`);
    }
  }
  console.log('Done!');
}

main();
