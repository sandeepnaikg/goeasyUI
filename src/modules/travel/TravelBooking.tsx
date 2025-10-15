import { useState } from 'react';
import { Phone, Mail, Calendar, Shield, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Traveler {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
}

export default function TravelBooking() {
  const [travelers, setTravelers] = useState<Traveler[]>([
    { firstName: '', lastName: '', age: '', gender: 'male' }
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addInsurance, setAddInsurance] = useState(false);
  const [addMeal, setAddMeal] = useState(false);
  const { setCurrentPage } = useApp();
  const chosenFare = (() => {
    try {
      const f = JSON.parse(localStorage.getItem('selectedFlight') || '{}');
      return f?.chosenFare || 'Value';
    } catch { return 'Value'; }
  })();

  const addTraveler = () => {
    setTravelers([...travelers, { firstName: '', lastName: '', age: '', gender: 'male' }]);
  };

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== index));
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const handleContinue = () => {
    localStorage.setItem('bookingDetails', JSON.stringify({
      travelers,
      contactEmail,
      contactPhone,
      addInsurance,
      addMeal
    }));
    setCurrentPage('travel-payment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Traveler Details</h1>

          {/* Fees preview strip */}
          <div className="mb-6 -mt-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-gray-100 border">Govt. taxes included</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 border">Convenience fee at payment</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 border">Reschedule {chosenFare==='Flex' ? 'Free ≥24h' : '₹500'}</span>
            </div>
          </div>

          <div className="space-y-6">
            {travelers.map((traveler, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Traveler {index + 1}</h3>
                  {travelers.length > 1 && (
                    <button
                      onClick={() => removeTraveler(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={traveler.firstName}
                      onChange={(e) => updateTraveler(index, 'firstName', e.target.value)}
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={traveler.lastName}
                      onChange={(e) => updateTraveler(index, 'lastName', e.target.value)}
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={traveler.age}
                      onChange={(e) => updateTraveler(index, 'age', e.target.value)}
                      placeholder="Enter age"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      value={traveler.gender}
                      onChange={(e) => updateTraveler(index, 'gender', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addTraveler}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-teal-500 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Another Traveler</span>
            </button>
          </div>

          <div className="mt-8 border-t-2 border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add-ons</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <Shield className="w-6 h-6 text-teal-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Travel Insurance</div>
                    <div className="text-sm text-gray-600">Covers cancellation, delays & baggage loss</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-teal-600">₹299</span>
                  <input
                    type="checkbox"
                    checked={addInsurance}
                    onChange={(e) => setAddInsurance(e.target.checked)}
                    className="w-5 h-5 text-teal-600"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-6 h-6 text-teal-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Meal Package</div>
                    <div className="text-sm text-gray-600">Delicious meals during your journey</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-teal-600">₹450</span>
                  <input
                    type="checkbox"
                    checked={addMeal}
                    onChange={(e) => setAddMeal(e.target.checked)}
                    className="w-5 h-5 text-teal-600"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              className="px-12 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xl font-bold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
            >
              Continue to Payment
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
