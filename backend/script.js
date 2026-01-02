// --- GESTION DE L'INTERFACE (UI) ---

// URL de base de l'API Gateway
const API_BASE_URL = 'http://127.0.0.1:3001';

// Variables temporaires pour le resend
let tempEmail = '';
let tempLastName = '';
let resendTimerInterval = null;

// Fonction pour afficher le formulaire de connexion
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    // document.getElementById('verification-section').classList.add('hidden');

    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-signup').classList.remove('active');

    clearErrors();
}

// Fonction pour afficher le formulaire d'inscription
function showSignup() {
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    // document.getElementById('verification-section').classList.add('hidden');

    document.getElementById('tab-signup').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');

    clearErrors();
}

// Afficher la section "Vérifiez votre email"
function showVerification(email, lastName) {
    document.getElementById('auth-section').classList.add('hidden'); // Cache tout le bloc Auth
    document.getElementById('verification-section').classList.remove('hidden');

    document.getElementById('verify-email-display').textContent = email;

    // Sauvegarde pour le resend
    tempEmail = email;
    tempLastName = lastName;

    startResendTimer();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
    const resendMsg = document.getElementById('resend-message');
    if (resendMsg) resendMsg.textContent = '';
}

// --- LOGIQUE TIMER RESEND ---
function startResendTimer() {
    const btn = document.getElementById('btn-resend');
    const timerSpan = document.getElementById('resend-timer');
    let timeLeft = 60;

    btn.disabled = true;
    if (timerSpan) timerSpan.textContent = timeLeft;

    if (resendTimerInterval) clearInterval(resendTimerInterval);

    resendTimerInterval = setInterval(() => {
        timeLeft--;
        if (timerSpan) timerSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(resendTimerInterval);
            btn.disabled = false;
            btn.textContent = "Renvoyer l'email";
        }
    }, 1000);
}

// --- GESTION DES REQUÊTES API (Fetch) ---

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Une erreur est survenue.');
    }
    return response.json();
}

async function googleOauth() {
	window.location.href = `${API_BASE_URL}/auth/google`;
}

// Gérer la soumission du LOGIN
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        errorDiv.textContent = 'Connexion en cours...';
        errorDiv.style.color = '#6b7280';

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        
        // Vérifier si l'email n'est pas vérifié (403)
        if (response.status === 403 && data.error === 'email_not_verified') {
            window.location.href = 'request-email-verification.html';
            return;
        }
        
        if (!response.ok) {
			throw new Error(data.message || 'Erreur de connexion');
        }

        console.log('Login réussi:', data);

        // Stocker l'utilisateur dans un cookie
        setCookie('user_data', JSON.stringify(data), 1);

        // Essayer d'accéder au profil pour vérifier les statuts
        const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            credentials: 'include'
        });
		
		console.log(profileResponse);
        if (profileResponse.ok) {
            window.location.href = 'profile.html';
        } else if (profileResponse.status === 403) {
            // Téléphone non vérifié
            const errorData = await profileResponse.json();
            if (errorData.error === 'phone_number_not_verified') {
                window.location.href = 'add-phone.html';
                return;
            }
        }

        // Par défaut, aller au profil
        window.location.href = 'profile.html';

    } catch (error) {
        console.error('Erreur Login:', error);
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = error.message;
    }
}

// Gérer la soumission du SIGNUP
async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;

    const errorDiv = document.getElementById('signup-error');

    try {
        errorDiv.textContent = 'Inscription en cours...';
        errorDiv.style.color = '#6b7280';

        const payload = { email, firstName, lastName, phone, password };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        const data = await handleResponse(response);
        console.log('Signup réussi:', data);

        // Rediriger vers la page de vérification d'email
        window.location.href = 'request-email-verification.html';

    } catch (error) {
        console.error('Erreur Signup:', error);
        errorDiv.style.color = '#ef4444';
        errorDiv.textContent = error.message;
    }
}

// Gérer le RENVOI D'EMAIL
async function handleResendEmail() {
    const errorDiv = document.getElementById('resend-message');
    if (!tempEmail || !tempLastName) {
        errorDiv.textContent = "Erreur : données manquantes. Veuillez vous réinscrire.";
        return;
    }

    try {
        errorDiv.textContent = "Envoi en cours...";
        errorDiv.style.color = "#6b7280";

        const response = await fetch(`${API_BASE_URL}/auth/resend-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tempEmail, lastName: tempLastName }),
            credentials: 'include'
        });

        await handleResponse(response);

        errorDiv.textContent = "Email renvoyé !";
        errorDiv.style.color = "green";

        // Redémarrer le timer
        startResendTimer();

    } catch (error) {
        console.error("Erreur Resend:", error);
        errorDiv.textContent = error.message;
        errorDiv.style.color = "#ef4444";
    }
}

// Utilitaires Cookies
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

// Au chargement, si cookie user existe, rediriger
window.addEventListener('DOMContentLoaded', async () => {
	try {
		const res = await fetch(`${API_BASE_URL}/users/me`, {
			method: 'GET',
            credentials: 'include'
		});
		
		if (res.ok) {
			window.location.href = 'profile.html';
		} else if (res.status === 403) {
			// Téléphone non vérifié
			const errorData = await res.json();
			if (errorData.error === 'phone_number_not_verified') {
				window.location.href = 'add-phone.html';
			}
		} else if (res.status === 401) {
			// Email non vérifié ou non authentifié
			const errorData = await res.json();
			if (errorData.error === 'email_not_verified') {
				window.location.href = 'request-email-verification.html';
			}
		}
	} catch (error) {
		console.log("Erreur lors de la vérification de l'authentification:", error);
	}
});
