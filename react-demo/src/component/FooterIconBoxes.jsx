import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

const FooterIconBoxes = () => { 
     return (
    <div className="border-b border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap">

          <div className="w-full md:w-1/2 lg:w-1/4">
            <div className="flex items-center gap-4  px-3 lg:border-r border-gray-200">
              <LocalGroceryStoreOutlinedIcon className="text-gray-600" />
              <span className="text-sm text-gray-800">
                Everyday fresh products
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/4">
            <div className="flex items-center gap-4 px-3 lg:border-r border-gray-200">
              <LocalShippingOutlinedIcon className="text-gray-600" />
              <span className="text-sm text-gray-800">
                Free delivery for order over $70
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/4">
            <div className="flex items-center gap-4 px-3 lg:border-r border-gray-200">
              <DiscountOutlinedIcon className="text-gray-600" />
              <span className="text-sm text-gray-800">
                Daily Mega Discounts
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/4">
            <div className="flex items-center gap-4 px-3">
              <AttachMoneyOutlinedIcon className="text-gray-600" />
              <span className="text-sm text-gray-800">
                Best price on the market
              </span>
            </div>
          </div>    

        </div>
      </div>
    </div>
  );
}

export default FooterIconBoxes;