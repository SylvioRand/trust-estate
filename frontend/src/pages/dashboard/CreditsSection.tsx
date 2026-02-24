import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export interface HistoryItem {
	id: string;
	type: string;
	reason: string;
	amount: number;
	balanceAfter: number;
	createdAt: string;
}

const CreditsSection: React.FC = () => {
	const { t } = useTranslation(["profile", "error"]);

	const [creditBalance, setCreditBalance] = useState<number>(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [historyLoading, setHistoryLoading] = useState<boolean>(true);
	const [rechargeLoading, setRechargeLoading] = useState<boolean>(false);
	const [showRecharge, setShowRecharge] = useState<boolean>(false);

	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const response = await fetch("/api/credits/balance", {
					method: "GET",
					credentials: "include",
				});
				const data = await response.json();
				if (response.ok && typeof data.balance === "number") {
					setCreditBalance(data.balance);
				}
			} catch {
				
			}
		};
		fetchBalance();
	}, []);

	const fetchHistory = async () => {
		setHistoryLoading(true);
		try {
			const response = await fetch("/api/credits/history?page=1&limit=20", {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			if (response.ok) {
				setHistory(data.data ?? []);
			} else if (response.status === 404) {
				setHistory([]);
			} else {
				toast.error(t(`error:${data.message}`));
			}
		} catch {
			setHistory([]);
		} finally {
			setHistoryLoading(false);
		}
	};

	useEffect(() => {
		fetchHistory();
	}, []);

	const handleRecharge = async () => {
		setRechargeLoading(true);
		try {
			const response = await fetch("/api/credits/recharge/me", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: 5, reason: "recharge_pack", type: "recharge" }),
			});
			const data = await response.json();
			if (!response.ok) {
				toast.error(t(`error:${data.message ?? "common.internal_server_error"}`));
				return;
			}
			setCreditBalance(data.newBalance);
			setShowRecharge(false);
			await fetchHistory();
		} catch {
			toast.error(t("error:common.internal_server_error"));
		} finally {
			setRechargeLoading(false);
		}
	};

	return (
		<div className="w-full">
			<div className="flex items-center justify-between w-full mb-6">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-xl font-bold">
						<span className="font-icon text-lg"></span>
						<span>{creditBalance}</span>
						<span className="text-sm font-light opacity-70">{t("profile:credits")}</span>
					</div>
				</div>
				<button
					onClick={() => setShowRecharge((v) => !v)}
					className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-foreground text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
				>
					<span className="font-icon"></span>
					{t("profile:creditSection.recharge")}
				</button>
			</div>

			{showRecharge && (
				<div className="w-full mb-8 p-5 rounded-2xl bg-background/5 border border-highlight/10">
					<div className="text-sm font-semibold mb-4 opacity-60 uppercase tracking-widest">
						{t("profile:creditSection.rechargeTitle")}
					</div>
					<button
						disabled={rechargeLoading}
						onClick={() => handleRecharge()}
						className="flex items-center justify-center gap-3
							px-8 py-5 rounded-2xl w-full
							bg-card-bg border border-highlight/20
							hover:border-accent/60 hover:bg-accent/5
							transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="font-icon text-3xl"></span>
						<span className="font-black text-2xl">+5</span>
						<span className="text-sm font-light opacity-50">{t("profile:credits")}</span>
					</button>
					{rechargeLoading && (
						<div className="text-sm font-light opacity-60 mt-3">
							{t("profile:creditSection.recharging")}
						</div>
					)}
				</div>
			)}

			<div className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-4">
				{t("profile:creditSection.historyTitle")}
			</div>

			{historyLoading ? (
				<div className="flex flex-col gap-3 w-full">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-14 rounded-xl bg-highlight/10 animate-pulse w-full" />
					))}
				</div>
			) : history.length === 0 ? (
				<div className="flex flex-col items-center justify-center w-full py-12 gap-3 opacity-40">
					<span className="font-icon text-5xl"></span>
					<span className="text-sm font-light">{t("profile:creditSection.noHistory")}</span>
				</div>
			) : (
				<div className="flex flex-col gap-2 w-full">
					{history.map((item) => {
						const isCredit =
							item.type === "recharge" ||
							item.type === "bonus" ||
							item.type === "refund";
						return (
							<div
								key={item.id}
								className="flex items-center justify-between
									px-5 py-4 rounded-xl
									bg-card-bg border border-highlight/10
									hover:border-highlight/20 transition-colors
									w-full"
							>
								<div className="flex items-center gap-4">
									<span
										className="font-icon text-xl flex-none"
										style={{
											color: isCredit
												? "var(--color-green-400, #4ade80)"
												: "var(--color-red-400, #f87171)",
										}}
									>
										{isCredit ? "" : ""}
									</span>
									<div className="flex flex-col">
										<span className="text-sm font-semibold">
											{String(t(`profile:creditSection.type.${item.type}`))}
										</span>
										<span className="text-xs font-light opacity-50">
											{String(t(`profile:creditSection.reason.${item.reason}`))}
										</span>
									</div>
								</div>
								<div className="flex flex-col items-end gap-0.5 flex-none">
									<span
										className="font-bold text-base"
										style={{
											color: isCredit
												? "var(--color-green-400, #4ade80)"
												: "var(--color-red-400, #f87171)",
										}}
									>
										{isCredit ? "+" : "−"}{item.amount}
									</span>
									<span className="text-xs opacity-30">
										{new Date(item.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default CreditsSection;
