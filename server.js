
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
    source: 'Open API (Server Fetched)'
};

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API Endpoint to get the rate
app.get('/api/rate', (req, res) => {
    res.json(latestRateData);
});

// Fetch Function
async function fetchRate() {
    console.log(`[${new Date().toISOString()}] Fetching rate...`);
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        const data = response.data;

        if (data && data.rates && data.rates.JPY && data.rates.KRW) {
            // Calculate JPY to KRW rate for 100 JPY
            const rate100 = (data.rates.KRW / data.rates.JPY) * 100;

            latestRateData = {
                rate: rate100,
                timestamp: new Date().toISOString(),
                source: 'Open API (Server Fetched)'
            };
            console.log(`[${new Date().toISOString()}] Fetched Rate: ${latestRateData.rate.toFixed(2)} `);
        } else {
            console.error("Invalid data format from API");
        }
    } catch (error) {
        console.error("Fetching failed:", error.message);
    }
}

// Schedule: Every 10 minutes from 08:00 to 23:59
// Cron syntax: */10 8-23 * * *
cron.schedule('*/10 8-23 * * *', () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Constraint: 08:20 to 23:59
    if (hour === 8 && minute < 20) {
        return; // Skip before 08:20
    }

    fetchRate();
});

// Initial fetch on startup
fetchRate();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Fetcher scheduled: Every 10 min (08:20 - 23:59)`);
});
