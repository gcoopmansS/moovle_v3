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

// Add custom animation styles
const styles = `
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

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
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="absolute top-0 w-full z-10 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">oovle</span>
              <span className="px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-full ml-2">
                Private Beta
              </span>
            </div>
          </div>
        </header>

        <div className="pt-12 pb-12 px-4 min-h-[calc(100vh-80px)] flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - Hero content */}
              <div className="space-y-8 order-2 lg:order-1">
                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight max-w-lg">
                    Join real activities
                    <span className="text-coral-500 block">near you today</span>
                  </h1>
                  <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                    Connect with locals through sports you love. Real people,
                    real activities, happening right around you.
                  </p>
                  <p className="text-sm text-slate-400 font-medium">
                    Private beta — built with real athletes in mind
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="text-coral-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Create Activities
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Host tennis matches, group runs, bike rides at your
                        favorite spots
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="text-blue-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Connect with Mates
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Find workout partners, join pickup games, never train
                        alone again
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="text-green-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Real Locations
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Meet at parks, gyms, courts, and trails in your
                        neighborhood
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="text-purple-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Stay Updated
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Know when friends schedule games or need one more player
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Auth form */}
              <div className="w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-xl p-10">
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
                      className="w-full bg-coral-500 text-white py-4 rounded-xl font-semibold hover:bg-coral-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg cursor-pointer"
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

                    {/* Trust hint */}
                    <p className="text-xs text-slate-500 text-center mt-4">
                      {isSignUp
                        ? "Free to join • No spam • Takes 30 seconds"
                        : "Welcome back to your sports community"}
                    </p>
                  </form>

                  {/* Toggle between Sign Up / Sign In */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                        setFullName("");
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-slate-500 hover:text-coral-500 transition-colors font-medium text-sm cursor-pointer"
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
    </>
  );
}
