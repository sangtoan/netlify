const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/recognize', async (req, res) => {
    const { image } = req.body;

    try {
        const { data: { text } } = await Tesseract.recognize(
            image,
            'eng',
            { logger: m => console.log(m) }
        );

        // Replace this with a library or logic to convert recognized text to LaTeX
        const latex = convertToLatex(text);
        
        res.json({ latex });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error recognizing image');
    }
});

function convertToLatex(text) {
    // Replace this with actual logic to convert text to LaTeX
    return text;
}

exports.api = functions.https.onRequest(app);
