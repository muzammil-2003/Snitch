import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth";
import ContinueWithGoogle from '../components/ContinueWithGoogle'
import { useSelector } from "react-redux";

function Login() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const redirectUser = (userData) => {
    if (userData?.role === "buyer") {
      navigate("/", { replace: true });
    }
    else if (userData?.role === "seller") {
      navigate("/seller/dashboard", { replace: true });
    }
  };

  useEffect(() => {
    if (user) {
      redirectUser(user);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin({
        email: formData.email,
        password: formData.password
      });

    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col overflow-x-hidden custom-scrollbar">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-background flex items-center justify-between px-container-padding-mobile md:px-container-padding-desktop h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="hover:opacity-80 transition-opacity duration-200 text-primary p-2 -ml-2 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <h1 className="font-headline-md text-headline-md text-primary absolute left-1/2 -translate-x-1/2">
          Log In
        </h1>
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      {/* Main Content Canvas */}
      <main className="grow flex flex-col items-center justify-center py-6 px-container-padding-mobile">
        <div className="w-full max-w-120 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Branding/Identity Visual */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-high border border-surface-variant mb-2">
              <span
                className="material-symbols-outlined text-primary-container text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                login
              </span>
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-1">
              Welcome Back
            </h2>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                  mail
                </span>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 bg-surface-container-low border border-surface-variant rounded-lg pl-12 pr-4 text-on-background font-body-md placeholder:text-on-tertiary-container focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                  placeholder="name@firm.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="flex justify-between font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">
                <span>Password</span>
                <Link to="#" className="text-primary-container hover:underline tracking-normal lowercase text-[12px]">Forgot password?</Link>
              </label>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                  lock
                </span>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-11 bg-surface-container-low border border-surface-variant rounded-lg pl-12 pr-12 text-on-background font-body-md placeholder:text-on-tertiary-container focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                  placeholder="••••••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                className="w-full h-11 bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                Log In
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>

          <ContinueWithGoogle />

          {/* Bottom Link */}
          <div className="mt-5 text-center pb-10">
            <p className="font-body-md text-on-surface-variant">
              Don't have an account?
              <Link
                className="text-primary-container font-semibold hover:underline underline-offset-4 ml-1 transition-all"
                to="/register"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
