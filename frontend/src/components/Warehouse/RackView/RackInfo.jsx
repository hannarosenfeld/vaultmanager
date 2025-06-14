import React, { useState } from "react";
import AddPalletButton from "./AddPalletButton";
import PalletForm from "./PalletForm"; // Import PalletForm

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [isPalletFormOpen, setPalletFormOpen] = useState(false);
  const [editShelfId, setEditShelfId] = useState(null);

  const handlePalletClick = (pallet, shelfId) => {
    setSelectedPallet(pallet);
    setEditShelfId(shelfId);
    setPalletFormOpen(true);
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
              width: `${spots * 36}%`,
              minWidth: `${spots * 36}px`,
              gridColumn: `span ${spots}`,
              marginRight: "1px",
              marginLeft: "1px",
              padding: "6px 0",
              height: "48px",
            }}
            onClick={() => handlePalletClick(pallet, shelf.id)}
          >
            <span
              className="text-[9px] font-normal text-center"
              style={{
                maxWidth: "36px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {pallet.customerName && pallet.name
                ? `${pallet.customerName.length > 10 ? pallet.customerName.slice(0, 10) + "..." : pallet.customerName} - ${pallet.name.length > 10 ? pallet.name.slice(0, 10) + "..." : pallet.name}`
                : pallet.customerName
                  ? (pallet.customerName.length > 10 ? pallet.customerName.slice(0, 10) + "..." : pallet.customerName)
                  : (pallet.name && pallet.name.length > 10 ? pallet.name.slice(0, 10) + "..." : pallet.name)
              }
            </span>
            <span className="text-[9px] font-normal text-center">
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
              width: "36%",
              minWidth: "36px",
              marginRight: "1px",
              marginLeft: "1px",
              padding: "6px 0", // Match the pallet height
              height: "48px",
            }}
          >
            <AddPalletButton onClick={() => handleAddPalletClick(shelf, slotIndex)} />
          </div>
        );
      }
    }
    return slots;
  }

  const handleClosePalletForm = () => {
    setPalletFormOpen(false);
    setSelectedPallet(null);
    setEditShelfId(null);
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
                {/* Render shelf slots with multi-spot pallets */}
                {renderShelfSlots(shelf)}
              </div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
      {/* PalletForm for editing/deleting a pallet */}
      {isPalletFormOpen && selectedPallet && (
        <PalletForm
          isOpen={isPalletFormOpen}
          onClose={handleClosePalletForm}
          initialData={selectedPallet}
          selectedShelfId={editShelfId}
        />
      )}
    </>
  );
}

export default RackInfo;
