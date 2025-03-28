import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StageToWareHouseModal from "../components/Stage/StageToWarehouseModal";
import ConfirmDeleteVaultModal from "../components/Stage/ConfirmDeleteVaultModal";
import { deleteVaultThunk } from "../store/warehouse";

export default function Stage() {
  const dispatch = useDispatch();
  const stagedVaults = useSelector((state) => state.stage.stagedVaults);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [isDeleteModeOn, setIsDeleteModeOn] = useState(false);
  const [vaultsToDelete, setVaultsToDelete] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // dispatch(getVaultsThunk());
  }, [dispatch]);

  const openModal = (vault) => {
    setSelectedVault(vault);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVault(null);
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(
        vaultsToDelete.map((vault) => dispatch(deleteVaultThunk(vault.id)))
      );
      setVaultsToDelete([]);
      setIsDeleteModalOpen(false);
      setIsDeleteModeOn(false);
      console.log("Vaults deleted!");
    } catch (error) {
      console.error("Error deleting vaults:", error);
    }
  };

  const handleToggleDeleteMode = (event) => {
    setIsDeleteModeOn(event.target.checked);
  };

  const handleVaultClick = (vault) => {
    if (!isDeleteModeOn) {
      openModal(vault);
    } else {
      setVaultsToDelete((prevVaults) => {
        const isVaultInList = prevVaults.some((v) => v.id === vault.id);
        if (isVaultInList) {
          return prevVaults.filter((v) => v.id !== vault.id);
        } else {
          return [...prevVaults, vault];
        }
      });
    }
  };

  return (
    <div className="px-4">
      <div
        className="min-h-[89vh] max-w-3xl mx-auto border-8 border-solid p-2"
        style={{
          borderImage: isDeleteModeOn
            ? "repeating-linear-gradient(-55deg, #000, #000 20px, #ff0000 20px, #ff0000 40px) 10"
            : "repeating-linear-gradient(-55deg, #000, #000 20px, #ffb101 20px, #ffb101 40px) 10",
        }}
      >
        <div className="flex justify-between items-center mb-2 h-12 border-2 rounded p-2">
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDeleteModeOn}
                onChange={handleToggleDeleteMode}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Delete mode{" "}
                {isDeleteModeOn ? (
                  <span className="text-red-600">ON</span>
                ) : (
                  <span className="text-green-600">OFF</span>
                )}
              </span>
            </label>
          </div>
          {isDeleteModeOn && (
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          )}
        </div>
        {Object.keys(stagedVaults).length === 0 ? (
          <p className="text-gray-500">No staged vaults available.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {Object.values(stagedVaults).map((vault) => (
              <div
                key={vault.id}
                className={`flex flex-col justify-center items-center p-2 border-2 border-gray-800 rounded shadow cursor-pointer hover:bg-gray-100 w-[calc(33.333%-1rem)] ${
                  isDeleteModeOn &&
                  vaultsToDelete.some((v) => v.id === vault.id)
                    ? "bg-red-500"
                    : "bg-yellow-400"
                }`}
                onClick={() => handleVaultClick(vault)}
              >
                <h2 className="text-xs text-blue-500 font-semibold">
                  #{vault.name}
                </h2>
                <p className="text-xs font-semibold text-gray-700 text-center">
                  {vault.customer_name}
                </p>
                {vault.order_name && (
                  <p className="text-xs text-gray-700 text-center">
                    [{vault.order_name}]
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <StageToWareHouseModal
          isOpen={isModalOpen}
          onClose={closeModal}
          vault={selectedVault}
        />
        <ConfirmDeleteVaultModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          handleDelete={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
