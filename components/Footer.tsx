import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a className="text-gray-400 hover:text-gray-500" href="#">
            <span className="sr-only">Facebook</span>
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                fillRule="evenodd"
              ></path>
            </svg>
          </a>
          <a className="text-gray-400 hover:text-gray-500" href="#">
            <span className="sr-only">Instagram</span>
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.161 14.54c.98.98 2.259 1.518 3.585 1.518s2.605-.537 3.585-1.518c.98-.98 1.518-2.259 1.518-3.585s-.537-2.605-1.518-3.585c-.98-.98-2.259-1.518-3.585-1.518s-2.605.537-3.585 1.518c-.98.98-1.518 2.259-1.518 3.585s.537 2.605 1.518 3.585zM12 6.42c-3.092 0-5.592 2.5-5.592 5.592S8.908 17.604 12 17.604s5.592-2.5 5.592-5.592S15.092 6.42 12 6.42zM16.53 7.441c-.815 0-1.479.664-1.479 1.479s.664 1.479 1.479 1.479 1.479-.664 1.479-1.479-.664-1.479-1.479-1.479z"
                fillRule="evenodd"
              ></path>
            </svg>
          </a>
          <a className="text-gray-400 hover:text-gray-500" href="#">
            <span className="sr-only">X</span>
            <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.682 10.623 20.239 3h-1.611l-5.705 6.47L8.188 3H3l6.972 10.007L3 21h1.611l6.075-6.946L15.812 21h5.188l-7.318-10.377Zm-2.07 2.955-.71-.996-5.46-7.66h2.483l4.464 6.247.71.996 5.71 8.05h-2.483l-4.712-6.645Z"></path>
            </svg>
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">© 2024 Fairy Tale Covers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;