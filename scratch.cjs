const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        console.log('Navigating to livetip.gg...');
        await page.goto('https://livetip.gg/anjelinobr', { waitUntil: 'networkidle2', timeout: 30000 });
        
        await page.screenshot({ path: 'livetip_initial.png' });
        const html = await page.content();
        require('fs').writeFileSync('livetip_initial.html', html);
        
        console.log('Initial page loaded and saved.');
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
