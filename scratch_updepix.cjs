const axios = require('axios');

const API_KEY = 'upx_a5ce6e07fff5046eb36eab2ebc584e719618ad885ce880ea7ee60fcc7eee9a95';

async function testCreateDeposit() {
    try {
        console.log("Testing Updepix deposit creation...");
        const response = await axios.post('https://updepix.cc/api/v1/deposits', {
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
        console.log("Response data:", JSON.stringify(response.data, null, 2));

        const depositId = response.data.data.id;
        console.log(`\nTesting status query for deposit ${depositId}...`);
        const statusResponse = await axios.get(`https://updepix.cc/api/v1/deposits/${depositId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        console.log("Status query response:", JSON.stringify(statusResponse.data, null, 2));

    } catch (error) {
        console.error("Error calling Updepix API:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testCreateDeposit();
