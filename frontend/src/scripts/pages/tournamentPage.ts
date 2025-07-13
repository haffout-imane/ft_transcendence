import { renderTournamentGame } from "./tournamentGame.js";

declare const confetti: any;


type Player = {
	image: string;
	slogan: string;
	isEliminated?: boolean;
  };
  
  const DEFAULT_PLAYER: Player = {
	image: "/assets/profile/anonyme.png",
	slogan: "anonyme",
	isEliminated: false
  };
  
  // Available pictures for selection
  const AVAILABLE_PICTURES = [
	"/assets/profile/default.png",
	"/assets/profile/red.png", 
	"/assets/profile/blue.png",
	"/assets/profile/yellow.png"
  ];
  
  let round1: Player[] = [DEFAULT_PLAYER, DEFAULT_PLAYER, DEFAULT_PLAYER, DEFAULT_PLAYER];
  let round2: Player[] = [DEFAULT_PLAYER, DEFAULT_PLAYER];
  let _winner: Player = DEFAULT_PLAYER;
  let currentMatch = 0;

// Function to update player elements in the DOM
function updatePlayerElements(): void {
  const app = document.getElementById("main-page");
  if (!app) return;

  // Update Round 1 players
  const round1Elements = app.querySelectorAll('.round-1 .player');
  round1.forEach((player, index) => {
    if (round1Elements[index]) {
      const img = round1Elements[index].querySelector('img') as HTMLImageElement;
      const span = round1Elements[index].querySelector('.tournament-name') as HTMLSpanElement;
      if (img && span) {
        img.src = player.image;
        img.alt = player.slogan;
        span.textContent = player.slogan;
      }
    }
  });

  // Update Round 2 players
  const round2Elements = app.querySelectorAll('.round-2 .player');
  round2.forEach((player, index) => {
    if (round2Elements[index]) {
      const img = round2Elements[index].querySelector('img') as HTMLImageElement;
      const span = round2Elements[index].querySelector('.tournament-name') as HTMLSpanElement;
      if (img && span) {
        img.src = player.image;
        img.alt = player.slogan;
        span.textContent = player.slogan;
      }
    }
  });

  // Update Winner
  const winnerElement = app.querySelector('.winner .player');
  if (winnerElement) {
    const img = winnerElement.querySelector('img') as HTMLImageElement;
    const span = winnerElement.querySelector('.tournament-name') as HTMLSpanElement;
    if (img && span) {
      img.src = _winner.image;
      img.alt = _winner.slogan;
      span.textContent = _winner.slogan;
    }
  }
}

// Function to render just the tournament view (without setup overlay)
function renderTournamentView(): void {
  const app = document.getElementById("main-page");
  if (!app) return;

  app.innerHTML = `
    <div class="tournament-container">
      	<div class="animation-backround2">

			<div class="schema2">
				<div class="tournament-tree">

					<!-- Winner -->
					<section class="winner">
					<div class="winner">
						<img class="crown" src="/assets/icons/crown.png" alt="Crown" />
						<div class="player">
						<img src="${_winner.image}" alt="${_winner.slogan}" />
						<span class="tournament-name">${_winner.slogan}</span>
						</div>
					</div>
					</section>

					<!-- Final -->
					<section class="round-2">
					<div class="match-3">
						<div class="player">
						<img src="${round2[0].image}" alt="${round2[0].slogan}" />
						<span class="tournament-name">${round2[0].slogan}</span>
						</div>
						<div class="player">
						<img src="${round2[1].image}" alt="${round2[1].slogan}" />
						<span class="tournament-name">${round2[1].slogan}</span>
						</div>
					</div>
					</section>

					<!-- Round 1 -->
					<section class="round-1">
					<div class="match-1">
						<div class="player">
						<img src="${round1[0].image}" alt="${round1[0].slogan}" />
						<span class="tournament-name">${round1[0].slogan}</span>
						</div>
						<div class="player">
						<img src="${round1[1].image}" alt="${round1[1].slogan}" />
						<span class="tournament-name">${round1[1].slogan}</span>
						</div>
					</div>
					<div class="match-2">
						<div class="player">
						<img src="${round1[2].image}" alt="${round1[2].slogan}" />
						<span class="tournament-name">${round1[2].slogan}</span>
						</div>
						<div class="player">
						<img src="${round1[3].image}" alt="${round1[3].slogan}" />
						<span class="tournament-name">${round1[3].slogan}</span>
						</div>
					</div>
					</section>

				</div>
			</div>

			
		</div>
    </div>
  `;
  showExitTournamentButton();
}

