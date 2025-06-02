import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentField } from "../../store/warehouse";
import { sortWarehouseFields } from "../../utils/sortWarehouseFields";

export default function FieldGrid({ warehouse, handleFieldClick, currentField }) {
  const dispatch = useDispatch();
  const searchIds = useSelector((state) => state.warehouse.search);
  const [sortedFields, setSortedFields] = useState([]);
  const [selectedField, setSelectedField] = useState(currentField);

  useEffect(() => {
    if (warehouse.fields) {
      setSortedFields(sortWarehouseFields(warehouse.fields));
    }
  }, [warehouse]);

  useEffect(() => {
    setSelectedField(null);
    dispatch(setCurrentField(null));
  }, [warehouse.id, dispatch]);

  const handleFieldSelect = (field) => {
    setSelectedField(field.id);
    dispatch(setCurrentField(field));
    handleFieldClick(field);
  };

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
          {sortedFields.map((field) => {
            // Use field.capacity for logic
            const baseCapacity = field.capacity || 3;
            const isCouchbox = field.type === "couchbox-T" || field.type === "couchbox";
            const capacity = isCouchbox ? baseCapacity + 1 : baseCapacity;
            const vaultCount = Object.keys(field.vaults).length;
            let backgroundColor = "";

            if (
              (vaultCount === capacity || field.full === true)
            ) {
              backgroundColor = "var(--color-full)"; // red
            } else if (vaultCount > capacity / 2) {
              backgroundColor = "var(--color-warning)"; // yellow
            } else if (vaultCount > 0) {
              backgroundColor = "var(--color-success)"; // green
            } else {
              backgroundColor = "var(--color-emptyfield)";
            }

            return (
              <div
                className={[
                  "field flex items-center justify-center w-full",
                  selectedField === field.id ? "border-2" : "",
                ].join(" ")}
                key={field.id}
                style={{
                  backgroundColor,
                  borderColor: selectedField === field.id ? "var(--color-primary)" : undefined,
                  filter: `${searchIds?.length && !searchIds.includes(field.id) ? "grayscale(100%)" : "none"}`,
                  opacity: `${searchIds?.length && !searchIds.includes(field.id) ? "0.5" : "1"}`,
                  display: field.type === "couchbox-B" ? "none" : "flex",
                  height: field.type === "couchbox-T" ? "calc(10vh + 0.25rem)" : "5vh",
                  zIndex: field.type === "couchbox-B" ? "100" : "auto",
                  gridRow: field.type === "couchbox-T" ? "span 2" : "auto",
                }}
                onClick={() => handleFieldSelect(field)}
              >
                {field.type !== "couchbox-B" && (
                  <div className="text-xs md:text-md text-center">
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