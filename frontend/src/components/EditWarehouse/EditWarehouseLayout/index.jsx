import { useState, useEffect, useCallback, useMemo } from "react";
import { throttle } from "lodash";
import RackCreator from "./RackCreator";
import EditWarehouseView from "./EditWarehouseView";
import RackModal from "./RackModal";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRacksThunk, addRackThunk, moveRackThunk, updateRackPositionThunk, deleteRackThunk } from '../../../store/rack';
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
  const [rackDragPreview, setRackDragPreview] = useState(null);
  const [modalRack, setModalRack] = useState(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const dispatch = useDispatch();
  const racks = useSelector((state) => state.rack.racks);

  useEffect(() => {
    if (warehouse.id) {
      dispatch(fetchRacksThunk(warehouse.id));
    }
  }, [warehouse.id, dispatch]);

  const aspectRatio = useMemo(() => warehouse.width / warehouse.length, [warehouse.width, warehouse.length]);

  // Clamp position so that the rack stays fully inside the warehouse (lock to wall if needed)
  const clampPosition = (x, y, width, length, maxWidth, maxHeight, orientation) => {
    const adjustedWidth = orientation === "horizontal" ? width : length;
    const adjustedLength = orientation === "horizontal" ? length : width;

    // If the cursor is beyond the left/top, snap to 0
    let snappedX = x < 0 ? 0 : x;
    let snappedY = y < 0 ? 0 : y;

    // If the cursor is beyond the right/bottom, snap to the max allowed
    if (snappedX + adjustedWidth > maxWidth) snappedX = maxWidth - adjustedWidth;
    if (snappedY + adjustedLength > maxHeight) snappedY = maxHeight - adjustedLength;

    // Snap threshold for wall snapping (same as rack-to-rack)
    const snapThreshold = 0.5;

    // Snap to left wall if close
    if (snappedX < snapThreshold) snappedX = 0;
    // Snap to right wall if close
    if (Math.abs((snappedX + adjustedWidth) - maxWidth) < snapThreshold) snappedX = maxWidth - adjustedWidth;
    // Snap to top wall if close
    if (snappedY < snapThreshold) snappedY = 0;
    // Snap to bottom wall if close
    if (Math.abs((snappedY + adjustedLength) - maxHeight) < snapThreshold) snappedY = maxHeight - adjustedLength;

    // Final clamp to ensure inside bounds
    snappedX = Math.max(0, Math.min(snappedX, maxWidth - adjustedWidth));
    snappedY = Math.max(0, Math.min(snappedY, maxHeight - adjustedLength));

    return { x: snappedX, y: snappedY };
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
       console.log('❤️',dragPreviewPosition)
    console.log('❤️',rackDragPreview) 
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

  // --- PATCH: force a local state update after rack move ---
  // Helper to force a re-render of racks after a move

  // Helper: update rack position in local state immediately after drag
  const updateRackPositionLocal = (rackId, newPosition) => {
    // This will update the rack in the Redux store immediately for UI feedback
    dispatch({
      type: "rack/UPDATE_RACK_POSITION",
      payload: { rackId, updatedPosition: newPosition },
    });
    setForceUpdate(f => f + 1);
  };

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
      0.5 
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

    // Immediately update local state for UI feedback
    updateRackPositionLocal(rack.id, { x: clampedX, y: clampedY });
    console.log(`Rack ${rack.id} local position updated to:`, { x: clampedX, y: clampedY });

    try {
      await dispatch(
        updateRackPositionThunk(warehouse.id, rack.id, {
          x: clampedX,
          y: clampedY,
          width: rack.width,
          length: rack.length,
        })
      );
      console.log(`Rack ${rack.id} persisted position:`, { x: clampedX, y: clampedY });
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

  if (!warehouse.width || !warehouse.length) return null;

  return (
    <>
      {/* Modal for rack info */}
      <RackModal
        modalRack={modalRack}
        showDeleteWarning={showDeleteWarning}
        rackHasPallets={rackHasPallets}
        handleDeleteRack={handleDeleteRack}
        setModalRack={setModalRack}
        setShowDeleteWarning={setShowDeleteWarning}
      />
      <h2 className="text-lg font-bold">Edit Warehouse Layout</h2>
      <RackCreator />
      <EditWarehouseView
        warehouse={warehouse}
        fieldGridPosition={fieldGridPosition}
        setFieldGridPosition={setFieldGridPosition}
        isDragging={isDragging}
        dragPreviewPosition={dragPreviewPosition}
        invalidDrop={invalidDrop}
        rackDragPreview={rackDragPreview}
        racks={racks}
        handleDragStart={handleDragStart}
        handleDrag={handleDrag}
        handleRackDrop={handleRackDrop}
        handleRackDragStart={handleRackDragStart}
        handleRackDrag={handleRackDrag}
        handleRackDragEnd={handleRackDragEnd}
        handleRackClick={handleRackClick}
        forceUpdate={forceUpdate}
        VAULT_SIZE_FT={VAULT_SIZE_FT}
        FIELD_SIZE_FT={FIELD_SIZE_FT}
        aspectRatio={aspectRatio}
        getRackColor={getRackColor}
      />
    </>
  );
}
