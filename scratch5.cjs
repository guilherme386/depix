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
        await new Promise(r => setTimeout(r, 2000));
        
        // Fill name
        const nameInput = await page.$('input[placeholder="Digite seu nome ou apelido"]');
        if (nameInput) {
            await nameInput.click({ clickCount: 3 });
            await nameInput.type('TestUser');
        }

        // Click Pix method
        await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('div, p, span'));
            const pixEl = spans.find(el => el.innerText === 'Pix');
            if (pixEl) pixEl.click();
        });
        await new Promise(r => setTimeout(r, 500));

        // Click R$ 10 button
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn10 = btns.find(b => b.innerText.includes('R$ 10'));
            if (btn10) btn10.click();
        });
        await new Promise(r => setTimeout(r, 500));

        // Click CONTINUAR
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const continueBtn = btns.find(b => b.innerText.includes('CONTINUAR'));
            if (continueBtn) continueBtn.click();
        });
        
        console.log('Clicked CONTINUAR, waiting for next page...');
        await new Promise(r => setTimeout(r, 5000));
        
        const content = await page.evaluate(() => {
            return document.body.innerText;
        });

        // Search for pix copy paste (000201...)
        let copyPaste = null;
        const walker = await page.evaluateHandle(() => {
            const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let cp = null;
            while (w.nextNode()) {
                if (w.currentNode.nodeValue.includes('000201')) {
                    cp = w.currentNode.nodeValue.trim();
                    break;
                }
            }
            if (!cp) {
                const inputs = Array.from(document.querySelectorAll('input, textarea'));
                const pixInput = inputs.find(i => i.value && i.value.includes('000201'));
                if (pixInput) cp = pixInput.value;
            }
            return cp;
        });
        copyPaste = await copyPaste?.jsonValue?.() || await walker.jsonValue();

        console.log("Copy Paste code:", copyPaste ? copyPaste.substring(0, 30) + "..." : "Not found");
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
