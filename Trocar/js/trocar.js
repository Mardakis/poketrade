document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const paginationControls = document.getElementById('paginationControls');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const tagCheckboxes = document.querySelectorAll('input[name="tag"]');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const minPriceLabel = document.getElementById('minPriceLabel');
    const maxPriceLabel = document.getElementById('maxPriceLabel');
    const sortOrder = document.getElementById('sortOrder');
    const favoritesButton = document.getElementById('favoritesButton');

    const itemsPerPage = 15;
    let currentPage = 1;
    let allCards = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const currentFilters = {
        search: '',
        tags: [],
        minPrice: 0,
        maxPrice: 5000,
        sort: 'recentes'
    };

    // Buscar dados do backend
    fetch('http://localhost:3000/api/trocoCartas')
        .then(res => res.json())
        .then(data => {
            allCards = data;
            refreshData();
        })
        .catch(err => {
            console.error('Erro ao carregar dados:', err);
            cardsContainer.innerHTML = '<p>Erro ao carregar cartas.</p>';
        });

    // Eventos de filtros
    searchButton.addEventListener('click', () => {
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        refreshData();
    });

    tagCheckboxes.forEach(cb => cb.addEventListener('change', () => {
        currentFilters.tags = Array.from(tagCheckboxes)
            .filter(c => c.checked)
            .map(c => c.value);
        currentPage = 1;
        refreshData();
    }));

    priceMin.addEventListener('input', e => {
        currentFilters.minPrice = +e.target.value;
        minPriceLabel.textContent = `R$ ${e.target.value}`;
        currentPage = 1;
        refreshData();
    });

    priceMax.addEventListener('input', e => {
        currentFilters.maxPrice = +e.target.value;
        maxPriceLabel.textContent = `R$ ${e.target.value}`;
        currentPage = 1;
        refreshData();
    });

    sortOrder.addEventListener('change', e => {
        currentFilters.sort = e.target.value;
        refreshData();
    });

    favoritesButton.addEventListener('click', () => {
        window.location.hash = '#favorites';
        currentFilters.search = '';
        searchInput.value = '';
        tagCheckboxes.forEach(c => c.checked = false);
        currentPage = 1;
        refreshData();
    });

    paginationControls.addEventListener('click', e => {
        if (e.target.tagName !== 'BUTTON' || e.target.disabled) return;
        currentPage = +e.target.dataset.page;
        refreshData();
    });

    // Atualiza dados e renderiza
    function refreshData() {
        let filtered = allCards.filter(card => {
            return card.nome_carta.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
                   (currentFilters.tags.length === 0 || currentFilters.tags.includes(card.tag)) &&
                   card.preco >= currentFilters.minPrice &&
                   card.preco <= currentFilters.maxPrice;
        });

        if (window.location.hash === '#favorites') {
            filtered = filtered.filter(c => favorites.includes(c._id));
        }

        const sortFns = {
            recentes: (a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro),
            preco_asc: (a, b) => a.preco - b.preco,
            preco_desc: (a, b) => b.preco - a.preco,
            nome_asc: (a, b) => a.nome_carta.localeCompare(b.nome_carta),
            nome_desc: (a, b)
        }
    
    }
})