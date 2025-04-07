import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseFieldGrid from "../components/EditWarehouse/EditWarehouseFieldGrid";
import { setCurrentWarehouse, editFieldCapacityThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import ActionButton from "../components/EditWarehouse/ActionButton";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse");

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

  const handleSubmit = (fieldCapacity) => {
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
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>
      <ToggleBox
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSubmit={handleSubmit}
      />
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
