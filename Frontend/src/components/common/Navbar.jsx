import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiSearch, 
  FiHeart, 
  FiUser, 
  FiLogOut, 
  FiHome, 
  FiPlusCircle, 
  FiCalendar, 
  FiMap, 
  FiMenu, 
  FiX,
  FiSun,
  FiMoon
} from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/properties', label: 'Stays', icon: FiHome },
    { to: '/map', label: 'Map', icon: FiMap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-xl group-hover:scale-105 transition-transform shadow-sm">
              H
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-[23px] tracking-tight text-gray-900 dark:text-white transition-colors">
                Home<span className="text-primary-500">xa</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50 dark:bg-gray-800/80 rounded-full p-1 border border-gray-200 dark:border-gray-700 transition-colors">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === link.to 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                } ${link.highlight ? 'bg-gradient-to-r from-violet-500 to-primary-500 text-white hover:text-white shadow-sm' : ''}`}
              >
                {link.label}
                {link.highlight && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">AI</span>}
              </Link>
            ))}
          </div>

          {/* Right Action Icons & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              title="Quick Search (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200/80 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
            >
              <FiSearch className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span>Search stays...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-900 text-[10px] font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                ⌘K
              </kbd>
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark Mode"
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all cursor-pointer relative"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-amber-400 rotate-0 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/host" 
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <FiPlusCircle /> Host
                </Link>
                <Link 
                  to="/wishlist" 
                  className="p-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                  title="Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                </Link>
                <Link 
                  to="/bookings" 
                  className="hidden sm:flex p-2.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                  title="My Trips"
                >
                  <FiCalendar className="w-5 h-5" />
                </Link>

                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)} 
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-soft transition-all bg-white dark:bg-gray-800 cursor-pointer"
                  >
                    <FiMenu className="w-4 h-4 text-gray-600 dark:text-gray-300 ml-1" />
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FF385C&color=fff`} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-large border border-gray-100 dark:border-gray-800 py-2 z-50 animate-slide-up text-gray-900 dark:text-gray-100">
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-flex mt-2 text-[11px] px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 font-medium">
                          {user?.isHost ? 'Host' : 'Guest'} • {user?.role}
                        </span>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          <FiUser /> Profile
                        </Link>
                        <Link to="/bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          <FiCalendar /> My Trips
                        </Link>
                        <Link to="/host" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          <FiHome /> Host Dashboard
                        </Link>
                        <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          <FiHeart /> Wishlist
                        </Link>
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-left text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <FiLogOut /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2.5 rounded-full transition-colors"
                >
                  Log in
                </Link>
                <Link to="/register" className="btn-primary rounded-full !py-2.5 !px-6 text-sm">
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer" 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-2xl">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                    location.pathname === link.to 
                      ? 'bg-white dark:bg-gray-700 shadow-xs text-primary-600 dark:text-primary-400 font-semibold' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    {link.label}
                  </span>
                  {link.highlight && <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-bold">AI</span>}
                </Link>
              ))}

              {/* Mobile Theme Switcher Row */}
              <div 
                onClick={toggleTheme}
                className="px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {isDark ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                  <Link to="/bookings" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2.5">
                    <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" /> My Trips
                  </Link>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2.5">
                    <FiHeart className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Wishlist
                  </Link>
                  <Link to="/host" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2.5">
                    <FiHome className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Host Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2.5">
                    <FiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Profile Settings
                  </Link>
                  <button 
                    onClick={() => { setMobileOpen(false); handleLogout(); }} 
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              ) : (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2 mt-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-center bg-primary-500 text-white hover:bg-primary-600 shadow-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
