import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";

const	BuyerSlotsPage: React.FC = () => {
	const	{ t } = useTranslation("buyerSlots");
	const	[searchParams] = useSearchParams();
	const	listingID = searchParams.get("id");

	return (
		<div
		className="flex flex-col items-center justify-start
		px-4 md:px-7 xl:px-64
		w-full"
		>
			<div className="w-full h-18 flex-none"></div>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
				place-items-center
				mb-4
				w-full"
			>
				<Link
					to={ `/property/listings?id=${listingID}` }
				>
					<ActionButton
						icon=""
						title={ t("buttons.goBackToListing") }
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
			THIS WILL THE BUYER SLOTS PAGE
		</div>
	);
}

export default BuyerSlotsPage;