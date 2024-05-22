const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
    const searchTerm = req.query.q;
    const url = `https://www.fidanburada.com/arama/?q=${encodeURIComponent(searchTerm)}`;

    const axiosConfig = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Referer': 'https://www.fidanburada.com/'
        }
    };

    console.log('Requesting URL:', url);

    try {
        const response = await axios.get(url, axiosConfig);
        console.log('Response status:', response.status);

        if (response.status === 404) {
            throw new Error('URL not found (404)');
        }

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

        const pageResponse = await axios.get(href, axiosConfig);
        const pageDom = new JSDOM(pageResponse.data);
        const productDetailsUl = pageDom.window.document.querySelector('ul#PL.pl_v9.pg_v9');
        if (!productDetailsUl) {
            throw new Error('Ürün detayları bulunamadı');
        }

        const productLis = productDetailsUl.querySelectorAll('li');
        const productInfos = [];
        productLis.forEach(li => {
            const priceSpan = li.querySelector('span.pt_v8');
            const productNameSpan = li.querySelector('span.w_v8 span.pn_v8');
            const sellerSpan = li.querySelector('span.v_v8');
            if (priceSpan && productNameSpan && sellerSpan) {
                const price = priceSpan.textContent.trim();
                const productName = productNameSpan.textContent.trim();
                const sellerHTML = sellerSpan.innerHTML.trim();
                productInfos.push({ price, productName, seller: sellerHTML });
            }
        });

        res.json({ href, title, productInfos });

    } catch (error) {
        console.error('Veri getirilirken hata oluştu:', error.message);
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
