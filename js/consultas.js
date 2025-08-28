let consultas = [];
let consultaEmEdicao = null;
let consultaIdParaExcluir = null;
let termoPesquisa = '';
let dataInicio = '';
let dataFim = '';



document.addEventListener('DOMContentLoaded', function() {
  carregarConsultas();
  initializeActions();
  initializeSearch();
  initializeFilters(); 
});



function carregarConsultas() {
  consultas = JSON.parse(localStorage.getItem('consultas')) || [];
  renderizarConsultas();
}

function renderizarConsultas(lista = consultas) {
  const list = document.querySelector('.consultas-list');
  const header = list.querySelector('.list-header');
  list.innerHTML = '';
  if (header) list.appendChild(header);

  if (!lista.length) {
    const msg = document.createElement('div');
    msg.textContent = "Nenhuma consulta encontrada.";
    msg.style.padding = "20px";
    msg.style.textAlign = "center";
    msg.style.color = "#777";
    list.appendChild(msg);
    return;
  }

  lista.forEach(c => {
    const item = document.createElement('div');
    item.className = "consulta-item";
    item.dataset.id = c.id;
    item.innerHTML = `
      <div>${c.paciente}</div>
      <div>${c.data}</div>
      <div>${c.hora}</div>
      <div>${c.tipo}</div>
      <div class="consulta-actions">
        <button class="btn-view" title="Visualizar"><i class="fas fa-eye"></i></button>
        <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
      </div>
    `;
    list.appendChild(item);
  });

  initializeActions();
}


function initializeActions() {
  // Botão adicionar
  document.querySelector('.btn-add-consulta')?.addEventListener('click', abrirModal);

  // Fechar modal
  document.querySelector('#consultaModal .close')?.addEventListener('click', fecharModal);
  document.getElementById('cancelButton')?.addEventListener('click', fecharModal);

  // Submeter formulário
  document.getElementById('consultaForm')?.addEventListener('submit', salvarConsulta);

  // Ações dos itens
  document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', editarConsulta));
  document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', confirmarExclusao));
  document.querySelectorAll('.btn-view').forEach(btn => btn.addEventListener('click', visualizarConsulta));

  // Modal de exclusão
  document.getElementById('cancelConfirmButton')?.addEventListener('click', fecharConfirmModal);
  document.getElementById('confirmDeleteButton')?.addEventListener('click', excluirConsulta);
}

function abrirModal() {
  document.getElementById('consultaForm').reset();
  document.getElementById('consultaId').value = '';
  document.getElementById('tituloModalConsulta').textContent = "Agendar Consulta";

  carregarPacientesNoSelect(); // <<< carrega pacientes

  document.getElementById('consultaModal').style.display = "flex";
}


function fecharModal() {
  document.getElementById('consultaModal').style.display = "none";
  consultaEmEdicao = null;
}

function salvarConsulta(e) {
  e.preventDefault();
  const form = new FormData(this);
  const id = document.getElementById('consultaId').value;

  const consulta = {
    id: id ? parseInt(id) : Date.now(),
    paciente: form.get('paciente'),
    data: form.get('data'),
    hora: form.get('hora'),
    tipo: form.get('tipo'),
    observacoes: form.get('observacoes')
  };

  if (id) {
    const idx = consultas.findIndex(c => c.id == id);
    consultas[idx] = consulta;
  } else {
    consultas.push(consulta);
  }

  localStorage.setItem('consultas', JSON.stringify(consultas));
  fecharModal();
  renderizarConsultas();
}

function editarConsulta(e) {
  e.stopPropagation();
  const id = this.closest('.consulta-item').dataset.id;
  const consulta = consultas.find(c => c.id == id);
  if (!consulta) return;

  carregarPacientesNoSelect(); // <<< garante que select esteja atualizado

  document.getElementById('consultaId').value = consulta.id;
  document.getElementById('paciente').value = consulta.paciente;
  document.getElementById('data').value = consulta.data;
  document.getElementById('hora').value = consulta.hora;
  document.getElementById('tipo').value = consulta.tipo;
  document.getElementById('observacoes').value = consulta.observacoes;
  document.getElementById('tituloModalConsulta').textContent = "Editar Consulta";
  document.getElementById('consultaModal').style.display = "flex";
}


function confirmarExclusao(e) {
  e.stopPropagation();
  const id = this.closest('.consulta-item').dataset.id;
  consultaIdParaExcluir = id;
  document.getElementById('confirmModal').style.display = "flex";
}

function fecharConfirmModal() {
  document.getElementById('confirmModal').style.display = "none";
  consultaIdParaExcluir = null;
}

