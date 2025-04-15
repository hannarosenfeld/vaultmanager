import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";
import WarehouseView from "../components/EditWarehouse/WarehouseView";
import RackView from "../components/EditWarehouse/RackView";
import { setCurrentWarehouse, editFieldCapacityThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import DragAndDropFieldGrid from "../components/EditWarehouse/DragAndDropFieldGrid";
import axios from "axios";
import { throttle } from "lodash";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector((state) => state.warehouse.warehouses, shallowEqual);
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse, shallowEqual);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse");
  const [fieldGridPosition, setFieldGridPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) => w.name.toLowerCase().split(" ").join("-") === warehouseName.toLowerCase()
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setFieldGridPosition({
        x: foundWarehouse.fieldgridLocation?.x || 0,
        y: foundWarehouse.fieldgridLocation?.y || 0,
      });
    }
    setLoading(false);
  }, [dispatch, warehouseName, warehouses]);

  const openModal = (dir, operation) => {
    setModalProps({ dir, operation, warehouseId: warehouse.id });
    setIsModalOpen(true);
  };

  const handleSubmit = (fieldCapacity) => {
    dispatch(editFieldCapacityThunk(warehouse.id, fieldCapacity)).then((response) => {
      if (response.error) {
        alert("Error updating field capacity: " + response.error);
      } else {
        alert("Field capacity updated successfully!");
      }
    });
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    setIsDragging(true);
  };

  const handleDrag = useCallback(
    throttle((e) => {
      const warehouseEl = e.target.closest(".warehouse-grid");
      if (!warehouseEl) return;
      const rect = warehouseEl.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

      const clampedX = Math.max(0, Math.min(x, warehouse.width - warehouse.cols * 5));
      const clampedY = Math.max(0, Math.min(y, warehouse.length - warehouse.rows * 5));

      setDragPreviewPosition({ x: clampedX, y: clampedY });
    }, 100),
    [warehouse]
  );

  const updateFieldGridPosition = async (warehouseId, position) => {
    try {
      await axios.put(`/api/warehouse/${warehouseId}/field-grid`, {
        fieldgridLocation: position,
      });
    } catch (error) {
      console.error("Error updating field grid position:", error);
    }
  };

  const handleDragEnd = (e) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const clampedX = Math.max(0, Math.min(x, warehouse.width - warehouse.cols * 5));
    const clampedY = Math.max(0, Math.min(y, warehouse.length - warehouse.rows * 5));

    setFieldGridPosition({ x: clampedX, y: clampedY });
    setIsDragging(false);
    setDragPreviewPosition(null);

    updateFieldGridPosition(warehouse.id, { x: clampedX, y: clampedY });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col items-center h-full mt-3">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>

      {/* Warehouse Visual */}
      <div className="flex flex-col items-center w-full grow p-2 mb-10">
        <div className="relative w-full aspect-[4/3] max-w-5xl border border-black overflow-hidden bg-white">
          <div
            className="warehouse-grid"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              backgroundImage: "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
              backgroundSize: `${100 / warehouse.width}% ${100 / warehouse.length}%`,
            }}
          >
            {/* Drag preview */}
            {isDragging && dragPreviewPosition && (
              <div
                style={{
                  position: "absolute",
                  top: `${(dragPreviewPosition.y / warehouse.length) * 100}%`,
                  left: `${(dragPreviewPosition.x / warehouse.width) * 100}%`,
                  width: `${(warehouse.cols * 5) / warehouse.width * 100}%`,
                  height: `${(warehouse.rows * 5) / warehouse.length * 100}%`,
                  backgroundColor: "rgba(0, 0, 255, 0.2)",
                  border: "2px dashed blue",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Field Grid */}
            <div
              draggable
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                position: "absolute",
                top: `${(fieldGridPosition.y / warehouse.length) * 100}%`,
                left: `${(fieldGridPosition.x / warehouse.width) * 100}%`,
                width: `${(warehouse.cols * 5) / warehouse.width * 100}%`,
                height: `${(warehouse.rows * 5) / warehouse.length * 100}%`,
                cursor: "grab",
                border: "1px solid blue",
                backgroundColor: "rgba(0, 0, 255, 0.1)",
              }}
            >
              <DragAndDropFieldGrid warehouse={warehouse} />
            </div>
          </div>
        </div>
        <p className="text-sm mt-2">{`${warehouse.width} ft x ${warehouse.length} ft`}</p>
      </div>

      <ToggleBox viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === "Warehouse" ? (
        <WarehouseView warehouse={warehouse} openModal={openModal} handleSubmit={handleSubmit} />
      ) : (
        <RackView warehouse={warehouse} />
      )}

      {isModalOpen && (
        <EditWarehouseModal {...modalProps} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
