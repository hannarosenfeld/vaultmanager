import React from "react";
import AddPalletButton from "./AddPalletButton";

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;

  return (
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
            <div className="flex-grow flex items-center space-x-2">
              {shelf.pallets?.length ? (
                shelf.pallets.map((pallet, palletIndex) => (
                  <React.Fragment key={palletIndex}>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium">{pallet.customerName}</span>
                      <span className="text-xs font-medium">{pallet.palletNumber}</span>
                    </div>
                    {palletIndex < shelf.pallets.length - 1 && (
                      <div className="border-l border-gray-300 h-full mx-2"></div>
                    )}
                  </React.Fragment>
                ))
              ) : null}
              {shelf.pallets?.length > 0 && (
                <div className="border-l border-gray-300 h-full mx-2"></div>
              )}
              <AddPalletButton onClick={() => handleAddPalletClick(shelf)} />
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
