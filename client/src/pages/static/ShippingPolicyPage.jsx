import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiMapPin, FiRefreshCw, FiTruck, FiMail } from 'react-icons/fi';

const sections = [
  {
    id: 'overview',
    title: '1. Shipping Overview',
    icon: FiPackage,
    content: `At Mishkwat, we are committed to delivering your order safely and on time. We ship across India and take every care to ensure your Hajj & Umrah essentials arrive in perfect condition.

Once your order is successfully placed and payment is confirmed, our team begins the fulfilment process. You will receive a confirmation email with your order details immediately after placing the order.`
  },
  {
    id: 'timeline',
    title: '2. Delivery Timeline',
    icon: FiClock,
    content: `All orders are dispatched and delivered within 2 to 7 working days from the date of purchase.

• Processing Time: Orders are typically processed and handed to our courier partner within 1–2 working days of placement.
• Transit Time: Once dispatched, delivery takes approximately 2–5 additional working days depending on your delivery location within India.
• Please note that delivery timelines may vary during peak periods such as Hajj or Ramadan season, public holidays, and extreme weather conditions.`
  },
  {
    id: 'coverage',
    title: '3. Shipping Coverage',
    icon: FiMapPin,
    content: `We currently offer shipping across India.

• Domestic Shipping: We ship to all major cities, towns, and PIN codes across India through our courier partners.
• Remote Areas: Delivery to certain remote or non-serviceable PIN codes may take additional time. In some cases, our courier partner may reach out to you to arrange an alternative delivery method.
• International Shipping: International shipping is not currently available. We will announce any updates on this front through our website and social channels.`
  },
  {
    id: 'charges',
    title: '4. Shipping Charges',
    icon: FiTruck,
    content: `Shipping charges are calculated based on your order value and delivery location:

• Free Shipping: Orders above a certain threshold qualify for free standard shipping (applicable offers are displayed at checkout).
• Standard Shipping: A flat shipping fee may apply to orders below the free shipping threshold. The exact charge will be shown at the time of checkout before payment.
• Bulk Orders: For bulk or corporate orders (e.g., Hajj group kits), please contact us directly to discuss shipping arrangements and pricing.`
  },
  {
    id: 'tracking',
    title: '5. Order Tracking',
    icon: FiRefreshCw,
    content: `Once your order has been dispatched, you will receive a shipping confirmation via email or SMS containing your tracking number and a link to track your package.

• You can also track your order by logging into your Mishkwat account and visiting the "My Orders" section of your dashboard.
• If you have not received a tracking update within 3 working days of your order confirmation, please contact our support team.`
  },
  {
    id: 'support',
    title: '6. Shipping Support',
    icon: FiMail,
    content: `For any shipping-related queries, delays, or delivery issues, please contact our support team:

Email: salam@mishkwat.com
Phone: +91 91528 66032
Address: D8/43 Opp. Taibah Masjid, MHADA, Malwani Malad West, Mumbai 400095
Operating Hours: Monday – Saturday, 11:00 am – 8:00 pm`
  }
];

const ShippingPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-background text-text min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 md:py-20 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest"
          >
            <FiTruck /> Shipping Info
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-extrabold text-text"
          >
            Shipping Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm text-text-muted font-mono"
          >
            Last Updated: July 09, 2026 • Version 1.0
          </motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Table of Contents */}
            <div className="lg:col-span-1 text-left hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted pl-3 mb-4">Table of Contents</h3>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                      activeSection === sec.id
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'hover:bg-surface text-text-muted hover:text-text'
                    }`}
                  >
                    <sec.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Content */}
            <div className="lg:col-span-3 space-y-8 text-left">
              <div className="glass-card rounded-3xl p-6 md:p-10 border border-border space-y-12 bg-surface">
                {sections.map((sec) => (
                  <div key={sec.id} id={sec.id} className="scroll-mt-24 space-y-4">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary/15 to-accent/15 flex items-center justify-center text-primary">
                        <sec.icon size={18} />
                      </div>
                      <h2 className="text-xl font-bold text-text font-serif">
                        {sec.title}
                      </h2>
                    </div>
                    <p className="text-text-muted text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicyPage;
