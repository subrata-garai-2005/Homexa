import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingById, cancelBooking } from '../store/slices/bookingSlice';
import { 
  FiMapPin, 
  FiCheckCircle, 
  FiArrowLeft
} from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from '../utils/toast';

const BookingDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success');
  const dispatch = useDispatch();
  const { selectedBooking: booking, loading } = useSelector(s => s.bookings);
  const { user } = useSelector(s => s.auth);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id));
    }
  }, [id, dispatch]);

  const handleCancel = async () => {
    if (!confirm('Cancel this booking? Refund policy will apply.')) return;
    setCancelling(true);
    const result = await dispatch(cancelBooking(id));
    if (cancelBooking.fulfilled.match(result)) {
      const refundAmount = result.payload?.cancellation?.refundAmount || 0;
      toast.success(`Booking cancelled. Refund amount: ₹${refundAmount}`);
    } else if (cancelBooking.rejected.match(result)) {
      toast.error(result.payload || 'Failed to cancel booking');
    }
    setCancelling(false);
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8"><div className="card p-8 animate-pulse h-96 bg-gray-100" /></div>;
  if (!booking) return <div className="text-center py-20">Booking not found</div>;

  const isHost = booking.host?._id === user?._id || booking.host === user?._id;
  const property = booking.property;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <FiArrowLeft /> Back to trips
        </Link>

        {isSuccess && booking.status === 'confirmed' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 text-lg">Booking confirmed! 🎉</h3>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-1">Your trip to {property?.title} is confirmed. Confirmation email sent to your inbox.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{property?.title}</h1>
                  <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mt-1">
                    <FiMapPin className="w-4 h-4" /> {property?.location?.city}, {property?.location?.state}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  booking.status === 'confirmed' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : booking.status === 'pending' 
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <img 
                src={property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800'} 
                alt={property?.title} 
                className="w-full h-64 object-cover rounded-2xl mb-6" 
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-transparent dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Check-in</p>
                  <p className="font-semibold mt-1 text-gray-900 dark:text-white">{format(new Date(booking.checkIn), 'EEE, MMM dd, yyyy')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">3:00 PM</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-transparent dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Check-out</p>
                  <p className="font-semibold mt-1 text-gray-900 dark:text-white">{format(new Date(booking.checkOut), 'EEE, MMM dd, yyyy')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">11:00 AM</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-transparent dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Guests</p>
                  <p className="font-semibold mt-1 text-gray-900 dark:text-white">{booking.totalGuests} guests</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.guests?.adults} adults{booking.guests?.children ? `, ${booking.guests.children} children` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* General Booking details */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Booking details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono font-medium">{booking._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booked on</span>
                  <span>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span>{booking.pricing?.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    booking.payment?.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {booking.payment?.status}
                  </span>
                </div>
                {booking.specialRequests && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Special requests</p>
                    <p className="mt-1 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl text-gray-800 dark:text-gray-200">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>


          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Price breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>₹{booking.pricing?.nightlyRate} x {booking.pricing?.nights} nights</span>
                  <span>₹{booking.pricing?.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹{booking.pricing?.cleaningFee?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹{booking.pricing?.serviceFee?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{booking.pricing?.taxes?.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-3">{isHost ? 'Guest' : 'Host'} info</h3>
              <div className="flex gap-3">
                <img 
                  src={(isHost ? booking.guest?.avatar : booking.host?.avatar) || `https://ui-avatars.com/api/?name=${isHost ? booking.guest?.name : booking.host?.name}&background=random`} 
                  alt="" 
                  className="w-12 h-12 rounded-full" 
                />
                <div>
                  <p className="font-medium">{isHost ? booking.guest?.name : booking.host?.name}</p>
                  <p className="text-sm text-gray-600">{isHost ? booking.guest?.email : booking.host?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {['pending', 'confirmed'].includes(booking.status) && (
                <button 
                  onClick={handleCancel} 
                  disabled={cancelling} 
                  className="btn-secondary w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel booking'}
                </button>
              )}
              <Link to={`/properties/${property?._id}`} className="btn-secondary w-full text-center">
                View property
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
