import { Link } from 'react-router-dom';
import { FiHeart, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-16 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-rose-500 flex items-center justify-center text-white font-bold">H</div>
              <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Home<span className="text-primary-500">xa</span></span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Find your perfect stay anywhere in the world. Curated homes, villas, cabins and unique stays with AI-powered discovery.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><FiTwitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><FiInstagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><FiGithub className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Explore</h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/properties" className="hover:text-gray-900 dark:hover:text-white">All Stays</Link></li>
              <li><Link to="/properties?propertyType=villa" className="hover:text-gray-900 dark:hover:text-white">Villas</Link></li>
              <li><Link to="/properties?propertyType=cabin" className="hover:text-gray-900 dark:hover:text-white">Cabins</Link></li>
              <li><Link to="/map" className="hover:text-gray-900 dark:hover:text-white">Map View</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Hosting</h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/host" className="hover:text-gray-900 dark:hover:text-white">Host Dashboard</Link></li>
              <li><Link to="/host/new" className="hover:text-gray-900 dark:hover:text-white">List Property</Link></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Host Resources</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Safety</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Cancellation</a></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('open-homexa'))} className="hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">Ask Homexa <span className="text-[10px] bg-[#6875f5] text-white px-1.5 py-0.5 rounded-full">AI</span></button></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-1">© 2026 Homexa. Made with <FiHeart className="w-4 h-4 text-primary-500 fill-primary-500" /> for travelers.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
