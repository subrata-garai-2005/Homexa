import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties, setFilters, clearFilters } from '../store/slices/propertySlice';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilters from '../components/property/SearchFilters';
import PropertyMap from '../components/map/PropertyMap';
import { FiGrid, FiMap, FiLoader } from 'react-icons/fi';

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, loading, pagination, filters } = useSelector(s => s.properties);
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // grid | map
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const updates = {};
    if (params.city && params.city !== filters.city) updates.city = params.city;
    if (params.propertyType && params.propertyType !== filters.propertyType) updates.propertyType = params.propertyType;
    if (params.search && params.search !== filters.search) updates.search = params.search;
    if (Object.keys(updates).length > 0) {
      dispatch(setFilters(updates));
    }
  }, [searchParams, dispatch, filters.city, filters.propertyType, filters.search]);

  useEffect(() => {
    dispatch(fetchProperties({ ...filters, page, limit: 12 }));
  }, [dispatch, page, filters]);

  const handleSearch = (newFilters) => {
    setPage(1);
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationPages = () => {
    if (!pagination?.pages) return [];
    const totalPages = pagination.pages;
    const current = page;
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pagesArr = [];
    for (let i = start; i <= end; i++) pagesArr.push(i);
    return pagesArr;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-200">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[72px] z-30 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchFilters onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              {pagination?.total ? `${pagination.total} stays` : 'Stays'} {filters.city ? `in ${filters.city}` : ''}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filters.propertyType !== 'all' ? `${filters.propertyType} • ` : ''}{filters.city || 'All destinations'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 transition-colors">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'map' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FiMap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Finding perfect stays...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-5xl mb-4">🏡</p>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">No stays found</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-4">Try adjusting your filters or search</p>
                <button
                  onClick={() => dispatch(clearFilters())}
                  className="px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map(p => <PropertyCard key={p._id} property={p} />)}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  disabled={page === 1} 
                  onClick={() => handlePageChange(page - 1)} 
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {getPaginationPages().map((pageNum) => (
                    <button 
                      key={pageNum} 
                      onClick={() => handlePageChange(pageNum)} 
                      className={`w-9 h-9 rounded-full text-sm font-medium cursor-pointer ${
                        page === pageNum 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={page === pagination.pages} 
                  onClick={() => handlePageChange(page + 1)} 
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="grid sm:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-2">
                {properties.map(p => <PropertyCard key={p._id} property={p} />)}
              </div>
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-[180px] h-fit">
              <PropertyMap properties={properties} height="700px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
