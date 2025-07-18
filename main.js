document.getElementById("menu-toggle").addEventListener("click", () => {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("hidden");
});

const slider = document.getElementById("slider");
let index = 0;

setInterval(() => {
  index = (index + 1) % slider.children.length;
  slider.style.transform = `translateX(-${index * 100}%)`;
}, 4000); // muda a cada 4 segundos
