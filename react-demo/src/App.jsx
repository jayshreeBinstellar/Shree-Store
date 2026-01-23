import './App.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auth from './layout/Auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './layout/Main';
import { ProtectedRoute } from './context/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { createContext, useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCountries } from './services/CommonService';

const MyContext = createContext();

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  const [country, setCountry] = useState([]);
  const countryList = async () => {
    try {
      const data = await getCountries();

      const countries = data.map(
        (item) => item.name.common
      );
      setCountry(countries);
      // console.log(countries);
    } catch (error) {
      console.log(error, "error");

    }
  }

  useEffect(() => {
    countryList();
  }, [])

  const values = {
    country
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop/>
        <MyContext.Provider value={values}>
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
        </MyContext.Provider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

export { MyContext }