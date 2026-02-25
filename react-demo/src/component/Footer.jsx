import NewsLetter from "./NewsLetter";
import FooterIconBoxes from "./FooterIconBoxes";
import FooterWidgets from "./FooterWidgets";
import FooterBottom from "./FooterBottom";

const Footer = () => {

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
