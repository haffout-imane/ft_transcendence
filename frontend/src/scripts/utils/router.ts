import { authToken } from './auth.js'; // Importing an authentication token utility for checking user authentication status.

// Define a set of routes, where each route is a key (URL path) mapped to an async function that dynamically imports and renders the corresponding page.
const routes: { [key: string]: () => Promise<void> } = {



	"/authentication": async () => {
		// Import the authService utility and call its logout method. 
		const { authService } = await import('../utils/auth.js');
		authService.logout();
		// Dynamically import and render the authentication page. 
		const mod = await import('../pages/authPage.js');
		mod.renderAuthPage();
	},
	"/home": async () => {
		// Dynamically import and render the home page.
		const mod = await import('../pages/homePage.js');
		mod.renderHomePage();
	},
	"/profile": async () => {
		// Dynamically import and render the profile page.
		const mod = await import('../pages/profilePage.js');
		mod.renderProfilePage();
	},
	"/settings": async () => {
		// Dynamically import and render the settings page.
		const mod = await import('../pages/settingsPage.js');
		mod.renderSettingsPage();
	},
	"/chat": async () => {
		// Dynamically import and render the chat page.
		const mod = await import('../pages/chatPage.js');
		mod.renderChatPage();
	},
	"/game": async () => {
		// Dynamically import and render the game page.
		const mod = await import('../pages/gamePage.js');
		mod.renderGamePage();
	},
	"/tournament": async () => {
		// Dynamically import and render the tournament page.
		const mod = await import('../pages/tournamentPage.js');
		mod.renderTournamentPage();
	},
	"/onlineGame": async () => {
		// Dynamically import and render the matchmaking page.
		const mod = await import('../pages/matchMakingPage.js');
		mod.renderMatchMakingPage();
	},
	"/offline": async () => {
		const mod = await import('../pages/offlinePage.js');
		mod.renderOfflinePage();
	},
	"/aiBot": async () => {
		// Dynamically import and render the AI bot page.
		const mod = await import('../pages/aiBotPage.js');
		mod.renderAiBotPage();
	},
	"/teamUp": async () => {
		// Dynamically import and render the team-up page.
		const mod = await import('../pages/teamUpPage.js');
		mod.renderTeamUpPage();
	}
};

// Initializes the router by setting up event listeners for navigation and handling the initial page load.
export function initRouter() {
	// Listen for click events on the document to handle navigation.
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		// Find the closest anchor element with a `data-link` attribute.
		const link = target.closest("a[data-link]") as HTMLAnchorElement;
		if (!link) return; // If no such link is found, do nothing.

		e.preventDefault(); // Prevent the default browser navigation behavior.
		const href = link.getAttribute("href"); // Get the `href` attribute of the link.
		if (!href) return; // If no `href` is found, do nothing.

		const currentPath = window.location.pathname; // Get the current URL path.

		// Handle special case: If already on the home page and the home link is clicked, do nothing.
		if (href === "/home" && currentPath === "/home") {
			return;
		}

		// Define routes that should toggle back to the home page if clicked again.
		const toggleToHomeRoutes = ["/profile", "/settings", "/chat"];
		if (currentPath === href && toggleToHomeRoutes.indexOf(href) !== -1) {
			// If the current path matches the clicked link and is in the toggle list, navigate to home.
			navigateTo('/home');
		} else if (currentPath !== href) {
			// Otherwise, navigate to the clicked link's path.
			navigateTo(href);
		}
	});

	// Listen for browser back/forward button events and handle navigation.
	window.addEventListener('popstate', handleLocation);

	// Handle the initial page load by resolving the current location.
	handleLocation();
}

// Handles navigation based on the current URL path.
function handleLocation() {
	const path = window.location.pathname; // Get the current URL path.
	console.log('Handling location:', path);


	// Redirect to the authentication page if the user is not authenticated and not already on the authentication page.
	if (!authToken.checkAuth() && path !== "/authentication") {
		console.log("Not authenticated, redirecting to /authentication");
		navigateTo("/authentication");
		return;
	}

	// Redirect to the appropriate page based on authentication status if the path is the root ("/").
	if (path === "/") {
		navigateTo(authToken.checkAuth() ? "/home" : "/authentication");
		return;
	}


	// Find the route handler for the current path.
	const route = routes[path];
	if (route) {
		// If a route handler is found, execute it to render the page.
		console.log('Found route for:', path);
		route();
	} else {
		// If no route handler is found, display a 404 error message.
		console.warn('No route found for:', path);
		document.getElementById("main-page")!.innerHTML = "<h1>404 Page Not Found</h1>";
	}
}

// Navigates to a given path by updating the browser's history and triggering the router.
export function navigateTo(path: string): void {
	window.history.pushState({}, '', path); // Update the browser's history state.
	window.dispatchEvent(new Event('popstate')); // Trigger the `popstate` event to handle navigation.
}