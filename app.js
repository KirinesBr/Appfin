// --- ESTADO INICIAL DO APP ---
let state = JSON.parse(localStorage.getItem('finance_data')) || {
    transacoes: [],
    cartoes: [
        { id: 1, nome: "Nubank", fechamento: 7, vencimento: 14, cor: "#8A05BE" },
        { id: 2, nome: "Visa", fechamento: 15, vencimento: 22, cor: "#1A1F71" }
    ],
    contas: [{ id: 100, nome: "Conta Corrente", cor: "#007AFF" }],
    filtro: { mes: new Date().getMonth(), ano: 2026 }
};

const NOMES_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// --- FUNÇÕES DE PERSISTÊNCIA ---
function saveData() {
    localStorage.setItem('finance_data', JSON.stringify(state));
    renderizarTudo();
}

// --- LÓGICA DE CALENDÁRIO E FATURA ---
function calcularFatura(dataCompraStr, diaFechamento, diaVencimento) {
    const data = new Date(dataCompraStr + "T00:00:00");
    let mesFatura = data.getMonth();
    let anoFatura = data.getFullYear();
    
    if (data.getDate() >= diaFechamento) {
        mesFatura++;
        if (mesFatura > 11) { mesFatura = 0; anoFatura++; }
    }
    return { mesFatura, anoFatura };
}

// --- FUNÇÕES OPERACIONAIS (ADICIONAR/REMOVER) ---
function adicionarTransacao(dados) {
    const { descricao, valor, data, tipo, origemId, tipoOrigem, parcelas } = dados;
    const numParcelas = parseInt(parcelas) || 1;
    const valorParcela = parseFloat((valor / numParcelas).toFixed(2));
    const groupId = Date.now();

    for (let i = 0; i < numParcelas; i++) {
        let dt = new Date(data + "T00:00:00");
        dt.setMonth(dt.getMonth() + i);
        const dataString = dt.toISOString().split('T')[0];

        let t = {
            id: Date.now() + Math.random(),
            groupId: numParcelas > 1 ? groupId : null,
            descricao: numParcelas > 1 ? `${descricao} (${i + 1}/${numParcelas})` : descricao,
            valor: valorParcela,
            dataCompra: dataString,
            tipo: tipo, // 'receita' ou 'despesa'
            tipoOrigem: tipoOrigem, // 'cartao' ou 'conta'
            origemId: parseInt(origemId)
        };

        if (tipoOrigem === 'cartao') {
            const c = state.cartoes.find(x => x.id === t.origemId);
            const fat = calcularFatura(dataString, c.fechamento, c.vencimento);
            t.mesFatura = fat.mesFatura;
            t.anoFatura = fat.anoFatura;
        } else {
            t.mesFatura = dt.getMonth();
            t.anoFatura = dt.getFullYear();
        }
        state.transacoes.push(t);
    }
    saveData();
}

function zerarLancamentos() {
    if(confirm("Deseja apagar todos os lançamentos? Contas e cartões serão mantidos.")) {
        state.transacoes = [];
        saveData();
    }
}

// --- RENDERIZAÇÃO DA INTERFACE (UI) ---
function renderizarTudo() {
    const m = state.filtro.mes;
    const a = state.filtro.ano;

    document.getElementById('label-mes-ano').innerText = `${NOMES_MESES[m]} ${a}`;

    // Filtrar transações do mês
    const listaMes = state.transacoes.filter(t => t.mesFatura === m && t.anoFatura === a);

    // Calcular Totais
    const receitas = listaMes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
    const despesas = listaMes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
    const saldo = receitas - despesas;

    // Atualizar Painel
    document.getElementById('total-receitas').innerText = receitas.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    document.getElementById('total-despesas').innerText = despesas.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    const resEl = document.getElementById('resultado-mes');
    resEl.innerText = saldo.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    resEl.style.color = saldo >= 0 ? "#34C759" : "#FF3B30";

    renderizarLista(listaMes);
    renderizarGrafico(receitas, despesas, saldo);
}

function renderizarLista(transacoes) {
    const container = document.getElementById('tab-transacoes');
    if(!container) return;
    
    container.innerHTML = '<h2 style="margin:16px">Lançamentos do Mês</h2>';
    
    if(transacoes.length === 0) {
        container.innerHTML += '<p style="text-align:center; color:grey; margin-top:20px">Nenhum lançamento.</p>';
        return;
    }

    let html = '<div class="card"><ul style="list-style:none; padding:0; margin:0">';
    transacoes.forEach(t => {
        const cor = t.tipo === 'receita' ? '#34C759' : '#FF3B30';
        html += `
            <li style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:0.5px solid #eee">
                <div>
                    <strong>${t.descricao}</strong><br>
                    <small style="color:grey">${t.dataCompra.split('-').reverse().join('/')}</small>
                </div>
                <div style="text-align:right; color:${cor}; font-weight:bold">
                    ${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                </div>
            </li>`;
    });
    html += '</ul></div>';
    container.innerHTML += html;
}

// --- GRÁFICO (CHART.JS) ---
let meuGrafico = null;
function renderizarGrafico(rec, des, sal) {
    const ctx = document.getElementById('monthlyChart');
    if(!ctx) return;
    if(meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Entradas', 'Saídas', 'Saldo'],
            datasets: [{
                data: [rec, des, sal],
                backgroundColor: ['#34C759', '#FF3B30', '#007AFF'],
                borderRadius: 8
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// --- EXPORTAÇÃO ---
function exportarTransacoesCSV() {
    let csv = "Data;Descricao;Valor;Tipo\n";
    state.transacoes.forEach(t => {
        csv += `${t.dataCompra};${t.descricao};${t.valor};${t.tipo}\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "meu_financeiro.csv";
    link.click();
}

// --- NAVEGAÇÃO E MODAIS (SIMPLIFICADO) ---
function alterarMes(v) {
    state.filtro.mes += v;
    if (state.filtro.mes > 11) { state.filtro.mes = 0; state.filtro.ano++; }
    if (state.filtro.mes < 0) { state.filtro.mes = 11; state.filtro.ano--; }
    saveData();
}

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    el.classList.add('active');
}

function abrirModal(tipo) {
    const desc = prompt("Descrição:");
    const valor = prompt("Valor (use ponto para centavos):");
    const data = prompt("Data (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
    const parcelas = tipo === 'despesa' ? prompt("Número de parcelas:", "1") : "1";
    
    if(desc && valor) {
        adicionarTransacao({
            descricao: desc,
            valor: parseFloat(valor),
            data: data,
            tipo: tipo,
            origemId: 100, // Salva na conta corrente por padrão neste exemplo
            tipoOrigem: 'conta',
            parcelas: parcelas
        });
    }
}

// Inicializar
window.onload = renderizarTudo;