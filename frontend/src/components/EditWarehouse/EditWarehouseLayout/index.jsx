import { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
import RackCreator from "./RackCreator";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRacksThunk, addRackThunk, moveRackThunk, updateRackPositionThunk, deleteRackThunk } from '../../../store/rack';
import { updateFieldGridThunk } from '../../../store/warehouse';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

export default function EditWarehouseLayout({
  warehouse,
  fieldGridPosition,
  setFieldGridPosition,
}) {
  const FIELD_SIZE_FT = 1;
  const VAULT_SIZE_FT = 5;

  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [invalidDrop, setInvalidDrop] = useState(false);
  const aspectRatio = warehouse.width / warehouse.length;

  const [rackDragPreview, setRackDragPreview] = useState(null);
  const [modalRack, setModalRack] = useState(null);

  const dispatch = useDispatch();
  const racks = useSelector((state) => state.rack.racks);

  useEffect(() => {
    if (warehouse.id) {
      dispatch(fetchRacksThunk(warehouse.id));
    }
  }, [warehouse.id, dispatch]);

  const clampPosition = (x, y, width, length, maxWidth, maxHeight, orientation) => {
    const adjustedWidth = orientation === "horizontal" ? width : length;
    const adjustedLength = orientation === "horizontal" ? length : width;

    const clampedX = Math.max(0, Math.min(x, maxWidth - adjustedWidth));
    const clampedY = Math.max(0, Math.min(y, maxHeight - adjustedLength));

    return { x: clampedX, y: clampedY };
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

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
        warehouse.cols * FIELD_SIZE_FT,
        warehouse.rows * FIELD_SIZE_FT,
        warehouse.width,
        warehouse.length
      );

      setDragPreviewPosition({ x: clampedX, y: clampedY });
    }, 100),
    [warehouse]
  );

  const handleDragEnd = async (e) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const newPosition = clampPosition(
      x,
      y,
      warehouse.cols * VAULT_SIZE_FT,
      warehouse.rows * VAULT_SIZE_FT,
      warehouse.width,
      warehouse.length
    );

    setFieldGridPosition(newPosition);
    setIsDragging(false);
    setDragPreviewPosition(null);

    try {
      await dispatch(updateFieldGridThunk(warehouse.id, newPosition));
    } catch (error) {
      console.error("Error saving field grid position:", error);
    }
  };

  // Helper: get all 4 corners of a rack
  function getRackCorners(rack) {
    const isHorizontal = rack.orientation === "horizontal";
    const width = isHorizontal ? rack.width : rack.length;
    const height = isHorizontal ? rack.length : rack.width;
    const x = rack.position?.x ?? rack.x ?? 0;
    const y = rack.position?.y ?? rack.y ?? 0;
    return [
      { x: x, y: y }, // top-left
      { x: x + width, y: y }, // top-right
      { x: x, y: y + height }, // bottom-left
      { x: x + width, y: y + height }, // bottom-right
    ];
  }

  // Helper: snap dragged rack's corners to any existing rack's corners
  function getSnappedCornerPosition(draggedRack, dropX, dropY, placedRacks, snapThreshold = 0.5) {
    // Get corners for dragged rack at drop position
    const isHorizontal = draggedRack.orientation === "horizontal";
    const width = isHorizontal ? draggedRack.width : draggedRack.length;
    const height = isHorizontal ? draggedRack.length : draggedRack.width;
    const draggedCorners = [
      { x: dropX, y: dropY }, // top-left
      { x: dropX + width, y: dropY }, // top-right
      { x: dropX, y: dropY + height }, // bottom-left
      { x: dropX + width, y: dropY + height }, // bottom-right
    ];

    let snappedX = dropX;
    let snappedY = dropY;
    let foundSnap = false;

    placedRacks.forEach(rack => {
      if (!rack) return;
      const rackCorners = getRackCorners(rack);
      for (let i = 0; i < draggedCorners.length; i++) {
        for (let j = 0; j < rackCorners.length; j++) {
          const dx = rackCorners[j].x - draggedCorners[i].x;
          const dy = rackCorners[j].y - draggedCorners[i].y;
          if (Math.abs(dx) <= snapThreshold && Math.abs(dy) <= snapThreshold) {
            // Snap dragged rack so its corner i aligns with rack's corner j
            snappedX = dropX + dx;
            snappedY = dropY + dy;
            foundSnap = true;
            break;
          }
        }
        if (foundSnap) break;
      }
    });

    return { x: snappedX, y: snappedY };
  }

  const handleRackDrop = async (event) => {
    event.preventDefault();
    try {
      const rackData = JSON.parse(event.dataTransfer.getData("rack"));
      if (!rackData.capacity) {
        console.error("❌ Rack capacity is undefined. Drop is not allowed.");
        return;
      }
      const warehouseEl = event.target.closest(".warehouse-grid");
      if (!warehouseEl) {
        console.error("❌ Warehouse grid element not found during drop.");
        return;
      }
      const rect = warehouseEl.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((event.clientY - rect.top) / rect.height) * warehouse.length;

      // Snap to nearest rack corner
      const placedRacks = racks.map(r => ({
        ...r,
        position: r.position || { x: r.x, y: r.y }
      }));
      const snapped = getSnappedCornerPosition(
        rackData,
        x,
        y,
        placedRacks,
        0.5 // snap threshold in ft (adjust as needed)
      );

      const { x: clampedX, y: clampedY } = clampPosition(
        snapped.x,
        snapped.y,
        rackData.width,
        rackData.length,
        warehouse.width,
        warehouse.length,
        rackData.orientation
      );

      const updatedPosition = {
        x: clampedX,
        y: clampedY,
        width: rackData.width,
        length: rackData.length,
      };

      if (rackData.id) {
        await dispatch(
          moveRackThunk(warehouse.id, rackData.id, {
            ...updatedPosition,
            orientation: rackData.orientation,
          })
        );
      } else {
        const newRack = {
          name: rackData.name || "Unnamed Rack",
          capacity: rackData.capacity || 100,
          position: updatedPosition,
          orientation: rackData.orientation,
          num_shelves: rackData.num_shelves || 1,
        };
        await dispatch(addRackThunk(warehouse.id, newRack));
      }
    } catch (error) {
      console.error("❌ Error handling rack drop:", error);
    }

    setRackDragPreview(null);
  };

  const handleRackDragStart = (e, rack) => {
    e.dataTransfer.setData(
      "rack",
      JSON.stringify({
        id: rack.id,
        name: rack.name,
        width: rack.width,
        length: rack.length,
        x: rack.position.x,
        y: rack.position.y,
        orientation: rack.orientation,
        capacity: rack.capacity,
      })
    );
  };

  const handleRackDrag = useCallback(
    throttle((e, rack) => {
      const warehouseEl = e.target.closest(".warehouse-grid");
      if (!warehouseEl) return;
      const rect = warehouseEl.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

      // Snap preview to corners
      const placedRacks = racks.map(r => ({
        ...r,
        position: r.position || { x: r.x, y: r.y }
      }));
      const snapped = getSnappedCornerPosition(
        rack,
        x,
        y,
        placedRacks,
        0.5 // snap threshold in ft (adjust as needed)
      );

      const { x: clampedX, y: clampedY } = clampPosition(
        snapped.x,
        snapped.y,
        rack.width,
        rack.length,
        warehouse.width,
        warehouse.length,
        rack.orientation
      );

      setRackDragPreview({
        x: clampedX,
        y: clampedY,
        width: rack.orientation === "horizontal" ? rack.width : rack.length,
        height: rack.orientation === "horizontal" ? rack.length : rack.width,
      });
    }, 100),
    [warehouse, racks]
  );

  const handleRackDragEnd = async (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    // Snap to nearest rack corner (same as drop logic)
    const placedRacks = racks
      .filter(r => r.id !== rack.id)
      .map(r => ({
        ...r,
        position: r.position || { x: r.x, y: r.y }
      }));
    const snapped = getSnappedCornerPosition(
      rack,
      x,
      y,
      placedRacks,
      0.5 // snap threshold in ft (adjust as needed)
    );

    const { x: clampedX, y: clampedY } = clampPosition(
      snapped.x,
      snapped.y,
      rack.width,
      rack.length,
      warehouse.width,
      warehouse.length,
      rack.orientation
    );

    try {
      await dispatch(
        updateRackPositionThunk(warehouse.id, rack.id, {
          x: clampedX,
          y: clampedY,
        })
      );
    } catch (error) {
      console.error("Error updating rack position:", error);
    }

    setRackDragPreview(null);
  };

  const handleRackClick = (rack) => {
    setModalRack(rack);
  };

  // Helper to check if rack has any pallets
  const rackHasPallets = (rack) => {
    if (!rack || !rack.shelves) return false;
    return rack.shelves.some(shelf => shelf.pallets && shelf.pallets.length > 0);
  };

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const handleDeleteRack = async () => {
    if (!modalRack || !modalRack.id) return;
    if (rackHasPallets(modalRack) && !showDeleteWarning) {
      setShowDeleteWarning(true);
      return;
    }
    try {
      await dispatch(deleteRackThunk({ warehouseId: warehouse.id, rackId: modalRack.id }));
      setModalRack(null);
      setShowDeleteWarning(false);
      setRackDragPreview(null); // <-- Clear rack drag preview on delete
    } catch (error) {
      setModalRack(null);
      setShowDeleteWarning(false);
      setRackDragPreview(null); // <-- Also clear on error
      alert("Failed to delete rack.");
    }
  };

  // Helper to get rack color based on fill percentage
  function getRackColor(rack) {
    if (!rack.shelves || !Array.isArray(rack.shelves)) return "var(--color-success)";
    const totalPallets = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.pallets?.length || 0),
      0
    );
    const totalCapacity = rack.shelves.reduce(
      (sum, shelf) => sum + (shelf.capacity || 0),
      0
    );
    const fillPercentage = totalCapacity > 0 ? totalPallets / totalCapacity : 0;
    if (fillPercentage >= 1) return "var(--color-full)";
    if (fillPercentage > 0.5) return "var(--color-warning)";
    return "var(--color-success)";
  }

  if (!warehouse.width || !warehouse.length) {
    return null;
  }

  return (
    <>
      {/* Modal for rack info */}
      <Dialog open={!!modalRack} onClose={() => { setModalRack(null); setShowDeleteWarning(false); }} className="relative z-50">
        {/* Only render modal content if modalRack is present */}
        {modalRack && (
          <>
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />
            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-xs sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                        <svg className="size-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                          Rack Info
                        </DialogTitle>
                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                          <div>
                            <strong>Name:</strong> {modalRack.name}
                          </div>
                          <div>
                            <strong>Orientation:</strong> {modalRack.orientation}
                          </div>
                          <div>
                            <strong>Width:</strong> {modalRack.width}
                          </div>
                          <div>
                            <strong>Length:</strong> {modalRack.length}
                          </div>
                          <div>
                            <strong>Capacity:</strong> {modalRack.capacity}
                          </div>
                          <div>
                            <strong>Number of Shelves:</strong> {modalRack.shelves ? modalRack.shelves.length : 0}
                          </div>
                        </div>
                        {showDeleteWarning && rackHasPallets(modalRack) && (
                          <div className="mt-4 p-3 rounded bg-[color:var(--color-warning)]/20 border border-[color:var(--color-warning)] text-[color:var(--color-warning)] text-sm font-semibold">
                            Warning: This rack contains pallets. Deleting it will remove all associated pallets. Are you sure you want to continue?
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-0.5">
                    <button
                      className="inline-flex w-full justify-center rounded-md bg-[color:var(--color-danger)] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleDeleteRack}
                      type="button"
                    >
                      Delete
                    </button>
                    <button
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-[color:var(--color-primary)] shadow-xs ring-1 ring-[color:var(--color-primary)] ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => { setModalRack(null); setShowDeleteWarning(false); }}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                  <button
                    onClick={() => { setModalRack(null); setShowDeleteWarning(false); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[color:var(--color-accent)]"
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </DialogPanel>
              </div>
            </div>
          </>
        )}
      </Dialog>
      <h2 className="text-lg font-bold">Edit Warehouse Layout</h2>
      <RackCreator />
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ aspectRatio }}
      >
        <div
          className={`warehouse-grid ${invalidDrop ? "bg-red-200" : ""} relative w-full h-full`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRackDrop}
          style={{
            backgroundImage:
              "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
            backgroundSize: `${(FIELD_SIZE_FT / warehouse.width) * 100}% ${(FIELD_SIZE_FT / warehouse.length) * 100}%`,
          }}
        >
          {isDragging && dragPreviewPosition && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20 pointer-events-none"
              style={{
                top: `${(dragPreviewPosition.y / warehouse.length) * 100}%`,
                left: `${(dragPreviewPosition.x / warehouse.width) * 100}%`,
                width: `${((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100}%`,
                height: `${((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100}%`,
              }}
            />
          )}

          {rackDragPreview && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${(rackDragPreview.y / warehouse.length) * 100}%`,
                left: `${(rackDragPreview.x / warehouse.width) * 100}%`,
                width: `${(rackDragPreview.width / warehouse.width) * 100}%`,
                height: `${(rackDragPreview.height / warehouse.length) * 100}%`,
                backgroundColor: "rgba(59, 130, 246, 0.20)", // blue-500 with lower opacity
                border: "2px solid #3b82f6", // blue-500 border
                borderRadius: 0, // no rounded corners
                boxSizing: "border-box",
                transition: "box-shadow 0.2s, border 0.2s",
              }}
            />
          )}

          <div
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute flex items-center justify-center cursor-grab bg-blue-100 bg-opacity-30"
            style={{
              top: `${(fieldGridPosition.y / warehouse.length) * 100}%`,
              left: `${(fieldGridPosition.x / warehouse.width) * 100}%`,
              width: `${((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100 + 3.1}%`,
              height: `${((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100 + 1.9}%`,
            }}
          >
            <span className="text-xl font-bold text-black">VAULTS</span>
          </div>

          {racks.map((rack, index) => {
            const isHorizontal = rack.orientation === "horizontal";
            const rackWidth = isHorizontal ? rack.width : rack.length;
            const rackHeight = isHorizontal ? rack.length : rack.width;

            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleRackDragStart(e, rack)}
                onDrag={(e) => handleRackDrag(e, rack)}
                onDragEnd={(e) => handleRackDragEnd(e, rack)}
                onClick={() => handleRackClick(rack)}
                className="absolute flex items-center justify-center bg-blue-200 bg-opacity-20"
                style={{
                  top: `${(rack.position.y / warehouse.length) * 100}%`,
                  left: `${(rack.position.x / warehouse.width) * 100}%`,
                  width: `${(rackWidth / warehouse.width) * 100}%`,
                  height: `${(rackHeight / warehouse.length) * 100}%`,
                  backgroundColor: getRackColor(rack),
                  transition: "box-shadow 0.2s, border 0.2s",
                }}
              >
                <span
                  className="text-[0.55rem] text-center w-full truncate"
                  title={rack.name}
                >
                  {rack.name.length > 10 ? rack.name.slice(0, 10) + "…" : rack.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
