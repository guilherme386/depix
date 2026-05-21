const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        await page.goto('https://livetip.gg/anjelinobr', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait an extra second for React/JS
        await new Promise(r => setTimeout(r, 2000));
        
        const info = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder, class: i.className }));
            const textareas = Array.from(document.querySelectorAll('textarea')).map(t => ({ name: t.name, id: t.id, placeholder: t.placeholder, class: t.className }));
            const buttons = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText, class: b.className, type: b.type }));
            return { inputs, textareas, buttons };
        });
        
        console.log(JSON.stringify(info, null, 2));
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
