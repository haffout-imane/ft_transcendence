import { renderSettingsPage } from "../pages/settingsPage.js";
import { showCustomAlert } from "./../components/notif.js";
import { handleqrCode } from "./2fa.js";

interface userData {
    username: string;
    slogan: string;
    profilepicture: string;
    paddlecolor: string;
    matchball: string;
    twofa: boolean;
}

export function setupSettingsPage(user: userData) {


    // handle the profile picture change before saving
    const fileInput = document.getElementById("pen") as HTMLInputElement;
    const profilepicture = document.getElementById("profile-picture") as HTMLImageElement;
    let selectedImageData: string | null = null; // Variable to store the selected image data

    if (fileInput) {
        fileInput.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];

                // Check the file size (e.g., max size is 2 MB)
                const maxSizeInBytes = 5 * 1024 * 1024; // 2 MB
                if (file.size > maxSizeInBytes) {
                    showCustomAlert("The selected image is too large. Maximum size is 5 MB.");
                    return; // Stop further processing if the file is too large
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    selectedImageData = e.target?.result as string; // Store the image data
                    if (profilepicture) {
                        profilepicture.src = selectedImageData; // Update the profile picture
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }


    // Handle the 2FA toggle switch
    const toggle = document.getElementById("twofa-toggle");
    // change the nackground color based on the 2FA state
    if (toggle) {
        toggle.classList.toggle("on", user.twofa);
        toggle.classList.toggle("off", !user.twofa);
    }
    if (toggle) {

        toggle.addEventListener("click", async () => {
            toggle.classList.toggle("on");
            toggle.classList.toggle("off");

            // Get the current 2FA state (enabled/disabled)
            const isEnabled = toggle.classList.contains("on");
            
            // let qrcode;
            // if (isEnabled) { // generate QR code
            //     try {
            //         const response = await fetch("/api/setting/twofa", {
            //             method: "PUT",
            //             headers: {
            //                 "Content-Type": "application/json",
            //             },
            //             body: JSON.stringify({ twofa: isEnabled }),
            //             credentials: "include", // Include cookies in the request
            //         });

            //         if (!response.ok) {
            //             throw new Error(`Failed to generate 2FA QR code: ${response.statusText}`);
            //         }

            //         const result = await response.json();
            //         if (!result.success || !result.qrcode) {
            //             showCustomAlert("Failed to generate 2FA QR code.");
            //             toggle.classList.remove("on");
            //             toggle.classList.add("off");
            //             return;
            //         }
            //         else {
            //             qrcode = result.qrcode;
            //         }
            //     }
            //     catch (error) {
            //         console.error("Error generating 2FA QR code:", error);
            //         showCustomAlert("Failed to generate 2FA QR code. Please try again.");
            //         toggle.classList.remove("on");
            //         toggle.classList.add("off");
            //         return;
            //     }
            // }   
                

            // sending request to change 2FA setting
            try {
                const response = await fetch("/api/setting/twofa", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        },
                    body: JSON.stringify({ twofa: isEnabled }), // here this should be added , secret: secret || null, qrcode: qrcode || null }),
                    credentials: "include", // Include cookies in the request
                });

                if (!response.ok) {
                    throw new Error(`Failed to update 2FA setting: ${response.statusText}`);
                }

                const result = await response.json();
                if (!result.success) {
                    showCustomAlert("Failed to update 2FA setting.");
                    return;
                }
                else
                {
                    showCustomAlert("2FA is " + (isEnabled ? "enabled" : "disabled"));
                    if (isEnabled)
                    {
                        const qrcode = result.qrcode; // Assuming the QR code is returned in the response
                        if (qrcode) {
                            handleqrCode(isEnabled, qrcode); // Call the function to handle QR code display
                        } else {
                            showCustomAlert("QR code not received. Please try again.");
                        }
                    }
                }

                    
                    
            }
            catch (error) {
                console.error("Error updating 2FA setting:", error);
                showCustomAlert("Failed to update 2FA setting. Please try again.");
                return;
            }
        });
    }


    async function getImageData(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (e.target?.result) {
                    resolve(e.target.result as string);
                } else {
                    reject("Failed to read file");
                }
            };
            reader.onerror = () => reject("Error reading file");
            reader.readAsDataURL(file);
        });
    }

    // Handle the save button click event
    const saveBtn = document.getElementById("save-settings-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const slogan = (document.getElementById("slogan") as HTMLInputElement).value;
            const username = (document.getElementById("username") as HTMLInputElement).value;
            const currentPassword = (document.getElementById("current-password") as HTMLInputElement).value;
            const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;
            let imageData = null;
            if (user) {

                if (!currentPassword && newPassword) {
                    showCustomAlert("Please enter your current password to change it!");
                    return;
                }
                
                // Handle profile picture upload
                const fileInput = document.getElementById("pen") as HTMLInputElement;
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];

                    // Check the file size (e.g., max size is 5 MB)
                    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
                    if (file.size > maxSizeInBytes) {
                        showCustomAlert("The selected image is too large. Maximum size is 2 MB.");
                        return;
                    }

                    try {
                        imageData = await getImageData(file); // Wait for the image data
                    } catch (error) {
                        console.error("Error reading image file:", error);
                        showCustomAlert("Failed to read image file.");
                        return;
                    }
                }

                if (!slogan && !username && !newPassword && !fileInput.files?.length) {
                    showCustomAlert("No changes made!");
                    return;
                }

                // send all data to backend
                try {
                    const response = await fetch("/api/setting/save", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: username,
                            slogan: slogan || user.slogan,
                            profilepicture: imageData || user.profilepicture, // Use existing if no new image
                            currentPassword: currentPassword || "",
                            newPassword: newPassword || "",
                        }),
                        credentials: "include", // Include cookies in the request
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to save settings: ${response.statusText}`);
                    }

                    const result = await response.json();
                    if (!result.success)
                    {
                        showCustomAlert(result.message || "Failed to save settings.");
                        return;
                    }
                }
                catch (error) {
                    console.error("Error saving settings:", error);
                    showCustomAlert("Failed to save settings. Please try again.");
                    return;
                }
            }
            // Show success message
            showCustomAlert("Settings saved successfully!");
            renderSettingsPage(); // Reload the settings page to reflect changes
        });
    }

    // On page load, load the profile picture from localStorage
    window.addEventListener("load", () => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            const profilepicture = document.getElementById("profile-picture") as HTMLImageElement;

            if (profilepicture && userData.profilepicture) {
                profilepicture.src = userData.profilepicture;
            }
        }
    });

    // Default color if none is selected yet

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

    highlightSelectedColor(user.paddlecolor); // Initial highlight

    const colorCircles = document.querySelectorAll(".color-circle");
    colorCircles.forEach((circle) => {
        circle.addEventListener("click", async () => {
            const selectedColor = (circle as HTMLElement).dataset.color;
            if (!selectedColor) return;

            try {
                const response = await fetch("/api/setting/theme", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        paddlecolor: selectedColor,
                        matchball: user.matchball // Keep the ball unchanged
                    }),
                    credentials: "include", // Include cookies in the request
                });

                if (!response.ok) {
                    throw new Error(`Failed to update paddle color: ${response.statusText}`);
                }
                
                const result = await response.json();
                if (!result.success) {
                    showCustomAlert("Failed to update paddle color.");
                    return;
                }
                renderSettingsPage();
            }

            catch (error) {
                console.error("Error updating paddle color:", error);
                showCustomAlert("Failed to update paddle color. Please try again.");
                return;
            }
        
            showCustomAlert(`Paddle color has been changed`);
            highlightSelectedColor(selectedColor);
            applyPaddleTheme(selectedColor);
        });
    });

    function applyPaddleTheme(color: string) {
        document.documentElement.style.setProperty("--paddle-color", color);
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

    highlightSelectedBall(user.matchball); // Highlight default or saved ball

    const ballImages = document.querySelectorAll(".ball-image");
    ballImages.forEach(ball => {
        ball.addEventListener("click", async () => {
            const selectedBall = (ball as HTMLImageElement).dataset.ball;
            if (!selectedBall) return;

            try {
                const response = await fetch("/api/setting/theme", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        paddlecolor: user.paddlecolor, // Keep the paddle color unchanged
                        matchball: selectedBall
                    }),
                    credentials: "include", // Include cookies in the request
                });

                if (!response.ok) {
                    throw new Error(`Failed to update ball: ${response.statusText}`);
                }

                const result = await response.json();
                if (!result.success) {
                    showCustomAlert("Failed to update ball.");
                    return;
                }
                renderSettingsPage(); // Reload the settings page to reflect changes
            }
            catch (error) {
                console.error("Error updating ball:", error);
                showCustomAlert("Failed to update ball. Please try again.");
                return;
            }
            showCustomAlert(`Ball has been changed`);
            highlightSelectedBall(selectedBall);
        });
    });
}
