document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const paginationControls = document.getElementById('paginationControls');
    const itemsPerPage = 15;
    let currentPage = 1;
    let allCards = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const currentFilters = {
        search: '',
        tags: [],
        minPrice: 0,
        maxPrice: 1000,
        sort: 'recentes'
    };

    // Elementos do DOM
    const searchInput = document.getElementById('searchInput');
    const tagCheckboxes = document.querySelectorAll('input[name="tag"]');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const minPriceLabel = document.getElementById('minPriceLabel');
    const maxPriceLabel = document.getElementById('maxPriceLabel');
    const sortOrder = document.getElementById('sortOrder');
    const favoritesButton = document.getElementById('favoritesButton');

    // Mock data - substituir por API real
    const mockCards = Array.from({length: 45}, (_, i) => ({
        id: i + 1,
        nome_carta: `Carta ${i + 1}`,
        tag: ['Raro', 'Holo', 'Promo', '1ª Edição'][i % 4],
        imagem: `https://via.placeholder.com/200x280/8A2BE2/FFFFFF?text=Carta+${i + 1}`,
        preco: (Math.random() * 1000).toFixed(2),
        disponivel: i % 5 !== 0,
        data_cadastro: new Date().toISOString()
    }));

    // Sistema de Autocomplete
    async function fetchSuggestions(searchTerm) {
        // Substituir por chamada API real
        return mockCards
            .filter(card => card.nome_carta.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(card => card.nome_carta);
    }

    searchInput.addEventListener('input', async (e) => {
        const suggestions = await fetchSuggestions(e.target.value);
        const datalist = document.getElementById('cardSuggestions');
        datalist.innerHTML = suggestions.map(s => `<option value="${s}">`).join('');
    });

    // Sistema de Favoritos
    function toggleFavorite(cardId) {
        const index = favorites.indexOf(cardId);
        if (index === -1) {
            favorites.push(cardId);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayCards(currentPage);
    }

    // Filtros
    tagCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters.tags = Array.from(tagCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            refreshData();
        });
    });

    priceMin.addEventListener('input', (e) => {
        currentFilters.minPrice = parseFloat(e.target.value);
        minPriceLabel.textContent = `R$ ${e.target.value}`;
        refreshData();
    });

    priceMax.addEventListener('input', (e) => {
        currentFilters.maxPrice = parseFloat(e.target.value);
        maxPriceLabel.textContent = `R$ ${e.target.value}`;
        refreshData();
    });

    sortOrder.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        refreshData();
    });

    favoritesButton.addEventListener('click', () => {
        window.location.hash = '#favorites';
        currentFilters.tags = [];
        currentFilters.search = '';
        refreshData();
    });

    // Função para carregar dados
    async function loadCards() {
        try {
            // Substituir por fetch real
            let filteredCards = mockCards.filter(card => 
                card.nome_carta.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
                (currentFilters.tags.length === 0 || currentFilters.tags.includes(card.tag)) &&
                card.preco >= currentFilters.minPrice &&
                card.preco <= currentFilters.maxPrice &&
                card.disponivel
            );

            // Ordenação
            const sortFunctions = {
                recentes: (a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro),
                preco_asc: (a, b) => a.preco - b.preco,
                preco_desc: (a, b) => b.preco - a.preco,
                nome_asc: (a, b) => a.nome_carta.localeCompare(b.nome_carta),
                nome_desc: (a, b) => b.nome_carta.localeCompare(a.nome_carta)
            };
            
            filteredCards.sort(sortFunctions[currentFilters.sort] || sortFunctions.recentes);

            // Filtro de favoritos
            if (window.location.hash === '#favorites') {
                filteredCards = filteredCards.filter(card => favorites.includes(card.id));
            }

            return {
                cards: filteredCards,
                totalPages: Math.ceil(filteredCards.length / itemsPerPage),
                totalItems: filteredCards.length
            };
        } catch (error) {
            console.error('Erro ao carregar cartas:', error);
            return { cards: [], totalPages: 0, totalItems: 0 };
        }
    }

    // Restante do código mantido com as devidas adaptações
    // ... (funções displayCards, updatePaginationControls, etc)
});