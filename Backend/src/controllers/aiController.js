import Property from '../models/Property.js';

// AI-powered features with fallback logic (no API key required for demo)

const PROPERTY_PROMPTS = {
  beachfront: 'beachfront, ocean view, tropical, serene',
  villa: 'luxury villa, spacious, elegant, private',
  cabin: 'cozy cabin, rustic, mountain, fireplace',
  apartment: 'modern apartment, urban, stylish, convenient',
  luxury: 'luxury, premium, exclusive, high-end'
};

// Mock AI generation - works without external API
const generateMockDescription = ({ title, propertyType, city, bedrooms, amenities, price }) => {
  const adjectives = {
    apartment: ['stylish', 'modern', 'chic', 'urban', 'contemporary'],
    villa: ['luxurious', 'spacious', 'elegant', 'private', 'stunning'],
    cabin: ['cozy', 'rustic', 'charming', 'serene', 'wooden'],
    beachfront: ['breathtaking', 'sun-kissed', 'tranquil', 'oceanfront', 'tropical'],
    house: ['welcoming', 'family-friendly', 'comfortable', 'homely', 'spacious'],
    luxury: ['opulent', 'exquisite', 'premium', 'sophisticated', 'world-class']
  };

  const adjList = adjectives[propertyType] || adjectives['house'];
  const randomAdj = () => adjList[Math.floor(Math.random() * adjList.length)];

  const amenityText = amenities?.length ? `Featuring ${amenities.slice(0,4).join(', ')}, this property ensures a comfortable stay.` : '';

  return `Welcome to ${title || 'this exceptional property'} in the heart of ${city || 'a prime location'}! 

This ${randomAdj()} ${propertyType || 'property'} offers ${bedrooms || 2} beautifully appointed bedrooms designed for ultimate comfort and relaxation. ${randomAdj().charAt(0).toUpperCase() + randomAdj().slice(1)} interiors blend modern amenities with authentic local charm, creating a perfect retreat for travelers seeking both comfort and character.

${amenityText}

Located just moments away from local attractions, cafes, and cultural landmarks, you'll have everything at your fingertips while enjoying a peaceful, private atmosphere. Whether you're traveling for work, leisure, or a special getaway, this space promises an unforgettable experience.

Priced at just ₹${price || '500'}/night, it offers exceptional value for the quality and location. Book now and make your ${city || 'travel'} dreams a reality! 🏡✨

#Homexa #StayExceptional`;

};

