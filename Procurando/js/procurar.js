document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cardsContainer');
    const paginationControls = document.getElementById('paginationControls');
    const itemsPerPage = 15;
    let currentPage = 1;
    let allCards = [];

    // Simulação de dados - Substituir por fetch real quando o backend estiver pronto
    const mockCards = Array.from({length: 45}, (_, i) => ({
        id: i + 1,
        nome_carta: `Carta ${i + 1}`,
        tag: ['Raro', 'Holo', 'Promo'][i % 3],
        imagem: `https://via.placeholder.com/200x280/8A2BE2/FFFFFF?text=Carta+${i + 1}`
    }));

    // Função para carregar dados (simulada)
    async function loadCards() {
        try {
            const response = await fetch(`api/procurar.php?page=${currentPage}`);
            const data = await response.json();
            allCards = data.cards;
            return data.totalPages;
        } catch (error) {
            console.error('Erro ao carregar cartas:', error);
            cardsContainer.innerHTML = '<div class="error">Erro ao carregar as cartas</div>';
        }
    }

    function displayCards(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const cardsToShow = allCards.slice(startIndex, endIndex);

        cardsContainer.innerHTML = cardsToShow.map(card => `
            <div class="card-item">
                <img src="${card.imagem}" alt="${card.nome_carta}" class="card-image">
                <h3 class="card-name">${card.nome_carta}</h3>
                <span class="card-tag">${card.tag}</span>
            </div>
        `).join('');
    }

    function updatePaginationControls(totalPages) {
        paginationControls.innerHTML = `
            <button class="page-button prev" ${currentPage === 1 ? 'disabled' : ''}>
                Anterior
            </button>
            
            ${Array.from({length: totalPages}, (_, i) => `
                <button class="page-button ${i + 1 === currentPage ? 'current-page' : ''}" 
                        data-page="${i + 1}">
                    ${i + 1}
                </button>
            `).join('')}

            <button class="page-button next" ${currentPage === totalPages ? 'disabled' : ''}>
                Próxima
            </button>
        `;

        // Adicionar event listeners
        document.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', () => {
                if(button.classList.contains('prev')) {
                    currentPage = Math.max(1, currentPage - 1);
                } else if(button.classList.contains('next')) {
                    currentPage = Math.min(totalPages, currentPage + 1);
                } else if(button.dataset.page) {
                    currentPage = parseInt(button.dataset.page);
                }
                
                displayCards(currentPage);
                updatePaginationControls(totalPages);
            });
        });
    }

    // Inicialização
    loadCards().then(() => {
        const totalPages = Math.ceil(allCards.length / itemsPerPage);
        displayCards(currentPage);
        updatePaginationControls(totalPages);
    });
});