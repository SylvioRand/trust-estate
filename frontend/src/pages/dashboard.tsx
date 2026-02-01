import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import VisitsSection from "./dashboard/VisitsSection";
import ReservationsSection from "./dashboard/ReservationsSection";

const DashboardPage: React.FC = () => {
    const { t } = useTranslation("nav");
    const [activeTab, setActiveTab] = useState<string>("visits");

    const menuItems = [
        { id: "visits", label: t("button.dashboard.tabs.visits"), component: <VisitsSection /> },
        { id: "reservations", label: t("button.dashboard.tabs.reservations"), component: <ReservationsSection /> }
    ];

    const currentItem = menuItems.find(item => item.id === activeTab);
    const ActiveComponent = currentItem?.component;

    return (
        <div className="pt-[60px] md:pt-[100px] mb-20 px-4 text-background min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-72 flex-none">
                    <div className="bg-card-bg/30 rounded-3xl p-4 border border-highlight/20 flex flex-col gap-2 shadow-sm">
                        <div className="px-4 py-2 mb-2">
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Menu</h3>
                        </div>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-300 font-bold active:scale-95 ${activeTab === item.id
                                    ? "bg-accent text-foreground shadow-lg scale-102"
                                    : "hover:bg-highlight/10 text-background/60 hover:text-background"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-card-bg/30 rounded-3xl p-6 md:p-10 border border-highlight/20 min-h-[600px] shadow-sm">
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
