import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useState } from "react";
import PopUp from "../components/PopUp";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useEffect } from "react";
import { fr, enUS } from "date-fns/locale";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

const CommonPart: React.FC<{ listingID: string }> = ({ listingID }) => {
  const { t } = useTranslation("buyerSlots");

  return (
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
  )
}

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

interface AvailabilityData {
  availability: AvailabilitySlot[];
  sellerId: string;
  isMine: boolean;
}

const BuyerSlotsPage: React.FC = () => {
  const { t, i18n } = useTranslation("buyerSlots");
  const calendarLocale = i18n.language === "en" ? enUS : fr;
  const [availability, setAvailability] = useState<AvailabilityData>();
  const [searchParams] = useSearchParams();
  const listingID = searchParams.get("id") as string;
  const [selected, setSelected] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const url = `/api/reservations/get-slot?id=${listingID}`;
  const navigate = useNavigate();
  const location = useLocation();
  VerifyUsersState()
  const { isConnected } = useDataProvider();

  useEffect(() => {
    if (isConnected !== null && isConnected === false) {
      navigate("/sign-in", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!listingID) {
      navigate("/home");
      return;
    }
    const fetchSlots = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data: AvailabilityData = await response.json();
        if (data.isMine)
          navigate("/home");

        const dates = data.availability.map(slot => new Date(slot.day));
        setAvailableDates(dates);
        setAvailability(data);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [url, isConnected, navigate, location.pathname, location.search, showConfirmation]);

  const handleConfirm = async () => {
    if (!selectedSlot || !availability?.sellerId) return;

    setIsConfirming(true);
    try {
      const response = await fetch('/api/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          slot: selectedSlot,
          listingId: listingID,
          sellerId: availability.sellerId
        })
      });

      if (response.ok) {
        toast.success(t("messages.success", "Réservation confirmée avec succès !"));
        setShowConfirmation(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message ? t(`error:${errorData.message}`) : t("errors.failed", "Erreur lors de la réservation");
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(t("errors.network", "Erreur réseau lors de la réservation"));
    } finally {
      setIsConfirming(false);
    }
  };

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(minDate);
  maxDate.setDate(minDate.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);

  if (loading)
    return (
      <div className="text-amber-400">
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
    <div className="flex justify-center w-full bg-foreground">
      <div className=" w-full max-w-[1425px] pt-[60px] md:pt-[100px] mb-20 px-4 text-background">
        <CommonPart listingID={listingID} />
        <div className="w-full mx-auto rounded-3xl shadow-2xl flex flex-col md:flex-row gap-0 bg-card-bg  overflow-hidden border border-highlight/20 transition-colors duration-300">
          <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-highlight/20 flex justify-center bg-background/5">
            <DayPicker
              locale={calendarLocale}
              animate
              mode="single"
              selected={selected}
              onSelect={(date) => {
                setSelected(date);
                setSelectedSlot(undefined);
              }}
              startMonth={minDate}
              endMonth={maxDate}
              disabled={(date) => {
                const isOutOfRange = date < minDate || date > maxDate;
                const isNotAvailable = !availableDates.some(availableDate =>
                  availableDate.toDateString() === date.toDateString()
                );
                return isOutOfRange || isNotAvailable;
              }}
              modifiers={{
                available: availableDates
              }}
              formatters={{
                formatCaption: (month) => {
                  const formatted = month.toLocaleDateString(i18n.language, {
                    month: 'long',
                    year: 'numeric'
                  });
                  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                }
              }}

              classNames={{
                chevron: "fill-background",
              }}
              modifiersClassNames={{
                available: "text-background font-semibold rounded-4xl m-7 hover:bg-accent hover:text-foreground",
                selected: "bg-accent text-foreground",
                disabled: "text-background/20 line-through cursor-not-allowed",
              }}
              footer={
                <div className="pt-2 text-background/40 text-[11px] tracking-tighter border-t border-highlight/30 mt-4">
                  Madagascar (GMT+3)
                </div>
              }
            />
          </div>
          {!selected ? (
            <div className="flex flex-col items-center justify-center w-full p-10 min-h-[300px] text-center">
              <h3 className="text-xl font-bold text-background/30">
                {t("pleaseSelectDate", "Veuillez sélectionner une date")}
              </h3>
            </div>
          ) : (
            <div className="flex flex-col w-full p-6 md:p-10">
              <div>
                <h3 className="text-3xl font-black text-background">
                  {(() => {
                    const label = selected?.toLocaleDateString(i18n.language, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    });
                    return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
                  })()}
                </h3>
                <p className="text-base text-background/60 mt-1">
                  {
                    availability?.availability.filter(
                      slot => new Date(slot.day).toDateString() === selected?.toDateString()
                    ).flatMap(s => s.slots).length || 0
                  } {t("slotsAvailable", "créneaux disponibles")}
                </p>

                <div className="mt-8">
                  {(() => {
                    const daySlots = (availability?.availability
                      .filter(slot => new Date(slot.day).toDateString() === selected?.toDateString())
                      .flatMap(slot => slot.slots)
                      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())) || [];

                    const morning = daySlots.filter(time => new Date(time).getHours() < 12);
                    const afternoon = daySlots.filter(time => new Date(time).getHours() >= 12 && new Date(time).getHours() < 18);
                    const evening = daySlots.filter(time => new Date(time).getHours() >= 18);

                    const renderSection = (title: string, icon: string, slots: string[]) => {
                      if (slots.length === 0) return null;
                      return (
                        <div className="mb-10">
                          <div className="flex items-center gap-2 mb-4 text-background/80">
                            <span className="text-xl">{icon}</span>
                            <h4 className="text-sm font-bold uppercase tracking-widest">{title}</h4>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {slots.map((timeISO, index) => {
                              const timeLabel = new Date(timeISO).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedSlot(timeISO)}
                                  className={`px-4 py-4 border rounded-2xl transition-all duration-300 font-bold text-base shadow-sm active:scale-95 ${selectedSlot === timeISO
                                    ? "bg-accent text-foreground border-accent shadow-lg scale-105"
                                    : "border-highlight/40 bg-highlight/10 text-background hover:bg-highlight/20 hover:border-accent/50 hover:shadow-md"
                                    }`}
                                >
                                  {timeLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        {renderSection(t("morning", "Matin"), "🌅", morning)}
                        {renderSection(t("afternoon", "Après-midi"), "☀️", afternoon)}
                        {renderSection(t("evening", "Soir"), "🌙", evening)}

                        <div className="mt-10 pt-14 border-t border-highlight/30">
                          <ActionButton
                            title={t("buttons.reserve", "Réserver ce créneau")}
                            icon=""
                            padding="p-7"
                            font_size="text-[20px]"
                            icon_size={28}
                            disabled={!selectedSlot}
                            onClick={() => setShowConfirmation(true)}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
        {showConfirmation && (
          <PopUp
            title={t("confirmationTitle", "Confirmer la réservation")}
            onClose={() => !isConfirming && setShowConfirmation(false)}
          >
            <div className="flex flex-col gap-6 p-2 text-background">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                  {t("dateAndTime", "Date et heure")}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <p className="text-lg font-black">
                    {selected?.toLocaleDateString(i18n.language, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <p className="text-lg font-black">
                    {selectedSlot && new Date(selectedSlot).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20">
                <p className="text-xs leading-relaxed opacity-80">
                  {t("confirmationNotice", "En confirmant, une demande de visite sera envoyée au propriétaire. Vous pourrez suivre l'état de votre demande dans vos réservations.")}
                </p>
              </div>

              <div className="flex gap-4 mt-2 w-full">
                <div className="flex-1">
                  <ActionButton
                    title={t("buttons.cancel", "Annuler")}
                    padding="p-4"
                    base_color="var(--color-darktone)"
                    accent_color="var(--color-background)"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isConfirming}
                  />
                </div>
                <div className="flex-1">
                  <ActionButton
                    title={isConfirming ? t("buttons.loading", "En cours...") : t("buttons.confirm", "Confirmer")}
                    icon={isConfirming ? "⏳" : ""}
                    padding="p-4"
                    onClick={handleConfirm}
                    disabled={isConfirming}
                  />
                </div>
              </div>
            </div>
          </PopUp>
        )}
      </div>
    </div>
  );
};

export default BuyerSlotsPage;
