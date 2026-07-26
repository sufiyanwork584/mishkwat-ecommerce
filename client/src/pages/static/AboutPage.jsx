import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiUsers, FiAward, FiGlobe, FiShield } from 'react-icons/fi';

const values = [
  { icon: FiTarget, title: 'Our Mission', desc: 'To democratize premium shopping by offering world-class products at prices everyone can afford, while delivering an exceptional digital experience.' },
  { icon: FiHeart, title: 'Customer First', desc: 'Every decision we make starts with you. From curated collections to hassle-free returns, your satisfaction drives everything we do.' },
  { icon: FiAward, title: 'Quality Assured', desc: 'We partner only with verified brands and manufacturers. Every product undergoes rigorous quality checks before reaching your doorstep.' },
  { icon: FiGlobe, title: 'Sustainability', desc: 'We are committed to reducing our carbon footprint through eco-friendly packaging and carbon-neutral shipping programs.' },
  { icon: FiShield, title: 'Trust & Security', desc: 'Your data privacy is sacred to us. We use bank-grade encryption and never share your personal information with third parties.' },
  { icon: FiUsers, title: 'Community', desc: 'With millions of happy customers and a growing community of creators, Mishkwat is more than a store—it\'s a movement.' },
];

const stats = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '50K+', label: 'Products Listed' },
  { value: '500+', label: 'Brand Partners' },
  { value: '99.9%', label: 'Uptime' },
];

const AboutPage = () => {
  return (
    <div className="bg-background text-text min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/10 via-transparent to-[#00CEC9]/10" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-text mb-6"
          >
            Redefining the Future of
            <span className="bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] bg-clip-text text-transparent"> Online Shopping</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-muted leading-relaxed"
          >
            Mishkwat was founded with a bold vision: to create a premium e-commerce experience
            that rivals the best stores in the world—accessible to everyone, everywhere.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-display font-extrabold bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-3xl font-display font-bold text-text text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-[#6C5CE7]/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6C5CE7]/20 to-[#00CEC9]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-[#6C5CE7]" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-dark-surface/30">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-text mb-8">Our Story</h2>
          <div className="space-y-6 text-text-muted leading-relaxed text-left">
            <p>
              Mishkwat was born in 2024 from a simple frustration: why does premium shopping have to feel complicated?
              Our founders, a team of engineers and designers, set out to build an e-commerce platform that combines
              the product depth of Amazon with the aesthetic polish of Apple and the personalization of Shopify.
            </p>
            <p>
              Today, Mishkwat serves millions of customers across India, offering curated collections from over 500 brand
              partners. From electronics to fashion, home essentials to luxury goods—we've become the go-to destination
              for shoppers who demand quality, convenience, and style.
            </p>
            <p>
              But we're just getting started. With innovations in AI-powered recommendations, same-day delivery, and
              augmented reality try-ons on the horizon, the future of Mishkwat is as exciting as its beginning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