function showExitTournamentButton(): void {
    const app = document.getElementById("main-page");
    if (!app) return;

    const existingButton = app.querySelector(".exit-tournament-button");
    if (existingButton) {
        existingButton.remove();
    }
    console.log("Current Match:", currentMatch);

    if (currentMatch > 2) {
        // 🎉 Trigger confetti effect
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.4 },
            angle: 90,
            startVelocity: 45
        });

        // Add repeated bursts for 2s
        let duration = 2 * 1000;
        let animationEnd = Date.now() + duration;
        let interval = setInterval(() => {
            if (Date.now() > animationEnd) {
                clearInterval(interval);
            }
            confetti({
                particleCount: 40,
                spread: 70,
                origin: { y: 0.6 },
                angle: 90
            });
        }, 250);

        // Exit button
        const exitContainer = document.createElement("div");
        exitContainer.className = "exit-tournament-button-container";

        const exitButton = document.createElement("button");
        exitButton.className = "exit-tournament-button";
        exitButton.textContent = "Exit Tournament";
        exitContainer.appendChild(exitButton);
        app.appendChild(exitContainer);

        exitButton.addEventListener("click", () => {
            window.location.href = "/";
        });
    }
}



// Function to create and show the start tournament button
function showStartTournamentButton(): void {
  const app = document.getElementById("main-page");
  if (!app) return;

  // Remove existing button if present
  const existingButton = app.querySelector(".start-tournament-button");
  if (existingButton) {
    existingButton.remove();
  }

  // Create button container and button
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "start-tournament-button-container";
  
  const startButton = document.createElement("button");
  startButton.className = "start-tournament-button";
  
  // Set button text based on current match
  if (currentMatch === 0) {
    startButton.textContent = "Start Tournament";
  } else if (currentMatch === 1) {
    startButton.textContent = "Play Semi-Final 2";
  } else if (currentMatch === 2) {
    startButton.textContent = "Play Final";
  } else {
    return; // Tournament is complete
  }

  buttonContainer.appendChild(startButton);
  app.appendChild(buttonContainer);

  // Add event listener
  startButton.addEventListener("click", async () => {
    await playNextMatch();
    buttonContainer.remove(); // Remove button after match
  });
}

export function renderTournamentPage(): void {
  const app = document.getElementById("main-page");
  if (!app) return;

  app.innerHTML = `
    <div class="tournament-container">
      	<div class="animation-backround">

			<div class="schema">
				<div class="tournament-tree">

					<!-- Winner -->
					<section class="winner">
					<div class="winner">
						<img class="crown" src="/assets/icons/crown.png" alt="Crown" />
						<div class="player">
						<img src="${_winner.image}" alt="${_winner.slogan}" />
						<span class="tournament-name">${_winner.slogan}</span>
						</div>
					</div>
					</section>

					<!-- Final -->
					<section class="round-2">
					<div class="match-3">
						<div class="player">
						<img src="${round2[0].image}" alt="${round2[0].slogan}" />
						<span class="tournament-name">${round2[0].slogan}</span>
						</div>
						<div class="player">
						<img src="${round2[1].image}" alt="${round2[1].slogan}" />
						<span class="tournament-name">${round2[1].slogan}</span>
						</div>
					</div>
					</section>

					<!-- Round 1 -->
					<section class="round-1">
					<div class="match-1">
						<div class="player">
						<img src="${round1[0].image}" alt="${round1[0].slogan}" />
						<span class="tournament-name">${round1[0].slogan}</span>
						</div>
						<div class="player">
						<img src="${round1[1].image}" alt="${round1[1].slogan}" />
						<span class="tournament-name">${round1[1].slogan}</span>
						</div>
					</div>
					<div class="match-2">
						<div class="player">
						<img src="${round1[2].image}" alt="${round1[2].slogan}" />
						<span class="tournament-name">${round1[2].slogan}</span>
						</div>
						<div class="player">
						<img src="${round1[3].image}" alt="${round1[3].slogan}" />
						<span class="tournament-name">${round1[3].slogan}</span>
						</div>
					</div>
					</section>

				</div>
			</div>
			
		</div>
    </div>
  `;

  

    // Append the setup overlay
	const overlayHTML = getSetupOverlayHTML();

	
	app.insertAdjacentHTML("beforeend", overlayHTML);
  
	// Setup picture selection logic
	const pictureOptions = app.querySelectorAll(".picture-option");
	pictureOptions.forEach((img) => {
	  img.addEventListener("click", () => {
		const playerIndex = parseInt(img.getAttribute("data-player") || "0", 10);
		const selectedPic = img.getAttribute("data-picture");
  
		if (!selectedPic) return;
  
		// Update selected picture UI
		const selectedImg = document.getElementById(`selected-${playerIndex}`) as HTMLImageElement;
		selectedImg.src = selectedPic;
  
		// Update selection classes
		document.querySelectorAll(`[data-player="${playerIndex}"]`).forEach((el) => {
		  el.classList.remove("selected");
		});
		img.classList.add("selected");
	  });
	});
  
	
	// Handle 'Done' button
	const doneBtn = document.getElementById("done-setup");
	


	doneBtn?.addEventListener("click", () => {
	  for (let i = 0; i < 4; i++) {
		const sloganInput = document.getElementById(`slogan-${i}`) as HTMLInputElement;
		const selectedImg = document.getElementById(`selected-${i}`) as HTMLImageElement;
  
		round1[i] = {
			slogan: sloganInput?.value.trim() || `Player ${i + 1}`,
			image: selectedImg?.src || DEFAULT_PLAYER.image,
			isEliminated: false
		  };
		  
	  }
  
	  // Remove the setup overlay
	  const overlay = document.querySelector(".setup-overlay");
	  if (overlay) overlay.remove();
  
	  // Update the DOM with user info
	  updatePlayerElements();
  
	  // Show the start tournament button
	  showStartTournamentButton();

	  
	});
  
	// Disable "Done" button initially
	doneBtn?.setAttribute("disabled", "true");

	// Add event listeners to slogan inputs
	for (let i = 0; i < 4; i++) {
	const sloganInput = document.getElementById(`slogan-${i}`) as HTMLInputElement;
	sloganInput?.addEventListener("input", () => {
		const allFilled = Array.from({ length: 4 }).every((_, index) => {
		const input = document.getElementById(`slogan-${index}`) as HTMLInputElement;
		return input?.value.trim().length > 0;
		});

		if (allFilled) {
		doneBtn?.removeAttribute("disabled");
		} else {
		doneBtn?.setAttribute("disabled", "true");
		}
	});
	}

}


