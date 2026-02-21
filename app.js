let state = JSON.parse(localStorage.getItem('finance_data_v2')) || {
    transacoes: [],
    cartoes: [
        { id: 1, nome: "Nubank", fechamento: 5, vencimento: 12, cor: "#8A05BE", limite: 2000 }
    ],
    contas: [
        { id: 100, nome: "Carteira", saldoInicial: 0, cor: "#007AFF" }
    ],
    filtro: { mes: new Date().getMonth(), ano: 2026 }
};

function saveData() {
    localStorage.setItem('finance_data_v2', JSON.stringify(state));
    renderizarTudo();
}

// --- GESTÃO DE CARTEIRA ---
function addNovoCartao() {
    const nome = prompt("Nome do Cartão (ex: Inter):");
    const fechamento = prompt("Dia de Fechamento (1-31):");
    const vencimento = prompt("Dia de Vencimento (1-31):");
    if(nome && fechamento && vencimento) {
        state.cartoes.push({
            id: Date.now(),
            nome,
            fechamento: parseInt(fechamento),
            vencimento: parseInt(vencimento),
            cor: "#333"
        });
        saveData();
    }
}

function addNovaConta() {
    const nome = prompt("Nome da Conta (ex: Banco do Brasil):");
    if(nome) {
        state.contas.push({
            id: Date.now(),
            nome,
            cor: "#007AFF"
        });
        saveData();
    }
}

// --- LOGICA DE LANÇAMENTO ---
function abrirModalAdd(tipo) {
    const desc = prompt("O que foi?");
    const valor = prompt("Quanto? (use ponto para centavos)");
    const data = prompt("Data (AAAA-MM-DD)", new Date().toISOString().split('T')[0]);
    
    let origemMsg = tipo === 'despesa' ? 
        "Onde gastou?\n" + state.contas.map((c,i)=>`${i}: ${c.nome}`).join("\n") + "\nOU\n" + state.cartoes.map((c,i)=>`C${i}: ${c.nome}`).join("\n") :
        "Onde recebeu?\n" + state.contas.map((c,i)=>`${i}: ${c.nome}`).join("\n");
        
    const origemIdx = prompt(origemMsg);
    
    if(desc && valor && data) {
        let novaTrans = {
            id: Date.now(),
            descricao: desc,
            valor: parseFloat(valor),
            dataCompra: data,
            tipo: tipo
        };

        if(origemIdx.startsWith('C')) {
            const idx = parseInt(origemIdx.substring(1));
            const cartao = state.cartoes[idx];
            novaTrans.tipoOrigem = 'cartao';
            novaTrans.origemId = cartao.id;
            // Regra da Fatura
            const d = new Date(data + "T00:00:00");
            let mF = d.getMonth();
            let aF = d.getFullYear();
            if(d.getDate() >= cartao.fechamento) {
                mF++; if(mF > 11) { mF=0; aF++; }
            }
            novaTrans.mesFatura = mF;
            novaTrans.anoFatura = aF;
        } else {
            const conta = state.contas[parseInt(origemIdx)];
            novaTrans.tipoOrigem = 'conta';
            novaTrans.origemId = conta.id;
            const d = new Date(data + "T00:00:00");
            novaTrans.mesFatura = d.getMonth();
            novaTrans.anoFatura = d.getFullYear();
        }

        state.transacoes.push(novaTrans);
        saveData();
    }
}

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    el.classList.add('active');
    renderizarTudo();
}

function alterarMes(v) {
    state.filtro.mes += v;
    if(state.filtro.mes > 11) { state.filtro.mes = 0; state.filtro.ano++; }
    if(state.filtro.mes < 0) { state.filtro.mes = 11; state.filtro.ano--; }
    saveData();
}

// --- RENDERIZADORES ---
function renderizarTudo() {
    const m = state.filtro.mes;
    const a = state.filtro.ano;
    document.getElementById('label-mes-ano').innerText = `${NOMES_MESES[m]} ${a}`;

    const listaMes = state.transacoes.filter(t => t.mesFatura === m && t.anoFatura === a);
    const rec = listaMes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
    const desp = listaMes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

    document.getElementById('resultado-mes').innerText = (rec - desp).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    document.getElementById('total-receitas').innerText = rec.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    document.getElementById('total-despesas').innerText = desp.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

    // Renderizar Listas de Configuração
    const listaC = document.getElementById('lista-cartoes-config');
    if(listaC) {
        listaC.innerHTML = state.cartoes.map(c => `
            <div class="ios-list-item">
                <span>${c.nome} (Fecha dia ${c.fechamento})</span>
                <button onclick="removerCartao(${c.id})" style="color:red; background:none; border:none">Excluir</button>
            </div>
        `).join('');
    }

    const listaConta = document.getElementById('lista-contas-config');
    if(listaConta) {
        listaConta.innerHTML = state.contas.map(c => `
            <div class="ios-list-item">
                <span>${c.nome}</span>
                <button onclick="removerConta(${c.id})" style="color:red; background:none; border:none">Excluir</button>
            </div>
        `).join('');
    }

    const hist = document.getElementById('lista-transacoes-container');
    if(hist) {
        hist.innerHTML = listaMes.map(t => `
            <div class="ios-list-item">
                <div><strong>${t.descricao}</strong><br><small>${t.dataCompra}</small></div>
                <span style="color:${t.tipo==='receita'?'green':'red'}">${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
            </div>
        `).join('');
    }

    renderGrafico(rec, desp);
}

let myChart;
function renderGrafico(r, d) {
    const ctx = document.getElementById('monthlyChart');
    if(!ctx) return;
    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [r, d],
                backgroundColor: ['#34C759', '#FF3B30'],
                borderWidth: 0
            }]
        },
        options: { cutout: '80%' }
    });
}

const NOMES_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
window.onload = renderizarTudo;