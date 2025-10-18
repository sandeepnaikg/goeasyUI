import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Download,
  Share2,
  MapPin,
  Clock,
  Calendar,
  Gift,
  Ticket,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

type Seat = { id: string; price?: number };
type ShowData = {
  movie?: { title?: string };
  theater?: { name?: string };
  show?: { time?: string; type?: string };
};
type BookingData = { showData?: ShowData; seats?: Seat[]; total?: number };

export default function TicketsConfirmation() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookingId, setBookingId] = useState("");
  const { setCurrentModule, setCurrentPage } = useApp();

  useEffect(() => {
    const seatsData = JSON.parse(localStorage.getItem("selectedSeats") || "{}");
    // Prefer enriched lastTicketOrder if present (contains addons and final total)
    const lastOrder = JSON.parse(
      localStorage.getItem("lastTicketOrder") || "null"
    );
    if (lastOrder) {
      setBookingData({
        showData: lastOrder.show,
        seats: lastOrder.seats,
        total: lastOrder.total,
        addons: lastOrder.addons,
      } as unknown as BookingData);
    } else {
      setBookingData(seatsData);
    }
    setBookingId(
      "TKT" + Math.random().toString(36).substr(2, 10).toUpperCase()
    );
    // Celebrate after a tiny delay for smoother mount
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("confetti", { detail: { mode: "shoutout" } })
        ),
      150
    );
  }, []);

  // Generate a simple square QR for the booking id
  const qrSrc = useMemo(() => {
    if (!bookingId) return "";
    // Using a lightweight public QR service to avoid adding dependencies
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      bookingId
    )}`;
  }, [bookingId]);

  const handleBackHome = () => {
    setCurrentModule(null);
    setCurrentPage("home");
  };

  if (!bookingData) return null;

  const { showData, seats, total, addons } = bookingData as BookingData & {
    addons?: Array<{ id: string; name: string; qty: number; price: number }>;
  };
  const seatNumbers = (seats || []).map((s: Seat) => s.id).join(", ");
  const hasFreeCoke = (seats || []).length >= 2;
  const baseTicketsSum = (seats || []).reduce(
    (s: number, seat: Seat) => s + (seat.price || 0),
    0
  );
  const fees = Math.round(baseTicketsSum * 0.05); // mock 5% convenience fee for illustration

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0A1D5E] to-[#182B8F] pb-24">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-blue-200">Your movie tickets are ready</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white text-center">
            <div className="mb-6">
              <div className="text-sm font-semibold mb-2">Booking ID</div>
              <div className="text-3xl font-bold tracking-wider">
                {bookingId}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 inline-block">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-600 font-semibold">
                  Magic QR
                </div>
                <div className="text-xs text-gray-500">Scan at cinema</div>
              </div>
              {qrSrc && (
                <div className="p-3 bg-white rounded-xl border-2 border-gray-200 inline-block">
                  <img
                    src={qrSrc}
                    alt={`QR for ${bookingId}`}
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {showData?.movie?.title}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {showData?.theater?.name}
                  </div>
                  <div className="text-sm text-gray-600">Cinema Hall 3</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">
                    Monday, October 7, 2025
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">
                    {showData?.show?.time}
                  </span>
                  <span className="text-gray-600 ml-2">
                    ({showData?.show?.type})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Ticket className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">
                    Seats: {seatNumbers}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="mb-2">
                <div className="text-sm font-semibold text-gray-800">
                  Tickets ({seats?.length}x)
                </div>
                <div className="mt-1 space-y-1 text-sm text-gray-700">
                  {(seats || []).map((s: Seat) => (
                    <div key={s.id} className="flex justify-between">
                      <span>Seat {s.id}</span>
                      <span>₹{(s.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-700 mb-2">
                <span>Convenience Fee</span>
                <span className="font-semibold">₹{fees.toLocaleString()}</span>
              </div>
              {Array.isArray(addons) && addons.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-gray-800">
                    Add-ons
                  </div>
                  <div className="mt-1 space-y-1 text-sm text-gray-700">
                    {addons.map((a) => (
                      <div key={a.id} className="flex justify-between">
                        <span>
                          {a.name} × {a.qty}
                        </span>
                        <span>₹{(a.price * a.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-purple-600">
                  ₹{total?.toLocaleString()}
                </span>
              </div>
            </div>

            {hasFreeCoke && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Gift className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Free Coke Included! 🥤
                  </h3>
                </div>
                <p className="text-gray-700">
                  Show this confirmation at the concession stand to claim your
                  complimentary Coca-Cola
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Rewards Earned!
                </h3>
              </div>
              <p className="text-gray-700">
                You've earned{" "}
                <span className="font-bold text-orange-600">
                  {Math.floor((total || 0) * 0.1)} points
                </span>{" "}
                with this booking.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              // download text ticket fallback
              const txt = `Booking: ${bookingId}\nMovie: ${showData?.movie?.title}\nTheater: ${showData?.theater?.name}\nSeats: ${seatNumbers}\nTotal: ₹${total}`;
              const blob = new Blob([txt], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${bookingId}.txt`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </button>
          <button
            onClick={async () => {
              const txt = `Booking: ${bookingId}\nMovie: ${showData?.movie?.title}\nTheater: ${showData?.theater?.name}\nSeats: ${seatNumbers}\nTotal: ₹${total}`;
              try {
                const nav = navigator as unknown as {
                  share?: (data: {
                    title?: string;
                    text?: string;
                    url?: string;
                  }) => Promise<void>;
                };
                if (typeof nav.share === "function") {
                  await nav.share({ title: `Ticket ${bookingId}`, text: txt });
                } else {
                  const blob = new Blob([txt], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${bookingId}-share.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }
              } catch (e) {
                console.error("share failed", e);
              }
            }}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={handleBackHome}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xl font-bold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          Back to Home
        </button>

        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-bold mb-3">Important Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>• Please arrive 15 minutes before show time</li>
            <li>• Carry a valid ID proof for verification</li>
            <li>• Outside food and beverages are not allowed</li>
            <li>• Show QR code at entry for contactless check-in</li>
          </ul>
        </div>
        <div className="mt-6 rounded-2xl overflow-hidden border">
          <iframe
            title="venue-map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.90%2C77.65%2C13.00&layer=mapnik"
            style={{ width: "100%", height: 280, border: 0 }}
          />
          <div className="text-xs text-gray-300 p-2">Venue map (mocked)</div>
        </div>
      </div>
    </div>
  );
}
