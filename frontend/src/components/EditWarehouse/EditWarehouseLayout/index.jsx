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

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
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

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
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
    [warehouse]
  );

  const SNAP_THRESHOLD = 1;

  const isCloseToLockableSite = (draggedRack, targetRack) => {
    const isHorizontal = targetRack.orientation === "horizontal";
    const targetWidth = isHorizontal ? targetRack.width : targetRack.length;
    const targetHeight = isHorizontal ? targetRack.length : targetRack.width;

    const draggedWidth = isHorizontal ? draggedRack.width : draggedRack.length;
    const draggedHeight = isHorizontal ? draggedRack.length : draggedRack.width;

    const dx = Math.abs(draggedRack.x - targetRack.position.x);
    const dy = Math.abs(draggedRack.y - targetRack.position.y);

    if (isHorizontal) {
      return (
        dy <= SNAP_THRESHOLD &&
        (Math.abs(draggedRack.x - (targetRack.position.x + targetWidth)) <= SNAP_THRESHOLD ||
          Math.abs(draggedRack.x + draggedWidth - targetRack.position.x) <= SNAP_THRESHOLD)
      );
    } else {
      return (
        dx <= SNAP_THRESHOLD &&
        (Math.abs(draggedRack.y - (targetRack.position.y + targetHeight)) <= SNAP_THRESHOLD ||
          Math.abs(draggedRack.y + draggedHeight - targetRack.position.y) <= SNAP_THRESHOLD)
      );
    }
  };

  const handleRackDragEnd = async (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    let updatedPosition = clampPosition(
      x,
      y,
      rack.width,
      rack.length,
      warehouse.width,
      warehouse.length,
      rack.orientation
    );

    for (const targetRack of racks) {
      if (targetRack.id === rack.id) continue;

      const draggedRack = {
        x: updatedPosition.x,
        y: updatedPosition.y,
        width: rack.width,
        length: rack.length,
        orientation: rack.orientation,
      };

      if (isCloseToLockableSite(draggedRack, targetRack)) {
        if (rack.orientation === "horizontal") {
          updatedPosition.y = targetRack.position.y;
          if (Math.abs(updatedPosition.x - (targetRack.position.x + targetRack.width)) <= SNAP_THRESHOLD) {
            updatedPosition.x = targetRack.position.x + targetRack.width;
          } else if (Math.abs(updatedPosition.x + rack.width - targetRack.position.x) <= SNAP_THRESHOLD) {
            updatedPosition.x = targetRack.position.x - rack.width;
          }
        } else {
          updatedPosition.x = targetRack.position.x;
          if (Math.abs(updatedPosition.y - (targetRack.position.y + targetRack.length)) <= SNAP_THRESHOLD) {
            updatedPosition.y = targetRack.position.y + targetRack.length;
          } else if (Math.abs(updatedPosition.y + rack.length - targetRack.position.y) <= SNAP_THRESHOLD) {
            updatedPosition.y = targetRack.position.y - rack.length;
          }
        }
        break;
      }
    }

    try {
      await dispatch(
        updateRackPositionThunk(warehouse.id, rack.id, {
          x: updatedPosition.x,
          y: updatedPosition.y,
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

  const handleDeleteRack = async () => {
    if (!modalRack || !modalRack.id) return;
    try {
      await dispatch(deleteRackThunk({ warehouseId: warehouse.id, rackId: modalRack.id }));
      // Immediately close the modal before any state updates
      setModalRack(null);
    } catch (error) {
      setModalRack(null); // Also close on error for a clean UX
      alert("Failed to delete rack.");
    }
  };

  if (!warehouse.width || !warehouse.length) {
    return null;
  }

  return (
    <>
      {/* Modal for rack info */}
      <Dialog open={!!modalRack} onClose={() => setModalRack(null)} className="relative z-50">
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
                      onClick={() => setModalRack(null)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                  <button
                    onClick={() => setModalRack(null)}
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
              className="absolute border-2 border-green-500 bg-green-200 bg-opacity-20 pointer-events-none"
              style={{
                top: `${(rackDragPreview.y / warehouse.length) * 100}%`,
                left: `${(rackDragPreview.x / warehouse.width) * 100}%`,
                width: `${(rackDragPreview.width / warehouse.width) * 100}%`,
                height: `${(rackDragPreview.height / warehouse.length) * 100}%`,
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
                className="absolute flex items-center justify-center border-2 border-blue-500 bg-blue-200 bg-opacity-20"
                style={{
                  top: `${(rack.position.y / warehouse.length) * 100}%`,
                  left: `${(rack.position.x / warehouse.width) * 100}%`,
                  width: `${(rackWidth / warehouse.width) * 100}%`,
                  height: `${(rackHeight / warehouse.length) * 100}%`,
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
