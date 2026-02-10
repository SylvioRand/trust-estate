import React, { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { type PropertyDataType } from "../dataModel/modelPropertyList";
import ActionButton from "../components/ActionButton";
import InputEnum, { type InputEnumData } from "../components/InputEnum";
import type { TFunction } from "i18next";
import { ZONE_ENUM } from "../dataModel/dataZone";
import { toast } from "react-toastify";
import InputRange from "../components/InputRange";
import InputCheckbox from "../components/InputCheckBox";
import BentoProperty from "../components/BentoProperty";
import { useSearchParams } from "react-router-dom";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

interface FilterProps {
	t: TFunction<["property", "error", "common"]>;
	defaultZone: string;
	setDataToDisplay: Dispatch<SetStateAction<PropertyDataType[]>>;
	setIsFetchingData: Dispatch<SetStateAction<boolean>>;
	setLastFilter: Dispatch<SetStateAction<string>>;
	setPage: Dispatch<SetStateAction<number>>;
	setMaxPage: Dispatch<SetStateAction<number>>;
	page: number;
}

const Filter: React.FC<FilterProps> = ({
	t,
	setDataToDisplay,
	defaultZone,
	setIsFetchingData,
	setLastFilter,
	setPage,
	setMaxPage,
	page = 1
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const InputEnumDataBoolean: InputEnumData[] = [
		{ value: "none", title: t("common:all") },
		{ value: "true", title: t("common:true") },
		{ value: "false", title: t("common:false") }
	]

	const applyFilters = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsOpen(false);
		const formData: FormData = new FormData(e.currentTarget);
		let url: string = `/api/listings/?page=${page}`;
		const query = new URLSearchParams();
		const uniqueKeys = new Set(formData.keys());

		let error: boolean = false;
		["Price", "Surface", "BedRoom", "BathRoom"].forEach((value: string) => {
			const min = formData.get(`min${value}`) as string | null;
			const max = formData.get(`max${value}`) as string | null;

			const minIsValid = min === null || /^\d*$/.test(min); // allow empty
			const maxIsValid = max === null || /^\d*$/.test(max);

			const minNumber = /^\d+$/.test(min || "") ? Number(min) : undefined;
			const maxNumber = /^\d+$/.test(max || "") ? Number(max) : undefined;

			const rangeIsValid =
				minNumber === undefined ||
				maxNumber === undefined ||
				minNumber <= maxNumber;

			if (!minIsValid || !maxIsValid || !rangeIsValid) {
				error = true;
			}
		})

		if (error) {
			toast.error(t("rangeError"));
			return;
		}

		// NOTE: I construct the filter dynamically based on the key and the value,
		// if the value is none or empty, I will just ignore it
		for (const key of uniqueKeys) {
			const values = formData.getAll(key);
			values.forEach((v) => {
				if (v === "none" || v === "")
					return;
				query.append(key, v.toString())
			});
		}

		const result: string = query.toString();
		setLastFilter(result);
		url = `${url}${result === "" ? "" : `&${result}`}`;

		setIsFetchingData(true);
		try {
			const response = await fetch(url, {
				method: "GET",
				credentials: "include"
			});
			const responseData = await response.json();

			// NOTE: Should verify if there is an error or not!
			if (response.ok) {
				setDataToDisplay(responseData.data);
				setLastFilter(result === "" ? "" : `&${result}`);
				setPage(1);
				setMaxPage(responseData.pagination.totalPages > 0 ? responseData.pagination.totalPages : 1);
			}
			else
				throw new Error(responseData.message);
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`))
		} finally {
			setIsFetchingData(false);
		}
	};

	const formRef: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null);

	return (
		<div className="fixed bottom-0
		z-1
		w-full
		shadow-[0px_-5px_20px_color-mix(in_srgb,black_25%,transparent)]
		border-t border-background/25
		overflow-y-scroll
		transition-discrete duration-300
		bg-foreground"
			style={{
				height: isOpen ? "90%" : "0%"
			}}
		>
			<div
				className="fixed bottom-7 right-7 z-1
			rounded-full"
			>
				<button
					className="grid grid-cols-[auto_1fr] grid-rows-1 gap-1 place-items-center
				rounded-full
				shadow-standard
				p-2
				cursor-pointer
				border border-background/25
				transition-all duration-200"
					style={{
						backgroundColor: isOpen ? "var(--color-accent)" : "var(--color-foreground)",
						color: isOpen ? "black" : "var(--color-background)",
					}}
					onClick={() => setIsOpen(isOpen ? false : true)}
				>

					<div
						className="flex items-center justify-center"
					>
						<div
							className="font-icon text-2xl
						w-6 h-6
						-translate-y-[0.2rem]"
						>
							󰈲
						</div>
					</div>
					<div
						className="mr-[0.2rem]"
					>
						{t("buttons.filter.title")}
					</div>
				</button>

			</div>
			<form
				className="flex flex-col items-center justify-start gap-3
			overflow-y-scroll
			p-4 xl:p-7
			w-full"
				onSubmit={applyFilters}
				ref={formRef}
			>
				<InputEnum
					title={t("buttons.filter.contract.title")}
					name="type"
					dataEnum={[
						{ value: "none", title: t("buttons.filter.contract.none") },
						{ value: "sale", title: t("buttons.filter.contract.sale") },
						{ value: "rent", title: t("buttons.filter.contract.rent") }
					]}
				/>
				<InputEnum
					title={t("buttons.filter.propertyType.title")}
					name="propertyType"
					dataEnum={[
						{ value: "none", title: t("buttons.filter.propertyType.none") },
						{ value: "apartment", title: t("buttons.filter.propertyType.apartment") },
						{ value: "house", title: t("buttons.filter.propertyType.house") },
						{ value: "loft", title: t("buttons.filter.propertyType.loft") },
						{ value: "land", title: t("buttons.filter.propertyType.land") },
						{ value: "commercial", title: t("buttons.filter.propertyType.commercial") }
					]}
				/>
				<InputRange
					title={t("buttons.filter.priceRange.title")}
					minTitle={t("buttons.filter.priceRange.min")}
					minName="minPrice"
					maxTitle={t("buttons.filter.priceRange.max")}
					maxName="maxPrice"
				/>
				<InputRange
					title={t("buttons.filter.areaRange.title")}
					minTitle={t("buttons.filter.areaRange.min")}
					minName="minSurface"
					maxTitle={t("buttons.filter.areaRange.max")}
					maxName="maxSurface"
				/>
				<InputRange
					title={t("buttons.filter.bedroomRange.title")}
					minTitle={t("buttons.filter.bedroomRange.min")}
					minName="minBedRoom"
					maxTitle={t("buttons.filter.bedroomRange.max")}
					maxName="maxBedRoom"
				/>
				<InputRange
					title={t("buttons.filter.bathroomRange.title")}
					minTitle={t("buttons.filter.bathroomRange.min")}
					minName="minbathRoom"
					maxTitle={t("buttons.filter.bathroomRange.max")}
					maxName="maxbathRoom"
				/>
				<InputEnum
					title={t("buttons.filter.gardenPrivate.title")}
					name="gardenPrivate"
					dataEnum={InputEnumDataBoolean}
				/>
				<InputEnum
					title={t("buttons.filter.waterAccess.title")}
					name="waterAccess"
					dataEnum={InputEnumDataBoolean}
				/>
				<InputEnum
					title={t("buttons.filter.electricityAccess.title")}
					name="electricityAccess"
					dataEnum={InputEnumDataBoolean}
				/>
				<InputEnum
					title={t("buttons.filter.pool.title")}
					name="pool"
					dataEnum={InputEnumDataBoolean}
				/>
				<InputCheckbox
					title={t("buttons.filter.parkingType.title")}
					name="parkingType"
					value={[
						{ value: "garage", title: t("buttons.filter.parkingType.garage") },
						{ value: "box", title: t("buttons.filter.parkingType.box") },
						{ value: "parking", title: t("buttons.filter.parkingType.parking") }
					]}
				/>
				<InputCheckbox
					title={t("buttons.filter.tag.title")}
					name="tags"
					value={[
						{ value: "urgent", title: t("buttons.filter.tag.urgent") },
						{ value: "exclusive", title: t("buttons.filter.tag.exclusive") },
						{ value: "discount", title: t("buttons.filter.tag.discount") }
					]}
				/>
				<InputEnum
					title={t("buttons.filter.location.title")}
					name="zone"
					defaultValue={defaultZone}
					dataEnum={[
						{ value: "none", title: t("buttons.filter.location.none") },
						...ZONE_ENUM
					]}
				/>

				<div
					className="flex items-center justify-start
				gap-3
				my-2
				w-full"
				>
					<div>
						<ActionButton
							title={t("buttons.filter.apply")}
							type="submit"
						/>
					</div>
					<div>
						<ActionButton
							title={t("buttons.filter.clear")}
							type="reset"
						/>
					</div>
				</div>
			</form>
		</div>
	);
}

interface PageButtonProps {
	icon: string;
	onClick: () => void;
	disabled: boolean;
}

const PageButton: React.FC<PageButtonProps> = ({
	icon = "",
	onClick,
	disabled = false
}) => {
	return (
		<button
			className="border border-background/25
		flex items-center justify-center
		z-1
		p-2 rounded-md
		bg-foreground
		w-12 h-12
		cursor-pointer
		shadow-standard"
			style={{
				opacity: disabled ? "42%" : "100%",
				pointerEvents: disabled ? "none" : "auto"
			}}
			onClick={onClick}
		>
			<div
				className="font-icon text-3xl">
				{icon}
			</div>
		</button>
	);
}

const PropertyPage: React.FC = () => {
	const { t } = useTranslation(["property", "error", "common"]);

	const [dataToDisplay, setDataToDisplay] = useState<PropertyDataType[]>([]);
	const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [maxPage, setMaxPage] = useState<number>(1);
	const [lastFilter, setLastFilter] = useState<string>("");
	const arePreviousDisabled: boolean = page === 1;
	const areNextDisabled: boolean = page === maxPage;
	const [searchParams] = useSearchParams();
	const zone: string | null = searchParams.get("zone");

	const getDataFromBackend = async () => {
		setIsFetchingData(true);
		try {
			const response = await fetch(`/api/listings/?page=${page}${zone !== null && ZONE_ENUM.some(z => z.value === zone) ? `&zone=${zone}` : ""}${lastFilter}`, {
				method: "GET",
				credentials: "include"
			});
			const responseData = await response.json();

			// NOTE: Should verify if there is an error or not!
			if (response.ok) {
				setDataToDisplay(responseData.data);
				setMaxPage(responseData.pagination.totalPages > 0 ? responseData.pagination.totalPages : 1);
			}
			else
				throw new Error(responseData.message);
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`))
		} finally {
			setIsFetchingData(false);
		}
	}

	// NOTE: fetch data once on component mount
	useEffect(() => {
		getDataFromBackend();
	}, []);

	useEffect(() => {
		getDataFromBackend();
	}, [page]);

	VerifyUsersState();

	return (
		<div className="flex flex-col items-center justify-start gap-4
			overflow-y-scroll
			p-4
			xl:px-64
			transition-discrete duration-200
			w-full h-screen"
		>
			<div className="w-full h-12 flex-none"
			>
			</div>

			<Filter
				t={t}
				setDataToDisplay={setDataToDisplay}
				defaultZone={zone ?? "none"}
				setIsFetchingData={setIsFetchingData}
				setLastFilter={setLastFilter}
				page={page}
				setPage={setPage}
				setMaxPage={setMaxPage}
			/>

			{
				isFetchingData === false && dataToDisplay.length > 0 &&
				<div className="flex flex-col items-center justify-start gap-4
				xl:grid xl:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] xl:grid-rows-1
				place-items-center
				transition-opacity duration-300
				w-full"
				>
					{
						dataToDisplay.map((value: PropertyDataType, index: number) => {
							return (
								<div
									className="animate-from-bottom
									w-full"
									key={index}
									style={{
										animationDuration: "500ms",
										animationDelay: `${200 * index}ms`
									}}

								>
									<div
										className="animate-fade-in
										opacity-0
										w-full"
										style={{
											animationDuration: "400ms",
											animationDelay: `${200 * index}ms`
										}}
									>
										<BentoProperty
											propertyData={value}
										/>
									</div>
								</div>
							);
						})
					}
				</div>
			}

			{
				isFetchingData === false && dataToDisplay.length === 0 &&
				<div
					className="flex flex-col items-center justify-center
					w-full h-full"
				>
					<div
						className="flex items-center justify-center
						select-none
						w-48 aspect-square
						relative"
					>
						<div
							className="font-icon text-[256px]
							absolute"
						>
							
						</div>
					</div>
					<div className="font-light">
						{t("noResult")}
					</div>
				</div>
			}

			{
				isFetchingData &&
				<div
					className="flex items-center justify-center
				flex-none
				animate-fade-in
				w-full"
				>
					<div
						className="font-icon text-[84px]
					animate-spin"
					>
						󱥸
					</div>
				</div>
			}

			<div
				className="w-full h-14 flex-none">
			</div>

			<div
				className="fixed bottom-0
			w-full h-24"
			>
				<div
					className="flex items-center justify-start
				px-7
				md:justify-center
				relative
				gap-3
				w-full h-full"
				>
					<div
						className="absolute top-0 left-0
					bg-linear-to-t from-foreground to-transparent
					w-full h-full"
					>
					</div>

					<PageButton
						icon=""
						onClick={() => {
							setPage(page > 1 ? page - 1 : 1);
						}}
						disabled={arePreviousDisabled || isFetchingData}
					/>
					<PageButton
						icon=""
						onClick={() => {
							setPage(page + 1);
						}}
						disabled={areNextDisabled || isFetchingData}
					/>
				</div>
			</div>
		</div>
	);
}

export default PropertyPage;
