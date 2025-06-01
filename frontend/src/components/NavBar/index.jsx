import { useState } from 'react';
import { Disclosure, Menu, MenuButton } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import NavDrawer from './NavDrawer';
import logo from "../../assets/no_background_logo.png";
import Searchbar from './Searchbar';

export default function NavBar() {
  const [openDrawer, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isWarehousePage = location.pathname.startsWith('/warehouse/');

  return (
    <Disclosure as="nav">
      <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img
                alt="Warehouse Manager Logo"
                src={logo}
                className="w-[3em]"
              />
            </Link>
          </div>
          {isWarehousePage && (
            <div className="flex-grow mx-4">
              <Searchbar />
            </div>
          )}
          <div className="flex items-center space-x-4">
            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <MenuButton
                  className="flex text-sm focus:outline-none cursor-pointer"
                  onClick={() => setDrawerOpen(true)}
                >
                  <span className="sr-only">Open user menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </MenuButton>
              </div>
            </Menu>
          </div>
        </div>
      </div>
      <NavDrawer open={openDrawer} setOpen={setDrawerOpen} />
    </Disclosure>
  );
}