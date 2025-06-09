import React, { useState } from "react";
import AddPalletButton from "./AddPalletButton";

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;
  const [selectedPallet, setSelectedPallet] = useState(null);

  const handlePalletClick = (pallet) => {
    setSelectedPallet(pallet);
    setPalletModalOpen(true);
  };

  // Helper to build shelf slots with multi-spot pallets
  function renderShelfSlots(shelf) {
    const slots = [];
    const pallets = shelf.pallets || [];
    // Map slotIndex to pallet for quick lookup
    const slotMap = {};
    pallets.forEach((pallet) => {
      const idx =
        pallet.slotIndex !== null && pallet.slotIndex !== undefined
          ? pallet.slotIndex
          : null;
      if (idx !== null && idx >= 0 && idx < shelf.capacity) {
        slotMap[idx] = pallet;
      }
    });
    // Render each slot explicitly by index
    for (let slotIndex = 0; slotIndex < shelf.capacity; slotIndex++) {
      const pallet = slotMap[slotIndex];
      if (pallet) {
        const spots = pallet.shelfSpots || 1;
        slots.push(
          <div
            key={`pallet-${pallet.id}`}
            className="flex flex-col items-center justify-center text-center bg-blue-100 border border-blue-300 rounded cursor-pointer"
            style={{
              width: `${spots * 30}%`,
              minWidth: `${spots * 30}px`,
              gridColumn: `span ${spots}`,
              marginRight: "2px",
            }}
            onClick={() => handlePalletClick(pallet)}
          >
            <span className="text-xs font-medium text-center">
              {pallet.customerName && pallet.customerName.length > 8
                ? `${pallet.customerName.slice(0, 8)}...`
                : pallet.customerName}
            </span>
            <span className="text-xs font-medium text-center">
              {pallet.palletNumber}
            </span>
          </div>
        );
        // If a pallet takes up multiple spots, skip those slots
        slotIndex += (pallet.shelfSpots || 1) - 1;
      } else {
        slots.push(
          <div
            key={`add-pallet-${shelf.id}-${slotIndex}`}
            className="flex flex-col items-center text-center"
            style={{
              width: "30%",
              minWidth: "30px",
              marginRight: "2px",
            }}
          >
            <AddPalletButton onClick={() => handleAddPalletClick(shelf, slotIndex)} />
          </div>
        );
      }
    }
    return slots;
  }

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
                {/* Render shelf slots with multi-spot pallets */}
                {renderShelfSlots(shelf)}
              </div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
}

export default RackInfo;
