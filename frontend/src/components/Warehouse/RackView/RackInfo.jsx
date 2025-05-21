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
    let slotIndex = 0;
    let palletIdx = 0;
    const pallets = shelf.pallets || [];
    while (slotIndex < shelf.capacity) {
      const pallet = pallets[palletIdx];
      if (pallet && (pallet.shelfSpots || pallet.shelfSpots === 0)) {
        const spots = pallet.shelfSpots || 1;
        if (slotIndex + spots <= shelf.capacity) {
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
          slotIndex += spots;
          palletIdx++;
          continue;
        }
      }
      // Empty slot or add button
      if (slotIndex === pallets.reduce((acc, p) => acc + (p.shelfSpots || 1), 0)) {
        slots.push(
          <div
            key={`add-pallet-${shelf.id}`}
            className="flex flex-col items-center text-center"
            style={{
              width: "30%",
              minWidth: "30px",
              marginRight: "2px",
            }}
          >
            <AddPalletButton onClick={() => handleAddPalletClick(shelf)} />
          </div>
        );
      } else {
        slots.push(
          <div
            key={`empty-${slotIndex}`}
            style={{
              width: "30%",
              minWidth: "30px",
              marginRight: "2px",
            }}
          />
        );
      }
      slotIndex++;
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