const generateMockTripPlan = ({ destination, days, travelers, interests, budget }) => {
  const interestMap = {
    beach: ['Sunrise beach walk', 'Water sports', 'Seafood tasting', 'Sunset cruise'],
    mountain: ['Trek to viewpoint', 'Campfire night', 'Local village tour', 'Photography walk'],
    culture: ['Heritage walk', 'Local museum', 'Temple visit', 'Cooking class'],
    food: ['Street food tour', 'Local market visit', 'Cooking with host', 'Cafe hopping'],
    adventure: ['Paragliding', 'River rafting', 'Rock climbing', 'Jungle safari']
  };

  const selectedInterests = interests?.length ? interests : ['culture', 'food'];
  let activities = [];
  selectedInterests.forEach(i => {
    if (interestMap[i]) activities = [...activities, ...interestMap[i]];
  });

  const itinerary = [];
  const numDays = Math.min(parseInt(days) || 3, 7);
  
  for (let d = 1; d <= numDays; d++) {
    const dayActivities = [];
    const dailyPool = [...activities].sort(() => 0.5 - Math.random()).slice(0, 3);
    dailyPool.forEach((act, idx) => {
      const times = ['09:00 AM', '02:00 PM', '06:00 PM'];
      dayActivities.push({
        time: times[idx] || '10:00 AM',
        activity: act,
        duration: `${1 + Math.floor(Math.random()*2)} hours`,
        cost: `₹${500 + Math.floor(Math.random()*1500)}`,
        tip: `Best experienced with ${travelers || 'friends/family'}!`
      });
    });

    itinerary.push({
      day: d,
      theme: d === 1 ? 'Arrival & Exploration' : d === numDays ? 'Farewell & Memories' : `Adventure Day ${d}`,
      activities: dayActivities,
      staySuggestion: `Stay in ${destination} - We recommend our top-rated properties for best experience`,
      foodSuggestion: d % 2 === 0 ? 'Try local thali and street chaat' : 'Recommended: Seafood and regional delicacies'
    });
  }

  return {
    destination,
    duration: `${numDays} days`,
    travelers: travelers || '2 guests',
    budget: budget || 'Moderate - ₹5000-8000/day',
    overview: `Your personalized ${numDays}-day trip to ${destination} is crafted for ${travelers || 'a memorable experience'} focusing on ${selectedInterests.join(', ')}. Expect a perfect blend of relaxation, exploration, and authentic local experiences!`,
    itinerary,
    packingList: ['Comfortable walking shoes', 'Sunscreen & hat', 'Power bank', 'Local language phrasebook', 'Camera'],
    budgetBreakdown: {
      accommodation: `₹${(numDays * 4000).toLocaleString('en-IN')}`,
      food: `₹${(numDays * 1500).toLocaleString('en-IN')}`,
      activities: `₹${(numDays * 2000).toLocaleString('en-IN')}`,
      transport: `₹${(numDays * 1000).toLocaleString('en-IN')}`,
      total: `₹${(numDays * 8500).toLocaleString('en-IN')}`
    },
    localTips: [
      `Best time to visit ${destination} is early morning for fewer crowds`,
      'Bargain gently at local markets - it\'s part of the culture!',
      'Try homestays for authentic local experience',
      'Keep cash handy - many local shops prefer it'
    ]
  };
};

export const generateDescription = async (req, res) => {
  try {
    const { title, propertyType, city, bedrooms, amenities, price, keywords } = req.body;

    // If OpenAI key exists, you could call OpenAI here. For now, use mock with AI-like quality
    // Future: Integrate OpenAI API if OPENAI_API_KEY is set

    if (process.env.OPENAI_API_KEY) {
      try {
        // Dynamic import to avoid hard dependency
        const { default: fetch } = await import('node-fetch').catch(() => ({ default: global.fetch }));
        // Attempt OpenAI call - if fails, fallback to mock
        // Keeping it simple for production-ready fallback
      } catch {}
    }

    const description = generateMockDescription({ title, propertyType, city, bedrooms, amenities, price, keywords });

    res.json({
      success: true,
      description,
      generatedBy: 'Homexa AI ✨',
      prompt: { title, propertyType, city, keywords }
    });
  } catch (error) {
    console.error('AI description error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate description' });
  }
};

