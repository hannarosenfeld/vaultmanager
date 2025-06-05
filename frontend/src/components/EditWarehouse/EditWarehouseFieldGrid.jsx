import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { sortWarehouseFields } from "../../utils/sortWarehouseFields";

export default function EditWarehouseFieldGrid({ warehouse }) {
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
            maxWidth: "75vw",
            margin: "0 auto",
          }}
        >
          {sortedFields.map((field) => {
            // Determine background color based on field state
            let bgColor = "var(--color-emptyfield)";
            if (field.full) {
              bgColor = "var(--color-full)";
            } else if (
              (Object.keys(field.vaults).length === 3 && field.type === "vault") ||
              (Object.keys(field.vaults).length === 4 && field.type === "couchbox-T") ||
              Object.keys(field.vaults).length === 2
            ) {
              bgColor = "var(--color-warning)";
            }

            return (
              <div
                className="flex items-center justify-center rounded transition-colors duration-200"
                key={field.id}
                style={{
                  display: field.type === "couchbox-B" ? "none" : "flex",
                  height: field.type === "couchbox-T" ? "calc(10vh + 0.25rem)" : "5vh",
                  backgroundColor: bgColor,
                  width: "100%",
                  zIndex: field.type === "couchbox-B" ? "100" : "auto",
                  gridRow: field.type === "couchbox-T" ? "span 2" : "auto",
                  border: "1px solid #e5e7eb",
                }}
              >
                {field.type !== "couchbox-B" && (
                  <div className="md:text-md text-center" style={{ fontSize: "0.7rem", color: "#2B2B2B" }}>
                    {field.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        "no fields"
      )}
    </div>
  );
}