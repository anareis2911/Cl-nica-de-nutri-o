// --- Página de Pacientes ---
// Mantido do seu original + inclusão do modal e ajustes do botão no rodapé
// Fallbacks seguros para utilitários, caso não existam no projeto
if (typeof getFromStorage !== 'function') {
  function getFromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
}
if (typeof saveToStorage !== 'function') {
  function saveToStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
}
if (typeof formatDate !== 'function') {
  function formatDate(iso) {
    if (!iso) return '';
    const [y,m,d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }
}
if (typeof showNotification !== 'function') {
  function showNotification(msg, type='info') { console.log(`[${type}] ${msg}`); }
}

// Variáveis globais
let pacientes = [];
let pacienteFiltrado = [];
let letraFiltroAtual = 'TODOS';
let termoPesquisa = '';
let pacienteIdParaExcluir = null;
let modoEdicao = false;
let pacienteEmEdicao = null;

document.addEventListener('DOMContentLoaded', function() {
  initializePacientesPage();
  carregarPacientes();
});

/** Inicializa a página de pacientes */
function initializePacientesPage() {
  initializeSearch();
  initializeAlphabetFilter();
  initializePatientActions();
  initializePatientModal();
  initializeConfirmModal();
}

/** Pesquisa */
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

/** Filtro alfabético */
function initializeAlphabetFilter() {
  const filters = document.querySelectorAll('.letter-filter');
  if (!filters.length) return;

  filters.forEach(filter => {
    filter.addEventListener('click', function() {
      filters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      letraFiltroAtual = this.textContent;
      aplicarFiltros();
    });
  });
}

/** Carrega pacientes del storage */
function carregarPacientes() {
  try {
    pacientes = getFromStorage('pacientes') || [];
    pacienteFiltrado = [...pacientes];
    renderizarPacientes(pacientes);
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    showNotification('Erro ao carregar lista de pacientes', 'error');
  }
}

/** Pesquisa */
function realizarPesquisa(termo) {
  termoPesquisa = (termo || '').toLowerCase().trim();
  aplicarFiltros();
}

/** Aplica pesquisa + filtro alfabético */
function aplicarFiltros() {
  let pacientesFiltrados = [...pacientes];

  if (termoPesquisa) {
    pacientesFiltrados = pacientesFiltrados.filter(p =>
      (p.nome || '').toLowerCase().includes(termoPesquisa) ||
      (p.email || '').toLowerCase().includes(termoPesquisa) ||
      (p.telefone || '').includes(termoPesquisa)
    );
  }

  if (letraFiltroAtual !== 'TODOS') {
    pacientesFiltrados = pacientesFiltrados.filter(p => p.inicial === letraFiltroAtual);
  }

  pacienteFiltrado = pacientesFiltrados;
  renderizarPacientes(pacientesFiltrados);
}

/** Renderiza lista */
function renderizarPacientes(lista) {
  const patientsList = document.querySelector('.patients-list');
  if (!patientsList) return;

  // preserva o cabeçalho
  const header = patientsList.querySelector('.list-header');
  patientsList.innerHTML = '';
  if (header) patientsList.appendChild(header);

  if (!lista.length) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Nenhum paciente encontrado.';
    emptyMessage.style.padding = '20px';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#777';
    patientsList.appendChild(emptyMessage);
    return;
  }

  lista.forEach(p => patientsList.appendChild(criarElementoPaciente(p)));
  initializePatientActions();
}

/** Cria item da lista */
function criarElementoPaciente(paciente) {
  const el = document.createElement('div');
  el.className = 'patient-item';
  el.dataset.id = paciente.id;
  el.innerHTML = `
    <div class="patient-info">
      <div class="patient-avatar">${paciente.inicial || (paciente.nome || '?').charAt(0).toUpperCase()}</div>
      <div class="patient-details">
        <div class="patient-name">${paciente.nome || ''}</div>
        <div class="patient-age">${paciente.idade ? `${paciente.idade} anos` : ''}</div>
      </div>
    </div>
    <div class="patient-contact">
      <div class="contact-email">${paciente.email || ''}</div>
      <div class="contact-phone">${paciente.telefone || ''}</div>
    </div>
    <div class="last-appointment">${formatDate(paciente.ultimaConsulta)}</div>
    <div class="patient-actions">
      <button class="btn-view" title="Visualizar"><i class="fas fa-eye"></i></button>
      <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
      <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
    </div>
  `;
  return el;
}

