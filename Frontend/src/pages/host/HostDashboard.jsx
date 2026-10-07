import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHostProperties, deleteProperty } from '../../store/slices/propertySlice';
import { fetchHostBookings } from '../../store/slices/bookingSlice';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiDollarSign, FiCalendar, FiHome } from 'react-icons/fi';

const HostDashboard = () => {
  const dispatch = useDispatch();
  const { hostProperties } = useSelector(s => s.properties);
  const { hostBookings } = useSelector(s => s.bookings);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    dispatch(fetchHostProperties());
    dispatch(fetchHostBookings());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    dispatch(deleteProperty(id));
  };

  const totalEarnings = hostBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  const pendingBookings = hostBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Host Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your properties and bookings</p>
          </div>
          <Link to="/host/new" className="btn-primary rounded-full flex items-center gap-2"><FiPlus /> List new property</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Properties', value: hostProperties.length, icon: FiHome, color: 'bg-blue-500' },
            { label: 'Total Bookings', value: hostBookings.length, icon: FiCalendar, color: 'bg-violet-500' },
            { label: 'Pending Requests', value: pendingBookings, icon: FiEye, color: 'bg-amber-500' },
            { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-emerald-500' }
          ].map(stat => (
            <div key={stat.label} className="card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.color} text-white flex items-center justify-center`}><stat.icon /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-full border border-gray-200 w-fit">
          {[
            { id: 'properties', label: 'Properties' },
            { id: 'bookings', label: `Bookings (${hostBookings.length})` }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'properties' ? (
          hostProperties.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiHome className="w-8 h-8 text-gray-400" /></div>
              <h3 className="font-semibold text-lg">No properties yet</h3>
              <p className="text-gray-600 text-sm mt-1 mb-6">Start earning by listing your first property</p>
              <Link to="/host/new" className="btn-primary rounded-full inline-flex items-center gap-2"><FiPlus /> Add property</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostProperties.map(property => (
                <div key={property._id} className="card overflow-hidden group">
                  <div className="relative h-48">
                    <img src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600'} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${property.isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'}`}>{property.isAvailable ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{property.location?.city} • ₹{property.price?.toLocaleString('en-IN')}/night</p>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/properties/${property._id}`} className="flex-1 btn-secondary !py-2 !px-3 text-sm flex items-center justify-center gap-1"><FiEye /> View</Link>
                      <Link to={`/host/edit/${property._id}`} className="flex-1 btn-secondary !py-2 !px-3 text-sm flex items-center justify-center gap-1"><FiEdit2 /> Edit</Link>
                      <button onClick={() => handleDelete(property._id)} className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {hostBookings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-500">No bookings yet. Your properties will appear here when guests book.</p>
              </div>
            ) : (
              hostBookings.map(booking => (
                <div key={booking._id} className="card p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <img src={booking.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200'} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-semibold">{booking.property?.title}</h4>
                      <p className="text-sm text-gray-600">Guest: {booking.guest?.name} • {booking.totalGuests} guests • {booking.pricing?.nights} nights</p>
                      <p className="text-sm text-gray-600">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
                      <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700'}`}>{booking.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-lg">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                    <Link to={`/bookings/${booking._id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Manage →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
