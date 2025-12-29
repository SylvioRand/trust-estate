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
import VerifyEmailPage from './pages/verify_email.tsx';
import HomePage from './pages/home.tsx';
import PropertyPage from './pages/property.tsx';

const router = createBrowserRouter([
{
		element: <MainLayout/>,
		children:[
			// should be protected
			{
				path: "/verify_email",
				element:
					<PublicRoot>
						<VerifyEmailPage/>
					</PublicRoot>
					
			},
			{
				path: "/add_phone",
				element:
					<PublicRoot>
						<AddPhonePage/>
					</PublicRoot>
					
			},
			{
				path: "/reset_pass",
				element:
					<PublicRoot>
						<ResetPassPage/>
					</PublicRoot>
					
			},
			{
				path: "/forgot_pass",
				element:
					<PublicRoot>
						<ForgotPassPage/>
					</PublicRoot>
					
			},
			


			{
				path: "/home",
				element:
					<PublicRoot>
						<HomePage/>
					</PublicRoot>
					
			},
			{
				path: "/property",
				element:
					<PublicRoot>
						<PropertyPage/>
					</PublicRoot>
					
			},
			{
				path: "/sign_up",
				element:
					<PublicRoot>
						<SignUpPage/>
					</PublicRoot>
					
			},
			{
				path: "/sign_in",
				element:
					<PublicRoot>
						<SignInPage/>
					</PublicRoot>
					
			},
			{
				path: "/chat_bot",
				element:
					<PublicRoot>
						<ChatBot/>
					</PublicRoot>
					
			},
			{
				path: "*",
				element:
					<Navigate to="/sign_in" replace/>
					
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
