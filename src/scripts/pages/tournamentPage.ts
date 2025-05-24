export function renderTournamentPage() {
    const app = document.getElementById("main-page");
    if (!app) return;
  
    app.innerHTML = `
    <div class="tournament-container">
    
		<div class="game-background">
			
		</div>

    </div>
    `;
  }