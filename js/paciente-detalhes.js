// Página de Detalhes do Paciente
document.addEventListener('DOMContentLoaded', function() {
  initializePatientDetailsPage();
});

/** Inicializa a página de detalhes do paciente */
function initializePatientDetailsPage() {
  // Carregar dados do paciente baseado no ID na URL
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');
  
  if (patientId) {
    carregarDadosPaciente(patientId);
  } else {
    showError('ID do paciente não especificado na URL.');
  }
  
  // Configurar abas
  initializeTabs();
  
  // Configurar botões de ação
  initializeActionButtons(patientId);
}

/** Carrega os dados do paciente */
function carregarDadosPaciente(patientId) {
  try {
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientes.find(p => p.id == patientId);
    
    if (paciente) {
      preencherDadosPaciente(paciente);
    } else {
      showError('Paciente não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do paciente:', error);
    showError('Erro ao carregar dados do paciente.');
  }
}

/** Preenche a página com os dados do paciente */
function preencherDadosPaciente(paciente) {
  // Cabeçalho
  document.getElementById('avatar-inicial').textContent = paciente.inicial || (paciente.nome || '?').charAt(0).toUpperCase();
  document.getElementById('patient-name').textContent = paciente.nome || 'Nome não informado';
  document.getElementById('breadcrumb-nome').textContent = paciente.nome || 'Detalhes';
  
  // Meta informações
  document.getElementById('patient-age').textContent = paciente.idade ? `${paciente.idade} anos` : 'Idade não informada';
  document.getElementById('patient-gender').textContent = paciente.sexo || 'Sexo não informado';
  document.getElementById('patient-id').textContent = `ID: ${paciente.id}`;
  
  // Aba de informações
  document.getElementById('info-nome').textContent = paciente.nome || 'Não informado';
  document.getElementById('info-nascimento').textContent = paciente.dataNascimento ? formatarDataExibicao(paciente.dataNascimento) : 'Não informado';
  document.getElementById('info-idade').textContent = paciente.idade ? `${paciente.idade} anos` : 'Não informado';
  document.getElementById('info-sexo').textContent = paciente.sexo || 'Não informado';
  document.getElementById('info-telefone').textContent = paciente.telefone || 'Não informado';
  document.getElementById('info-email').textContent = paciente.email || 'Não informado';
  document.getElementById('info-altura').textContent = paciente.altura ? `${paciente.altura} cm` : 'Não informado';
  document.getElementById('info-peso').textContent = paciente.peso ? `${paciente.peso} kg` : 'Não informado';
  document.getElementById('info-imc').textContent = paciente.imc ? paciente.imc.toFixed(2) : 'Não calculado';
  document.getElementById('info-classificacao').textContent = paciente.classificacao || 'Não classificado';
  document.getElementById('info-observacoes').textContent = paciente.observacoes || 'Nenhuma observação registrada.';
}

/** Formata data para exibição (de yyyy-mm-dd para dd/mm/yyyy) */
function formatarDataExibicao(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Configura o sistema de abas */
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remover classe active de todos os botões e painéis
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Adicionar classe active ao botão e painel clicado
      this.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

/** Configura os botões de ação */
function initializeActionButtons(patientId) {
  const btnEdit = document.getElementById('btn-edit');
  const btnConsulta = document.getElementById('btn-consulta');
  
  if (btnEdit) {
    btnEdit.addEventListener('click', function() {
      window.location.href = `pacientes.html?edit=${patientId}`;
    });
  }
  
  if (btnConsulta) {
    btnConsulta.addEventListener('click', function() {
      // Aqui você pode redirecionar para uma página de agendamento ou abrir um modal
      alert('Funcionalidade de nova consulta será implementada aqui.');
    });
  }
}

/** Exibe mensagem de erro */
function showError(mensagem) {
  const header = document.querySelector('.patient-header-info');
  if (header) {
    header.querySelector('h2').textContent = 'Erro ao carregar paciente';
    header.querySelector('.patient-meta').innerHTML = `<span style="color: #e74c3c;">${mensagem}</span>`;
  }
  
  // Desabilitar botões de ação
  document.getElementById('btn-edit').disabled = true;
  document.getElementById('btn-consulta').disabled = true;
}

// Fallback para utilitários, caso não existam no projeto
if (typeof showNotification !== 'function') {
  function showNotification(msg, type='info') { 
    console.log(`[${type}] ${msg}`);
    alert(msg);
  }
}