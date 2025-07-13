import { renderGraphs } from "../utils/profile.js";


export interface userData {
	username: string;
	slogan: string;
	profilepicture: string;
	paddlecolor: string;
	matchball: string;
	twofa: boolean;
	remote: boolean;
}

export interface gameHistory {
	game: {
		opponentUsername: string;
		opponentSlogan: string;
		opponentProfilepicture: string;
		userScore: number;
		opponentScore: number;
		date: string;
	}[];
}

// const mockGameHistory = {
//     games: [
    //   {
	// 	date: "2025-05-22",
    //     opponentUsername: "ShadowKing",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 6,
    //     opponentScore: 7,
    //   },
    //   {
	// 	date: "2025-05-21",
    //     opponentUsername: "PixelSlayer",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 6,
    //     opponentScore: 7,
    //   },
    //   {
	// 	date: "2025-05-20",
    //     opponentUsername: "PingMaster",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 7,
    //     opponentScore: 3,
    //   },
    //   {
	// 	date: "2025-05-19",
    //     opponentUsername: "NeoNinja",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 7,
    //     opponentScore: 3,
    //   },
    //   {
	// 	date: "2025-05-18",
    //     opponentUsername: "TheDestroyer",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 0,
    //     opponentScore: 2,
    //   },
    //   {
	// 	date: "2025-05-17",
    //     opponentUsername: "Blade",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 7,
    //     opponentScore: 6,
    //   },
    //   {
	// 	date: "2025-05-16",
    //     opponentUsername: "fatima",
    //     opponentProfilepicture: "assets/profile/default.jpg",
    //     userScore: 7,
    //     opponentScore: 5,
    //   },
//     ],
//   };

export interface stats {
	totalMatchesPlayed: number;
	numWins: number;
	numLosses: number;
	Scored: number;
	conceeded: number;
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
				<p class="slogan">${game.opponentSlogan}</p>
				<p class="username">@${game.opponentUsername}</p>
			</div>
			
			<div class="player-info">
				<img src="${game.opponentProfilepicture}" alt="${game.opponentUsername}" class="player-pic" />
			</div>
		</div>
	`;
}

export async function renderProfilePage() {

let user: userData | null = null;
	try {
		const response = await fetch("/api/setting/data", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user data`);
		}

		let data: any;
		try {
			data = await response.json();
		} catch (error) {
			console.error("Error parsing JSON:", error);
			return;
		}

		if (!data)
			throw new Error("No user data found");

		user = data; // Store the user data for later use
	}
	catch (error) {
		console.error("Error fetching user data:", error);
		return;
	}

	let statistics: stats | null = null;
	try {
		const response = await fetch("/api/profile-page", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch statistics`);
		}

		let data: any;
		try {
			data = await response.json();
		} catch (error) {
			console.error("Error parsing JSON:", error);
			return;
		}

		if (!data)
			throw new Error("No statistics data found");

		statistics = {
			totalMatchesPlayed: data.totalMatchesPlayed,
			numWins: data.numWins,
			numLosses: data.numLosses,
			Scored: data.Scored,
			conceeded: data.conceeded
		}
	}
	catch (error) {
		console.error("Error fetching statistics:", error);
		return;
	}

	let GameHistory: gameHistory | null = null;
	try {
		const response = await fetch("/api/games-history", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch game history`);
		}

		let data: any;
		try {
			data = await response.json();
			console.log("Game History Data:", data);``
		} catch (error) {
			console.error("Error parsing JSON:", error);
			return;
		}

		if (!data)
			throw new Error("No game history data found");

		GameHistory = data;
	}
	catch (error) {
		console.error("Error fetching game history:", error);
		return;
	}


	const app = document.getElementById("main-page");
	if (!app) return;

	let matchHistoryHTML = "";
	const games = GameHistory.game;
	console.log("Game History:", games);

	if (!games || games.length === 0) {
		matchHistoryHTML = `<p class="no-history-msg">No matches played yet. Go win some games!</p>`;
	} else {
		const limitedGames = games.slice(0, 6);
		for (const game of limitedGames) {
			matchHistoryHTML += generateMatchCard(user.slogan, user.username, user.profilepicture, game);
		}
	}

	const winRatio  =statistics.totalMatchesPlayed === 0 ? 0 : Math.round((statistics.numWins / statistics.totalMatchesPlayed) * 100)

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
						<img src="${user.profilepicture}" />
					</div>
					<div class="profile-text">
						<p class="my-slogan">${user.slogan}</p>
						<p class="my-username">@${user.username}</p>
					</div>
				</div>
			</div>
			<div class="stats">
				<p class="stats-title">STATISTICS</p>
				<div class="stats-grid">
					<div class="total-matches">
						<p class="total-matches-text">Total Matches</p>
						<p class="total-matches-number">${statistics.totalMatchesPlayed}</p>
					</div>
					<div class="wins">
						<p class="wins-text">Total Wins</p>
						<p class="wins-number">${statistics.numWins}</p>
					</div>
					<div class="losses">
						<p class="losses-text">Total Losses</p>
						<p class="losses-number">${statistics.numLosses}</p>
					</div>
					<div class="win-rate">
						<p class="win-rate-text">Win Rate</p>
						<p class="win-rate-number">${winRatio}%</p>
					</div>
					<div class="goals-scored">
						<p class="goals-scored-text">Goals Scored</p>
						<p class="goals-scored-number">${statistics.Scored}</p>
					</div>
					<div class="goals-conceded">
						<p class="goals-conceded-text">Goals Conceeded</p>
						<p class="goals-conceded-number">${statistics.conceeded}</p>
					</div>
				</div>
			</div>

			<div class="graph">
				<p class="graph-title">GRAPH</p>
				<div class="graph-grid">
				<div class="graph-section">
					<p class="graph-text">MATCHES</p>
					<canvas id="winLossCanvas" width="200" height="200"></canvas>
					<div id="winLossLegend" class="legend"></div>
					<div class="graph-legend">
						<div class="legend-item">
							<span class="legend-square win-color"></span>
							<span class="legend-label">Wins</span>
						</div>
						<div class="legend-item">
							<span class="legend-square lose-color"></span>
							<span class="legend-label">Losses</span>
						</div>
					</div>
				</div>
				<div class="graph-section">
					<p class="graph-text">GOALS</p>
					<canvas id="scoredConcededCanvas" width="200" height="200"></canvas>
					<div id="winLossLegend" class="legend"></div>
					<div class="graph-legend">
						<div class="legend-item">
							<span class="legend-square win-color"></span>
							<span class="legend-label">Scored</span>
						</div>
						<div class="legend-item">
							<span class="legend-square lose-color"></span>
							<span class="legend-label">Conceeded</span>
						</div>
					</div>
					</div>
				</div>
			</div>

			<div class="history">
				<p class="history-title">GAME HISTORY</p>
				${matchHistoryHTML}
			</div>
		</div>
	</div>
	`;
	renderGraphs(statistics);
}