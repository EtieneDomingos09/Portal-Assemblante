function entrar() {
  const selecionada = document.querySelector('input[name="empresa"]:checked');
  const enterBtn = document.getElementById("enterBtn");

  if (!selecionada) {
    alert("Por favor, selecione uma empresa.");
    return;
  }

  // Adiciona estado de loading
  enterBtn.classList.add("loading");
  enterBtn.disabled = true;
  enterBtn.textContent = "Carregando...";

  const empresa = selecionada.value;

  // Simula um pequeno delay para melhor UX
  setTimeout(() => {
    switch (empresa) {
      case "ASSEMBLANTE DOS REIS":
        window.location.href = "../views/login.html";
        break;
      case "CAPITEL PROJECTO E FISCALIZAÇÃO DE OBRAS, LDA":
        window.location.href = "#"; // Alterar para o destino correto
        break;
      case "NTAU, LDA":
        window.location.href = "#"; // Alterar para o destino correto
        break;
      default:
        alert("Empresa não reconhecida.");
        // Remove estado de loading em caso de erro
        enterBtn.classList.remove("loading");
        enterBtn.disabled = false;
        enterBtn.textContent = "Entrar";
    }
  }, 800);
}

// Adiciona suporte para navegação por teclado
document.addEventListener("DOMContentLoaded", function () {
  const radioButtons = document.querySelectorAll('input[name="empresa"]');
  const enterBtn = document.getElementById("enterBtn");

  // Atualiza o estado do botão baseado na seleção
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", function () {
      enterBtn.disabled = false;
    });
  });

  // Permite usar Enter para submeter
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !enterBtn.disabled) {
      entrar();
    }
  });
});
