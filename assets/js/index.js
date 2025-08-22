// ================================
// INICIALIZAÇÃO - ESCONDER MODAL AO CARREGAR
// ================================
document.addEventListener('DOMContentLoaded', function() {
  // Garantir que o modal esteja escondido ao carregar a página
  const modal = document.getElementById("planModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none"; // Força esconder inicialmente
  }
  document.body.style.overflow = "auto";
});

// ================================
// MENU MOBILE E HEADER
// ================================
const toggleBtn = document.getElementById("mobile-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const header = document.getElementById("header");

// Menu mobile toggle
if (toggleBtn && mobileMenu) {
  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });
}

// Header scroll effect
window.addEventListener("scroll", () => {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
});

// Smooth scroll para links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ================================
// ANIMAÇÕES DOS PLANOS
// ================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = entry.target.dataset.delay || "0ms";
      entry.target.classList.add("animate-in");
    }
  });
}, observerOptions);

document.querySelectorAll(".plan-card").forEach((card, index) => {
  card.dataset.delay = `${index * 100}ms`;
  observer.observe(card);
});

// ================================
// FAQ
// ================================
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const faqItem = question.closest(".faq-item");
    const isActive = faqItem.classList.contains("active");

    // Fechar outros FAQs
    document.querySelectorAll(".faq-item").forEach((item) => {
      if (item !== faqItem) {
        item.classList.remove("active");
      }
    });

    // Toggle do atual
    if (isActive) {
      faqItem.classList.remove("active");
    } else {
      faqItem.classList.add("active");
    }
  });
});

// Fechar FAQ ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".faq-item")) {
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
    });
  }
});

// Animação de entrada da FAQ
const faqObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.animation = "fadeInUp 0.6s ease-out forwards";
        }, index * 100);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".faq-item").forEach((item) => {
  faqObserver.observe(item);
});

// ================================
// SISTEMA DE VALIDAÇÃO DE CLIENTE + PAGAMENTO
// ================================
let clienteValidado = null;
let selectedPlanData = { name: '', price: '', amount: 0 };

/**
 * Função para validar cliente via API PHP
 */
async function validarCliente() {
  const numeroClienteInput = document.getElementById('clientNumber');
  const validateBtn = document.getElementById('validateClientBtn');
  const clientInfoSection = document.getElementById('clientInfoSection');
  const clientNotFound = document.getElementById('clientNotFound');
  
  if (!numeroClienteInput || !validateBtn) return;
  
  const numeroCliente = numeroClienteInput.value.trim();
  
  // Validações Básicas
  if (!numeroCliente) {
    showNotification('Por favor, digite o número do cliente', 'error');
    numeroClienteInput.focus();
    return;
  }
  
  // Validação ajustada para aceitar CLI001 ou apenas números
  if (!/^CLI\d+$/i.test(numeroCliente)) {
    showNotification('Formato inválido. Use CLI seguido de números', 'error');
    numeroClienteInput.focus();
    return;
  }
  
  // Reset visual
  if (clientInfoSection) clientInfoSection.style.display = 'none';
  if (clientNotFound) clientNotFound.style.display = 'none';
  setLoadingState(validateBtn, true);
  
  try {
    // Extrair apenas os números do CLI para enviar à API
    const numeroParaAPI = numeroCliente.replace(/^CLI/i, '');
    
    // Chamada para API PHP
    const response = await fetch('../../app/controllers/validar-cliente.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ numero_cliente: numeroParaAPI })
    });
    
    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      clienteValidado = result.data;
      mostrarInformacoesCliente(result.data);
      habilitarBotaoPagamento();
      showNotification('Cliente validado com sucesso!', 'success');
    } else {
      clienteValidado = null;
      mostrarClienteNaoEncontrado();
      desabilitarBotaoPagamento();
      showNotification(result.message || 'Cliente não encontrado', 'error');
    }
  } catch (error) {
    console.error('Erro ao validar cliente:', error);
    clienteValidado = null;
    desabilitarBotaoPagamento();
    
    // Tratar diferentes tipos de erro
    if (error.message.includes('HTTP 404')) {
      showNotification('API não encontrada. Verifique a configuração do servidor.', 'error');
    } else if (error.message.includes('HTTP 500')) {
      showNotification('Erro interno do servidor. Contate o suporte.', 'error');
    } else if (error.name === 'TypeError') {
      showNotification('Erro de conexão. Verifique sua internet.', 'error');
    } else {
      showNotification('Erro de conexão. Tente novamente.', 'error');
    }
  } finally {
    setLoadingState(validateBtn, false);
  }
}

