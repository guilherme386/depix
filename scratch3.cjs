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
        
        await page.evaluate(() => {
            const setNativeValue = (element, value) => {
                const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                const prototype = Object.getPrototypeOf(element);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, value);
                else valueSetter.call(element, value);
                element.dispatchEvent(new Event('input', { bubbles: true }));
            };

            const nameInput = document.querySelector('input[placeholder="Digite seu nome ou apelido"]');
            if (nameInput) setNativeValue(nameInput, 'TestUser');

            const amountInput = document.querySelector('input[placeholder="0,00"]');
            if (amountInput) setNativeValue(amountInput, '10,00');

            const messageInput = document.querySelector('textarea[placeholder="Escreva sua mensagem aqui"]');
            if (messageInput) setNativeValue(messageInput, 'Test message');

            const buttons = Array.from(document.querySelectorAll('button'));
            const submitBtn = buttons.find(b => b.innerText.toLowerCase().includes('continuar'));
            if (submitBtn) submitBtn.click();
        });
        
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'livetip_step2.png' });
        
        const info = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText, class: b.className }));
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, p')).map(h => h.innerText);
            return { buttons, headings };
        });
        
        require('fs').writeFileSync('scratch3_output.json', JSON.stringify(info, null, 2));
        console.log('Step 2 saved');
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
