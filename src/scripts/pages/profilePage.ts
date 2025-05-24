import { renderGraphs } from "../utils/profile.js";

const mockGameHistory = {
    games: [
      {
		date: "2025-05-22",
        opponentUsername: "ShadowKing",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 6,
        opponentScore: 7,
      },
      {
		date: "2025-05-21",
        opponentUsername: "PixelSlayer",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 6,
        opponentScore: 7,
      },
      {
		date: "2025-05-20",
        opponentUsername: "PingMaster",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 7,
        opponentScore: 3,
      },
      {
		date: "2025-05-19",
        opponentUsername: "NeoNinja",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 7,
        opponentScore: 3,
      },
      {
		date: "2025-05-18",
        opponentUsername: "TheDestroyer",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 0,
        opponentScore: 2,
      },
      {
		date: "2025-05-17",
        opponentUsername: "Blade",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 7,
        opponentScore: 6,
      },
      {
		date: "2025-05-16",
        opponentUsername: "fatima",
        opponentProfilePicture: "assets/profile/default.jpg",
        userScore: 7,
        opponentScore: 5,
      },
    ],
  };

  const statistics={
	totalMatches: 20,
	wins: 12,
	losses: 8,
	goelsScored: 50,
	goalsConceded: 30,
  }

  
function generateMatchCard(slogan: string, username: string, userPic: string, game: any): string {

	const isWin = game.userScore > game.opponentScore;
	const resultClass = isWin ? "win-card" : "lose-card";
	const resultIcon = isWin ? "/assets/icons/win.png" : "/assets/icons/lose.png";

	return `
		<div class="${resultClass}">
			<div class="player-info">
				<img src="${userPic}" alt="Your pic" class="player-pic" />
			</div>

			<div class="text-infos">
				<p class="slogan">${slogan}</p>
				<p class="username">@${username}</p>
			</div>

			<div class="match-result">
				<p class="score">${game.userScore}</p>
			</div>
			
			<div class="match-result">
			<img src="${resultIcon}" alt="Result Icon" class="result-icon" />
			<p class="date">${game.date}</p>
			</div>

			<div class="match-result">
				<p class="score">${game.opponentScore}</p>
			</div>
			
			<div class="text-infos">
				<p class="slogan">${game.opponentUsername}</p>
				<p class="username">@${game.opponentUsername}</p>
			</div>
			
			<div class="player-info">
				<img src="${game.opponentProfilePicture}" alt="${game.opponentUsername}" class="player-pic" />
			</div>
		</div>
	`;
}

export function renderProfilePage() {
	const user = localStorage.getItem("user");

	let profilePictureSrc = "assets/profile/default.jpg";
	let username = "Unknown";
	let slogan = "alien404";

	if (user) {
		const userData = JSON.parse(user);
		profilePictureSrc = userData.profilePicture || profilePictureSrc;
		username = userData.username || username;
		slogan = userData.slogan || slogan;
	}

	const app = document.getElementById("main-page");
	if (!app) return;

	let matchHistoryHTML = "";
	// Get the first 6 games from the mockGameHistory
	const firstSixGames = mockGameHistory.games.slice(0, 6);
	for (const game of firstSixGames) {
		matchHistoryHTML += generateMatchCard(slogan, username, profilePictureSrc, game);
	}

	app.innerHTML = `
	<div class="home-background">
		<!-- Navbar omitted for brevity -->
		<a href="/home" data-link class="logo-link">
			<img src="/assets/logo.png" alt="logo" class="logo-icon" />
		</a>

		<a href="/profile" data-link class="profile-link">
			<img src="/assets/profile/profile_2.png" alt="Profile" class="profile-icon" />
		</a>

		<a href="/settings" data-link class="settings-link">
			<img src="/assets/setting/setting_1.png" alt="Settings" class="settings-icon" />
		</a>

		<a href="/chat" data-link class="chat-link">
			<img src="/assets/chat/chat_1.png" alt="Chat" class="chat-icon" />
		</a>
		<div class="window">
			<div class="exit">
				<a href="/home" data-link>
					<img src="/assets/buttons/exit.png" alt="exit" />
				</a>
			</div>
			<div class="profile-container">
				<div class="informations">
					<div class="profile-pic">
						<img src="${profilePictureSrc}" />
					</div>
					<div class="profile-text">
						<p class="my-slogan">${slogan}</p>
						<p class="my-username">@${username}</p>
					</div>
				</div>

				<div class="stats">
					<p class="stats-title">STATISTICS</p>
					<div class="stats-grid">
						<div class="total-matches">
							<p class="total-matches-text">Total Matches</p>
							<p class="total-matches-number">${statistics.totalMatches}</p>
						</div>
						<div class="wins">
							<p class="wins-text">Total Wins</p>
							<p class="wins-number">${statistics.wins}</p>
						</div>
						<div class="losses">
							<p class="losses-text">Total Losses</p>
							<p class="losses-number">${statistics.losses}</p>
						</div>
						<div class="win-rate">
							<p class="win-rate-text">Win Rate</p>
							<p class="win-rate-number">${Math.round((statistics.wins / statistics.totalMatches) * 100)}%</p>
						</div>
						<div class="goals-scored">
							<p class="goals-scored-text">Goals Scored</p>
							<p class="goals-scored-number">${statistics.goelsScored}</p>
						</div>
						<div class="goals-conceded">
							<p class="goals-conceded-text">Goals Conceded</p>
							<p class="goals-conceded-number">${statistics.goalsConceded}</p>
						</div>
					</div>
				</div>

				<div class="graph">
					<p class="graph-title">GRAPH</p>
					<div class="graph-grid">
						<div class="graph-section">
							<p class="graph-text">Win / Loss Ratio</p>
							<canvas id="winLossCanvas" width="200" height="200"></canvas>
							<div id="winLossLegend" class="legend"></div>
						</div>
						<div class="graph-section">
						</div>
					</div>
				</div>

				<div class="history">
					<p class="history-title">GAME HISTORY</p>
					${matchHistoryHTML}
				</div>
			</div>
		</div>
	</div>
	`;
	renderGraphs();
}