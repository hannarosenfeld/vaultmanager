import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { sortWarehouseFields } from "../../utils/sortWarehouseFields";

export default function DragAndDropWarehouse({ warehouse }) {
  const dispatch = useDispatch();
  const [sortedFields, setSortedFields] = useState([]);

  useEffect(() => {
    if (warehouse.fields) {
      setSortedFields(sortWarehouseFields(warehouse.fields));
    }
  }, [warehouse, dispatch, warehouse.fields]);

  if (!warehouse || !warehouse.width || !warehouse.length) {
    return <div>No warehouse data available</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${warehouse.cols}, 1fr)`,
        gridTemplateRows: `repeat(${warehouse.rows}, 1fr)`,
        border: "1px solid black",
        backgroundColor: "#f9f9f9",
      }}
    >
      {Array.from({ length: warehouse.cols * warehouse.rows }).map((_, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            backgroundColor: "#e0e0e0",
          }}
        ></div>
      ))}
    </div>
  );
}
