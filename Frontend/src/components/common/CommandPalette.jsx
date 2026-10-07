import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSearch,
  FiHome,
  FiCompass,
  FiHeart,
  FiCalendar,
  FiUser,
  FiPlusCircle,
  FiMoon,
  FiSun,
  FiZap,
  FiMapPin,
  FiArrowRight,
  FiX
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { fetchProperties } from '../../store/slices/propertySlice';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'Goa', subtitle: '120+ beach villas & stays' },
  { name: 'Jaipur', state: 'Rajasthan', subtitle: '85+ royal heritage havelis' },
  { name: 'Manali', state: 'Himachal Pradesh', subtitle: '64+ mountain chalets' },
  { name: 'Kerala', state: 'Kerala', subtitle: '92+ backwater houseboats & cottages' },
  { name: 'Mumbai', state: 'Maharashtra', subtitle: 'Urban sea-facing apartments' },
  { name: 'Bangalore', state: 'Karnataka', subtitle: 'Silicon Valley modern penthouses' },
];

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector(s => s.auth);

  // Global keydown: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Listen to custom open event (e.g. from navbar search button)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 30);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Base navigation actions
  const actions = useMemo(() => [
    {
      id: 'explore',
      title: 'Explore all stays',
      subtitle: 'Browse all available properties and homes',
      icon: FiCompass,
      category: 'Explore',
      action: () => {
        dispatch(fetchProperties({ limit: 12 }));
        navigate('/properties');
      }
    },
    {
      id: 'homexa',
      title: 'Ask Homexa AI Concierge',
      subtitle: 'Plan your trip itinerary with AI',
      icon: FiZap,
      category: 'AI Assistant',
      action: () => {
        window.dispatchEvent(new CustomEvent('open-homexa', { detail: { tab: 'planner' } }));
      }
    },
    {
      id: 'trips',
      title: 'My Bookings & Trips',
      subtitle: 'View your upcoming and completed reservations',
      icon: FiCalendar,
      category: 'Account',
      action: () => navigate('/bookings')
    },
    {
      id: 'wishlist',
      title: 'Saved Wishlist',
      subtitle: 'View your saved favorite stays',
      icon: FiHeart,
      category: 'Account',
      action: () => navigate('/wishlist')
    },
    {
      id: 'profile',
      title: 'User Profile',
      subtitle: user ? `Logged in as ${user.name}` : 'View and edit account settings',
      icon: FiUser,
      category: 'Account',
      action: () => navigate('/profile')
    },
    {
      id: 'host',
      title: 'Host Dashboard',
      subtitle: 'Manage your listings and reservations',
      icon: FiHome,
      category: 'Hosting',
      action: () => navigate('/host')
    },
    {
      id: 'new-listing',
      title: 'List a new property',
      subtitle: 'Become a host and start earning with Homexa',
      icon: FiPlusCircle,
      category: 'Hosting',
      action: () => navigate('/host/new')
    },
    {
      id: 'theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`,
      subtitle: `Currently using ${theme} theme`,
      icon: theme === 'dark' ? FiSun : FiMoon,
      category: 'Preferences',
      action: () => toggleTheme()
    }
  ], [dispatch, navigate, theme, toggleTheme, user]);

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    if (!query.trim()) return POPULAR_DESTINATIONS;
    const q = query.toLowerCase();
    return POPULAR_DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
  }, [query]);

  // Filtered actions
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [query, actions]);

  // Combine items for keyboard index selection
  const allItems = useMemo(() => {
    const list = [];
    filteredDestinations.forEach(d => {
      list.push({
        id: `dest-${d.name}`,
        title: d.name,
        subtitle: `${d.state} • ${d.subtitle}`,
        icon: FiMapPin,
        category: 'Destinations',
        action: () => navigate(`/properties?city=${encodeURIComponent(d.name)}`)
      });
    });
    filteredActions.forEach(a => list.push(a));
    return list;
  }, [filteredDestinations, filteredActions, navigate]);

  // Keyboard navigation inside list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        executeItem(allItems[selectedIndex]);
      }
    }
  };

  const executeItem = (item) => {
    setIsOpen(false);
    item.action();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-[12vh] sm:pt-[15vh] animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <FiSearch className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search stays, cities, destinations, actions... (Esc to exit)"
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto no-scrollbar p-2 sm:p-3 divide-y divide-gray-50 dark:divide-gray-850">
          {allItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a destination like "Goa", "Jaipur", or an action like "Host"</p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hidden sm:inline-block">
                      {item.category}
                    </span>
                    <FiArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-primary-500 translate-x-1' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">↵</kbd> to select</span>
          </div>
          <span className="hidden sm:inline">Homexa Quick Search</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
