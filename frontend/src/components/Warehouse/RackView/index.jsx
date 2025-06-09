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
}) {
  const dispatch = useDispatch();
  const selectedRack = useSelector((state) => state.rack.currentRack);

  function handleRackClick(rack) {
    dispatch(setCurrentRack(rack));
  }

  function handleAddPalletClick(shelf, slotIndex) {
    console.log("❤️ you clicked on a shelf to add a pallet:", shelf);
    console.log("Add Pallet Button slotIndex:", slotIndex);
    if (shelf.pallets?.length >= shelf.capacity) {
      alert(`This shelf already has the maximum number of pallets (${shelf.capacity}).`);
      return;
    }
    setSelectedShelf(shelf.id);
    setSelectedSlotIndex(slotIndex); // <-- Set slot index in parent state
    setIsModalOpen(true);
  }

  function getRackColor(rack) {
    const totalPallets = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.pallets?.length || 0),
      0
    );
    const totalCapacity = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.capacity || 0),
      0
    );
    const fillPercentage = totalCapacity > 0 ? totalPallets / totalCapacity : 0;
    if (fillPercentage >= 1) return "var(--color-full)";
    if (fillPercentage > 0.5) return "var(--color-warning)";
    return "var(--color-success)";
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
        style={{ aspectRatio: warehouse.width / warehouse.length }}
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
                  border: selectedRack?.id === rack.id
                    ? "2px solid var(--color-primary)"
                    : "1px solid #e5e7eb",
                  boxShadow: selectedRack?.id === rack.id
                    ? "0 4px 16px 0 rgba(30, 64, 175, 0.12)"
                    : "0 1px 4px 0 rgba(30, 64, 175, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, border 0.2s",
                }}
                onClick={() => handleRackClick(rack)}
              >
                <span
                  className="text-xs text-center font-semibold text-white drop-shadow"
                  style={{
                    writingMode: isHorizontal
                      ? "horizontal-tb"
                      : "vertical-rl",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    fontSize: "0.75rem",
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
