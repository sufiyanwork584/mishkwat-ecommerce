import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppWidget from '../common/WhatsAppWidget';
import PrayerTimesWidget from '../common/PrayerTimesWidget';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
      <PrayerTimesWidget />
    </div>
  );
};

export default MainLayout;
