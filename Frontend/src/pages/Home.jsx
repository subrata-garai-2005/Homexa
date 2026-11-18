import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../store/slices/propertySlice';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilters from '../components/property/SearchFilters';
import { FiArrowRight, FiStar, FiShield, FiZap, FiMapPin, FiTrendingUp, FiUsers, FiGlobe } from 'react-icons/fi';
import { useReveal, useCountUp } from '../utils/useReveal';
import SEO from '../components/common/SEO';

const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>
      {children}
    </Tag>
  );
};

const Stat = ({ icon: Icon, target, decimals = 0, suffix = '', label }) => {
  const [ref, value] = useCountUp(target);
  return (
    <div ref={ref} className="flex items-center gap-3.5 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-stone-200">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg sm:text-xl font-semibold tabular-nums leading-none text-white">
          {value.toFixed(decimals)}{suffix}
        </p>
        <p className="text-xs text-stone-300/80 mt-1">{label}</p>
      </div>
    </div>
  );
};

const featuredCities = [
  { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800', count: '120+ stays', span: 'lg:col-span-2 lg:row-span-2' },
  { name: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800', count: '85+ stays', span: '' },
  { name: 'Manali', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800', count: '64+ stays', span: '' },
  { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800', count: '92+ stays', span: 'lg:col-span-2' },
];

const features = [
  {
    icon: FiShield,
    title: 'Verified Hospitality',
    desc: 'Every stay is personally inspected for architectural quality, comfort, and verified hosts.',
  },
  {
    icon: FiZap,
    title: 'Homexa Concierge',
    desc: 'Custom day-by-day itineraries, authentic local recommendations, and 24/7 travel concierge.',
  },
  {
    icon: FiMapPin,
    title: 'Curated Neighbourhoods',
    desc: 'Explore scenic stays with walkable highlights, secluded spots, and local insights.',
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { properties, loading } = useSelector(s => s.properties);

  useEffect(() => {
    dispatch(fetchProperties({ limit: 8 }));
  }, [dispatch]);

  const handleSearch = (filters) => {
    dispatch(fetchProperties({ ...filters, limit: 12 }));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Vacation Rentals, Luxury Villas & Unique Stays"
        description="Discover and book handpicked vacation rentals, beachfront villas, cozy mountain cabins, and modern apartments with Homexa. Instant booking and verified hosts."
        keywords="vacation rentals, holiday homes, luxury villas, homestay, rent apartments, travel booking, Homexa, villas in Goa, homestays in Manali"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "Homexa",
              "url": typeof window !== 'undefined' ? window.location.origin : '',
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : ''}/properties?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "Homexa",
              "url": typeof window !== 'undefined' ? window.location.origin : '',
              "logo": `${typeof window !== 'undefined' ? window.location.origin : ''}/assets/logo.png`
            }
          ]
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#141210] text-white isolate">
        {/* Real Architectural / Vacation Photography Background with Warm Tone Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        {/* Soft, natural warm stone gradient masks (no neon orbs, no grids) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/60 to-[#141210]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/80 via-transparent to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36">
          <div className="max-w-2xl">
            {/* Quiet, credible context badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-stone-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Curated collection of 5,000+ verified stays</span>
            </div>

            {/* Solid, confident headline without gradient clips */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[68px] font-semibold leading-[1.08] sm:leading-[1.04] tracking-tight text-white">
              Handpicked homes with authentic character
            </h1>

            {/* Honest, calm subhead */}
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl">
              Villas, coastal retreats, and architectural cabins. Verified for comfort and design, with 24/7 travel concierge.
            </p>

            {/* Quiet, deliberate actions */}
            <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/properties"
                id="hero-explore-btn"
                className="bg-white text-stone-900 hover:bg-stone-100 px-7 py-3.5 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
              >
                Explore stays <FiArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                id="hero-homexa-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('open-homexa', { detail: { tab: 'planner' } }))}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-7 py-3.5 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <FiZap className="w-4 h-4 text-amber-300" /> Plan with Homexa AI
              </button>
            </div>

            {/* Grounded social proof stats */}
            <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <Stat icon={FiStar} target={4.8} decimals={1} suffix="/5" label="Average rating" />
              <Stat icon={FiUsers} target={10} suffix="k+" label="Guests hosted" />
              <Stat icon={FiGlobe} target={50} suffix="+" label="Destinations" />
            </div>
          </div>
        </div>
      </section>

      {/* Search (clean offset overlapping hero) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <SearchFilters onSearch={handleSearch} />
      </div>

      {/* Featured properties */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Handpicked</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-white">Featured stays</h2>
            <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm sm:text-base">Homes recognized for exceptional architecture and hospitality</p>
          </div>
          <Link to="/properties" className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[20/19] rounded-2xl shimmer" />
                <div className="h-4 rounded shimmer" />
                <div className="h-3 rounded w-2/3 shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {properties.slice(0, 8).map((property, i) => (
              <Reveal key={property._id} delay={(i % 4) * 60}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Cities — Bento Grid with natural depth */}
      <section className="bg-stone-50/80 dark:bg-stone-900/40 border-y border-stone-200/60 dark:border-stone-800/80 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Destinations</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-10 text-stone-900 dark:text-white">Popular destinations</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[460px]">
            {featuredCities.map((city, i) => (
              <Reveal key={city.name} delay={i * 60} className={`${city.span} h-48 lg:h-auto`}>
                <Link
                  to={`/properties?city=${city.name}`}
                  className="group relative block h-full rounded-2xl overflow-hidden"
                >
                  <img
                    src={city.img}
                    alt={city.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                    <div>
                      <h3 className="font-semibold text-lg sm:text-xl leading-tight">{city.name}</h3>
                      <p className="text-xs sm:text-sm text-stone-300 mt-0.5">{city.count}</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiArrowRight className="w-4 h-4 text-white" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Quiet, Craft-first Cards */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="h-full rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 p-8 transition-colors hover:border-stone-300 dark:hover:border-stone-700">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mb-6">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-stone-900 dark:text-white">{f.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA — Warm Architectural Host Banner */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Reveal>
          <div className="rounded-3xl bg-[#181614] text-white p-8 lg:p-14 border border-stone-800 relative overflow-hidden">
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-3">Hosting with Homexa</p>
                <h2 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-white">Share your home with travelers who care</h2>
                <p className="text-stone-400 mt-3 text-sm sm:text-base leading-relaxed">
                  List your property in minutes. Verified guests, dedicated host protection, and 24/7 concierge support.
                </p>
              </div>
              <Link
                to="/host/new"
                id="cta-start-hosting"
                className="bg-white text-stone-900 hover:bg-stone-100 px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2 text-sm sm:text-base shrink-0 shadow-sm"
              >
                <FiTrendingUp className="w-4 h-4" /> Start hosting
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
