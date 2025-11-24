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

// Fetch Function (Open API Fallback)
async function fetchRate() {
    console.log(`[${new Date().toISOString()}] Fetching rate from Open API...`);
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        const data = response.data;

        if (data && data.rates && data.rates.JPY && data.rates.KRW) {
            // Calculate JPY to KRW rate for 100 JPY
            // Open API gives Base Rate (Market Average)
            const baseRate100 = (data.rates.KRW / data.rates.JPY) * 100;

            // User Request: Server returns Base Rate. Frontend applies * 1.008.
            const finalRate = baseRate100;

            latestRateData = {
                rate: finalRate,
                timestamp: new Date().toISOString(),
                source: 'Open API (Base Rate)'
            };
            console.log(`[${new Date().toISOString()}] Fetched Rate: ${finalRate.toFixed(2)} (Base: ${baseRate100.toFixed(2)})`);
        } else {
            console.error("Invalid data format from API");
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
