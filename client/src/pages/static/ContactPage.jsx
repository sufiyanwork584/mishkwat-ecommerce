import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const contactInfo = [
  { icon: FiMail, label: 'Email Us', value: 'salam@mishkwat.com', sub: 'We reply within 24 hours' },
  { icon: FiPhone, label: 'Call Us', value: '+91 91528 66032', sub: 'Mon–Sat, 11AM–8PM IST' },
  { icon: FiMapPin, label: 'Visit Us', value: 'Malad West, Mumbai', sub: 'MHADA, Malwani, India 400095' },
  { icon: FiClock, label: 'Business Hours', value: 'Mon–Sat: 11AM–8PM', sub: 'Sunday: Closed' },
];

const ContactPage = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    e.target.reset();
  };

  return (
    <div className="bg-background text-text min-h-screen py-16 md:py-24">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-text mb-4"
          >
            Get In <span className="bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] bg-clip-text text-transparent">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted"
          >
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 border border-white/5 flex items-start gap-4 hover:border-[#6C5CE7]/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#6C5CE7]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">{item.label}</h3>
                  <p className="text-sm text-[#00CEC9] font-medium mt-0.5">{item.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 glass-card rounded-2xl p-8 border border-white/5"
          >
            <h2 className="text-xl font-bold text-text mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-text placeholder-slate-500 focus:border-[#6C5CE7] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-text placeholder-slate-500 focus:border-[#6C5CE7] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Subject</label>
                <input
                  required
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-text placeholder-slate-500 focus:border-[#6C5CE7] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-text placeholder-slate-500 focus:border-[#6C5CE7] focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <FiSend size={16} />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
