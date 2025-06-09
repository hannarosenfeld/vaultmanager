import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse, setCurrentField } from "../store/warehouse";
import { setCurrentRack } from "../store/rack"; // Import setCurrentRack
import LoadingSpinner from "../components/LoadingSpinner";
import FieldGrid from "../components/Warehouse/FieldGrid";
import FieldInfo from "../components/Warehouse/FieldInfo";
import { getCurrentFieldThunk } from "../store/warehouse";
import { fetchRacksThunk, addPalletThunk } from "../store/rack"; // Import fetchRacksThunk and addPalletThunk
import RackView from "../components/Warehouse/RackView"; // Import the new RackView component
import PalletForm from "../components/Warehouse/RackView/PalletForm"; // Import PalletForm

function WarehousePage() {
  const { warehouseName } = useParams();
  const dispatch = useDispatch();
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [fieldsArr, setFieldsArr] = useState([]); // Initialize as empty array
  const selectedField = useSelector((state) => state.warehouse.currentField);
  const [loading, setLoading] = useState(true);
  const [isWarehouseView, setIsWarehouseView] = useState(true); // Toggle state
  const racks = useSelector((state) => state.rack.racks); // Fetch racks from Redux
  const [isPalletFormOpen, setPalletFormOpen] = useState(false); // Use this for PalletForm
  const [selectedShelf, setSelectedShelf] = useState(null); // State for selected shelf
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null); // <-- Add this line

  function handleFieldClick(field) {
    if (field.id) dispatch(getCurrentFieldThunk(field));
  }

  // Update how you open the PalletForm modal to set slot index
  // For example, in your RackView or wherever you call setSelectedShelf/setPalletFormOpen:
  // setSelectedShelf(shelfId);
  // setSelectedSlotIndex(slotIndex);
  // setPalletFormOpen(true);

  function closePalletForm() {
    setPalletFormOpen(false);
    setSelectedShelf(null);
    setSelectedSlotIndex(null); // Reset slot index on close
  }

  async function handleAddPallet(palletData) {
    try {
      const updatedShelf = await dispatch(
        addPalletThunk({ shelfId: selectedShelf, ...palletData })
      ).unwrap();
      // Fetch racks again to update the UI with the new pallet
      if (warehouse?.id) {
        await dispatch(fetchRacksThunk(warehouse.id));
      }
    } catch (error) {
      console.error("❌ Failed to add pallet:", error);
    } finally {
      closePalletForm();
    }
  }

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses || {}).find(
      (w) => w.name && w.name.toLowerCase().split(" ").join("-") === warehouseName
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      // Defensive: ensure foundWarehouse.fields is an object or array
      if (foundWarehouse.fields && Object.keys(foundWarehouse.fields).length > 0) {
        setFieldsArr(Object.values(foundWarehouse.fields));
      } else {
        setFieldsArr([]);
      }
    } else {
      setFieldsArr([]);
    }
    setLoading(false);

    return () => {
      dispatch(setCurrentWarehouse(null));
      dispatch(setCurrentRack(null)); // Clear currentRack on unmount
    };
  }, [dispatch, warehouseName, warehouses]);

  useEffect(() => {
    // Only run if warehouse is defined and has an id
    if (warehouse && warehouse.id) {
      dispatch(fetchRacksThunk(warehouse.id));
    }
  }, [dispatch, warehouse?.id]);

  // Show spinner if warehouses are not loaded yet
  if (!warehouses || Object.keys(warehouses).length === 0) {
    return <LoadingSpinner />;
  }

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
            isWarehouseView ? "bg-primary text-white" : "bg-background text-primary border border-primary"
          }`}
          onClick={() => setIsWarehouseView(true)}
        >
          Warehouse View
        </button>
        <button
          className={`px-4 py-2 rounded-r ${
            !isWarehouseView ? "bg-primary text-white" : "bg-background text-primary border border-primary"
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
          isModalOpen={isPalletFormOpen}
          setIsModalOpen={setPalletFormOpen}
          selectedShelf={selectedShelf}
          setSelectedShelf={setSelectedShelf}
          setSelectedSlotIndex={setSelectedSlotIndex} // <-- Pass this down
          handleAddPallet={handleAddPallet}
          closeModal={closePalletForm}
        />
      ) : (
        <>
          {/* Warehouse View */}
          <div className="h-[25vh]">
            {selectedField ? (
              <FieldInfo field={selectedField} warehouse={warehouse}/>
            ) : (
              "Select a field to view its info"
            )}
          </div>
          <div className="flex-grow max-w-full overflow-x-hidden">
            {fieldsArr && fieldsArr.length ? (
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
      {/* Styled PalletForm Modal */}
      <PalletForm
        isOpen={isPalletFormOpen}
        onClose={closePalletForm}
        onSubmit={handleAddPallet}
        selectedShelfId={selectedShelf}
        selectedSlotIndex={selectedSlotIndex} // <-- Now this will be set!
      />
    </div>
  );
}

export default WarehousePage;
