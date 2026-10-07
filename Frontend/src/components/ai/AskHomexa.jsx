import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiSend,
  FiRotateCcw,
  FiMinus,
  FiZap,
  FiExternalLink,
  FiCompass,
  FiMessageSquare,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiArrowLeft,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import api from '../../api/axios';

// Robot icon matching the user's design with cutout eyes and pixel smile
export const RobotIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="homexa-robot-mask">
      <rect width="24" height="24" fill="white" />
      {/* Square/Pixel Cutout Eyes */}
      <rect x="7" y="10" width="3" height="3" rx="0.6" fill="black" />
      <rect x="14" y="10" width="3" height="3" rx="0.6" fill="black" />
      {/* Pixel Smile Cutouts */}
      <rect x="7.5" y="15" width="2" height="1.8" rx="0.4" fill="black" />
      <rect x="9.5" y="16.2" width="5" height="1.8" rx="0.4" fill="black" />
      <rect x="14.5" y="15" width="2" height="1.8" rx="0.4" fill="black" />
    </mask>

    <g mask="url(#homexa-robot-mask)" fill={color}>
      {/* Antenna */}
      <rect x="11" y="2" width="2" height="3.5" rx="0.8" />
      <circle cx="12" cy="2.5" r="1.6" />
      {/* Ears */}
      <rect x="2" y="10" width="2" height="4.5" rx="1" />
      <rect x="20" y="10" width="2" height="4.5" rx="1" />
      {/* Head */}
      <rect x="4" y="5.5" width="16" height="14" rx="3.5" />
    </g>
  </svg>
);

const INITIAL_MESSAGE = {
  id: 'welcome-1',
  role: 'assistant',
  content: `👋 Hi! I'm **Homexa**, your personal AI concierge for **Homexa** Stays & Travel.\n\nI can help you find verified vacation homes, create custom travel itineraries, answer booking & payment questions, or guide you on hosting.\n\nHow can I help you today?`,
  quickReplies: [
    '🗺️ Plan a Trip',
    '🏖️ Stays in Goa',
    '🏔️ Cabins in Manali',
    '💳 UPI & QR Payments',
    '🏡 Become a Host'
  ],
  timestamp: new Date()
};

let msgSequence = 0;
const generateMessageId = (role) => `${role}-${Date.now()}-${++msgSequence}`;

