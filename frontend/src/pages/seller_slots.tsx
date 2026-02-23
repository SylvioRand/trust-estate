import type { TFunction } from "i18next";
import React, { useEffect, useMemo, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import PopUp, { type PopUpAPI } from "../components/PopUp";
import TimeInput from "../components/TimeInput";
import ActionButton from "../components/ActionButton";
import type { SlotsData } from "../dataModel/modelSlots";
import i18n from "../i18n/i18n";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ContentDivider from "../components/ContentDivider";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

interface AddSlotsButtonProps {
	t: TFunction<"slots">;
	setOpenPopUpAddSlots: Dispatch<SetStateAction<boolean>>;
}

const AddSlotsButton: React.FC<AddSlotsButtonProps> = ({
	t = null,
	setOpenPopUpAddSlots = null
}) => {
	const [hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="flex flex-col items-center justify-center
			border border-background/25
			rounded-md
			p-2
			cursor-pointer
			transition-colors duration-200
			shadow-standard
			w-40 h-40"
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			style={{
				background: hovered ? "color-mix(in srgb, var(--color-accent) 25%, transparent)" : "transparent"
			}}
			onClick={() => {
				if (setOpenPopUpAddSlots)
					setOpenPopUpAddSlots(true);
			}}
		>
			<div className="font-icon text-2xl">
				󰐕
			</div>
			<div className="font-light text-sm">
				{t && t("buttons.create.title")}
			</div>
		</div>
	);
}



interface CreateSlotPopUpContentProps {
	t: TFunction<"slots">;
	refOpenPopUpAddSlots: RefObject<PopUpAPI | null>;
	fetchedSlots: SlotsData[];
	setFetchedSlots: Dispatch<SetStateAction<SlotsData[]>>;
}

const CreateSlotPopUpContent: React.FC<CreateSlotPopUpContentProps> = ({
	t = null,
	refOpenPopUpAddSlots = null,
	fetchedSlots = [],
	setFetchedSlots
}) => {
	let tmpSlots: SlotsData;

	function toMinutes(time: string): number {
		const [h, m] = time.split(":").map(Number);

		return (h * 60 + m);
	}

	function isOverlapping(a: SlotsData, b: SlotsData): boolean {
		if (a.dayOfWeek !== b.dayOfWeek)
			return (false);

		const startA = toMinutes(a.startTime);
		const endA = toMinutes(a.endTime);
		const startB = toMinutes(b.startTime);
		const endB = toMinutes(b.endTime);

		return (startA < endB && startB < endA);
	}

	function areInvalid(value: SlotsData): boolean {
		const startTime = toMinutes(value.startTime);
		const endTime = toMinutes(value.endTime);

		return (startTime > endTime);
	}

	const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		tmpSlots = {
			dayOfWeek: Number(data.dayOfWeek),
			startTime: data.startTime.toString(),
			endTime: data.endTime.toString(),
			taken: true,
		}

		if (areInvalid(tmpSlots)) {
			toast.error(t && t("errors.time_invalid"));
			return;
		}

		for (let i = 0; i < fetchedSlots.length; i++) {
			if (isOverlapping(fetchedSlots[i], tmpSlots)) {
				toast.error(t && t("errors.overlapping"));
				return;
			}
		}

		// NOTE: append the slots to the Array
		setFetchedSlots([...fetchedSlots, tmpSlots]);

		if (refOpenPopUpAddSlots)
			refOpenPopUpAddSlots.current?.close();
	}

	return (
		<form
			className="flex flex-col items-center justify-center
			gap-4
			w-full"
			onSubmit={handleAdd}
		>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
				w-full"
			>
				<label
					className="justify-self-start"
					htmlFor="dayOfWeek"
				>
					{t && t("popup.create.dayOfTheWeek")}
				</label>
				<select
					name="dayOfWeek"
					className="justify-self-end
					border border-background/25
					rounded-md
					px-2 py-1
					shadow-standard"
					id="dayOfWeek"
				>
					{
						[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
							return (
								<option
									key={dayIndex}
									value={dayIndex}
								>
									{t && t(`day.${dayIndex}`)}
								</option>
							);
						})
					}
				</select>
			</div>

			<TimeInput
				id="startTime"
				name="startTime"
				title={t && t("popup.create.startTime") || "startTime"}
			/>
			<TimeInput
				id="endTime"
				name="endTime"
				title={t && t("popup.create.endTime") || "endTime"}
			/>

			<div className="w-full mt-4">
				<ActionButton
					title={t && t("buttons.create.title") || ""}
					icon="󰐕"
					icon_size={24}
					icon_place="right"
					type="submit"
				/>
			</div>
		</form>
	);
}

