import { renderAuthPage } from '../pages/authPage.js';
import { renderHomePage } from '../pages/homePage.js';
import { renderProfilePage } from '../pages/profilePage.js';
import { renderSettingsPage } from '../pages/settingsPage.js';
import { renderChatPage } from '../pages/chatPage.js';
import { serveInitialPage } from '../pages/servePage.js';
import { renderGamePage } from '../pages/gamePage.js';
import { renderTournamentPage } from '../pages/tournamentPage.js';
import { renderMatchMakingPage } from '../pages/matchMakingPage.js';

const routes: { [key: string]: () => void } = {
    // "/": () => document.getElementById("main-page")!.innerHTML = "<h1>Home</h1>",
    "/authentication": renderAuthPage,
    "/home": renderHomePage,
    "/profile": renderProfilePage,
    "/settings": renderSettingsPage,
    "/chat": renderChatPage,
    "/game": renderGamePage,
    "/tournament": renderTournamentPage,
    "/matchMaking": renderMatchMakingPage,

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
    const toggleToHomeRoutes = ["/profile", "/settings", "/chat"];

    if (currentPath === href && toggleToHomeRoutes.indexOf(href) !== -1) {
      window.history.pushState({}, '', '/home');
      handleLocation();
    } else if (currentPath !== href) {
      window.history.pushState({}, '', href);
      handleLocation();
    }

    // Optional: Handle logo click
    if (href === "/home" && currentPath === "/home") {
      // Do nothing, already on home
      return;
    }
  });


  // Handle popstate (back/forward buttons)
  window.addEventListener('popstate', handleLocation);

  // Initial load
  handleLocation();
}

// In your router.ts
function handleLocation() {
    console.log('Handling location:', window.location.pathname);

    const path = window.location.pathname;
    if (path === '/')
    {
      serveInitialPage();
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