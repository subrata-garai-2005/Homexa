import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiMapPin, FiChevronLeft, FiChevronRight, FiAward } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../store/slices/authSlice';
import { toast } from '../../utils/toast';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800';
const MAX_SLIDES = 5;

const PropertyCard = ({ property, onWishlistToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(s => s.auth);

  const images = (property.images?.length ? property.images : [{ url: FALLBACK }])
    .slice(0, MAX_SLIDES)
    .map(img => img?.url || img);

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState({});
  const [popKey, setPopKey] = useState(0);
  const touchX = useRef(null);

  const isWishlisted = Boolean(
    user?.wishlist?.some(item => (item?._id || item)?.toString() === property._id?.toString())
  );

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const go = (e, dir) => {
    stop(e);
    setIndex(i => (i + dir + images.length) % images.length);
  };

  const handleWishlist = async (e) => {
    stop(e);
    if (!isAuthenticated) {
      toast.info('Log in to save stays to your wishlist');
      navigate('/login');
      return;
    }
    setPopKey(k => k + 1);
    const result = await dispatch(toggleWishlist(property._id));
    if (toggleWishlist.fulfilled.match(result)) {
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist', { duration: 2200 });
    } else if (toggleWishlist.rejected.match(result)) {
      toast.error(result.payload || 'Could not update wishlist');
    }
    onWishlistToggle?.(property._id);
  };

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) setIndex(i => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
    touchX.current = null;
  };

  const rating = Number(property.rating?.average) || 4.8;
  const reviewCount = property.rating?.count || 0;
  const isGuestFavourite = rating >= 4.8;
  const city = property.location?.city || 'Unknown';

  return (
    <Link to={`/properties/${property._id}`} className="group block" id={`property-card-${property._id}`}>
      <div
        className="relative aspect-[20/19] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-large transition-shadow duration-300"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(.21,1.02,.73,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative w-full h-full shrink-0">
              {!loaded[i] && <div className="absolute inset-0 shimmer" />}
              <img
                src={src}
                alt={`${property.title} photo ${i + 1}`}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${loaded[i] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(l => ({ ...l, [i]: true }))}
                onError={(e) => { e.currentTarget.src = FALLBACK; }}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-12">
          {isGuestFavourite ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur text-[11px] font-semibold text-gray-900 dark:text-gray-100 shadow-sm border border-black/5 dark:border-white/10">
              <FiAward className="w-3 h-3 text-amber-500" /> Guest favourite
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur text-[11px] font-semibold text-gray-900 dark:text-gray-100 shadow-sm capitalize border border-black/5 dark:border-white/10">
              {property.propertyType || 'Stay'}
            </span>
          )}
          {property.instantBook && (
            <span className="px-2.5 py-1 rounded-full bg-gray-900/90 text-white text-[11px] font-medium shadow-sm backdrop-blur">⚡ Instant</span>
          )}
        </div>

        {/* Wishlist with pop + burst */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
        >
          {popKey > 0 && isWishlisted && (
            <span key={`b-${popKey}`} className="absolute inset-0 rounded-full border-2 border-primary-500 animate-burst pointer-events-none" />
          )}
          <FiHeart
            key={`h-${popKey}`}
            className={`w-4 h-4 ${popKey > 0 ? 'animate-heart-pop' : ''} ${isWishlisted ? 'fill-primary-500 text-primary-500' : 'text-gray-700 dark:text-gray-200'}`}
          />
        </button>

        {/* Carousel arrows (desktop hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => go(e, -1)}
              aria-label="Previous photo"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-800 dark:text-gray-100" />
            </button>
            <button
              onClick={(e) => go(e, 1)}
              aria-label="Next photo"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
            >
              <FiChevronRight className="w-4 h-4 text-gray-800 dark:text-gray-100" />
            </button>
          </>
        )}

        {/* Bottom: price + dots */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur text-xs font-bold text-gray-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10">
            ₹{property.price?.toLocaleString('en-IN')} <span className="font-normal text-gray-600 dark:text-gray-400">/{property.priceUnit || 'night'}</span>
          </span>
          {images.length > 1 && (
            <div className="flex items-center gap-1 mb-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full bg-white transition-all duration-300 ${i === index ? 'w-4 opacity-100' : 'w-1.5 opacity-60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] leading-tight line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">
            {property.title}
          </h3>
          <span className="flex items-center gap-1 text-[13px] font-medium shrink-0 text-gray-900 dark:text-gray-200">
            <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating.toFixed(1)}
            {reviewCount > 0 && <span className="text-gray-500 dark:text-gray-400 font-normal">({reviewCount})</span>}
          </span>
        </div>
        <p className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400 line-clamp-1">
          <FiMapPin className="w-3.5 h-3.5 shrink-0" /> {city}{property.location?.state ? `, ${property.location.state}` : ''}
        </p>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          {property.bedrooms} bed • {property.bathrooms} bath • {property.maxGuests} guests
        </p>
      </div>
    </Link>
  );
};

export default PropertyCard;
