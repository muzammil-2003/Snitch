import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { setUser } from '../features/auth/state/auth.slice'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)

  const handleLogout = () => {
    dispatch(setUser(null))
    navigate("/login")
  }

  const handleNavClick = (sectionId) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(sectionId)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${sectionId}`)
    }
  }

  return (
    <>
      {/* Editorial Top Announcement */}
      <div className="w-full bg-primary-container text-on-primary py-2 px-4 text-center text-xs font-label-sm uppercase tracking-widest">
        Free shipping on all domestic orders above PKR 3,000 &bull; Easy 7-day exchanges
      </div>

      {/* Elegant Header */}
      <header className="w-full sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-surface-container-highest/40">
        <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="font-display text-2xl font-black tracking-[0.2em] bg-linear-to-r from-primary to-primary-container bg-clip-text text-transparent">
              SNITCH
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase text-on-surface-variant">
            <button onClick={() => navigate("/")} className="hover:text-primary-container transition-colors cursor-pointer">Shop</button>
            <button onClick={() => handleNavClick("catalog-section")} className="hover:text-primary-container transition-colors cursor-pointer">Collections</button>
            <button onClick={() => handleNavClick("values-section")} className="hover:text-primary-container transition-colors cursor-pointer">Our Values</button>
          </nav>

          {/* User Profile & Cart Mock */}
          <div className="flex items-center gap-6">
            {user && user.role === "seller" && (
              <button 
                onClick={() => navigate("/seller/dashboard")} 
                className="text-xs font-bold uppercase tracking-wider text-primary-container hover:underline cursor-pointer"
              >
                Seller Panel
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-on-surface/85">
                  Hi, {user.fullName?.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 rounded-full hover:bg-surface-container-high hover:text-error transition-colors active:scale-95 duration-150 text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined block text-xl">logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs font-bold uppercase tracking-wider text-on-surface hover:text-primary-container transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary transition-all duration-200 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-md cursor-pointer"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
