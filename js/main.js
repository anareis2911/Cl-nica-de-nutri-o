// Funções globais e utilitárias para todo o sistema

/**
 * Inicializa funcionalidades comuns a todas as páginas
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeUserMenu();
    setActiveNavigation();
    initializeLocalStorage(); // Garantir que os dados iniciais existam
});

/**
 * Configura a sidebar para destacar a página atual
 */
function initializeSidebar() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.sidebar nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * Configura o menu do usuário (avatar)
 */
function initializeUserMenu() {
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('click', function() {
            alert('Menu do usuário será implementado aqui');
            // Aqui você pode abrir um menu dropdown com opções de perfil, logout, etc.
        });
    }
}

/**
 * Define a navegação ativa com base na URL
 */
function setActiveNavigation() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('nav a');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === path) {
            item.classList.add('active');
        }
    });
}

/**
 * Inicializa dados no localStorage se não existirem
 */
function initializeLocalStorage() {
    if (!localStorage.getItem('pacientes')) {
        const pacientesIniciais = [
            { id: 1, nome: "Ana Silva", idade: 32, email: "anasilva@email.com", telefone: "(11) 99999-9999", ultimaConsulta: "2023-03-12", inicial: "A" },
            { id: 2, nome: "Bruno Santos", idade: 28, email: "brunosantos@email.com", telefone: "(11) 98888-8888", ultimaConsulta: "2023-03-05", inicial: "B" },
            { id: 3, nome: "Carla Mendes", idade: 45, email: "carlamendes@email.com", telefone: "(11) 97777-7777", ultimaConsulta: "2023-02-28", inicial: "C" },
            { id: 4, nome: "Daniel Oliveira", idade: 29, email: "danieloliveira@email.com", telefone: "(11) 96666-6666", ultimaConsulta: "2023-02-20", inicial: "D" },
            { id: 5, nome: "Amanda Costa", idade: 35, email: "amandacosta@email.com", telefone: "(11) 95555-5555", ultimaConsulta: "2023-02-15", inicial: "A" },
            { id: 6, nome: "Beatriz Rodrigues", idade: 41, email: "beatrizrodrigues@email.com", telefone: "(11) 94444-4444", ultimaConsulta: "2023-02-10", inicial: "B" }
        ];
        localStorage.setItem('pacientes', JSON.stringify(pacientesIniciais));
    }
    
    if (!localStorage.getItem('nextPacienteId')) {
        localStorage.setItem('nextPacienteId', '7');
    }
}

/**
 * Formata data para o padrão brasileiro
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

/**
 * Exibe notificações para o usuário
 */
function showNotification(message, type = 'info') {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos para a notificação
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    // Cores baseadas no tipo
    const colors = {
        success: '#42e695',
        error: '#fc5c7d',
        warning: '#ffd26f',
        info: '#6a82fb'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Obtém dados do localStorage
 */
function getFromStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

/**
 * Salva dados no localStorage
 */
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}