import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteName = 'Mishkwat.com';
  const defaultDescription = 'Premium Islamic lifestyle & Hajj essentials. Shop authentic Ihram, Prayer Mats, Tasbeeh, Attar, Islamic Books, and Hajj Kits with confidence at Mishkwat.com.';
  const defaultKeywords = 'islamic store, hajj essentials, umrah products, ihram, prayer mat, tasbeeh, attar, islamic books, mishkwat, hajj kit';
  const defaultImage = 'https://images.unsplash.com/photo-1591604129939-f1efa4d99f7e?w=1200'; // Kaaba image fallback
  
  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