/** Ações dos itens */
function initializePatientActions() {
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.closest('.patient-item').dataset.id;
      visualizarPaciente(id);
    });
  });

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.closest('.patient-item').dataset.id;
      editarPaciente(id);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.closest('.patient-item').dataset.id;
      excluirPaciente(id);
    });
  });

  document.querySelectorAll('.patient-item').forEach(item => {
    item.addEventListener('click', function() {
      visualizarPaciente(this.dataset.id);
    });
  });
}

/** Navega para detalhes */
function visualizarPaciente(id) {
  const paciente = pacientes.find(p => p.id == id);
  if (paciente) {
    window.location.href = `paciente-detalhes.html?id=${id}`;
  } else {
    showNotification('Paciente não encontrado', 'error');
  }
}

/** Abre o modal para edição */
function editarPaciente(id) {
  const paciente = pacientes.find(p => p.id == id);
  if (!paciente) return;
  
  pacienteEmEdicao = paciente;
  modoEdicao = true;
  
  // Preencher o formulário com os dados do paciente
  document.getElementById('pacienteId').value = paciente.id;
  document.getElementById('nome').value = paciente.nome || '';
  document.getElementById('dataNascimento').value = paciente.dataNascimento || '';
  document.getElementById('idade').value = paciente.idade || '';
  document.getElementById('sexo').value = paciente.sexo || '';
  document.getElementById('telefone').value = paciente.telefone || '';
  document.getElementById('email').value = paciente.email || '';
  document.getElementById('altura').value = paciente.altura || '';
  document.getElementById('peso').value = paciente.peso || '';
  document.getElementById('imc').value = paciente.imc || '';
  document.getElementById('classificacao').value = paciente.classificacao || '';
  document.getElementById('observacoes').value = paciente.observacoes || '';
  
  // Atualizar o título do modal
  document.getElementById('tituloModalPaciente').textContent = 'Editar Paciente';
  
  // Adicionar indicador de modo de edição
  let editIndicator = document.querySelector('.edit-mode-indicator');
  if (!editIndicator) {
    editIndicator = document.createElement('div');
    editIndicator.className = 'edit-mode-indicator';
    editIndicator.innerHTML = '<i class="fas fa-edit"></i> Modo de Edição';
    document.querySelector('.modal-content').insertBefore(editIndicator, document.getElementById('patientForm'));
  }
  
  // Abrir o modal
  document.getElementById('patientModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/** Exclui paciente usando modal de confirmação */
function excluirPaciente(id) {
  const paciente = pacientes.find(p => p.id == id);
  if (!paciente) return;
  
  pacienteIdParaExcluir = id;
  
  // Configurar e exibir o modal de confirmação
  const confirmModal = document.getElementById('confirmModal');
  const confirmMessage = document.getElementById('confirmMessage');
  const cancelButton = document.getElementById('cancelConfirmButton');
  const confirmButton = document.getElementById('confirmDeleteButton');
  
  confirmMessage.textContent = `Tem certeza que deseja excluir o paciente ${paciente.nome}?`;
  confirmModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Configurar eventos dos botões
  const closeModal = () => {
    confirmModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    pacienteIdParaExcluir = null;
  };
  
  cancelButton.onclick = closeModal;
  confirmButton.onclick = () => {
    if (pacienteIdParaExcluir) {
      pacientes = pacientes.filter(p => p.id != pacienteIdParaExcluir);
      saveToStorage('pacientes', pacientes);
      carregarPacientes();
      showNotification('Paciente excluído com sucesso', 'success');
    }
    closeModal();
  };
  
  // Fechar ao clicar fora del modal
  window.onclick = function(event) {
    if (event.target === confirmModal) {
      closeModal();
    }
  };
}

/** Inicializa o modal de confirmação */
function initializeConfirmModal() {
  // Os event listeners são configurados na função excluirPaciente
}

/** --- Modal de Cadastro --- */
function initializePatientModal() {
  const modal = document.getElementById('patientModal');
  const btnAdd = document.querySelector('.btn-add-patient');
  const spanClose = document.querySelector('.modal .close');
  const cancelBtn = document.getElementById('cancelButton');
  const form = document.getElementById('patientForm');

  if (!modal || !btnAdd || !spanClose || !cancelBtn || !form) return;

  const open = () => { 
    resetarModal();
    modal.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
    // Focar no primeiro campo ao abrir o modal
    setTimeout(() => document.getElementById('nome').focus(), 100);
  };
  
  const close = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetarModal();
  };
  
  const resetarModal = () => {
    form.reset();
    // Limpar mensajes de validación
    document.querySelectorAll('.validation-message').forEach(el => {
      el.textContent = '';
    });
    const imc = document.getElementById('imc'); if (imc) imc.value = '';
    const cls = document.getElementById('classificacao'); if (cls) cls.value = '';
    const idade = document.getElementById('idade'); if (idade) idade.value = '';
    document.getElementById('pacienteId').value = '';
    
    // Restaurar título padrão
    document.getElementById('tituloModalPaciente').textContent = 'Cadastrar Paciente';
    
    // Remover indicador de edição se existir
    const editIndicator = document.querySelector('.edit-mode-indicator');
    if (editIndicator) {
      editIndicator.remove();
    }
    
    modoEdicao = false;
    pacienteEmEdicao = null;
  };

  btnAdd.addEventListener('click', open);
  spanClose.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  window.addEventListener('click', e => { if (e.target === modal) close(); });

  // Calcular idade a partir da data de nascimento
  const dataNascimentoEl = document.getElementById('dataNascimento');
  if (dataNascimentoEl) {
    dataNascimentoEl.addEventListener('change', calcularIdade);
  }

  // IMC automático
  const alturaEl = document.getElementById('altura');
  const pesoEl = document.getElementById('peso');
  [alturaEl, pesoEl].forEach(el => el && el.addEventListener('input', calcularIMC));

  // Adicionar máscara de telefone
  const telefoneEl = document.getElementById('telefone');
  if (telefoneEl) {
    telefoneEl.addEventListener('input', formatarTelefone);
  }

  // Validação de email
  const emailEl = document.getElementById('email');
  if (emailEl) {
    emailEl.addEventListener('blur', validarEmail);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (validarFormulario()) {
      if (modoEdicao) {
        atualizarPaciente();
      } else {
        salvarPaciente();
      }
      close();
    }
  });
}

