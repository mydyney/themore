// Translation dictionary
const translations = {
    ko: {
        title: "더모아 계산기",
        subtitle: "일본 여행 시 더모아 카드로 최대 할인 혜택을 받으세요.",
        exchangeRate: "환율",
        sendRateLabel: "송금 환율 (100 JPY당 KRW, 카드 수수료 포함)",
        loading: "로딩 중...",
        refreshRate: "환율 새로고침",
        targetLabel: "목표 (5,999 KRW):",
        items: "상품",
        addItem: "+ 상품 추가",
        itemName: "상품",
        price: "가격",
        calculate: "최적 조합 계산",
        // Dynamic content translations
        connectingServer: "서버 연결 중...",
        rateFromTheMore: "TheMore (최종) 환율",
        clientAt: "클라이언트",
        serverOffline: "서버 오프라인.",
        clickToCheck: "신한은행 확인하기",
        selectJapan: "(일본 100엔 선택)",
        failedToFetch: "환율을 가져오지 못했습니다. 수동으로 입력해주세요.",
        // Tax/Discount options
        tax8Add: "8% 세금 (추가)",
        tax10Add: "10% 세금 (추가)",
        tax0Incl: "0% (세금 포함)",
        discount5: "5% 할인",
        discount10: "10% 할인",
        discount20: "20% 할인",
        discount30: "30% 할인",
        discount40: "40% 할인",
        discount50: "50% 할인",
        // Results
        optimizationResult: "최적화 결과",
        noCombinationFound: "5,000 KRW 이상의 조합을 찾을 수 없습니다.",
        bestOption: "최적 옵션",
        alternativeOption: "대안 옵션",
        totalAmount: "총 금액",
        accumulationRate: "적립률",
        recommendation: "추천:",
        addToReach: "x,999 KRW에 도달하기 위해 추가",
        target: "목표",
        needs: "필요",
        recommendationResult: "추천 결과",
        currentTotal: "현재 총액:",
        toMakeCombination: "조합 만들기",
        itemsIncluded: "포함된 상품:",
        unusedTotal: "미사용 총액:",
        taxExcluded8: "8% 세전 가격",
        taxExcluded10: "10% 세전 가격"
    },
    en: {
        title: "The More Calculator",
        subtitle: "Optimize your JPY spending for maximum benefits",
        exchangeRate: "Exchange Rate",
        sendRateLabel: "Send Rate (KRW per 100 JPY, including card fee)",
        loading: "Loading...",
        refreshRate: "Refresh Rate",
        targetLabel: "Target (5,999 KRW):",
        items: "Items",
        addItem: "+ Add Item",
        itemName: "Item",
        price: "Price",
        calculate: "Calculate Best Combination",
        // Dynamic content translations
        connectingServer: "Connecting to local server...",
        rateFromTheMore: "Rate from TheMore (Final)",
        clientAt: "Client at",
        serverOffline: "Server offline.",
        clickToCheck: "Click to check Shinhan Bank",
        selectJapan: "(Select 'Japan 100 Yen')",
        failedToFetch: "Failed to fetch. Please enter manually.",
        // Tax/Discount options
        tax8Add: "8% Tax (Add)",
        tax10Add: "10% Tax (Add)",
        tax0Incl: "0% (Tax Incl.)",
        discount5: "5% Discount",
        discount10: "10% Discount",
        discount20: "20% Discount",
        discount30: "30% Discount",
        discount40: "40% Discount",
        discount50: "50% Discount",
        // Results
        optimizationResult: "Optimization Result",
        noCombinationFound: "No combination found >= 5,000 KRW.",
        bestOption: "Best Option",
        alternativeOption: "Alternative Option",
        totalAmount: "Total Amount",
        accumulationRate: "Accumulation Rate",
        recommendation: "Recommendation:",
        addToReach: "Add to reach x,999 KRW",
        target: "Target",
        needs: "Needs",
        recommendationResult: "Recommendation Result",
        currentTotal: "Current Total:",
        toMakeCombination: "To make a combination",
        itemsIncluded: "Items included:",
        unusedTotal: "Unused Total:",
        taxExcluded8: "8% tax excluded",
        taxExcluded10: "10% tax excluded"
    }
};

// Language management
let currentLang = 'ko';

function getCurrentLanguage() {
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'ko' || saved === 'en')) {
        return saved;
    }
    // Default to Korean
    return 'ko';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    translatePage();
    updateFlagIcon();
}