/**
 * Exibir informações do cliente validado
 */
function mostrarInformacoesCliente(cliente) {
  const elements = {
    clientName: document.getElementById('clientName'),
    clientPhone: document.getElementById('clientPhone'),
    clientEmail: document.getElementById('clientEmail'),
    clientAddress: document.getElementById('clientAddress'),
    clientPackage: document.getElementById('clientPackage'),
    clientLastPayment: document.getElementById('clientLastPayment'),
    clientStatus: document.getElementById('clientStatus'),
    clientInfoSection: document.getElementById('clientInfoSection'),
    clientValue: document.getElementById('clientValue'),
    clientONU: document.getElementById('clientONU'),
    clientPPPoE: document.getElementById('clientPPPoE'),
    clientBilhete: document.getElementById('clientBilhete'),
    clientInscricao: document.getElementById('clientInscricao'),
    clientDataPagamento: document.getElementById('clientDataPagamento'),
    clientTermino: document.getElementById('clientTermino'),
    clientObservacao: document.getElementById('clientObservacao')
  };

  // Campos principais
  if (elements.clientName) elements.clientName.textContent = cliente.nome || 'N/A';
  if (elements.clientPhone) elements.clientPhone.textContent = cliente.telefone || 'N/A';
  if (elements.clientEmail) elements.clientEmail.textContent = cliente.email || 'N/A';
  if (elements.clientAddress) elements.clientAddress.textContent = cliente.endereco || 'N/A';
  if (elements.clientPackage) elements.clientPackage.textContent = cliente.pacote || 'N/A';
  
  // Campos de pagamento
  if (elements.clientLastPayment) elements.clientLastPayment.textContent = cliente.mes_pago || 'N/A';
  if (elements.clientValue) elements.clientValue.textContent = cliente.valor_mensal || 'N/A';
  if (elements.clientDataPagamento) elements.clientDataPagamento.textContent = cliente.data_pagamento || 'N/A';
  if (elements.clientTermino) elements.clientTermino.textContent = cliente.termino || 'N/A';
  
  // Campos técnicos
  if (elements.clientONU) elements.clientONU.textContent = cliente.onu || 'N/A';
  if (elements.clientPPPoE) elements.clientPPPoE.textContent = cliente.pppoe || 'N/A';
  
  // Campos adicionais
  if (elements.clientBilhete) elements.clientBilhete.textContent = cliente.numero_bilhete || 'N/A';
  if (elements.clientInscricao) elements.clientInscricao.textContent = cliente.data_inscricao || 'N/A';
  if (elements.clientObservacao) elements.clientObservacao.textContent = cliente.observacao || 'Nenhuma observação';
  
  // Status do cliente com classes CSS
  if (elements.clientStatus && cliente.status_calculado) {
    elements.clientStatus.textContent = cliente.status_calculado.texto || 'N/A';
    elements.clientStatus.className = `client-status ${cliente.status_calculado.classe || 'status-inativo'}`;
  }
  
  if (elements.clientInfoSection) {
    elements.clientInfoSection.style.display = 'block';
  }
}

/**
 * Mostrar mensagem de cliente não encontrado
 */
function mostrarClienteNaoEncontrado() {
  const clientNotFound = document.getElementById('clientNotFound');
  if (clientNotFound) {
    clientNotFound.style.display = 'block';
  }
}

/**
 * Habilitar botão de pagamento
 */
