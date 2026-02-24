// import React, { useState, useEffect } from 'react'
import NewsLetter from "./NewsLetter";
import FooterIconBoxes from "./FooterIconBoxes";
import FooterWidgets from "./FooterWidgets";
import FooterBottom from "./FooterBottom";
// import { getBanners } from "../services/ShopService";

const Footer = () => {
  // const [banners, setBanners] = useState([]);

  // useEffect(() => {
  //   const fetchFooterBanners = async () => {
  //     try {
  //       const bannerData = await getBanners();
  //       if (bannerData.status === "success") {
  //         // Filter only active banners for footer
  //         const footerBanners = bannerData.banners.filter(
  //           b => b.is_active && b.position === 'footer'
  //         );
  //         setBanners(footerBanners);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch footer banners", err);
  //     }
  //   };

  //   fetchFooterBanners();
  // }, []);

  return (
    <footer className="w-full mt-auto">
      <NewsLetter />
      <FooterIconBoxes />
      <FooterWidgets />
      <FooterBottom />
    </footer>
  )
}

export default Footer
