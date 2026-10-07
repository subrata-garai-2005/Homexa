import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../store/slices/bookingSlice';
import BookingCard from '../components/booking/BookingCard';
import { FiCalendar } from 'react-icons/fi';

const Bookings = () => {
  const dispatch = useDispatch();
  const { myBookings, loading } = useSelector(s => s.bookings);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const filtered = myBookings.filter(b => filter === 'all' || b.status === filter);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">My Trips</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your upcoming and past stays</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-850 p-1 rounded-full border border-gray-200 dark:border-gray-700 w-fit shadow-xs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${filter === tab.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-24 bg-gray-200 rounded" /></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiCalendar className="w-8 h-8 text-gray-400" /></div>
            <h3 className="font-semibold text-lg">No {filter !== 'all' ? filter : ''} trips found</h3>
            <p className="text-gray-600 text-sm mt-1">When you book a stay, it will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => <BookingCard key={booking._id} booking={booking} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
