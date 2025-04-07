import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseFieldGrid from "../components/EditWarehouse/EditWarehouseFieldGrid";
import { setCurrentWarehouse, editFieldCapacityThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import ActionButton from "../components/EditWarehouse/ActionButton";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse"); // New state for toggle

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) =>
        w.name.toLowerCase().split(" ").join("-") ===
        warehouseName.toLowerCase()
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [dispatch, warehouseName, warehouses]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const openModal = (dir, operation) => {
    setModalProps({ dir, operation, warehouseId: warehouse.id });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const fieldCapacity = document.getElementById("field_capacity").value;
    if (fieldCapacity > 10) {
      alert("Field capacity cannot exceed 10.");
      return;
    }
    dispatch(editFieldCapacityThunk(warehouse.id, fieldCapacity))
      .then((response) => {
        if (response.error) {
          alert("Error updating field capacity: " + response.error);
        } else {
          alert("Field capacity updated successfully!");
        }
      })
      .catch((error) => {
        console.error("Error updating field capacity:", error);
      });
  };

  return (
    <div className="flex flex-col items-center h-full mt-3">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2> {/* Move warehouse name above */}
      <div className="mb-6 w-full max-w-md p-4 border border-gray-300 rounded-lg flex flex-col items-center"> {/* Add border */}
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <span className="mr-2">Warehouse</span>
            <div
              className={`relative inline-block w-12 h-6 ${
                viewMode === "Rack" ? "bg-blue-600" : "bg-gray-300"
              } rounded-full cursor-pointer`}
              onClick={() =>
                setViewMode(viewMode === "Warehouse" ? "Rack" : "Warehouse")
              }
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  viewMode === "Rack" ? "transform translate-x-6" : ""
                }`}
              ></div>
            </div>
            <span className="ml-2">Rack</span>
          </label>
        </div>
        <div className="mt-4 w-full flex">
          <div className="flex-grow">
            <input
              type="number"
              id="field_capacity"
              max="10"
              className="border border-gray-300 text-sm rounded-lg w-full p-2.5"
              placeholder="Field Capacity"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="ml-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Submit
          </button>
        </div>
      </div>

      {viewMode === "Warehouse" ? (
        <>
          <div className="flex w-full mt-4 justify-center">
            <div className="flex flex-col items-center mx-1 justify-center">
              <ActionButton
                onClick={() => openModal("left", "plus")}
                icon="add"
              />
              <ActionButton
                onClick={() => openModal("left", "minus")}
                icon="remove"
              />
            </div>
            <div className="flex-grow flex justify-center">
              <EditWarehouseFieldGrid warehouse={warehouse} />
            </div>
            <div className="flex flex-col items-center mx-1 justify-center">
              <ActionButton
                onClick={() => openModal("right", "plus")}
                icon="add"
              />
              <ActionButton
                onClick={() => openModal("right", "minus")}
                icon="remove"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 justify-center">
            <ActionButton
              onClick={() => openModal("bottom", "plus")}
              icon="add"
            />
            <ActionButton
              onClick={() => openModal("bottom", "minus")}
              icon="remove"
            />
          </div>
        </>
      ) : (
        <div className="mt-6 text-lg font-semibold">Rack View</div>
      )}

      {isModalOpen && (
        <EditWarehouseModal
          {...modalProps}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
