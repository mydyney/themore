const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = 3000;

// Store the latest rate
let latestRateData = {
    rate: null,
    timestamp: null,
    source: 'Initializing...'
};

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API Endpoint to get the rate
app.get('/api/rate', (req, res) => {
    res.json(latestRateData);
});

// Fetch Function (TheMore FX / Supabase)
async function fetchRate() {
    console.log(`[${new Date().toISOString()}] Fetching rate from TheMore FX (Supabase)...`);
    const requestHeaders = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3RwcnBlb2J6bnV2dWxmdmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMDI5NjMsImV4cCI6MjAxOTg3ODk2M30.Qw2ijlhoS_LhYWmJgz3BkBgTNYfwdxlGcHSuXHQRnBM',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3RwcnBlb2J6bnV2dWxmdmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMDI5NjMsImV4cCI6MjAxOTg3ODk2M30.Qw2ijlhoS_LhYWmJgz3BkBgTNYfwdxlGcHSuXHQRnBM'
    };

    try {
        // 1. Get latest date
        const dateResponse = await axios.get(
            'https://qxwtprpeobznuvulfvgn.supabase.co/rest/v1/ThemoreFx?select=date&order=date.desc&limit=1',
            { headers: requestHeaders }
        );

        if (dateResponse.data && dateResponse.data.length > 0) {
            const latestDate = dateResponse.data[0].date;

            // 2. Fetch data for latest date
            const dataResponse = await axios.get(
                `https://qxwtprpeobznuvulfvgn.supabase.co/rest/v1/ThemoreFx?select=date,data&date=eq.${latestDate}`,
                { headers: requestHeaders }
            );

            if (dataResponse.data && dataResponse.data.length > 0) {
                const rateData = dataResponse.data[0].data;

                if (rateData.rate && rateData.rate.KRW && rateData.rate.USD) {
                    const usdToKrw = rateData.rate.KRW.USD;
                    const usdToJpy = rateData.rate.USD.JPY; // e.g. 0.0064... (This seems to be inverse or different, let's check logic)

                    // Wait, the logic in common.js uses:
                    // feeCalc(amount, 'USD', Store.data.rate.KRW.USD) -> converts USD to KRW
                    // feeCalc(amount, currency, Store.data.rate.USD[currency]) -> converts Currency to USD

                    // Let's look at the data structure from test output:
                    // KRW rates: { USD: 1487.6 } -> 1 USD = 1487.6 KRW
                    // USD rates: { JPY: '0.0063999936' } -> 1 JPY = 0.0064 USD (This is JPY -> USD rate)

                    // Calculation for 100 JPY:
                    // 1. Convert 100 JPY to USD (Base USD)
                    // Base_USD = 100 * 0.0063999936 = 0.63999936 USD

                    // 2. Apply VISA Fee (1.1%)
                    // Total_USD = Base_USD * 1.011 = 0.647039...

                    // 3. Convert to KRW (Base KRW)
                    // KRW_Base = Total_USD * 1487.6 = 962.53...

                    // 4. Apply Shinhan Fee (0.18%)
                    // Total_KRW = KRW_Base * 1.0018 = 964.26...

                    const jpyToUsdRate = parseFloat(rateData.rate.USD.JPY);
                    const baseUsd = 100 * jpyToUsdRate;

                    // VISA Fee 1.1%
                    // In common.js: roundDown(Number(amount) * VISAFeeRate, 2)
                    // Let's follow the logic precisely if possible, or just use the multipliers.
                    // common.js: const outseaUsingAmount = roundDown(Number(amount) * VISAFeeRate, 2)
                    // Here amount is in USD? No, amount is in target currency?
                    // common.js feeCalc(amount, fx, price):
                    // if fx != 'USD' (e.g. JPY):
                    // exchangeResult = Number((rate * amount).toFixed(2)) -> rate is price (JPY->USD rate), amount is JPY amount
                    // visaFee = roundDown(exchangeResult * 0.011, 2)
                    // value = exchangeResult + visaFee

                    // So:
                    // 1. JPY to USD
                    const exchangeResult = Number((jpyToUsdRate * 100).toFixed(2)); // 100 JPY -> USD
                    const visaFee = Math.floor((exchangeResult * 0.011) * 100) / 100; // roundDown 2
                    const totalUsd = exchangeResult + visaFee;

                    // 2. USD to KRW
                    // common.js: feeCalc(result.amount, 'USD', baseUSDprice)
                    // if fx == 'USD':
                    // outseaUsingAmount = roundDown(Number(amount) * VISAFeeRate, 2) -> Wait, this adds VISA fee AGAIN?
                    // No, look at updateTables in common.js:
                    // USDconverted = feeCalc(result.amount, currency, exchangeRate) -> returns value (USD with fee)
                    // KRWconverted = feeCalc(USDconverted.value - USDconverted.details.fee.VISA, 'USD', baseUSDprice)
                    // It subtracts the VISA fee before passing to USD feeCalc?
                    // "USDconverted.value - USDconverted.details.fee.VISA" is just the raw USD amount?
                    // Let's re-read common.js line 161:
                    // KRWconverted = feeCalc(USDconverted.value - USDconverted.details.fee.VISA, 'USD', baseUSDprice)

                    // Wait, if it subtracts the fee, then it passes the raw USD amount to the second feeCalc.
                    // And the second feeCalc (fx='USD') adds VISA fee (1.1%) AND Shinhan Fee (0.18%).
                    // This implies the VISA fee is calculated on the USD amount, and Shinhan fee is calculated on the (USD + VISA Fee) * KRW rate?

                    // Let's trace feeCalc(amount, 'USD', price):
                    // VISAFeeRate = 1.011
                    // outseaUsingAmount = roundDown(amount * 1.011, 2) -> Adds VISA fee to USD amount
                    // shfee = Math.floor(outseaUsingAmount * price * 0.0018) -> Shinhan fee on (USD+Fee)*KRW
                    // value = roundDown(outseaUsingAmount * price, 0) + shfee -> (USD+Fee)*KRW + ShinhanFee

                    // So the flow is:
                    // 1. Convert JPY to USD (Raw USD)
                    // 2. Pass Raw USD to feeCalc('USD')
                    // 3. feeCalc('USD') adds VISA fee (1.1%) and Shinhan fee (0.18%)

                    // So effectively:
                    // Raw_USD = 100 * jpyToUsdRate
                    // USD_with_VISA = Raw_USD * 1.011
                    // KRW_Base = USD_with_VISA * usdToKrw
                    // Final_KRW = KRW_Base + (KRW_Base * 0.0018) = KRW_Base * 1.0018

                    // Let's implement this.

                    const rawUsd = 100 * jpyToUsdRate;
                    // Note: common.js uses rounding at intermediate steps.
                    // exchangeResult = Number((rate * amount).toFixed(2)) -> This is Raw USD rounded to 2 decimals?
                    // In common.js line 878: exchangeResult = Number((rate * amount).toFixed(2))
                    // For 100 JPY * 0.0064 = 0.64.

                    const rawUsdRounded = Number(rawUsd.toFixed(2));

                    // Pure Exchange Rate (No Fees) -> Final Fee 0.95%
                    const baseKrw = Math.floor(rawUsdRounded * usdToKrw);
                    const finalKrw = Math.floor(baseKrw * 1.0095);

                    latestRateData = {
                        rate: finalKrw,
                        timestamp: new Date().toISOString(),
                        source: 'TheMore (Final)',
                        isFinal: true
                    };
                    console.log(`[${new Date().toISOString()}] Fetched Rate: ${finalKrw} (Raw USD: ${rawUsdRounded}, USD+Visa: ${usdWithVisa}, KRW Base: ${krwBase})`);
                }
            }
        }
    } catch (error) {
        console.error("Fetching failed:", error.message);
    }
}

// Schedule: Every 10 minutes from 08:00 to 23:59
cron.schedule('*/10 8-23 * * *', () => {
    fetchRate();
});

// Initial fetch
fetchRate();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
