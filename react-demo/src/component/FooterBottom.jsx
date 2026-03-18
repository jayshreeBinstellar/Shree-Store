
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

import { useSettings } from '../context/SettingsContext';

const FooterBottom = () => {
  const { settings } = useSettings();
  return (
    <div className=" py-4  border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left: Copyright */}
          <div className="text-sm text-gray-600 text-center lg:text-left">
            <p>
              Copyright 2026 © All rights reserved.
              Powered by @{settings?.store_name || 'Shree'}.
            </p>
          </div>

          {/* Center: Footer menu */}
          <nav className="flex justify-center">
            <ul className="flex items-center gap-4 text-sm text-gray-600">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li className="text-gray-400">|</li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 transition"
                >
                  Terms and Conditions
                </a>
              </li>
              <li className="text-gray-400">|</li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 transition"
                >
                  Cookie
                </a>
              </li>
            </ul>
          </nav>

          {/* Social icons */}
          <ul className="flex items-center gap-3">
            <li>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                <FacebookOutlinedIcon fontSize="small" />
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/"
                target="_blank"
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                <TwitterIcon fontSize="small" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                <InstagramIcon fontSize="small" />
              </a>
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
}

export default FooterBottom