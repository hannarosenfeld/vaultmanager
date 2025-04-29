import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse, setCurrentField } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import FieldGrid from "../components/Warehouse/FieldGrid";
import FieldInfo from "../components/Warehouse/FieldInfo";
import { getCurrentFieldThunk } from "../store/warehouse";
import { fetchRacksThunk, addPalletThunk } from "../store/rack"; // Import the fetchRacksThunk
import AddPalletButton from "../components/Warehouse/AddPalletButton";

function WarehousePage() {
  const { warehouseName } = useParams();
  const dispatch = useDispatch();
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [fieldsArr, setFieldsArr] = useState(null);
  const selectedField = useSelector((state) => state.warehouse.currentField);
  const [loading, setLoading] = useState(true);
  const [isWarehouseView, setIsWarehouseView] = useState(true); // Toggle state
  const racks = useSelector((state) => state.rack.racks); // Fetch racks from Redux
  const [selectedRack, setSelectedRack] = useState(null); // State for selected rack
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedShelf, setSelectedShelf] = useState(null); // State for selected shelf

  function handleFieldClick(field) {
    if (field.id) dispatch(getCurrentFieldThunk(field));
  }

  function handleRackClick(rack) {
    setSelectedRack(rack); // Set the clicked rack as selected
  }

  function handleAddPalletClick(shelf) {
    setSelectedShelf(shelf); // Set the selected shelf
    setIsModalOpen(true); // Open the modal
  }

  function closeModal() {
    setIsModalOpen(false); // Close the modal
    setSelectedShelf(null); // Clear the selected shelf
  }

  async function handleAddPallet(palletData) {
    const updatedShelf = await dispatch(
      addPalletThunk(selectedShelf.id, palletData)
    ); // Dispatch thunk to add pallet
    if (updatedShelf) {
      setSelectedRack((prevRack) => ({
        ...prevRack,
        shelves: prevRack.shelves.map((shelf) =>
          shelf.id === updatedShelf.id ? updatedShelf : shelf
        ),
      })); // Update the selected rack with the updated shelf
    }
    closeModal();
  }

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) => w.name.toLowerCase().split(" ").join("-") === warehouseName
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setFieldsArr(Object.values(foundWarehouse.fields));
    }
    setLoading(false);

    return () => {
      dispatch(setCurrentWarehouse(null));
    };
  }, [dispatch, warehouseName, warehouses]);

  useEffect(() => {
    if (warehouse?.id) {
      dispatch(fetchRacksThunk(warehouse.id)); // Fetch racks for the warehouse
    }
  }, [dispatch, warehouse?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!warehouse) {
    return <div>Warehouse could not be fetched</div>;
  }

  return (
    <div className="flex flex-col max-w-[100vw] p-4">
      <h1 className="text-xl font-bold mb-2 text-center">{warehouse.name}</h1>
      {/* Toggle switch */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-l ${
            isWarehouseView ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setIsWarehouseView(true)}
        >
          Warehouse View
        </button>
        <button
          className={`px-4 py-2 rounded-r ${
            !isWarehouseView ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setIsWarehouseView(false)}
        >
          Rack View
        </button>
      </div>
      {!isWarehouseView ? (
        <>
          {/* Rack View */}
          <div className="h-[90%] grid grid-cols-[65%_35%]">
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
                          <span className="text-sm font-medium"> {shelf.pallets[0].palletNumber}</span>
                        </div>
                      ) : (
                        <AddPalletButton
                          onClick={() => handleAddPalletClick(shelf)}
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">
                  Rack has no shelves
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-evenly p-2">
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
                </>
              ) : (
                <div className="text-center">
                  Select a rack to view its info
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
              {/* Render FieldGrid */}
              {fieldsArr.length ? (
                <div
                  className="absolute flex items-center justify-center border border-blue-500 bg-blue-100"
                  style={{
                    top: `${
                      (warehouse.fieldgridLocation.y / warehouse.length) * 100
                    }%`,
                    left: `${
                      (warehouse.fieldgridLocation.x / warehouse.width) * 100
                    }%`,
                    width: `${((warehouse.cols * 5) / warehouse.width) * 100}%`, // Match VAULT_SIZE_FT scaling
                    height: `${
                      ((warehouse.rows * 5) / warehouse.length) * 100
                    }%`, // Match VAULT_SIZE_FT scaling
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
                      cursor: "pointer", // Add pointer cursor for clickable racks
                    }}
                    onClick={() => handleRackClick(rack)} // Handle rack click
                  >
                    <span
                      className="text-xs text-center"
                      style={{
                        writingMode: isHorizontal
                          ? "horizontal-tb"
                          : "vertical-rl", // Adjust text orientation
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        fontSize: "0.75rem", // Smaller font size
                      }}
                    >
                      {rack.name.length > 10
                        ? `${rack.name.slice(0, 10)}...`
                        : rack.name}{" "}
                      {/* Truncate after 10 chars */}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Modal for adding pallet */}
          {isModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }} // Semi-black background
            >
              <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-bold mb-2">Add Pallet</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const palletData = Object.fromEntries(formData.entries());
                    palletData.name = `${selectedRack?.name || "Unnamed Rack"}-${selectedShelf?.id || "Shelf"}`; // Set name explicitly
                    palletData.weight = 0; // Explicitly set weight to 0
                    if (!palletData.customer_name) {
                      alert("Customer name is required.");
                      return;
                    }
                    console.log("💖 Modified Pallet Data:", palletData); // Debugging: Log payload
                    handleAddPallet(palletData);
                  }}
                >
                  {/* Removed Weight Field */}
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
      ) : (
        <>
          {/* Warehouse View */}
          <div className="h-[25vh]">
            {selectedField ? (
              <FieldInfo field={selectedField} />
            ) : (
              "Select a field to view its info"
            )}
          </div>
          <div className="flex-grow max-w-full overflow-x-hidden">
            {fieldsArr.length ? (
              <FieldGrid
                warehouse={warehouse}
                handleFieldClick={handleFieldClick}
                style={{ maxWidth: "65vw", margin: "0 auto" }}
                currentField={selectedField?.id ? selectedField.id : null}
              />
            ) : (
              "This warehouse does not have any fields"
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WarehousePage;
