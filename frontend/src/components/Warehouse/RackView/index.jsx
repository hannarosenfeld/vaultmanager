import { useDispatch, useSelector } from "react-redux";
import { setCurrentRack } from "../../../store/rack";
import RackInfo from "./RackInfo"; // Import RackInfo component

function RackView({
  warehouse,
  racks,
  setIsModalOpen,
  setSelectedShelf,

}) {
  const dispatch = useDispatch();
  const selectedRack = useSelector((state) => state.rack.currentRack);

  function handleRackClick(rack) {
    dispatch(setCurrentRack(rack));
  }

  function handleAddPalletClick(shelf) {
    // Correctly check the shelf's capacity
    if (shelf.pallets?.length >= shelf.capacity) {
      alert(`This shelf already has the maximum number of pallets (${shelf.capacity}).`);
      return;
    }
    setSelectedShelf(shelf.id); // Pass only the shelf ID
    setIsModalOpen(true);
  }

  function getRackColor(rack) {
    const totalPallets = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.pallets?.length || 0), // Count pallets on each shelf
      0
    );

    const totalCapacity = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.capacity || 0), // Sum up the capacities of all shelves
      0
    );

    const fillPercentage = totalCapacity > 0 ? totalPallets / totalCapacity : 0; // Avoid division by zero

    if (fillPercentage >= 1) return "var(--red)"; // Red for entirely full or over capacity
    if (fillPercentage > 0.5) return "var(--yellow)"; // Yellow for above 50% but not entirely full
    return "var(--green)"; // Green for less than or equal to 50% full
  }

  return (
    <>
      <div className="h-[90%] grid grid-cols-[65%_35%]">
        <RackInfo
          selectedRack={selectedRack}
          handleAddPalletClick={handleAddPalletClick}
        />
        <div className="flex flex-col items-center justify-center p-2">
          {selectedRack ? (
            <div className="font-semibold text-2xl md:text-3xl text-center">
              {selectedRack.name} {/* Display rack name when selected */}
            </div>
          ) : (
            <div className="text-center text-lg font-medium">
              Select a rack to view its info {/* Default text when no rack is selected */}
            </div>
          )}
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ aspectRatio: warehouse.width / warehouse.length }}
      >
        <div
          className="relative"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
            backgroundSize: `${(1 / warehouse.width) * 100}% ${
              (1 / warehouse.length) * 100
            }%`,
          }}
        >
          {/* Render FieldGrid representation */}
          <div
            className="absolute flex items-center justify-center border border-blue-500 bg-blue-100"
            style={{
              top: `${
                (warehouse.fieldgridLocation.y / warehouse.length) * 100
              }%`,
              left: `${
                (warehouse.fieldgridLocation.x / warehouse.width) * 100
              }%`,
              width: `${((warehouse.cols * 5) / warehouse.width) * 100}%`,
              height: `${((warehouse.rows * 5) / warehouse.length) * 100}%`,
            }}
          >
            <span className="text-md text-black">VAULTS</span>
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
                  backgroundColor: getRackColor(rack), // Use only dynamic color based on capacity
                  border: selectedRack?.id === rack.id
                    ? "2px solid blue" // Thicker blue border for active rack
                    : "none", // No border for non-active racks
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => handleRackClick(rack)}
              >
                <span
                  className="text-xs text-center"
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
     
    </>
  );
}

export default RackView;
