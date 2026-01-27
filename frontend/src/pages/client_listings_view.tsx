import type { TFunction } from "i18next";
import type { ListingsData } from "../dataModel/modelListings";
import { ListingsFeaturesAndEquipment, ListingsHeader } from "./my_listings_view";

export interface	ListingsViewProps {
	fetchedData: ListingsData;
	t: TFunction<["listings", "error", "common"]>
}

interface	SellerStatsProps {
	title: string;
	value: any;
}

const	SellerStats: React.FC<SellerStatsProps> = ({
	title = "Title",
	value = "Value"
}) => {
	return (
		<div
		className="grid grid-cols-1 grid-rows-[auto_1fr]
		min-w-37
		rounded-xl
		p-2
		border border-background/25
		shadow-standard"
		>
			<div
			className="font-bold text-4xl text-accent
			text-shadow-[0px_0px_7px_color-mix(in_srgb,black_25%,transparent)]"
			>
				{ value }
			</div>
			<div
			className="font-light"
			>
				{ title }
			</div>
		</div>
	);
}

const	ClientListingsView: React.FC<ListingsViewProps> = ({
	fetchedData,
	t
}) => {

	const	sellerStats: string[] = [
		"successfulSales",
		"successfulRents",
		"averageRating",
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
					{ t("section.stats.title") }
				</div>
			</div>
			<div
			className="flex flex-wrap gap-3
			w-full"
			>
				{
					sellerStats.map((value: string, index: number) => {
						type FeatureKey = keyof ListingsData["sellerStats"];

						const getValue = (
							features: ListingsData["sellerStats"],
							key: FeatureKey
						) => (features[key]);
						return (
							<SellerStats
							key={ index }
							title={ t(`section.stats.sellerStats.${value}`) }
							value={ getValue(fetchedData.sellerStats, value as keyof ListingsData["sellerStats"]) }
							/>
						);
					})
				}
			</div>

			<div className="w-full h-10 flex-none"></div>
		</div>
	)
}

export default ClientListingsView;