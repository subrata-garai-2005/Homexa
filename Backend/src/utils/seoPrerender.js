import mongoose from 'mongoose';
import Property from '../models/Property.js';

/**
 * Escapes characters for HTML attributes and content to prevent injection.
 */
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Determines whether connection is HTTPS based on reverse proxy headers or environment.
 */
export const getProtocol = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto']?.split(',')[0].trim();
  if (forwardedProto) return forwardedProto;
  if (req.headers['x-forwarded-ssl'] === 'on') return 'https';
  if (req.protocol === 'https') return 'https';
  if (process.env.NODE_ENV === 'production') return 'https';
  return req.protocol || 'http';
};

/**
 * Returns full base URL e.g. https://example.com
 */
export const getBaseUrl = (req) => {
  const protocol = getProtocol(req);
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}`;
};

/**
 * Replaces meta tags, canonical link, and body content inside the raw index.html template.
 */
const injectMetadataAndContent = (html, { title, description, canonicalUrl, ogImage, schema, bodyContent }) => {
  let modifiedHtml = html;

  // Title
  if (title) {
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']title["'][^>]*>/i, `<meta name="title" content="${escapeHtml(title)}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  }

  // Description
  if (description) {
    modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  }

  // Canonical URL & og:url
  if (canonicalUrl) {
    if (modifiedHtml.includes('rel="canonical"')) {
      modifiedHtml = modifiedHtml.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    } else {
      modifiedHtml = modifiedHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    if (modifiedHtml.includes('property="og:url"')) {
      modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
    } else {
      modifiedHtml = modifiedHtml.replace('</head>', `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
    }
  }

  // Open Graph & Twitter Image
  if (ogImage) {
    modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
  }

  // Structured Data (JSON-LD)
  if (schema) {
    const schemaScript = `\n  <script type="application/ld+json">\n  ${JSON.stringify(schema, null, 2)}\n  </script>`;
    modifiedHtml = modifiedHtml.replace('</head>', `${schemaScript}\n</head>`);
  }

  // Body Pre-rendered Content inside <div id="root">
  if (bodyContent) {
    modifiedHtml = modifiedHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${bodyContent}</div>`);
  }

  return modifiedHtml;
};

const fallbackFeaturedStays = [
  {
    _id: 'properties',
    title: 'Luxury Beachfront Villa with Private Pool',
    location: { city: 'Goa', state: 'Goa' },
    price: 14500,
    priceUnit: 'night',
    images: ['/assets/property2.webp']
  },
  {
    _id: 'properties',
    title: 'Cedar Wood Mountain Chalet & Himalayan View',
    location: { city: 'Manali', state: 'Himachal Pradesh' },
    price: 7800,
    priceUnit: 'night',
    images: ['/assets/property2.webp']
  },
  {
    _id: 'properties',
    title: 'Heritage Courtyard Haveli & Plunge Pool',
    location: { city: 'Jaipur', state: 'Rajasthan' },
    price: 9200,
    priceUnit: 'night',
    images: ['/assets/property2.webp']
  }
];

/**
 * Pre-renders semantic HTML for Googlebot and users for the Homepage (/)
 */
const renderHomeBody = (properties = []) => {
  const displayProps = properties.length > 0 ? properties : fallbackFeaturedStays;
  return `
    <header style="padding: 1.25rem 1.5rem; background: #ffffff; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="font-size: 1.5rem; font-weight: bold; color: #FF385C; text-decoration: none;">Homexa</a>
      <nav style="display: flex; gap: 1.5rem; font-size: 0.95rem;">
        <a href="/properties" style="color: #374151; text-decoration: none; font-weight: 500;">Stays</a>
        <a href="/map" style="color: #374151; text-decoration: none; font-weight: 500;">Map</a>
      </nav>
    </header>
    <main>
      <section style="background: #0B0F19; color: #ffffff; padding: 4rem 1.5rem; text-align: center;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2;">
          Find Your Dream Vacation Rentals & Luxury Stays
        </h1>
        <p style="font-size: 1.15rem; color: #9CA3AF; max-width: 750px; margin: 0 auto 2rem auto; line-height: 1.6;">
          Discover and book handpicked vacation rentals, beachfront villas, cozy mountain cabins, and modern apartments with Homexa. Instant booking and verified hosts across top travel destinations.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/properties" style="background: #FF385C; color: #ffffff; padding: 0.85rem 1.75rem; border-radius: 9999px; font-weight: 600; text-decoration: none;">
            Browse All Properties
          </a>
          <a href="/map" style="background: rgba(255,255,255,0.1); color: #ffffff; padding: 0.85rem 1.75rem; border-radius: 9999px; font-weight: 600; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">
            Explore on Map
          </a>
        </div>
      </section>

      <section style="max-width: 1200px; margin: 3rem auto; padding: 0 1.5rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">
          Featured Vacation Rentals & Villas
        </h2>
        <p style="color: #6B7280; margin-bottom: 2rem;">
          Handpicked top-rated stays with verified hosts, luxury amenities, and prime locations.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${displayProps.map(p => {
            const img = p.images?.[0]?.url || p.images?.[0] || '/assets/property2.webp';
            const loc = [p.location?.city, p.location?.state].filter(Boolean).join(', ');
            const propUrl = p._id === 'properties' ? '/properties' : `/properties/${p._id}`;
            return `
            <article style="border: 1px solid #E5E7EB; border-radius: 1rem; overflow: hidden; background: #ffffff;">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 200px; object-fit: cover;" loading="lazy" />
              <div style="padding: 1.25rem;">
                <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.25rem; color: #111827;">
                  <a href="${propUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(p.title)}</a>
                </h3>
                <p style="color: #6B7280; font-size: 0.9rem; margin-bottom: 0.75rem;">${escapeHtml(loc)}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; padding-top: 0.75rem;">
                  <span style="font-weight: 700; color: #111827; font-size: 1.1rem;">₹${(p.price || 0).toLocaleString('en-IN')} <span style="font-size: 0.85rem; font-weight: normal; color: #6B7280;">/ ${escapeHtml(p.priceUnit || 'night')}</span></span>
                  <a href="${propUrl}" style="color: #FF385C; font-weight: 600; text-decoration: none; font-size: 0.9rem;">View Stay &rarr;</a>
                </div>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>

      <section style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 3rem 1.5rem; text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">Why Book Your Vacation with Homexa?</h2>
        <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; max-width: 900px; margin: 0 auto; text-align: left;">
          <div style="flex: 1 1 250px;">
            <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">✓ Verified Listings</h4>
            <p style="color: #6B7280; font-size: 0.9rem;">Every home and villa is authenticated with high-resolution imagery and accurate amenities.</p>
          </div>
          <div style="flex: 1 1 250px;">
            <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">✓ Instant Confirmation</h4>
            <p style="color: #6B7280; font-size: 0.9rem;">Seamless booking with instant payment confirmation and transparent pricing.</p>
          </div>
          <div style="flex: 1 1 250px;">
            <h4 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">✓ 24/7 Guest Assistance</h4>
            <p style="color: #6B7280; font-size: 0.9rem;">Dedicated support and AI trip planning to make every vacation memorable.</p>
          </div>
        </div>
      </section>
    </main>
    <footer style="padding: 2rem 1.5rem; background: #111827; color: #9CA3AF; text-align: center; font-size: 0.875rem;">
      <p>&copy; ${new Date().getFullYear()} Homexa. All rights reserved. Premium Vacation Rentals & Luxury Stays.</p>
    </footer>
  `;
};

/**
 * Pre-renders semantic HTML for the Properties list (/properties)
 */
const renderPropertiesBody = (properties = []) => {
  const displayProps = properties.length > 0 ? properties : fallbackFeaturedStays;
  return `
    <header style="padding: 1.25rem 1.5rem; background: #ffffff; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="font-size: 1.5rem; font-weight: bold; color: #FF385C; text-decoration: none;">Homexa</a>
      <nav style="display: flex; gap: 1.5rem; font-size: 0.95rem;">
        <a href="/" style="color: #374151; text-decoration: none; font-weight: 500;">Home</a>
        <a href="/map" style="color: #374151; text-decoration: none; font-weight: 500;">Map</a>
      </nav>
    </header>
    <main style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
      <h1 style="font-size: 2rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem;">
        Explore Vacation Rentals & Unique Stays
      </h1>
      <p style="color: #6B7280; margin-bottom: 2rem; font-size: 1.05rem;">
        Discover luxury beach villas, cozy mountain cabins, lakeside retreats, and city apartments. Verified stays with transparent pricing.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${displayProps.map(p => {
          const img = p.images?.[0]?.url || p.images?.[0] || '/assets/property2.webp';
          const loc = [p.location?.city, p.location?.state].filter(Boolean).join(', ');
          const propUrl = p._id === 'properties' ? '/properties' : `/properties/${p._id}`;
          return `
          <article style="border: 1px solid #E5E7EB; border-radius: 1rem; overflow: hidden; background: #ffffff;">
            <a href="${propUrl}" style="text-decoration: none; color: inherit;">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 200px; object-fit: cover;" loading="lazy" />
              <div style="padding: 1.25rem;">
                <h2 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.25rem; color: #111827;">${escapeHtml(p.title)}</h2>
                <p style="color: #6B7280; font-size: 0.9rem; margin-bottom: 0.5rem;">${escapeHtml(loc)}</p>
                <p style="font-size: 0.85rem; color: #4B5563; margin-bottom: 0.75rem; line-height: 1.4;">${escapeHtml((p.description || 'Stunning vacation rental with premium amenities.').slice(0, 95))}...</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; padding-top: 0.75rem;">
                  <span style="font-weight: 700; color: #111827; font-size: 1.1rem;">₹${(p.price || 0).toLocaleString('en-IN')} <span style="font-size: 0.85rem; font-weight: normal; color: #6B7280;">/ ${escapeHtml(p.priceUnit || 'night')}</span></span>
                  <span style="color: #FF385C; font-weight: 600; font-size: 0.9rem;">View Stay &rarr;</span>
                </div>
              </div>
            </a>
          </article>`;
        }).join('')}
      </div>
    </main>
  `;
};

/**
 * Pre-renders semantic HTML for a single Property details page (/properties/:id)
 */
const renderPropertyDetailBody = (p) => {
  const img = p.images?.[0]?.url || p.images?.[0] || '/assets/property2.webp';
  const loc = [p.location?.address, p.location?.city, p.location?.state, p.location?.country].filter(Boolean).join(', ');
  const amenitiesList = (p.amenities || []).map(a => `<span style="background: #F3F4F6; color: #374151; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.5rem;">${escapeHtml(a)}</span>`).join('');

  return `
    <header style="padding: 1.25rem 1.5rem; background: #ffffff; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="font-size: 1.5rem; font-weight: bold; color: #FF385C; text-decoration: none;">Homexa</a>
      <nav style="display: flex; gap: 1.5rem; font-size: 0.95rem;">
        <a href="/properties" style="color: #374151; text-decoration: none; font-weight: 500;">&larr; All Properties</a>
        <a href="/map" style="color: #374151; text-decoration: none; font-weight: 500;">Map</a>
      </nav>
    </header>
    <main style="max-width: 1000px; margin: 2rem auto; padding: 0 1.5rem;">
      <article>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem;">${escapeHtml(p.title)}</h1>
        <p style="color: #6B7280; font-size: 1rem; margin-bottom: 1.5rem;">📍 ${escapeHtml(loc)}</p>
        <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem;" />
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">About this stay</h2>
            <p style="font-size: 1.05rem; line-height: 1.7; color: #374151; margin-bottom: 2rem; white-space: pre-line;">${escapeHtml(p.description)}</p>
            
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 0.75rem;">Amenities & Features</h3>
            <div style="margin-bottom: 2rem;">${amenitiesList}</div>
            
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">Accommodation Specs</h3>
            <p style="color: #4B5563;">• ${p.bedrooms || 1} Bedrooms &bull; ${p.beds || 1} Beds &bull; ${p.bathrooms || 1} Bathrooms &bull; Max ${p.maxGuests || 2} Guests</p>
          </div>

          <aside style="border: 1px solid #E5E7EB; border-radius: 1rem; padding: 1.5rem; background: #F9FAFB; height: fit-content;">
            <div style="font-size: 1.75rem; font-weight: 800; color: #111827; margin-bottom: 1rem;">
              ₹${(p.price || 0).toLocaleString('en-IN')} <span style="font-size: 0.95rem; font-weight: normal; color: #6B7280;">/ ${escapeHtml(p.priceUnit || 'night')}</span>
            </div>
            <a href="/properties/${p._id}" style="display: block; text-align: center; background: #FF385C; color: #ffffff; padding: 0.85rem; border-radius: 0.5rem; font-weight: 600; text-decoration: none;">
              Reserve Now
            </a>
          </aside>
        </div>
      </article>
    </main>
  `;
};

/**
 * Main SEO Pre-rendering route dispatcher.
 */
export const prerenderRoute = async (req, rawHtml) => {
  const baseUrl = getBaseUrl(req);
  const cleanPath = req.path.replace(/\/+$/, '') || '/';
  const canonicalUrl = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;

  // 1. Homepage (/)
  if (cleanPath === '/') {
    let properties = [];
    if (mongoose.connection?.readyState === 1) {
      try {
        properties = await Property.find({ isActive: { $ne: false } })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean()
          .maxTimeMS(2000);
      } catch (e) {
        console.warn('SEO Prerender: could not load properties for /:', e.message);
      }
    }

    return injectMetadataAndContent(rawHtml, {
      title: 'Homexa - Vacation Rentals, Luxury Villas & Unique Stays',
      description: 'Discover and book handpicked vacation rentals, beachfront villas, cozy mountain cabins, and modern apartments with Homexa. Instant booking and verified hosts.',
      canonicalUrl: `${baseUrl}/`,
      ogImage: `${baseUrl}/assets/property2.webp`,
      schema: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${baseUrl}/#website`,
            "name": "Homexa",
            "url": `${baseUrl}/`,
            "description": "Premium vacation rentals, luxury villas, and holiday homes booking platform.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/properties?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`,
            "name": "Homexa",
            "url": `${baseUrl}/`,
            "logo": `${baseUrl}/favicon.svg`
          }
        ]
      },
      bodyContent: renderHomeBody(properties)
    });
  }

  // 2. Properties Listing (/properties)
  if (cleanPath === '/properties') {
    let properties = [];
    if (mongoose.connection?.readyState === 1) {
      try {
        properties = await Property.find({ isActive: { $ne: false } })
          .sort({ createdAt: -1 })
          .limit(12)
          .lean()
          .maxTimeMS(2000);
      } catch (e) {
        console.warn('SEO Prerender: could not load properties for /properties:', e.message);
      }
    }

    return injectMetadataAndContent(rawHtml, {
      title: 'Explore Vacation Rentals & Unique Stays | Homexa',
      description: 'Explore handpicked vacation rentals, beachfront villas, cozy mountain cabins, and apartments on Homexa. Verified hosts and instant confirmation.',
      canonicalUrl,
      ogImage: `${baseUrl}/assets/property2.webp`,
      bodyContent: renderPropertiesBody(properties)
    });
  }

  // 3. Single Property Detail (/properties/:id)
  const propMatch = cleanPath.match(/^\/properties\/([a-f\d]{24})$/i);
  if (propMatch) {
    const propId = propMatch[1];
    let property = null;
    if (mongoose.connection?.readyState === 1) {
      try {
        property = await Property.findById(propId).lean().maxTimeMS(2000);
      } catch (e) {
        console.warn('SEO Prerender: could not load property details:', e.message);
      }
    }

    if (property) {
      const firstImg = property.images?.[0]?.url || property.images?.[0] || `${baseUrl}/assets/property2.webp`;
      const city = property.location?.city || 'Vacation Stay';
      const cleanDesc = property.description
        ? property.description.slice(0, 155)
        : `Book ${property.title} in ${city}. Instant confirmation and best rates on Homexa.`;

      return injectMetadataAndContent(rawHtml, {
        title: `${property.title} in ${city} | Homexa`,
        description: cleanDesc,
        canonicalUrl,
        ogImage: firstImg,
        schema: {
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          "name": property.title,
          "description": cleanDesc,
          "image": (property.images || []).map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean),
          "priceRange": `₹${property.price} / ${property.priceUnit || 'night'}`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": property.location?.city,
            "addressRegion": property.location?.state,
            "addressCountry": property.location?.country || "IN"
          }
        },
        bodyContent: renderPropertyDetailBody(property)
      });
    }
  }

  // 4. Map View (/map)
  if (cleanPath === '/map') {
    let properties = [];
    if (mongoose.connection?.readyState === 1) {
      try {
        properties = await Property.find({ isActive: { $ne: false } }).limit(8).lean().maxTimeMS(2000);
      } catch (e) {
        // fallback
      }
    }
    const displayMapProps = properties.length > 0 ? properties : fallbackFeaturedStays;

    const mapBody = `
      <header style="padding: 1.25rem 1.5rem; background: #ffffff; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 1.5rem; font-weight: bold; color: #FF385C; text-decoration: none;">Homexa</a>
        <nav style="display: flex; gap: 1.5rem; font-size: 0.95rem;">
          <a href="/" style="color: #374151; text-decoration: none; font-weight: 500;">Home</a>
          <a href="/properties" style="color: #374151; text-decoration: none; font-weight: 500;">Properties</a>
        </nav>
      </header>
      <main style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
        <h1 style="font-size: 2rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem;">Interactive Map - Explore Stays & Vacation Rentals</h1>
        <p style="color: #6B7280; margin-bottom: 2rem;">Explore vacation rentals, beach villas, and boutique stays on an interactive map. Find properties near top destinations on Homexa.</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${displayMapProps.map(p => {
            const propUrl = p._id === 'properties' ? '/properties' : `/properties/${p._id}`;
            return `<a href="${propUrl}" style="border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; background: #fff; color: #111827; text-decoration: none; font-weight: 500;">📍 ${escapeHtml(p.title)} (${escapeHtml(p.location?.city || '')})</a>`;
          }).join('')}
        </div>
      </main>
    `;

    return injectMetadataAndContent(rawHtml, {
      title: 'Interactive Map - Explore Stays & Vacation Rentals | Homexa',
      description: 'Explore vacation rentals, beach villas, and boutique stays on an interactive map. Find properties near top destinations on Homexa.',
      canonicalUrl,
      ogImage: `${baseUrl}/assets/property2.webp`,
      bodyContent: mapBody
    });
  }

  // Default Fallback
  return injectMetadataAndContent(rawHtml, {
    canonicalUrl
  });
};