/** Calcula idade a partir da data de nascimento */
function calcularIdade() {
  const dataNascimento = document.getElementById('dataNascimento').value;
  const idadeEl = document.getElementById('idade');
  
  if (!dataNascimento || !idadeEl) return;
  
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  idadeEl.value = idade;
}

/** Formata o número de telefone */
function formatarTelefone(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  if (value.length > 11) {
    value = value.slice(0, 11);
  }
  
  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  e.target.value = value;
}

/** Valida o formato do email */
function validarEmail() {
  const email = document.getElementById('email').value;
  const emailValidation = document.getElementById('emailValidation');
  
  if (!email) {
    emailValidation.textContent = '';
    return true;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailValidation.textContent = 'Por favor, insira um email válido';
    return false;
  }
  
  emailValidation.textContent = '';
  return true;
}

/** Valida todo o formulário antes de enviar */
function validarFormulario() {
  let isValid = true;
  
  // Validar nome
  const nome = document.getElementById('nome');
  const nomeValidation = document.getElementById('nomeValidation');
  if (!nome.value.trim()) {
    nomeValidation.textContent = 'O nome é obrigatório';
    isValid = false;
  } else {
    nomeValidation.textContent = '';
  }
  
  // Validar data de nascimento
  const dataNascimento = document.getElementById('dataNascimento');
  const dataNascimentoValidation = document.getElementById('dataNascimentoValidation');
  if (!dataNascimento.value) {
    dataNascimentoValidation.textContent = 'A data de nascimento é obrigatória';
    isValid = false;
  } else {
    // Verificar se a data é futura
    const hoje = new Date();
    const nascimento = new Date(dataNascimento.value);
    if (nascimento > hoje) {
      dataNascimentoValidation.textContent = 'A data de nascimento não pode ser futura';
      isValid = false;
    } else {
      dataNascimentoValidation.textContent = '';
    }
  }
  
  // Validar sexo
  const sexo = document.getElementById('sexo');
  const sexoValidation = document.getElementById('sexoValidation');
  if (!sexo.value) {
    sexoValidation.textContent = 'O sexo é obrigatório';
    isValid = false;
  } else {
    sexoValidation.textContent = '';
  }
  
  // Validar telefone
  const telefone = document.getElementById('telefone');
  const telefoneValidation = document.getElementById('telefoneValidation');
  const telefoneNumeros = telefone.value.replace(/\D/g, '');
  if (!telefoneNumeros) {
    telefoneValidation.textContent = 'O telefone é obrigatório';
    isValid = false;
  } else if (telefoneNumeros.length < 10) {
    telefoneValidation.textContent = 'Telefone incompleto';
    isValid = false;
  } else {
    telefoneValidation.textContent = '';
  }
  
  // Validar altura
  const altura = document.getElementById('altura');
  const alturaValidation = document.getElementById('alturaValidation');
  if (!altura.value || parseFloat(altura.value) <= 0) {
    alturaValidation.textContent = 'Altura inválida';
    isValid = false;
  } else {
    alturaValidation.textContent = '';
  }
  
  // Validar peso
  const peso = document.getElementById('peso');
  const pesoValidation = document.getElementById('pesoValidation');
  if (!peso.value || parseFloat(peso.value) <= 0) {
    pesoValidation.textContent = 'Peso inválido';
    isValid = false;
  } else {
    pesoValidation.textContent = '';
  }
  
  // Validar email
  if (!validarEmail()) {
    isValid = false;
  }
  
  return isValid;
}