interface SlotsBoxProps {
	data: SlotsData;
	t: TFunction<"slots">;
	fetchedSlots: SlotsData[];
	setFetchedSlots: Dispatch<SetStateAction<SlotsData[]>>;
}

const SlotsBox: React.FC<SlotsBoxProps> = ({
	data,
	t = null,
	fetchedSlots = [],
	setFetchedSlots
}) => {

	function formatTimeLocales(time: string): string {
		const date = new Date(`1970-01-01T${time}:00`);
		const formatted = new Intl.DateTimeFormat(i18n.language, {
			hour: "numeric",
			minute: "2-digit"
		}).format(date);

		return (formatted);
	}

	return (
		<div className="grid grid-cols-1 grid-rows-2
			border border-background/25
			p-2
			w-40 h-40
			shadow-standard
			relative
			rounded-md"
			style={{
				backgroundColor: data.taken ? "color-mix(in srgb, var(--color-accent) 25%, transparent)" : "transparent"
			}}
		>
			<div className="flex flex-col items-start justify-center
				font-bold text-2xl
				mb-auto
				w-full"
			>
				<div>
					{formatTimeLocales(data.startTime)}
				</div>
				<div>
					{formatTimeLocales(data.endTime)}
				</div>
			</div>
			<div className="font-light text-md mt-auto">
				{t && t(`day.${data.dayOfWeek}`)}
			</div>

			<div className="absolute bottom-1 right-2
				select-none
				cursor-pointer
				font-icon text-2xl
				transition-colors duration-200
				hover:text-red-500"
				onClick={() => {
					const index: number = fetchedSlots.findIndex((value: SlotsData) => {
						return (
							value.dayOfWeek === data.dayOfWeek
							&& value.startTime === data.startTime
							&& value.endTime === data.endTime
							&& value.taken === data.taken
						);
					});

					setFetchedSlots([
						...fetchedSlots.slice(0, index),
						...fetchedSlots.slice(index + 1)
					]);
				}}
			>
				
			</div>
		</div>
	);
}

