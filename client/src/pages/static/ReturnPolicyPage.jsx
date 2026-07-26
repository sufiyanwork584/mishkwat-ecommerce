import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCornerUpLeft, FiCalendar, FiCheckCircle, FiAlertCircle, FiCreditCard, FiMail } from 'react-icons/fi';

const sections = [
  {
    id: 'returns',
    title: '1. Standard 6-Day Returns',
    icon: FiCornerUpLeft,
    content: `We offer a return and exchange policy within the first 6 days from the date of purchase. If 6 days have passed since your purchase, unfortunately, we cannot offer you a return, exchange, or refund.

To be eligible for a return or exchange:
• The item must be entirely unused, in the same condition as you received it.
• The item must be in its original, undamaged packaging.
• Any tags, ring binders, lanyards, or other accessories must be returned intact.`
  },
  {
    id: 'cancellations',
    title: '2. Order Cancellations',
    icon: FiAlertCircle,
    content: `You can submit a cancellation request for any order within 6 days of placing it. 

• Cancellations are processed immediately if the shipment has not yet left our facility.
• We are unable to accept cancellation requests if the order has already been communicated to sellers/merchants and the shipping process has been initiated, or if the product is out for delivery.
• In cases where the shipment is already out for delivery, you may choose to reject the product at the time of delivery to trigger a return.`
  },
  {
    id: 'exceptions',
    title: '3. Non-Returnable Items',
    icon: FiAlertCircle,
    content: `Certain types of items are exempt from being returned or refunded:
    
• Clearance & Sale Items: Only regular priced items may be returned or refunded; sale items are excluded from returns/exchanges unless they arrive damaged.
• Specific product categories identified as non-returnable at the time of purchase.
• Highly customized products (e.g. customized corporate guide card orders with personalized logo prints).`
  },
  {
    id: 'process',
    title: '4. Step-by-Step Return Process',
    icon: FiCalendar,
    content: `To complete your return, we require a receipt or proof of purchase:

1. Request: Log into your Mishkwat account, go to "My Orders", and submit a Return/Exchange request within 6 days.
2. Verification: Our customer support will review your claim. If you received a damaged, defective, or incorrect product, please share photos or video proof.
3. Collection: Once approved, we will arrange for a pickup from your original shipping address.
4. Inspection: The return is subject to final quality check and inspection by our verification team before the refund is finalized.`
  },
  {
    id: 'refunds',
    title: '5. Refund Timelines',
    icon: FiCreditCard,
    content: `Once your return is received and inspected, we will send you an email to notify you that we have received your returned item and update you on the approval or rejection of your refund.

• If approved, your refund will be processed and automatically credited back to your original method of payment.
• Refund Processing Time: It typically takes 6 working days for the refund amount to reflect in your original payment source, depending on your bank's processing cycles.`
  },
  {
    id: 'contact',
    title: '6. Support & Claims Helpdesk',
    icon: FiMail,
    content: `If you have questions about cancellations, returns, or refunds, please reach out to our dedicated support desk:

Email: salam@mishkwat.com
Phone: +91 91528 66032
Address: D8/43 Opp. Taibah Masjid, MHADA, Malwani Malad West, Mumbai 400095
Operating Hours: Monday – Saturday, 11:00 am – 8:00 pm`
  }
];

const ReturnPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('returns');

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
            <FiCornerUpLeft /> Policy Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-extrabold text-text"
          >
            Refund & Cancellation Policy
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

export default ReturnPolicyPage;
