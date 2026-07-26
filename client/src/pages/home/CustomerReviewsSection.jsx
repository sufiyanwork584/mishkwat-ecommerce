import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiCheckCircle } from 'react-icons/fi';
import Rating from '../../components/common/Rating';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const dummyReviews = [
  {
    id: 1,
    name: 'Aarav Patel',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The Premium Egyptian Cotton Ihram sets were exceptionally soft and durable. They kept me comfortable throughout my entire Umrah journey. Highly recommended!',
    date: 'July 12, 2026',
    verified: true,
  },
  {
    id: 2,
    name: 'Fatima Zahra',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Absolutely loved the Turkish velvet prayer mats. They are thick, soft, and the craftsmanship is exquisite. Perfect for daily prayers and gifting to family.',
    date: 'July 20, 2026',
    verified: true,
  },
  {
    id: 3,
    name: 'Mohammed Ali',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The Royal Oud perfume has an authentic, long-lasting fragrance. I received so many compliments during Eid. The packaging was also premium.',
    date: 'July 18, 2026',
    verified: true,
  },
  {
    id: 4,
    name: 'Zainab Khan',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Excellent customer service and fast delivery. All Hajj essentials in the kit were of high quality. Thank you, Mishkwat, for making our journey smooth.',
    date: 'June 30, 2026',
    verified: true,
  },
  {
    id: 5,
    name: 'Yousef Ahmed',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Very pleased with the quality of the premium Hajj guides. Customization with our brand name was perfect for our tour group. Will order again next season.',
    date: 'June 25, 2026',
    verified: true,
  },
];

const CustomerReviewsSection = () => {
  return (
    <section className="py-20 bg-background transition-colors duration-300 relative overflow-hidden border-t border-white/5">
      {/* Visual background flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-text">
            What Our Customers Say
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Hear from verified customers about their sacred experiences and the quality of our premium Islamic products.
          </p>
        </div>

        {/* Swiper Slider */}
        <div className="reviews-swiper-container relative px-4 sm:px-8">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true, el: '.custom-swiper-pagination' }}
            navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {dummyReviews.map((review) => (
              <SwiperSlide key={review.id} className="h-auto">
                <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between h-full bg-surface/30 backdrop-blur-sm shadow-lg hover:border-primary/20 transition-all duration-300">
                  <div className="space-y-4 text-left">
                    {/* Stars & Verified */}
                    <div className="flex items-center justify-between">
                      <Rating value={review.rating} size={14} />
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/10">
                          <FiCheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-text-muted text-sm leading-relaxed italic">
                      "{review.text}"
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/5">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      loading="lazy"
                    />
                    <div className="text-left">
                      <h4 className="font-sans font-bold text-text text-sm">{review.name}</h4>
                      {review.date && (
                        <p className="text-[10px] text-text-muted mt-0.5">{review.date}</p>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation and Pagination Controls */}
          <div className="flex items-center justify-center gap-6 mt-4 relative z-20">
            <button className="swiper-button-prev-custom w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer">
              ←
            </button>
            <div className="custom-swiper-pagination flex gap-2 items-center justify-center"></div>
            <button className="swiper-button-next-custom w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsSection;
