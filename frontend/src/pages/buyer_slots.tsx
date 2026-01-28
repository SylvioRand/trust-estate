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
      className="flex flex-col items-center justify-center
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

interface AvailabilitySlot {
  day: string;
  month: string;
  slots: string[];
}

interface AvailabilityData {
  availability: AvailabilitySlot[];
}

const BuyerSlotsPage: React.FC = () => {
  const { t } = useTranslation("buyerSlots");
  const [searchParams] = useSearchParams();
  const listingID = searchParams.get("id") as string;
  const [selected, setSelected] = useState<Date>();
  const [loading, setLoading] = useState<boolean>(true);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const url = `/api/reservations/get-slot?id=${listingID}`;

  useEffect(() => {
    console.log("url: ", url);
    const fetchSlots = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error("Error fetching data: ", response);
          setLoading(false);
          return;
        }

        const data: AvailabilityData = await response.json();
        console.log("Slots data:", data);

        // Extract unique dates from availability
        const dates = data.availability.map(slot => new Date(slot.day));
        setAvailableDates(dates);

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [url]);

  if (loading)
    return (
      <div>
        <CommonPart
          listingID={listingID}
        />
        <div className="flex flex-col items-center justify-center">

          <DayPicker
            disabled={true}
            animate
            mode="single"
            classNames={{ day: "text-gray-500" }}
          />
        </div>
      </div>

    )
  return (
    <div className="m-7">
      <CommonPart
        listingID={listingID}
      />
      <div className="flex flex-col items-center justify-center">
        <DayPicker
          animate
          mode="single"
          selected={selected}
          onSelect={setSelected}
          disabled={(date) => {
            // Disable all dates except available ones
            return !availableDates.some(availableDate =>
              availableDate.toDateString() === date.toDateString()
            );
          }}
          modifiers={{
            available: availableDates
          }}
          modifiersClassNames={{
            available: "text-black font-semibold rounded-lg m-7 hover:bg-gray-800",
            selected: "bg-gray-800 text-white",
            disabled: "text-gray-300 line-through cursor-not-allowed"
          }}
          footer={
            selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick an available slot to continue"
          }
        />
      </div>
    </div>
  );
}

export default BuyerSlotsPage;
