let google: any;

export function setupGoogleLogin(
  clientId: string,
  onSuccess: (token: string) => void
) {
  if (!google) {
    google = window['google'];
  }

  if (!google || !google.accounts || !google.accounts.oauth2) {
    console.error('Google API not loaded or not available.');
    return;
  }

  const googleLoginBtn = document.getElementById('google-login-btn');
  if (!googleLoginBtn) {
    console.error('Google login button not found.');
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: any) => {
      if (response.credential) {
        // This is the ID Token (JWT)
        onSuccess(response.credential);
      } else {
        console.error('Google login failed:', response);
      }
    }
  });
  
  google.accounts.id.renderButton(googleLoginBtn, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    locale: 'en',
    width: 300
  });
  
}