export const generateTripPlan = async (req, res) => {
  try {
    const { destination, days, travelers, interests, budget, startDate } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required' });
    }

    const plan = generateMockTripPlan({ destination, days, travelers, interests, budget, startDate });

    res.json({
      success: true,
      plan,
      generatedBy: 'Homexa Trip AI 🗺️',
      meta: { destination, days, generatedAt: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Trip planner error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate trip plan' });
  }
};

export const getPropertySuggestions = async (req, res) => {
  try {
    const { city, interests, budget } = req.query;
    
    // This would normally use vector search or AI recommendations
    // Mock intelligent suggestions
    const suggestions = {
      message: `Based on your interest in ${interests || 'travel'} and budget ₹${budget || '5000'}/night in ${city || 'popular destinations'}`,
      properties: [], // Frontend will fetch actual properties
      tips: [
        `In ${city || 'this city'}, beachfront properties offer best sunset views`,
        'Book 2 weeks in advance for 15% savings',
        'Consider weekdays for lower prices'
      ],
      alternativeDestinations: ['Goa', 'Jaipur', 'Manali', 'Kerala', 'Udaipur'].filter(d => d.toLowerCase() !== (city || '').toLowerCase()).slice(0,3)
    };

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
};

export const chatWithNexis = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const lowerMsg = message.toLowerCase().trim();
    let reply = '';
    let quickReplies = [];
    let suggestedProperties = [];
    let action = null;
    let tripPlan = null;

    // Detect popular destinations
    const popularCities = ['goa', 'manali', 'jaipur', 'mumbai', 'kerala', 'udaipur', 'delhi', 'bangalore', 'shimla', 'rishikesh', 'ooty', 'pondicherry'];
    const matchedCity = popularCities.find(c => lowerMsg.includes(c));

    // Try finding properties in database if city or stay type is mentioned
    if (matchedCity || lowerMsg.includes('property') || lowerMsg.includes('villa') || lowerMsg.includes('stay') || lowerMsg.includes('hotel') || lowerMsg.includes('room') || lowerMsg.includes('apartment') || lowerMsg.includes('beach')) {
      try {
        const query = { isAvailable: true };
        if (matchedCity) {
          query['location.city'] = new RegExp(matchedCity, 'i');
        }
        if (lowerMsg.includes('villa')) query.propertyType = 'villa';
        else if (lowerMsg.includes('beach')) query.propertyType = 'beachfront';
        else if (lowerMsg.includes('apartment')) query.propertyType = 'apartment';
        else if (lowerMsg.includes('cabin')) query.propertyType = 'cabin';

        const foundProps = await Property.find(query).limit(3).select('title price location images propertyType rating bedrooms');
        if (foundProps && foundProps.length > 0) {
          suggestedProperties = foundProps.map(p => ({
            id: p._id,
            title: p.title,
            price: p.price,
            city: p.location?.city,
            type: p.propertyType,
            rating: p.rating?.average || 4.8,
            image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'
          }));
        }
      } catch (err) {
        console.error('Property search error in chatWithNexis:', err);
      }
    }

    // Determine intent and construct rich response:
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('namaste')) {
      reply = `Hello there! 👋 I am **Homexa**, your AI travel concierge for **Homexa** Stays & Travel.\n\nI can help you:\n• Find amazing stays (Villas, Beachfronts, Cabins, Apartments)\n• Plan custom trip itineraries with budget breakdowns\n• Guide you on bookings, payments & hosting\n\nWhere would you like to travel next? ✈️`;
      quickReplies = ['🏖️ Stays in Goa', '🏔️ Cabins in Manali', '🗺️ Plan a 3-Day Trip', '🏡 Become a Host'];
    } else if (matchedCity) {
      const cityName = matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
      reply = `Here are some wonderful recommendations for **${cityName}**! 🌴\n\n${cityName} is a fantastic destination known for scenic spots, vibrant culture, and unique stays.`;
      if (suggestedProperties.length > 0) {
        reply += `\n\nI found **${suggestedProperties.length} hand-picked properties** in ${cityName} available right now on Homexa:`;
      } else {
        reply += `\n\nYou can explore beachfront retreats, luxury private villas, and cozy homestays in ${cityName}. Would you like me to generate a complete daily itinerary or help you filter by budget?`;
      }
      quickReplies = [`💰 Budget stays in ${cityName}`, `🗺️ Plan ${cityName} itinerary`, `🏖️ Best beachfront villas`];
      action = { label: `Explore all ${cityName} stays`, link: `/properties?city=${cityName}` };
    } else if (lowerMsg.includes('trip') || lowerMsg.includes('itinerary') || lowerMsg.includes('plan')) {
      const targetDest = matchedCity 
        ? (matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1))
        : (lowerMsg.includes('manali') ? 'Manali' : lowerMsg.includes('jaipur') ? 'Jaipur' : lowerMsg.includes('kerala') ? 'Kerala' : 'Goa');
      
      const dayMatch = lowerMsg.match(/(\d+)\s*(?:day|days)/i);
      const parsedDays = dayMatch ? Math.min(Math.max(parseInt(dayMatch[1]), 2), 7) : 3;

      const generatedPlan = generateMockTripPlan({
        destination: targetDest,
        days: parsedDays,
        travelers: lowerMsg.includes('solo') ? 'Solo' : lowerMsg.includes('family') ? 'Family (4)' : '2 guests',
        interests: targetDest.toLowerCase() === 'manali' ? ['mountain', 'adventure'] : ['beach', 'food', 'culture'],
        budget: lowerMsg.includes('luxury') ? 'Luxury' : lowerMsg.includes('cheap') ? 'Budget' : 'Moderate'
      });

      reply = `I've prepared a customized **${generatedPlan.duration} itinerary for ${targetDest}**! 🗺️✨\n\nTake a look at your daily schedule, stay recommendations, estimated expenses, and packing essentials below. You can also customize days, interests, and budget in the **Trip Planner** tab above!`;
      quickReplies = [`🔍 Stays in ${targetDest}`, `🎒 Packing List`, `💰 Budget Details`, `🏖️ Plan another trip`];
      action = { label: `Customize ${targetDest} Trip`, actionType: 'open_planner', destination: targetDest, days: parsedDays };
      tripPlan = generatedPlan;
    } else if (lowerMsg.includes('host') || lowerMsg.includes('list property') || lowerMsg.includes('earn')) {
      reply = `Hosting on **Homexa** is simple and rewarding! 🏡💰\n\n**Key Host Benefits:**\n1. Earn extra income from your vacant home, villa, or room.\n2. You control pricing, calendar availability, and house rules.\n3. Secure online payments via Razorpay.\n4. AI-assisted listing description generator to attract more guests.\n\nReady to list your space?`;
      quickReplies = ['🏡 Create New Listing', '❓ What are host fees?', '📸 Photo upload tips'];
      action = { label: 'List Your Property', link: '/host/new' };
    } else if (lowerMsg.includes('pay') || lowerMsg.includes('payment') || lowerMsg.includes('upi') || lowerMsg.includes('qr') || lowerMsg.includes('refund') || lowerMsg.includes('cancel')) {
      reply = `**Payments & Bookings on Homexa:** 💳\n\n• **Accepted Methods:** UPI (Google Pay, PhonePe, Paytm), QR Code scan, Credit/Debit Cards, and Net Banking.\n• **Security:** 100% secure end-to-end encrypted checkout via Razorpay.\n• **Instant Confirmation:** Your booking confirmation & host contact details are provided immediately upon payment.\n• **Cancellation:** Flexible cancellation policy with full refunds up to 48 hours prior to check-in.`;
      quickReplies = ['📅 View My Bookings', '🔍 Browse Available Stays', '🛡️ Safety & Trust'];
      action = { label: 'View My Bookings', link: '/bookings' };
    } else if (lowerMsg.includes('discount') || lowerMsg.includes('coupon') || lowerMsg.includes('offer') || lowerMsg.includes('cheap') || lowerMsg.includes('budget')) {
      reply = `Looking for the best value? 🏷️\n\n• **Weekly Discount:** Many hosts offer 10%–20% off for 7+ day stays.\n• **Direct Booking:** No hidden convenience charges on Homexa.\n• **Budget Filter:** You can filter stays under ₹2,000/night with our price slider in the Stays catalog.`;
      quickReplies = ['🔍 Browse Budget Stays', '🏖️ Goa under ₹3000', '🏔️ Manali under ₹2500'];
      action = { label: 'Browse Budget Stays', link: '/properties?maxPrice=3000' };
    } else {
      reply = `Thanks for asking! As **Homexa**, your AI travel concierge, I'm here to ensure your journey is seamless. 🏡✨\n\nI can help you discover verified homestays, compare amenities like pools & Wi-Fi, create personalized travel itineraries, or assist with hosting and bookings.\n\nWhat would you like to explore next?`;
      quickReplies = ['🏖️ Top Beach Stays', '🏔️ Mountain Cabins', '🗺️ Plan a Trip', '🏡 Become a Host'];
    }

    res.json({
      success: true,
      reply,
      quickReplies,
      suggestedProperties,
      tripPlan,
      action,
      agent: {
        name: 'Homexa',
        avatar: 'robot',
        status: 'online'
      }
    });
  } catch (error) {
    console.error('Homexa chat error:', error);
    res.status(500).json({ success: false, message: 'Homexa is temporarily taking a breather. Please try again!' });
  }
};

export const chatWithHomexa = chatWithNexis;


