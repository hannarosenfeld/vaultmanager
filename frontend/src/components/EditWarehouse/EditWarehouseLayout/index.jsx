import { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
import RackCreator from "./RackCreator";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRacksThunk, addRackThunk, moveRackThunk, updateRackPositionThunk } from '../../../store/rack';
import { updateFieldGridThunk } from '../../../store/warehouse';

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
    alert(`Rack Info:\nName: ${rack.name}\nOrientation: ${rack.orientation}\nPosition: (${rack.position.x}, ${rack.position.y})`);
  };

  if (!warehouse.width || !warehouse.length) {
    return null;
  }

  return (
    <>
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