function excluirConsulta() {
  if (!consultaIdParaExcluir) return;
  consultas = consultas.filter(c => c.id != consultaIdParaExcluir);
  localStorage.setItem('consultas', JSON.stringify(consultas));
  fecharConfirmModal();
  renderizarConsultas();
}

function visualizarConsulta(e) {
  e.stopPropagation();
  const id = this.closest('.consulta-item').dataset.id;
  const consulta = consultas.find(c => c.id == id);
  if (!consulta) return;

  document.getElementById('detalhePaciente').value = consulta.paciente;
  document.getElementById('detalheData').value = consulta.data;
  document.getElementById('detalheHora').value = consulta.hora;
  document.getElementById('detalheTipo').value = consulta.tipo;
  document.getElementById('detalheObservacoes').value = consulta.observacoes || '';

  document.getElementById('consultaDetalhesModal').style.display = "flex";
}

// Fechar modal de detalhes
document.getElementById('closeDetalhesModal')?.addEventListener('click', () => {
  document.getElementById('consultaDetalhesModal').style.display = "none";
});


function carregarPacientesNoSelect() {
  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
  const select = document.getElementById('paciente');
  if (!select) return;

  // limpa opções
  select.innerHTML = '<option value="">Selecione um paciente</option>';

  pacientes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nome;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}

function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  if (!searchInput || !searchButton) return;

  searchButton.addEventListener('click', () => realizarPesquisa(searchInput.value));
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') realizarPesquisa(this.value);
  });
  searchInput.addEventListener('input', function(e) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => realizarPesquisa(e.target.value), 300);
  });
}

function realizarPesquisa(termo) {
  termoPesquisa = (termo || '').toLowerCase().trim();
  aplicarFiltros();
}

function aplicarFiltros() {
  let consultasFiltradas = [...consultas];

  // filtro por nome do paciente
  if (termoPesquisa) {
    consultasFiltradas = consultasFiltradas.filter(c =>
      (c.paciente || '').toLowerCase().includes(termoPesquisa)
    );
  }

  // filtro por intervalo de datas
  if (dataInicio) {
    consultasFiltradas = consultasFiltradas.filter(c => c.data >= dataInicio);
  }
  if (dataFim) {
    consultasFiltradas = consultasFiltradas.filter(c => c.data <= dataFim);
  }

  renderizarConsultas(consultasFiltradas);
}


function initializeFilters() {
  const inicioInput = document.getElementById('filtroDataInicio');
  const fimInput = document.getElementById('filtroDataFim');
  const aplicarBtn = document.getElementById('btnAplicarFiltro');
  const limparBtn = document.getElementById('btnLimparFiltro');

  aplicarBtn?.addEventListener('click', () => {
    dataInicio = inicioInput.value;
    dataFim = fimInput.value;
    aplicarFiltros();
  });

  limparBtn?.addEventListener('click', () => {
    inicioInput.value = '';
    fimInput.value = '';
    dataInicio = '';
    dataFim = '';
    aplicarFiltros();
  });
}


// Validação de data para não permitir datas anteriores à atual
document.addEventListener('DOMContentLoaded', function() {
  // Definir a data mínima como hoje no campo de data
  const dataInput = document.getElementById('data');
  const hoje = new Date().toISOString().split('T')[0];
  dataInput.setAttribute('min', hoje);
  
  // Validação adicional no envio do formulário
  const consultaForm = document.getElementById('consultaForm');
  if (consultaForm) {
    consultaForm.addEventListener('submit', function(e) {
      const dataSelecionada = dataInput.value;
      
      // Verificar se a data selecionada é anterior à data atual
      if (dataSelecionada < hoje) {
        e.preventDefault();
        document.getElementById('dataValidation').textContent = 'Não é possível agendar consultas para datas anteriores a hoje.';
        dataInput.focus();
        
        // Adicionar classe de erro
        dataInput.classList.add('input-error');
      }
    });
    
    // Limpar mensagem de validação quando o usuário alterar a data
    dataInput.addEventListener('input', function() {
      document.getElementById('dataValidation').textContent = '';
      dataInput.classList.remove('input-error');
    });
  }
  
  // Validação em tempo real para o campo de data
  if (dataInput) {
    dataInput.addEventListener('change', function() {
      const dataSelecionada = this.value;
      
      if (dataSelecionada < hoje) {
        document.getElementById('dataValidation').textContent = 'Não é possível agendar consultas para datas anteriores a hoje.';
        this.classList.add('input-error');
      } else {
        document.getElementById('dataValidation').textContent = '';
        this.classList.remove('input-error');
      }
    });
  }
});