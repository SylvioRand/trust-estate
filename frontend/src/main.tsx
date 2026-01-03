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
import VerifyEmailPage from './pages/verify_email.tsx';

const router = createBrowserRouter([
	{
		element: <MainLayout />,
		children: [
			// ==========================================
			// PAGES PUBLIQUES (non-authentifiés uniquement)
			// ==========================================
			{
				path: "/sign-in",
				element:
					<PublicRoot>
						<SignInPage />
					</PublicRoot>
			},
			{
				path: "/sign-up",
				element:
					<PublicRoot>
						<SignUpPage />
					</PublicRoot>
			},
			{
				path: "/forgot-pass",
				element:
					<PublicRoot>
						<ForgotPassPage />
					</PublicRoot>
			},
			{
				path: "/reset-pass",
				element:
					<PublicRoot>
						<ResetPassPage />
					</PublicRoot>
			},
			{
				path: "/welcome",
				element:
					<PublicRoot>
						<WelcomePage />
					</PublicRoot>
			},

			// ==========================================
			// PAGES DE VÉRIFICATION (semi-protégées)
			// ==========================================
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
				element:
					<ProtectedRoute>
						<HomePage />
					</ProtectedRoute>
			},
			{
				path: "/property",
				element:
					<ProtectedRoute>
						<PropertyPage />
					</ProtectedRoute>
			},
			{
				path: "/ai",
				element:
					<ProtectedRoute>
						<ChatBot />
					</ProtectedRoute>
			},

			// ==========================================
			// REDIRECTIONS PAR DÉFAUT
			// ==========================================
			{
				path: "/",
				element: <Navigate to="/sign-in" replace />
			},
			{
				path: "*",
				element: <Navigate to="/sign-in" replace />
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
