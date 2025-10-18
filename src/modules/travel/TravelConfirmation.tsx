import { useEffect, useState } from "react";
import {
  CheckCircle,
  Download,
  Share2,
  Plane,
  Gift,
  Bus,
  Train,
  Ticket,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function TravelConfirmation() {
  const [bookingRef, setBookingRef] = useState("");
  type FlightItem = {
    airline?: string;
    flightNumber?: string;
    departure?: string;
    arrival?: string;
    duration?: string;
    price?: number;
  };
  type BusItem = {
    operator?: string;
    busType?: string;
    departure?: string;
    arrival?: string;
    duration?: string;
    price?: number;
  };
  type TrainItem = {
    operator?: string;
    trainNo?: string;
    class?: string;
    departure?: string;
    arrival?: string;
    duration?: string;
    price?: number;
  };
  type MetroItem = {
    line?: string;
    departure?: string;
    arrival?: string;
    duration?: string;
    price?: number;
  };
  type Item = FlightItem | BusItem | TrainItem | MetroItem;
  const [order, setOrder] = useState<{
    id: string;
    type: "flight" | "bus" | "train" | "metro";
    item: Item;
    total: number;
  } | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const [berths, setBerths] = useState<string[] | null>(null);
  const { setCurrentModule, setCurrentPage } = useApp();

  useEffect(() => {
    setBookingRef(
      "GOZY" + Math.random().toString(36).substr(2, 9).toUpperCase()
    );
    const last = localStorage.getItem("lastTravelOrder");
    if (last) setOrder(JSON.parse(last));
    try {
      const sel = JSON.parse(
        localStorage.getItem("selectedTravelSeats") || "null"
      ) as { mode?: string; seats?: { label?: string }[] } | null;
      if (sel && sel.mode === "train" && Array.isArray(sel.seats)) {
        const labels = sel.seats
          .map((s) => s.label)
          .filter(Boolean) as string[];
        setBerths(labels.length ? labels : null);
        // Generate an IRCTC-like PNR: 10 digits split 3-7
        const p = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(
          1000000 + Math.random() * 9000000
        )}`;
        setPnr(p);
      }
    } catch {
      /* ignore */
    }
    // Celebrate after a tiny delay for smoother mount
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("confetti", { detail: { mode: "shoutout" } })
        ),
      150
    );
  }, []);

  // Rewards are awarded during payment success; avoid awarding again here to prevent flicker/double-count

  const handleBackHome = () => {
    setCurrentModule(null);
    setCurrentPage("home");
  };

  // Basic helpers
  const icon =
    order?.type === "bus" ? (
      <Bus className="w-8 h-8 text-white" />
    ) : order?.type === "train" ? (
      <Train className="w-8 h-8 text-white" />
    ) : (
      <Plane className="w-8 h-8 text-white" />
    );
  let title = "";
  let sub = "";
  let dep: string | undefined;
  let arr: string | undefined;
  let dur: string | undefined;
  if (order?.type === "bus") {
    const it = order.item as BusItem;
    title = it.operator || "Bus";
    sub = it.busType || "";
    dep = it.departure;
    arr = it.arrival;
    dur = it.duration;
  } else if (order?.type === "train") {
    const it = order.item as TrainItem;
    title = it.operator || "Train";
    sub = `Train ${it.trainNo || ""}${it.class ? ` • Class ${it.class}` : ""}`;
    dep = it.departure;
    arr = it.arrival;
    dur = it.duration;
  } else if (order?.type === "metro") {
    const it = order.item as MetroItem;
    title = it.line || "Metro";
    sub = "Metro Service";
    dep = it.departure;
    arr = it.arrival;
    dur = it.duration;
  } else {
    const it = order?.item as FlightItem | undefined;
    title = it?.airline || "Flight";
    sub = it?.flightNumber || "";
    dep = it?.departure;
    arr = it?.arrival;
    dur = it?.duration;
  }
  const amount = order?.total || 0;
  const qrSrc = bookingRef
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        bookingRef
      )}`
    : "";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your {order?.type} has been successfully booked
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8 text-white">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2">
                Booking Reference
              </div>
              <div className="text-4xl font-bold tracking-wider">
                {bookingRef}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                  {icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900">
                    {title}
                  </div>
                  <div className="text-gray-600">{sub}</div>
                </div>
              </div>
            </div>

            {/* Magic QR for contactless entry/validation */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-8 text-center">
              <div className="text-sm text-gray-600 font-semibold mb-2">
                Magic QR
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Scan at gate/check-in
              </div>
              {qrSrc && (
                <div className="p-3 bg-white rounded-xl border-2 border-gray-200 inline-block">
                  <img
                    src={qrSrc}
                    alt={`QR for ${bookingRef}`}
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Departure</div>
                <div className="text-3xl font-bold text-gray-900">{dep}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Arrival</div>
                <div className="text-3xl font-bold text-gray-900">{arr}</div>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="flex items-center justify-between text-gray-700 mb-3">
                <span>Duration</span>
                <span className="font-semibold">{dur}</span>
              </div>
              {order?.type === "train" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Ticket className="w-4 h-4" />
                    <span className="font-semibold">PNR:</span>
                    <span>{pnr || "Allotted at charting"}</span>
                  </div>
                  <div className="md:col-span-2 flex items-center space-x-2 text-gray-700">
                    <span className="font-semibold">Berths:</span>
                    <span>{berths?.join(", ") || "To be allotted"}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-700 mb-3">
                <span>Status</span>
                <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Total Paid</span>
                <span className="text-2xl font-bold text-teal-600">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Rewards Earned!
                </h3>
              </div>
              <p className="text-gray-700">
                Congratulations! You've earned{" "}
                <span className="font-bold text-orange-600">
                  {Math.floor((amount || 0) * 0.1)} points
                </span>{" "}
                with this booking.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-white text-teal-600 border-2 border-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg">
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-white text-teal-600 border-2 border-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={handleBackHome}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xl font-bold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
        >
          Back to Home
        </button>
        <div className="mt-6 rounded-2xl overflow-hidden border">
          <iframe
            title="flight-map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.90%2C77.65%2C13.00&layer=mapnik"
            style={{ width: "100%", height: 280, border: 0 }}
          />
          <div className="text-xs text-gray-500 p-2">
            Route / airport map (mocked)
          </div>
        </div>
      </div>
    </div>
  );
}
