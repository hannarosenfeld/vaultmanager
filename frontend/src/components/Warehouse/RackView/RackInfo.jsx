import React from "react";
import AddPalletButton from "./AddPalletButton";

function RackInfo({ selectedRack, handleAddPalletClick }) {
  const rowCount = selectedRack?.shelves?.length || 3;

  const handlePalletClick = (pallet) => {
    console.log("Pallet clicked:", pallet);
  };

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
            <div className="flex-grow flex items-center justify-start gap-2">
              {shelf.pallets?.length ? (
                shelf.pallets.map((pallet, palletIndex) => (
                  <React.Fragment key={palletIndex}>
                    <div
                      className="flex flex-col items-center text-center w-[30%]"
                      onClick={() => handlePalletClick(pallet)}
                    >
                      <span className="text-xs font-medium text-center">
                        {pallet.customerName}
                      </span>
                      <span className="text-xs font-medium text-center">
                        {pallet.palletNumber}
                      </span>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="text-gray-500 text-center">No pallets</div>
              )}
              {shelf.pallets?.length < 3 && (
                <div className="flex flex-col items-center text-center w-[30%]">
                  <AddPalletButton
                    onClick={() => handleAddPalletClick(shelf)}
                    disabled={shelf.pallets?.length >= 3} // Disable button if pallet limit is reached
                  />
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default RackInfo;
