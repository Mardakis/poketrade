document.addEventListener('DOMContentLoaded', () => {
  // Toggle do menu mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks   = document.querySelector('.nav-links');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => navLinks.classList.remove('active'))
  );

  // Captura dos contêineres
  const procuroContainer = document.getElementById('procuro-list');
  const trocoContainer   = document.getElementById('troco-list');

  // Função genérica de renderização
  function renderCards(cards, container, isTroco = false) {
    if (!cards.length) {
      container.innerHTML = '<p>Nenhuma carta cadastrada.</p>';
      return;
    }
    container.innerHTML = cards.map(card => `
      <div class="card">
        <img src="${card.imagem}" alt="${card.nome_carta}" />
        <div class="card-info">
          <h3>${card.nome_carta}</h3>
          <p>${card.tag}</p>
          ${ isTroco
            ? `<p class="price">R$ ${Number(card.preco).toFixed(2)}</p>
               <p class="status">${card.disponivel ? 'Disponível' : 'Indisponível'}</p>`
            : ''
          }
        </div>
      </div>
    `).join('');
  }

  // Busca dados do backend e renderiza
  Promise.all([
    fetch('http://localhost:3000/api/procuroCartas').then(r => r.json()),
    fetch('http://localhost:3000/api/trocoCartas').  then(r => r.json())
  ])
  .then(([procuroCards, trocoCards]) => {
    renderCards(procuroCards, procuroContainer, false);
    renderCards(trocoCards,   trocoContainer,   true);
  })
  .catch(err => {
    console.error('Erro ao carregar cartas:', err);
    procuroContainer.innerHTML = '<p>Erro ao carregar.</p>';
    trocoContainer.innerHTML   = '<p>Erro ao carregar.</p>';
  });
});
