class LoginManager {
    constructor() {
        this.currentStep = 1;
        this.emailValidated = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.emailInput = document.getElementById('emailInput');
        this.passwordInput = document.getElementById('passwordInput');
        this.emailWrapper = document.getElementById('emailWrapper');
        this.passwordWrapper = document.getElementById('passwordWrapper');
        this.emailAction = document.getElementById('emailAction');
        this.togglePassword = document.getElementById('togglePassword');
        this.submitButton = document.getElementById('submitButton');
        this.passwordStep = document.getElementById('passwordStep');
        this.progressIndicator = document.getElementById('progressIndicator');
        this.checkboxGroup = document.getElementById('checkboxGroup');
        this.backLink = document.getElementById('backLink');
        this.emailError = document.getElementById('emailError');
        this.emailSuccess = document.getElementById('emailSuccess');
        this.passwordError = document.getElementById('passwordError');
        this.forgotPassword = document.getElementById('forgotPassword');
        this.rememberCheckbox = document.getElementById('remember');
    }

    bindEvents() {
        this.emailAction.addEventListener('click', () => this.handleEmailStep());
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmailStep();
        });
        this.emailInput.addEventListener('input', () => this.clearMessages());
        
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handlePasswordStep();
        });
        this.passwordInput.addEventListener('input', () => this.clearMessages());

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.currentStep === 1) {
                this.handleEmailStep();
            } else {
                this.handlePasswordStep();
            }
        });

        // Auto-focus no input de email
        this.emailInput.focus();
    }

    async handleEmailStep() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showError('emailError', 'Por favor, digite seu email');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Por favor, digite um email válido');
            return;
        }

        // Mostrar loading
        this.showLoading();

        try {
            const isValidEmail = await this.validateEmail(email);
            
            if (isValidEmail.sucesso) {
                this.showSuccess('emailSuccess', 'Email validado com sucesso!');
                setTimeout(() => {
                    this.proceedToPasswordStep(isValidEmail.nome);
                }, 800);
            } else {
                this.showError('emailError', isValidEmail.mensagem || 'Email não encontrado');
                this.hideLoading();
            }
        } catch (error) {
            console.error('Erro ao validar email:', error);
            this.showError('emailError', 'Erro ao validar email. Verifique sua conexão.');
            this.hideLoading();
        }
    }

    async validateEmail(email) {
        try {
            const response = await fetch('../../app/controllers/verificar_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    proceedToPasswordStep(nomeUsuario = null) {
        this.currentStep = 2;
        this.emailValidated = true;
        
        // Atualizar UI
        this.emailWrapper.classList.add('success');
        this.passwordStep.classList.add('show');
        this.checkboxGroup.classList.add('show');
        this.backLink.classList.add('show');
        this.progressIndicator.classList.add('show');
        
        // Atualizar indicador de progresso
        document.getElementById('step2').classList.add('active');
        
        // Atualizar botão
        this.submitButton.textContent = 'Entrar';
        
        // Mostrar nome do usuário se disponível
        if (nomeUsuario) {
            this.showWelcomeMessage(nomeUsuario);
        }
        
        // Focar no campo de senha
        setTimeout(() => {
            this.passwordInput.focus();
        }, 300);

        this.hideLoading();
    }

    showWelcomeMessage(nome) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `<p>Olá, <strong>${nome}</strong>!</p>`;
        welcomeDiv.style.cssText = `
            margin: 10px 0;
            padding: 8px 12px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            color: #495057;
            font-size: 14px;
            text-align: center;
            animation: fadeIn 0.5s ease-in;
        `;
        
        this.passwordStep.insertBefore(welcomeDiv, this.passwordStep.firstChild);
    }

    async handlePasswordStep() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('passwordError', 'Por favor, digite sua senha');
            return;
        }

        if (password.length < 3) { // Ajustado para suas necessidades
            this.showError('passwordError', 'A senha deve ter pelo menos 3 caracteres');
            return;
        }

        // Realizar login
        await this.performLogin();
    }

    async performLogin() {
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<div class="loader"></div>';

        try {
            const loginData = {
                email: this.emailInput.value.trim(),
                senha: this.passwordInput.value,
                remember: this.rememberCheckbox ? this.rememberCheckbox.checked : false
            };

            const response = await fetch('../../app/controllers/processar_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.sucesso) {
                // Sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Login realizado com sucesso!',
                    text: `Bem-vindo, ${data.usuario.nome}!`,
                    timer: 2000,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    // Redirecionar para dashboard
                    window.location.href = data.redirect_url || '../../views/dashboard.html';
                });
            } else {
                // Erro de credenciais
                this.showError('passwordError', data.mensagem || 'Credenciais inválidas');
                this.submitButton.disabled = false;
                this.submitButton.textContent = 'Entrar';
                
                // Limpar senha por segurança
                this.passwordInput.value = '';
                this.passwordInput.focus();
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('passwordError', 'Erro ao processar login. Verifique sua conexão.');
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Entrar';
        }
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    showLoading() {
        this.emailAction.innerHTML = '<div class="loader"></div>';
        this.emailInput.disabled = true;
    }

    hideLoading() {
        this.emailAction.innerHTML = '<i class="fas fa-arrow-right"></i>';
        this.emailInput.disabled = false;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        if (elementId === 'emailError') {
            this.emailWrapper.classList.add('error');
        } else if (elementId === 'passwordError') {
            this.passwordWrapper.classList.add('error');
        }

        // Feedback háptico para dispositivos móveis
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }

    showSuccess(elementId, message) {
        const successElement = document.getElementById(elementId);
        successElement.textContent = message;
        successElement.classList.add('show');
    }

    clearMessages() {
        // Limpar mensagens de erro
        this.emailError.classList.remove('show');
        this.emailSuccess.classList.remove('show');
        this.passwordError.classList.remove('show');
        
        // Remover classes de erro
        this.emailWrapper.classList.remove('error');
        this.passwordWrapper.classList.remove('error');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Utilitários adicionais
const Utils = {
    // Detectar dispositivo móvel
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    // Detectar orientação
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    },
    
    // Smooth scroll para elementos
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    },
    
    // Debounce para eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Função para logout
    async logout() {
        try {
            const response = await fetch('../../app/controllers/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                window.location.href = '../../views/login.html';
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            // Forçar redirecionamento mesmo com erro
            window.location.href = '/src/login/login.html';
        }
    }
};

