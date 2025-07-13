export async function handleqrCode(isEnabled: boolean, qrcode: string | null){
    let qrWindow = null;
    if (isEnabled) {   
        const qrHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>2FA QR Code</title>
                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background-color: #1e1e2f;
                        color: #f0f0f0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    img {
                        max-width: 90%;
                        height: auto;
                        border: 6px solid #333;
                        border-radius: 12px;
                        box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                    }
                    p {
                        margin-top: 20px;
                        font-size: 16px;
                        text-align: center;
                        max-width: 90%;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <img src="${qrcode}" alt="QR Code" />
                <p>Scan this QR code with your authenticator app (like Google Authenticator or Authy) to enable two-factor authentication for your account.</p>
            </body>
            </html>
        `;
    
        qrWindow = window.open("", "QRCodeWindow",   `width=420px,height=420px,left=${window.innerWidth / 2 - 150},top=${window.innerHeight / 2 - 150}`
        );
        qrWindow.document.write(qrHtml);
        qrWindow.document.close();
    }
    else {
        if (qrWindow && !qrWindow.closed) {
            qrWindow.close();
            qrWindow = null;
        }

    }
}

export async function handleCode2fa() {
    return new Promise((resolve) => {
        let code2faWindow = null;
        const code2faHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Enter 2FA Code</title>
                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background-color: #1e1e2f;
                        color: #f0f0f0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    input {
                        width: 100px;
                        padding: 10px;
                        font-size: 16px;
                        border: 2px solid #333;
                        border-radius: 8px;
                        background-color: #282c34;
                        color: #f0f0f0;
                        margin-bottom: 20px;
                    }
                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 8px;
                        background-color: #4caf50;
                        color: white;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <input type="text" id="code2fa-input" placeholder="Enter Code" />
                <button id="submit-code2fa">Submit</button>
                <script>
                    document.getElementById('submit-code2fa').addEventListener('click', async () => {
                        const code = document.getElementById('code2fa-input').value;
                        if (!code) {
                            alert('Please enter the code.');
                            return;
                        }
                        try {
                            const response = await fetch('/api/verifytwofa', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: code }),
                                credentials: 'include'
                            });
                            const data = await response.json();
                            if (data.success) {
                                // Communicate success back to parent window
                                window.opener.postMessage({ success: true }, '*');
                                window.close();
                            } else {
                                alert('Invalid code. Please try again.');
                                // Optionally communicate failure back to parent
                                window.opener.postMessage({ success: false, message: data.message }, '*');
                            }
                        } catch (error) {
                            console.error('Error verifying 2FA:', error);
                            alert('An error occurred while verifying the code.');
                            window.opener.postMessage({ success: false, message: 'Network error' }, '*');
                        }
                    });
                </script>
            </body>
            </html>
        `;
        code2faWindow = window.open("", "Code2FAWindow", 
        `width=420px,height=420px,left=${window.innerWidth / 2 - 150},top=${window.innerHeight / 2 - 150}`);
        code2faWindow.document.write(code2faHtml);
        code2faWindow.document.close();
        
        // Listen for messages from the popup
        function handleMessage(event) {
            // Clean up the event listener
            window.removeEventListener('message', handleMessage);
            
            // Resolve the promise with the result
            resolve(event.data.success);
        }
        
        window.addEventListener('message', handleMessage);
        
        // Handle case where user closes window without submitting
        const checkClosed = setInterval(() => {
            if (code2faWindow.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', handleMessage);
                resolve(false); // User closed window, treat as failure
            }
        }, 1000);
    });
}