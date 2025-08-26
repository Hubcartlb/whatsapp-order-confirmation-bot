const { Client, Location, Poll, List, Buttons, LocalAuth } = require('./index');
const express = require('express');
const bodyParser = require('body-parser');

// -------------------- WhatsApp Client --------------------
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.initialize();

// ----- WhatsApp Events -----
client.on('loading_screen', (percent, message) => console.log('LOADING SCREEN', percent, message));
client.on('qr', qr => console.log('QR RECEIVED', qr));
client.on('authenticated', () => console.log('AUTHENTICATED'));
client.on('auth_failure', msg => console.error('AUTHENTICATION FAILURE', msg));
client.on('ready', async () => console.log('READY'));
client.on('message', async msg => {
    // Your full message logic from bot.js here
    console.log('MESSAGE RECEIVED', msg.body);
    if (msg.body === '!ping') msg.reply('pong');
    // ... other commands ...
});

// Add other client.on events from your bot.js as needed
// group_join, group_leave, message_create, message_revoke_everyone, etc.

// -------------------- Express Webhook --------------------
const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    try {
        const { id, customer_name, phone } = req.body;

        if (!id || !customer_name || !phone) {
            return res.status(400).send('Missing order data.');
        }

        // WhatsApp format: country code + number + '@c.us'
        const waNumber = phone.replace(/\D/g, '') + '@c.us';

        await client.sendMessage(
            waNumber,
            `Hello ${customer_name}, thank you for your order #${id}. Please reply YES to confirm or NO to cancel.`
        );

        res.status(200).send('WhatsApp message sent.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending WhatsApp message.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
