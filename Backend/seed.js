import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './src/models/User.js';
import Property from './src/models/Property.js';

dotenv.config();
dns.setServers(['1.1.1.1', '8.8.8.8']);

const seedProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Find or create demo host user
    let host = await User.findOne({ email: 'host@demo.com' });
    if (!host) {
      console.log('👤 Creating demo host account (host@demo.com)...');
      host = await User.create({
        name: 'Demo Host',
        email: 'host@demo.com',
        password: 'password123',
        isHost: true,
        role: 'host'
      });
    }

    // Find or create demo guest user
    let demoGuest = await User.findOne({ email: 'guest@demo.com' });
    if (!demoGuest) {
      console.log('👤 Creating demo guest account (guest@demo.com)...');
      await User.create({
        name: 'Demo Guest',
        email: 'guest@demo.com',
        password: 'password123',
        isHost: false,
        role: 'guest'
      });
    }
    console.log(`👤 Using host: ${host.name} (${host.email})`);

    // Check and add missing seed properties
    console.log('🌱 Checking and seeding default properties...');
    const propertiesToInsert = [];


    const properties = [
      {
        title: 'Beachfront Villa with Private Pool',
        description: 'Wake up to the sound of waves in this stunning beachfront villa. Features a private infinity pool overlooking the Arabian Sea, spacious sun deck, fully equipped modern kitchen, and direct beach access. Perfect for families and groups seeking a luxurious coastal retreat.',
        location: { address: 'Calangute Beach Road', city: 'Goa', state: 'Goa', country: 'India', zipCode: '403516', coordinates: { lat: 15.5449, lng: 73.7550 } },
        price: 500, priceUnit: 'night', propertyType: 'villa',
        amenities: ['wifi', 'pool', 'kitchen', 'ac', 'parking', 'beach_access', 'bbq'],
        bedrooms: 3, beds: 4, bathrooms: 3, maxGuests: 8,
        images: [{ url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.9, count: 128 }, host: host._id
      },
      {
        title: 'Cozy Himalayan Mountain Cabin',
        description: 'Escape to this charming wooden cabin nestled in a pine forest with breathtaking views of the Himalayas. Features a cozy fireplace, wooden interiors, and a private balcony perfect for stargazing. Just 10 minutes from Mall Road.',
        location: { address: 'Old Manali Road', city: 'Manali', state: 'Himachal Pradesh', country: 'India', zipCode: '175131', coordinates: { lat: 32.2396, lng: 77.1887 } },
        price: 500, priceUnit: 'night', propertyType: 'cabin',
        amenities: ['fireplace', 'kitchen', 'heating', 'wifi', 'parking'],
        bedrooms: 2, beds: 2, bathrooms: 1, maxGuests: 4,
        images: [{ url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.8, count: 89 }, host: host._id
      },
      {
        title: 'Luxury Sea-View Apartment in Bandra',
        description: 'Sophisticated high-rise apartment in the heart of Bandra with panoramic sea views. Modern minimalist design with premium furnishings, state-of-the-art kitchen, and access to building amenities including rooftop pool and gym.',
        location: { address: 'Bandra West, Carter Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400050', coordinates: { lat: 19.0596, lng: 72.8295 } },
        price: 500, priceUnit: 'night', propertyType: 'apartment',
        amenities: ['wifi', 'gym', 'pool', 'elevator', 'ac', 'tv', 'workspace', 'parking'],
        bedrooms: 2, beds: 2, bathrooms: 2, maxGuests: 4,
        images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.7, count: 203 }, host: host._id
      },
      {
        title: 'Heritage Haveli in the Pink City',
        description: 'Step back in time in this beautifully restored 200-year-old haveli. Ornate Rajasthani architecture, hand-painted frescoes, a central courtyard with fountain, and rooftop dining with views of Nahargarh Fort. Breakfast included.',
        location: { address: 'Johari Bazaar, Old City', city: 'Jaipur', state: 'Rajasthan', country: 'India', zipCode: '302003', coordinates: { lat: 26.9124, lng: 75.7873 } },
        price: 500, priceUnit: 'night', propertyType: 'unique',
        amenities: ['wifi', 'breakfast', 'ac', 'tv'],
        bedrooms: 4, beds: 5, bathrooms: 3, maxGuests: 8,
        images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.9, count: 156 }, host: host._id
      },
      {
        title: 'Houseboat on Dal Lake',
        description: 'Experience the magic of Kashmir on a traditional Shikara-style houseboat on Dal Lake. Hand-carved walnut wood interiors, heated rooms, and stunning views of the Pir Panjal mountains. Includes Shikara ride and Kashmiri Wazwan dinner.',
        location: { address: 'Dal Lake, Boulevard Road', city: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', zipCode: '190001', coordinates: { lat: 34.0837, lng: 74.7973 } },
        price: 500, priceUnit: 'night', propertyType: 'unique',
        amenities: ['wifi', 'heating', 'breakfast', 'kitchen'],
        bedrooms: 3, beds: 3, bathrooms: 2, maxGuests: 6,
        images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.8, count: 94 }, host: host._id
      },
      {
        title: 'Modern Penthouse in Cyber City',
        description: 'Ultra-modern penthouse with private terrace garden in Gurugram\'s business hub. Floor-to-ceiling windows, smart home automation, designer furniture, and stunning city skyline views. Ideal for business travelers and luxury seekers.',
        location: { address: 'DLF Cyber City, Sector 24', city: 'Gurugram', state: 'Haryana', country: 'India', zipCode: '122002', coordinates: { lat: 28.4945, lng: 77.0880 } },
        price: 500, priceUnit: 'night', propertyType: 'luxury',
        amenities: ['wifi', 'gym', 'pool', 'ac', 'tv', 'workspace', 'parking', 'elevator'],
        bedrooms: 3, beds: 3, bathrooms: 3, maxGuests: 6,
        images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.6, count: 67 }, host: host._id
      },
      {
        title: 'Tea Estate Cottage in Munnar',
        description: 'Charming colonial-era cottage surrounded by rolling tea plantations with misty mountain views. Wake up to fresh tea from the estate, enjoy nature walks, and unwind in the private garden. A serene escape from city life.',
        location: { address: 'Kannan Devan Hills', city: 'Munnar', state: 'Kerala', country: 'India', zipCode: '685612', coordinates: { lat: 10.0889, lng: 77.0595 } },
        price: 500, priceUnit: 'night', propertyType: 'countryside',
        amenities: ['wifi', 'kitchen', 'parking', 'breakfast', 'fireplace'],
        bedrooms: 2, beds: 2, bathrooms: 1, maxGuests: 4,
        images: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.9, count: 112 }, host: host._id
      },
      {
        title: 'Budget Studio near Connaught Place',
        description: 'Clean and comfortable studio apartment in central Delhi. Walking distance to Connaught Place, metro station, and top attractions. Recently renovated with modern amenities. Great for solo travelers and couples on a budget.',
        location: { address: 'Barakhamba Road', city: 'New Delhi', state: 'Delhi', country: 'India', zipCode: '110001', coordinates: { lat: 28.6315, lng: 77.2167 } },
        price: 500, priceUnit: 'night', propertyType: 'budget',
        amenities: ['wifi', 'ac', 'tv', 'washer'],
        bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 2,
        images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.4, count: 312 }, host: host._id
      },
      {
        title: 'Lakeside Villa with Infinity Pool',
        description: 'Spectacular contemporary villa on the shores of Pichola Lake. Private infinity pool merging with the lake horizon, open-air dining, premium spa bathroom, and a dedicated butler service. Pure luxury in the City of Lakes.',
        location: { address: 'Lake Pichola, Ambamata', city: 'Udaipur', state: 'Rajasthan', country: 'India', zipCode: '313001', coordinates: { lat: 24.5854, lng: 73.6801 } },
        price: 500, priceUnit: 'night', propertyType: 'luxury',
        amenities: ['wifi', 'pool', 'kitchen', 'ac', 'parking', 'breakfast', 'tv'],
        bedrooms: 4, beds: 5, bathrooms: 4, maxGuests: 10,
        images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 5.0, count: 42 }, host: host._id
      },
      {
        title: 'Treehouse Retreat in Wayanad',
        description: 'Unique treehouse perched 40 feet above ground in a tropical forest. Eco-friendly construction with bamboo interiors, open-air shower, and panoramic canopy views. Experience wildlife, birdwatching, and absolute tranquility.',
        location: { address: 'Vythiri, Wayanad', city: 'Wayanad', state: 'Kerala', country: 'India', zipCode: '673576', coordinates: { lat: 11.5394, lng: 76.0383 } },
        price: 500, priceUnit: 'night', propertyType: 'unique',
        amenities: ['wifi', 'breakfast', 'parking'],
        bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 2,
        images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.8, count: 78 }, host: host._id
      },
      {
        title: 'Spacious Family Home in Bangalore',
        description: 'Modern 4BHK independent house in a quiet neighborhood. Large garden with outdoor seating, fully equipped kitchen, kids play area, and ample parking. Close to Cubbon Park and Brigade Road. Perfect for family vacations.',
        location: { address: 'Indiranagar, 100 Feet Road', city: 'Bangalore', state: 'Karnataka', country: 'India', zipCode: '560038', coordinates: { lat: 12.9716, lng: 77.6412 } },
        price: 500, priceUnit: 'night', propertyType: 'house',
        amenities: ['wifi', 'kitchen', 'washer', 'dryer', 'ac', 'tv', 'parking', 'pets'],
        bedrooms: 4, beds: 5, bathrooms: 3, maxGuests: 10,
        images: [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.7, count: 145 }, host: host._id
      },
      {
        title: 'Beachfront Cabana in Pondicherry',
        description: 'Bohemian-chic cabana steps from Serenity Beach. French colonial charm meets coastal vibes with pastel interiors, hammock-draped patio, and surfboard rentals. Walk to cafes and the famous Promenade. Sunsets included!',
        location: { address: 'Serenity Beach Road', city: 'Pondicherry', state: 'Puducherry', country: 'India', zipCode: '605101', coordinates: { lat: 11.9416, lng: 79.8083 } },
        price: 500, priceUnit: 'night', propertyType: 'beachfront',
        amenities: ['wifi', 'ac', 'beach_access', 'breakfast', 'parking'],
        bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 3,
        images: [{ url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }],
        rating: { average: 4.6, count: 98 }, host: host._id
      }
    ];

    for (const prop of properties) {
      const exists = await Property.findOne({ title: prop.title });
      if (!exists) {
        propertiesToInsert.push(prop);
      }
    }

    if (propertiesToInsert.length > 0) {
      const created = await Property.insertMany(propertiesToInsert);
      console.log(`\n🎉 Successfully seeded ${created.length} new properties!\n`);
      created.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} - ₹${p.price}/night (${p.location.city})`);
      });
    } else {
      console.log('\n✅ All seed properties already exist in database.\n');
    }

    console.log('🌐 Restart your backend and refresh the frontend!\n');

    await mongoose.disconnect();
    console.log('✅ Done! MongoDB disconnected.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedProperties();
