document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer      = document.getElementById('cardsContainer');
    const paginationControls  = document.getElementById('paginationControls');
    const searchInput         = document.getElementById('searchInput');
    const searchButton        = document.getElementById('searchButton');
    const tagCheckboxes       = document.querySelectorAll('input[name="tag"]');
    const sortOrder           = document.getElementById('sortOrder');
    const favoritesButton     = document.getElementById('favoritesButton');
  
    const itemsPerPage = 15;
    let currentPage    = 1;
    let allCards       = [];
    let favorites      = JSON.parse(localStorage.getItem('favorites_procuro')) || [];
  
    const currentFilters = {
      search: '',
      tags: [],
      sort: 'recentes'
    };
  
    // Carrega todas as cartas
    fetch('http://localhost:3000/api/procuroCartas')
      .then(res => res.json())
      .then(data => {
        allCards = data;
        refreshData();
      })
      .catch(err => {
        console.error('Erro ao carregar cartas:', err);
        cardsContainer.innerHTML = '<p>Erro ao carregar cartas.</p>';
      });
  
    // Eventos de filtro e busca
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
  
    sortOrder.addEventListener('change', e => {
      currentFilters.sort = e.target.value;
      refreshData();
    });
  
    favoritesButton.addEventListener('click', () => {
      window.location.hash = '#favorites';
      // limpa filtros de busca
      currentFilters.search = '';
      searchInput.value = '';
      tagCheckboxes.forEach(c => c.checked = false);
      currentPage = 1;
      refreshData();
    });
  
    paginationControls.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
        currentPage = +e.target.dataset.page;
        refreshData();
      }
    });
  
    // Aplica filtros, paginação e ordenação
    function refreshData() {
      let filtered = allCards.filter(card => {
        return card.nome_carta.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
               (currentFilters.tags.length === 0 || currentFilters.tags.includes(card.tag));
      });
  
      if (window.location.hash === '#favorites') {
        filtered = filtered.filter(c => favorites.includes(c._id));
      }
  
      // Ordenação
      if (currentFilters.sort === 'recentes') {
        filtered.sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro));
      } else if (currentFilters.sort === 'nome_asc') {
        filtered.sort((a, b) => a.nome_carta.localeCompare(b.nome_carta));
      } else if (currentFilters.sort === 'nome_desc') {
        filtered.sort((a, b) => b.nome_carta.localeCompare(a.nome_carta));
      }
  
      // Paginação
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (currentPage > totalPages) currentPage = totalPages || 1;
  
      const start = (currentPage - 1) * itemsPerPage;
      const pageItems = filtered.slice(start, start + itemsPerPage);
  
      renderCards(pageItems);
      renderPagination(totalPages);
    }
  
    // Renderiza os cards na tela
    function renderCards(cards) {
      if (cards.length === 0) {
        cardsContainer.innerHTML = '<p>Nenhuma carta encontrada.</p>';
        return;
      }
      cardsContainer.innerHTML = cards.map(card => `
        <div class="card">
          <img src="${card.imagem}" alt="${card.nome_carta}" />
          <div class="card-info">
            <h3>${card.nome_carta}</h3>
            <p>${card.tag}</p>
          </div>
          <button class="favorite-button ${favorites.includes(card._id) ? 'active' : ''}"
                  data-id="${card._id}">⭐</button>
        </div>
      `).join('');
  
      // Toggle favoritos
      cardsContainer.querySelectorAll('.favorite-button').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
          } else {
            favorites.push(id);
          }
          localStorage.setItem('favorites_procuro', JSON.stringify(favorites));
          btn.classList.toggle('active');
        });
      });
    }
  
    // Renderiza botões de paginação
    function renderPagination(totalPages) {
      let html = '';
      for (let i = 1; i <= totalPages; i++) {
        html += `<button ${i === currentPage ? 'disabled' : ''} data-page="${i}">${i}</button>`;
      }
      paginationControls.innerHTML = html;
    }
  });
  