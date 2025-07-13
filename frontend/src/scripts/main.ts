import { authToken } from "./utils/auth.js";
import { initRouter } from "./utils/router.js";
import { connectWebSocket } from "./utils/socket.js";
  
async function checkAuthToken() {
    try {
        const response = await fetch("/api/auth/check-token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies in the request
        });


        if (!response.ok) {
            throw new Error("Token validation failed");
        }

        const data = await response.json();


        console.log(`data check : `, data.authenticated);
        if (data && data.authenticated)
            authToken.login();
        else
            authToken.logout();
    }
    catch (error) {
        console.error("Error validating auth token:", error);
        authToken.logout();
        
    }
}


document.addEventListener("DOMContentLoaded", async () => {
  
    await checkAuthToken();
    initRouter();

    if (authToken.checkAuth())
        connectWebSocket();


});
