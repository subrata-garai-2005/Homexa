import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById } from '../../store/slices/propertySlice';
import api from '../../api/axios';
import { toast } from '../../utils/toast';
import { FiUpload, FiX, FiZap, FiMapPin, FiDollarSign } from 'react-icons/fi';

const amenitiesOptions = ['wifi', 'kitchen', 'washer', 'dryer', 'ac', 'heating', 'tv', 'pool', 'gym', 'parking', 'elevator', 'workspace', 'pets', 'breakfast', 'beach_access', 'fireplace', 'bbq'];

const PropertyForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { selectedProperty } = useSelector(s => s.properties);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    lat: '20.5937',
    lng: '78.9629',
    price: '',
    priceUnit: 'night',
    propertyType: 'apartment',
    amenities: [],
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    houseRules: '',
    cancellationPolicy: 'flexible'
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (isEdit) dispatch(fetchPropertyById(id));
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && selectedProperty && selectedProperty._id === id) {
      const timer = setTimeout(() => {
        setForm({
          title: selectedProperty.title || '',
          description: selectedProperty.description || '',
          address: selectedProperty.location?.address || '',
          city: selectedProperty.location?.city || '',
          state: selectedProperty.location?.state || '',
          country: selectedProperty.location?.country || 'India',
          zipCode: selectedProperty.location?.zipCode || '',
          lat: selectedProperty.location?.coordinates?.lat?.toString() || '20.5937',
          lng: selectedProperty.location?.coordinates?.lng?.toString() || '78.9629',
          price: selectedProperty.price?.toString() || '',
          priceUnit: selectedProperty.priceUnit || 'night',
          propertyType: selectedProperty.propertyType || 'apartment',
          amenities: selectedProperty.amenities || [],
          bedrooms: selectedProperty.bedrooms || 1,
          beds: selectedProperty.beds || 1,
          bathrooms: selectedProperty.bathrooms || 1,
          maxGuests: selectedProperty.maxGuests || 2,
          houseRules: selectedProperty.houseRules || '',
          cancellationPolicy: selectedProperty.cancellationPolicy || 'flexible'
        });
        if (selectedProperty.images) {
          setPreviewUrls(selectedProperty.images.map(img => img.url || img));
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedProperty, isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity) ? f.amenities.filter(a => a !== amenity) : [...f.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const generateAIDescription = async () => {
    if (!form.title || !form.city) {
      toast.warning('Please enter title and city first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-description', {
        title: form.title,
        propertyType: form.propertyType,
        city: form.city,
        bedrooms: form.bedrooms,
        amenities: form.amenities,
        price: form.price
      });
      setForm(f => ({ ...f, description: res.data.description }));
      toast.success('AI description generated!');
    } catch (err) {
      console.warn('AI generation notice:', err?.message);
      toast.error('AI generation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'amenities') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await api.put(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(isEdit ? 'Property updated successfully!' : 'Property listed successfully!');
      navigate('/host');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">{isEdit ? 'Edit Property' : 'List your property'}</h1>
          <p className="text-gray-600 mt-1">{isEdit ? 'Update your listing details' : 'Share your space and start earning'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FiMapPin /> Basic Info</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Property Title *</label>
                <input name="title" required value={form.title} onChange={handleChange} placeholder="e.g., Beachfront Villa in Goa" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Property Type *</label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="cabin">Cabin</option>
                  <option value="beachfront">Beachfront</option>
                  <option value="luxury">Luxury</option>
                  <option value="unique">Unique</option>
                  <option value="budget">Budget</option>
                  <option value="countryside">Countryside</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1"><FiDollarSign /> Price per {form.priceUnit} (₹) *</label>
                <input name="price" type="number" required value={form.price} onChange={handleChange} placeholder="5000" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium block">Description *</label>
                  <button type="button" onClick={generateAIDescription} disabled={aiLoading} className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50">
                    <FiZap className="w-3 h-3" /> {aiLoading ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea name="description" required value={form.description} onChange={handleChange} rows={5} placeholder="Describe your property..." className="input-field resize-none" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Location</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Address *</label>
                <input name="address" required value={form.address} onChange={handleChange} placeholder="Street address" className="input-field" />
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">City *</label><input name="city" required value={form.city} onChange={handleChange} placeholder="Goa" className="input-field" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">State *</label><input name="state" required value={form.state} onChange={handleChange} placeholder="Goa" className="input-field" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Country</label><input name="country" value={form.country} onChange={handleChange} className="input-field" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Zip Code</label><input name="zipCode" value={form.zipCode} onChange={handleChange} className="input-field" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Latitude *</label><input name="lat" required type="number" step="any" value={form.lat} onChange={handleChange} className="input-field" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Longitude *</label><input name="lng" required type="number" step="any" value={form.lng} onChange={handleChange} className="input-field" /></div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'bedrooms', label: 'Bedrooms' },
                { name: 'beds', label: 'Beds' },
                { name: 'bathrooms', label: 'Bathrooms' },
                { name: 'maxGuests', label: 'Max Guests' }
              ].map(field => (
                <div key={field.name}>
                  <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                  <input name={field.name} type="number" min="1" value={form[field.name]} onChange={handleChange} className="input-field" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenitiesOptions.map(amenity => (
                <button key={amenity} type="button" onClick={() => handleAmenityToggle(amenity)} className={`px-4 py-2 rounded-full text-sm border capitalize transition-colors ${form.amenities.includes(amenity) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                  {amenity.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Images</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-gray-300 transition-colors">
              <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">Upload property images (max 10, 5MB each)</p>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="btn-secondary !py-2 text-sm cursor-pointer">Choose files</label>
            </div>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt={`preview ${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      setPreviewUrls(urls => urls.filter((_, idx) => idx !== i));
                      setImages(imgs => imgs.filter((_, idx) => idx !== i));
                    }} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate('/host')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary !px-8">{loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