const SellerSlotsPage: React.FC = () => {
	const { t } = useTranslation("sellerSlots");
	const [openPopUpAddSlots, setOpenPopUpAddSlots] = useState<boolean>(false);
	const refOpenPopUpAddSlots = useRef<PopUpAPI | null>(null);
	const [fetchedSlots, setFetchedSlots] = useState<SlotsData[]>([]);

	// NOTE: store the fetched data here and do a deep copy every render to see
	// if the value changed or not
	// SlotKey can only compare string, so we create a string from the SlotsData.
	const slotKey = (s: SlotsData): string => `${s.dayOfWeek}|${s.startTime}|${s.endTime}|${s.taken}`;

	function areSlotsEqual(a: SlotsData[], b: SlotsData[]): boolean {
		if (a.length !== b.length)
			return (false);
		const set = new Set(a.map(slotKey));

		for (const s of b) {
			if (!set.has(slotKey(s)))
				return (false);
		}
		return (true);
	}

	const [initialData, setInitialData] = useState<SlotsData[]>(fetchedSlots.map(s => ({ ...s })));
	const dataChanged: boolean = areSlotsEqual(fetchedSlots, initialData);
	const [areProcessingSave, setAreProcessingSave] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const navigate = useNavigate();
	const location = useLocation();
	VerifyUsersState()
	const { isConnected } = useDataProvider();

	const [searchParams] = useSearchParams();
	const listingID = searchParams.get("id");

	useEffect(() => {
		if (isConnected !== null && isConnected === false) {
			navigate("/sign-in", { state: { from: location.pathname + location.search } });
		}
		if (!listingID) return;

		const fetchAvailability = async () => {
			try {
				const response = await fetch(`/api/listings/${listingID}/availability`, {
					credentials: 'include'
				});
				if (response.ok) {
					const data = await response.json();
					const slots: SlotsData[] = data.weeklySchedule.map((s: any) => ({
						...s,
						taken: true
					}));
					setFetchedSlots(slots);
					setInitialData(slots.map(s => ({ ...s })));
				} else {
				}
			} catch (error) {
			} finally {
				setLoading(false);
			}
		};

		fetchAvailability();
	}, [listingID, isConnected, location, navigate]);

	const handleSaving = async () => {
		if (!listingID) return;
		setAreProcessingSave(true);
		try {
			const response = await fetch(`/api/listings/${listingID}/availability`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					weeklySchedule: fetchedSlots.map(s => ({
						dayOfWeek: s.dayOfWeek,
						startTime: s.startTime,
						endTime: s.endTime
					}))
				}),
				credentials: "include"
			});

			if (response.ok) {
				toast.success(t("success.saved"));
				setInitialData(fetchedSlots.map(s => ({ ...s })));
			} else {
				const errorData = await response.json();
				toast.error(t(errorData.message || "errors.save_failed"));
			}
		} catch (error) {
			toast.error(t("errors.save_failed"));
		} finally {
			setAreProcessingSave(false);
		}
	}

	return (
		<div className="flex flex-col items-center justify-start
			overflow-y-scroll
			transition-discrete duration-500
			px-4 md:px-7 xl:px-64
			w-full h-screen"
		>
			<div className="w-full h-20 flex-none"></div>

			{loading ? (
				<div className="flex flex-col items-center justify-center w-full h-64 text-accent animate-pulse">
					<div className="font-icon text-6xl mb-4">󰚙</div>
					<div className="text-sm font-light tracking-widest uppercase">Chargement...</div>
				</div>
			) : (
				<>

					<div className="grid grid-cols-[auto_1fr] grid-rows-1
				place-items-center
				mb-4
				w-full"
					>
						<Link
							to={`/property/listings?id=${listingID}`}
						>
							<ActionButton
								icon=""
								title={t("buttons.goBackToListing")}
							/>
						</Link>
						<div
							className="w-full"
						>
							<ContentDivider
								line_color="linear-gradient(to right,var(--color-background) 80%,transparent)"
							/>
						</div>
					</div>

					<div className="grid grid-cols-[1fr_auto] grid-rows-1
				place-items-center
				mb-4
				w-full"
					>
						<div className="justify-self-start w-full">
							{t("title")}
						</div>
						<div className="justify-self-end">
							<ActionButton
								title={t("buttons.save.title")}
								icon="󰆓"
								disabled={dataChanged}
								processing_action={areProcessingSave}
								onClick={handleSaving}
							/>
						</div>
					</div>

					<div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] grid-rows-1
				gap-x-4 gap-y-4
				w-full"
					>

						{
							fetchedSlots.map((value: SlotsData, index: number) => {
								return (
									<SlotsBox
										key={index}
										data={value}
										t={t}
										fetchedSlots={fetchedSlots}
										setFetchedSlots={setFetchedSlots}
									/>
								);
							})
						}

						<AddSlotsButton
							t={t}
							setOpenPopUpAddSlots={setOpenPopUpAddSlots}
						/>
					</div>

					<div className="w-full h-7 flex-none">
					</div>

					{
						openPopUpAddSlots && <PopUp
							title={t("buttons.create.title")}
							onClose={() => setOpenPopUpAddSlots(false)}
							ref={refOpenPopUpAddSlots}
						>
							<CreateSlotPopUpContent
								t={t}
								refOpenPopUpAddSlots={refOpenPopUpAddSlots}
								fetchedSlots={fetchedSlots}
								setFetchedSlots={setFetchedSlots}
							/>
						</PopUp>
					}
				</>
			)}
		</div>
	);
}

export default SellerSlotsPage;
