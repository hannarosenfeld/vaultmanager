import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/session"; // Import the logout action

export default function NavDrawer({ open, setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouseArr = Object.values(warehouses);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  const handleAddWarehouse = () => {
    setOpen(false);
    navigate("/add-warehouse");
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            {/* Drawer Panel */}
            <DialogPanel
              className={`pointer-events-auto relative w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Drawer Content */}
              <div className="p-4 flex flex-col h-full">
                <DialogTitle className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Menu
                </DialogTitle>
                <nav className="mt-4 space-y-2 flex-grow">
                  {/* Loop through warehouses and create dynamic links */}
                  {warehouseArr.map((warehouse) => (
                    <Link
                      key={warehouse.id}
                      to={`/warehouse/${warehouse.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      <span className="material-symbols-outlined">
                        warehouse
                      </span>
                      <span className="ml-3">{warehouse.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleAddWarehouse}
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span className="ml-3">Add Warehouse</span>
                  </button>

                  <Link
                    to="/stage"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <span className="material-symbols-outlined">package_2</span>
                    <span className="ml-3">Stage</span>
                  </Link>
                  <Link
                    to="/statistics"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <span className="material-symbols-outlined">
                      monitoring
                    </span>
                    <span className="ml-3">Statistics</span>
                  </Link>

                  <Link
                    to="/print-studio"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <span className="material-symbols-outlined">print</span>
                    <span className="ml-3">Print Studio</span>
                  </Link>
                </nav>

                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full mt-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}