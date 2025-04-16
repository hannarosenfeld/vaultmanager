import { useEffect, useState } from "react";
import { sortWarehouseFields } from "../../utils/sortWarehouseFields";

export default function DragAndDropFieldGrid({ warehouse }) {
  const [sortedFields, setSortedFields] = useState([]);

  useEffect(() => {
    if (warehouse.fields) {
      setSortedFields(sortWarehouseFields(warehouse.fields));
    }
  }, [warehouse.fields]);

  return (
    <div className="flex-grow max-w-full overflow-x-hidden">
      {sortedFields.length ? (
        <div
          className="grid w-full h-full gap-1 overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${warehouse.cols}, 1fr)`,
            gridTemplateRows: `repeat(${warehouse.rows}, 1fr)`,
            aspectRatio: `${warehouse.cols} / ${warehouse.rows}`,
            margin: "0 auto",
          }}
        >
          {sortedFields.map((field) => (
            <div
              className="bg-gray-200"
              key={field.id}
              style={{
                display: field.type === "couchbox-B" ? "none" : "flex",
                height: "100%", // Adjusted to maintain square shape
                backgroundColor: "var(--lightgrey)",
                width: "100%",
                zIndex: field.type === "couchbox-B" ? "100" : "auto",
                alignItems: "center",
                justifyContent: "center",
                gridRow: field.type === "couchbox-T" ? "span 2" : "auto",
              }}
            >
              {field.type !== "couchbox-B" && (
                <div className="md:text-md text-center" style={{ fontSize: "0.5rem" }}>

                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        "no fields"
      )}
    </div>
  );
}