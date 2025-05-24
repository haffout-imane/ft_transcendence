import { authToken } from './auth.js';

const routes: { [key: string]: () => Promise<void> } = {
	"/authentication": async () => {
		const { authService } = await import('../utils/auth.js');
		authService.logout();
	  const mod = await import('../pages/authPage.js');
	  mod.renderAuthPage();
	},
	"/home": async () => {
	  const mod = await import('../pages/homePage.js');
	  mod.renderHomePage();
	},
	"/profile": async () => {
	  const mod = await import('../pages/profilePage.js');
	  mod.renderProfilePage();
	},
	"/settings": async () => {
	  const mod = await import('../pages/settingsPage.js');
	  mod.renderSettingsPage();
	},
	"/chat": async () => {
	  const mod = await import('../pages/chatPage.js');
	  mod.renderChatPage();
	},
	"/game": async () => {
	  const mod = await import('../pages/gamePage.js');
	  mod.renderGamePage();
	},
	"/tournament": async () => {
	  const mod = await import('../pages/tournamentPage.js');
	  mod.renderTournamentPage();
	},
	"/matchMaking": async () => {
	  const mod = await import('../pages/matchMakingPage.js');
	  mod.renderMatchMakingPage();
	},
  };
  

export function initRouter() {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a[data-link]") as HTMLAnchorElement;
    if (!link) return;

    e.preventDefault();
    const href = link.getAttribute("href");
    if (!href) return;

    const currentPath = window.location.pathname;

    // List of routes that should toggle back to home
	// Optional: Handle logo click
	if (href === "/home" && currentPath === "/home") {
	  // Do nothing, already on home
	  return;
	}
    
	const toggleToHomeRoutes = ["/profile", "/settings", "/chat"];
	// If the current path is one of the routes that should toggle back to home
    if (currentPath === href && toggleToHomeRoutes.indexOf(href) !== -1) {
      navigateTo('/home');
    } else if (currentPath !== href) {
      navigateTo(href);
    }

  });


  // Handle popstate (back/forward buttons)
  window.addEventListener('popstate', handleLocation);

  // Initial load
  handleLocation();
}

// In your router.ts
function handleLocation() {
	const path = window.location.pathname;
	console.log('Handling location:', path);
  
	// 🔐 Redirect based on auth
	if (!authToken.checkAuth() && path !== "/authentication") {
	  console.log("Not authenticated, redirecting to /authentication");
	  navigateTo("/authentication");
	  return;
	}
  
	if (path === "/") {
	  navigateTo(authToken.checkAuth() ? "/home" : "/authentication");
	  return;
	}
  
	const route = routes[path];
	if (route) {
	  console.log('Found route for:', path);
	  route();
	} else {
	  console.warn('No route found for:', path);
	  document.getElementById("main-page")!.innerHTML = "<h1>404 Page Not Found</h1>";
	}
  }

  export function navigateTo(path: string): void {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate')); // Trigger router
}