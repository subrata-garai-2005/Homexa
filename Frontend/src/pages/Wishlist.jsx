import { useEffect, useState } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/property/PropertyCard';
import { FiHeart } from 'react-icons/fi';
import SEO from '../components/common/SEO';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/auth/wishlist');
        // BUG FIX: Filter out null/deleted properties to prevent crashes
        const validItems = (res.data.wishlist || []).filter(item => item && item._id);
        setWishlist(validItems);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = (propertyId) => {
    setWishlist(prev => prev.filter(p => p && p._id !== propertyId));
  };

  const validWishlist = wishlist.filter(p => p && p._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your saved stays...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      <SEO
        title="Saved Wishlist - Homexa Stays"
        description="View and manage your favorite vacation homes, beach villas, and holiday stays saved on Homexa."
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <FiHeart className="text-primary-500 fill-primary-500" /> Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{validWishlist.length} saved stays</p>
        </div>

        {validWishlist.length === 0 ? (
          <div className="card p-12 text-center bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">No saved stays yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Tap the heart icon on any property to save it here for later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {validWishlist.map(property => (
              <PropertyCard key={property._id} property={property} onWishlistToggle={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
