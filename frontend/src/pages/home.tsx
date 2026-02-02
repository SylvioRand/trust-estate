import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import bentoSmartAi from "../../src/images/bento_smart_ai.png";
import bentoVerifiedProperty from "../../src/images/bento_verified_property.png";
import bentoInstantNotification from "../../src/images/bento_instant_notification.png";
import bentoAccurateValuation from "../../src/images/bento_accurate_valuation.png";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import ActionButton from "../components/ActionButton";
import SimpleInput from "../components/Input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ZONE_ENUM } from "../dataModel/dataZone";
import type { InputEnumData } from "../components/InputEnum";
import useDataProvider from "../provider/useDataProvider";

interface BentoProps {
  title: string;
  content: string;
  picture: string;
}

const Bento: React.FC<BentoProps> = ({
  title = "Title",
  content = "Content",
  picture
}) => {
  return (
    <div
      className="grid grid-cols-1 grid-rows-[auto_1fr]
			w-full h-full
			shadow-standard
			rounded-xl
			border border-background/25
			overflow-hidden
			max-w-100 max-h-100"
    >
      <div className="w-full h-50
			relative
			flex items-center justify-center
			overflow-hidden
			flex-none
			bg-blue-500"
      >
        <img
          className="w-full h-full object-cover"
          src={picture}
          alt="Bento presenting the advantage of the using Ai."
        />
      </div>

      <div className="grid grid-cols-1 grid-rows-[auto_1fr]
			border-t border-background/25
			bg-foreground
			p-4"
      >
        <div className="font-bold">
          {title}
        </div>
        <div className="font-extralight text-sm">
          {content}
        </div>
      </div>
    </div>
  );
}

interface DataAboutUsProps {
  title: string;
  value: string;
}

const DataAbousUs: React.FC<DataAboutUsProps> = ({
  title = "Title",
  value = "2+"

}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="font-bold text-3xl
				mr-auto ml-0 xl:ml-auto xl:mr-0
				bg-linear-to-t from-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] via-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] to-accent
				bg-clip-text
				text-transparent">
        {value}
      </div>
      <div className="font-light text-sm">
        {title}
      </div>
    </div>
  )
}

