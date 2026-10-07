import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById } from '../store/slices/propertySlice';
import { toggleWishlist } from '../store/slices/authSlice';
import api from '../api/axios';
import PropertyMap from '../components/map/PropertyMap';
import PhotoLightbox from '../components/property/PhotoLightbox';
import DateRangePicker from '../components/property/DateRangePicker';
import { toast } from '../utils/toast';
import {
  FiHeart, FiShare2, FiStar, FiMapPin, FiHome, FiUsers, FiCalendar, FiCheck,
  FiWifi, FiCoffee, FiWind, FiTv, FiDroplet, FiShield,
  FiCopy, FiX, FiCheckCircle, FiSend, FiLoader, FiMessageSquare, FiGrid, FiAlertCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { format, differenceInDays } from 'date-fns';

const amenityIcons = {
  wifi: FiWifi,
  kitchen: FiCoffee,
  ac: FiWind,
  tv: FiTv,
  pool: FiDroplet,
  parking: FiHome,
  workspace: FiHome,
  default: FiCheck
};

const PropertyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProperty: property, detailLoading } = useSelector(s => s.properties);
  const { isAuthenticated, user } = useSelector(s => s.auth);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availability, setAvailability] = useState(null);

  // Feature: Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Feature: Review & Rating State
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this stay on Homexa: ${property?.title} in ${property?.location?.city}!\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out ${property?.title} in ${property?.location?.city} on Homexa!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const hostId = property?.host?._id ? property.host._id.toString() : property?.host?.toString();
  const currentUserId = user?._id?.toString();
  const isHostOfProperty = Boolean(currentUserId && hostId && currentUserId === hostId);
  const isDev = Boolean(import.meta.env.DEV);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to leave a review');
      navigate('/login');
      return;
    }
    if (isHostOfProperty && !isDev && user?.role !== 'admin') {
      toast.warning('Hosts cannot review their own property');
      return;
    }
    if (!reviewComment.trim()) {
      toast.warning('Please enter your review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(`/properties/${property._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      const successMsg = res.data.message || 'Review submitted successfully!';
      setReviewComment('');
      setReviewMsg(successMsg);
      toast.success(successMsg);
      setTimeout(() => setReviewMsg(''), 5000);
      dispatch(fetchPropertyById(property._id));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      if (err.response?.status === 400 || err.response?.status === 403) {
        toast.warning(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const isSaved = Boolean(user?.wishlist?.some(item => (item?._id || item)?.toString() === property?._id?.toString()));
  const isMockProperty = Boolean(property?._id && (property._id.startsWith('stay-') || property._id.startsWith('mock')));

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save stays to your wishlist');
      navigate('/login');
      return;
    }
    if (property?._id) {
      const result = await dispatch(toggleWishlist(property._id));
      if (toggleWishlist.fulfilled.match(result)) {
        toast.success(isSaved ? 'Removed from wishlist' : 'Saved to wishlist', { duration: 2200 });
      }
    }
  };

  const openLightbox = (idx = 0) => {
    setLightboxIndex(idx);
    setShowLightbox(true);
  };

  useEffect(() => {
    if (id) dispatch(fetchPropertyById(id));
  }, [id, dispatch]);

  // Fetch booked dates for visual calendar blocking
  useEffect(() => {
    if (property?._id && !isMockProperty) {
      api.get(`/bookings/booked-dates/${property._id}`)
        .then(res => setBookedRanges(res.data.ranges || []))
        .catch(() => setBookedRanges([]));
    }
  }, [property?._id, isMockProperty]);

  const pricing = useMemo(() => {
    if (!checkIn || !checkOut || !property) return null;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    if (nights <= 0) return null;
    const subtotal = property.price * nights;
    const cleaningFee = 0;
    const serviceFee = 0;
    const taxes = 0;
    const total = subtotal + cleaningFee + serviceFee + taxes;
    return { nights, subtotal, cleaningFee, serviceFee, taxes, total };
  }, [checkIn, checkOut, property]);

  useEffect(() => {
    let active = true;
    if (checkIn && checkOut && property && pricing) {
      if (!isMockProperty && property._id) {
        api.get(`/bookings/availability?propertyId=${property._id}&checkIn=${checkIn}&checkOut=${checkOut}`)
          .then(res => {
            if (active) setAvailability(res.data);
          })
          .catch(() => {
            if (active) setAvailability(null);
          });
      } else {
        const timer = setTimeout(() => {
          if (active) setAvailability({ success: true, available: true });
        }, 0);
        return () => {
          active = false;
          clearTimeout(timer);
        };
      }
    } else {
      const timer = setTimeout(() => {
        if (active) setAvailability(null);
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
    return () => {
      active = false;
    };
  }, [checkIn, checkOut, property, isMockProperty, pricing]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to reserve this stay');
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.warning('Please select check-in and check-out dates');
      return;
    }
    setBookingLoading(true);
    try {
      const totalGuests = guests.adults + guests.children;
      const res = await api.post('/bookings', {
        propertyId: property._id,
        checkIn,
        checkOut,
        guests,
        totalGuests
      });

      const bookingId = res.data.booking._id;

      // Create Razorpay order with idempotency key
      const idempotencyKey = `idemp_${bookingId}_${Date.now()}`;
      const orderRes = await api.post('/payments/create-order', { bookingId, idempotencyKey });
      
      if (orderRes.data.mocked) {
        // Mock payment success for demo
        await api.post('/payments/verify', {
          razorpay_order_id: orderRes.data.order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          bookingId
        });
        toast.success('Booking confirmed! 🎉');
        navigate(`/bookings/${bookingId}?success=true`);
      } else {
        // Real Razorpay — must manage loading state inside callbacks
        setBookingLoading(false);

        const cancelPendingBooking = async (reason) => {
          try {
            await api.put(`/bookings/${bookingId}/cancel`, { reason });
          } catch (cancelErr) {
            console.warn('Booking release cleanup notice:', cancelErr?.message);
          }
        };

        let paymentSucceeded = false;
        const options = {
          key: orderRes.data.key,
          amount: orderRes.data.order.amount,
          currency: 'INR',
          name: 'Homexa',
          description: `Booking for ${property.title}`,
          order_id: orderRes.data.order.id,
          handler: async function (response) {
            paymentSucceeded = true;
            setBookingLoading(true);
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId
              });
              toast.success('Payment verified! Booking confirmed! 🎉');
              navigate(`/bookings/${bookingId}?success=true`);
            } catch (err) {
              console.error('Payment verification error:', err);
              toast.error('Payment verification failed. Please contact support.');
            } finally {
              setBookingLoading(false);
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#FF385C' },
          modal: {
            ondismiss: async () => {
              if (!paymentSucceeded) {
                await cancelPendingBooking('Payment cancelled by user');
                toast.info('Payment was cancelled. Your booking has been released.');
              }
            }
          }
        };
        const rzp = new window.Razorpay(options);

        // Handle payment failure without immediately nuking booking so user can retry in modal
        rzp.on('payment.failed', (response) => {
          const reason = response.error?.description || response.error?.reason || 'Payment failed';
          toast.warning(`Payment attempt failed: ${reason}. You can try again or choose another payment method.`);
        });

        rzp.open();
        return; // Don't run finally below since loading is managed inside callbacks
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-2 h-[400px]">
            <div className="col-span-3 bg-gray-200 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-1/2 bg-gray-200 rounded-2xl" />
              <div className="h-1/2 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return <div className="text-center py-20">Property not found</div>;
  }

  const images = property.images || [];
  const totalGuests = guests.adults + guests.children;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-xl sm:text-[26px] font-bold leading-tight text-gray-900 dark:text-white">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white"><FiStar className="fill-black dark:fill-amber-400 dark:text-amber-400" /> {property.rating?.average || 4.8} • {property.rating?.count || 0} reviews</span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><FiMapPin className="w-4 h-4" /> {property.location?.city}, {property.location?.state}, {property.location?.country}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-medium transition-all active:scale-95 shadow-xs text-gray-700 dark:text-gray-200"
            >
              <FiShare2 className="text-gray-700 dark:text-gray-300" /> Share
            </button>
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-medium transition-all text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <FiHeart className={isSaved ? "fill-primary-500 text-primary-500" : ""} /> {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Images with Lightbox trigger */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[480px] relative">
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-3 md:row-span-2 relative group cursor-pointer overflow-hidden"
          >
            <img
              src={images[0]?.url || images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200'}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div
            onClick={() => openLightbox(1)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={images[1]?.url || images[0]?.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600'}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
            />
          </div>
          <div
            onClick={() => openLightbox(2)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={images[2]?.url || images[0]?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600'}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
            />
          </div>

          {/* Show all photos button */}
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-medium backdrop-blur border border-black/5 dark:border-white/10 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <FiGrid className="w-4 h-4 text-primary-500" /> Show all {images.length || 1} photos
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mt-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="font-semibold text-[22px] text-gray-900 dark:text-white">Hosted by {property.host?.name || 'Host'}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{property.maxGuests} guests • {property.bedrooms} bedrooms • {property.beds} beds • {property.bathrooms} bathrooms</p>
              </div>
              <img src={property.host?.avatar || `https://ui-avatars.com/api/?name=${property.host?.name || 'Host'}&background=FF385C&color=fff`} alt="host" className="w-14 h-14 rounded-full object-cover" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
              {[
                { icon: FiHome, title: 'Entire home', desc: 'You’ll have the place to yourself' },
                { icon: FiDroplet, title: 'Enhanced clean', desc: 'This host committed to cleaning protocol' },
                { icon: FiMapPin, title: 'Great location', desc: '90% of recent guests gave location 5 stars' }
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <item.icon className="w-6 h-6 mt-1 shrink-0 text-gray-700 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-[15px] text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pb-8 border-b border-gray-200 dark:border-gray-800">
              <p className="text-[16px] leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">{property.description}</p>
            </div>

            <div className="pb-8 border-b border-gray-200">
              <h3 className="font-semibold text-[20px] mb-6">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {(property.amenities || []).map(amenity => {
                  const Icon = amenityIcons[amenity] || amenityIcons.default;
                  return (
                    <div key={amenity} className="flex items-center gap-4 text-[15px]">
                      <Icon className="w-5 h-5" /> <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pb-8 border-b border-gray-200">
              <h3 className="font-semibold text-[20px] mb-4">Where you’ll be</h3>
              <p className="text-gray-600 mb-4">{property.location?.address}, {property.location?.city}, {property.location?.state}</p>
              <PropertyMap properties={[property]} height="400px" zoom={13} center={[property.location?.coordinates?.lat || 20.59, property.location?.coordinates?.lng || 78.96]} />
            </div>

            {/* Feature 1: Real Reviews & Star Rating System */}
            <div className="pb-8 border-b border-gray-200" id="reviews-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-[22px] font-bold">
                  <FiStar className="fill-amber-400 text-amber-400 w-6 h-6" />
                  <span>{property.rating?.average || 5.0}</span>
                </div>
                <span className="text-gray-400 text-xl">•</span>
                <span className="text-lg font-semibold text-gray-700">
                  {property.reviews?.length || property.rating?.count || 0} reviews
                </span>
              </div>

              {/* Review Submission Form */}
              <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiMessageSquare className="text-primary-500" /> Share your experience
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Have you stayed here? Help future travelers with your honest rating and feedback.
                </p>

                {reviewMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-fadeIn">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{reviewMsg}</span>
                  </div>
                )}

                {isHostOfProperty && !isDev && user?.role !== 'admin' ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-sm flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">You are the host of this property</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Hosts cannot write reviews for their own listings. Only guests who have booked and completed stays can leave reviews.
                      </p>
                    </div>
                  </div>
                ) : isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {isHostOfProperty && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <span className="font-semibold px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded-md text-[10px] uppercase">Testing Mode</span>
                        <span>You are the host of this listing. Review submission is allowed in development for testing purposes.</span>
                      </div>
                    )}
                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 focus:outline-none transition-transform hover:scale-125"
                            >
                              <FiStar
                                className={`w-6 h-6 transition-colors ${
                                  (hoverRating || reviewRating) >= star
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs">
                          {['', '1 - Needs Improvement', '2 - Fair', '3 - Good', '4 - Great Stay', '5 - Exceptional!'][hoverRating || reviewRating]}
                        </span>
                      </div>
                    </div>

                    {/* Comment Area */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                        Your Review
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you love about this place? How was the host, cleanliness, and neighborhood?"
                        className="w-full p-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none shadow-xs"
                        maxLength={1000}
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary !py-2.5 !px-5 !rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <FiSend className="w-4 h-4" /> Submit Review
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Sign in to write a review</p>
                      <p className="text-xs text-gray-500">Only verified users can share verified feedback.</p>
                    </div>
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {property.reviews && property.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.reviews.map((rev, idx) => (
                    <div key={rev._id || idx} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors shadow-2xs">
                      <div className="flex items-center gap-3 mb-2.5">
                        <img
                          src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'Guest')}&background=FF385C&color=fff`}
                          alt={rev.user?.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{rev.user?.name || 'Homely Guest'}</p>
                          <p className="text-xs text-gray-400">
                            {rev.createdAt ? format(new Date(rev.createdAt), 'MMMM yyyy') : 'Recent guest'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FiStar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-sm text-gray-700">No reviews yet</p>
                  <p className="text-xs text-gray-500 mt-0.5">Be the very first guest to leave a review for this stay!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking card */}
          <div id="booking-card" className="lg:col-span-1">
            <div className="sticky top-24 card p-6 shadow-large">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[22px] font-semibold">₹{property.price?.toLocaleString('en-IN')} <span className="text-[15px] font-normal text-gray-600">night</span></p>
                <span className="flex items-center gap-1 text-sm font-medium"><FiStar className="fill-black w-4 h-4" /> {property.rating?.average || 4.8} • {property.rating?.count || 12} reviews</span>
              </div>

              <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Visual date trigger button */}
                <button
                  type="button"
                  id="date-picker-trigger"
                  onClick={() => setShowDatePicker(v => !v)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                >
                  <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-700">
                    <div className="pr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Check-in</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {checkIn ? format(new Date(checkIn), 'MMM d, yyyy') : 'Add date'}
                      </p>
                    </div>
                    <div className="pl-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Check-out</span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 flex items-center justify-between">
                        <span>{checkOut ? format(new Date(checkOut), 'MMM d, yyyy') : 'Add date'}</span>
                        <FiCalendar className="w-3.5 h-3.5 text-primary-500 shrink-0 ml-1" />
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expandable DateRangePicker */}
                {showDatePicker && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <DateRangePicker
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onChange={({ checkIn: newIn, checkOut: newOut }) => {
                        setCheckIn(newIn);
                        setCheckOut(newOut);
                        if (newIn && newOut) setShowDatePicker(false);
                      }}
                      bookedRanges={bookedRanges}
                      pricePerNight={property.price}
                      className="border-0 shadow-none !p-3"
                    />
                  </div>
                )}

                <div className="border-t border-gray-300 dark:border-gray-700 p-3">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">Guests</label>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-900 dark:hover:border-white text-gray-800 dark:text-gray-200">-</button>
                      <span className="text-sm font-medium w-16 text-center text-gray-900 dark:text-white">{totalGuests} guests</span>
                      <button onClick={() => setGuests(g => ({ ...g, adults: Math.min(property.maxGuests, g.adults + 1) }))} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-900 dark:hover:border-white text-gray-800 dark:text-gray-200">+</button>
                    </div>
                    <FiUsers className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {availability && !availability.available && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">Not available for selected dates</div>
              )}

              <button onClick={handleBooking} disabled={bookingLoading || (availability && !availability.available)} className="w-full btn-primary mt-4 !py-3.5 !rounded-xl text-[16px] disabled:opacity-50">
                {bookingLoading ? 'Processing...' : pricing ? 'Reserve' : 'Check availability'}
              </button>

              {pricing && (
                <div className="mt-6 space-y-3 text-[15px]">
                  <div className="flex justify-between"><span className="underline">₹{property.price} x {pricing.nights} nights</span><span>₹{pricing.subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="underline">Cleaning fee</span><span>₹{(pricing.cleaningFee ?? 0).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="underline">Service fee</span><span>₹{(pricing.serviceFee ?? 0).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="underline">Taxes</span><span>₹{(pricing.taxes ?? 0).toLocaleString('en-IN')}</span></div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-[16px]"><span>Total</span><span>₹{pricing.total.toLocaleString('en-IN')}</span></div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiShield className="w-4 h-4 text-emerald-500" /> Payment is securely processed via Razorpay
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Booking Bottom Bar (Airbnb style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              ₹{property.price?.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/night</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium mt-0.5">
              <FiStar className="fill-black dark:fill-amber-400 text-black dark:text-amber-400 w-3 h-3" /> {property.rating?.average || 4.8}
              {pricing?.nights ? ` • ${pricing.nights} nights` : ' • Select dates'}
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('booking-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary !py-2.5 !px-6 !rounded-xl text-sm font-semibold shadow-md active:scale-95"
          >
            {pricing ? 'Reserve' : 'Check Dates'}
          </button>
        </div>

        {/* Toast Alert for Copied Link */}
        {copiedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-bounce">
            <FiCheckCircle className="text-emerald-400 w-5 h-5" />
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Feature 2: One-Click Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Share this place</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Spread the word with friends, family, or travel companions.</p>

              {/* Property Preview Card */}
              <div className="flex gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 mb-5 items-center">
                <img
                  src={images[0]?.url || images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400'}
                  alt={property.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{property.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{property.location?.city}, {property.location?.state}</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">₹{property.price?.toLocaleString('en-IN')} <span className="font-normal text-gray-500">/ night</span></p>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm">
                      <FaWhatsapp />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">Share on WhatsApp</p>
                      <p className="text-xs text-gray-500">Send direct link with stay details</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-full">Open</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg shadow-sm">
                      <FiCopy />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Copy Link</p>
                      <p className="text-xs text-gray-500">Share anywhere on chats or email</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full group-hover:bg-gray-200">Copy</span>
                </button>

                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                        <FiShare2 />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">More Apps...</p>
                        <p className="text-xs text-gray-500">Instagram, Telegram, Messages</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100/60 px-2.5 py-1 rounded-full">Share</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Photo Lightbox */}
        <PhotoLightbox
          images={images}
          isOpen={showLightbox}
          initialIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
          title={property.title}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;
