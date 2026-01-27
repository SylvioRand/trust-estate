import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useEffect } from "react";


const CommonPart: React.FC<{ listingID: string }> = ({ listingID }) => {
  const { t } = useTranslation("buyerSlots");

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
    </div>

  )
}

const BuyerSlotsPage: React.FC = () => {
  const { t } = useTranslation("buyerSlots");
  const [searchParams] = useSearchParams();
  const listingID = searchParams.get("id") as string;
  const [selected, setSelected] = useState<Date>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
  }, []);

  if (loading)
    return (
      <div>
        <CommonPart
          listingID={listingID}
        />
        <h1> Loading...</h1>
        <DayPicker
          animate
          mode="single"
          selected={selected}
          onSelect={setSelected}
          footer={
            selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
          }
        />
      </div>

    )
  return (
    <div>
      <CommonPart
        listingID={listingID}
      />

      <DayPicker
        animate
        mode="single"
        selected={selected}
        onSelect={setSelected}
        footer={
          selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
        }
      />
    </div>
  );
}

export default BuyerSlotsPage;
