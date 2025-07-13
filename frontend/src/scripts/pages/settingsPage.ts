import { authService } from "../utils/auth.js";
import { setupSettingsPage } from "../utils/settings.js";
import { showCustomAlert } from "../components/notif.js";

interface userData {
	username: string;
	slogan: string;
	profilepicture: string;
	paddlecolor: string;
	matchball: string;
	twofa: boolean;
	remote: boolean;
}

let isBlocked: boolean;

export async function renderSettingsPage() {

	let user : userData | null = null;
	try {
		const response = await fetch("/api/setting/data", {
			method: "GET",
			credentials: "include", // Include cookies in the request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch settings data`);
		}

		let data : userData;
		try {
			data = await response.json();
		} catch (error) {
			console.error("Error parsing JSON:", error);
			return;
		}

		if (!data)
			throw new Error("No user data found");
		console.table(data);
		user = data; // Store the user data for later use

		if (user.remote === true) {
			isBlocked = true;
		}
		else {
			isBlocked = false;
		}

	}
	catch (error) {
		console.error("Error fetching settings data:", error);
		return;
	}
	
	const app = document.getElementById("main-page");
    if (!app) return;

    app.innerHTML = `
	<div class="home-background">
		<a href="/home" data-link class="logo-link">
			<img src="/assets/logo.png" alt="logo" class="logo-icon" />
		</a>
  
		<a href="/profile" data-link class="profile-link">
			<img src="/assets/profile/profile_1.png" alt="Profile" class="profile-icon" />
		</a>
  
		<a href="/settings" data-link class="settings-link">
			<img src="/assets/setting/setting_2.png" alt="Settings" class="settings-icon" />
		</a>
  
		<a href="/chat" data-link class="chat-link">
			<img id="chat-image" src="/assets/chat/chat_1.png" alt="Chat" class="chat-icon" />
		</a>
  
		<div class="window">
			<div class="exit">
				<a href="/home" data-link>
					<img src="/assets/buttons/exit.png" alt="exit"/>
				</a>
			</div>

			<div class="settings-container">
				<div class="profile-edit-header">
					<p class="Space_Font_settings">Edit Profile </p>
				</div>
				<div class="theme-edit-header">
					<p class="Space_Font_settings">Change Theme</p>
				</div>

				<div class="profile-edit">
					<div class="picture-edit">
						<img id="profile-picture" src="${user.profilepicture}" class="profile-picture" alt="Profile Picture" />
						<label for="pen" class="profile-picture-pen">
							<img id="profile-preview" src="assets/profile/pen.png" alt="Profile Picture" />
						</label>
						<input type="file" id="pen" accept="image/*" hidden />
					</div><br>

					<div class="profile-form">
						<div class="form-group">
							<p class="first_p">Slogan</p>
							<input type"text" id="slogan" placeholder="${user.slogan}" autocomplete="off"/>
						</div>

						<div class="form-group">
							<p class="first_p">Change Username</p>
							<input type"text" id="username" placeholder="${user.username}" autocomplete="off"/>
						</div>

						<div class="form-group">
							<p class="first_p">Current Password</p>
							<input type="password" id="current-password" placeholder="Current Password" />
						</div>

						<div class="form-group">
							<p class="first_p">New Password</p>
							<input type="password" id="new-password" placeholder="New Password" />
						</div>

						<div class="form-group">
							<div class="twofa-row">
								<p class="first_p">Two-Factor Authentication (2FA)</p>
								<div id="twofa-toggle" class="twofa-switch off">
									<span class="toggle-circle"></span>
								</div>
							</div>
						</div>

						<div class="form-group">
							<div class="cnt">
  								<button id="save-settings-btn" class="save-settings-btn">Save</button>
							</div>						
						</div>
					</div>
				</div>


				<div class="theme-edit">
					
					<div class="color-picker-header">
						<p class="Space_Font_settings">Match paddles</p>
					</div> 

					<div class="paddle-color-options">
						<div class="color-row">
							<div class="color-circle" data-color="#BD9D4D" style="background-color: #BD9D4D;"></div>
							<div class="color-circle" data-color="#A07200" style="background-color: #A07200;"></div>
							<div class="color-circle" data-color="#D0ADDC" style="background-color: #D0ADDC;"></div>
							<div class="color-circle" data-color="#92799A" style="background-color: #92799A;"></div>
							<div class="color-circle" data-color="#ADCD60" style="background-color: #ADCD60;"></div>
						</div>
						<div class="color-row">
							<div class="color-circle" data-color="#C2C2C2" style="background-color: #C2C2C2;"></div>
							<div class="color-circle" data-color="#156863" style="background-color: #156863;"></div>
							<div class="color-circle" data-color="#48a8dc" style="background-color: #48a8dc;"></div>
							<div class="color-circle" data-color="#EC6585" style="background-color: #EC6585;"></div>
							<div class="color-circle" data-color="#C82767" style="background-color: #C82767;"></div>
						</div>
					</div>

					<div class="ball-picker-header">
						<p class="Space_Font_settings">Match ball</p>
					</div>

					<div class="ball-options">
						<div class="ball-row">
							<img class="ball-image" src="/assets/balls/moon.png" data-ball="/assets/balls/moon.png" alt="moon">
							<img class="ball-image" src="/assets/balls/pinkara.png" data-ball="/assets/balls/pinkara.png" alt="pinkara">
							<img class="ball-image" src="/assets/balls/azuris.png" data-ball="/assets/balls/azuris.png" alt="azuris">
						</div>
						<div class="ball-row">
							<img class="ball-image" src="/assets/balls/earth.png" data-ball="/assets/balls/earth.png" alt="earth">
							<img class="ball-image" src="/assets/balls/violetis.png" data-ball="/assets/balls/violetis.png" alt="violetis">
							<img class="ball-image" src="/assets/balls/solara.png" data-ball="/assets/balls/solara.png" alt="solara">
						</div>
					</div>



				</div>

			</div>
			<div class="logout">
				<a href="/authentication" data-link>
					<img src="/assets/buttons/logout.png" alt="logout" id="logout"/>
				</a>
			</div>
					
				
			</div>
		</div>
	</div>
  `;


  const currentPasswordInput = document.getElementById('current-password') as HTMLInputElement;
  const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;
  const twofaToggle = document.getElementById('twofa-toggle') as HTMLDivElement;

  if (isBlocked) {
    // Update the placeholder and styles for "Current Password"
    currentPasswordInput.placeholder = "You cannot change your password while remote authentication";
    currentPasswordInput.disabled = true;
    currentPasswordInput.style.cursor = "not-allowed";
    
    // Update the placeholder and styles for "New Password"
    newPasswordInput.placeholder = "You cannot change your password while remote authentication";
    newPasswordInput.disabled = true;
    newPasswordInput.style.cursor = "not-allowed";

	twofaToggle.style.opacity = "0.5";
    twofaToggle.style.cursor = "not-allowed";
    twofaToggle.style.pointerEvents = "none";
    twofaToggle.setAttribute('title', 'You cannot change 2FA while remote authentication is enabled');
 }

 	const logoutButton = document.getElementById("logout") as HTMLAnchorElement;
	  logoutButton.addEventListener("click", (event) => {
		showCustomAlert("Logout successful!");
	  });
	setupSettingsPage(user);







  }
  