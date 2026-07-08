import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth";
import ContinueWithGoogle from '../components/ContinueWithGoogle'

function Register() {
  const { handleRegister } = useAuth()
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    isSeller: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleRegister({
      email: formData.email,
      contact: formData.contactNumber,
      password: formData.password,
      fullName: formData.fullName,
      isSeller: formData.isSeller
    });
    if (result?.success) {
      navigate("/", { replace: true });
    }
  };

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
          Create Account
        </h1>
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      {/* Main Content Canvas */}
      <main className="grow flex flex-col items-center justify-start py-6 px-container-padding-mobile">
        <div className="w-full max-w-120 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Branding/Identity Visual */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-high border border-surface-variant mb-2">
              <span
                className="material-symbols-outlined text-primary-container text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person_add
              </span>
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-1">
              Join the Collective
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-xs mx-auto">
              Experience precision and clarity in every interaction.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                  person
                </span>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 bg-surface-container-low border border-surface-variant rounded-lg pl-12 pr-4 text-on-background font-body-md placeholder:text-on-tertiary-container focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                  placeholder="Enter your legal name"
                  type="text"
                />
              </div>
            </div>

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

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">
                Contact Number
              </label>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                  call
                </span>
                <input
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full h-11 bg-surface-container-low border border-surface-variant rounded-lg pl-12 pr-4 text-on-background font-body-md placeholder:text-on-tertiary-container focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                  placeholder="03001234567"
                  type="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">
                Password
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

            {/* Register as Seller */}
            <div className="pt-2">
              <label className="flex items-center group cursor-pointer p-3 bg-surface-container-lowest border border-surface-variant rounded-lg hover:border-primary-container/50 transition-colors">
                <div className="relative flex items-center">
                  <input
                    name="isSeller"
                    checked={formData.isSeller}
                    onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-surface-variant rounded bg-transparent checked:bg-primary-container checked:border-primary-container transition-all cursor-pointer"
                    type="checkbox"
                  />
                  <span className="material-symbols-outlined absolute left-0 w-5 h-5 text-on-primary-container text-center text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">
                    check
                  </span>
                </div>
                <div className="ml-3 flex flex-col">
                  <span className="font-body-md text-on-background text-sm">
                    I am a seller
                  </span>
                  <span className="font-label-sm text-on-surface-variant text-[11px]">
                    Access merchant tools and dashboard
                  </span>
                </div>
              </label>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                className="w-full h-11 bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                Sign Up
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>

          <ContinueWithGoogle />

          {/* Bottom Link */}
          <div className="mt-5 text-center pb-10">
            <p className="font-body-md text-on-surface-variant">
              Already have an account?
              <Link
                className="text-primary-container font-semibold hover:underline underline-offset-4 ml-1 transition-all"
                to="/login"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;