function translatePage() {
    const t = translations[currentLang];

    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key]) {
            el.title = t[key];
        }
    });

    // Update existing product rows
    document.querySelectorAll('.product-row').forEach((row, index) => {
        const nameInput = row.querySelector('.product-name');
        const priceInput = row.querySelector('.product-price');
        const select = row.querySelector('.discount-select');

        if (nameInput) {
            const itemNum = index + 1;
            nameInput.placeholder = `${t.itemName} ${itemNum}`;
            // Update value only if it matches the old pattern
            if (nameInput.value.match(/^(Item Name|Item|상품명|상품) \d+$/)) {
                nameInput.value = `${t.itemName} ${itemNum}`;
            }
        }

        if (priceInput) {
            priceInput.placeholder = t.price;
        }

        if (select) {
            const currentValue = select.value;
            select.innerHTML = `
                <option value="tax8">${t.tax8Add}</option>
                <option value="tax10">${t.tax10Add}</option>
                <option value="0">${t.tax0Incl}</option>
                <option value="5">${t.discount5}</option>
                <option value="10">${t.discount10}</option>
                <option value="20">${t.discount20}</option>
                <option value="30">${t.discount30}</option>
                <option value="40">${t.discount40}</option>
                <option value="50">${t.discount50}</option>
            `;
            select.value = currentValue; // Restore selected value
        }
    });

    // Update document title
    document.title = t.title + " - JPY Optimization";
}

