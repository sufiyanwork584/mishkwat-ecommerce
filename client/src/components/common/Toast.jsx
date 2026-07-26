import { Toaster } from 'react-hot-toast';

export const toastConfig = {
  duration: 3000,
  style: {
    background: '#1A1A2E',
    color: '#e2e8f0',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    borderRadius: '12px',
    width: '400px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
  },
  success: {
    iconTheme: { primary: '#00B894', secondary: '#fff' },
    style: { border: '1px solid rgba(0, 184, 148, 0.3)' },
  },
  error: {
    iconTheme: { primary: '#FF7675', secondary: '#fff' },
    style: { border: '1px solid rgba(255, 118, 117, 0.3)' },
  },
};
