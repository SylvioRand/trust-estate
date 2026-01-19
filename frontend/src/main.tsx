import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import "./index.css"
import "./i18n/i18n.ts";

import { GoogleOAuthProvider } from '@react-oauth/google';
import SignUpPage from './pages/sign_up.tsx';
import MainLayout from './layout/layout.tsx';
import SignInPage from './pages/sign_in.tsx';
import ForgotPassPage from './pages/forgot_pass.tsx';
import ResetPassPage from './pages/reset_pass.tsx';
import AddPhonePage from './pages/add_phone.tsx';
import HomePage from './pages/home.tsx';
import PropertyPage from './pages/property.tsx';
import WelcomePage from './pages/welcome.tsx';
import EmailSentPage from './pages/email_sent.tsx';
import VerifyEmailPage from './pages/verify_email.tsx';
import ListingsPage from './pages/listings.tsx';
import DataProvider from './provider/DataProvider.tsx';
import PublishPage from './pages/publish.tsx';
import SellerSlotsPage from './pages/seller_slots.tsx';
import SettingsPage from './pages/settings.tsx';
import ProfilePage from './pages/profile.tsx';
import AIPage from './pages/ai.tsx';
import BuyerSlotsPage from './pages/buyer_slots.tsx';

const router = createBrowserRouter([
	{
		element: <MainLayout />,
		children: [
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
				path: "/property/listings",
				element: <ListingsPage />
			},
			{
				path: "/profile/publish",
				element: <PublishPage/>
			},
			{
				path: "/email-sent",
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
				element: <AIPage />
			},
			{
				path: "/profile",
				element: <ProfilePage />
			},
			{
				path: "/profile/settings",
				element: <SettingsPage />
			},
			{
				path: "/property/listings/seller-slots",
				element: <SellerSlotsPage />
			},
			{
				path: "/property/listings/buyer-slots",
				element: <BuyerSlotsPage />
			},
			{
				path: "/",
				element: <Navigate to="/home" replace />
			},
		]
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<DataProvider>
				<RouterProvider router={router} />
			</DataProvider>
		</GoogleOAuthProvider>
	</React.StrictMode>,
);
