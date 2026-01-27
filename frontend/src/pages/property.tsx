import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type PropertyDataType } from "../dataModel/modelPropertyList";
import ActionButton from "../components/ActionButton";
import { TagsComponents } from "../components/TagsComponents";
import type { ListingsTags } from "../dataModel/modelListings";
import InputEnum, { type InputEnumData } from "../components/InputEnum";
import type { TFunction } from "i18next";
import { ZONE_ENUM } from "../dataModel/dataZone";
import { toast } from "react-toastify";
import InputRange from "../components/InputRange";
import InputCheckbox from "../components/InputCheckBox";

interface PublicationCardProps {
  propertyData: PropertyDataType;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  propertyData
}) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const navigate = useNavigate();
  const formatter = new Intl.NumberFormat("de-DE");
  const { t } = useTranslation("listings");

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr]
			flex-none
			rounded-xl
			shadow-standard
			relative
			w-full h-full
			min-h-90 max-h-90
			border border-background/25
			overflow-hidden"
      onPointerOver={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="w-full h-50
				flex items-center justify-center
				relative
				overflow-hidden
				bg-red-500"
      >
        <img
          className="w-full h-full object-cover
					ease-in-out
					transition-transform duration-500"
          src={propertyData.photos[0]}
          alt="House Picture"
          style={{
            transform: hovered ? "scale(105%)" : "none"
          }}
        />
        <div className="absolute top-0 left-0
					grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] grid-rows-1
					p-2
					gap-2
					w-full"
        >
          {
            propertyData.tags.map((value: ListingsTags, index: number) => {
              return (
                <TagsComponents
                  key={index}
                  tags={value}
                />
              );
            })
          }
        </div>
      </div>

      <div className="grid grid-cols-1 grid-rows-1 w-full h-full
				border-t border-background/25
				p-3"
      >
        <div className="grid grid-cols-[1fr_auto] grid-rows-1
					place-items-center">
          <div className="flex items-center justify-start gap-1
						font-inter font-light
						w-full"
          >
            <div className="font-icon"></div>{propertyData.zone}</div>
          <div className="border border-background/25
						px-3 py-1
						shadow-standard
						rounded-full"
          >
            {t(`section.listingType.${propertyData.type}`)}
          </div>
        </div>

        <div className="flex flex-col items-start justify-center
					flex-none
					w-full"
        >
          <div className="font-bold text-lg">
            {propertyData.title}
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="font-icon text-xl">
              󰳂
            </div>
            <div className="font-light text-md">
              {propertyData.surface} m<sup>2</sup>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-[1fr_auto] grid-rows-1
					place-items-center
					w-full"
        >
          <div className="font-light text-lg
						justify-self-start"
          >
            {formatter.format(propertyData.price)} AR
          </div>
          <div>
            <ActionButton
              icon=""
              icon_place="right"
              title={t("viewDetails")}
              onClick={() => navigate(`/property/listings?id=${propertyData.id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterProps {
  t: TFunction<["property", "error", "common"]>;
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
  setIsFetchingData,
  setLastFilter,
  setPage,
  setMaxPage,
  page = 1
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);

  const InputEnumDataBoolean: InputEnumData[] = [
    { value: "none", title: t("common:all") },
    { value: "true", title: t("common:true") },
    { value: "false", title: t("common:false") }
  ]

  const applyFilters = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpen(false);
    const formData: FormData = new FormData(e.currentTarget);
    let url: string = `/api/listings/?limit=1&page=${page}`;
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
    console.log(url);

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
        setMaxPage(responseData.pagination.totalPages);
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

  return (
    <div className="sticky top-14
			border border-background/25
			bg-linear-to-b from-foreground via-foreground/75 to-transparent
			flex flex-col items-center justify-start gap-3
			backdrop-blur-lg
			rounded-xl
			shadow-standard
			p-2
			z-2
			flex-none
			overflow-hidden
			transition-discrete duration-500
			w-full"
      style={{
        height: isOpen ? "1245px" : "55px"
      }}
    >
      <button
        className="border border-background/25
				shadow-standard
				px-2 py-1
				w-full
				grid grid-cols-[1fr_auto] grid-rows-1
				transition-colors duration-200
				cursor-pointer
				rounded-md"
        onClick={() => setIsOpen(isOpen ? false : true)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={{
          backgroundColor: hovered ? "color-mix(in srgb, var(--color-accent) 25%, transparent)" : "transparent"
        }}
      >
        <div
          className="justify-self-start"
        >
          {t("buttons.filter.title")}
        </div>
        <div
          className="font-icon
					transition-transform duration-300"
          style={{
            transform: isOpen ? "rotateZ(-180deg)" : "none"
          }}
        >
          
        </div>
      </button>

      <form
        className="flex flex-col items-center justify-start gap-3
				w-full"
        onSubmit={applyFilters}>
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
          dataEnum={[
            { value: "none", title: t("buttons.filter.location.none") },
            ...ZONE_ENUM
          ]}
        />
        <ActionButton
          title={t("buttons.filter.apply")}
          type="submit"
        />
      </form>
    </div>
  );
}

interface PageButtonProps {
  title: string;
  onClick: () => void;
  disabled: boolean;
}

const PageButton: React.FC<PageButtonProps> = ({
  title = "Title",
  onClick,
  disabled = false
}) => {
  return (
    <button
      className="border border-background/25
		p-2 rounded-md
		cursor-pointer
		shadow-standard"
      style={{
        opacity: disabled ? "42%" : "100%",
        pointerEvents: disabled ? "none" : "auto"
      }}
      onClick={onClick}
    >
      {title}
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
  const arePreviousDisabled = page === 1;
  const areNextDisabled = page === maxPage;

  const getDataFromBackend = async () => {
    setIsFetchingData(true);
    try {
      const response = await fetch(`/api/listings/?limit=1&page=${page}${lastFilter}`, {
        method: "GET",
        credentials: "include"
      });
      const responseData = await response.json();

      // NOTE: Should verify if there is an error or not!
      if (response.ok) {
        setDataToDisplay(responseData.data);
        setMaxPage(responseData.pagination.totalPages);
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
        setIsFetchingData={setIsFetchingData}
        setLastFilter={setLastFilter}
        page={page}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />

      {
        isFetchingData === false && dataToDisplay.length > 0 &&
        <div className="flex flex-col items-center justify-start gap-4
				md:grid md:grid-cols-2 md:grid-rows-2
				xl:grid xl:grid-cols-3 xl:grid-rows-2
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
                    <PublicationCard
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
          className="font-light">
          {t("no_result")}
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
        className="flex items-center justify-center gap-3
			w-full"
      >
        <PageButton
          title={t("buttons.page.previous")}
          onClick={() => {
            setPage(page > 1 ? page - 1 : 1);
          }}
          disabled={arePreviousDisabled || isFetchingData}
        />
        <PageButton
          title={t("buttons.page.next")}
          onClick={() => {
            setPage(page + 1);
          }}
          disabled={areNextDisabled || isFetchingData}
        />
      </div>
    </div>
  );
}

export default PropertyPage;
