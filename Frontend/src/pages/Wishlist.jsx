import { useEffect, useState } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/property/PropertyCard';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/auth/wishlist');
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = (propertyId) => {
    setWishlist(prev => prev.filter(p => p._id !== propertyId));
  };

  if (loading) {
    return <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">Loading wishlist...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white"><FiHeart className="text-primary-500 fill-primary-500" /> Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{wishlist.length} saved stays</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><FiHeart className="w-8 h-8 text-gray-400" /></div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">No saved stays yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Tap the heart icon on any property to save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(property => (
              <PropertyCard key={property._id} property={property} onWishlistToggle={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