function habilitarBotaoPagamento() {
  const paymentBtn = document.getElementById('paymentBtn');
  if (paymentBtn) {
    paymentBtn.disabled = false;
    paymentBtn.title = 'Proceder com o pagamento';
    paymentBtn.style.cursor = 'pointer';
  }
}

/**
 * Desabilitar botão de pagamento
 */
function desabilitarBotaoPagamento() {
  const paymentBtn = document.getElementById('paymentBtn');
  if (paymentBtn) {
    paymentBtn.disabled = true;
    paymentBtn.title = 'Valide o cliente primeiro';
    paymentBtn.style.cursor = 'not-allowed';
  }
}

/**
 * Estado de carregamento dos botões
 */
function setLoadingState(button, isLoading) {
  if (!button) return;
  
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// ================================
// MODAL DE PLANOS 
// ================================

/**
 * Abrir modal de plano
 */
function openPlanModal(planName, planPrice, planAmount) {
  const modal = document.getElementById("planModal");
  const selectedPlanName = document.getElementById("selectedPlanName");
  const selectedPlanPrice = document.getElementById("selectedPlanPrice");

  if (!modal || !selectedPlanName || !selectedPlanPrice) {
    console.error('Elementos do modal não encontrados');
    return;
  }

  // Armazenar dados do plano selecionado
  selectedPlanData = { name: planName, price: planPrice, amount: planAmount };

  // Atualizar informações do plano no modal
  selectedPlanName.textContent = planName;
  selectedPlanPrice.textContent = planPrice;

  // Reset do formulário
  resetModalForm();
  
  // Mostrar modal
  modal.style.display = "flex"; // Garantir que está visível
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Focar no campo após abrir
  setTimeout(() => {
    const clientNumberInput = document.getElementById("clientNumber");
    if (clientNumberInput) {
      clientNumberInput.focus();
    }
  }, 300);
}

/**
 * Fechar modal de plano
 */
function closePlanModal() {
  const modal = document.getElementById("planModal");
  if (!modal) return;
  
  // Esconder modal
  modal.classList.remove("active");
  
  // Aguardar animação antes de esconder completamente
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  
  document.body.style.overflow = "auto";
  resetModalForm();
}

/**
 * Reset do formulário do modal
 */
function resetModalForm() {
  const form = document.getElementById("planForm");
  if (form) form.reset();
  
  // Reset visual
  const clientInfoSection = document.getElementById('clientInfoSection');
  const clientNotFound = document.getElementById('clientNotFound');
  const validateBtn = document.getElementById('validateClientBtn');
  const clientNumberInput = document.getElementById('clientNumber');
  
  if (clientInfoSection) clientInfoSection.style.display = 'none';
  if (clientNotFound) clientNotFound.style.display = 'none';
  
  // Restaurar prefixo CLI no input
  if (clientNumberInput) {
    clientNumberInput.value = 'CLI';
  }
  
  clienteValidado = null;
  selectedPlanData = { name: '', price: '', amount: 0 };
  desabilitarBotaoPagamento();
  
  if (validateBtn) setLoadingState(validateBtn, false);
}

// ================================
// EVENTOS DO MODAL
// ================================

// Fechar modal ao clicar fora e configurar eventos
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById("planModal");
  if (modal) {
    // Garantir que modal está escondido
    modal.classList.remove("active");
    modal.style.display = "none";
    
    // Event listener para fechar ao clicar fora
    modal.addEventListener("click", function(e) {
      if (e.target === e.currentTarget) {
        closePlanModal();
      }
    });
  }
});

// Fechar modal com ESC
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    const modal = document.getElementById("planModal");
    if (modal && modal.classList.contains('active')) {
      closePlanModal();
    }
  }
});

