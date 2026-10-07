import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../store/slices/propertySlice';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilters from '../components/property/SearchFilters';
import { FiArrowRight, FiStar, FiShield, FiZap, FiMapPin, FiTrendingUp, FiUsers, FiGlobe } from 'react-icons/fi';
import { useReveal, useCountUp } from '../utils/useReveal';

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
    <div ref={ref} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg sm:text-xl font-bold tabular-nums leading-none">
          {value.toFixed(decimals)}{suffix}
        </p>
        <p className="text-[11px] sm:text-xs text-white/70 mt-1">{label}</p>
      </div>
    </div>
  );
};

const featuredCities = [
  { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600', count: '120+ stays', span: 'lg:col-span-2 lg:row-span-2' },
  { name: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600', count: '85+ stays', span: '' },
  { name: 'Manali', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600', count: '64+ stays', span: '' },
  { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600', count: '92+ stays', span: 'lg:col-span-2' },
];

const features = [
  { icon: FiShield, title: 'Verified stays', desc: 'Every property is verified by our team for quality and safety.', grad: 'from-emerald-500 to-teal-500' },
  { icon: FiZap, title: 'Homexa AI Concierge', desc: 'Smart day-by-day itineraries, instant recommendations, and 24/7 travel concierge.', grad: 'from-amber-500 to-orange-500' },
  { icon: FiMapPin, title: 'Map exploration', desc: 'Discover hidden gems with interactive maps and local insights.', grad: 'from-sky-500 to-indigo-500' },
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B0F19] text-white isolate">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-25 scale-105" />
        {/* Aurora blobs */}
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary-500/40 blur-[110px] animate-blob -z-0" />
        <div className="absolute top-10 right-[-10rem] w-[30rem] h-[30rem] rounded-full bg-violet-600/40 blur-[110px] animate-blob-slow" />
        <div className="absolute bottom-[-12rem] left-1/3 w-[28rem] h-[28rem] rounded-full bg-sky-500/30 blur-[110px] animate-blob" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/30 to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 sm:pt-20 sm:pb-32 lg:pt-28 lg:pb-40">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3.5 py-1 text-xs sm:text-sm mb-5 sm:mb-7">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              AI-powered search live • 5000+ verified homes
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-bold leading-[1.05] sm:leading-[0.98] tracking-tight">
              Find your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-fuchsia-400 to-violet-400 bg-[length:200%_auto] animate-gradient-pan">
                perfect stay
              </span>
              <br className="hidden sm:block" /> anywhere
            </h1>
            <p className="mt-5 sm:mt-7 text-sm sm:text-lg text-gray-300 leading-relaxed max-w-xl">
              Curated villas, cabins, beachfront homes and unique stays. Instant booking, verified hosts, and Homexa AI concierge.
            </p>
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/properties"
                id="hero-explore-btn"
                className="group relative overflow-hidden bg-white text-gray-900 px-7 py-3.5 rounded-full font-semibold transition-all hover:shadow-[0_0_40px_-5px_rgba(255,56,92,0.6)] flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Explore stays <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                type="button"
                id="hero-homexa-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('open-homexa', { detail: { tab: 'planner' } }))}
                className="bg-white/10 backdrop-blur border border-white/20 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <FiZap className="text-amber-300" /> Plan with Homexa AI
              </button>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 max-w-2xl">
              <Stat icon={FiStar} target={4.8} decimals={1} suffix="/5" label="Average rating" />
              <Stat icon={FiUsers} target={10} suffix="k+" label="Happy guests" />
              <Stat icon={FiGlobe} target={50} suffix="+" label="Cities" />
            </div>
          </div>
        </div>
      </section>

      {/* Search (glass, overlapping hero) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="animate-slide-up [animation-delay:150ms] [animation-fill-mode:both]">
          <SearchFilters onSearch={handleSearch} />
        </div>
      </div>

      {/* Featured properties */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2">Handpicked</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Featured stays</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Homes with exceptional hospitality</p>
          </div>
          <Link to="/properties" className="hidden md:flex items-center gap-2 text-sm font-semibold hover:text-primary-600 transition-colors group">
            View all <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
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
              <Reveal key={property._id} delay={(i % 4) * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Cities — bento grid */}
      <section className="bg-white dark:bg-gray-900/60 border-y border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2">Trending</p>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">Popular destinations</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[460px]">
            {featuredCities.map((city, i) => (
              <Reveal key={city.name} delay={i * 80} className={`${city.span} h-48 lg:h-auto`}>
                <Link
                  to={`/properties?city=${city.name}`}
                  className="group relative block h-full rounded-3xl overflow-hidden"
                >
                  <img src={city.img} alt={city.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <h3 className="font-semibold text-xl">{city.name}</h3>
                      <p className="text-sm text-white/80">{city.count}</p>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <FiArrowRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — spotlight cards */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="group relative h-full card p-7 hover:-translate-y-1 hover:shadow-large transition-all duration-300">
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${f.grad} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.grad} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="relative font-semibold text-lg mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                <p className="relative text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="rounded-[32px] bg-gray-900 text-white p-8 lg:p-12 relative overflow-hidden isolate">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/30 blur-3xl animate-blob" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-violet-600/25 blur-3xl animate-blob-slow" />
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Become a host and earn</h2>
                <p className="text-gray-400 mt-3 max-w-xl">List your property in minutes, get AI-generated descriptions, and reach thousands of travelers.</p>
              </div>
              <Link
                to="/host/new"
                id="cta-start-hosting"
                className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-semibold hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2 shrink-0"
              >
                <FiTrendingUp /> Start hosting
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
