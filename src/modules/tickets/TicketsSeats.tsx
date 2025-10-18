import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import StepIndicator from "../../components/StepIndicator";

type Seat = {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
  type: "premium" | "regular";
};

const generateSeats = (): Seat[] => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 16;
  const seats: Seat[] = [];

  rows.forEach((row) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const seatNumber = `${row}${i}`;
      const isBooked = Math.random() > 0.7;
      seats.push({
        id: seatNumber,
        row,
        number: i,
        isBooked,
        type: row <= "C" ? "premium" : "regular",
      });
    }
  });

  return seats;
};

type SelectedShow = {
  movie?: { title: string };
  theater?: { name: string };
  show?: { time: string; type: string; price: number };
} | null;

export default function TicketsSeats() {
  const [showData, setShowData] = useState<SelectedShow>(null);
  const [seats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [holdSeconds, setHoldSeconds] = useState<number>(0);
  const { setCurrentPage } = useApp();
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("selectedShow");
    if (data) {
      setShowData(JSON.parse(data));
    }
  }, []);

  const toggleSeat = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      // start/extend hold timer to 8 minutes when first seat is added
      setHoldSeconds((prev) => (prev > 0 ? prev : 8 * 60));
    }
  };

  const selectBestSeats = () => {
    if (!showData || !showData.show) return;
    const preferredType: "premium" | "regular" = "regular"; // simple default; could be based on user selection
    const available = seats.filter(
      (s) => !s.isBooked && s.type === preferredType
    );
    // central seats: prioritize rows near middle and seat numbers near middle
    const rowOrder = ["E", "F", "D", "G", "C", "H", "B", "I", "A", "J"];
    const centerNum = 8;
    const scored = available
      .map((s) => {
        const rowScore = rowOrder.indexOf(s.row);
        const seatScore = Math.abs(s.number - centerNum);
        return { id: s.id, score: rowScore * 10 + seatScore };
      })
      .sort((a, b) => a.score - b.score);
    const pick = scored.slice(0, Math.max(2, Math.min(4, 2))).map((x) => x.id); // pick 2 best by default
    setSelectedSeats(pick);
    setHoldSeconds((prev) => (prev > 0 ? prev : 8 * 60));
    setShowTip(false);
  };

  const getSeatPrice = (type: string) => {
    if (!showData || !showData.show) return 0;
    return type === "premium" ? showData.show.price + 100 : showData.show.price;
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + getSeatPrice(seat?.type || "regular");
    }, 0);
  };

  const handleContinue = () => {
    const selectedSeatDetails = selectedSeats.map((seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return {
        id: seatId,
        type: seat?.type,
        price: getSeatPrice(seat?.type || "regular"),
      };
    });

    localStorage.setItem(
      "selectedSeats",
      JSON.stringify({
        seats: selectedSeatDetails,
        total: getTotalPrice(),
        showData,
      })
    );
    setCurrentPage("tickets-payment");
  };

  // hold timer effect
  useEffect(() => {
    if (holdSeconds <= 0) return;
    const id = setInterval(
      () => setHoldSeconds((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [holdSeconds]);

  const mm = Math.floor(holdSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(holdSeconds % 60)
    .toString()
    .padStart(2, "0");

  if (!showData) return null;

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  return (
    <div className="min-h-screen bg-white pb-32">
  <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900">
        <div className="mb-3">
          <StepIndicator
            steps={["Search", "Details", "Seats", "Payment", "Confirm"]}
            current={2}
          />
        </div>
        {holdSeconds > 0 && (
          <div className="sticky top-16 z-20 mb-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2 flex items-center justify-between">
              <div className="text-sm">Seats held for you</div>
              <div className="font-mono font-bold">
                {mm}:{ss}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {showData.movie?.title}
          </h1>
          <div className="text-gray-600">
            {showData.theater?.name} | {showData.show?.time} |{" "}
            {showData.show?.type}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-6 border border-gray-200 shadow">
          <div className="flex justify-end mb-3">
            <div className="relative">
              <button
                onClick={selectBestSeats}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                className="px-3 py-1.5 text-xs rounded-full border-2 border-emerald-300 text-emerald-700 bg-emerald-50 hover:border-emerald-400"
              >
                Best available seats
              </button>
              {showTip && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow p-2 text-xs text-gray-700">
                  Picks 2 central seats in the best rows of your selected class.
                </div>
              )}
            </div>
          </div>
          <div className="mb-8">
            <div className="bg-gray-200 h-2 rounded-t-3xl mb-2"></div>
            <div className="flex items-center justify-center space-x-2 text-gray-800">
              <Monitor className="w-6 h-6" />
              <span className="font-semibold">SCREEN</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {rows.map((row) => (
              <div
                key={row}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-8 text-gray-800 font-bold text-center">
                  {row}
                </div>
                <div className="flex space-x-2">
                  {seats
                    .filter((seat) => seat.row === row)
                    .map((seat) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      const isPremium = seat.type === "premium";

                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id, seat.isBooked)}
                          disabled={seat.isBooked}
                          className={`w-8 h-8 rounded-t-lg text-xs font-semibold transition-all ${
                            seat.isBooked
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-green-500 text-white scale-110"
                              : isPremium
                              ? "bg-amber-500 hover:bg-amber-400 text-white"
                              : "bg-blue-500 hover:bg-blue-400 text-white"
                          }`}
                        >
                          {seat.isBooked ? (
                            <X className="w-4 h-4 mx-auto" />
                          ) : (
                            ""
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-t-lg"></div>
              <span className="text-gray-700">
                Regular (₹{showData.show?.price})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-amber-500 rounded-t-lg"></div>
              <span className="text-gray-700">
                Premium (₹{(showData?.show?.price ?? 0) + 100})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-t-lg"></div>
              <span className="text-gray-700">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-600 rounded-t-lg"></div>
              <span className="text-gray-700">Booked</span>
            </div>
          </div>
        </div>

        {selectedSeats.length >= 2 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 border border-green-400/30 text-white">
            <p className="font-bold">Free Coke Offer Applied! 🎉</p>
            <p className="text-sm">
              You'll receive complimentary Coca-Cola with your tickets
            </p>
          </div>
        )}

        {selectedSeats.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">
                    {selectedSeats.length} Seat(s) Selected:{" "}
                    {selectedSeats.join(", ")}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{getTotalPrice().toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={handleContinue}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