// ================================
// FORMULÁRIO DE PAGAMENTO
// ================================
document.addEventListener('DOMContentLoaded', function() {
  const planForm = document.getElementById("planForm");
  if (planForm) {
    planForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!clienteValidado) {
        showNotification('Por favor, valide o cliente antes de prosseguir', 'error');
        const clientNumberInput = document.getElementById('clientNumber');
        if (clientNumberInput) clientNumberInput.focus();
        return;
      }

      const formData = new FormData(this);
      const paymentData = {
        // Dados do plano
        planName: selectedPlanData.name,
        planPrice: selectedPlanData.price,
        planAmount: selectedPlanData.amount,
        
        // Dados do cliente validado
        clientId: clienteValidado.id || clienteValidado.numero_cliente,
        clientName: clienteValidado.nome,
        clientPhone: clienteValidado.telefone,
        clientEmail: clienteValidado.email,
        clientAddress: clienteValidado.endereco,
        currentPackage: clienteValidado.pacote,
        clientStatus: clienteValidado.status_calculado,
        clientValue: clienteValidado.valor_mensal,
        clientONU: clienteValidado.onu,
        clientPPPoE: clienteValidado.pppoe,
        
        // Dados adicionais
        observations: formData.get("observations") || '',
        timestamp: new Date().toISOString(),
        paymentMethod: 'multicaixa'
      };

      processarPagamentoMulticaixa(paymentData);
    });
  }
});

/**
 * Função para Processar pagamento via Multicaixa (preparado para API)
 */
// async function processarPagamentoMulticaixa(paymentData) {
//   const paymentBtn = document.getElementById('paymentBtn');
  
//   try {
//     setLoadingState(paymentBtn, true);
//     console.log('Processando pagamento...', paymentData);
    
//     // Chamada para API de pagamento PHP
//     const response = await fetch('api/processar-pagamento.php', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify(paymentData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }
    
//     const result = await response.json();
    
//     if (result.success) {
//       closePlanModal();
//       showNotification(
//         `Pagamento processado com sucesso para ${clienteValidado.nome}!`, 
//         'success'
//       );
      
//       // Se houver URL de redirecionamento do Multicaixa
//       if (result.redirectUrl) {
//         setTimeout(() => {
//           window.open(result.redirectUrl, '_blank');
//         }, 1000);
//       }
//     } else {
//       showNotification(
//         result.message || 'Erro ao processar pagamento. Tente novamente.', 
//         'error'
//       );
//     }
//   } catch (error) {
//     console.error('Erro no pagamento:', error);
    
//     if (error.message.includes('HTTP 404')) {
//       showNotification('API de pagamento não encontrada.', 'error');
//     } else if (error.message.includes('HTTP 500')) {
//       showNotification('Erro interno do servidor. Contate o suporte.', 'error');
//     } else {
//       showNotification('Erro ao processar pagamento. Tente novamente.', 'error');
//     }
//   } finally {
//     setLoadingState(paymentBtn, false);
//   }
// }

