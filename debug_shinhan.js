const axios = require('axios');

async function findUrl() {
    try {
        const response = await axios.get('https://bank.shinhan.com/index.jsp');
        const html = response.data;

        // Search for the menu ID
        if (html.includes('020501010200')) {
            console.log("Found ID in index.jsp!");
            // Try to extract context
            const lines = html.split('\n');
            lines.forEach((line, i) => {
                if (line.includes('020501010200')) {
                    console.log(`Line ${i}: ${line.trim()}`);
                }
            });
        } else {
            console.log("ID not found in index.jsp");
        }
    } catch (e) {
        console.error(e.message);
    }
}

findUrl();
