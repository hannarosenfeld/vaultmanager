import React, { useState } from "react";
import AddPalletButton from "./AddPalletButton";
import PalletForm from "./PalletForm"; // Import PalletForm

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;

  const [isPalletModalOpen, setPalletModalOpen] = useState(false);
  const [selectedPallet, setSelectedPallet] = useState(null);

  const handlePalletClick = (pallet) => {
    setSelectedPallet(pallet);
    setPalletModalOpen(true);
  };

  const closePalletModal = () => {
    setPalletModalOpen(false);
    setSelectedPallet(null);
  };

  const updatePalletInRack = (updatedPallet) => {
    if (!updatedPallet) {
      // Handle pallet deletion
      selectedRack.shelves = selectedRack.shelves.map((shelf) => ({
        ...shelf,
        pallets: shelf.pallets.filter((pallet) => pallet.id !== selectedPallet.id),
      }));
      return;
    }

    const updatedShelves = selectedRack.shelves.map((shelf) => {
      if (shelf.id === updatedPallet.shelfId) {
        return {
          ...shelf,
          pallets: shelf.pallets.map((pallet) =>
            pallet.id === updatedPallet.id ? updatedPallet : pallet
          ),
        };
      }
      return shelf;
    });

    selectedRack.shelves = updatedShelves; // Update the selectedRack directly
  };

  return (
    <>
      <div
        className={`grid grid-rows-${rowCount} border-r border-gray-300 mb-4`}
        style={{ height: `calc(${rowCount} * 80px)` }}
      >
        {selectedRack?.shelves?.length ? (
          selectedRack.shelves.map((shelf, index) => (
            <div
              key={index}
              className={`p-2 flex items-center justify-between ${
                index < selectedRack.shelves.length - 1
                  ? "border-b border-gray-300"
                  : ""
              }`}
            >
              <div className="text-sm w-[10%] flex items-center mr-1 lg:mr-0">
                {index + 1}
              </div>
              <div className="flex-grow flex items-center justify-start gap-2">
                {shelf.pallets?.length ? (
                  shelf.pallets.map((pallet, palletIndex) => (
                    <React.Fragment key={palletIndex}>
                      <div
                        className="flex flex-col items-center text-center w-[30%] cursor-pointer"
                        onClick={() => handlePalletClick(pallet)}
                      >
                        <span className="text-xs font-medium text-center">
                          {pallet.customerName.length > 8
                            ? `${pallet.customerName.slice(0, 8)}...`
                            : pallet.customerName}
                        </span>
                        <span className="text-xs font-medium text-center">
                          {pallet.palletNumber}
                        </span>
                      </div>
                    </React.Fragment>
                  ))
                ) : null}
                {shelf.pallets?.length < 3 && (
                  <div className="flex flex-col items-center text-center w-[30%]">
                    <AddPalletButton
                      onClick={() => handleAddPalletClick(shelf)}
                      disabled={shelf.pallets?.length >= 3} // Disable button if pallet limit is reached
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
      {isPalletModalOpen && (
        <PalletForm
          isOpen={isPalletModalOpen}
          onClose={closePalletModal}
          onSubmit={(updatedPallet) => {
            updatePalletInRack(updatedPallet); // Update the pallet in the UI
            closePalletModal();
          }}
          initialData={selectedPallet} // Pass selected pallet data
        />
      )}
    </>
  );
}

export default RackInfo;
