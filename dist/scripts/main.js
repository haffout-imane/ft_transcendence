import { initRouter } from "./utils/router.js";
import { serveInitialPage } from "./pages/servePage.js";
document.addEventListener("DOMContentLoaded", () => {
    initRouter();
    serveInitialPage();
});
