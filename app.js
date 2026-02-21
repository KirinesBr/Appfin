let state = JSON.parse(localStorage.getItem('finance_data')) || { transacoes: [], cartoes: [{id: 1, nome: 'Principal', fechamento: 15, vencimento: 22}], filtro: {mes: new Date().getMonth(), ano: 2026} };

function saveData() { localStorage.setItem('finance_data', JSON.stringify(state)); atualizarInterfaceGlobal(); }

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    el.classList.add('active');
}

function alterarMes(v) { 
    state.filtro.mes += v; 
    if(state.filtro.mes > 11) { state.filtro.mes = 0; state.filtro.ano++; }
    if(state.filtro.mes < 0) { state.filtro.mes = 11; state.filtro.ano--; }
    saveData(); 
}

function atualizarInterfaceGlobal() {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    document.getElementById('label-mes-ano').innerText = `${meses[state.filtro.mes]} ${state.filtro.ano}`;
    // Aqui entrariam as funções de renderizar gráfico e lista que fizemos antes
}

window.onload = atualizarInterfaceGlobal;