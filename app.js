function fetchData() {
    var searchTerm = document.getElementById("searchInput").value;
    fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('result').innerHTML = 'Veri başarıyla çekildi. İşlenen veriler: <br>' + html;
        })
        .catch(error => {
            console.error('Hata:', error);
            document.getElementById('result').textContent = 'Hata oluştu: ' + error.message;
        });
}