// Melhorias de acessibilidade
document.addEventListener('DOMContentLoaded', () => {
    // Melhorar navegação por teclado
    const focusableElements = document.querySelectorAll(
        'input, button, a, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-gold)';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Suporte para modo escuro do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    
    // Detectar mudanças de orientação
    window.addEventListener('orientationchange', Utils.debounce(() => {
        const main = document.querySelector('main');
        if (main && Utils.isMobile()) {
            Utils.smoothScrollTo(main);
        }
    }, 300));
    
    // Preloader simples
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Feedback háptico para dispositivos móveis
const HapticFeedback = {
    light() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },
    
    medium() {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },
    
    heavy() {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 10, 30]);
        }
    }
};

// Melhorias na experiência do usuário
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar feedback háptico aos botões em dispositivos móveis
    if (Utils.isMobile()) {
        document.querySelectorAll('button, .input-action').forEach(btn => {
            btn.addEventListener('click', () => {
                HapticFeedback.light();
            });
        });
        
        document.querySelectorAll('.main-button').forEach(btn => {
            btn.addEventListener('click', () => {
                HapticFeedback.medium();
            });
        });
    }
    
    // Prevenir zoom duplo toque no iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// Verificar se usuário já está logado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sessão ativa
    fetch('../../app/controllers/verificar_sessao.php', {})
        .then(response => response.json())
        .then(data => {
            if (data.logado) {
                // Usuário já está logado, redirecionar
                window.location.href = '../../views/dashboard.html';
            }
        })
        .catch(error => {
            console.log('Verificação de sessão falhou:', error);
            // Continuar normalmente
        });
});