import { CreateDateForPost } from "../utils/Format";
import type { ListingsViewProps } from "./client_listings_view";
import type { TFunction } from "i18next";
import type { ListingsData } from "../dataModel/modelListings";

export const	ListingsHeader: React.FC<ListingsViewProps> = ({
	fetchedData,
	t
}) => {
	return (
		<div
		className="flex flex-col items-center justify-center
		w-full"
		>
			<div
			className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"
			
			>
				<div
				className="font-higuen font-bold text-4xl"
				>
					{ fetchedData.title }
				</div>

				<div
				className="flex items-center justify-center gap-1"
				>
					<div className="font-icon"></div><div>{ `${t(`section.header.propertyType.${fetchedData.propertyType}`)}, ${fetchedData.zone}` }</div>
				</div>
				<div
				className="flex items-center justify-center gap-1
				mb-4"
				>
				</div>

				<div
				className="font-light"
				>
					{ fetchedData.description }
				</div>

				<div
				className="font-light mt-2"
				>
					{ `${t("section.post.publicationDate")} ${CreateDateForPost(fetchedData.createdAt)}` }
				</div>
				{
					fetchedData.updatedAt && 
					<div
					className="font-light"
					>
						{ `${t("section.post.updateDate")} ${CreateDateForPost(fetchedData.updatedAt)}` }
					</div>
				}
			</div>
		</div>
	);
}
type FeaturesType = {
	value: string;
	icon: string;
}

interface EquipmentStatsProps {
	value: string;
	icon: string;
	t: TFunction<["property", "error", "common"]>;
}

const	EquipmentStats: React.FC<EquipmentStatsProps> = ({
	value = "Value",
	icon = "X",
	t
}) => {
	return (
		<div
		className="grid grid-cols-[auto_1fr] grid-rows-1
		p-2
		rounded-xl
		shadow-standard
		select-none
		gap-3
		place-items-center"
		>
			<div
			className="flex items-center justify-center
			w-12 h-12"
			>
				<div
				className="font-icon text-4xl text-accent
				text-shadow-[0px_0px_7px_color-mix(in_srgb,black_20%,transparent)]"
				>
					{ icon }
				</div>
			</div>

			<div
			className="font-light justify-self-start mr-4">
				{ t(`section.equipments.${value}`) }
			</div>
		</div>
	);
}

interface	FeaturesStatsProps {
	data: string;
	value: any;
	icon: string;
	namespace: string;
	t: TFunction<["property", "error", "common"]>;
}

export const	FeaturesStats: React.FC<FeaturesStatsProps> = ({
	data = "data",
	value = "Value",
	namespace = "features",
	icon = "X",
	t
}) => {
	return (
		<div
		className="grid grid-cols-[auto_auto_1fr] grid-rows-1 gap-2
		p-1
		place-items-center
		bg-background
		rounded-xl
		shadow-standard
		select-none
		text-foreground"
		>
			<div
			className="flex items-center justify-center
			rounded-lg
			w-12 h-12
			flex-none
			bg-accent"
			>
				<div
				className="font-icon text-4xl
				text-shadow-[0px_0px_5px_color-mix(in_srgb,var(--color-background)_25%,transparent)]"
				>
					{ icon }
				</div>
			</div>
			<div
			className="font-bold text-xl"
			>
				{ value }
			</div>
			<div
			className="font-light justify-self-start mr-2">
				{ t(`section.${ namespace }.${ data }`) }
			</div>
		</div>
	);
}

interface	ListingsInfoProps {
	icon: string;
	icon_color?: string;
	title: string;
	info: string;
}

const	ListingsInfo: React.FC<ListingsInfoProps> = ({
	icon = "X",
	icon_color = "var(--color-backgrond)",
	title = "Title",
	info = "Info"
}) => {
	return (
		<div
		className="grid grid-cols-[auto_1fr] grid-rows-1
		gap-3
		place-items-center
		w-full"
		>
			<div
			className="flex items-center justify-center
			select-none
			bg-background
			rounded-xl
			shadow-standard
			w-12 h-12"
			>
				<div
				className="font-icon text-4xl"
				style={{
					color: icon_color,
					textShadow: `0px 0px 6px color-mix(in srgb, ${icon_color} 25%, transparent)`
				}}>
					{ icon }
				</div>
			</div>
			<div
			className="grid grid-cols-1 grid-rows-2
			place-items-start
			w-full h-full"
			>
				<div
				className="font-bold">
					{ title }
				</div>
				<div
				className="font-light">
					{ info }
				</div>
			</div>
		</div>
	);
}

