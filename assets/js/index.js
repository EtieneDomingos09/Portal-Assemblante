const toggleBtn = document.getElementById("mobile-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const header = document.getElementById("header");

// Menu mobile toggle
toggleBtn.addEventListener("click", () => {
  toggleBtn.classList.toggle("active");
  mobileMenu.classList.toggle("active");
});

// Header scroll effect
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
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

// Animação dos cards de planos
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

// FAQ Accordion functionality
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const faqItem = question.closest(".faq-item");
    const isActive = faqItem.classList.contains("active");

    // Fechar todos os outros FAQs
    document.querySelectorAll(".faq-item").forEach((item) => {
      if (item !== faqItem) {
        item.classList.remove("active");
      }
    });

    // Toggle do FAQ atual
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

// Animação de entrada da seção FAQ
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

// VARIÁVEIS GLOBAIS PARA MULTICAIXA EXPRESS
let selectedPlanData = {
  name: '',
  price: '',
  amount: 0
};

// FUNÇÃO PARA ABRIR MODAL DE PAGAMENTO (PREPARADA PARA MULTICAIXA EXPRESS)
function openPaymentModal() {
  // TODO: Implementar modal de pagamento com Multicaixa Express
  console.log('Função openPaymentModal() chamada - Integrar com Multicaixa Express');
  alert('Função de pagamento será integrada com Multicaixa Express');
}

// FUNÇÕES DO MODAL DE PLANO - PREPARADAS PARA MULTICAIXA EXPRESS
function openPlanModal(planName, planPrice, planAmount) {
  const modal = document.getElementById("planModal");
  const selectedPlanName = document.getElementById("selectedPlanName");
  const selectedPlanPrice = document.getElementById("selectedPlanPrice");

  // Armazenar dados do plano para uso no Multicaixa Express
  selectedPlanData = {
    name: planName,
    price: planPrice,
    amount: planAmount
  };

  // Definir informações do plano selecionado
  selectedPlanName.textContent = planName;
  selectedPlanPrice.textContent = planPrice;

  // Mostrar modal com animação
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevenir scroll do body

  // Focar no primeiro campo
  setTimeout(() => {
    document.getElementById("clientNumber").focus();
  }, 300);
}

function closePlanModal() {
  const modal = document.getElementById("planModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto"; // Restaurar scroll do body

  // Limpar formulário
  document.getElementById("planForm").reset();
  
  // Limpar dados selecionados
  selectedPlanData = {
    name: '',
    price: '',
    amount: 0
  };
}

// Fechar modal ao clicar no overlay
document.getElementById("planModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closePlanModal();
  }
});

// Fechar modal com tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closePlanModal();
  }
});

// SUBMISSÃO DO FORMULÁRIO DO PLANO - PREPARADO PARA MULTICAIXA EXPRESS
document.getElementById("planForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  
  // Coletar dados do formulário
  const paymentData = {
    // Dados do plano
    planName: selectedPlanData.name,
    planPrice: selectedPlanData.price,
    planAmount: selectedPlanData.amount,
    
    // Dados do cliente
    clientNumber: formData.get("clientNumber"),
    fullName: formData.get("fullName"),
    phoneNumber: formData.get("phoneNumber"),
    address: formData.get("address"),
    paymentMonth: formData.get("paymentMonth"),
    observations: formData.get("observations") || ''
  };

  // TODO: INTEGRAR COM MULTICAIXA EXPRESS AQUI
  console.log('Dados para envio ao Multicaixa Express:', paymentData);
  
  // EXEMPLO DE COMO FICARÁ A INTEGRAÇÃO:
  /*
  processMulticaixaPayment(paymentData)
    .then(response => {
      if (response.success) {
        closePlanModal();
        showSuccessMessage("Pagamento processado com sucesso!");
      } else {
        showErrorMessage("Erro no pagamento: " + response.message);
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      showErrorMessage("Erro ao processar pagamento. Tente novamente.");
    });
  */
  
  // Placeholder para teste - remover quando integrar
  closePlanModal();
  showSuccessMessage("Dados coletados! Integração com Multicaixa Express será implementada aqui.");
});

// FUNÇÃO PARA PROCESSAR PAGAMENTO COM MULTICAIXA EXPRESS
// TODO: Implementar esta função quando receber as credenciais do Multicaixa Express
function processMulticaixaPayment(paymentData) {
  // Esta função será implementada com a API do Multicaixa Express
  console.log('processMulticaixaPayment() - A implementar');
  
  // Estrutura básica que será usada:
  /*
  return fetch('/api/multicaixa-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: paymentData.planAmount,
      description: `Plano ${paymentData.planName} - ${paymentData.fullName}`,
      customer: {
        name: paymentData.fullName,
        phone: paymentData.phoneNumber,
        address: paymentData.address
      },
      metadata: {
        clientNumber: paymentData.clientNumber,
        paymentMonth: paymentData.paymentMonth,
        observations: paymentData.observations
      }
    })
  })
  .then(response => response.json());
  */
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Mostrar com animação
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Remover após 4 segundos
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Função para mostrar mensagem de erro
function showErrorMessage(message) {
  // Similar à função de sucesso, mas com estilo de erro
  const notification = document.createElement("div");
  notification.className = "success-notification error-notification";
  notification.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Formatação automática do telefone no modal
document.getElementById("phoneNumber").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 0) {
    if (value.startsWith("244")) {
      value = "+" + value;
    } else if (!value.startsWith("+244")) {
      value = "+244" + value;
    }
  }

  e.target.value = value;
});

// FORMULÁRIO DE CONTATO - PREPARADO PARA PROCESSAR INTERNAMENTE
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  
  // Coletar dados do formulário
  const contactData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    plan: formData.get("plan"),
    message: formData.get("message")
  };

  // Validação básica
  if (!contactData.name || !contactData.phone || !contactData.location) {
    showErrorMessage("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Validação do telefone
  const phoneRegex = /^(\+?244|244)?[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$/;
  if (!phoneRegex.test(contactData.phone)) {
    showErrorMessage("Por favor, insira um número de telefone válido (formato: 244 9XX XXX XXX).");
    return;
  }

  // TODO: PROCESSAR DADOS DE CONTATO INTERNAMENTE
  console.log('Dados de contato:', contactData);
  
  // Aqui você pode:
  // 1. Enviar para seu backend
  // 2. Salvar em banco de dados
  // 3. Enviar email de notificação
  // 4. Integrar com CRM
  
  // Feedback visual
  showContactSuccessFeedback(this);
});

// Função auxiliar para feedback visual do formulário de contato
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
    showSuccessMessage("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  }, 3000);
}

// Formatação automática do número de telefone (formulário de contato)
document.getElementById("phone").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 0) {
    if (value.startsWith("244")) {
      value = "+" + value;
    } else if (!value.startsWith("+244")) {
      value = "+244" + value;
    }
  }

  e.target.value = value;
});

// Animação de entrada da seção de contato
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

document
  .querySelectorAll(".contact-info, .contact-form-container")
  .forEach((item) => {
    contactObserver.observe(item);
  });

// Efeitos visuais nos inputs
document
  .querySelectorAll(".form-input, .form-select, .form-textarea")
  .forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });

// LOGS PARA DESENVOLVIMENTO
console.log('Sistema preparado para integração com Multicaixa Express');
console.log('Funções disponíveis:');
console.log('- openPaymentModal() - Para pagamento geral');
console.log('- openPlanModal() - Para adesão de planos');
console.log('- processMulticaixaPayment() - Para processar pagamentos (a implementar)');
console.log('- Formulário de contato processa dados internamente');