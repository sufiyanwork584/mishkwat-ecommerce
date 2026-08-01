import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiServer, FiGlobe, FiMail } from 'react-icons/fi';

const sections = [
  {
    id: 'intro',
    title: '1. Introduction',
    icon: FiGlobe,
    content: `Welcome to Mishkwat. We value your trust and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or purchase products from us. Please read this policy carefully. By accessing or using Mishkwat, you consent to our collection and usage practices described herein.`
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    icon: FiEye,
    content: `We collect information that you provide directly to us when registering an account, placing an order, subscribing to newsletters, or contacting customer support. This includes:
    
• Personal Identification Details: Name, email address, phone number, physical shipping address, and billing address.
• Payment Details: We use secure, third-party payment gateways (Razorpay, Stripe) to process transactions. We do not store your full card details or banking passwords on our servers.
• Activity & Device Data: IP address, browser type, operating system, page views, and shopping preferences collected via cookies and tracking pixels.`
  },
  {
    id: 'usage',
    title: '3. How We Use Your Information',
    icon: FiLock,
    content: `Mishkwat utilizes the collected data for various operational, security, and promotional purposes:

• To process, fulfill, and ship orders, including sending order updates and tracking links.
• To manage your customer account, personalize your shopping journey, and offer tailored recommendations.
• To improve site functionality, user experience, and analyze sales performance metrics.
• To detect, prevent, and mitigate fraud, security breaches, and unauthorized transactions.
• To send newsletters and promo offers, which you can opt-out of at any time.`
  },
  {
    id: 'sharing',
    title: '4. Information Sharing & Disclosure',
    icon: FiServer,
    content: `We do not sell, rent, or trade your personal information. We only share details with trusted third parties who help us run our website and business:

• Courier Partners: Sharing shipping address and contact numbers to deliver packages.
• Payment Gateways: Processing credit cards, UPI, and net banking payments securely.
• Analytics & Marketing Tools: Caching preferences and tracking site visitor statistics.
• Legal Compliance: Sharing details only when requested by government authorities or required by law.`
  },
  {
    id: 'security',
    title: '5. Security of Your Data',
    icon: FiShield,
    content: `We implement industry-standard administrative, physical, and electronic security measures (such as SSL encryption and tokenized credentials) to secure your personal data. While we take maximum precautions, no online transaction or wireless storage can be guaranteed 100% secure. Therefore, we advise utilizing strong account passwords and avoiding public network access while editing account settings.`
  },
  {
    id: 'contact',
    title: '6. Contact Privacy Officer',
    icon: FiMail,
    content: `If you have questions, feedback, or complaints regarding this Privacy Policy or how your data is handled, you can reach out directly to our designated Data Protection Officer:

Email: privacy@Mishkwat.com
Phone: +91 91528 66032
Address: D8/43 Opp. Taibah Masjid, MHADA, Malwani Malad West, Mumbai 400095`
  }
];

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('intro');

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
      <section className="relative overflow-hidden py-16 md:py-20 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/10 via-transparent to-[#00CEC9]/10" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#6C5CE7]/10 text-[#a29bfe] border border-[#6C5CE7]/20 uppercase tracking-widest"
          >
            <FiShield /> Legal Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-extrabold text-text"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm text-text-muted font-mono"
          >
            Last Updated: June 18, 2026 • Version 2.1
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
                        ? 'bg-[#6C5CE7]/15 text-[#a29bfe] border border-[#6C5CE7]/30'
                        : 'hover:bg-white/5 text-text-muted hover:text-text'
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
              <div className="glass-card rounded-3xl p-6 md:p-10 border border-white/5 space-y-12">
                {sections.map((sec) => (
                  <div key={sec.id} id={sec.id} className="scroll-mt-24 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#6C5CE7]/15 to-[#00CEC9]/15 flex items-center justify-center text-[#6C5CE7]">
                        <sec.icon size={18} />
                      </div>
                      <h2 className="text-xl font-bold text-text font-display">
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

export default PrivacyPolicyPage;
