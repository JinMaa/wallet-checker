const express = require('express');
const { Ordiscan } = require('ordiscan');
require('dotenv').config();

const app = express();
const PORT = 3000;
const ordiscan = new Ordiscan(process.env.ORDISCAN_API_KEY);

// Serve static files from the "public" folder
app.use(express.static('public'));

// API endpoint to fetch UTXOs
app.get('/utxos', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ message: 'Address is required' });
    }

    try {
        const utxos = await ordiscan.address.getUtxos({ address });
        res.json(utxos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
