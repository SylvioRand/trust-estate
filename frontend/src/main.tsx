import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import "./index.css"
import "./i18n/i18n.ts";

import PublicRoot from './components/PublicRoot.tsx';
import ProtectedRoute from './components/ProtectedRoot.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SignUpPage from './pages/sign_up.tsx';
import NavBar from './components/NavBar.tsx';
import MainLayout from './layout/layout.tsx';
import SignInPage from './pages/sign_in.tsx';
import ChatBot from './pages/ChatBot.tsx';
import ForgotPassPage from './pages/forgot_pass.tsx';
import ResetPassPage from './pages/reset_pass.tsx';
import AddPhonePage from './pages/add_phone.tsx';
import HomePage from './pages/home.tsx';
import PropertyPage from './pages/property.tsx';
import WelcomePage from './pages/welcome.tsx';
import EmailSentPage from './pages/email_sent.tsx';
import VerifyEmailPage from './pages/verify_email.tsx';
import ListingsPage from './pages/listings.tsx';

const router = createBrowserRouter([
	{
		element: <MainLayout />,
		children: [
			// ==========================================
			// PAGES PUBLIQUES (non-authentifiés uniquement)
			// ==========================================
			{
				path: "/sign-in",
				element: <SignInPage />
			},
			{
				path: "/sign-up",
				element: <SignUpPage />
			},
			{
				path: "/forgot-pass",
				element: <ForgotPassPage />
			},
			{
				path: "/reset-pass",
				element: <ResetPassPage />
			},
			{
				path: "/welcome",
				element: <WelcomePage />
			},
			{
				path: "/listings",
				element: <ListingsPage />
			},



			// ==========================================
			// PAGES DE VÉRIFICATION (semi-protégées)
			// ==========================================
			{
				path: "email-sent",
				element: <EmailSentPage />
			},
			{
				path: "/verify-email",
				element: <VerifyEmailPage />
			},
			{
				path: "/add-phone",
				element: <AddPhonePage />
			},

			// ==========================================
			// PAGES PROTÉGÉES (authentifiés uniquement)
			// ==========================================
			{
				path: "/home",
				element: <HomePage />
			},
			{
				path: "/property",
				element: <PropertyPage />
			},
			{
				path: "/ai",
				element: <ChatBot />
			},

			// ==========================================
			// REDIRECTIONS PAR DÉFAUT
			// ==========================================
			{
				path: "/",
				element: <Navigate to="/home" replace />
			},
			{
				path: "*",
				element: <Navigate to="/home" replace />
			},
		]
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<RouterProvider router={router} />
		</GoogleOAuthProvider>
	</React.StrictMode>,
);