/** Calcula IMC */
function calcularIMC() {
  const altura = parseFloat((document.getElementById('altura')?.value || 0)) / 100;
  const peso = parseFloat((document.getElementById('peso')?.value || 0));
  const outIMC = document.getElementById('imc');
  const outClass = document.getElementById('classificacao');

  if (altura && peso) {
    const imc = peso / (altura * altura);
    if (outIMC) outIMC.value = imc.toFixed(2);
    if (outClass) outClass.value = classificarIMC(imc);
  } else {
    if (outIMC) outIMC.value = '';
    if (outClass) outClass.value = '';
  }
}

/** Classificação IMC */
function classificarIMC(imc) {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}

/** Salva novo paciente */
function salvarPaciente() {
  const form = document.getElementById('patientForm');
  const formData = new FormData(form);

  // Próximo ID
  const nextId = parseInt(localStorage.getItem('nextPacienteId') || '1', 10);

  const nome = formData.get('nome') || '';
  const dataNascimento = formData.get('dataNascimento') || '';
  
  // Calcular idade a partir da data de nascimento se não foi preenchida
  let idade = parseInt(formData.get('idade') || '0', 10);
  if (!idade && dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
  }

  const novo = {
    id: nextId,
    nome,
    idade: idade,
    sexo: formData.get('sexo') || '',
    telefone: formData.get('telefone') || '',
    email: formData.get('email') || '',
    dataNascimento: dataNascimento,
    altura: parseFloat(formData.get('altura') || '0'),
    peso: parseFloat(formData.get('peso') || '0'),
    imc: parseFloat((formData.get('imc') || '0').replace(',', '.')) || 0,
    classificacao: formData.get('classificacao') || '',
    observacoes: formData.get('observacoes') || '',
    ultimaConsulta: new Date().toISOString().split('T')[0],
    inicial: (nome || '?').charAt(0).toUpperCase()
  };

  pacientes.push(novo);
  saveToStorage('pacientes', pacientes);
  localStorage.setItem('nextPacienteId', String(nextId + 1));
  carregarPacientes();
  showNotification('Paciente cadastrado com sucesso!', 'success');
}

/** Atualiza paciente existente */
function atualizarPaciente() {
  const form = document.getElementById('patientForm');
  const formData = new FormData(form);

  const id = parseInt(formData.get('pacienteId') || '0', 10);
  if (!id) return;
  
  const nome = formData.get('nome') || '';
  const dataNascimento = formData.get('dataNascimento') || '';
  
  // Calcular idade a partir da data de nascimento
  let idade = parseInt(formData.get('idade') || '0', 10);
  if (!idade && dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
  }

  // Encontrar o índice do paciente no array
  const index = pacientes.findIndex(p => p.id === id);
  if (index === -1) return;
  
  // Atualizar os dados do paciente
  pacientes[index] = {
    ...pacientes[index],
    nome,
    idade: idade,
    sexo: formData.get('sexo') || '',
    telefone: formData.get('telefone') || '',
    email: formData.get('email') || '',
    dataNascimento: dataNascimento,
    altura: parseFloat(formData.get('altura') || '0'),
    peso: parseFloat(formData.get('peso') || '0'),
    imc: parseFloat((formData.get('imc') || '0').replace(',', '.')) || 0,
    classificacao: formData.get('classificacao') || '',
    observacoes: formData.get('observacoes') || '',
    inicial: (nome || '?').charAt(0).toUpperCase()
  };

  saveToStorage('pacientes', pacientes);
  carregarPacientes();
  showNotification('Paciente atualizado com sucesso!', 'success');
}

/** Exporta CSV (mantido) */
function exportarParaCSV() {
  if (!pacienteFiltrado.length) {
    showNotification('Nenhum paciente para exportar', 'warning');
    return;
  }
  let csv = 'Nome,Idade,Email,Telefone,Última Consulta\n';
  pacienteFiltrado.forEach(p =>
    csv += `"${p.nome}",${p.idade},"${p.email}","${p.telefone}","${formatDate(p.ultimaConsulta)}"\n`
  );
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'pacientes.csv';
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  showNotification('Lista de pacientes exportada com sucesso', 'success');
}
window.exportarParaCSV = exportarParaCSV;