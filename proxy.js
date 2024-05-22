import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    try {
        const response = await fetch(url);
        const text = await response.text();
        res.send(text);
    } catch (error) {
        res.status(500).send('Error fetching the URL');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