const HomePage: React.FC = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const pictureStyle = "w-full rounded-xl shadow-standard border border-background/25";

  const statsData: DataAboutUsProps[] = [
    { title: t("aboutUs.stats.0"), value: "24/7" },
    { title: t("aboutUs.stats.1"), value: "42+" },
    { title: t("aboutUs.stats.2"), value: "4.8/5" },
    { title: t("aboutUs.stats.3"), value: "7+" }
  ]

  const bentoCard: BentoProps[] = [
    { picture: bentoSmartAi, title: t("aboutUs.card.AI.title"), content: t("aboutUs.card.AI.content") },
    { picture: bentoVerifiedProperty, title: t("aboutUs.card.verifiedProperty.title"), content: t("aboutUs.card.verifiedProperty.content") },
    { picture: bentoAccurateValuation, title: t("aboutUs.card.accurateValuation.title"), content: t("aboutUs.card.accurateValuation.content") },
    { picture: bentoInstantNotification, title: t("aboutUs.card.instantNotification.title"), content: t("aboutUs.card.instantNotification.content") }
  ];
  VerifyUsersState();

  const [isProcessingSearch, setIsProcessingSearch] = useState<boolean>(false);
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
	setIsProcessingSearch(true);

	navigate(`/property?zone=${data.searchAtLocation}`);
  };

  const [searchParams] = useSearchParams();
  const { setIsConnected } = useDataProvider();

  useEffect(() => {
    const value: string | null = searchParams.get("auth_google");

    if (value && value === "success")
      setIsConnected(true);
  }, []);
  return (
    <div className="flex flex-col items-center justify-start gap-4
			overflow-y-scroll
			relative
			pointer-events-auto
			animate-fade-in
			w-full h-screen"
    >

      <div className="w-full h-15
				block xl:hidden
				flex-none"
      >
      </div>

      <div
        className="xl:h-full
			transition-discrete duration-500
			flex-none
			relative
			flex flex-col items-center justify-center"
      >
        <div
          className="absolute top-0 left-0
				flex items-center justify-center
				w-full h-full"
        >
          <div
            className="w-125 h-125
					rounded-full
					blur-[256px]
					bg-blend-screen
					bg-accent/50"
          >
          </div>
        </div>

        <div className="flex flex-col items-center justify-start
					flex-none
					md:grid md:grid-cols-2 md:grid-rows-1
					gap-7
					place-items-center
					z-1
					p-4"
        >
          <div className="grid grid-cols-2 grid-rows-1 gap-4
						justify-self-center xl:justify-self-start
						w-auto h-auto
						order-1 xl:order-2"
          >
            <div className="flex flex-col items-center justify-self-center gap-4
							animate-from-bottom
							xl:max-w-70"
            >
              <img
                className={pictureStyle}
                alt="Picture of a modern house"
                src={house0}
              />

              <img
                className={pictureStyle}
                alt="Picture of a modern house"
                src={house2}
              />
            </div>
            <div className="flex flex-col items-center justify-self-center gap-4
							animate-from-top
							xl:max-w-70"
            >
              <img
                className={pictureStyle}
                alt="Picture of a modern house"
                src={house1}
              />

              <img
                className={pictureStyle}
                alt="Picture of a modern house"
                src={house3}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-7
						place-items-center
						h-full
						order-2 xl:order-1"
          >
            <div className="flex flex-col items-start xl:items-end justify-center gap-4
							justify-self-center xl:justify-self-end
							xl:max-w-145
							xl:text-right"
            >
              <div
                className="animate-fade-in"
              >
                <div
                  className="font-higuen font-bold text-[42px] leading-tight
								bg-linear-to-t from-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-background))] to-background
								bg-clip-text text-transparent
								animate-from-bottom
								">
                  {t("header.title")}
                </div>
              </div>
              <div
                className="animate-fade-in opacity-0"
                style={{
                  animationDelay: "200ms"
                }}
              >
                <div
                  className="font-inter font-extralight text-md
								animate-from-bottom"
                  style={{
                    animationDelay: "200ms"
                  }}
                >
                  {t("header.subtitle")}
                </div>
              </div>
            </div>

            <div
              className="animate-fade-in
						opacity-0
						w-full"
              style={{
                animationDelay: "400ms"
              }}
            >
              <form
                className="grid grid-cols-[1fr_auto] grid-rows-1
							animate-from-bottom
							gap-3
							place-items-center
							w-full"
                style={{
                  animationDelay: "400ms"
                }}
                onSubmit={handleSearch}
              >
                <SimpleInput
                  title=""
                  icon=""
                  name="searchAtLocation"
                  placeholder={t("buttons.search.placeholder")}
                  list="zoneInputSuggestion"
                  error={[]}
                />
                <ActionButton
                  title={t("buttons.search.title")}
                  icon=""
                  icon_place="right"
                  type="submit"
                  processing_action={isProcessingSearch}
                />
              </form>
            </div>
            <datalist
              id="zoneInputSuggestion"
            >
              {ZONE_ENUM.map((value: InputEnumData, index: number) => {
                return (
                  <option
                    key={index}
                    value={value.title}
                  />
                );
              })}
            </datalist>

            <div className="grid grid-cols-2 grid-rows-2
							my-4
							md:grid-cols-4 md:grid-rows-1
							w-full
							gap-4
							place-items-start
							xl:place-items-end"
            >
              {statsData.map((value: DataAboutUsProps, index: number) => {
                return (
                  <div
                    key={index}
                    className="animate-fade-in
									opacity-0"
                    style={{
                      animationDelay: `${600 + (100 * index)}ms`
                    }}
                  >
                    <div
                      className="animate-from-bottom"
                      style={{
                        animationDelay: `${600 + (100 * index)}ms`
                      }}
                    >
                      <DataAbousUs
                        title={value.title}
                        value={value.value}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-12
				px-4 py-12
				shadow-[0px_0px_7px_rgba(0,0,0,0.25)]
				flex-none
				overflow-hidden
				bg-foreground border-y border-background/25
				relative
				w-full"
      >
        <div
          className="absolute top-0 left-0
				flex items-center justify-center
				w-full
				flex-none"
        >
          <div
            className="w-[40%] h-px
					bg-linear-to-l from-transparent via-accent to-transparent"
          >
          </div>
        </div>
        <div
          className="absolute top-0 left-0
				flex items-center justify-center
				overflow-hidden
				w-full h-full"
        >
          <div className="
					-translate-y-70
					origin-center
					bg-accent
					w-50 h-50
					rounded-full
					blur-3xl
					scale-y-200
					bg-blend-hard-light
					rotate-z-45
					flex-none"
          >
          </div>
        </div>

        <div className="flex flex-col items-center justify-center
				text-shadow-lg
				z-1"
        >
          <div className="font-higuen font-bold text-3xl">
            {t("aboutUs.whyUs.title")}
          </div>

          <div className="font-inter font-light text-md">
            {t("aboutUs.whyUs.reason")}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(316px,1fr))] grid-rows-1
					place-items-center
					gap-8
					max-w-350
					z-1
					transition-opacity duration-500
					w-full"
        >
          {
            bentoCard.map((value: BentoProps, index: number) => {
              return (
                <Bento
                  key={index}
                  picture={value.picture}
                  title={value.title}
                  content={value.content}
                />
              );
            })
          }
        </div>
      </div>

      <div className="w-full h-50 flex-none">
      </div>


    </div>
  );
}

export default HomePage;
