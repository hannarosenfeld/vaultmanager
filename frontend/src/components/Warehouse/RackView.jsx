import React, { useState } from "react";

function RackView({ warehouse, racks, selectedRack, handleRackClick, fieldsArr }) {
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);

  const handleAddShelfClick = () => {
    setIsAddShelfModalOpen(true);
  };

  const handleCloseAddShelfModal = () => {
    setIsAddShelfModalOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col"> {/* Stack vertically */}
      <div className="h-[25%] grid grid-cols-[65%_35%] border-b border-gray-300"> {/* Rack info and shelves */}
        <div className="grid grid-rows-3 border-r border-gray-300"> {/* Shelves */}
          {selectedRack?.shelves.length ? (
            selectedRack.shelves.map((_, index) => (
              <div
                key={index}
                className={`p-2 flex items-center justify-between ${
                  index < selectedRack.shelves.length - 1 ? "border-b border-gray-300" : ""
                }`}
              >
                <div className="text-sm w-[10%] flex items-center mr-4 lg:mr-0">
                  {index + 1} {/* Numerate shelves */}
                </div>
                <div className="flex-grow flex items-center">
                  {/* Placeholder for shelf content */}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 flex items-center justify-between border-b border-gray-300"> {/* Single shelf */}
              <div className="text-sm w-[10%] flex items-center mr-4 lg:mr-0">
                1 {/* Single shelf numeration */}
              </div>
              <div className="flex-grow flex items-center justify-center">
                <button
                  className="text-blue-500 hover:underline" // No background, blue text
                  onClick={handleAddShelfClick}
                >
                  + Add Shelf
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-evenly p-2"> {/* Rack info */}
          {selectedRack ? (
            <>
              <div className="font-semibold text-2xl md:text-3xl text-center">
                {selectedRack.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-4xl">
                  inventory
                </span>
              </div>
              {selectedRack.shelves.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                  {selectedRack.shelves.length} shelves
                </div>
              )}
            </>
          ) : (
            <div className="text-center">Select a rack to view its info</div>
          )}
        </div>
      </div>
      <div className="flex-grow w-full"> {/* Warehouse representation */}
        <div
          className="relative w-full h-0 overflow-hidden bg-white"
          style={{
            paddingTop: `${(warehouse.length / warehouse.width) * 100}%`, // Maintain aspect ratio using padding
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
              backgroundSize: `${(1 / warehouse.width) * 100}% ${(1 / warehouse.length) * 100}%`,
            }}
          >
            {/* Render FieldGrid */}
            {fieldsArr.length ? (
              <div
                className="absolute flex items-center justify-center border border-blue-500 bg-blue-100"
                style={{
                  top: `${(warehouse.fieldgridLocation.y / warehouse.length) * 100}%`,
                  left: `${(warehouse.fieldgridLocation.x / warehouse.width) * 100}%`,
                  width: `${((warehouse.cols * 5) / warehouse.width) * 100}%`, // Match VAULT_SIZE_FT scaling
                  height: `${((warehouse.rows * 5) / warehouse.length) * 100}%`, // Match VAULT_SIZE_FT scaling
                }}
              >
                <span className="text-md text-black">VAULTS</span>
              </div>
            ) : (
              "This warehouse does not have any fields"
            )}

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
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    border: "1px solid blue",
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
                      writingMode: isHorizontal ? "horizontal-tb" : "vertical-rl",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      fontSize: "0.75rem",
                    }}
                  >
                    {rack.name.length > 10 ? `${rack.name.slice(0, 10)}...` : rack.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isAddShelfModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Add Shelf</h2>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleCloseAddShelfModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RackView;
