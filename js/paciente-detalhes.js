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
  
  // Inicializar o modal de edição
  initializePatientModal();
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
      // Abrir modal de edição em vez de redirecionar
      abrirModalEdicao(patientId);
    });
  }
  
  // O botão de consulta já está configurado com onclick no HTML
}

/** Abre o modal de edição */
function abrirModalEdicao(patientId) {
  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
  const paciente = pacientes.find(p => p.id == patientId);
  
  if (!paciente) {
    showNotification('Paciente não encontrado', 'error');
    return;
  }
  
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
  
  // Abrir o modal
  document.getElementById('patientModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/** Inicializa o modal de edição */
function initializePatientModal() {
  const modal = document.getElementById('patientModal');
  const spanClose = document.querySelector('.modal .close');
  const cancelBtn = document.getElementById('cancelButton');
  const form = document.getElementById('patientForm');

  if (!modal || !spanClose || !cancelBtn || !form) return;

  const close = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  
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
      atualizarPaciente();
      close();
      // Recarregar os dados para mostrar as atualizações
      const patientId = document.getElementById('pacienteId').value;
      carregarDadosPaciente(patientId);
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
  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
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

  localStorage.setItem('pacientes', JSON.stringify(pacientes));
  showNotification('Paciente atualizado com sucesso!', 'success');
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