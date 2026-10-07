import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const BookingCard = ({ booking, isHost = false }) => {
  const property = booking.property;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  const statusColors = {
    pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    confirmed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    cancelled: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    completed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className="card hover:shadow-medium transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto relative shrink-0">
          <img src={property?.images?.[0]?.url || property?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400'} alt={property?.title} className="w-full h-full object-cover" />
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColors[booking.status] || statusColors.pending}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <Link to={`/properties/${property?._id}`} className="font-semibold text-[16px] text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1">{property?.title || 'Property'}</Link>
              <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1"><FiMapPin className="w-4 h-4" /> {property?.location?.city}, {property?.location?.state}</p>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 border border-transparent dark:border-gray-700/50">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Check-in</p>
              <p className="font-semibold mt-1 text-gray-900 dark:text-white">{format(checkIn, 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 border border-transparent dark:border-gray-700/50">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Check-out</p>
              <p className="font-semibold mt-1 text-gray-900 dark:text-white">{format(checkOut, 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 border border-transparent dark:border-gray-700/50">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1"><FiUsers className="w-3 h-3" /> Guests</p>
              <p className="font-semibold mt-1 text-gray-900 dark:text-white">{booking.totalGuests} • {booking.pricing?.nights} nights</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              {isHost ? (
                <>
                  <img src={booking.guest?.avatar || `https://ui-avatars.com/api/?name=${booking.guest?.name}&background=random`} alt="guest" className="w-7 h-7 rounded-full" />
                  <span>Guest: <span className="font-medium text-gray-900 dark:text-white">{booking.guest?.name}</span></span>
                </>
              ) : (
                <>
                  <img src={booking.host?.avatar || `https://ui-avatars.com/api/?name=${booking.host?.name}&background=random`} alt="host" className="w-7 h-7 rounded-full" />
                  <span>Host: <span className="font-medium text-gray-900 dark:text-white">{booking.host?.name}</span></span>
                </>
              )}
            </div>
            <Link to={`/bookings/${booking._id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">View details →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
