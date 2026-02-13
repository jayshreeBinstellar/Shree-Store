import './App.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auth from './layout/Auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Main from './layout/Main';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { SettingsProvider } from './context/SettingsContext';

import { ShopProvider } from './context/ShopContext';
import { Toaster } from 'react-hot-toast';


function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  return (
    <AuthProvider>
      <SettingsProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
            <ShopProvider>
              <Routes>
                <Route path='/main/*' element={<Main />} />
                <Route path='/auth/*' element={<Auth />} />
                <Route path='/' element={<Navigate to="/main/dashboard" replace />} />
                <Route path='*' element={<Navigate to="/main/dashboard" replace />} />
              </Routes>
            </ShopProvider>
          </CartProvider>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
