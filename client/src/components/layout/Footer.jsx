import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  return (
    <footer className="bg-surface border-t border-border mt-16 transition-colors duration-300">
      {/* Newsletter Section */}
      <div className="bg-background border-b border-border p-5">
        <div className="container-custom py-16 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left max-w-lg">
            <h3 className="text-3xl md:text-4xl font-serif font-semibold text-text tracking-tight leading-snug">
              Stay Connected with <span className="text-primary">Mishkwat</span>
            </h3>
            <p className="text-text-muted text-sm md:text-base mt-3 leading-relaxed">
              Receive exclusive offers, new arrivals, Hajj preparation guides & spiritual reminders directly to your inbox.
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row w-full lg:w-auto overflow-hidden shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-grow lg:w-80 px-6 py-4 bg-surface text-text placeholder-text-muted outline-none text-sm font-medium rounded-l-full sm:rounded-r-none rounded-r-full border border-border focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-widest rounded-r-full sm:rounded-l-none rounded-l-full mt-3 sm:mt-0"
            >
              Subscribe <FiArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="pl-8  py-8 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.svg.webp" alt="Mishkwat" className="h-14 w-auto object-contain dark:brightness-200" />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              Your premium destination for authentic Hajj & Umrah essentials, Islamic lifestyle products, and spiritual accessories. Curated with care, delivered with trust.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: FaFacebookF, href: '#' },
                { Icon: FaTwitter, href: '#' },
                { Icon: FaInstagram, href: '#' },
                { Icon: FaYoutube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-full bg-background hover:bg-primary border border-border hover:border-primary flex items-center justify-center text-text-muted hover:text-white transition-all duration-300"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-text font-serif font-semibold text-lg mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'Home', path: '/' },
                { label: 'Shop All', path: '/products' },
                { label: 'Categories', path: '/categories' },
                { label: 'Blogs', path: '/blogs' },
                { label: 'About Mishkwat', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h4 className="text-text font-serif font-semibold text-lg mb-6 tracking-wide">Customer Service</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'My Account', path: '/dashboard' },
                { label: 'Track Order', path: '/dashboard/orders' },
                { label: 'Refund & Cancellation', path: '/returns' },
                { label: 'Shipping Policy', path: '/shipping' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'FAQ', path: '/faq' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="text-text font-serif font-semibold text-lg mb-6 tracking-wide">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary mt-1 flex-shrink-0" size={18} />
                <span className="text-sm text-text-muted leading-relaxed">
                  D8/43 Opp. Taibah Masjid, MHADA,<br />Malwani Malad West, Mumbai 400095
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary flex-shrink-0" size={18} />
                <a href="tel:+919152866032" className="text-sm text-text-muted hover:text-primary transition-colors">
                  +91 91528 66032
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary flex-shrink-0" size={18} />
                <a href="mailto:salam@mishkwat.com" className="text-sm text-text-muted hover:text-primary transition-colors">
                  salam@mishkwat.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t p-5 border-border">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Mishkwat. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-md bg-background text-text-muted border border-border text-xs font-semibold">VISA</span>
              <span className="px-2.5 py-1 rounded-md bg-background text-text-muted border border-border text-xs font-semibold">UPI</span>
              <span className="px-2.5 py-1 rounded-md bg-background text-text-muted border border-border text-xs font-semibold">RAZORPAY</span>
              <span className="px-2.5 py-1 rounded-md bg-background text-text-muted border border-border text-xs font-semibold">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
