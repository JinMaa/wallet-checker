const express = require('express');
const { Ordiscan } = require('ordiscan');
require('dotenv').config();

const app = express();
const PORT = 3000;
const ordiscan = new Ordiscan(process.env.ORDISCAN_API_KEY);


// Serve static files from the "public" folder
app.use(express.static('public'));

// API endpoint to handle all Ordiscan calls
app.get('/api', async (req, res) => {
    const { address, endpoint } = req.query;

    if (!address || !endpoint) {
        return res.status(400).json({ message: 'Address and endpoint are required' });
    }

    try {
        let result;

        switch (endpoint) {
            case 'getUtxos':
                result = await ordiscan.address.getUtxos({ address });
                break;
            case 'getInscriptions':
                result = await ordiscan.address.getInscriptions({ address });
                break;
            case 'getRunes':
                result = await ordiscan.address.getRunes({ address });
                break;
            case 'getBrc20Tokens':
                result = await ordiscan.address.getBrc20Tokens({ address });
                break;
            default:
                return res.status(400).json({ message: 'Invalid endpoint selected' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});