function updateFlagIcon() {
    const flagImg = document.getElementById('lang-flag');
    if (flagImg) {
        flagImg.src = currentLang === 'ko' ? 'flag-us.png' : 'flag-kr.png';
        flagImg.alt = currentLang === 'ko' ? 'Switch to English' : '한국어로 전환';
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    currentLang = getCurrentLanguage();
    setLanguage(currentLang);

    // Set up language toggle button
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

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
    let currentBaseRate100 = 0; // The pure exchange rate without fee

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
            valueSpan.textContent = `≈ ￥${targetJPY.toFixed(2)}`;
        } else {
            valueSpan.textContent = "-- ￥";
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

                            // Pure Exchange Rate (No Fees)
                            const baseKrw = Math.floor(rawUsdRounded * usdToKrw);
                            // Final Fee 1.2% applied to the base KRW for the 100 JPY rate
                            const finalKrw = Math.floor(baseKrw * 1.012);

                            currentBaseRate100 = baseKrw;
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
        const t = translations[currentLang];
        const row = document.createElement('div');
        row.className = 'product-row';
        row.innerHTML = `
            <input type="text" placeholder="${t.itemName} ${productCount}" class="product-name" value="${t.itemName} ${productCount}">
            <div class="input-wrapper">
                <span class="unit-left">￥</span>
                <input type="number" placeholder="${t.price}" class="product-price" style="padding-left: 40px;">
            </div>
            <select class="discount-select" title="Discount / Tax">
                <option value="tax8">${t.tax8Add}</option>
                <option value="tax10">${t.tax10Add}</option>
                <option value="0" selected>${t.tax0Incl}</option>
                <option value="5">${t.discount5}</option>
                <option value="10">${t.discount10}</option>
                <option value="20">${t.discount20}</option>
                <option value="30">${t.discount30}</option>
                <option value="40">${t.discount40}</option>
                <option value="50">${t.discount50}</option>
            </select>
            <button class="remove-btn" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;

        const removeBtn = row.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            if (productList.children.length > 3) {
                row.remove();
            } else {
                // If 3 or fewer items, clear name, price and tax/discount
                const t = translations[currentLang];
                const nameInput = row.querySelector('.product-name');
                const priceInput = row.querySelector('.product-price');
                const select = row.querySelector('.discount-select');

                if (nameInput) {
                    const index = Array.from(productList.children).indexOf(row) + 1;
                    nameInput.value = `${t.itemName} ${index}`;
                }
                if (priceInput) {
                    priceInput.value = '';
                }
                if (select) {
                    select.value = '0';
                }
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
                finalPriceJPY = Math.round(p.priceJPY * 1.08);
                discountDisplay = "+8% Tax";
            } else if (p.discountValue === 'tax10') {
                // Add 10% Tax
                finalPriceJPY = Math.round(p.priceJPY * 1.10);
                discountDisplay = "+10% Tax";
            } else if (p.discountValue === '0') {
                // 0% Discount: No tax calculation, use input price directly
                finalPriceJPY = p.priceJPY;
                discountDisplay = "0% (Tax Incl.)";
            } else {
                // Discount Logic (Assumes Tax Included in Input)
                const discountPercent = parseInt(p.discountValue, 10);

                // 1. Convert to pre-tax (8% tax included in price)
                // Use ceil to find the minimum base price that results in this tax-included price
                const basePrice = Math.ceil(p.priceJPY / 1.08);

                // 2. Apply Discount (using ceil for discounted base to avoid rounding down too much)
                const discountedBase = Math.ceil(basePrice * (1 - discountPercent / 100));

                // 3. Re-apply Tax (8%) (using round for final tax-included price)
                finalPriceJPY = Math.round(discountedBase * 1.08);

                discountDisplay = `-${discountPercent}%`;
            }

            // 4. Convert to KRW
            // User requested: "할인이 및 세금까지 적용 완료 후 최종 합산 금액에 수수료를 추가한 후 환전하는 형태야"
            // So we add 1.18% fee to JPY, then convert using base rate.
            const jpyWithFee = Math.floor(finalPriceJPY * 1.0118);
            // If we have a stored base rate, use it, otherwise derive from current input (which has fee)
            const baseRateUsed = currentBaseRate100 || (parseFloat(exchangeRateInput.value) / 1.0118);
            let priceKRW = Math.floor(jpyWithFee * (baseRateUsed / 100));

            // 5. Correction: Verify reverse calculation matches the intended JPY price
            // The target should always be the final calculated JPY price (discounted or tax-added)
            let targetJPY = finalPriceJPY;

            // Reverse calculate: KRW -> JPY (using rate with fee for consistency with target)
            const rateWithFeeUsed = parseFloat(exchangeRateInput.value);
            let reverseJPY = Math.floor(priceKRW / (rateWithFeeUsed / 100));

            // If reverse-calculated JPY doesn't match target JPY, add correction
            while (reverseJPY < targetJPY) {
                // Add 1 JPY's worth of KRW
                const oneJpyInKrw = Math.floor(baseRateUsed / 100);
                priceKRW += oneJpyInKrw;
                reverseJPY = Math.floor(priceKRW / (rateWithFeeUsed / 100)); // Re-calculate reverseJPY
            }

            return {
                ...p,
                finalPriceJPY,
                priceKRW,
                discountDisplay
            };
        });

        // Calculate total sum of all items for fallback recommendation
        const totalAllItemsKRW = items.reduce((sum, item) => sum + item.priceKRW, 0);
        const totalAllItemsJPY = items.reduce((sum, item) => sum + item.finalPriceJPY, 0);

        // Find Top 2 Subsets
        const results = findTopSubsets(items);

        // Identify unused items
        const usedItemsSet = new Set();
        results.forEach(result => {
            result.items.forEach(item => usedItemsSet.add(item));
        });

        const unusedItems = items.filter(item => !usedItemsSet.has(item));
        // const unusedSum = unusedItems.reduce((sum, item) => sum + item.priceKRW, 0); // No longer needed here

        displayResults(results, totalAllItemsKRW, totalAllItemsJPY, unusedItems, items); // Pass JPY total
    }

    // Helper function to determine tax rate from items
    function getTaxRateFromItems(items) {
        const hasTax8 = items.some(item => item.discountValue === 'tax8');
        const hasTax10 = items.some(item => item.discountValue === 'tax10');

        // If both exist, use 8%
        if (hasTax8 && hasTax10) {
            return { rate: 1.08, label: '8% tax excluded' };
        } else if (hasTax8) {
            return { rate: 1.08, label: '8% tax excluded' };
        } else if (hasTax10) {
            return { rate: 1.10, label: '10% tax excluded' };
        }
        return null; // No tax items
    }

    // Helper function to generate recommendations with tax consideration
    function generateRecommendations(currentTotalKRW, items, rate100) {
        const recommendations = [];
        let nextTarget = 5999;

        if (currentTotalKRW >= 5999) {
            nextTarget = Math.floor(currentTotalKRW / 1000) * 1000 + 999;
            if (nextTarget <= currentTotalKRW) nextTarget += 1000;
        }

        const taxInfo = getTaxRateFromItems(items);

        for (let i = 0; i < 3; i++) {
            const target = nextTarget + (i * 1000);
            const diffKRW = target - currentTotalKRW;
            let requiredJPY = (diffKRW / rate100) * 100;
            let displayLabel = '';

            if (taxInfo) {
                // Convert to pre-tax price
                requiredJPY = requiredJPY / taxInfo.rate;
                displayLabel = taxInfo.label;
            }

            recommendations.push({
                target: target,
                diffKRW: diffKRW,
                requiredJPY: requiredJPY,
                taxLabel: displayLabel
            });
        }

        return recommendations;
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

    function displayResults(results, totalAllItemsKRW = 0, totalAllItemsJPY = 0, unusedItems = [], allItems = []) {
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
                const rate100 = parseFloat(exchangeRateInput.value);
                const recommendations = generateRecommendations(currentTotalKRW, allItems, rate100);

                const recHtml = `
                    <div class="recommendation-block" style="margin: 0 20px 20px 20px; padding-top: 16px; border-top: 2px solid var(--border-color);">
                        <h3 style="color: var(--primary-color); margin-bottom: 12px;">Recommendation Result</h3>
                        <p style="font-size: 0.9em; color: var(--text-muted); margin-bottom: 12px;">Current Total: <strong>${currentTotalKRW.toLocaleString()} KRW</strong> <span style="color: var(--primary-color); font-weight: 600;">(￥${totalAllItemsJPY.toLocaleString()})</span>. Add these amounts to reach x,999 KRW:</p>
                        <ul style="list-style: none;">
                            ${recommendations.map(rec => {
                    // Reverse calc: JPY = KRW / (Rate/100)
                    const targetJPY = Math.round(rec.target / (rate100 / 100));
                    return `
                                <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                                    <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()} KRW</strong> <span style="font-size:0.85em; color:#999;">(≈￥${targetJPY})</span></span>
                                    <div style="text-align: right;">
                                        <span style="display:block; font-weight:bold;">+ ￥${rec.requiredJPY.toFixed(2)}</span>
                                        ${rec.taxLabel ? `<span style="font-size:0.75em; color:#ec4899;">(${rec.taxLabel})</span>` : ''}
                                        <span style="font-size:0.8em; color:#999;">(Needs ${rec.diffKRW.toLocaleString()} KRW)</span>
                                    </div>
                                </li>
                            `}).join('')}
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
                const rate100 = parseFloat(exchangeRateInput.value);
                const recommendations = generateRecommendations(currentTotalKRW, result.items, rate100);

                recHtml = `
                    <div class="recommendation-block" style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                        <p style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 8px;"><strong>Recommendation:</strong> Add to reach x,999 KRW</p>
                        <ul style="list-style: none;">
                            ${recommendations.map(rec => `
                                <li style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.9em;">
                                    <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()}</strong></span>
                                    <div style="text-align: right;">
                                        <span style="font-weight:bold;">+￥${rec.requiredJPY.toFixed(2)}</span>
                                        ${rec.taxLabel ? `<span style="display:block; font-size:0.75em; color:#ec4899;">(${rec.taxLabel})</span>` : ''}
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            const totalJPY = result.items.reduce((sum, item) => sum + item.finalPriceJPY, 0);

            const html = `
                <div class="result-block ${rankClass}" style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <h3 style="color: var(--primary-color); margin-bottom: 12px;">${rankLabel}</h3>
                    <div class="result-summary" style="margin-bottom: 12px; padding-bottom: 0; border: none;">
                        <div class="result-item">
                            <span class="label">Total Amount</span>
                            <span class="value">${result.sum.toLocaleString()} KRW <span style="font-size: 0.9em; color: var(--primary-color); font-weight: 600; margin-left: 6px;">(￥${totalJPY.toLocaleString()})</span></span>
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
                                    <span class="item-original" style="font-size:0.85em; color:#999;">(￥${item.finalPriceJPY})</span>
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
            const rate100 = parseFloat(exchangeRateInput.value);
            const recommendations = generateRecommendations(currentTotalKRW, unusedItems, rate100);

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
                        ${recommendations.map(rec => {
                // Calculate JPY for Target KRW roughly for display
                // Reverse calc: JPY = KRW / (Rate/100)
                const targetJPY = Math.round(rec.target / (rate100 / 100));
                return `
                            <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                                <span>Target <strong style="color: #10b981;">${rec.target.toLocaleString()} KRW</strong> <span style="font-size:0.85em; color:#999;">(≈￥${targetJPY})</span></span>
                                <div style="text-align: right;">
                                    <span style="display:block; font-weight:bold;">+ ￥${rec.requiredJPY.toFixed(2)}</span>
                                    ${rec.taxLabel ? `<span style="display:block; font-size:0.75em; color:#ec4899;">(${rec.taxLabel})</span>` : ''}
                                    <span style="font-size:0.8em; color:#999;">(Needs ${rec.diffKRW.toLocaleString()} KRW)</span>
                                </div>
                            </li>
                        `}).join('')}
                    </ul>
                </div>
            `;
            resultsSection.innerHTML += recHtml;
        }

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});
