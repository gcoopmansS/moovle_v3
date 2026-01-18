import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  Zap,
} from "lucide-react";

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        navigate("/signup-profile");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/app/feed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="absolute top-0 w-full z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">oovle</span>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Find your
                  <span className="text-coral-500 block">sports mates</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Create activities, connect with friends, and never miss out on
                  the sports you love. Moovle makes it easy to stay active with
                  your community.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="text-coral-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Create Activities
                    </h3>
                    <p className="text-sm text-slate-600">
                      Easy activity creation with location & timing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Connect with Mates
                    </h3>
                    <p className="text-sm text-slate-600">
                      Build your sports network and stay connected
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="text-green-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Real Locations
                    </h3>
                    <p className="text-sm text-slate-600">
                      Find activities at actual venues near you
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="text-purple-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Stay Updated
                    </h3>
                    <p className="text-sm text-slate-600">
                      Get notified when friends create or join activities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Auth form */}
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {isSignUp ? "Join Moovle" : "Welcome back"}
                  </h2>
                  <p className="text-slate-600">
                    {isSignUp
                      ? "Create your account and start connecting"
                      : "Sign in to continue your sports journey"}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name (Sign Up only) */}
                  {isSignUp && (
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required={isSignUp}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-coral-500 text-white py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle between Sign Up / Sign In */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                      setFullName("");
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-coral-500 hover:text-coral-600 transition-colors text-sm font-medium"
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "New to Moovle? Create account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
