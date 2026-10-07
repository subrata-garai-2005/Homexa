import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiHome, FiMap, FiHeart, FiUser } from 'react-icons/fi';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector(s => s.auth);

  // Hide bottom nav on specific fullscreen pages if needed
  const isPropertyDetails = location.pathname.startsWith('/properties/') && location.pathname !== '/properties';
  if (isPropertyDetails) return null; // Let the sticky booking bar take bottom priority on property details!

  const navItems = [
    { to: '/', label: 'Explore', icon: FiSearch },
    { to: '/properties', label: 'Stays', icon: FiHome },
    { to: '/map', label: 'Map', icon: FiMap },
    { to: isAuthenticated ? '/wishlist' : '/login', label: 'Wishlist', icon: FiHeart },
    { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Profile' : 'Log in', icon: FiUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.highlight && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