// ================================
// EVENTOS EXTRAS DO CLIENTE (COM PREFIXO CLI)
// ================================
document.addEventListener('DOMContentLoaded', function() {
  const clientNumberInput = document.getElementById('clientNumber');
  
  if (clientNumberInput) {
    // Definir valor inicial com prefixo CLI
    clientNumberInput.value = 'CLI';
    
    // Enter para validar
    clientNumberInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        validarCliente();
      }
    });

    // Controlar input para manter prefixo CLI
    clientNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.toUpperCase();
      
      // Se o usuário deletar tudo, restaurar CLI
      if (value === '' || value.length < 3) {
        value = 'CLI';
        e.target.setSelectionRange(3, 3); // Posicionar cursor após CLI
      }
      
      // Se não começar com CLI, adicionar
      if (!value.startsWith('CLI')) {
        // Se começar com números, manter apenas os números e adicionar CLI
        if (/^\d/.test(value)) {
          value = 'CLI' + value.replace(/[^0-9]/g, '');
        } else {
          value = 'CLI';
        }
      }
      
      // Permitir apenas CLI seguido de números
      value = value.replace(/^CLI/, 'CLI').replace(/[^CLI0-9]/g, '');
      
      // Garantir que CLI não seja duplicado
      if (value.match(/CLI/g)?.length > 1) {
        value = 'CLI' + value.replace(/CLI/g, '');
      }
      
      e.target.value = value;
      
      // Reset dos dados do cliente quando input muda
      clienteValidado = null;
      
      const clientInfoSection = document.getElementById('clientInfoSection');
      const clientNotFound = document.getElementById('clientNotFound');
      
      if (clientInfoSection) clientInfoSection.style.display = 'none';
      if (clientNotFound) clientNotFound.style.display = 'none';
      
      desabilitarBotaoPagamento();
    });
    
    // Evitar que o cursor seja posicionado antes de CLI
    clientNumberInput.addEventListener('keydown', function(e) {
      const cursorPos = e.target.selectionStart;
      
      // Evitar deletar/editar os primeiros 3 caracteres (CLI)
      if (cursorPos < 3 && (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        e.target.setSelectionRange(3, 3);
      }
    });
    
    // Controlar posição do cursor
    clientNumberInput.addEventListener('click', function(e) {
      const cursorPos = e.target.selectionStart;
      if (cursorPos < 3) {
        e.target.setSelectionRange(3, 3);
      }
    });
    
    // Controlar seleção
    clientNumberInput.addEventListener('select', function(e) {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      if (start < 3) {
        e.target.setSelectionRange(Math.max(3, start), end);
      }
    });
  }
});

// ================================
// SISTEMA DE NOTIFICAÇÕES
// ================================
function showNotification(message, type = 'success') {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add("show"), 100);
  
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// ================================
// FORMULÁRIO DE CONTATO
// ================================
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const contactData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        location: formData.get("location"),
        plan: formData.get("plan"),
        message: formData.get("message")
      };

      // Validações
      if (!contactData.name || !contactData.phone || !contactData.location) {
        showNotification("Por favor, preencha todos os campos obrigatórios.", 'error');
        return;
      }

      const phoneRegex = /^(\+?244|244)?[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$/;
      if (!phoneRegex.test(contactData.phone)) {
        showNotification("Por favor, insira um número de telefone válido (formato: 244 9XX XXX XXX).", 'error');
        return;
      }

      console.log('Dados de contato:', contactData);
      showContactSuccessFeedback(this);
    });
  }
});

function showContactSuccessFeedback(form) {
  const submitBtn = document.querySelector(".form-submit");
  if (!submitBtn) return;
  
  const originalText = submitBtn.innerHTML;
  const originalBackground = submitBtn.style.background;
  
  submitBtn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
  submitBtn.style.background = "#28a745";
  submitBtn.disabled = true;
  
  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.style.background = originalBackground;
    submitBtn.disabled = false;
    form.reset();
    showNotification("Mensagem enviada com sucesso! Entraremos em contato em breve.", 'success');
  }, 3000);
}

// Formatação automática de telefone
document.addEventListener('DOMContentLoaded', function() {
  const phoneInputs = document.querySelectorAll('#phoneNumber, #phone');
  phoneInputs.forEach(input => {
    input.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 0) {
        if (value.startsWith("244")) value = "+" + value;
        else if (!value.startsWith("+244")) value = "+244" + value;
      }
      e.target.value = value;
    });
  });
});

// Animações de entrada do contato
const contactObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".contact-info, .contact-form-container").forEach((item) => {
  contactObserver.observe(item);
});

// Foco nos inputs
document.querySelectorAll(".form-input, .form-select, .form-textarea").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
  });
  input.addEventListener("blur", function () {
    this.parentElement.classList.remove("focused");
  });
});

// ================================
// LOGS DE DESENVOLVIMENTO
// ================================
console.log('Sistema atualizado - Modal inicializado como escondido');
console.log('Sistema de validação de cliente carregado - Prefixo CLI automático');
console.log('APIs esperadas:');
console.log('- POST /api/validar-cliente.php - Validar número do cliente');
console.log('- POST /api/processar-pagamento.php - Processar pagamento Multicaixa');