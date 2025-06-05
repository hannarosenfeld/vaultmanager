import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../components/WarehouseCard/ConfirmDeleteWarehouseModal";
import WarehouseCard from "../components/WarehouseCard/WarehouseCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage({ warehouses, loading }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Show spinner if loading is true or warehouses are not loaded yet
  if (loading || !warehouses) {
    return <LoadingSpinner />;
  }

  const openDeleteModal = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedWarehouse(null);
  };

  const handleAddWarehouse = () => {
    navigate("/add-warehouse");
  };

  return (
    <div className="w-full h-full p-4">
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses && Object.values(warehouses).map((warehouse) => (
            <WarehouseCard key={warehouse.id} openDeleteModal={openDeleteModal} warehouse={warehouse}/>
          ))}
        </div>
        <div className="mt-5">
          <button
            onClick={handleAddWarehouse}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 group w-full text-gray-600 cursor-pointer"
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
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteModal warehouse={selectedWarehouse} onClose={closeDeleteModal} />
      )}
    </div>
  );
}