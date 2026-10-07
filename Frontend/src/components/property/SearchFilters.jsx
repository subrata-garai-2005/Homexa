import { useState } from 'react';
import { FiSearch, FiSliders, FiX, FiMapPin } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../store/slices/propertySlice';

const propertyTypes = [
  { value: 'all', label: 'All', icon: '🏠' },
  { value: 'apartment', label: 'Apartments', icon: '🏢' },
  { value: 'house', label: 'Houses', icon: '🏡' },
  { value: 'villa', label: 'Villas', icon: '🏖️' },
  { value: 'cabin', label: 'Cabins', icon: '🌲' },
  { value: 'beachfront', label: 'Beachfront', icon: '🌊' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'unique', label: 'Unique', icon: '🏰' },
];

const amenitiesList = ['wifi', 'kitchen', 'pool', 'ac', 'parking', 'gym', 'pets', 'workspace'];

const SearchFilters = ({ onSearch }) => {
  const dispatch = useDispatch();
  const filters = useSelector(s => s.properties.filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearch = () => {
    dispatch(setFilters({ search: localSearch }));
    onSearch?.({ ...filters, search: localSearch });
  };

  const handleTypeChange = (type) => {
    const newFilters = { propertyType: type };
    dispatch(setFilters(newFilters));
    onSearch?.({ ...filters, ...newFilters });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity) ? current.filter(a => a !== amenity) : [...current, amenity];
    dispatch(setFilters({ amenities: updated }));
  };

  const applyAdvanced = () => {
    onSearch?.(filters);
    setShowAdvanced(false);
  };

  return (
    <div className="space-y-4">
      {/* Main search bar - Responsive Airbnb style */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl lg:rounded-full shadow-large border border-gray-100 dark:border-gray-800 max-w-4xl mx-auto p-2 lg:p-1.5 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Destination / Keyword Input */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-1">
            <FiSearch className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Where to? (e.g. Goa, Villa, Beach...)"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent outline-none text-[15px] placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />

          {/* City & Filters Controls */}
          <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
            <div className="relative flex-1 sm:flex-initial">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={e => dispatch(setFilters({ city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full sm:w-32 pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-full text-sm outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="More filters"
              className={`p-2.5 rounded-xl sm:rounded-full border transition-colors shrink-0 cursor-pointer ${
                showAdvanced 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
            >
              <FiSliders className="w-4 h-4" />
            </button>

            <button
              onClick={handleSearch}
              className="bg-primary-500 hover:bg-primary-600 text-white px-5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <FiSearch className="w-4 h-4" />
              <span className="sm:hidden font-medium">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property type pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 max-w-[1440px] mx-auto px-1">
        {propertyTypes.map(type => (
          <button
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border cursor-pointer ${
              filters.propertyType === type.value
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white shadow-soft'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
            }`}
          >
            <span>{type.icon}</span> {type.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-large border border-gray-100 dark:border-gray-800 p-6 max-w-4xl mx-auto animate-slide-up text-gray-900 dark:text-gray-100 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <div className="flex gap-2">
              <button onClick={() => { dispatch(clearFilters()); setLocalSearch(''); }} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline cursor-pointer">Clear all</button>
              <button onClick={() => setShowAdvanced(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full cursor-pointer"><FiX /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Price range (per night)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => dispatch(setFilters({ minPrice: e.target.value }))} className="input-field !py-2.5 text-sm" />
                <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => dispatch(setFilters({ maxPrice: e.target.value }))} className="input-field !py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Bedrooms</label>
              <select value={filters.bedrooms} onChange={e => dispatch(setFilters({ bedrooms: e.target.value }))} className="input-field !py-2.5 text-sm">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Sort by</label>
              <select value={filters.sort} onChange={e => dispatch(setFilters({ sort: e.target.value }))} className="input-field !py-2.5 text-sm">
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-full text-sm border capitalize transition-colors cursor-pointer ${
                    filters.amenities?.includes(amenity) 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => setShowAdvanced(false)} className="btn-secondary cursor-pointer">Cancel</button>
            <button onClick={applyAdvanced} className="btn-primary cursor-pointer">Show results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
