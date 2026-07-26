import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUserCheck, FiDollarSign, FiAlertTriangle, FiGitCommit, FiMail } from 'react-icons/fi';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    icon: FiBookOpen,
    content: `By accessing, browsing, or using Mishkwat (mishkwat.com), you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions. If you do not agree to these terms, please refrain from using our platform. We reserve the right to update or amend these terms at any time, with modifications becoming effective immediately upon posting. Your continued use of the platform constitutes agreement to all revised terms.`
  },
  {
    id: 'accounts',
    title: '2. User Accounts & Security',
    icon: FiUserCheck,
    content: `To make purchases and access specific dashboard features, you may register a Mishkwat account. You agree to:

• Provide accurate, complete, and updated registration details.
• Maintain the confidentiality of your credentials (username and password).
• Immediately notify us of any unauthorized account access or data breaches.
• Accept responsibility for all activities occurring under your account profile.
We reserve the right to suspend or terminate accounts that violate these guidelines or engage in suspicious behavior.`
  },
  {
    id: 'billing',
    title: '3. Pricing, Payments & Billing',
    icon: FiDollarSign,
    content: `All prices listed on Mishkwat are shown in Indian Rupees (INR) and are inclusive of GST as indicated on checkout:

• Payment Processing: You agree to pay all charges associated with your purchase, including applicable delivery fees and taxes. Payments are securely processed through integrated secure payment gateways.
• Pricing Errors: In the rare event of a typographical pricing error, we reserve the right to cancel any orders placed for products listed at the incorrect price, even after payment verification.`
  },
  {
    id: 'conduct',
    title: '4. Prohibited User Conduct',
    icon: FiAlertTriangle,
    content: `When interacting with Mishkwat, you agree not to engage in any activity that could harm the website, server infrastructure, or other customers:

• Do not copy, distribute, modify, or scrape any content (images, design, software code, product listings) without explicit written permission from Mishkwat Publications.
• Do not introduce malware, viruses, Trojan horses, or participate in DDoS attacks against our servers.
• Do not post fake reviews, spam comments, or harassment messages on product catalogs.`
  },
  {
    id: 'liability',
    title: '5. Limitation of Liability',
    icon: FiGitCommit,
    content: `Mishkwat, its directors, and employees shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the website or purchased items. We do not guarantee that website services will be uninterrupted, error-free, or entirely secure, though we employ leading technological safeguards to maximize availability and uptime.`
  },
  {
    id: 'support',
    title: '6. Support & Contact Details',
    icon: FiMail,
    content: `For any legal inquiries, copyright claims, or general questions concerning these Terms & Conditions, please reach out to our legal and support helpdesk:

Email: salam@mishkwat.com
Phone: +91 91528 66032
Address: D8/43 Opp. Taibah Masjid, MHADA, Malwani Malad West, Mumbai 400095
Operating Hours: Monday – Saturday, 11:00 am – 8:00 pm`
  }
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

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
            <FiBookOpen /> Legal Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-extrabold text-text"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm text-text-muted font-mono"
          >
            Last Updated: July 09, 2026 • Version 1.5
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

export default TermsPage;
