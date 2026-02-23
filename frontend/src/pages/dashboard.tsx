import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import VisitsSection from "./dashboard/VisitsSection";
import ReservationsSection from "./dashboard/ReservationsSection";
import useDataProvider from "../provider/useDataProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import CreditsSection from "./dashboard/CreditsSection";

const DashboardPage: React.FC = () => {
	const { t } = useTranslation("nav");
	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<string>("visits");
	VerifyUsersState()
	const { isConnected } = useDataProvider();

	useEffect(() => {
		if (isConnected !== null && isConnected === false) {
			navigate("/sign-in", { state: { from: location.pathname } });
		}
	}, [isConnected])

  const menuItems = [
    { id: "visits", label: t("button.dashboard.tabs.visits"), icon: "👁", component: <VisitsSection /> },
    { id: "reservations", label: t("button.dashboard.tabs.reservations"), icon: "📅", component: <ReservationsSection /> },
    { id: "credits", label: t("button.dashboard.tabs.credits"), icon: "🪙", component: <CreditsSection /> }
  ];

	const currentItem = menuItems.find(item => item.id === activeTab);
	const ActiveComponent = currentItem?.component;

  return (
    <div className="bg-(--color-bg-dash) pt-[60px] lg:pt-[100px] mb-20 px-4 text-background min-h-screen transition-all duration-500">
      <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* SIDEBAR */}
        <div className="w-full lg:w-60 flex-none">
          <div className="bg-card-bg/30 backdrop-blur-md rounded-2xl p-4 border border-highlight/20 flex flex-col gap-2 shadow-2xl">
            <div className="px-4 py-2 mb-2 border-b border-highlight/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Menu</h3>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all duration-500 font-bold active:scale-95 group flex items-center gap-3 ${activeTab === item.id
                  ? "bg-accent text-foreground shadow-[0_0_20px_rgba(255,191,0,0.3)] scale-102"
                  : "hover:bg-highlight/10 text-background/60 hover:text-background"
                  }`}
              >
                <span className={`transition-transform duration-500 ${activeTab === item.id ? "rotate-12 scale-110" : "group-hover:rotate-12"}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

				{/* CONTENT AREA */}
				<div className="flex-1 bg-card-bg/30 backdrop-blur-md rounded-2xl p-4 sm:p-8 lg:p-10 border border-highlight/20 min-h-[600px] shadow-2xl overflow-hidden">
					<header className="mb-10">
						<h2 className="text-4xl font-black tracking-tight">
							{currentItem?.label}
						</h2>
						<div className="w-20 h-1 bg-accent mt-4 rounded-full opacity-80"></div>
					</header>

					<div className="animate-fade-in">
						{ActiveComponent}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
