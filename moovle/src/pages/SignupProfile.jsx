import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LocationInput from "../components/LocationInput";

const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Running",
  "Cycling",
  "Swimming",
  "Padel",
  "Hiking",
  "Yoga",
  "Fitness",
  "Other",
];

export default function SignupProfile() {
  const { user, updateProfile } = useAuth();
  const [city, setCity] = useState("");
  const [cityCoords, setCityCoords] = useState(null);
  const [country, setCountry] = useState("");
  const [favoriteSports, setFavoriteSports] = useState([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSportToggle = (sport) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleCityChange = (val, coords, countryVal) => {
    setCity(val);
    setCityCoords(coords);
    setCountry(countryVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!city || favoriteSports.length === 0) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      const { error } = await updateProfile({
        city,
        city_lat: cityCoords?.lat || null,
        city_lng: cityCoords?.lng || null,
        country: country || null,
        favorite_sports: favoriteSports,
        bio,
      });
      if (error) throw error;
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-coral-500">M</span>
            <span className="text-slate-800">oovle</span>
          </h1>
          <p className="text-slate-500">Tell us more about you</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-visible">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Complete your profile
          </h2>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City <span className="text-coral-500">*</span>
              </label>
              <LocationInput
                value={city}
                onChange={handleCityChange}
                placeholder="Your city or area"
                type="city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Favorite Sports <span className="text-coral-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((sport) => (
                  <button
                    type="button"
                    key={sport}
                    onClick={() => handleSportToggle(sport)}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
                      favoriteSports.includes(sport)
                        ? "bg-coral-500 text-white border-coral-500"
                        : "bg-white text-slate-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral-500 text-white py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish & Go to App"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
