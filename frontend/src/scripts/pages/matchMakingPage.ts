import {handleGameSocket, renderOnlinePage, handleGameEnd } from "./onlinePage.js";
import {userData} from "./profilePage.js";

let opponentPic : string;
let opponentUsername : string;
let opponentSlogan : string;
let paddleSide : "left" | "right";
let interval: ReturnType<typeof setInterval>;

const token = document.cookie;
console.log("Token:", token);

let wsUrl;
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
		wsUrl = 'wss://localhost/ws/game'; // Use 'ws' for local development
	else
    	wsUrl = 'wss://10.12.3.4/ws/game';
	
export let socket : WebSocket | null  = null; // Initialize socket as null


async function getOpponentPic(username: string): Promise<string> {
	const response = await fetch(`/api/profile-picture?username=${username}`, {
		method: "GET",
		credentials: "include", // Include cookies in the request
	});
	
	if (!response.ok) {
		throw new Error(`Failed to fetch profile picture for ${username}`);
	}
	
	const data = await response.json();
	return data.profilepicture || "assets/profiles/default.jpg"; // Fallback to a default image if none is found
}

export async function display_opponent(data, MyUsername) {
	const { matchId, players } = data;
	
	console.log("Opponent found:", players, MyUsername);
	const myIndex = players.findIndex(user => user === MyUsername);
	paddleSide = myIndex === 0 ? "left" : "right";
	opponentPic = await getOpponentPic(players[1 - myIndex]);
	opponentUsername = players[1 - myIndex];
	console.log("opponent username:", opponentUsername);
	
	const avatarElement = document.getElementById("opponent-avatar");
	const cancelBtn = document.getElementById("cancel-btn");
	
	if (!avatarElement) return;
	avatarElement.setAttribute("src", opponentPic);
	avatarElement.classList.remove("spin-animation");
	avatarElement.classList.add("reveal-animation");
	if (cancelBtn) cancelBtn.remove();
	clearInterval(interval);
	setTimeout(() => {
		renderOnlinePage(matchId, paddleSide, opponentUsername, MyUsername);
	}, 3000);
}

export async function renderMatchMakingPage() {
	
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
socket = new WebSocket(wsUrl);

let profilePictureSrc:string;
let username:string;

if (user) {
	profilePictureSrc = user.profilepicture || profilePictureSrc;
	username = user.username || username;
}


socket.onopen = () => {
	console.log("Game WebSocket connection established");
	socket.send(JSON.stringify({"type":"auth","data":{"token": user.username}}));
};

setTimeout(() => {
	socket.send(JSON.stringify({"type":"join_match", "data":{"username": user.username}}));
}, 1000);

// socket.send(JSON.stringify({"type":"list_online"}));

	socket.onmessage = (event) => {
		try {
			const { type, data } = JSON.parse(event.data);
			switch (type) {
			case "match_ready":
				display_opponent(data, username);
				break;
			case "game_state":
				handleGameSocket(data, username);
				break;
			case "game_over":
				handleGameEnd(data, username);
				break;
			default:
				console.log("Received unknown message type:", type);
				console.log(type, data);
			}
		} catch (error) {
			console.error("Error parsing WebSocket message:", error);
		}
	};

	socket.onclose = () => {
		console.log("Game WebSocket connection closed");
		socket.send(JSON.stringify({"type":"leave", "data":{"username": username}}));
		socket = null; // Clear the socket reference
	};
	
	socket.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
	
	// Send a message to join the matchmaking queue
	
	const app = document.getElementById("main-page");
	if (!app) return;
	
	app.innerHTML = `
    <div class="animation-backround">
	<div class="matchMaking-container">
	<div class="matchMaking">
	<img src="assets/vs.png" alt="Matchmaking Background" class="vs-image"/>
	<div class="first-player">
	<img src="${profilePictureSrc}" />
	</div>
	<div class="second-player">
	<img id="opponent-avatar" src="assets/profiles/alien_0.png" />
	</div>
	</div>
	<div class="cancel-matchMaking">
	<button id="cancel-btn" class="cancel-button">Cancel Matchmaking</button>
	</div>
	</div>
    </div>
	`;
	
	const avatarElement = document.getElementById("opponent-avatar");
	const cancelBtn = document.getElementById("cancel-btn");
	if (!avatarElement || !cancelBtn) return;
	
	cancelBtn.addEventListener("click", () => {
		if (socket) {
			socket.send(JSON.stringify({"type":"leave", "data":{"username": username}}));
			socket.close();
			socket = null; // Clear the socket reference
		}
		window.location.href = "/";
});

const defaultAvatars = Array.from({ length: 10 }, (_, i) => `assets/profiles/alien_${i}.png`);

avatarElement.classList.add("spin-animation");

interval = setInterval(() => {
	const random = Math.floor(Math.random() * defaultAvatars.length);
    avatarElement.setAttribute("src", defaultAvatars[random]); 
}, 150);
}

export function getSocket() {
  if (!socket) {
	console.error("WebSocket is not connected");
	return null;
  }
  return socket;
}