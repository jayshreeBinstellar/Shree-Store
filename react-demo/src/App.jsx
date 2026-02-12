import './App.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auth from './layout/Auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './layout/Main';
import { ProtectedRoute } from './context/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { SettingsProvider } from './context/SettingsContext';


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
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
            <Routes>
              <Route path='/main/*' element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              } />
              <Route path='*' element={<Auth />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