// Client-side fallback trip generator in case server is offline or loading
const generateClientTripPlan = ({
  destination = 'Goa',
  days = 3,
  travelers = '2 guests',
  interests = ['beach', 'food'],
  budget = 'Moderate'
}) => {
  const interestMap = {
    beach: ['Sunrise beach walk', 'Water sports & jet ski', 'Seafood shack lunch', 'Sunset cruise & beach cafe'],
    mountain: ['Scenic ridge trek', 'Pine forest trail', 'Mountain cafe breakfast', 'Stargazing campfire'],
    culture: ['Heritage fort tour', 'Local artisan market', 'Ancient temple visit', 'Traditional dance evening'],
    food: ['Street food tasting walk', 'Cooking class with local host', 'Hidden gems cafe tour', 'Regional thali dinner'],
    adventure: ['River rafting expedition', 'Zip-lining canyon tour', 'Offroad jeep safari', 'Paragliding flight']
  };

  const selectedInterests = interests && interests.length ? interests : ['culture', 'food'];
  let pool = [];
  selectedInterests.forEach(i => {
    if (interestMap[i]) pool = [...pool, ...interestMap[i]];
  });
  if (pool.length === 0) pool = ['City exploration', 'Local market walk', 'Scenic sunset point', 'Authentic dinner'];

  const numDays = Math.min(Math.max(parseInt(days) || 3, 2), 7);
  const itinerary = [];

  for (let d = 1; d <= numDays; d++) {
    const dayActivities = [
      {
        time: '09:30 AM',
        activity: pool[(d * 3) % pool.length] || 'Morning sightseeing',
        duration: '2 hours',
        cost: '₹500 - ₹1,200',
        tip: 'Arrive early to beat morning crowds'
      },
      {
        time: '02:00 PM',
        activity: pool[(d * 3 + 1) % pool.length] || 'Afternoon experience',
        duration: '2.5 hours',
        cost: '₹400 - ₹900',
        tip: 'Try the local street coolers or fresh coconut water'
      },
      {
        time: '06:00 PM',
        activity: pool[(d * 3 + 2) % pool.length] || 'Sunset & evening stroll',
        duration: '2 hours',
        cost: '₹600 - ₹1,500',
        tip: 'Great spot for evening photography and relaxing'
      }
    ];

    itinerary.push({
      day: d,
      theme: d === 1 ? 'Arrival & Gentle Exploration' : d === numDays ? 'Farewell & Cultural Highlights' : `Destination Discovery Day ${d}`,
      activities: dayActivities,
      staySuggestion: `Top-rated verified homestays & villas in ${destination}`,
      foodSuggestion: d % 2 === 0 ? 'Local family thali & regional street bites' : 'Beachfront/rooftop cafe with fresh seasonal cuisine'
    });
  }

  const budgetLabel = budget.includes('Budget') ? 'Budget - ₹3,000/day' : budget.includes('Luxury') ? 'Luxury - ₹12,000/day' : 'Moderate - ₹6,000/day';
  const dailyAccom = budget.includes('Luxury') ? 8000 : budget.includes('Budget') ? 2000 : 4200;

  return {
    destination: destination || 'Goa',
    duration: `${numDays} days`,
    travelers: travelers || '2 guests',
    budget: budgetLabel,
    overview: `Your personalized ${numDays}-day getaway to ${destination || 'your dream destination'} is tailored for ${travelers}, focusing on ${selectedInterests.join(', ')}. Enjoy a balanced mix of iconic attractions, authentic flavors, and relaxing homestay stays!`,
    itinerary,
    packingList: [
      'Comfortable walking footwear',
      'Sunscreen & UV sunglasses',
      'Power bank & charging cables',
      'Government photo ID & booking slips',
      'Light breathable outfits',
      'Reusable water flask'
    ],
    budgetBreakdown: {
      accommodation: `₹${(numDays * dailyAccom).toLocaleString('en-IN')}`,
      food: `₹${(numDays * 1600).toLocaleString('en-IN')}`,
      activities: `₹${(numDays * 2200).toLocaleString('en-IN')}`,
      transport: `₹${(numDays * 1100).toLocaleString('en-IN')}`,
      total: `₹${(numDays * (dailyAccom + 4900)).toLocaleString('en-IN')}`
    },
    localTips: [
      `Best time to explore outdoor sights in ${destination} is before 11:00 AM.`,
      'Book homestays early to secure properties with verified superhosts.',
      'Keep UPI apps handy (GPay, PhonePe, Paytm) — widely accepted at cafes & transport.',
      'Check local timings for night markets and museum entries.'
    ]
  };
};

