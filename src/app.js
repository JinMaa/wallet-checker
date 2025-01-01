const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Ordiscan } = require('ordiscan');
require('dotenv').config();

const ordiscan = new Ordiscan(process.env.ORDISCAN_API_KEY);

// Configuration
const WALLET_LIST = process.env.WALLET_LIST.split(',').map(wallet => wallet.trim());
const QUERY_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const OUTPUT_FILE = path.join(__dirname, 'data', 'wallet_data.xlsx');

// Function to fetch data for a wallet
async function fetchWalletData(address) {
    try {
        // Fetching BRC20 tokens and Runes
        const runes = await ordiscan.address.getRunes({ address });
        const brc20Tokens = await ordiscan.address.getBrc20Tokens({ address });

        return {
            address,
            runes,
            brc20Tokens
        };
    } catch (error) {
        console.error(`Error fetching data for wallet ${address}:`, error.message);
        return { address, error: error.message };
    }
}

// Function to process and write rows for Runes and BRC20 tokens to Excel
function writeToExcel(data) {
    let workbook;

    // Check if the file already exists
    if (fs.existsSync(OUTPUT_FILE)) {
        workbook = xlsx.readFile(OUTPUT_FILE);
    } else {
        workbook = xlsx.utils.book_new();
    }

    const sheetName = 'Wallet Data';
    let allRows = [];

    // Iterate through each wallet data
    data.forEach(walletData => {
        // Add rows for Runes
        if (walletData.runes && walletData.runes.length > 0) {
            walletData.runes.forEach(rune => {
                allRows.push({
                    wallet: walletData.address,
                    type: 'Rune',
                    name: rune.name,
                    balance: rune.balance
                });
            });
        }

        // Add rows for BRC20 tokens
        if (walletData.brc20Tokens && walletData.brc20Tokens.length > 0) {
            walletData.brc20Tokens.forEach(token => {
                allRows.push({
                    wallet: walletData.address,
                    type: 'BRC20 Token',
                    tick: token.tick,
                    balance: token.balance
                });
            });
        }

        // If there's an error, include it as a row
        if (walletData.error) {
            allRows.push({
                wallet: walletData.address,
                type: 'Error',
                message: walletData.error
            });
        }
    });

    // Convert all rows to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(allRows, {
        header: ['wallet', 'type', 'name', 'balance', 'tick', 'message'],
    });

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    xlsx.writeFile(workbook, OUTPUT_FILE);
}

// Main function to periodically fetch data
async function updateWalletData() {
    console.log('Starting wallet data update...');

    const allData = [];
    for (const address of WALLET_LIST) {
        console.log(`Fetching data for wallet: ${address}`);
        const walletData = await fetchWalletData(address);
        allData.push(walletData);
    }

    console.log('Writing data to Excel...');
    writeToExcel(allData);
    console.log('Update complete!');
}

// Schedule periodic updates
setInterval(updateWalletData, QUERY_INTERVAL);

// Run once immediately on startup
updateWalletData();
