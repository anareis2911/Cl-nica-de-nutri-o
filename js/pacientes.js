// Funcionalidades específicas da página de pacientes

// Variáveis globais
let pacientes = [];
let pacienteFiltrado = [];
let letraFiltroAtual = 'TODOS';
let termoPesquisa = '';

document.addEventListener('DOMContentLoaded', function() {
    initializePacientesPage();
    carregarPacientes();
});

/**
 * Inicializa a página de pacientes
 */
function initializePacientesPage() {
    initializeSearch();
    initializeAlphabetFilter();
    initializePatientActions();
    initializeAddButton();
}

/**
 * Configura a funcionalidade de pesquisa
 */
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput && searchButton) {
        // Pesquisa ao clicar no botão
        searchButton.addEventListener('click', function() {
            realizarPesquisa(searchInput.value);
        });
        
        // Pesquisa ao pressionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarPesquisa(this.value);
            }
        });
        
        // Pesquisa em tempo real (opcional)
        searchInput.addEventListener('input', function(e) {
            // Para não sobrecarregar, podemos usar um debounce
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                realizarPesquisa(e.target.value);
            }, 300);
        });
    }
}

/**
 * Configura os filtros alfabéticos
 */
function initializeAlphabetFilter() {
    const filters = document.querySelectorAll('.letter-filter');
    
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove a classe ativa de todos os filtros
            filters.forEach(f => f.classList.remove('active'));
            
            // Adiciona a classe ativa ao filtro clicado
            this.classList.add('active');
            
            // Atualiza o filtro
            letraFiltroAtual = this.textContent;
            aplicarFiltros();
        });
    });
}

/**
 * Configura o botão de adicionar paciente
 */
function initializeAddButton() {
    const addButton = document.querySelector('.btn-add-patient');
    if (addButton) {
        addButton.addEventListener('click', function() {
            adicionarPaciente();
        });
    }
}

/**
 * Configura as ações dos pacientes (visualizar, editar, etc)
 */
function initializePatientActions() {
    // Os event listeners serão adicionados dinamicamente quando os pacientes forem renderizados
}

/**
 * Carrega a lista de pacientes do localStorage
 */
function carregarPacientes() {
    try {
        pacientes = getFromStorage('pacientes') || [];
        renderizarPacientes(pacientes);
        
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        showNotification('Erro ao carregar lista de pacientes', 'error');
    }
}

/**
 * Realiza a pesquisa de pacientes
 */
function realizarPesquisa(termo) {
    termoPesquisa = termo.toLowerCase().trim();
    aplicarFiltros();
}

/**
 * Aplica todos os filtros ativos (pesquisa + alfabético)
 */
function aplicarFiltros() {
    let pacientesFiltrados = [...pacientes];
    
    // Aplicar filtro de pesquisa
    if (termoPesquisa) {
        pacientesFiltrados = pacientesFiltrados.filter(paciente => 
            paciente.nome.toLowerCase().includes(termoPesquisa) ||
            paciente.email.toLowerCase().includes(termoPesquisa) ||
            paciente.telefone.includes(termoPesquisa)
        );
    }
    
    // Aplicar filtro alfabético
    if (letraFiltroAtual !== 'TODOS') {
        pacientesFiltrados = pacientesFiltrados.filter(paciente => 
            paciente.inicial === letraFiltroAtual
        );
    }
    
    pacienteFiltrado = pacientesFiltrados;
    renderizarPacientes(pacientesFiltrados);
}

/**
 * Renderiza a lista de pacientes na UI
 */
function renderizarPacientes(pacientes) {
    const patientsList = document.querySelector('.patients-list');
    if (!patientsList) return;
    
    // Limpa a lista atual (exceto o cabeçalho)
    const header = patientsList.querySelector('.list-header');
    patientsList.innerHTML = '';
    if (header) patientsList.appendChild(header);
    
    if (pacientes.length === 0) {
        // Exibe mensagem quando não há pacientes
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Nenhum paciente encontrado.';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#777';
        patientsList.appendChild(emptyMessage);
        return;
    }
    
    // Adiciona cada paciente à lista
    pacientes.forEach(paciente => {
        const patientItem = criarElementoPaciente(paciente);
        patientsList.appendChild(patientItem);
    });
    
    // Reconfigura os event listeners para as ações
    initializePatientActions();
}

/**
 * Cria o elemento HTML para um paciente
 */
