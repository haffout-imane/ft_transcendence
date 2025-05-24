import { showCustomAlert } from "./auth.js";

export function setupSettingsPage() {


    // handle the profile picture change before saving
    const fileInput = document.getElementById("pen") as HTMLInputElement;
    const profilePicture = document.getElementById("profile-picture") as HTMLImageElement;
    let selectedImageData: string | null = null; // Variable to store the selected image data
    if (fileInput) {
        fileInput.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    selectedImageData = e.target?.result as string; // Store the image data
                    if (profilePicture) {
                        profilePicture.src = selectedImageData; // Update the profile picture
                    }
                };
                reader.readAsDataURL(target.files[0]);
            }
        });
    }


    // Handle the 2FA toggle switch
    const toggle = document.getElementById("twofa-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            toggle.classList.toggle("on");
            toggle.classList.toggle("off");

            // Get the current 2FA state (enabled/disabled)
            const isEnabled = toggle.classList.contains("on");
            const user = localStorage.getItem("user");
            
            if (user) {
                const userData = JSON.parse(user);

                // Preserve the 2FA state along with other settings
                userData.twoFa = isEnabled;
                localStorage.setItem("user", JSON.stringify(userData));
            }

            console.log("2FA enabled:", isEnabled);
            showCustomAlert(`2FA is now ${isEnabled ? "enabled" : "disabled"}`);
        });
    }


    // Handle the save button click event
    const saveBtn = document.getElementById("save-settings-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const slogan = (document.getElementById("slogan") as HTMLInputElement).value;
            const username = (document.getElementById("username") as HTMLInputElement).value;
            const currentPassword = (document.getElementById("current-password") as HTMLInputElement).value;
            const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;

            // Retrieve user data from localStorage
            const user = localStorage.getItem("user");
            if (user) {
                const userData = JSON.parse(user);
                
                // Basic validation
                if (currentPassword && currentPassword !== userData.password) {
                    showCustomAlert("Current password is incorrect!");
                    return;
                }

                if (!currentPassword && newPassword) {
                    showCustomAlert("Please enter your current password to change it!");
                    return;
                }

                // if the user didnt change anything
                
                // Update userData with new form values
                if (slogan) userData.slogan = slogan;
                if (username) userData.username = username;
                if (newPassword) userData.password = newPassword;
                
                // Handle profile picture upload
                const fileInput = document.getElementById("pen") as HTMLInputElement;
                if (fileInput.files && fileInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const profilePicture = document.getElementById("profile-picture") as HTMLImageElement;
                        const imageData = e.target?.result as string;
                        
                        // Update the profile picture on the page
                        profilePicture.src = imageData;
                        
                        // Save the image data to localStorage
                        userData.profilePicture = imageData;
                        localStorage.setItem("user", JSON.stringify(userData));
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                } else {
                    // If no new picture is uploaded, keep the existing one
                    if (!userData.profilePicture) {
                        userData.profilePicture = ""; // Default to empty if no picture exists
                    }
                    if (!slogan && !username && !newPassword && !fileInput.files?.length) {
                        showCustomAlert("No changes made!");
                        return;
                    }
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            }
            // Show success message
            showCustomAlert("Settings saved successfully!");
        });
    }

    // On page load, load the profile picture from localStorage
    window.addEventListener("load", () => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            const profilePicture = document.getElementById("profile-picture") as HTMLImageElement;

            if (profilePicture && userData.profilePicture) {
                profilePicture.src = userData.profilePicture;
            }
        }
    });

    // Default color if none is selected yet
    let userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.paddleColor) {
        userData.paddleColor = "#C82767";
        localStorage.setItem("user", JSON.stringify(userData));

    }

    // Highlight the selected color circle
    function highlightSelectedColor(color: string) {
        const allCircles = document.querySelectorAll(".color-circle");
        allCircles.forEach(circle => {
            if ((circle as HTMLElement).dataset.color === color) {
                circle.classList.add("selected");
            } else {
                circle.classList.remove("selected");
            }
        });
    }

    highlightSelectedColor(userData.paddleColor); // Initial highlight

    const colorCircles = document.querySelectorAll(".color-circle");
    colorCircles.forEach((circle) => {
        circle.addEventListener("click", () => {
            const selectedColor = (circle as HTMLElement).dataset.color;
            if (!selectedColor) return;

            // Preserve the current state of 2FA
            userData = JSON.parse(localStorage.getItem("user") || "{}");
            userData.paddleColor = selectedColor;
            localStorage.setItem("user", JSON.stringify(userData));
            showCustomAlert(`Paddle color has been changed`);
            highlightSelectedColor(selectedColor);
            applyPaddleTheme(selectedColor);
        });
    });

    function applyPaddleTheme(color: string) {
        document.documentElement.style.setProperty("--paddle-color", color);
    }

    // Setup default ball if not already saved
    if (!userData.matchBall) {
        userData.matchBall = "/assets/balls/pinkara.png"; // Default ball
        localStorage.setItem("user", JSON.stringify(userData));
    }

    // Highlight selected ball
    function highlightSelectedBall(ballSrc: string) {
        const allBalls = document.querySelectorAll(".ball-image");
        allBalls.forEach(ball => {
            if ((ball as HTMLImageElement).dataset.ball === ballSrc) {
                ball.classList.add("selected");
            } else {
                ball.classList.remove("selected");
            }
        });
    }

    highlightSelectedBall(userData.matchBall); // Highlight default or saved ball

    const ballImages = document.querySelectorAll(".ball-image");
    ballImages.forEach(ball => {
        ball.addEventListener("click", () => {
            const selectedBall = (ball as HTMLImageElement).dataset.ball;
            if (!selectedBall) return;

            userData = JSON.parse(localStorage.getItem("user") || "{}");
            userData.matchBall = selectedBall;
            showCustomAlert(`Ball has been changed`);
            localStorage.setItem("user", JSON.stringify(userData));

            highlightSelectedBall(selectedBall);
        });
    });
}
