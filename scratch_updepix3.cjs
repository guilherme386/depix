const axios = require('axios');

const API_KEY = 'upx_a5ce6e07fff5046eb36eab2ebc584e719618ad885ce880ea7ee60fcc7eee9a95';

async function testCreateDeposit() {
    try {
        console.log("Testing Updepix deposit creation v2...");
        const response = await axios.post('https://updepix.cc/api/v2/deposits', {
            amount: 2.00,
            external_id: 'test-' + Date.now(),
            payer_name: 'Test integration User',
            pass_fees_to_payer: false
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Success! Status code:", response.status);
    } catch (error) {
        console.error("Error calling Updepix API v2:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testCreateDeposit();