// Client-side fallback intelligence in case backend is offline or loading
const getFallbackResponse = (query) => {
  const q = query.toLowerCase();

  if (q.includes('trip') || q.includes('plan') || q.includes('itinerary')) {
    const dest = q.includes('manali') ? 'Manali' : q.includes('jaipur') ? 'Jaipur' : q.includes('kerala') ? 'Kerala' : 'Goa';
    const plan = generateClientTripPlan({ destination: dest, days: 3 });
    return {
      content: `I've prepared a customized **${plan.duration} itinerary for ${dest}**! 🗺️✨\n\nTake a look at your daily schedule, stay recommendations, estimated expenses, and packing essentials below. You can also customize days, interests, and budget in the **Trip Planner** tab above!`,
      tripPlan: plan,
      quickReplies: [`🔍 View ${dest} Stays`, '✈️ Customize Trip', '🎒 Packing List', '💰 Budget Details'],
      action: { label: `Customize ${dest} Trip`, actionType: 'open_planner', destination: dest }
    };
  }

  if (q.includes('goa')) {
    return {
      content: `🌴 **Goa Stays & Recommendations:**\n\nGoa has some of our highest-rated beach villas and luxury apartments:\n• **North Goa (Anjuna, Vagator):** Vibrant nightlife, beach clubs, and cafes.\n• **South Goa (Palolem, Colva):** Serene, peaceful beaches and private luxury villas.\n\nWould you like to browse our available Goa properties or generate a 3-day itinerary?`,
      quickReplies: ['🗺️ Plan 3-day Goa trip', '🔍 View Goa Stays', '💰 Budget stays under ₹3000'],
      action: { label: 'Explore Goa Properties', link: '/properties?city=Goa' }
    };
  }

  if (q.includes('manali') || q.includes('mountain') || q.includes('cabin') || q.includes('snow')) {
    return {
      content: `🏔️ **Manali & Mountain Escapes:**\n\nDiscover scenic wooden cottages and mountain retreats with panoramic Himalayan views, indoor fireplaces, and high-speed Wi-Fi for workation or getaways!`,
      quickReplies: ['🗺️ Plan Manali Trek Itinerary', '🔍 View Manali Stays', '🔥 Cabins with Fireplace'],
      action: { label: 'Browse Manali Stays', link: '/properties?city=Manali' }
    };
  }

  if (q.includes('host') || q.includes('list') || q.includes('earn')) {
    return {
      content: `🏡 **Become a Host on Homexa:**\n\n1. **Zero listing fees:** List your apartment, villa, or spare room in minutes.\n2. **AI listing descriptions:** Let our AI craft catchy descriptions for you.\n3. **Full control:** You decide your calendar, prices, and house rules.\n4. **Secure payouts:** Fast & direct bank payouts via Razorpay.`,
      quickReplies: ['🏡 Create Listing Now', '❓ Host FAQ', '📸 Photo Tips'],
      action: { label: 'Start Hosting', link: '/host/new' }
    };
  }

  if (q.includes('pay') || q.includes('payment') || q.includes('upi') || q.includes('qr') || q.includes('card') || q.includes('refund') || q.includes('cancel')) {
    return {
      content: `💳 **Payments & Cancellation on Homexa:**\n\n• **Supported Methods:** UPI (Google Pay, PhonePe, Paytm), Dynamic QR Code, Cards, and Net Banking.\n• **Security:** End-to-end encrypted checkout powered by Razorpay.\n• **Cancellation:** Free cancellation up to 48 hours before check-in with 100% instant refund.`,
      quickReplies: ['📅 View My Bookings', '🔍 Browse Available Stays'],
      action: { label: 'View My Bookings', link: '/bookings' }
    };
  }

  if (q.includes('budget') || q.includes('cheap') || q.includes('price') || q.includes('discount')) {
    return {
      content: `💰 **Best Budget Deals:**\n\n• Stays starting from ₹999/night\n• Enjoy up to 15% discount on weekly bookings (7+ nights)\n• Use the price filter in the Stays tab to set your exact budget!`,
      quickReplies: ['🔍 Stays under ₹2500', '🏖️ Budget Beach Stays'],
      action: { label: 'Browse Budget Stays', link: '/properties?maxPrice=3000' }
    };
  }

  return {
    content: `I'm happy to help you with anything on **Homexa**! 🌟\n\nYou can ask me to:\n• Plan day-by-day custom trip itineraries\n• Suggest destinations and stays\n• Help with bookings, UPI payments & cancellations\n• Guide you on listing your own property`,
    quickReplies: ['🗺️ Plan a Trip', '🏖️ Beachfront Stays', '🏔️ Mountain Cabins', '🏡 List a Property']
  };
};

const interestOptions = [
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'mountain', label: 'Mountain', icon: '🏔️' },
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'adventure', label: 'Adventure', icon: '🪂' }
];

