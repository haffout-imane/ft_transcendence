export function renderGamePage() {
    const app = document.getElementById("main-page");
    if (!app) return;
  
    app.innerHTML = `
    <div class="game-background">
    </div>
    `;
  }