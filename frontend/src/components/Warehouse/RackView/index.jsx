import RackInfo from "./RackInfo"; // Import RackInfo component

function RackView({
  warehouse,
  racks,
  selectedRack,
  setSelectedRack,
  isModalOpen,
  setIsModalOpen,
  selectedShelf,
  setSelectedShelf,
  handleAddPallet,
  closeModal,
}) {
  function handleRackClick(rack) {
    setSelectedRack(rack);
  }

  function handleAddPalletClick(shelf) {
    setSelectedShelf(shelf.id); // Pass only the shelf ID
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="h-[90%] grid grid-cols-[65%_35%]">
        <RackInfo
          selectedRack={selectedRack}
          handleAddPalletClick={handleAddPalletClick}
        />
        <div className="flex flex-col items-center justify-evenly p-2">
          {selectedRack ? (
            <>
              <div className="font-semibold text-2xl md:text-3xl text-center">
                {selectedRack.name}
              </div>
              {selectedShelf && (
                <RackInfo shelf={selectedShelf} /> // Render RackInfo
              )}
            </>
          ) : (
            <div className="text-center">Select a rack to view its info</div>
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
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
        >
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Add Pallet</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const palletData = Object.fromEntries(formData.entries());
                palletData.name = `${selectedRack?.name || "Unnamed Rack"}-${
                  selectedShelf?.id || "Shelf"
                }`;
                palletData.weight = 0;
                if (!palletData.customer_name) {
                  alert("Customer name is required.");
                  return;
                }
                handleAddPallet(palletData);
              }}
            >
              <div className="mb-2">
                <label className="block text-sm font-medium">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customer_name"
                  className="border rounded w-full p-1"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">
                  Pallet Number
                </label>
                <input
                  type="text"
                  name="pallet_number"
                  className="border rounded w-full p-1"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                  name="notes"
                  className="border rounded w-full p-1"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RackView;
