import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiPlus, FiMinus, FiSearch, FiHelpCircle, FiShoppingBag, FiTruck, FiCornerUpLeft, FiUser } from 'react-icons/fi';

const faqCategories = [
  {
    id: 'general',
    name: 'General & Ordering',
    icon: FiShoppingBag,
    questions: [
      {
        q: 'How do I place an order?',
        a: 'To place an order, browse our collection, select your desired items, choose sizes/variants if applicable, and click "Add to Cart". Once you are ready, click on the cart icon at the top right and follow the checkout steps to complete your purchase.'
      },
      {
        q: 'Can I change or cancel my order after it has been placed?',
        a: 'Yes, you can cancel your order within the first 1-2 hours of placing it directly from your User Dashboard under "My Orders", provided it hasn\'t been packed/shipped yet. For edits to shipping details, please contact our Support team immediately.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept a wide range of secure payment options, including major credit/debit cards (Visa, MasterCard, American Express), UPI, Net Banking, and popular mobile wallets. All transactions are encrypted and processed securely.'
      },
      {
        q: 'Can I apply multiple discount codes to a single order?',
        a: 'Only one promo code or coupon can be applied per order. However, coupon discounts can be combined with storewide markdowns and automatic discounts already active on individual items.'
      }
    ]
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    icon: FiTruck,
    questions: [
      {
        q: 'How long will it take to receive my order?',
        a: 'Standard shipping typically takes 3 to 7 business days, depending on your location. Metro cities generally receive deliveries within 2 to 4 business days. Express shipping is also available at checkout for faster delivery.'
      },
      {
        q: 'How can I track my package?',
        a: 'Once your order is shipped, you will receive a confirmation email containing a tracking number and a link. You can also view live order progress (Timeline Tracker) directly from the Order Details page on your User Dashboard.'
      },
      {
        q: 'Do you offer international shipping?',
        a: 'Currently, Mishkwat ships exclusively within India. We are working diligently on expanding our operations to serve global customers in the near future.'
      },
      {
        q: 'What happens if my package is lost or damaged during transit?',
        a: 'If your package is lost or arrives damaged, please reach out to our Customer Service team within 48 hours of delivery. We will open an investigation with our courier partner and arrange a free replacement or full refund.'
      }
    ]
  },
  {
    id: 'returns',
    name: 'Returns & Refunds',
    icon: FiCornerUpLeft,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a hassle-free 7-day return policy for most items. The product must be unused, unwashed, and in its original packaging with all tags intact. Some categories like hygiene-sensitive items, custom orders, and innerwear are non-returnable.'
      },
      {
        q: 'How do I start a return request?',
        a: 'Go to your User Dashboard -> "My Orders", click on the relevant order, and click "Initiate Return" if the return window is still active. Follow the steps to choose your pickup date and submit your request. Our courier partner will pick up the package from your doorstep.'
      },
      {
        q: 'When will I receive my refund?',
        a: 'Once the returned item reaches our warehouse and passes quality checks (usually 2-3 business days after pickup), we will initiate your refund. It will take 5-7 business days to reflect in your original payment method, or instantly if you choose Store Credits.'
      }
    ]
  },
  {
    id: 'account',
    name: 'Account & Security',
    icon: FiUser,
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'If you forgot your password, click the "Forgot Password" link on the Login page. Enter your registered email address, and we will send you a secure link to reset your password.'
      },
      {
        q: 'Is my personal and financial information secure?',
        a: 'Absolutely. We use bank-grade SSL encryption to secure all connection endpoints. We comply with PCI-DSS standards for payment processing, and we never store your full card details or share your personal data with third-party advertisers.'
      },
      {
        q: 'Can I manage multiple delivery addresses?',
        a: 'Yes, you can save and manage multiple delivery addresses in the "My Addresses" section of your Profile Dashboard to make checkout fast and seamless.'
      }
    ]
  }
];

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // Filter questions based on search query
  const getFilteredQuestions = () => {
    if (!searchQuery.trim()) {
      const cat = faqCategories.find(c => c.id === activeCategory);
      return cat ? cat.questions : [];
    }

    const query = searchQuery.toLowerCase();
    let matches = [];
    faqCategories.forEach(cat => {
      cat.questions.forEach(q => {
        if (q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query)) {
          matches.push({ ...q, categoryName: cat.name });
        }
      });
    });
    return matches;
  };

  const currentQuestions = getFilteredQuestions();

  return (
    <div className="bg-background text-text min-h-screen">
      {/* Hero / Header */}
      <section className="relative overflow-hidden py-16 md:py-20 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/10 via-transparent to-[#00CEC9]/10" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#6C5CE7]/10 text-[#a29bfe] border border-[#6C5CE7]/20 uppercase tracking-widest"
          >
            <FiHelpCircle /> Help Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-extrabold text-text"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-text-muted"
          >
            Find answers to common questions about shipping, returns, security, payments, and account setup.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-md mx-auto mt-4"
          >
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedIndex(null);
              }}
              className="w-full bg-[#16162a]/90 border border-white/10 hover:border-white/20 focus:border-[#6C5CE7] outline-none rounded-full py-3.5 pl-12 pr-6 text-sm text-text placeholder-slate-500 focus:ring-1 focus:ring-[#6C5CE7] transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Tabs (Only if not searching) */}
            <div className="md:col-span-1 space-y-2 text-left">
              {!searchQuery && (
                <div className="sticky top-24 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted pl-3 mb-4">Categories</h3>
                  {faqCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setExpandedIndex(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                          isActive
                            ? 'bg-[#6C5CE7] text-text shadow-[0_4px_20px_rgba(108,92,231,0.25)]'
                            : 'hover:bg-white/5 text-text-muted hover:text-text'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {searchQuery && (
                <div className="sticky top-24 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted pl-3">Search Results</h3>
                  <p className="text-xs text-text-muted pl-3 leading-relaxed">
                    Showing results for "{searchQuery}" across all categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('general');
                    }}
                    className="text-xs font-bold text-[#6C5CE7] hover:underline pl-3 block"
                  >
                    Clear Search & Show Categories
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Questions */}
            <div className="md:col-span-3 space-y-4 text-left">
              {currentQuestions.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-text-muted">
                    <FiHelpCircle size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-text">No Results Found</h3>
                  <p className="text-sm text-text-muted max-w-sm mx-auto">
                    We couldn't find any questions matching "{searchQuery}". Try using different keywords or resetting your search.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestions.map((item, idx) => {
                    const isExpanded = expandedIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10"
                      >
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="w-full flex items-start justify-between gap-4 p-5 text-left font-semibold text-text focus:outline-none"
                        >
                          <span className="text-sm md:text-base leading-snug">
                            {item.q}
                            {item.categoryName && (
                              <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1.5">
                                Category: {item.categoryName}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 text-text-muted p-1 bg-white/5 rounded-lg flex-shrink-0 transition-transform">
                            {isExpanded ? <FiMinus size={16} /> : <FiPlus size={16} />}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                            >
                              <div className="px-5 pb-5 border-t border-white/5 pt-4 text-sm text-text-muted leading-relaxed font-medium">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
