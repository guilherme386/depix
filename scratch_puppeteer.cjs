const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Set a normal user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    console.log("Navigating to https://pixgg.com/anjelinobr...");
    await page.goto('https://pixgg.com/anjelinobr', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for React to render
    console.log("Waiting for 3 seconds...");
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Evaluating page...");
    const elements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea')).map(el => ({
        tagName: el.tagName,
        name: el.name,
        id: el.id,
        type: el.type,
        placeholder: el.placeholder,
        className: el.className
      }));
      const buttons = Array.from(document.querySelectorAll('button')).map(el => ({
        tagName: el.tagName,
        type: el.type,
        text: el.innerText,
        className: el.className
      }));
      const text = document.body.innerText.substring(0, 500); // Get some text to see what loaded
      return { inputs, buttons, text };
    });

    console.log(JSON.stringify(elements.inputs, null, 2));
    await browser.close();
  } catch (err) {
    console.error("Error:", err);
  }
})();
