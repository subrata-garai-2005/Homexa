import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../store/slices/propertySlice';
import PropertyMap from '../components/map/PropertyMap';
import PropertyCard from '../components/property/PropertyCard';
import { FiMap } from 'react-icons/fi';

const MapView = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(s => s.properties);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchProperties({ limit: 100 }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3"><FiMap /> Explore on Map</h1>
            <p className="text-gray-600 mt-1">{properties.length} stays • Click markers to view</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyMap properties={properties} height="80vh" onMarkerClick={setSelected} />
          </div>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <h3 className="font-semibold sticky top-0 bg-gray-50 py-2">All Properties ({properties.length})</h3>
            {properties.map(p => (
              <div key={p._id} className={`transition-all ${selected?._id === p._id ? 'ring-2 ring-primary-500 rounded-2xl' : ''}`}>
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
