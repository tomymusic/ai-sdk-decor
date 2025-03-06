document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("ai-sdk-decor-app");
  if (!container) return;

  // Asegurar que no haya duplicaciones eliminando iframes previos
  if (container.querySelector("iframe")) return;

  console.log("Cargando AI SDK Decor para producto...");

  // Inyectar solo el componente sin la página completa
  setTimeout(() => {
    const iframe = document.createElement("iframe");
    iframe.src = "/shopify-block/?embed=true"; // Agregamos un query param para manejar el layout
    iframe.style.width = "100%";
    iframe.style.height = "500px";
    iframe.style.border = "none";
    container.appendChild(iframe);
  }, 500);
});
