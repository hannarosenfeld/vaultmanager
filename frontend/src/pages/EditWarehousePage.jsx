import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";
import WarehouseView from "../components/EditWarehouse/WarehouseView";
import RackView from "../components/EditWarehouse/RackView";
import { setCurrentWarehouse, editFieldCapacityThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";

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

  // Calculate the aspect ratio of the warehouse
  const aspectRatio = warehouse.width / warehouse.length;

  return (
    <div className="flex flex-col items-center h-full mt-3">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>

      {/* Render the warehouse shape */}
      <div className="flex flex-col justify-center items-center w-full grow p-2 mb-10">
        <div className="flex justify-center items-center w-full grow p-2">
          <div
            style={{
              flexGrow: 1,
              aspectRatio: `${warehouse.width} / ${warehouse.length}`,
              border: "2px solid black",
              backgroundColor: "#f0f0f0",
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${warehouse.width}, 1fr)`,
              gridTemplateRows: `repeat(${warehouse.length}, 1fr)`,
            }}
          >
            {Array.from({ length: warehouse.width * warehouse.length }).map(
              (_, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                ></div>
              )
            )}
          </div>
        </div>

        <p className="text-sm">
          {warehouse.width && warehouse.length
            ? `${warehouse.width} ft x ${warehouse.length} ft`
            : "No dimensions available"}
        </p>
      </div>
      {/* Toggle between Warehouse and Rack views */}
      <ToggleBox viewMode={viewMode} setViewMode={setViewMode} />
      {viewMode === "Warehouse" ? (
        <WarehouseView
          warehouse={warehouse}
          openModal={openModal}
          handleSubmit={handleSubmit}
        />
      ) : (
        <RackView warehouse={warehouse} />
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