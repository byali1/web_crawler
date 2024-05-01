const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
    const searchTerm = req.query.q;
    const url = `https://www.akakce.com/arama/?q=${encodeURIComponent(searchTerm)}`;

    const axiosConfig = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Referer': 'https://www.akakce.com/'
        }
    };

    try {
        const response = await axios.get(url, axiosConfig);
        const dom = new JSDOM(response.data);
        const ulElement = dom.window.document.querySelector('ul#APL.pl_v9.qv_v9');

        if (!ulElement) {
            throw new Error('Ürün listesi bulunamadı');
        }

        const firstH3Element = ulElement.querySelector('li h3.pn_v8');
        if (!firstH3Element) {
            throw new Error('İlgili ürün ismi bulunamadı');
        }

        const firstAnchor = findFirstAnchorAbove(firstH3Element);
        if (!firstAnchor) {
            throw new Error('İlgili ürün için bağlantı bulunamadı');
        }

        const href = firstAnchor.getAttribute('href').trim();
        const title = firstAnchor.getAttribute('title').trim();

        res.json({ href, title });
    } catch (error) {
        console.error('Akakce verisi getirilirken hata oluştu:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Verilen bir DOM elementinin üstünde olan ilk <a> elementini bulur
function findFirstAnchorAbove(element) {
    let parent = element.parentElement;
    while (parent) {
        if (parent.tagName === 'A') {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} numaralı port üzerinde dinleniyor`);
});
