import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";
import WarehouseView from "../components/EditWarehouse/WarehouseView";
import RackView from "../components/EditWarehouse/RackView";
import { setCurrentWarehouse, editFieldCapacityThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import EditWarehouseFieldGridDuplicated from "../components/EditWarehouse/EditWarehouseFieldGridDuplicated";
import axios from "axios";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse");
  const [fieldGridPosition, setFieldGridPosition] = useState({
    x: warehouse?.fieldGridX || 0,
    y: warehouse?.fieldGridY || 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) =>
        w.name.toLowerCase().split(" ").join("-") ===
        warehouseName.toLowerCase()
    );
    if (foundWarehouse) {
      console.log("Found warehouse:", foundWarehouse);
      dispatch(setCurrentWarehouse(foundWarehouse));
      setFieldGridPosition({
        x: foundWarehouse.fieldgridLocation?.x || 0,
        y: foundWarehouse.fieldgridLocation?.y || 0,
      });
      console.log("Initial field grid position set to:", {
        x: foundWarehouse.fieldgridLocation?.x || 0,
        y: foundWarehouse.fieldgridLocation?.y || 0,
      });
      setLoading(false);
    } else {
      console.log("Warehouse not found for name:", warehouseName);
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

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0); // Prevent default drag image
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    const warehouseElement = e.target.parentElement;
    const warehouseRect = warehouseElement.getBoundingClientRect();

    // Calculate preview position in feet
    const previewX = ((e.clientX - warehouseRect.left) / warehouseRect.width) * warehouse.width;
    const previewY = ((e.clientY - warehouseRect.top) / warehouseRect.height) * warehouse.length;

    // Ensure the preview stays within bounds
    const clampedX = Math.max(0, Math.min(previewX, warehouse.width - warehouse.cols * 5));
    const clampedY = Math.max(0, Math.min(previewY, warehouse.length - warehouse.rows * 5));

    setDragPreviewPosition({ x: clampedX, y: clampedY });
  };

  const updateFieldGridPosition = async (warehouseId, position) => {
    try {
      console.log("Updating field grid position to:", position);
      const response = await axios.put(`/api/warehouse/${warehouseId}/field-grid`, {
        fieldgridLocation: position,
      });
      console.log("Field grid position updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating field grid position:", error);
    }
  };

  const handleDragEnd = (e) => {
    const warehouseElement = e.target.parentElement;
    const warehouseRect = warehouseElement.getBoundingClientRect();

    // Calculate new position in feet
    const newX = ((e.clientX - warehouseRect.left) / warehouseRect.width) * warehouse.width;
    const newY = ((e.clientY - warehouseRect.top) / warehouseRect.height) * warehouse.length;

    // Ensure the grid stays within bounds
    const clampedX = Math.max(0, Math.min(newX, warehouse.width - warehouse.cols * 5));
    const clampedY = Math.max(0, Math.min(newY, warehouse.length - warehouse.rows * 5));

    console.log("Dragged to new position:", { x: clampedX, y: clampedY });

    setFieldGridPosition({ x: clampedX, y: clampedY });
    setIsDragging(false);
    setDragPreviewPosition(null);

    // Update the position in the backend
    updateFieldGridPosition(warehouse.id, { x: clampedX, y: clampedY });
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
            {/* Drag preview */}
            {isDragging && dragPreviewPosition && (
              <div
                style={{
                  position: "absolute",
                  top: `${(dragPreviewPosition.y / warehouse.length) * 100}%`,
                  left: `${(dragPreviewPosition.x / warehouse.width) * 100}%`,
                  width: `${(warehouse.cols * 5) / warehouse.width * 100}%`,
                  height: `${(warehouse.rows * 5) / warehouse.length * 100}%`,
                  backgroundColor: "rgba(0, 0, 255, 0.3)", // Blue transparent overlay
                  border: "2px dashed blue",
                  pointerEvents: "none",
                }}
              ></div>
            )}
            {/* Place the field grid inside the warehouse shape */}
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
              }}
            >
              <EditWarehouseFieldGridDuplicated warehouse={warehouse} />
            </div>
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