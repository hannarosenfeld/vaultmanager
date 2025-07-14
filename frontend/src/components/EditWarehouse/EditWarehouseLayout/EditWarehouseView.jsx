export default function EditWarehouseView({
    warehouse,
    fieldGridPosition,
    setFieldGridPosition,
    isDragging,
    dragPreviewPosition,
    invalidDrop,
    rackDragPreview,
    racks,
    handleDragStart,
    handleDrag,
    handleDragEnd, // <-- Add this line
    handleRackDrop,
    handleRackDragStart,
    handleRackDrag,
    handleRackDragEnd,
    handleRackClick,
    forceUpdate,
    VAULT_SIZE_FT,
    FIELD_SIZE_FT,
    aspectRatio,
    getRackColor,
}) {
    if (!warehouse.width || !warehouse.length) {
        return null;
    }

    return (
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
                            backgroundColor: "rgba(59, 130, 246, 0.20)",
                            border: "2px solid #3b82f6",
                            borderRadius: 0,
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
                            key={rack.id + '-' + forceUpdate}
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
    );
}
