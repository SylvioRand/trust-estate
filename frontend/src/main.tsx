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
import TermOfServicePage from './pages/term_of_service.tsx';
import PrivacyPolicyPage from './pages/privacy_policy.tsx';
import EditPage from './pages/edit.tsx';
import DashboardPage from './pages/dashboard.tsx';
import FlaggedPage from './pages/flaggedPage.tsx';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 429) {
    window.location.href = "/429.html";
  }
  return response;
};

const router = createBrowserRouter([
  {
    element: (
      <DataProvider>
        <MainLayout />
      </DataProvider>
    ),
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
        path: "/sign-in/forgot-pass",
        element: <ForgotPassPage />
      },
      {
        path: "/sign-in/reset-password",
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
        element: <PublishPage />
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
        path: "/profile/moderator/flagged",
        element: <FlaggedPage />
      },
      {
        path: "/property/listings/edit",
        element: <EditPage />
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
        path: "/terms-of-service",
        element: <TermOfServicePage />
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
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
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