function criarElementoPaciente(paciente) {
    const patientItem = document.createElement('div');
    patientItem.className = 'patient-item';
    patientItem.dataset.id = paciente.id;
    
    patientItem.innerHTML = `
        <div class="patient-info">
            <div class="patient-avatar">${paciente.inicial}</div>
            <div class="patient-details">
                <div class="patient-name">${paciente.nome}</div>
                <div class="patient-age">${paciente.idade} anos</div>
            </div>
        </div>
        <div class="patient-contact">
            <div class="contact-email">${paciente.email}</div>
            <div class="contact-phone">${paciente.telefone}</div>
        </div>
        <div class="last-appointment">${formatDate(paciente.ultimaConsulta)}</div>
        <div class="patient-actions">
            <button class="btn-view" title="Visualizar"><i class="fas fa-eye"></i></button>
            <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    return patientItem;
}

/**
 * Configura as ações para os botões de cada paciente
 */
function initializePatientActions() {
    // Botão Visualizar
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const patientId = this.closest('.patient-item').dataset.id;
            visualizarPaciente(patientId);
        });
    });
    
    // Botão Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const patientId = this.closest('.patient-item').dataset.id;
            editarPaciente(patientId);
        });
    });
    
    // Botão Excluir
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const patientId = this.closest('.patient-item').dataset.id;
            excluirPaciente(patientId);
        });
    });
    
    // Clicar em um paciente (linha inteira)
    document.querySelectorAll('.patient-item').forEach(item => {
        item.addEventListener('click', function() {
            const patientId = this.dataset.id;
            visualizarPaciente(patientId);
        });
    });
}

/**
 * Abre a visualização de um paciente
 */
function visualizarPaciente(id) {
    const paciente = pacientes.find(p => p.id == id);
    if (paciente) {
        // Redireciona para a página de detalhes do paciente
        window.location.href = `paciente-detalhes.html?id=${id}`;
    }
}

/**
 * Abre a edição de um paciente
 */
function editarPaciente(id) {
    const paciente = pacientes.find(p => p.id == id);
    if (paciente) {
        // Redireciona para a página de edição do paciente
        window.location.href = `paciente-editar.html?id=${id}`;
    }
}

/**
 * Exclui um paciente após confirmação
 */
function excluirPaciente(id) {
    const paciente = pacientes.find(p => p.id == id);
    if (paciente && confirm(`Tem certeza que deseja excluir o paciente ${paciente.nome}?`)) {
        // Remove o paciente da lista
        pacientes = pacientes.filter(p => p.id != id);
        
        // Salva no localStorage
        saveToStorage('pacientes', pacientes);
        
        // Recarrega a lista
        carregarPacientes();
        
        showNotification('Paciente excluído com sucesso', 'success');
    }
}

/**
 * Adiciona um novo paciente (exemplo)
 */
function adicionarPaciente() {
    // Obter o próximo ID disponível
    const nextId = parseInt(localStorage.getItem('nextPacienteId') || '7');
    
    // Criar um novo paciente (em uma aplicação real, isso viria de um formulário)
    const novoPaciente = {
        id: nextId,
        nome: `Novo Paciente ${nextId}`,
        idade: Math.floor(Math.random() * 50) + 18,
        email: `paciente${nextId}@email.com`,
        telefone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        ultimaConsulta: new Date().toISOString().split('T')[0],
        inicial: "N"
    };
    
    // Adicionar à lista
    pacientes.push(novoPaciente);
    
    // Salvar no localStorage
    saveToStorage('pacientes', pacientes);
    localStorage.setItem('nextPacienteId', (nextId + 1).toString());
    
    // Recarregar a lista
    carregarPacientes();
    
    showNotification('Paciente adicionado com sucesso', 'success');
}

/**
 * Exporta a lista de pacientes para CSV
 */
function exportarParaCSV() {
    if (pacienteFiltrado.length === 0) {
        showNotification('Nenhum paciente para exportar', 'warning');
        return;
    }
    
    // Cabeçalhos do CSV
    let csv = 'Nome,Idade,Email,Telefone,Última Consulta\n';
    
    // Adiciona cada paciente
    pacienteFiltrado.forEach(paciente => {
        csv += `"${paciente.nome}",${paciente.idade},"${paciente.email}","${paciente.telefone}","${formatDate(paciente.ultimaConsulta)}"\n`;
    });
    
    // Cria um link de download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pacientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Lista de pacientes exportada com sucesso', 'success');
}

// Adiciona a função de exportação ao escopo global para ser acessível por botões HTML
window.exportarParaCSV = exportarParaCSV;