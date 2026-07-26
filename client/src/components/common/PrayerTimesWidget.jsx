import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiX, FiMapPin } from 'react-icons/fi';

const PrayerTimesWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetching prayer times for Mumbai, India as a default, or it can be dynamic based on user location.
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        // Using Mumbai coordinates as default for an Islamic store, 
        // this can be enhanced to ask for user location later.
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Mumbai&country=India&method=2');
        const data = await res.json();
        
        if (data.code === 200) {
          const timings = data.data.timings;
          setPrayerTimes({
            Fajr: timings.Fajr,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
          });
        }
      } catch (err) {
        setError('Could not load prayer times');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && !prayerTimes) {
      fetchPrayerTimes();
    }
  }, [isOpen, prayerTimes]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-surface border border-primary/20 rounded-2xl shadow-2xl w-64 overflow-hidden"
          >
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock size={18} />
                <h3 className="font-serif font-semibold tracking-wide">Prayer Times</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-primary-light transition-colors">
                <FiX size={18} />
              </button>
            </div>
            
            <div className="p-4 bg-background">
              <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4 pb-2 border-b border-border">
                <FiMapPin size={12} />
                <span>Mumbai, India</span>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <p className="text-xs text-red-500 text-center py-2">{error}</p>
              ) : (
                <div className="space-y-3 font-sans text-sm">
                  {Object.entries(prayerTimes).map(([name, time]) => (
                    <div key={name} className="flex justify-between items-center">
                      <span className="text-text font-medium">{name}</span>
                      <span className="text-primary font-semibold">{time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-surface border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors"
        aria-label="Prayer Times"
      >
        <FiClock size={24} />
      </motion.button>
    </div>
  );
};

export default PrayerTimesWidget;
