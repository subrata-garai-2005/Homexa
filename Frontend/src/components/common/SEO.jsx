import { useEffect } from 'react';

/**
 * Dynamic SEO component for client-side routing.
 * Updates document title, meta tags, OpenGraph, Twitter Cards, canonical link,
 * and injects/updates JSON-LD structured data for Google Search.
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema,
}) => {
  useEffect(() => {
    // 1. Dynamic Page Title
    const formattedTitle = title
      ? `${title} | Homexa`
      : 'Homexa - Vacation Rentals, Luxury Villas & Unique Stays';
    document.title = formattedTitle;

    // 2. Helper to set/update or create meta elements
    const setMeta = (attribute, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set/update link tag (canonical)
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const defaultImage = `${typeof window !== 'undefined' ? window.location.origin : ''}/assets/property2.webp`;
    const resolvedImage = image || defaultImage;
    const resolvedDesc =
      description ||
      'Discover and book handpicked vacation rentals, beachfront villas, cozy mountain cabins, and modern apartments with Homexa. Instant booking and verified hosts.';

    // Primary Meta Tags
    setMeta('name', 'description', resolvedDesc);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }
    setLink('canonical', currentUrl);

    // Open Graph / Facebook
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Homexa');
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', resolvedDesc);
    setMeta('property', 'og:image', resolvedImage);
    setMeta('property', 'og:url', currentUrl);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', resolvedDesc);
    setMeta('name', 'twitter:image', resolvedImage);

    // 3. Structured Data (JSON-LD)
    const scriptId = 'dynamic-json-ld';
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup when component unmounts
    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [title, description, keywords, image, url, type, schema]);

  return null;
};

export default SEO;
