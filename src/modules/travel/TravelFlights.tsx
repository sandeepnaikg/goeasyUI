import { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Clock,
  Star,
  Filter,
  Luggage,
  Briefcase,
  Wifi,
  Bell,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import OffersStrip from "../../components/OffersStrip";
import StepIndicator from "../../components/StepIndicator";
import ErrorBlock from "../../components/ErrorBlock";
import { SkeletonCard } from "../../components/Skeleton";
import Segmented from "../../components/ui/Segmented";
import Chip from "../../components/ui/Chip";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

type FareFamily = "Lite" | "Value" | "Flexi";

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string; // 2h 30m
  price: number;
  rating: number;
  stops: number;
  fares: Array<{
    family: FareFamily;
    price: number;
    baggage: string;
    refund: string;
    change: string;
    perks?: string[];
  }>;
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
function toTimeLabel(h: number, m: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${pad2(hr)}:${pad2(m)} ${ampm}`;
}

function generateFlights(
  from: string,
  to: string,
  dateStr: string
): FlightResult[] {
  const seed = Math.abs(
    (from + to + dateStr).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  );
  const rng = (n: number) => Math.abs(Math.sin(seed + n));
  const airlines = [
    "IndiGo",
    "Air India",
    "Vistara",
    "Akasa Air",
    "SpiceJet",
    "AirAsia",
  ];
  const codes = ["6E", "AI", "UK", "QP", "SG", "I5"];
  const res: FlightResult[] = [];
  for (let i = 0; i < 10; i++) {
    const idx = i % airlines.length;
    const depH = 5 + Math.floor(rng(i) * 17); // 5am - 9pm
    const depM = [0, 15, 30, 45][Math.floor(rng(i + 1) * 4)];
    const durH = 1 + Math.floor(rng(i + 2) * 3); // 1-3 hours
    const durM = [0, 15, 30, 45][Math.floor(rng(i + 3) * 4)];
    const arrH = (depH + durH) % 24;
    const arrM = durM;
    const base = 2999 + Math.floor(rng(i + 4) * 6000);
    const stops = rng(i + 5) > 0.75 ? 1 : 0;
    const rating = +(4.0 + rng(i + 6) * 0.8).toFixed(1);
    const price = base + (stops ? -300 : 500);
    const lite = {
      family: "Lite" as const,
      price,
      baggage: "7kg cabin",
      refund: "Non-refundable",
      change: "₹1500 + fare diff",
    };
    const value = {
      family: "Value" as const,
      price: price + 600,
      baggage: "15kg check-in",
      refund: "Partial refund",
      change: "₹1000 + fare diff",
      perks: ["Seat select"],
    };
    const flexi = {
      family: "Flexi" as const,
      price: price + 1500,
      baggage: "20kg check-in",
      refund: "Free cancellation window",
      change: "Free date change (1x)",
      perks: ["Priority boarding"],
    };
    res.push({
      id: `f${i + 1}`,
      airline: airlines[idx],
      flightNumber: `${codes[idx]}-${100 + Math.floor(rng(i + 7) * 900)}`,
      departure: toTimeLabel(depH, depM),
      arrival: toTimeLabel(arrH, arrM),
      duration: `${durH}h ${durM}m`,
      price,
      rating,
      stops,
      fares: [lite, value, flexi],
    });
  }
  return res;
}

export default function TravelFlights() {
  const { setCurrentPage, prevPage } = useApp();
  const [searchData, setSearchData] = useState<{
    fromLocation?: string;
    toLocation?: string;
    departureDate?: string;
    travelers?: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "rating">(
    "price"
  );
  const [intent, setIntent] = useState<"value" | "speed">("value");
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date | null>(null);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  type Bucket = "night" | "morning" | "afternoon" | "evening";
  const [depBucket, setDepBucket] = useState<Record<Bucket, boolean>>({
    night: false,
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [arrBucket, setArrBucket] = useState<Record<Bucket, boolean>>({
    night: false,
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [airlinesSel, setAirlinesSel] = useState<Record<string, boolean>>({});
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [bounds, setBounds] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  });
  const [priceAlert, setPriceAlert] = useState(false);
  const [toolbarCompact, setToolbarCompact] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("travelSearch");
    if (data) setSearchData(JSON.parse(data));
  }, []);

  // Compact the sticky header card on scroll to save vertical space
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setToolbarCompact(y > 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const formatYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const parseDateSafe = (s?: string) => {
    const d = s ? new Date(s) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const chosenDate = parseDateSafe(searchData?.departureDate);

  const setDepartureDate = (d: Date) => {
    const next = { ...(searchData || {}), departureDate: formatYmd(d) };
    setSearchData(next);
    try {
      localStorage.setItem("travelSearch", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setShowCalendar(false);
  };

  // helpers
  const parseTimeToMinutes = (label: string) => {
    // format: "HH:MM AM/PM"
    const [time, ap] = label.split(" ");
    const [hh, mm] = time.split(":").map(Number);
    let h = hh % 12;
    if (ap?.toUpperCase() === "PM") h += 12;
    return h * 60 + (mm || 0);
  };
  // bucket helper kept inline in memo below to avoid hook deps noise

  // base list
  const baseList = useMemo(() => {
    if (
      !searchData?.fromLocation ||
      !searchData?.toLocation ||
      !searchData?.departureDate
    )
      return [] as FlightResult[];
    return generateFlights(
      searchData.fromLocation,
      searchData.toLocation,
      searchData.departureDate
    );
  }, [
    searchData?.fromLocation,
    searchData?.toLocation,
    searchData?.departureDate,
  ]);

  // compute cheapest fares for alt-day chips
  const getMinPrice = (d: Date) => {
    if (!searchData?.fromLocation || !searchData?.toLocation) return 0;
    const list = generateFlights(
      searchData.fromLocation,
      searchData.toLocation,
      formatYmd(d)
    );
    if (list.length === 0) return 0;
    return Math.min(...list.map((x) => x.price));
  };
  const altDays = useMemo(() => {
    const arr: { date: Date; label: string; price: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(chosenDate);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
      });
      arr.push({ date: d, label, price: getMinPrice(d) });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenDate.getTime(), searchData?.fromLocation, searchData?.toLocation]);

  // setup airlines and price bounds when base list changes
  useEffect(() => {
    if (baseList.length === 0) return;
    const uniq = Array.from(new Set(baseList.map((f) => f.airline)));
    const nextSel: Record<string, boolean> = {};
    uniq.forEach((a) => {
      nextSel[a] = true;
    });
    setAirlinesSel(nextSel);
    const min = Math.min(...baseList.map((f) => f.price));
    const max = Math.max(...baseList.map((f) => f.price));
    setBounds({ min, max });
    setPriceMin(min);
    setPriceMax(max);
  }, [baseList]);

  const flights = useMemo(() => {
    const getBucket = (mins: number): Bucket => {
      const h = Math.floor(mins / 60);
      if (h < 5) return "night";
      if (h < 12) return "morning";
      if (h < 18) return "afternoon";
      return "evening";
    };
    let list = [...baseList];
    if (nonStopOnly) list = list.filter((f) => f.stops === 0);
    // airline filter
    const selectedAirlines = Object.entries(airlinesSel)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selectedAirlines.length > 0)
      list = list.filter((f) => selectedAirlines.includes(f.airline));
    // departure buckets
    const hasDepBucket = Object.values(depBucket).some(Boolean);
    if (hasDepBucket) {
      list = list.filter(
        (f) => depBucket[getBucket(parseTimeToMinutes(f.departure))]
      );
    }
    // arrival buckets
    const hasArrBucket = Object.values(arrBucket).some(Boolean);
    if (hasArrBucket) {
      list = list.filter(
        (f) => arrBucket[getBucket(parseTimeToMinutes(f.arrival))]
      );
    }
    // price range
    list = list.filter((f) => f.price >= priceMin && f.price <= priceMax);
    // sort
    list.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.duration.localeCompare(b.duration);
    });
    return list;
  }, [
    baseList,
    nonStopOnly,
    airlinesSel,
    depBucket,
    arrBucket,
    priceMin,
    priceMax,
    sortBy,
  ]);

  // Insights: on-time leader (approx via rating) and simple fare trend based on alt-day mins
  const onTimeLeader = useMemo(() => {
    if (!baseList.length) return null as string | null;
    const map: Record<string, { sum: number; count: number }> = {};
    baseList.forEach((f) => {
      map[f.airline] = map[f.airline] || { sum: 0, count: 0 };
      map[f.airline].sum += f.rating;
      map[f.airline].count += 1;
    });
    const top = Object.entries(map)
      .map(([k, v]) => ({ k, avg: v.sum / Math.max(1, v.count) }))
      .sort((a, b) => b.avg - a.avg)[0];
    return top?.k || null;
  }, [baseList]);

  const fareTrend = useMemo(() => {
    // compute 7-day window min prices around chosen date
    const localGetMin = (d: Date) => {
      if (!searchData?.fromLocation || !searchData?.toLocation) return 0;
      const list = generateFlights(
        searchData.fromLocation,
        searchData.toLocation,
        (() => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        })()
      );
      return list.length ? Math.min(...list.map((x) => x.price)) : 0;
    };
    const prices: number[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(chosenDate);
      d.setDate(d.getDate() + i);
      prices.push(localGetMin(d));
    }
    if (prices.length < 2) return 0;
    return prices[prices.length - 1] - prices[0];
  }, [chosenDate, searchData?.fromLocation, searchData?.toLocation]);

  // price lock toggle persisted per route
  const routeKey = useMemo(
    () =>
      `${searchData?.fromLocation || ""}-${
        searchData?.toLocation || ""
      }`.toLowerCase(),
    [searchData?.fromLocation, searchData?.toLocation]
  );
  const [priceLock, setPriceLock] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`priceLock:${routeKey}`) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(`priceLock:${routeKey}`, priceLock ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [priceLock, routeKey]);

  const handleSelectFlight = (flight: FlightResult, family: FareFamily) => {
    const chosen = { ...flight, chosenFare: family };
    localStorage.setItem("selectedFlight", JSON.stringify(chosen));
    localStorage.setItem("bookingType", "flight");
    setCurrentPage("travel-seats");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OffersStrip
          offers={[
            { code: "GOFLY300", label: "Flight: Flat ₹300 OFF" },
            { code: "HDFC10", label: "10% OFF on Cards" },
          ]}
        />
        <div
          className={`bg-white rounded-2xl shadow-md mb-6 sticky z-[90] shadow-glow transition-all sticky-smooth ${
            toolbarCompact ? "p-3" : "p-6"
          }`}
          style={{ top: "var(--app-header-offset)" }}
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(prevPage || "travel-home")}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-brand-500 transition-colors"
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <div>
                <h1 className={`${toolbarCompact ? "text-xl" : "text-2xl"} font-bold text-gray-900`}>
                  {searchData?.fromLocation} → {searchData?.toLocation}
                </h1>
                <p className={`text-gray-600 ${toolbarCompact ? "text-xs" : "text-sm"}`}>
                  {formatYmd(chosenDate)} • {searchData?.travelers} Traveler(s)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCalendar((v) => !v);
                  setCalendarViewDate(chosenDate);
                }}
              >
                Change date
              </Button>
              {/* Value vs Speed intent toggle */}
              <Segmented
                className="hidden md:inline-flex"
                value={intent}
                onChange={(v) => {
                  if (v === "value") setSortBy("price");
                  else setSortBy("duration");
                  setIntent(v);
                }}
                options={[
                  { label: "Value", value: "value" },
                  { label: "Speed", value: "speed" },
                ]}
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price" | "duration" | "rating")
                }
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
              >
                <option value="price">Sort by: Price</option>
                <option value="duration">Sort by: Duration</option>
                <option value="rating">Sort by: Rating</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                onClick={() => setPriceAlert(!priceAlert)}
                selected={priceAlert}
                className={priceAlert ? "border-amber-500 bg-amber-50 text-amber-700" : undefined}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4" /> Price alert
                </span>
              </Chip>
            </div>
          </div>
          {/* 7-day sparkline */}
          <div className="mt-4" id="trend-top">
            <div
              className="flex items-center justify-between mb-1 sticky bg-white rounded-md px-2"
              style={{ top: "calc(var(--app-header-offset) + 72px)" }}
            >
              <div className="text-sm text-gray-700">7‑day price trend</div>
              {altDays.length > 0 &&
                (() => {
                  const prices = altDays.map((a) => a.price);
                  const min = Math.min(...prices);
                  const idx = prices.indexOf(min);
                  const cheapestDate = altDays[idx]?.date;
                  return (
                    <button
                      onClick={() => {
                        if (cheapestDate) {
                          setDepartureDate(cheapestDate);
                          try {
                            window.dispatchEvent(
                              new CustomEvent("toast", {
                                detail: {
                                  type: "success",
                                  message: `Cheapest day selected • ₹${min.toLocaleString()}`,
                                },
                              })
                            );
                          } catch {
                            /* ignore */
                          }
                          // smooth scroll down to results list
                          setTimeout(() => {
                            const el = document.getElementById("results-top");
                            el?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            // add a brief highlight pulse on first few results
                            try {
                              const cards =
                                document.querySelectorAll("[data-flight-card]");
                              let i = 0;
                              cards.forEach((c) => {
                                if (i < 3) {
                                  c.classList.add("pulse-highlight");
                                  setTimeout(
                                    () => c.classList.remove("pulse-highlight"),
                                    900
                                  );
                                  i++;
                                }
                              });
                            } catch {
                              /* ignore */
                            }
                          }, 50);
                        }
                      }}
                      className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
                      title="Jump to cheapest day"
                    >
                      Cheapest this week ₹{min.toLocaleString()}
                    </button>
                  );
                })()}
            </div>
            <Sparkline
              from={searchData?.fromLocation || ""}
              to={searchData?.toLocation || ""}
              date={searchData?.departureDate || ""}
              compact={toolbarCompact}
            />
          </div>
          {/* Alt-day chips with cheapest fares */}
          <div className="mt-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pr-2">
              {altDays.map(({ date, label, price }) => {
                const isActive = formatYmd(date) === formatYmd(chosenDate);
                const isToday = formatYmd(date) === formatYmd(new Date());
                const cheapest = Math.min(
                  ...altDays.map((d) => d.price || Infinity)
                );
                return (
                  <Chip
                    key={formatYmd(date)}
                    onClick={() => setDepartureDate(date)}
                    size="sm"
                    selected={isActive}
                    className="whitespace-nowrap chip-focus"
                  >
                    <span className="font-semibold mr-2">{label}</span>
                    <span className="text-gray-600">
                      ₹{price.toLocaleString()}
                    </span>
                    {isToday && (
                      <Badge className="ml-2 text-purple-700 bg-purple-50 border border-purple-200">
                        Today
                      </Badge>
                    )}
                    {price === cheapest && (
                      <Badge className="ml-2 text-emerald-700 bg-emerald-50 border-emerald-200">
                        Cheapest
                      </Badge>
                    )}
                  </Chip>
                );
              })}
            </div>
          </div>
          {/* Alt day summary row (min/median/max) */}
          {altDays.length > 0 && (
            <div className="mt-2 text-xs text-gray-700">
              Summary:
              {(() => {
                const prices = altDays
                  .map((a) => a.price)
                  .sort((a, b) => a - b);
                const min = prices[0];
                const max = prices[prices.length - 1];
                const median = prices[Math.floor(prices.length / 2)];
                return (
                  <span className="ml-1">
                    Min ₹{min.toLocaleString()} • Median ₹
                    {median.toLocaleString()} • Max ₹{max.toLocaleString()}
                  </span>
                );
              })()}
            </div>
          )}
          {/* Inline mini calendar */}
          {showCalendar && (
            <div className="mt-4 p-4 border-2 border-gray-200 rounded-2xl bg-white surface-card">
              <MiniCalendar
                baseDate={calendarViewDate || chosenDate}
                onSetMonth={(d) => setCalendarViewDate(d)}
                onPrevMonth={() =>
                  setCalendarViewDate((prev) => {
                    const d = new Date(prev || chosenDate);
                    d.setMonth(d.getMonth() - 1);
                    return d;
                  })
                }
                onNextMonth={() =>
                  setCalendarViewDate((prev) => {
                    const d = new Date(prev || chosenDate);
                    d.setMonth(d.getMonth() + 1);
                    return d;
                  })
                }
                onSelect={(d) => setDepartureDate(d)}
                getPrice={(d) => getMinPrice(d)}
              />
            </div>
          )}
          {showFilters && (
            <div className="mt-4 p-4 border-2 border-gray-200 rounded-xl bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={nonStopOnly}
                    onChange={(e) => setNonStopOnly(e.target.checked)}
                  />
                  Non-stop only
                </label>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNonStopOnly(false);
                      setDepBucket({
                        night: false,
                        morning: false,
                        afternoon: false,
                        evening: false,
                      });
                      setArrBucket({
                        night: false,
                        morning: false,
                        afternoon: false,
                        evening: false,
                      });
                      setPriceMin(bounds.min);
                      setPriceMax(bounds.max);
                      const reset: Record<string, boolean> = {};
                      Object.keys(airlinesSel).forEach(
                        (a) => (reset[a] = true)
                      );
                      setAirlinesSel(reset);
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Done
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    Departure time
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["night", "morning", "afternoon", "evening"] as Bucket[]
                    ).map((b) => (
                      <Chip
                        key={`dep-${b}`}
                        onClick={() =>
                          setDepBucket((prev) => ({ ...prev, [b]: !prev[b] }))
                        }
                        size="sm"
                        selected={depBucket[b]}
                      >
                        {b[0].toUpperCase() + b.slice(1)}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    Arrival time
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["night", "morning", "afternoon", "evening"] as Bucket[]
                    ).map((b) => (
                      <Chip
                        key={`arr-${b}`}
                        onClick={() =>
                          setArrBucket((prev) => ({ ...prev, [b]: !prev[b] }))
                        }
                        size="sm"
                        selected={arrBucket[b]}
                      >
                        {b[0].toUpperCase() + b.slice(1)}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  Airlines
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                  {Object.keys(airlinesSel).map((a) => (
                    <label key={a} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!airlinesSel[a]}
                        onChange={(e) =>
                          setAirlinesSel((prev) => ({
                            ...prev,
                            [a]: e.target.checked,
                          }))
                        }
                      />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  Price range
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Min</span>
                    <input
                      type="number"
                      value={priceMin}
                      min={bounds.min}
                      max={priceMax}
                      step={100}
                      onChange={(e) =>
                        setPriceMin(
                          Math.min(
                            Math.max(Number(e.target.value) || 0, bounds.min),
                            priceMax
                          )
                        )
                      }
                      className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-brand-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Max</span>
                    <input
                      type="number"
                      value={priceMax}
                      min={priceMin}
                      max={bounds.max}
                      step={100}
                      onChange={(e) =>
                        setPriceMax(
                          Math.max(
                            Math.min(Number(e.target.value) || 0, bounds.max),
                            priceMin
                          )
                        )
                      }
                      className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-brand-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Bounds: ₹{bounds.min.toLocaleString()} – ₹
                    {bounds.max.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-3">
          <StepIndicator
            steps={[
              "Search",
              "Results",
              "Details",
              "Seats",
              "Payment",
              "Confirm",
            ]}
            current={1}
          />
        </div>

        {/* Quick chips bar (non-sticky to avoid intersection jump) */}
        <div className="-mt-2 mb-2">
          <div className="bg-white/90 backdrop-blur rounded-full border border-gray-200 shadow-sm px-3 py-2 flex flex-wrap items-center gap-2">
            {(() => {
              if (baseList.length === 0) return null;
              const prices = baseList.map((f) => f.price);
              const min = Math.min(...prices);
              const avg = Math.round(
                prices.reduce((a, b) => a + b, 0) / prices.length
              );
              // derive cheapest airline and % non-stop
              const byAir: Record<string, { count: number; min: number }> = {};
              let nonStops = 0;
              for (const f of baseList) {
                byAir[f.airline] = byAir[f.airline] || {
                  count: 0,
                  min: f.price,
                };
                byAir[f.airline].count += 1;
                byAir[f.airline].min = Math.min(byAir[f.airline].min, f.price);
                if (f.stops === 0) nonStops += 1;
              }
              const cheapestAir = Object.entries(byAir).sort(
                (a, b) => a[1].min - b[1].min
              )[0]?.[0];
              const nonStopPct = Math.round((nonStops / baseList.length) * 100);
              const trendLabel =
                fareTrend === 0
                  ? "stable"
                  : fareTrend < 0
                  ? "dropping"
                  : "rising";
              return (
                <div className="text-[11px] text-gray-700 inline-flex items-center gap-2 mr-1">
                  <span className="inline-flex items-center gap-1 rounded-full border bg-brand-50 border-brand-200 text-brand-700 px-2 py-0.5">
                    Min ₹{min.toLocaleString()}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Avg ₹{avg.toLocaleString()}
                  </span>
                  {cheapestAir && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 border-gray-200 px-2 py-0.5">
                        Cheapest: {cheapestAir}
                      </span>
                    </>
                  )}
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 border-gray-200 px-2 py-0.5">
                    {nonStopPct}% non‑stop
                  </span>
                  {onTimeLeader && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5">
                        On‑time leader: {onTimeLeader}
                      </span>
                    </>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                      fareTrend === 0
                        ? "bg-gray-50 border-gray-200 text-gray-700"
                        : fareTrend < 0
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    Trend: {trendLabel}
                  </span>
                  <button
                    onClick={() => {
                      const el = document.getElementById("results-top");
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      try {
                        const cards =
                          document.querySelectorAll("[data-flight-card]");
                        let i = 0;
                        cards.forEach((c) => {
                          if (i < 2) {
                            c.classList.add("pulse-highlight");
                            setTimeout(
                              () => c.classList.remove("pulse-highlight"),
                              900
                            );
                            i++;
                          }
                        });
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="ml-1 text-[11px] px-2 py-0.5 rounded-full border hover:border-brand-400"
                  >
                    Jump to results
                  </button>
                </div>
              );
            })()}
            <button
              onClick={() => setNonStopOnly((v) => !v)}
              className={`px-3 py-1.5 text-xs rounded-full border-2 ${
                nonStopOnly
                  ? "border-brand-600 text-brand-700 bg-brand-50"
                  : "border-gray-200 text-gray-700 hover:border-brand-400"
              }`}
            >
              Non‑stop
            </button>
            {(["night", "morning", "afternoon", "evening"] as Bucket[]).map(
              (b) => (
                <button
                  key={`chip-dep-${b}`}
                  onClick={() =>
                    setDepBucket((prev) => ({ ...prev, [b]: !prev[b] }))
                  }
                  className={`px-3 py-1.5 text-xs rounded-full border-2 ${
                    depBucket[b]
                      ? "border-brand-600 text-brand-700 bg-brand-50"
                      : "border-gray-200 text-gray-700 hover:border-brand-400"
                  }`}
                >
                  Dep {b}
                </button>
              )
            )}
            <div className="hidden sm:block w-px bg-gray-200 mx-1" />
            {Object.keys(airlinesSel)
              .slice(0, 4)
              .map((a) => (
                <button
                  key={`chip-air-${a}`}
                  onClick={() =>
                    setAirlinesSel((prev) => ({ ...prev, [a]: !prev[a] }))
                  }
                  className={`px-3 py-1.5 text-xs rounded-full border-2 ${
                    airlinesSel[a]
                      ? "border-gray-200 text-gray-700 hover:border-brand-400"
                      : "border-brand-600 text-brand-700 bg-brand-50"
                  }`}
                >
                  {airlinesSel[a] ? a : `No ${a}`}
                </button>
              ))}
          </div>
        </div>

        {/* Empty or loading state */}
        {(!searchData?.fromLocation ||
          !searchData?.toLocation ||
          !searchData?.departureDate) && (
          <ErrorBlock
            title="Add search details"
            message="Enter from, to and date to see flights."
            action={
              <button
                onClick={() => setCurrentPage("travel-home")}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white"
              >
                Go to search
              </button>
            }
          />
        )}
        {searchData?.fromLocation && baseList.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {flights.length === 0 && baseList.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-4">
            <ErrorBlock
              title="No flights match these filters"
              message="Try adjusting your filters or clearing some chips to see more results."
              action={
                <button
                  onClick={() => {
                    setNonStopOnly(false);
                    setDepBucket({
                      night: false,
                      morning: false,
                      afternoon: false,
                      evening: false,
                    });
                    setArrBucket({
                      night: false,
                      morning: false,
                      afternoon: false,
                      evening: false,
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white"
                >
                  Clear chips
                </button>
              }
            />
          </div>
        )}

        <div className="space-y-4" id="results-top">
          {flights.map((flight) => (
            <Card key={flight.id} data-flight-card gradient className="card-lift" innerClassName="p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2.5">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-700 to-brand-500 rounded-xl flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {flight.airline}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {flight.flightNumber}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-600 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Luggage className="w-3 h-3" /> 7kg cabin
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Optional check-in
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wifi className="w-3 h-3" />{" "}
                          {Math.random() > 0.5 ? "Wi‑Fi" : "—"}
                        </span>
                      </div>
                      {/* smart badges */}
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        {(() => {
                          const badges: string[] = [];
                          // Great value if within 10% of min today
                          const minToday = Math.min(
                            ...baseList.map((b) => b.price)
                          );
                          if (flight.price <= minToday * 1.1)
                            badges.push("Great value");
                          // Fastest if duration minimal among list (rough heuristic via string compare already works but we can rank by total minutes)
                          const toMins = (d: string) => {
                            const m = d.match(/(\d+)h\s+(\d+)m/);
                            return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
                          };
                          const minDur = Math.min(
                            ...baseList.map((b) => toMins(b.duration))
                          );
                          if (toMins(flight.duration) === minDur)
                            badges.push("Fastest");
                          // Non‑stop badge
                          if (flight.stops === 0) badges.push("Non‑stop");
                          return badges.slice(0, 3).map((b, i) => (
                            <Badge key={`${flight.id}-badge-${i}`}>{b}</Badge>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {flight.departure}
                      </div>
                      <div className="text-xs text-gray-600">
                        {searchData?.fromLocation}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">{flight.duration}</span>
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 my-1.5"></div>
                      <div className="text-xs text-brand-600 font-semibold">
                        {flight.stops === 0
                          ? "Non-stop"
                          : `${flight.stops} stop(s)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {flight.arrival}
                      </div>
                      <div className="text-xs text-gray-600">
                        {searchData?.toLocation}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-[240px]">
                  <div className="flex items-center justify-end space-x-1 mb-1.5">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{flight.rating}</span>
                  </div>
                  {/* price-lock toggle */}
                  <div className="flex items-center justify-end mb-1.5">
                    <button
                      onClick={() => {
                        setPriceLock((v) => {
                          const next = !v;
                          try {
                            window.dispatchEvent(
                              new CustomEvent("toast", {
                                detail: {
                                  type: "info",
                                  message: next
                                    ? "Price lock on for this route"
                                    : "Price lock off",
                                },
                              })
                            );
                          } catch {
                            /* ignore */
                          }
                          return next;
                        });
                      }}
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        priceLock
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                      title="Lock this route to get alerts and quick access later"
                    >
                      {priceLock ? "🔔 Price lock on" : "🔔 Price lock"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-sm">
                    {flight.fares.map((f) => (
                      <Button
                        key={f.family}
                        onClick={() => handleSelectFlight(flight, f.family)}
                        variant="outline"
                        className="p-2.5 text-left"
                      >
                        <div className="font-bold text-gray-900">
                          {f.family}
                        </div>
                        <div className="text-brand-600 font-extrabold text-sm">
                          ₹{f.price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {f.baggage}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {f.refund}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkline({
  from,
  to,
  date,
  compact = false,
}: {
  from: string;
  to: string;
  date: string;
  compact?: boolean;
}) {
  const [week, setWeek] = useState(0); // 0 = current 7-day window, -1 prev, +1 next, etc.
  const seed = Math.abs(
    (from + to + date).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  );
  const rng = (n: number) => Math.abs(Math.sin(seed + n * 1.37));
  const baseIndex = week * 7;
  const values = Array.from(
    { length: 7 },
    (_, i) => 2500 + Math.floor(rng(baseIndex + i) * 6000)
  );
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values.map((v, i) => ({
    x: (i / 6) * 100,
    y: 36 - ((v - min) / (max - min || 1)) * 28,
  }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");
  const area = `${path} L 100,40 L 0,40 Z`;
  const lowIdx = values.indexOf(min);

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 text-brand-600 ${compact ? "p-1" : "p-2"}`}>
      <div className="flex items-center justify-between mb-1 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeek((w) => w - 1)}
            className="px-2 py-0.5 rounded border hover:border-brand-400"
          >
            ‹
          </button>
          <div className="font-medium">7‑day trend</div>
          <button
            onClick={() => setWeek((w) => w + 1)}
            className="px-2 py-0.5 rounded border hover:border-brand-400"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
            Cheapest ₹{min.toLocaleString()}
          </span>
        </div>
      </div>
      <svg viewBox="0 0 100 40" className={`w-full ${compact ? "h-14" : "h-20"}`}>
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-600)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sparkFill)" />
        <path
          d={path}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="1.8"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={compact ? 0.6 : 0.8} fill="var(--brand-700)" />
        ))}
        {/* min marker */}
        <circle
          cx={(lowIdx / 6) * 100}
          cy={points[lowIdx].y}
          r={compact ? 1.2 : 1.6}
          fill="#eab308"
        />
      </svg>
    </div>
  );
}

function MiniCalendar({
  baseDate,
  onSelect,
  getPrice,
  onPrevMonth,
  onNextMonth,
  onSetMonth,
}: {
  baseDate: Date;
  onSelect: (d: Date) => void;
  getPrice: (d: Date) => number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSetMonth: (d: Date) => void;
}) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const startDay = start.getDay(); // 0 Sun .. 6 Sat
  const days: Array<Date | null> = [];
  // pad from Sunday
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= end.getDate(); d++)
    days.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="px-2 py-1 rounded-lg border-2 border-gray-200 hover:border-brand-400"
          >
            ‹
          </button>
          <button
            onClick={() => onSetMonth(new Date())}
            className="px-2 py-1 rounded-lg border-2 border-gray-200 hover:border-brand-400"
          >
            Today
          </button>
        </div>
        <div className="font-semibold">
          {baseDate.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // find cheapest in this month
              const daysInMonth = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth() + 1,
                0
              ).getDate();
              let bestDay = 1;
              let bestPrice = Number.POSITIVE_INFINITY;
              for (let d = 1; d <= daysInMonth; d++) {
                const dt = new Date(
                  baseDate.getFullYear(),
                  baseDate.getMonth(),
                  d
                );
                const p = getPrice(dt);
                if (p > 0 && p < bestPrice) {
                  bestPrice = p;
                  bestDay = d;
                }
              }
              const target = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                bestDay
              );
              onSelect(target);
            }}
            className="px-2 py-1 rounded-lg border-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:border-emerald-400"
          >
            Cheapest
          </button>
          <button
            onClick={onNextMonth}
            className="px-2 py-1 rounded-lg border-2 border-gray-200 hover:border-brand-400"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-gray-500">
            {d}
          </div>
        ))}
        {days.map((d, idx) => {
          if (!d) return <div key={`e-${idx}`} />;
          const past = d < today;
          const price = getPrice(d);
          return (
            <button
              key={fmt(d)}
              disabled={past}
              onClick={() => onSelect(d)}
              className={`h-16 rounded-xl border-2 p-1 flex flex-col items-center justify-center ${
                past
                  ? "opacity-40 cursor-not-allowed border-gray-100"
                  : "hover:border-brand-400 border-gray-200"
              }`}
            >
              <div className="text-[11px] text-gray-600">{d.getDate()}</div>
              <div className="text-[10px] text-brand-700 font-semibold">
                ₹{price.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
