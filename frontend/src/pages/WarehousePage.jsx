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
import RackView from "../components/Warehouse/RackView"; // Import the new RackView component

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
        <RackView
          warehouse={warehouse}
          racks={racks}
          selectedRack={selectedRack}
          setSelectedRack={setSelectedRack}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          selectedShelf={selectedShelf}
          setSelectedShelf={setSelectedShelf}
          handleAddPallet={handleAddPallet}
          closeModal={closeModal}
        />
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
