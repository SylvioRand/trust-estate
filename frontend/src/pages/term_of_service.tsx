import { useTranslation } from "react-i18next";
import ContentDivider from "../components/ContentDivider";

interface SectionProps {
  title: string;
  content: string;
}

const Section: React.FC<SectionProps> = ({
  title = "Title",
  content = "Content"
}) => {
  return (
    <div
      className="flex flex-col items-start justify-center
		gap-2
		w-full"
    >
      <div
        className="font-bold text-lg"
      >
        {title}
      </div>

      <div
        className="font-light text-left
			text-md"
      >
        {content}
      </div>
    </div>
  );
}

const TermOfServicePage: React.FC = () => {
  const { t } = useTranslation("termOfService");
  const sectionName: string[] = [
    "acceptanceOfTerms",
    "descriptionOfService",
    "userAccounts",
    "userRoles",
    "userContent",
    "moderationAndVisibility",
    "reservations",
    "paymentsAndCredits",
    "noTransactionalResponsibility",
    "intellectualProperty",
    "serviceAvailability",
    "limitationOfLiability",
    "termination",
    "governingLaw",
    "changesToTerms",
    "contactInformation"
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
			animate-from-top
			w-full
			font-higuen
			font-bold text-2xl"
      >
        <div>
          {t("title")}
        </div>
      </div>

      {

        sectionName.map((value: string, index: number) => {
          const delay: string = `${100 * index}ms`;

          return (
            <div
              className="animate-from-bottom
						w-full"
              style={{
                animationDelay: delay
              }}
            >
              <div
                className="flex flex-col items-center justify-center
							w-full
							opacity-0
							animate-fade-in
							gap-4"
                style={{
                  animationDelay: delay
                }}
              >
                <Section
                  key={index}
                  title={(index + 1) + ". " + t(`section.${value}.title`)}
                  content={t(`section.${value}.legalText`)}
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

export default TermOfServicePage;
