require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mssql = require('mssql');

const app = express();
const port = process.env.PORT || 5001;

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

app.use(bodyParser.json());
app.use(cors());

// Endpoint to store QR code details in the database
app.post('/api/create-qr', async (req, res) => {
    const { qrId, redirectURL, squareColor, eyeColor, qrDataURL } = req.body;

    if (!qrId || !redirectURL || !squareColor || !eyeColor || !qrDataURL) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const pool = await mssql.connect(dbConfig);
        await pool.request()
            .input('QRId', mssql.NVarChar(100), qrId)
            .input('RedirectURL', mssql.NVarChar(2048), redirectURL)
            .input('SquareColor', mssql.NVarChar(7), squareColor)
            .input('EyeColor', mssql.NVarChar(7), eyeColor)
            .input('QRDataURL', mssql.NVarChar(mssql.MAX), qrDataURL)
            .query(`INSERT INTO dbo.QRCodes (QRId, RedirectURL, SquareColor, EyeColor, QRDataURL)
                    VALUES (@QRId, @RedirectURL, @SquareColor, @EyeColor, @QRDataURL)`);

        res.json({ message: 'QR Code saved successfully!' });
    } catch (error) {
        console.error('Error saving QR Code:', error);
        res.status(500).json({ message: 'Error saving QR Code.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
