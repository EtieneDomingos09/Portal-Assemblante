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
            // Simular validação de email (substitua pela sua lógica)
            const isValidEmail = await this.validateEmail(email);
            
            if (isValidEmail) {
                this.showSuccess('emailSuccess', 'Email validado com sucesso!');
                setTimeout(() => {
                    this.proceedToPasswordStep();
                }, 800);
            } else {
                this.showError('emailError', 'Email não encontrado em nosso sistema');
                this.hideLoading();
            }
        } catch (error) {
            this.showError('emailError', 'Erro ao validar email. Tente novamente.');
            this.hideLoading();
        }
    }

    async validateEmail(email) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Aqui você faria a chamada real para sua API
        // Exemplo:
        /*
        const response = await fetch('/api/validate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return response.ok;
        */
        
        // Por enquanto, vamos aceitar qualquer email válido
        return true;
    }

    proceedToPasswordStep() {
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
        
        // Focar no campo de senha
        setTimeout(() => {
            this.passwordInput.focus();
        }, 300);

        this.hideLoading();
    }

    handlePasswordStep() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('passwordError', 'Por favor, digite sua senha');
            return;
        }

        if (password.length < 6) {
            this.showError('passwordError', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        // Aqui você faria o login real
        this.performLogin();
    }

    async performLogin() {
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<div class="loader"></div>';

        try {
            // Simular login
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aqui você faria a chamada real para sua API
            /*
            const formData = new FormData();
            formData.append('email', this.emailInput.value);
            formData.append('senha', this.passwordInput.value);
            formData.append('remember', document.getElementById('remember').checked);
            
            const response = await fetch('/api/login', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                // Redirecionar para dashboard
                window.location.href = data.redirect_url || '/dashboard';
            } else {
                throw new Error('Login failed');
            }
            */
            
            // Sucesso - redirecionar ou mostrar mensagem
            Swal.fire({
                icon: 'success',
                title: 'Login realizado com sucesso!',
                text: 'Redirecionando...',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Simular redirecionamento
                console.log('Redirecionando para dashboard...');
                // window.location.href = '/dashboard';
            });
            
        } catch (error) {
            this.showError('passwordError', 'Senha incorreta. Tente novamente.');
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
        // Reajustar layout se necessário
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

// Animações de entrada melhoradas
const AnimationController = {
    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
};

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
    
    // Inicializar animações
    AnimationController.observeElements();
});