export const	ListingsFeaturesAndEquipment: React.FC<ListingsViewProps> = ({
	fetchedData,
	t
}) => {
	const	dataEquipments: FeaturesType[] = [
		{ value: "wc", icon: "" },
		{ value: "parking_type", icon: "" },
		{ value: "garden_private", icon: "󰉊" },
		{ value: "pool", icon: "󰘆" }
	]

	const	dataFeatures: FeaturesType[] = [
		{ value: "bedrooms", icon: "󰋣" },
		{ value: "bathrooms", icon: "" }
	]

	return (
		<div
		className="flex flex-col items-center justify-center
		gap-3
		w-full mt-7"
		>
			<div
			className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"
			
			>
				<div
				className="font-bold text-2xl"
				>
					{ t("section.features.title") }
				</div>
			</div>

			<div
			className="flex flex-wrap
			gap-3
			w-full"
			>
				<FeaturesStats
				data="area"
				namespace="features"
				icon="󰳂"
				value={ fetchedData.surface }
				t={ t }
				/>

				{
					dataFeatures.map((value: FeaturesType, index: number) => {
						type FeatureKey = keyof ListingsData["features"];

						const getValue = (
							features: ListingsData["features"],
							key: FeatureKey
						) => (features[key]);

						return (
							<FeaturesStats
							key={ index }
							namespace="features"
							data={ value.value }
							icon={ value.icon }
							value={ getValue(fetchedData.features, value.value as keyof ListingsData["features"]) }
							t={ t }
							/>
						);
					})
				}
			</div>

			<div
			className="flex flex-col items-center justify-center
			gap-3
			my-4
			w-full">
				<ListingsInfo
				icon="󰖌"
				icon_color="var(--color-blue-400)"
				title={ t("section.equipments.water_access.title") }
				info={ t(`section.equipments.water_access.${fetchedData.features.water_access ? "true" : "false"}`) }
				/>
				<ListingsInfo
				icon="󱐋"
				icon_color="var(--color-yellow-500)"
				title={ t("section.equipments.electricity_access.title") }
				info={ t(`section.equipments.electricity_access.${fetchedData.features.electricity_access ? "true" : "false"}`) }
				/>
			</div>

			<div
			className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"
			
			>
				<div
				className="font-bold text-2xl"
				>
					{ t("section.equipments.title") }
				</div>
			</div>

			<div
			className="flex flex-wrap
			gap-3
			w-full"
			>
				{
					dataEquipments.map((value: FeaturesType, index: number) => {
						type FeatureKey = keyof ListingsData["features"];

						const isEquipmentEnabled = (
							features: ListingsData["features"],
							key: FeatureKey
						) => features[key] === true;

						return (
							<>
								{
									isEquipmentEnabled(fetchedData.features, value.value as keyof ListingsData["features"]) && 
									<EquipmentStats
									key={ index }
									value={ value.value }
									icon={ value.icon }
									t={ t }
									/>
								}
							</>
						);
					})
				}
			</div>
		</div>
	);
}

const	MyListingsView: React.FC<ListingsViewProps> = ({
	fetchedData,
	t
}) => {
	const	postStats: FeaturesType[] = [
		{ value: "views", icon: "󰈈" },
		{ value: "reservations", icon: "󰃭" },
		{ value: "feedbacks", icon: "󰅺" }
	];

	return (
		<div
		className="flex flex-col items-center justify-start
		w-full h-full"
		>
			<ListingsHeader
			fetchedData={ fetchedData }
			t={ t }
			/>
			<ListingsFeaturesAndEquipment
			fetchedData={ fetchedData }
			t={ t }
			/>
			<div
			className="flex flex-col items-start justify-center
			gap-1
			w-full
			my-4"
			
			>
				<div
				className="font-bold text-2xl"
				>
					{ t("section.postStats.title") }
				</div>

				<div
				className="flex flex-wrap
				mt-2
				gap-3
				w-full"
				>
					{
						postStats.map((value: FeaturesType, index: number) => {
							type FeatureKey = keyof ListingsData["stats"];

							const getValue = (
								features: ListingsData["stats"],
								key: FeatureKey
							) => (features[key]);

							return (
								<FeaturesStats
								key={ index }
								namespace="postStats"
								data={ value.value }
								icon={ value.icon }
								value={ getValue(fetchedData.stats, value.value as keyof ListingsData["stats"]) }
								t={ t }
								/>
							);
						})
					}
				</div>
				
				<div className="w-full h-10 flex-none"></div>
			</div>
		</div>
	)
}

export default MyListingsView;