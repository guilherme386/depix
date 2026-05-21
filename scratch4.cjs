const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        
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

            const messageInput = document.querySelector('textarea[placeholder="Escreva sua mensagem aqui"]');
            if (messageInput) setNativeValue(messageInput, 'Test message');
        });

        // Click R$ 10 button
        const buttons = await page.$$('button');
        for (let btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('R$ 10')) {
                await btn.click();
                break;
            }
        }
        await new Promise(r => setTimeout(r, 500));

        // Click CONTINUAR
        for (let btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('CONTINUAR')) {
                await btn.click();
                break;
            }
        }
        
        console.log('Clicked CONTINUAR, waiting...');
        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: 'livetip_step3.png' });

        const info = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
            const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
            const text = document.body.innerText;
            return { btns, imgs, text: text.substring(0, 1000) };
        });
        
        require('fs').writeFileSync('scratch4_output.json', JSON.stringify(info, null, 2));
        console.log('Done');
        
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
