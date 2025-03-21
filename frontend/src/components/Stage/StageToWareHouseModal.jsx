import { useState, useEffect, use } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSelector } from "react-redux";
import FieldGrid from "../Warehouse/FieldGrid";
import FieldInfo from "../Warehouse/FieldInfo";

export default function StageToWareHouseModal({ isOpen, onClose, vault }) {
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouseArr = Object.values(warehouses);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => { 
    if (warehouseArr.length) {
      setSelectedWarehouse(warehouseArr[0]);
    }
  }, []);

  const handleFieldClick = (field) => {
    setSelectedField(field);
  };

  const onMove = async () => {
    try {
      // Move the vault logic here
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        onClose();
      }, 2000);
      setSelectedField(null);
    } catch (error) {
      console.error("Error moving vault:", error);
    }
  };

  if (!vault) return null;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="flex items-center justify-center min-h-screen">
          <DialogPanel className="bg-white p-6 rounded shadow-lg z-50 w-full max-w-4xl relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DialogTitle className="text-lg font-bold">
              Move Vault {vault.name} into {selectedWarehouse?.name}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {warehouseArr.length ? (
                warehouseArr.map((warehouse) => (
                  <button
                    key={warehouse.id}
                    type="button"
                    className={`text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
                      selectedWarehouse?.id === warehouse.id ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => setSelectedWarehouse(warehouse)}
                  >
                    {warehouse.name}
                  </button>
                ))
              ) : (
                <div>No warehouses found!</div>
              )}
            </div>
            {selectedWarehouse && (
              <>
                <div className="h-[20vh] mt-4">
                  {selectedField?.id ? (
                    <FieldInfo vaultId={vault.id} field={selectedField} isStage={true} onMove={onMove} />
                  ) : (
                    <div>Select a field to view details</div>
                  )}
                </div>
                <FieldGrid
                  warehouse={selectedWarehouse}
                  handleFieldClick={handleFieldClick}
                />
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="flex items-center justify-center min-h-screen">
          <DialogPanel className="bg-white p-6 rounded shadow-lg z-50 w-full max-w-md relative">
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-500 font-bold mt-2">Vault {vault.name} moved to warehouse</p>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}