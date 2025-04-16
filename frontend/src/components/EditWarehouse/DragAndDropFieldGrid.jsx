import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { sortWarehouseFields } from "../../utils/sortWarehouseFields";

export default function DragAndDropFieldGrid({ warehouse }) {
  const dispatch = useDispatch();
  const [sortedFields, setSortedFields] = useState([]);

  useEffect(() => {
    if (warehouse.fields) {
      setSortedFields(sortWarehouseFields(warehouse.fields));
    }
  }, [warehouse.fields]); // Removed unnecessary dependencies like `warehouse` and `dispatch`

  return (
    <div className="flex-grow max-w-full overflow-x-hidden">
      {sortedFields.length ? (
        <div
          className="grid w-full h-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${warehouse.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${warehouse.rows}, 1fr)`,
            gridAutoFlow: "column",
            margin: "0 auto",
          }}
        >
          {sortedFields.map((field) => (
            <div
              className="bg-gray-200"
              key={field.id}
              style={{
                display: field.type === "couchbox-B" ? "none" : "flex",
                height: field.type === "couchbox-T" ? "calc(10vh + 0.25rem)" : "2.25em",
                backgroundColor: "var(--lightgrey)",
                width: "2.25em",
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