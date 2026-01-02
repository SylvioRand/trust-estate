import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import "./index.css"
import "./i18n/i18n.ts";

import PublicRoot from './components/PublicRoot.tsx';
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
			// should be protected
			{
				path: "/verify-email",
				element:
					<PublicRoot>
						<VerifyEmailPage />
					</PublicRoot>

			},
			{
				path: "/welcome",
				element:
					<PublicRoot>
						<WelcomePage />
					</PublicRoot>
			},
			{
				path: "/add-phone",
				element:
					<PublicRoot>
						<AddPhonePage />
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
				path: "/forgot-pass",
				element:
					<PublicRoot>
						<ForgotPassPage />
					</PublicRoot>

			},



			{
				path: "/home",
				element:
					<PublicRoot>
						<HomePage />
					</PublicRoot>

			},
			{
				path: "/property",
				element:
					<PublicRoot>
						<PropertyPage />
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
				path: "/sign-in",
				element:
					<PublicRoot>
						<SignInPage />
					</PublicRoot>

			},
			{
				path: "/ai",
				element:
					<PublicRoot>
						<ChatBot />
					</PublicRoot>

			},
			{
				path: "*",
				element:
					<Navigate to="/sign-in" replace />

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
