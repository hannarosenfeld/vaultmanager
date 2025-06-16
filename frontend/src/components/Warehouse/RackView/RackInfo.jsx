import React, { useState } from "react";
import { useSelector } from "react-redux";
import AddPalletButton from "./AddPalletButton";
import PalletForm from "./PalletForm";

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [isPalletFormOpen, setPalletFormOpen] = useState(false);
  const [editShelfId, setEditShelfId] = useState(null);

  // Get search state from Redux
  const search = useSelector((state) => state.warehouse.search);

  // Helper: is any pallet highlighted (search active)
  function isAnyPalletHighlighted() {
    return search && Array.isArray(search.palletIds) && search.palletIds.length > 0;
  }

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

    const anyHighlighted = isAnyPalletHighlighted();

    // Render each slot explicitly by index
    for (let slotIndex = 0; slotIndex < shelf.capacity; slotIndex++) {
      const pallet = slotMap[slotIndex];
      if (pallet) {
        const spots = pallet.shelfSpots || 1;
        // Highlight if this pallet is in the search result (search.palletIds)
        const isHighlighted =
          search &&
          Array.isArray(search.palletIds) &&
          search.palletIds.includes(pallet.id);

        // Style logic for background/focus
        let filter, opacity, zIndex, border, boxShadow;
        if (anyHighlighted) {
          if (isHighlighted) {
            filter = "none";
            opacity = 1;
            zIndex = 2;
            boxShadow = "0 0 0 6px #2563eb33, 0 2px 16px 0 #2563eb22";
          } else {
            filter = "grayscale(100%)";
            opacity = 0.4;
            zIndex = 1;
            border = "1px solid #e5e7eb";
            boxShadow = "none";
          }
        } else {
          filter = "none";
          opacity = 1;
          zIndex = 1;
          border = "1px solid #e5e7eb";
          boxShadow = "0 1px 4px 0 rgba(30, 64, 175, 0.04)";
        }

        slots.push(
          <div
            key={`pallet-${pallet.id}`}
            className="flex flex-col items-center justify-center text-center bg-blue-100 rounded cursor-pointer"
            style={{
              width: `${spots * 36}%`,
              minWidth: `${spots * 36}px`,
              gridColumn: `span ${spots}`,
              marginRight: "1px",
              marginLeft: "1px",
              padding: "1px 0",
              height: "48px",
              filter,
              opacity,
              zIndex,
              border,
              boxShadow,
              transition: "box-shadow 0.2s, border 0.2s, filter 0.2s, opacity 0.2s",
            }}
            onClick={() => handlePalletClick(pallet, shelf.id)}
          >
            <span className="text-[9px] font-medium text-center">
              {pallet.customerName && pallet.name
                ? `${pallet.customerName.length > 8
                    ? pallet.customerName.slice(0, 8) + "..."
                    : pallet.customerName
                  } - ${pallet.name.length > 10
                    ? pallet.name.slice(0, 10) + "..."
                    : pallet.name
                  }`
                : pallet.customerName
                  ? (pallet.customerName.length > 8
                      ? pallet.customerName.slice(0, 8) + "..."
                      : pallet.customerName)
                  : (pallet.name && pallet.name.length > 10
                      ? pallet.name.slice(0, 10) + "..."
                      : pallet.name)
              }
            </span>
            <span className="text-[9px] font-medium text-center">
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
              padding: "6px 0",
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
