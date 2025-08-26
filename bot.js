const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => console.log('Scan this QR:', qr));
client.on('ready', () => console.log('WhatsApp Bot is ready!'));
client.on('message', msg => {
    if(msg.body === '!ping') msg.reply('pong');
});

client.initialize();

// Optional Express server for WooCommerce webhook
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log('Order received:', req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
