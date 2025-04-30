import React from "react";
import AddPalletButton from "./AddPalletButton";

function RackInfo({ selectedRack, handleAddPalletClick }) {
  return (
    <div className="grid grid-rows-3 border-r border-gray-300">
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
            <div className="flex-grow flex items-center">
              {shelf.pallets?.length ? (
                <div>
                  <span className="text-sm font-medium">
                    {shelf.pallets[0].customerName}
                  </span>
                  <span className="text-sm font-medium">
                    {" "}
                    {shelf.pallets[0].palletNumber}
                  </span>
                </div>
              ) : (
                <AddPalletButton onClick={() => handleAddPalletClick(shelf)} />
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="p-2 text-center text-gray-500">Rack has no shelves</div>
      )}
    </div>
  );
}

export default RackInfo;
