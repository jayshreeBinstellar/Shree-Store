import { Link } from 'react-router-dom';

const FooterWidgets = () => {
  return (
    <div className=" py-10">
      <div className=" container mx-auto px-4">
        <div className="flex flex-wrap">

          {/* Widget */}
          <div className="w-full lg:w-1/4 px-3 mb-8">
            <h4 className="text-sm font-semibold uppercase mb-4">
              Our Shop
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/main/fashion" className="hover:text-black">Fashion</Link></li>
              <li><Link to="/main/electronics" className="hover:text-black">Electronics</Link></li>
              <li><Link to="/main/bag" className="hover:text-black">Bags & Accessories</Link></li>
              <li><Link to="/main/footwear" className="hover:text-black">Footwear</Link></li>
              <li><Link to="/main/grocery" className="hover:text-black">Grocery</Link></li>
              <li><Link to="/main/beauty" className="hover:text-black">Beauty & Skincare</Link></li>
            </ul>
          </div>

          {/* Widget */}
          <div className="w-full lg:w-1/4 px-3 mb-8">
            <h4 className="text-sm font-semibold uppercase mb-4">
              Help Center
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/main/contact" className="hover:text-black">Contact Support</Link></li>
              <li><Link to="/main/about" className="hover:text-black">How it Works</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Delivery Info</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Returns & Refunds</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Customer Service</Link></li>
            </ul>
          </div>

          {/* Widget */}
          <div className="w-full lg:w-1/4 px-3 mb-8">
            <h4 className="text-sm font-semibold uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/main/about" className="hover:text-black">About Us</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Our Partners</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Investors</Link></li>
              <li><Link to="/main/contact" className="hover:text-black">Careers</Link></li>
              <li><Link to="/main/dashboard" className="hover:text-black">Brand Assets</Link></li>
            </ul>
          </div>

          {/* Widget */}
          <div className="w-full lg:w-1/4 px-3 mb-8">
            <h4 className="text-sm font-semibold uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/main/dashboard" className="hover:text-black">Dashboard</Link></li>
              <li><Link to="/main/products" className="hover:text-black">All products</Link></li>
              <li><Link to="/main/contact" className="hover:text-black">Support</Link></li>
              <li><Link to="/main/about" className="hover:text-black">History</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FooterWidgets;