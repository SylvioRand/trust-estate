import { useTranslation } from "react-i18next";
import ContentDivider from "../components/ContentDivider";

interface	SectionProps {
	title: string;
	content: string;
}

const	Section: React.FC<SectionProps> = ({
	title = "Title",
	content = "Content"
}) => {
	return (
		<div
		className="flex flex-col items-center justify-center
		gap-2
		w-full"
		>
			<div
			className="flex items-center justify-start
			w-full"
			>
				<div
				className="font-bold text-lg"
				>
					{ title }
				</div>
			</div>

			<div
			className="font-light text-left
			text-md"
			>
				{ content }
			</div>
		</div>
	);
}

const	PrivacyPolicyPage: React.FC = () => {
	const	{ t } = useTranslation("privacyPolicy");
	const	sectionName: string[] = [
		"introduction",
		"dataCollected",
		"purposeOfData",
		"legalBasis",
		"dataSharing",
		"dataStorageAndSecurity",
		"userRights",
		"cookies",
		"dataRetention",
		"policyChanges",
		"contact"
	]

	return (
		<div
		className="flex flex-col items-center justify-start
		gap-4
		px-4 md:px-7 xl:px-64
		overflow-y-scroll
		w-full h-screen"
		>
			<div
			className="w-full h-16
			flex-none"
			>
			</div>

			<div
			className="flex items-center justify-start
			w-full
			font-bold text-xl"
			>
				<div>
					{ t("title") }
				</div>
			</div>

			{

				sectionName.map((value: string, index: number) => {
					return (
						<div
						className="flex flex-col items-center justify-center
						w-full
						gap-4"
						>
							<Section
							key={ index }
							title={ (index + 1) + ". " + t(`section.${value}.title`) }
							content={ t(`section.${value}.legalText`) }
							/>
							{
								index !== sectionName.length - 1 &&
								<div
								className="w-full
								opacity-25"
								>
									<ContentDivider
									line_color="linear-gradient(to left, transparent, var(--color-background) 10%, var(--color-background) 90%, transparent)"
									/>
								</div>
							}
						</div>
					);
				})
			}

			<div
			className="w-full h-4
			flex-none"
			>
			</div>
		</div>
	)
}

export default PrivacyPolicyPage;