document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const exchangeRateInput = document.getElementById('exchange-rate');
    const refreshRateBtn = document.getElementById('refresh-rate-btn');
    const rateSourceText = document.getElementById('rate-source-text');
    const targetJpyDisplay = document.getElementById('target-jpy-display');
    const resultsSection = document.getElementById('results-section');
    const resultTotal = document.getElementById('result-total');
    const resultRange = document.getElementById('result-range');
    const resultItemsList = document.getElementById('result-items-list');

    let productCount = 0;
    let isRateFinal = false; // Track if the current rate is final (fetched) or manual

    // Initialize
    fetchExchangeRate();

    // Initialize with 3 empty product rows
    addProductRow();
    addProductRow();
    addProductRow();

    addProductBtn.addEventListener('click', () => {
        addProductRow();
    });

    calculateBtn.addEventListener('click', () => {
        calculateBestCombination();
    });

    refreshRateBtn.addEventListener('click', () => {
        fetchExchangeRate();
    });

    exchangeRateInput.addEventListener('input', () => {
        isRateFinal = false; // Manual input means it's not the final fetched rate
        updateTargetDisplay();
    });

    function updateTargetDisplay() {
        const rawRate = parseFloat(exchangeRateInput.value);
        // User requested to use raw rate directly (removed 1.011 division)
        const rate100 = rawRate;

        const valueSpan = targetJpyDisplay.querySelector('.value');

        if (!isNaN(rate100) && rate100 > 0) {
            // Target: 5999 KRW
            // JPY = (5999 / Rate100) * 100
            // or simply 599900 / Rate100
            const targetJPY = 599900 / rate100;
            valueSpan.textContent = `≈ ${targetJPY.toFixed(2)} JPY`;
        } else {
            valueSpan.textContent = "-- JPY";
        }
    }

    async function fetchExchangeRate() {
        refreshRateBtn.classList.add('rotating');
        rateSourceText.textContent = "Fetching rate...";
        exchangeRateInput.placeholder = "Loading...";

        const requestHeaders = {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3RwcnBlb2J6bnV2dWxmdmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMDI5NjMsImV4cCI6MjAxOTg3ODk2M30.Qw2ijlhoS_LhYWmJgz3BkBgTNYfwdxlGcHSuXHQRnBM',
            'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3RwcnBlb2J6bnV2dWxmdmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMDI5NjMsImV4cCI6MjAxOTg3ODk2M30.Qw2ijlhoS_LhYWmJgz3BkBgTNYfwdxlGcHSuXHQRnBM'
        };

        let rate100;
        let sourceText;

        try {
            try {
                // Get latest date
                const dateResponse = await fetch(
                    'https://qxwtprpeobznuvulfvgn.supabase.co/rest/v1/ThemoreFx?select=date&order=date.desc&limit=1',
                    { headers: requestHeaders }
                );
                const dateData = await dateResponse.json();

                if (dateData && dateData.length > 0) {
                    const latestDate = dateData[0].date;

                    // Fetch data for latest date
                    const dataResponse = await fetch(
                        `https://qxwtprpeobznuvulfvgn.supabase.co/rest/v1/ThemoreFx?select=date,data&date=eq.${latestDate}`,
                        { headers: requestHeaders }
                    );
                    const rateDataResponse = await dataResponse.json();

                    if (rateDataResponse && rateDataResponse.length > 0) {
                        const rateData = rateDataResponse[0].data;

                        if (rateData.rate && rateData.rate.KRW && rateData.rate.USD) {
                            const usdToKrw = rateData.rate.KRW.USD;
                            const usdToJpy = rateData.rate.USD.JPY; // JPY -> USD rate

                            // Fee Calculation Logic (Same as server.js)
                            const rawUsd = 100 * parseFloat(usdToJpy);
                            const rawUsdRounded = Number(rawUsd.toFixed(2));

                            // Pure Exchange Rate (No Fees) -> Final Fee 0.94%
                            const baseKrw = Math.floor(rawUsdRounded * usdToKrw);
                            const finalKrw = Math.floor(baseKrw * 1.0094);

                            rate100 = finalKrw;
                            isRateFinal = true;
                            const timeStr = new Date().toLocaleTimeString();
                            sourceText = `Rate from <strong>TheMore (Final)</strong> (Client at ${timeStr})`;
                        } else {
                            throw new Error("Invalid data structure from Supabase");
                        }
                    } else {
                        throw new Error("No rate data found");
                    }
                } else {
                    throw new Error("No date found");
                }

            } catch (serverError) {
                // 2. Fallback: Show link to Shinhan Bank (for GitHub Pages / Static mode)
                console.log("Server fetch failed:", serverError.message);

                // Shinhan Bank URL
                const shinhanUrl = "https://bank.shinhan.com/index.jsp#020501010100";

                sourceText = `Server offline. <a href="${shinhanUrl}" target="_blank">Click to check Shinhan Bank</a> (Select 'Japan 100 Yen')`;
                exchangeRateInput.placeholder = "Enter manually";
                exchangeRateInput.value = ""; // Clear value to encourage manual input
            }

            // Update UI
            if (rate100) {
                exchangeRateInput.value = rate100.toFixed(2);
                rateSourceText.innerHTML = sourceText;
                updateTargetDisplay();
            } else if (sourceText) {
                rateSourceText.innerHTML = sourceText;
                updateTargetDisplay();
            }

        } catch (error) {
            console.error("Failed to fetch rate:", error);
            rateSourceText.textContent = "Failed to fetch. Please enter manually.";
            exchangeRateInput.placeholder = "e.g. 950.13";
        } finally {
            refreshRateBtn.classList.remove('rotating');
        }
    }

    function addProductRow() {
        productCount++;
        const row = document.createElement('div');
        row.className = 'product-row';
        row.innerHTML = `
            <input type="text" placeholder="Item Name ${productCount}" class="product-name" value="Item ${productCount}">
            <div class="input-wrapper">
                <input type="number" placeholder="Price" class="product-price">
                <span class="unit">JPY</span>
            </div>
            <select class="discount-select" title="Discount / Tax">
                <option value="tax8">8% Tax (Add)</option>
                <option value="tax10">10% Tax (Add)</option>
                <option value="0" selected>0% (Tax Incl.)</option>
                <option value="5">5% Discount</option>
                <option value="10">10% Discount</option>
                <option value="20">20% Discount</option>
                <option value="30">30% Discount</option>
                <option value="40">40% Discount</option>
                <option value="50">50% Discount</option>
            </select>
            <button class="remove-btn" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;

        const removeBtn = row.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            if (productList.children.length > 1) {
                row.remove();
            }
        });

        productList.appendChild(row);
    }

    function getProducts() {
        const rows = document.querySelectorAll('.product-row');
        const products = [];
        rows.forEach(row => {
            const name = row.querySelector('.product-name').value;
            const priceJPY = parseFloat(row.querySelector('.product-price').value);
            const discountValue = row.querySelector('.discount-select').value; // Keep as string

            if (name && !isNaN(priceJPY)) {
                products.push({ name, priceJPY, discountValue });
            }
        });
        return products;
    }

    function calculateBestCombination() {
        const rawRate = parseFloat(exchangeRateInput.value);
        // User requested to use raw rate directly (removed 1.011 division)
        const rate100 = rawRate;

        if (isNaN(rate100)) {
            alert("Please enter a valid exchange rate.");
            return;
        }

        const products = getProducts();
        if (products.length === 0) {
            alert("Please add at least one item with a price.");
            return;
        }

        // Convert JPY to KRW with Discount Logic
        // Logic: Pre-tax -> Discount -> Tax -> KRW
        const items = products.map(p => {
            // 1. Determine Final JPY Price based on type
            let finalPriceJPY;
            let discountDisplay = "";

            if (p.discountValue === 'tax8') {
                // Add 8% Tax
                finalPriceJPY = Math.floor(p.priceJPY * 1.08);
                discountDisplay = "+8% Tax";
            } else if (p.discountValue === 'tax10') {
                // Add 10% Tax
                finalPriceJPY = Math.floor(p.priceJPY * 1.10);
                discountDisplay = "+10% Tax";
            } else {
                // Existing Discount Logic (Assumes Tax Included in Input)
                const discountPercent = parseInt(p.discountValue, 10);

                // 1. Convert to pre-tax (8% tax included in price)
                const basePrice = Math.floor(p.priceJPY / 1.08);

                // 2. Apply Discount
                const discountedBase = Math.floor(basePrice * (1 - discountPercent / 100));

                // 3. Re-apply Tax (8%)
                finalPriceJPY = Math.floor(discountedBase * 1.08);

                discountDisplay = `-${discountPercent}%`;
            }

            // 4. Convert to KRW
            const priceKRW = Math.floor(finalPriceJPY * (rate100 / 100));

            return {
                ...p,
                finalPriceJPY,
                priceKRW,
                discountDisplay
            };
        });

        // Calculate total sum of all items for fallback recommendation
        const totalAllItemsKRW = items.reduce((sum, item) => sum + item.priceKRW, 0);

        // Find Top 2 Subsets
        const results = findTopSubsets(items);

        // Identify unused items
        const usedItemsSet = new Set();
        results.forEach(result => {
            result.items.forEach(item => usedItemsSet.add(item));
        });

        const unusedItems = items.filter(item => !usedItemsSet.has(item));
        // const unusedSum = unusedItems.reduce((sum, item) => sum + item.priceKRW, 0); // No longer needed here

        displayResults(results, totalAllItemsKRW, unusedItems);
    }

    // Find Top 2 Subsets Sequentially (Greedy approach for the second group)
    function findTopSubsets(items) {
        const results = [];

        // 1. Find the absolute best subset from all items
        const firstBest = findBestSubset(items);

        if (firstBest) {
            results.push(firstBest);

            // 2. Remove items used in the first subset
            // We need a way to identify items uniquely. 
            // Since 'items' objects are references, we can check for inclusion.
            const usedItemsSet = new Set(firstBest.items);
            const remainingItems = items.filter(item => !usedItemsSet.has(item));

            // 3. Find the best subset from the remaining items
            const secondBest = findBestSubset(remainingItems);
            if (secondBest) {
                results.push(secondBest);
            }
        }

        return results;
    }

    function findBestSubset(items) {
        let bestRate = -1;
        let bestSubset = null;
        let bestSum = 0;
        let bestPoints = 0;

        // Backtracking to find all valid subsets
        function backtrack(index, currentSum, currentItems) {
            if (index === items.length) {
                if (currentSum >= 5000) {
                    const points = (currentSum % 1000) * 2;
                    const rate = points / currentSum;

                    if (rate > bestRate) {
                        bestRate = rate;
                        bestSubset = [...currentItems];
                        bestSum = currentSum;
                        bestPoints = points;
                    } else if (rate === bestRate) {
                        // Tie-breaker: Prefer higher points (higher sum usually)
                        if (points > bestPoints) {
                            bestSubset = [...currentItems];
                            bestSum = currentSum;
                            bestPoints = points;
                        }
                    }
                }
                return;
            }

            // Include items[index]
            backtrack(index + 1, currentSum + items[index].priceKRW, [...currentItems, items[index]]);

            // Exclude items[index]
            backtrack(index + 1, currentSum, currentItems);
        }

        backtrack(0, 0, []);

        if (bestSubset) {
            return {
                sum: bestSum,
                items: bestSubset,
                rate: bestRate,
                points: bestPoints
            };
        }
        return null;
    }

    function displayResults(results, totalAllItemsKRW = 0, unusedItems = []) {
        resultsSection.classList.remove('hidden');

        // Clear previous results
        // We need to restructure the HTML to support multiple results if not already
        // The current HTML has a single "result-summary" and "result-details".
        // We will dynamically create result blocks.

        const container = resultsSection.querySelector('.result-details');
        // Clear everything after the header in resultsSection
        resultsSection.innerHTML = '<h2>Optimization Result</h2>';

        if (results.length === 0) {
            resultsSection.innerHTML += '<p style="padding:20px; color:var(--text-muted);">No combination found >= 5,000 KRW.</p>';

            // Fallback Recommendation for Low Amount
            if (totalAllItemsKRW > 0) {
                const currentTotalKRW = totalAllItemsKRW;
                const recommendations = [];
                // Start targets from 5999 since we are under 5000
                let nextTarget = 5999;

                // If by chance total is > 5999 but no subset found (unlikely with simple logic but possible), adjust
                if (currentTotalKRW >= 5999) {
                    nextTarget = Math.floor(currentTotalKRW / 1000) * 1000 + 999;
                    if (nextTarget <= currentTotalKRW) nextTarget += 1000;
                }

                for (let i = 0; i < 3; i++) {
                    const target = nextTarget + (i * 1000);
                    const diffKRW = target - currentTotalKRW;
                    const rate100 = parseFloat(exchangeRateInput.value);
                    const requiredJPY = (diffKRW / rate100) * 100;

                    recommendations.push({
                        target: target,
                        diffKRW: diffKRW,
                        requiredJPY: requiredJPY
                    });
                }

                const recHtml = `
                    <div class="recommendation-block" style="margin: 0 20px 20px 20px; padding-top: 16px; border-top: 2px solid var(--border-color);">
                        <h3 style="color: var(--primary-color); margin-bottom: 12px;">Recommendation Result</h3>
                        <p style="font-size: 0.9em; color: var(--text-muted); margin-bottom: 12px;">Current Total: <strong>${currentTotalKRW.toLocaleString()} KRW</strong>. Add these amounts to reach x,999 KRW:</p>
                        <ul style="list-style: none;">
                            ${recommendations.map(rec => `
                                <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                                    <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()} KRW</strong></span>
                                    <div style="text-align: right;">
                                        <span style="display:block; font-weight:bold;">+ ${rec.requiredJPY.toFixed(2)} JPY</span>
                                        <span style="font-size:0.8em; color:#999;">(Needs ${rec.diffKRW.toLocaleString()} KRW)</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
                resultsSection.innerHTML += recHtml;
            }
            return;
        }

        results.forEach((result, index) => {
            const points = result.points;
            const ratePercentage = (result.rate * 100).toFixed(2);
            const rankLabel = index === 0 ? "Best Option" : "Alternative Option";
            const rankClass = index === 0 ? "best-option" : "alt-option";

            // Recommendation Logic
            let recHtml = "";
            // Skip if the hundreds digit is > 800 (e.g., 5850, 5900)
            if ((result.sum % 1000) <= 800) {
                const currentTotalKRW = result.sum;
                const recommendations = [];
                let nextTarget = Math.floor(currentTotalKRW / 1000) * 1000 + 999;

                if (nextTarget <= currentTotalKRW) {
                    nextTarget += 1000;
                }

                for (let i = 0; i < 3; i++) {
                    const target = nextTarget + (i * 1000);
                    const diffKRW = target - currentTotalKRW;
                    const rate100 = parseFloat(exchangeRateInput.value);
                    const requiredJPY = (diffKRW / rate100) * 100;

                    recommendations.push({
                        target: target,
                        diffKRW: diffKRW,
                        requiredJPY: requiredJPY
                    });
                }

                recHtml = `
                    <div class="recommendation-block" style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                        <p style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 8px;"><strong>Recommendation:</strong> Add to reach x,999 KRW</p>
                        <ul style="list-style: none;">
                            ${recommendations.map(rec => `
                                <li style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.9em;">
                                    <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()}</strong></span>
                                    <div style="text-align: right;">
                                        <span style="font-weight:bold;">+${rec.requiredJPY.toFixed(2)} JPY</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            const html = `
                <div class="result-block ${rankClass}" style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <h3 style="color: var(--primary-color); margin-bottom: 12px;">${rankLabel}</h3>
                    <div class="result-summary" style="margin-bottom: 12px; padding-bottom: 0; border: none;">
                        <div class="result-item">
                            <span class="label">Total Amount</span>
                            <span class="value">${result.sum.toLocaleString()} KRW</span>
                        </div>
                        <div class="result-item">
                            <span class="label">Accumulation Rate</span>
                            <span class="value">${ratePercentage}% <span style="font-size:0.6em; color:#666;">(${points} P)</span></span>
                        </div>
                    </div>
                    <ul class="result-items-list" style="list-style: none;">
                        ${result.items.map(item => `
                            <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                                <span style="font-size: 1.1rem; font-weight: 500;">${item.name} <span style="font-size:0.8em; color:#ec4899;">(${item.discountDisplay})</span></span>
                                <div style="text-align: right;">
                                    <span class="item-price" style="display:block; font-size: 1.1rem;">${item.priceKRW.toLocaleString()} KRW</span>
                                    <span class="item-original" style="font-size:0.85em; color:#999;">(${item.finalPriceJPY} JPY)</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    ${recHtml}
                </div>
            `;
            resultsSection.innerHTML += html;
        });

        // Add Recommendations for Unused Items
        const unusedSum = unusedItems.reduce((sum, item) => sum + item.priceKRW, 0);

        if (unusedSum > 0) {
            const currentTotalKRW = unusedSum;
            const recommendations = [];
            let nextTarget = 5999;

            if (currentTotalKRW >= 5999) {
                nextTarget = Math.floor(currentTotalKRW / 1000) * 1000 + 999;
                if (nextTarget <= currentTotalKRW) nextTarget += 1000;
            }

            for (let i = 0; i < 3; i++) {
                const target = nextTarget + (i * 1000);
                const diffKRW = target - currentTotalKRW;
                const rate100 = parseFloat(exchangeRateInput.value);
                const requiredJPY = (diffKRW / rate100) * 100;

                recommendations.push({
                    target: target,
                    diffKRW: diffKRW,
                    requiredJPY: requiredJPY
                });
            }

            const recHtml = `
                <div class="recommendation-block" style="margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--border-color);">
                    <h3 style="color: var(--primary-color); margin-bottom: 12px;">To make a combination</h3>
                    
                    <div style="margin-bottom: 12px; padding: 8px; background-color: #f9fafb; border-radius: 6px;">
                        <p style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 4px;">Items included:</p>
                        <ul style="list-style: none; padding-left: 0;">
                            ${unusedItems.map(item => `
                                <li style="font-size: 0.9em; display: flex; justify-content: space-between;">
                                    <span>${item.name}</span>
                                    <span>${item.priceKRW.toLocaleString()} KRW</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <p style="font-size: 0.9em; color: var(--text-muted); margin-bottom: 12px;">Unused Total: <strong>${currentTotalKRW.toLocaleString()} KRW</strong>. Add these amounts to reach x,999 KRW:</p>
                    <ul style="list-style: none;">
                        ${recommendations.map(rec => `
                            <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                                <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()} KRW</strong></span>
                                <div style="text-align: right;">
                                    <span style="display:block; font-weight:bold;">+ ${rec.requiredJPY.toFixed(2)} JPY</span>
                                    <span style="font-size:0.8em; color:#999;">(Needs ${rec.diffKRW.toLocaleString()} KRW)</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            resultsSection.innerHTML += recHtml;
        }

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});