const AskHomexa = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'planner'
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Trip planner form state
  const [tripForm, setTripForm] = useState({
    destination: '',
    days: 3,
    travelers: '2 guests',
    interests: ['beach', 'food'],
    budget: 'Moderate - ₹6000/day'
  });
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [packedItems, setPackedItems] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, activeTab]);

  // Global listener to trigger Ask Homexa and switch to planner from anywhere in the app
  useEffect(() => {
    const handleOpenHomexa = (e) => {
      setIsDismissed(false);
      setIsOpen(true);
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
      if (e.detail?.destination) {
        setTripForm(prev => ({ ...prev, destination: e.detail.destination }));
      }
    };

    window.addEventListener('open-homexa', handleOpenHomexa);
    return () => window.removeEventListener('open-homexa', handleOpenHomexa);
  }, []);

  const handleInterestToggle = (id) => {
    setTripForm(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleGenerateTripPlan = async (e) => {
    if (e) e.preventDefault();
    if (!tripForm.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    setPlannerLoading(true);
    try {
      const res = await api.post('/ai/trip-planner', tripForm);
      if (res.data && res.data.plan) {
        setCurrentPlan(res.data.plan);
      } else {
        throw new Error('No plan in response');
      }
    } catch (plannerErr) {
      console.warn('AI trip planner using client fallback:', plannerErr?.message);
      // Fallback generator
      const fallbackPlan = generateClientTripPlan({
        destination: tripForm.destination,
        days: tripForm.days,
        travelers: tripForm.travelers,
        interests: tripForm.interests,
        budget: tripForm.budget
      });
      setCurrentPlan(fallbackPlan);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    // Check if user specifically requested to switch to planner or plan trip
    if (text.toLowerCase() === '🗺️ plan a trip' || text.toLowerCase() === 'plan a trip') {
      setActiveTab('planner');
      setInputValue('');
      return;
    }

    const userMessage = {
      id: generateMessageId('user'),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
      });

      if (response.data && response.data.reply) {
        const assistantMessage = {
          id: generateMessageId('bot'),
          role: 'assistant',
          content: response.data.reply,
          quickReplies: response.data.quickReplies || [],
          suggestedProperties: response.data.suggestedProperties || [],
          tripPlan: response.data.tripPlan || null,
          action: response.data.action || null,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // If a trip plan was generated, sync with planner state too
        if (response.data.tripPlan) {
          setCurrentPlan(response.data.tripPlan);
        }
      } else {
        throw new Error('No reply from server');
      }
    } catch (chatErr) {
      console.warn('AI chat using client fallback:', chatErr?.message);
      // Graceful fallback to client knowledge
      const fallback = getFallbackResponse(text);
      const assistantMessage = {
        id: generateMessageId('bot'),
        role: 'assistant',
        content: fallback.content,
        quickReplies: fallback.quickReplies || [],
        tripPlan: fallback.tripPlan || null,
        action: fallback.action || null,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (fallback.tripPlan) {
        setCurrentPlan(fallback.tripPlan);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleActionClick = (action) => {
    if (!action) return;

    if (action.actionType === 'open_planner' || action.link === '/trip-planner') {
      setActiveTab('planner');
      if (action.destination) {
        setTripForm(prev => ({
          ...prev,
          destination: action.destination,
          days: action.days || prev.days
        }));
      }
      return;
    }

    if (action.link) {
      setIsOpen(false);
      if (action.link.startsWith('http')) {
        window.open(action.link, '_blank');
      } else {
        navigate(action.link);
      }
    }
  };

  const togglePackingCheck = (item) => {
    setPackedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const openPlanInChat = (plan) => {
    setActiveTab('chat');
    handleSendMessage(`Tell me more about the itinerary for ${plan.destination}. Any local secrets or best cafes?`);
  };

  return (
    <>
      {/* Floating Widget Container in Bottom Right */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none">
        
        {/* Chat / Planner Window Dialog */}
        {isOpen && (
          <div 
            className="w-[calc(100vw-2rem)] sm:w-[420px] md:w-[460px] h-[580px] max-h-[82vh] bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden mb-3 animate-slide-up"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#626bf7] to-[#747efa] p-4 text-white shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <RobotIcon className="w-6 h-6 text-white" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[16px] leading-tight">Homexa</h3>
                      <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">AI Concierge</span>
                    </div>
                    <p className="text-[12px] text-white/80 leading-tight">Homexa Travel & Stays Assistant</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activeTab === 'chat' && (
                    <button
                      onClick={handleResetChat}
                      title="Reset conversation"
                      className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
                    >
                      <FiRotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Minimize"
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mode Tabs Switcher */}
              <div className="flex items-center bg-black/15 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-white text-[#626bf7] shadow-sm scale-100'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiMessageSquare className="w-3.5 h-3.5" />
                  Chat Concierge
                </button>
                <button
                  onClick={() => setActiveTab('planner')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'planner'
                      ? 'bg-white text-[#626bf7] shadow-sm scale-100'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiZap className="w-3.5 h-3.5 text-amber-300" />
                  AI Trip Planner
                </button>
              </div>
            </div>

            {/* TAB 1: CHAT CONCIERGE */}
            {activeTab === 'chat' && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/70 to-white dark:from-gray-900/90 dark:to-gray-950">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[90%]">
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-xl bg-[#6875f5] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <RobotIcon className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-[#626bf7] text-white rounded-tr-none font-medium'
                              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-line">
                            {msg.content.split('\n').map((line, i) => {
                              const formattedLine = line.split(/(\*\*.*?\*\*)/).map((segment, j) => {
                                if (segment.startsWith('**') && segment.endsWith('**')) {
                                  return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{segment.slice(2, -2)}</strong>;
                                }
                                return segment;
                              });
                              return <div key={i} className={line === '' ? 'h-2' : ''}>{formattedLine}</div>;
                            })}
                          </div>

                          {/* Inline Trip Plan Preview Card in Chat */}
                          {msg.tripPlan && (
                            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/60 border border-violet-200/80 shadow-xs">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base">🗺️</span>
                                  <h4 className="font-bold text-xs text-gray-900">
                                    {msg.tripPlan.destination} • {msg.tripPlan.duration}
                                  </h4>
                                </div>
                                <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                  {msg.tripPlan.budget}
                                </span>
                              </div>

                              <p className="text-[11px] text-gray-600 leading-relaxed mb-3 line-clamp-2">
                                {msg.tripPlan.overview}
                              </p>

                              {/* Daily highlights preview */}
                              <div className="space-y-1.5 mb-3">
                                {msg.tripPlan.itinerary?.slice(0, 3).map((day) => (
                                  <div key={day.day} className="flex items-center gap-2 text-[11px] text-gray-700 bg-white/80 p-1.5 rounded-lg border border-violet-100">
                                    <span className="font-bold text-violet-700 w-5">D{day.day}</span>
                                    <span className="truncate flex-1 font-medium">{day.theme}</span>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={() => {
                                  setCurrentPlan(msg.tripPlan);
                                  setActiveTab('planner');
                                }}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#626bf7] hover:bg-[#525cf5] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                              >
                                <FiZap className="w-3.5 h-3.5" />
                                View Full Day-by-Day Plan
                              </button>
                            </div>
                          )}

                          {/* Attached Suggested Properties */}
                          {msg.suggestedProperties && msg.suggestedProperties.length > 0 && (
                            <div className="mt-3 space-y-2 pt-2 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommended Stays:</p>
                              <div className="grid gap-2">
                                {msg.suggestedProperties.map((prop) => (
                                  <div
                                    key={prop.id}
                                    onClick={() => handleActionClick({ link: `/properties/${prop.id}` })}
                                    className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-violet-50/60 border border-gray-200/70 hover:border-violet-300 cursor-pointer transition-all group"
                                  >
                                    <img
                                      src={prop.image}
                                      alt={prop.title}
                                      className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-violet-700">{prop.title}</p>
                                      <p className="text-[11px] text-gray-500">{prop.city} • ★ {prop.rating}</p>
                                      <p className="text-xs font-bold text-violet-600">₹{prop.price?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-500">/night</span></p>
                                    </div>
                                    <FiExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Direct Call to Action button */}
                          {msg.action && (
                            <button
                              onClick={() => handleActionClick(msg.action)}
                              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 transition-colors cursor-pointer"
                            >
                              <FiCompass className="w-3.5 h-3.5" />
                              {msg.action.label}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Replies chips */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-9 max-w-[85%]">
                          {msg.quickReplies.map((reply, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(reply)}
                              className="text-xs bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-violet-700 dark:hover:text-white font-medium px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all shadow-2xs hover:scale-102 active:scale-98 cursor-pointer"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {loading && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#6875f5] text-white flex items-center justify-center shadow-sm">
                        <RobotIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Homexa about stays, trips, budget..."
                      className="flex-1 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 focus:border-[#626bf7] focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || loading}
                      className="w-10 h-10 rounded-full bg-[#626bf7] hover:bg-[#525cf5] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                    >
                      <FiSend className="w-4 h-4" />
                    </button>
                  </form>
                  <div className="flex items-center justify-center gap-1 mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                    <FiZap className="w-3 h-3 text-violet-500" />
                    <span>Powered by Homexa AI Concierge</span>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: AI TRIP PLANNER IN HOMEXA */}
            {activeTab === 'planner' && (
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/70 to-white dark:from-gray-900/90 dark:to-gray-950 flex flex-col">
                {!currentPlan ? (
                  /* Form View inside Homexa */
                  <div className="p-4 space-y-4">
                    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950/40 border border-violet-200/80 dark:border-violet-800/40 rounded-2xl p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider mb-1">
                        <FiZap className="w-3.5 h-3.5" /> AI Itinerary Engine
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">Where do you want to travel?</h4>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">Tell Homexa your destination and preferences for a custom day-wise itinerary.</p>
                    </div>

                    <form onSubmit={handleGenerateTripPlan} className="space-y-3.5">
                      {/* Destination */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Destination *
                        </label>
                        <input
                          type="text"
                          required
                          value={tripForm.destination}
                          onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                          placeholder="e.g. Goa, Manali, Jaipur, Kerala"
                          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-[#626bf7] focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all shadow-2xs"
                        />
                        {/* Quick destination suggestion chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['Goa', 'Manali', 'Jaipur', 'Kerala', 'Udaipur', 'Ooty'].map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setTripForm({ ...tripForm, destination: city })}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                tripForm.destination.toLowerCase() === city.toLowerCase()
                                  ? 'bg-[#626bf7] text-white border-[#626bf7]'
                                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-400'
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Days & Travelers */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FiCalendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Days
                          </label>
                          <select
                            value={tripForm.days}
                            onChange={(e) => setTripForm({ ...tripForm, days: Number(e.target.value) })}
                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-[#626bf7] outline-none shadow-2xs cursor-pointer"
                          >
                            <option value={2}>2 Days</option>
                            <option value={3}>3 Days</option>
                            <option value={4}>4 Days</option>
                            <option value={5}>5 Days</option>
                            <option value={7}>7 Days</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FiUsers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Travelers
                          </label>
                          <select
                            value={tripForm.travelers}
                            onChange={(e) => setTripForm({ ...tripForm, travelers: e.target.value })}
                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-[#626bf7] outline-none shadow-2xs cursor-pointer"
                          >
                            <option value="Solo">Solo Traveler</option>
                            <option value="2 guests">2 Guests (Couple/Friends)</option>
                            <option value="Family (4)">Family (4 guests)</option>
                            <option value="Group (6+)">Group (6+ guests)</option>
                          </select>
                        </div>
                      </div>

                      {/* Interests */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Travel Interests
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {interestOptions.map((opt) => {
                            const isSelected = tripForm.interests.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleInterestToggle(opt.id)}
                                className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-2xs'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                          <FiDollarSign className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Daily Budget
                        </label>
                        <select
                          value={tripForm.budget}
                          onChange={(e) => setTripForm({ ...tripForm, budget: e.target.value })}
                          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-[#626bf7] outline-none shadow-2xs cursor-pointer"
                        >
                          <option value="Budget - ₹3000/day">Budget • ~₹3,000 / day</option>
                          <option value="Moderate - ₹6000/day">Moderate • ~₹6,000 / day</option>
                          <option value="Luxury - ₹12000/day">Luxury • ~₹12,000 / day</option>
                        </select>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={plannerLoading}
                        className="w-full py-3 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-[#626bf7] hover:from-violet-700 hover:to-[#525cf5] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {plannerLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Crafting your trip itinerary...</span>
                          </>
                        ) : (
                          <>
                            <FiZap className="w-4 h-4 text-amber-300" />
                            <span>Generate AI Itinerary</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Plan Output View inside Homexa */
                  <div className="p-4 space-y-4">
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setCurrentPlan(null)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5" /> Back to Planner Form
                      </button>
                      <button
                        onClick={() => openPlanInChat(currentPlan)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 cursor-pointer"
                      >
                        <FiMessageSquare className="w-3.5 h-3.5" /> Ask in Chat
                      </button>
                    </div>

                    {/* Header Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#626bf7] to-[#747efa] text-white shadow-md">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-lg leading-tight">
                          {currentPlan.destination} • {currentPlan.duration}
                        </h3>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                          {currentPlan.travelers}
                        </span>
                      </div>
                      <p className="text-white/90 text-xs leading-relaxed mb-3">
                        {currentPlan.overview}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[11px] bg-black/20 px-2.5 py-1 rounded-full font-medium">
                        💰 {currentPlan.budget}
                      </div>
                    </div>

                    {/* Day by Day Cards */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Day-by-Day Itinerary</h4>
                      {currentPlan.itinerary?.map((day) => (
                        <div key={day.day} className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              D{day.day}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">Day {day.day}: {day.theme}</h5>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">🍜 {day.foodSuggestion}</p>
                            </div>
                          </div>

                          {/* Activities */}
                          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                            {day.activities?.map((act, i) => (
                              <div key={i} className="flex gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-xs">
                                <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-white dark:bg-gray-700 border border-violet-100 dark:border-violet-900 px-1.5 py-0.5 rounded-md h-fit shrink-0">
                                  {act.time}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-[12px]">{act.activity}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                                    <FiClock className="w-3 h-3 text-gray-400" />
                                    <span>{act.duration}</span>
                                    <span>•</span>
                                    <span>{act.cost}</span>
                                  </p>
                                  {act.tip && (
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">💡 {act.tip}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="text-[10px] text-gray-500 dark:text-gray-400 italic bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100/70 dark:border-amber-900/40 p-2 rounded-xl">
                            🏠 {day.staySuggestion}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Budget Breakdown */}
                    {currentPlan.budgetBreakdown && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-2xs">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                          <span>💰</span> Estimated Budget Breakdown
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {Object.entries(currentPlan.budgetBreakdown).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                              <span className="capitalize">{k}</span>
                              <span className={`font-semibold ${k === 'total' ? 'text-violet-700 dark:text-violet-400 font-bold' : 'text-gray-900 dark:text-white'}`}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Packing Checklist */}
                    {currentPlan.packingList && currentPlan.packingList.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-2xs">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                          <span>🎒</span> Packing Essentials
                        </h4>
                        <div className="space-y-1.5">
                          {currentPlan.packingList.map((item, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => togglePackingCheck(item)}
                              className="w-full flex items-center gap-2 text-left text-xs text-gray-700 dark:text-gray-300 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              {packedItems[item] ? (
                                <FiCheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <FiSquare className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                              <span className={packedItems[item] ? 'line-through text-gray-400 dark:text-gray-500' : ''}>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Local Tips */}
                    {currentPlan.localTips && currentPlan.localTips.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-2xs">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                          <span>💡</span> Homexa Local Insights
                        </h4>
                        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                          {currentPlan.localTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-violet-500 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bottom CTA Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => handleActionClick({ link: `/properties?city=${currentPlan.destination}` })}
                        className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <FiCompass className="w-3.5 h-3.5" />
                        Explore Verified Stays in {currentPlan.destination}
                      </button>

                      <button
                        onClick={() => openPlanInChat(currentPlan)}
                        className="w-full py-2.5 px-4 rounded-xl text-violet-700 dark:text-violet-300 font-semibold text-xs bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-violet-200 dark:border-violet-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FiMessageSquare className="w-3.5 h-3.5" />
                        Discuss & Refine this Trip with Homexa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* The Exact "Ask Homexa" Pill Button matching user image */}
        {!isDismissed ? (
          <div className="relative group">
            {/* The Floating Pill Button */}
            <button
              onClick={() => setIsOpen(prev => !prev)}
              aria-label="Ask Homexa AI"
              className="relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#6875f5] hover:bg-[#5b68f5] text-white font-semibold text-[16px] tracking-wide shadow-[0_8px_25px_rgba(104,117,245,0.45)] hover:shadow-[0_12px_32px_rgba(104,117,245,0.55)] transition-all duration-200 hover:scale-103 active:scale-98 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6c76f8 0%, #606af7 100%)'
              }}
            >
              <RobotIcon className="w-6 h-6 text-white shrink-0 drop-shadow-sm" />
              <span className="font-semibold text-white tracking-wide">Ask Homexa</span>
            </button>

            {/* Small circular Black Close Badge in Top-Right Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              title="Dismiss"
              aria-label="Dismiss button"
              className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-neutral-800 transition-transform hover:scale-110 active:scale-90 z-10 cursor-pointer"
            >
              <FiX className="w-3 h-3 text-white stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Sleek Mini Robot Floating Bubble when dismissed */
          <button
            onClick={() => {
              setIsDismissed(false);
              setIsOpen(true);
            }}
            title="Chat with Homexa AI"
            className="w-12 h-12 rounded-full bg-[#6875f5] hover:bg-[#5b68f5] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(104,117,245,0.4)] hover:scale-110 active:scale-95 transition-all duration-200 group cursor-pointer relative"
          >
            <RobotIcon className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
          </button>
        )}
      </div>
    </>
  );
};

export default AskHomexa;
