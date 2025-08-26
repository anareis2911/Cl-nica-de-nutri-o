// Funcionalidades específicas da dashboard

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboardCards();
    loadDashboardStats();
    highlightActiveNavLink();
});

/**
 * Configura os cards da dashboard com redirecionamento
 */
function initializeDashboardCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target');
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
        
        // Efeito hover melhorado
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 12px rgba(0, 0, 0, 0.06)';
        });
    });
}

/**
 * Destaca o link de navegação ativo na sidebar
 */
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Remove parâmetros de URL para comparação
        const linkPage = href.split('?')[0];
        
        if (currentPage === linkPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Carrega estatísticas para a dashboard do localStorage
 */
function loadDashboardStats() {
    try {
        // Obtém pacientes do localStorage
        const pacientes = getFromStorage('pacientes') || [];
        
        const stats = {
            totalPacientes: pacientes.length,
            consultasHoje: calcularConsultasHoje(pacientes),
            planosPendentes: calcularPlanosPendentes()
        };
        
        // Atualiza a UI com essas estatísticas (se houver elementos para mostrar)
        if (document.getElementById('total-pacientes')) {
            document.getElementById('total-pacientes').textContent = stats.totalPacientes;
        }
        
        if (document.getElementById('consultas-hoje')) {
            document.getElementById('consultas-hoje').textContent = stats.consultasHoje;
        }
        
        if (document.getElementById('planos-pendentes')) {
            document.getElementById('planos-pendentes').textContent = stats.planosPendentes;
        }
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

/**
 * Calcula quantas consultas existem para hoje
 */
function calcularConsultasHoje(pacientes) {
    const hoje = new Date().toISOString().split('T')[0];
    return pacientes.filter(p => p.ultimaConsulta === hoje).length;
}

/**
 * Calcula quantos planos estão pendentes (exemplo)
 */
function calcularPlanosPendentes() {
    // Esta é uma função de exemplo - você precisará adaptar conforme sua estrutura de dados
    return 2; // Valor fixo para demonstração
}

/**
 * Alterna entre temas claro e escuro
 */
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Verifica preferência de tema salva
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
});