// app.js

async function fetchData() {
    try {
        var searchTerm = document.getElementById("searchInput").value;
        const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        renderProductDetails(data);
    } catch (error) {
        console.error('Veri getirilirken bir hata oluştu:', error);
    }
}

function renderProductDetails(data) {
    const productDetailsDiv = document.getElementById('productDetails');
    productDetailsDiv.innerHTML = `
        <a class="fs-5 text-dark" href="${data.href}" target="_blank">${data.title}</a>

        <table class="table table-striped mt-3">
            <thead>
                <tr>
                    <th scope="col">Fiyat</th>
                    <th scope="col">Ürün Adı</th>
                    <th scope="col">Satıcı</th>
                </tr>
            </thead>
            <tbody>
                ${data.productInfos.map(info => `
                <tr>
                    <td class="text-success">${info.price}</td>
                    <td class="text-dark">${info.productName}</td>
                    <td>${getSeller(info.seller)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


function getSeller(sellerHTML) {
    const sellerSpan = document.createElement('span');
    sellerSpan.innerHTML = sellerHTML;
    const rcElement = sellerSpan.querySelector('.rc_v8');
    if (rcElement) {
        return '';
    } else {
        const imgElement = sellerSpan.querySelector('img');
        if (imgElement) {
            const altText = imgElement.getAttribute('alt') || '';
            const sellerText = sellerSpan.textContent.trim().replace(altText, '').trim();
            return `<span class="fw-bold">${altText}</span>${sellerText}`;
        } else {
            return sellerSpan.textContent.trim();
        }
    }
}




