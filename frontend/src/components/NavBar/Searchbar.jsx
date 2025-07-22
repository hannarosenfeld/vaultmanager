import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchWarehouse, clearSearch } from "../../store/warehouse";
import { current } from "@reduxjs/toolkit";

function Searchbar() {
  const dispatch = useDispatch();
  const currentWarehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const currentView = useSelector((state) => state.warehouse.currentView);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pallets, setPallets] = useState([]);
  const [vaultNames, setVaultNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (currentWarehouse === null) {
      return;
    }
    if (currentWarehouse.customers) {
      setCustomers(Object.values(currentWarehouse.customers));
    }
    if (currentWarehouse.orders) {
      setOrders(Object.values(currentWarehouse.orders));
    }
    // Add vault names from all fields
    if (currentWarehouse.fields) {
      const fields = Object.values(currentWarehouse.fields);
      const vaults = fields.flatMap(field => Object.values(field.vaults || {}));
      setVaultNames(vaults.map(vault => vault.name).filter(Boolean));
    }
    if (currentWarehouse.racks) {
      const racks = Object.values(currentWarehouse.racks);
      const shelves = racks.flatMap(rack => Object.values(rack.shelves));
      const pallets = shelves.flatMap(shelf => Object.values(shelf.pallets));
      if (pallets.length > 0) {
        setPallets(pallets.map(pallet => pallet.palletNumber));
      }
    }
  }, [currentWarehouse]);

  useEffect(() => {
    return () => {
      dispatch(clearSearch());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value) {
      const customerSuggestions = customers.filter((customer) =>
        customer && customer.toLowerCase().includes(value.toLowerCase())
      ).map((customer) => ({ type: 'customer', name: customer }));
      const orderSuggestions = orders.filter((order) =>
        order && order.toLowerCase().includes(value.toLowerCase())
      ).map((order) => ({ type: 'order', name: order }));
      const vaultSuggestions = vaultNames.filter((vaultName) =>
        vaultName && vaultName.toLowerCase().includes(value.toLowerCase())
      ).map((vaultName) => ({ type: 'vault', name: vaultName }));
      setSuggestions([...customerSuggestions, ...orderSuggestions, ...vaultSuggestions]);
      setDropdownVisible(true);
    } else {
      setSuggestions([]);
      setDropdownVisible(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.name);
    dispatch(searchWarehouse(suggestion.name, suggestion.type));
    setDropdownVisible(false);
  };

  const handleClearSearch = () => {
    setSearch("");
    dispatch(clearSearch());
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center py-2">
      <form className="flex items-center mx-auto w-[95%] lg:w-[70%]" onSubmit={handleSearch}>
        <div className="relative w-full">
          <input
            type="text"
            id="simple-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-3 p-2.5"
            placeholder={currentView === "rack" ? "Search customer/pallet/vault number..." : "Search customer/order/vault number..."}
            value={search}
            onChange={handleChange}
            required
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={handleClearSearch}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          {dropdownVisible && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white divide-y divide-gray-100 rounded-lg shadow-sm mt-1 max-h-60 overflow-y-auto">
              <ul className="py-2 text-sm text-gray-700">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="material-symbols-outlined me-2 text-xs">
                        {suggestion.type === 'customer'
                          ? 'person'
                          : suggestion.type === 'order'
                          ? 'orders'
                          : 'inventory_2'} {/* vault icon */}
                      </span>
                      {suggestion.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </form>
    </div>
  );
}

export default Searchbar;