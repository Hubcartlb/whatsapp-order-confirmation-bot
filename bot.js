const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

app.use(express.json());

// 1️⃣ WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "business_phone" }),
    puppeteer: { headless: true } // headless for Render
});

client.initialize();

client.on('ready', () => {
    console.log('WhatsApp client ready!');
});

// 2️⃣ Function to send confirmation
async function sendConfirmation(to, orderId) {
    const number = to.includes('@c.us') ? to : `${to}@c.us`;
    const message = `Hi! Your order #${orderId} has been received. Thank you for shopping with us!`;
    await client.sendMessage(number, message);
}

// 3️⃣ WooCommerce webhook endpoint
app.post('/new-order', async (req, res) => {
    try {
        const order = req.body;
        const customerPhone = order.billing.phone; // number in format e.g. 96170100100
        const orderId = order.id;

        await sendConfirmation(customerPhone, orderId);

        res.status(200).send('WhatsApp message sent');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending message');
    }
});

// 4️⃣ Start Express server (Render requires PORT env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
