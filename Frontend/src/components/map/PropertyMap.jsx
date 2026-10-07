import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { FiCrosshair, FiLoader } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPriceIcon = (price) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div style="background:#111827;color:white;padding:6px 10px;border-radius:20px;font-weight:700;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.25);white-space:nowrap;transform:translate(-50%,-50%);transition:transform 0.2s ease;">₹${price.toLocaleString('en-IN')}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position:relative;width:24px;height:24px;transform:translate(-50%,-50%);">
        <div style="position:absolute;inset:0;background:rgba(59,130,246,0.35);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;top:3px;left:3px;width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// MapBoundsUpdater: fixes blank/partial map rendering by calling invalidateSize() and fitting bounds
const MapBoundsUpdater = ({ properties, singleProp }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately and after CSS layout finishes settling
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    const valid = properties.filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lng);
    if (valid.length > 1 && !singleProp) {
      const bounds = L.latLngBounds(valid.map(p => [p.location.coordinates.lat, p.location.coordinates.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (valid.length === 1) {
      map.setView([valid[0].location.coordinates.lat, valid[0].location.coordinates.lng], 13);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onResize);
    };
  }, [properties, map, singleProp]);

  return null;
};

// Locate Control component inside MapContainer
const LocateControl = ({ setUserLocation }) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        map.flyTo([latitude, longitude], 13, { duration: 1.5 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err?.message);
        toast.warning('Could not determine your location. Please check location permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '12px', marginRight: '12px', pointerEvents: 'auto' }}>
      <button
        onClick={handleLocateMe}
        disabled={locating}
        title="Locate my position"
        className="bg-white hover:bg-gray-50 text-gray-800 shadow-md font-medium text-xs py-2 px-3 rounded-xl border border-gray-200 flex items-center gap-1.5 transition-all active:scale-95 z-[1000]"
      >
        {locating ? (
          <>
            <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
            <span>Locating...</span>
          </>
        ) : (
          <>
            <FiCrosshair className="w-4 h-4 text-blue-600" />
            <span>Locate Me</span>
          </>
        )}
      </button>
    </div>
  );
};

const PropertyMap = ({ properties = [], center = [20.5937, 78.9629], zoom = 5, height = '600px', onMarkerClick }) => {
  const [userLocation, setUserLocation] = useState(null);
  const validProperties = properties.filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lng);

  // Auto center if single property exists
  const mapCenter = validProperties.length === 1 
    ? [validProperties[0].location.coordinates.lat, validProperties[0].location.coordinates.lng]
    : center;

  const mapZoom = validProperties.length === 1 ? 12 : zoom;

  return (
    <div style={{ height, minHeight: '350px' }} className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-soft relative z-0">
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', minHeight: '350px' }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapBoundsUpdater properties={validProperties} singleProp={validProperties.length === 1} />

        <LocateControl userLocation={userLocation} setUserLocation={setUserLocation} />

        {/* User location marker if detected */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>
              <div className="p-1 font-semibold text-xs text-blue-700">📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {validProperties.map(property => (
          <Marker
            key={property._id}
            position={[property.location.coordinates.lat, property.location.coordinates.lng]}
            icon={createPriceIcon(property.price)}
            eventHandlers={{
              click: () => onMarkerClick?.(property)
            }}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="w-[260px]">
                <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                  <img src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400'} alt={property.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-[11px] font-semibold shadow-sm capitalize">{property.propertyType}</span>
                </div>
                <h4 className="font-semibold text-sm line-clamp-1 mb-1">{property.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{property.location.city}, {property.location.state}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">₹{property.price?.toLocaleString('en-IN')} <span className="font-normal text-gray-500 text-xs">/ night</span></span>
                  <Link to={`/properties/${property._id}`} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-black transition-colors">View</Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
