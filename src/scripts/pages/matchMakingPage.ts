export function renderMatchMakingPage() {
  const app = document.getElementById("main-page");
  if (!app) return;

  app.innerHTML = `
  <div class="game-background">
      <img src="assets/vs.png" alt="Matchmaking Background" class="vs-image"/>
  </div>
  `;
}