import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import housePicture from "../images/terrain0.webp";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import type { SellerStatsDataType } from "../dataModel/modelListings";
import { CreateDateForMemberSince } from "../utils/Format";
import BoxSection from "../components/BoxSection";
import { listData, type ListingsProps } from "../dataModel/modelPropertyList";
import { PublicationCard } from "./property";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

interface StatsProps {
  value: number;
  title: string;
}

const Stats: React.FC<StatsProps> = ({
  value = 0,
  title = "Title"
}) => {
  return (
    <div className="flex flex-col items-start justify-center
			place-items-center
			border border-background/25
			rounded-xl
			shadow-standard
			p-2
			flex-none
			text-center
			w-full
			whitespace-nowrap
			gap-3"
    >
      <div className="font-bold text-accent text-4xl
				text-shadow-lg
				truncate max-w-32"
      >
        {value}
      </div>
      <div className="font-light text-sm
				truncate max-w-32">
        {title}
      </div>
    </div>
  );
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title = "Title",
  children
}) => {
  return (
    <div
      className="grid grid-cols-1 grid-rows-[auto_1fr]
			place-items-center
			gap-4
			w-full"
    >
      <div className="grid grid-cols-[auto_1fr] grid-rows-1
				gap-4
				place-items-center
				font-bold
				w-full"
      >
        <div>
          {title}
        </div>
        <div
          className="w-full"
        >
          <ContentDivider
            line_color="linear-gradient(to left,
						transparent,
						var(--color-background) 10%,
						var(--color-background) 90%,
						transparent)"
          />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] grid-rows-1
				gap-4
				w-full"
      >
        {children}
      </div>
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userData, isConnected } = useDataProvider();
  VerifyUsersState();
  const { t } = useTranslation(["profile", "listings"]);

  useEffect(() => {
    console.log("ProfilePage: isConnected: ", isConnected);
    if (isConnected === false)
      navigate("/sign-in");
  }, []);
  return (
    <div className="flex flex-col items-center justify-start
			px-2 md:px-7 xl:px-64
			overflow-y-scroll
			animate-fade-in
			w-full h-screen"
    >
      <div className="w-full h-20 flex-none"></div>

      <div className="w-full h-36
				flex-none
				flex items-center justify-center
				relative
				overflow-hidden
				drop-shadow-standard
				rounded-xl"
      >
        <img
          className="w-full h-full object-cover"
          src="https://www.maxfosterphotography.com/images/xl/Radiant-Swirl.jpg"
          alt="Abstract image"
        />
      </div>


      <div className="grid grid-cols-1 grid-rows-2
				md:grid-cols-[1fr_auto] md:grid-rows-1
				w-full"
      >
        <div className="flex flex-col items-center justify-center
					p-2
					md:p-4
					w-full"
        >
          <div className="font-bold
						mr-auto"
          >
            {userData?.firstName + " " + userData?.lastName}
          </div>
          <div className="font-light
						whitespace-pre-line
						mr-auto"
          >
            {
              userData?.email + "\n"
              + userData?.phone + "\n\n"
              + t("listings:section.contact.memberSince")
              + " "
              + CreateDateForMemberSince(userData?.createdAt)
            }
          </div>
        </div>
        <div className="grid grid-cols-1 grid-rows-2
					md:grid-cols-2 md:grid-rows-1
					place-items-start
					p-2
					md:p-4
					gap-4"
        >
          <Link
            to="/profile/settings"
          >
            <ActionButton
              icon=""
              title={t("buttons.settings")}
            />
          </Link>
          <ActionButton
            icon="󰚧"
            icon_size={22}
            title={t("buttons.publish")}
            onClick={
              () => {
                navigate("/profile/publish")
              }
            }
          />
        </div>
      </div>

      <div
        className="w-full"
      >
        <ContentDivider
          line_color="linear-gradient(to left,
					transparent,
					var(--color-background) 10%,
					var(--color-background) 90%,
					transparent)"
        />
      </div>

      {/* This part may be implemented but not immediately, will wait for the back-end team first.

			<div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] grid-rows-1
				p-4
				place-items-center
				gap-4
				w-full"
			>
				{
					Object.entries(userData?.sellerStats).map(([key, value]) => {
						return (
							<Stats
								key={ key }
								value={ value }
								title={ t(`listings:section.stats.sellerStats.${key}`) }
							/>
						)
					})
				}
			</div> */}

      { // TODO: the data will be need to be fetched, so I will just comment it first
			/* <div className="flex flex-col items-center justify-center
				mt-12
				gap-24
				w-full p-2"
			>
				<ProfileSection
					title={ t("section.myListings.title") }
				>
					{
						listData.map((value: ListingsProps, index: number) => {
							return (
								<PublicationCard
									key={ index }
									propertyData={ value }
								/>
							);
						})
					}
				</ProfileSection>

				<ProfileSection
					title={ t("section.favorites.title") }
				>
					{
						listData.map((value: ListingsProps, index: number) => {
							return (
								<PublicationCard
									key={ index }
									propertyData={ value }
								/>
							);
						})
					}
				</ProfileSection>
			</div> */}

    </div>
  );
}

export default ProfilePage;