function getSetupOverlayHTML(): string {
	return `
	  <!-- Setup Overlay -->
	  <div class="setup-overlay setup-overlay-appear">
		<div class="setup-content">
		  <h2>Tournament Setup</h2>
		  <div class="players-setup">
			${[0, 1, 2, 3].map(i => `
			  <div class="player-setup">
				<h3>Player ${i + 1}</h3>
				<input type="text" id="slogan-${i}" placeholder="Enter your slogan" maxlength="20" autocomplete="off"/>
				<div class="picture-selection">
				  <p>Choose your picture:</p>
				  <div class="picture-options">
					${AVAILABLE_PICTURES.map((pic, index) => `
					  <img src="${pic}" alt="Option ${index + 1}" 
						   class="picture-option ${index === i ? 'selected' : ''}" 
						   data-player="${i}" 
						   data-picture="${pic}" />
					`).join('')}
				  </div>
				</div>
				<div class="selected-picture">
				  <p>Selected:</p>
				  <img id="selected-${i}" src="${AVAILABLE_PICTURES[i]}" alt="Selected" />
				</div>
			  </div>
			`).join('')}
		  </div>
		  <button id="done-setup" class="done-button">Done</button>
		</div>
	  </div>
	`;
  }
  

  async function playNextMatch(): Promise<void> {
	if (currentMatch === 0) {
	  // Semi-Final 1: Player 1 vs Player 2
	  const winner = await renderTournamentGame(round1[0].slogan, round1[1].slogan);
	  
	  
	  // Update round2 with winner's info
	  const winnerPlayer = round1.find(p => p.slogan === winner);
	  if (winnerPlayer) {
		  round2[0] = { ...winnerPlayer };
		}
		
		round1[0].isEliminated = round1[0].slogan !== winner;
		round1[1].isEliminated = round1[1].slogan !== winner;
		currentMatch++;
		// Return to tournament page after game
		renderTournamentView();
	} else if (currentMatch === 1) {
	  // Semi-Final 2: Player 3 vs Player 4
	  const winner = await renderTournamentGame(round1[2].slogan, round1[3].slogan);
	  
	  
	  // Update round2 with winner's info
	  const winnerPlayer = round1.find(p => p.slogan === winner);
	  if (winnerPlayer) {
		  round2[1] = { ...winnerPlayer };
		}
		
		round1[2].isEliminated = round1[2].slogan !== winner;
		round1[3].isEliminated = round1[3].slogan !== winner;
		currentMatch++;
		// Return to tournament page after game
		renderTournamentView();
	} else if (currentMatch === 2) {
	  // Final: Semi-Final winners
	  const winner = await renderTournamentGame(round2[0].slogan, round2[1].slogan);
	  
	  
	  // Update winner with winner's info
	  const winnerPlayer = round2.find(p => p.slogan === winner);
	  if (winnerPlayer) {
		  _winner = { ...winnerPlayer };
		}
		
		round2[0].isEliminated = round2[0].slogan !== winner;
		round2[1].isEliminated = round2[1].slogan !== winner;
		currentMatch++;
		// Return to tournament page after game
		renderTournamentView();


	} else {

	  return; // Tournament complete
	}
  
	// Show next button if tournament isn't complete
	if (currentMatch < 3) {
	  setTimeout(() => {
		showStartTournamentButton();
	  }, 1000); // Small delay to let players see the updated schema
	}
  }