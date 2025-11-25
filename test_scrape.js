const puppeteer = require('puppeteer');

async function scrape() {
    console.log("Starting scrape...");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log("Navigating...");
        await page.goto('https://bank.shinhan.com/index.jsp#020501010200', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        console.log("Page loaded.");

        await new Promise(r => setTimeout(r, 5000));

        let targetFrame = page.frames().find(f => f.url().includes('020501010200') || f.name() === 'main' || f.name() === 'body');

        if (!targetFrame) {
            console.log("Searching frames...");
            for (const frame of page.frames()) {
                const title = await frame.$('#txt_title');
                if (title) {
                    targetFrame = frame;
                    console.log(`Found target frame: ${frame.url()}`);
                    break;
                }
            }
        }

        if (!targetFrame) {
            console.log("Using main frame.");
            targetFrame = page.mainFrame();
        }

        console.log("Selecting JPY...");
        const currencySelectSelector = '#sbx_cur1_input_0';
        await targetFrame.waitForSelector(currencySelectSelector, { timeout: 10000 });

        const jpyValue = await targetFrame.evaluate((selector) => {
            const select = document.querySelector(selector);
            for (const option of select.options) {
                if (option.text.includes('일본 100엔') || option.text.includes('JPY')) {
                    return option.value;
                }
            }
            return null;
        }, currencySelectSelector);

        if (jpyValue) {
            console.log(`Found JPY value: ${jpyValue}`);
            await targetFrame.select(currencySelectSelector, jpyValue);
        } else {
            console.log("Selecting index 1");
            await targetFrame.evaluate((selector) => {
                document.querySelector(selector).selectedIndex = 1;
                document.querySelector(selector).dispatchEvent(new Event('change'));
            }, currencySelectSelector);
        }

        console.log("Clicking Search...");
        await targetFrame.click('#btn_search');

        await new Promise(r => setTimeout(r, 3000));

        console.log("Parsing table...");
        const rateData = await targetFrame.evaluate(() => {
            const rows = document.querySelectorAll('#grd_list_1_body_tbody tr');
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length > 5) {
                    const round = cells[0].innerText.trim();
                    if (round === '1') {
                        const sendRateStr = cells[5].innerText.trim().replace(/,/g, '');
                        return parseFloat(sendRateStr);
                    }
                }
            }
            return null;
        });

        if (rateData) {
            console.log(`SUCCESS: Found Rate: ${rateData}`);
        } else {
            console.log("FAILURE: Rate not found.");
            // Debug: print first row
            const firstRow = await targetFrame.evaluate(() => {
                const row = document.querySelector('#grd_list_1_body_tbody tr');
                return row ? row.innerText : "No rows";
            });
            console.log("First row content:", firstRow);
        }

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        if (browser) await browser.close();
    }
}

scrape();
