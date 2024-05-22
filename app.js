document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    fetchContent(query);
});

async function fetchContent(query) {
    const url = `https://www.fidanburada.com/arama?q=${query}`;
    const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const resultsDiv = document.getElementById('fidan-burada-result');
        resultsDiv.innerHTML = '';

        const catalogElement = doc.querySelector('#catalog335');
        if (catalogElement) {
            // 3 kere içeri gir ve <a> elemanını bul
            let currentElement = catalogElement;
            for (let i = 0; i < 3; i++) {
                if (currentElement.children.length > 0) {
                    currentElement = currentElement.children[0];
                } else {
                    resultsDiv.textContent = 'Sonuç bulunamadı.';
                    return;
                }
            }

            const anchorElement = currentElement.querySelector('a');
            if (anchorElement) {
                const fullUrl = `https://www.fidanburada.com${anchorElement.getAttribute('href')}`;
                resultsDiv.textContent = fullUrl;

                // Yeni sayfadan istenilen içeriği al
                fetchNewPageContent(fullUrl);
            } else {
                resultsDiv.textContent = 'Sonuç bulunamadı.';
            }
        } else {
            resultsDiv.textContent = 'Element mevcut değil.';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('fidan-burada-result').textContent = 'Bir hata oluştu.';
    }
}

async function fetchNewPageContent(url) {
    const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(url)}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const resultsDiv = document.getElementById('fidan-burada-result');

        const trElement = doc.querySelector('tr[style="height: 53px;"]');
        if (trElement) {
            const tdElement = trElement.querySelector('td');
            if (tdElement) {
                // İlk span elementini kaldır
                const firstSpan = tdElement.querySelector('span');
                if (firstSpan) {
                    firstSpan.remove();
                }
                resultsDiv.innerHTML = tdElement.innerHTML; // İçeriği HTML olarak ekle
            } else {
                resultsDiv.textContent = 'TD element bulunamadı.';
            }
        } else {
            resultsDiv.textContent = 'TR element bulunamadı.';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('results').textContent = 'Bir hata oluştu.';
    }
}
