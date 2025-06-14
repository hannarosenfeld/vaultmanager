import { useDispatch, useSelector } from "react-redux";
import { setCurrentRack } from "../../../store/rack";
import RackInfo from "./RackInfo";
import { useState } from "react";

function RackView({
  warehouse,
  racks,
  setIsModalOpen,
  setSelectedShelf,
  setSelectedSlotIndex, // <-- Accept as prop
  search,
}) {
  const dispatch = useDispatch();
  const selectedRack = useSelector((state) => state.rack.currentRack);

  function handleRackClick(rack) {
    dispatch(setCurrentRack(rack));
  }

  function handleAddPalletClick(shelf, slotIndex) {
    if (shelf.pallets?.length >= shelf.capacity) {
      alert(`This shelf already has the maximum number of pallets (${shelf.capacity}).`);
      return;
    }
    setSelectedShelf(shelf.id);
    setSelectedSlotIndex(slotIndex); // <-- Set slot index in parent state
    setIsModalOpen(true);
  }

  function getRackColor(rack) {
    // Count total occupied spots, not just number of pallets
    const totalOccupiedSpots = rack.shelves.reduce(
      (sum, shelf) =>
        sum +
        (shelf.pallets?.reduce(
          (p, pallet) => p + (pallet.shelfSpots || 1),
          0
        ) || 0),
      0
    );
    const totalCapacity = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.capacity || 0),
      0
    );
    const fillPercentage = totalCapacity > 0 ? totalOccupiedSpots / totalCapacity : 0;
    if (fillPercentage >= 1) return "var(--color-full)";
    if (fillPercentage > 0.5) return "var(--color-warning)";
    return "var(--color-success)";
  }

  // Helper to check if rack should be highlighted
  function isRackHighlighted(rack) {
    if (!search || !search.rackIds) return false;
    return search.rackIds.includes(rack.id);
  }

  // Helper to check if any rack is highlighted (search active)
  function isAnyRackHighlighted() {
    return search && Array.isArray(search.rackIds) && search.rackIds.length > 0;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="h-[90%] grid grid-cols-[65%_35%] bg-white shadow-lg border border-blue-100 p-6">
        <RackInfo
          selectedRack={selectedRack}
          handleAddPalletClick={handleAddPalletClick}
        />
        <div className="flex flex-col items-center justify-evenly p-4">
          {selectedRack ? (
            <div className="font-semibold text-2xl md:text-3xl text-center text-primary">
              {selectedRack.name}
            </div>
          ) : (
            <div className="text-center text-lg font-medium text-slate">
              Select a rack to view its info
            </div>
          )}
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden bg-background shadow border border-blue-100"
        style={{
          aspectRatio: warehouse.width / warehouse.length,
        }}
      >
        <div
          className="relative"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
            backgroundSize: `${(1 / warehouse.width) * 100}% ${
              (1 / warehouse.length) * 100
            }%`,
          }}
        >
          {/* Render FieldGrid representation */}
          <div
            className="absolute flex items-center justify-center border border-primary bg-background"
            style={{
              top: `${
                (warehouse.fieldgridLocation.y / warehouse.length) * 100
              }%`,
              left: `${
                (warehouse.fieldgridLocation.x / warehouse.width) * 100
              }%`,
              width: `${((warehouse.cols * 5) / warehouse.width) * 100}%`,
              height: `${((warehouse.rows * 5) / warehouse.length) * 100}%`,
              boxShadow: "0 2px 8px 0 rgba(30, 64, 175, 0.08)",
            }}
          >
            <span className="text-md text-primary font-semibold">VAULTS</span>
          </div>

          {/* Render Racks */}
          {racks.map((rack, index) => {
            const isHorizontal = rack.orientation === "horizontal";
            const rackWidth = isHorizontal ? rack.width : rack.length;
            const rackHeight = isHorizontal ? rack.length : rack.width;
            const highlighted = isRackHighlighted(rack);
            const anyHighlighted = isAnyRackHighlighted();
            const isSelected = selectedRack?.id === rack.id;

            // Visual style logic
            let border, boxShadow, filter, opacity, zIndex;
            if (anyHighlighted) {
              if (highlighted) {
                filter = "none";
                opacity = 1;
                zIndex = 2;
              } else {
                boxShadow = "none";
                filter = "grayscale(100%)";
                opacity = 0.4;
                zIndex = 1;
              }
            } else {
              filter = "none";
              opacity = 1;
              zIndex = isSelected ? 2 : 1;
            }

            // Always show a black border for the selected rack
            if (isSelected) {
              border = "2px solid black";
              boxShadow = "0 4px 16px 0 rgba(30, 64, 175, 0.12)";
            } else {
              border = "1px solid #e5e7eb";
              if (!boxShadow) {
                boxShadow = "0 1px 4px 0 rgba(30, 64, 175, 0.04)";
              }
            }

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: `${(rack.position.y / warehouse.length) * 100}%`,
                  left: `${(rack.position.x / warehouse.width) * 100}%`,
                  width: `${(rackWidth / warehouse.width) * 100}%`,
                  height: `${(rackHeight / warehouse.length) * 100}%`,
                  backgroundColor: getRackColor(rack),
                  border,
                  boxShadow,
                  filter,
                  opacity,
                  zIndex,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, border 0.2s, filter 0.2s, opacity 0.2s",
                  // padding: "0.25rem 0.5rem", // Removed padding
                }}
                onClick={() => handleRackClick(rack)}
              >
                <span
                  className="text-[0.60rem] text-center font-normal text-white drop-shadow"
                  style={{
                    writingMode: isHorizontal
                      ? "horizontal-tb"
                      : "vertical-rl",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    fontWeight: 400, // normal
                  }}
                >
                  {rack.name.length > 10
                    ? `${rack.name.slice(0, 10)}...`
                    : rack.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Render PalletForm modal (add this at the bottom of your return, or wherever you render the modal) */}
      {/* <PalletForm ... selectedSlotIndex={selectedSlotIndex} ... /> */}
    </div>
  );
}

export default RackView;
