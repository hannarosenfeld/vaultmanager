import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";
import WarehouseView from "../components/EditWarehouse/WarehouseView";
import RackView from "../components/EditWarehouse/RackView";
import {
  setCurrentWarehouse,
  editFieldCapacityThunk,
} from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import DragAndDropFieldGrid from "../components/EditWarehouse/DragAndDropFieldGrid";
import axios from "axios";
import { throttle } from "lodash";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector(
    (state) => state.warehouse.warehouses,
    shallowEqual
  );
  const warehouse = useSelector(
    (state) => state.warehouse.currentWarehouse,
    shallowEqual
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse");
  const [fieldGridPosition, setFieldGridPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);

  const FIELD_SIZE_FT = 1;
  const VAULT_SIZE_FT = 5;

  const rackDimensions = [
    { id: "12x4", label: "12ft x 4ft", width: 12, height: 4 },
    { id: "8x4", label: "8ft x 4ft", width: 8, height: 4 },
  ];

  const rackDirections = [
    { id: "horizontal", label: "Horizontal", icon: "↔️" },
    { id: "vertical", label: "Vertical", icon: "↕️" },
  ];

  const [selectedDimension, setSelectedDimension] = useState(rackDimensions[0]);
  const [selectedDirection, setSelectedDirection] = useState(rackDirections[0]);

  const getRackStyle = () => {
    const width =
      selectedDirection.id === "horizontal"
        ? (selectedDimension.width / warehouse.width) * 100 + "%"
        : (selectedDimension.height / warehouse.width) * 100 + "%";
    const height =
      selectedDirection.id === "horizontal"
        ? (selectedDimension.height / warehouse.length) * 100 + "%"
        : (selectedDimension.width / warehouse.length) * 100 + "%";

    return {
      width: width,
      height: height,
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      border: "1px solid blue",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) =>
        w.name.toLowerCase().split(" ").join("-") ===
        warehouseName.toLowerCase()
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
    dispatch(editFieldCapacityThunk(warehouse.id, fieldCapacity)).then(
      (response) => {
        if (response.error) {
          alert("Error updating field capacity: " + response.error);
        } else {
          alert("Field capacity updated successfully!");
        }
      }
    );
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

      const clampedX = Math.max(
        0,
        Math.min(x, warehouse.width - warehouse.cols * FIELD_SIZE_FT)
      );
      const clampedY = Math.max(
        0,
        Math.min(y, warehouse.length - warehouse.rows * FIELD_SIZE_FT)
      );

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

    const clampedX = Math.max(
      0,
      Math.min(x, warehouse.width - warehouse.cols * VAULT_SIZE_FT)
    );
    const clampedY = Math.max(
      0,
      Math.min(y, warehouse.length - warehouse.rows * VAULT_SIZE_FT)
    );

    setFieldGridPosition({ x: clampedX, y: clampedY });
    setIsDragging(false);
    setDragPreviewPosition(null);

    updateFieldGridPosition(warehouse.id, { x: clampedX, y: clampedY });
  };

  if (loading) return <LoadingSpinner />;

  const aspectRatio = warehouse.width / warehouse.length;

  return (
    <div className="flex flex-col items-center h-full mt-3">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>

      {/* Rack Selection */}
      <div className="flex flex-col items-center w-full grow p-2 mb-1">
        <div className="flex items-start w-full justify-between p-4 border rounded-lg gap-8">
          {/* Buttons Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold">Select Rack Dimensions</h3>
              <div className="flex gap-4 mt-2 flex-wrap">
                {rackDimensions.map((dimension) => (
                  <button
                    key={dimension.id}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedDimension.id === dimension.id
                        ? "bg-blue-200 border-blue-500"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedDimension(dimension)}
                  >
                    {dimension.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Select Rack Direction</h3>
              <div className="flex gap-4 mt-2 flex-wrap">
                {rackDirections.map((direction) => (
                  <button
                    key={direction.id}
                    className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                      selectedDirection.id === direction.id
                        ? "bg-blue-200 border-blue-500"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedDirection(direction)}
                  >
                    <span>{direction.icon}</span>
                    {direction.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rack Preview Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">Rack Preview</h3>
            <div className="mt-4 flex items-center justify-center h-40 w-40">
              <div
                style={getRackStyle()}
                className="transition-all duration-300 ease-in-out"
              >
                <span className="text-sm font-medium text-center px-2">
                  {selectedDimension.label} ({selectedDirection.label})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Visual */}
      <div className="relative w-full overflow-hidden bg-white" style={{ aspectRatio }}>
        <div
          className="warehouse-grid"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
            backgroundSize: `${(FIELD_SIZE_FT / warehouse.width) * 100}% ${(FIELD_SIZE_FT / warehouse.length) * 100}%`,
          }}
        >
          {isDragging && dragPreviewPosition && (
            <div
              style={{
                position: "absolute",
                top: `${(dragPreviewPosition.y / warehouse.length) * 100}%`,
                left: `${(dragPreviewPosition.x / warehouse.width) * 100}%`,
                width: `${((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100}%`,
                height: `${((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100}%`,
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                border: "2px dashed blue",
                pointerEvents: "none",
              }}
            />
          )}

          <div
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
              position: "absolute",
              top: `${(fieldGridPosition.y / warehouse.length) * 100}%`,
              left: `${(fieldGridPosition.x / warehouse.width) * 100}%`,
              width: `${((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100}%`,
              height: `${((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100}%`,
              cursor: "grab",
              backgroundColor: "rgba(0, 0, 255, 0.1)",
            }}
          >
            <DragAndDropFieldGrid warehouse={warehouse} />
          </div>
        </div>
      </div>

      <p className="text-sm mt-2">{`${warehouse.width} ft x ${warehouse.length} ft`}</p>

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
