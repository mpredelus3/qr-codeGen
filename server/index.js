require('dotenv').config();  // Load environment variables


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mssql = require('mssql');
const QRCode = require('qrcode');  // QR code generation library
const http = require('http');
const path = require('path');  // Import path for serving static files

const app = express();
const PORT = process.env.PORT || 5001;  // Define the PORT variable

app.use(cors());
app.use(bodyParser.json());

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,  // Ensure this is a valid string
    port: parseInt(process.env.DB_PORT, 10),  // Convert the port to a number
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Enable if you're using Azure
        trustServerCertificate: true, // Disable SSL verification for local testing
    },
};


// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Endpoint to create and save a QR code
app.post('/api/create-qr', async (req, res) => {
    const { qrId, redirectURL, squareColor, eyeColor } = req.body;

    // Check for required fields
    if (!qrId || !redirectURL || !squareColor || !eyeColor) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Generate the QR code as a Data URL
        const qrDataURL = await QRCode.toDataURL(redirectURL, {
            color: {
                dark: squareColor,
                light: '#FFFFFF',  // Light color, typically white
            },
        });

        const pool = await mssql.connect(dbConfig);
        await pool.request()
            .input('QRCodeid', mssql.NVarChar(255), qrId)  // Align with QRCodeid column
            .input('RedirectUrl', mssql.NVarChar(mssql.MAX), redirectURL)  // Align with RedirectUrl
            .input('SquareColor', mssql.NVarChar(50), squareColor)  // Align with SquareColor
            .input('Eyecolor', mssql.NVarChar(50), eyeColor)  // Align with Eyecolor
            .query(`INSERT INTO dbo.QRCodes (QRCodeid, RedirectUrl, SquareColor, Eyecolor)
                    VALUES (@QRCodeid, @RedirectUrl, @SquareColor, @Eyecolor)`);

        res.json({ message: 'QR Code saved successfully!' });
    } catch (error) {
        console.error('Error saving QR Code:', error);
        res.status(500).json({ message: 'Error saving QR Code.' });
    }
});

// Endpoint to log QR code scans
app.post('/api/log-qr-scan', async (req, res) => {
    const { qrId, deviceDetails, country, city, macAddress } = req.body;

    // Check for required fields
    if (!qrId) {
        return res.status(400).json({ message: 'QR Code ID is required.' });
    }

    try {
        const pool = await mssql.connect(dbConfig);
        await pool.request()
            .input('QRCodeid', mssql.NVarChar(255), qrId)  // Align with QRCodeid in QRScans
            .input('ScanDateTime', mssql.DateTime, new Date())  // Automatically log the current date/time
            .input('DeviceDetails', mssql.NVarChar(mssql.MAX), deviceDetails || '')  // Device details (optional)
            .input('Country', mssql.NVarChar(100), country || '')  // Country (optional)
            .input('City', mssql.NVarChar(100), city || '')  // City (optional)
            .input('MacAddress', mssql.NVarChar(50), macAddress || '')  // MacAddress (optional)
            .query(`INSERT INTO dbo.QRScans (QRCodeid, ScanDateTime, DeviceDetails, Country, City, MacAddress)
                    VALUES (@QRCodeid, @ScanDateTime, @DeviceDetails, @Country, @City, @MacAddress)`);

        res.json({ message: 'QR scan logged successfully!' });
    } catch (error) {
        console.error('Error logging QR scan:', error);
        res.status(500).json({ message: 'Error logging QR scan.' });
    }
});

// Endpoint to retrieve all QR codes
app.get('/api/get-qr-codes', async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.QRCodes');
        
        console.log(result.recordset); // Log the result to check the data
        res.json(result.recordset);
    } catch (error) {
        console.error('Error retrieving QR Codes:', error);
        res.status(500).json({ message: 'Error retrieving QR Codes.' });
    }
});

// Catch-all route for React (Single Page Application)
// This ensures that when you access any route other than API, index.html is served.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start the server
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
