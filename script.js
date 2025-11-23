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
        updateTargetDisplay();
    });

    function updateTargetDisplay() {
        const rate100 = parseFloat(exchangeRateInput.value);
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
        rateSourceText.textContent = "Fetching rate from server...";
        exchangeRateInput.placeholder = "Loading...";

        try {
            // Fetch from local server API
            const response = await fetch('/api/rate');
            const data = await response.json();

            if (data && data.rate) {
                const rate100 = data.rate; // Scraped rate is already for 100 JPY usually, or we need to check.
                // Shinhan "Send" rate is usually per 100 JPY for JPY.
                // Let's assume the scraper returns the value as seen on screen (e.g. 950.13).

                exchangeRateInput.value = rate100.toFixed(2);

                const timeStr = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown';
                rateSourceText.innerHTML = `Rate from <strong>Shinhan Bank</strong> (Scraped at ${timeStr})`;

                updateTargetDisplay();
            } else {
                throw new Error("No rate data available yet");
            }
        } catch (error) {
            console.error("Failed to fetch rate:", error);
            rateSourceText.textContent = "Failed to fetch. Ensure server is running (npm start).";
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
            <input type="text" placeholder="Product Name ${productCount}" class="product-name" value="Product ${productCount}">
            <div class="input-wrapper">
                <input type="number" placeholder="Price" class="product-price">
                <span class="unit">JPY</span>
            </div>
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
            if (name && !isNaN(priceJPY)) {
                products.push({ name, priceJPY });
            }
        });
        return products;
    }

    function calculateBestCombination() {
        const rate100 = parseFloat(exchangeRateInput.value);
        if (isNaN(rate100)) {
            alert("Please enter a valid exchange rate.");
            return;
        }

        const products = getProducts();
        if (products.length === 0) {
            alert("Please add at least one product with a price.");
            return;
        }

        // Convert JPY to KRW
        const items = products.map(p => ({
            ...p,
            priceKRW: Math.floor(p.priceJPY * (rate100 / 100))
        }));

        // Find best subset based on Accumulation Rate
        // Rule: Rate = ((Sum % 1000) * 2) / Sum
        // Condition: Sum >= 5000

        const result = findBestSubsetByRate(items);
        displayResults(result);
    }

    function findBestSubsetByRate(items) {
        let bestRate = -1;
        let bestSubset = null;
        let bestSum = 0;

        // Backtracking to find all valid subsets
        function backtrack(index, currentSum, currentItems) {
            // Optimization: If currentSum is very large, rate might decrease, but we can't easily prune 
            // because a small addition could boost the (Sum % 1000) part significantly.
            // However, practical limits apply. Let's just explore all since N is small.

            if (index === items.length) {
                if (currentSum >= 5000) {
                    const points = (currentSum % 1000) * 2;
                    const rate = points / currentSum;

                    if (rate > bestRate) {
                        bestRate = rate;
                        bestSubset = [...currentItems];
                        bestSum = currentSum;
                    } else if (rate === bestRate) {
                        // Tie-breaker: Prefer higher sum? or lower sum? 
                        // Usually lower sum is better for "spending less for same rate", 
                        // but higher sum gives more absolute points.
                        // Let's stick to the first found or maybe higher points (which implies higher sum usually if rate is same).
                        // Let's prefer higher absolute points (which means higher (Sum%1000)).
                        if ((currentSum % 1000) > (bestSum % 1000)) {
                            bestSubset = [...currentItems];
                            bestSum = currentSum;
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
            return { sum: bestSum, items: bestSubset, rate: bestRate };
        }
        return null;
    }

    function displayResults(result) {
        resultsSection.classList.remove('hidden');
        resultItemsList.innerHTML = '';

        if (result) {
            const points = (result.sum % 1000) * 2;
            const ratePercentage = (result.rate * 100).toFixed(2);

            resultTotal.textContent = `${result.sum.toLocaleString()} KRW`;
            // We'll reuse the "Target Range" element to show the Rate and Points
            // Or we can dynamically update the label.
            // Let's just change the text content.
            const rangeLabel = document.querySelector('.result-item:nth-child(2) .label');
            if (rangeLabel) rangeLabel.textContent = "Accumulation Rate";

            resultRange.innerHTML = `${ratePercentage}% <span style="font-size:0.8em; color:#666;">(${points} Points)</span>`;

            result.items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <div>
                        <span class="item-price">${item.priceKRW.toLocaleString()} KRW</span>
                        <span class="item-original">(${item.priceJPY} JPY)</span>
                    </div>
                `;
                resultItemsList.appendChild(li);
            });

            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            resultTotal.textContent = "No Match";
            resultRange.textContent = "-";
            const li = document.createElement('li');
            li.textContent = "No combination found >= 5,000 KRW.";
            resultItemsList.appendChild(li);
        }
    }
});
