import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse, setCurrentField } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import FieldGrid from "../components/Warehouse/FieldGrid";
import FieldInfo from "../components/Warehouse/FieldInfo";
import { getCurrentFieldThunk } from "../store/warehouse";
import { fetchRacksThunk } from "../store/rack"; // Import the fetchRacksThunk

function WarehousePage() {
  const { warehouseName } = useParams();
  const dispatch = useDispatch();
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [fieldsArr, setFieldsArr] = useState(null);
  const selectedField = useSelector((state) => state.warehouse.currentField);
  const [loading, setLoading] = useState(true);
  const [isWarehouseView, setIsWarehouseView] = useState(true); // Toggle state
  const racks = useSelector((state) => state.rack.racks); // Fetch racks from Redux

  function handleFieldClick(field) {
    if (field.id) dispatch(getCurrentFieldThunk(field));
  }

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) => w.name.toLowerCase().split(" ").join("-") === warehouseName
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setFieldsArr(Object.values(foundWarehouse.fields));
    }
    setLoading(false);

    return () => {
      dispatch(setCurrentWarehouse(null));
    };
  }, [dispatch, warehouseName, warehouses]);

  useEffect(() => {
    if (warehouse?.id) {
      dispatch(fetchRacksThunk(warehouse.id)); // Fetch racks for the warehouse
    }
  }, [dispatch, warehouse?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!warehouse) {
    return <div>Warehouse could not be fetched</div>;
  }

  return (
    <div className="flex flex-col max-w-[100vw] p-4">
      <h1 className="text-xl font-bold mb-2 text-center">{warehouse.name}</h1>
      {/* Toggle switch */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-l ${isWarehouseView ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setIsWarehouseView(true)}
        >
          Warehouse View
        </button>
        <button
          className={`px-4 py-2 rounded-r ${!isWarehouseView ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setIsWarehouseView(false)}
        >
          Rack View
        </button>
      </div>
      {!isWarehouseView ? (
        <>
          {/* Rack View */}
          <div className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: warehouse.width / warehouse.length }}>
            <div
              className="relative"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundImage:
                  "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
                backgroundSize: `${(1 / warehouse.width) * 100}% ${(1 / warehouse.length) * 100}%`,
              }}
            >
              {/* Render FieldGrid */}
              {fieldsArr.length ? (
                <div
                  style={{
                    position: "absolute",
                    top: `${(warehouse.fieldgridLocation.y / warehouse.length) * 100}%`,
                    left: `${(warehouse.fieldgridLocation.x / warehouse.width) * 100}%`,
                    width: `${((warehouse.cols * 5) / warehouse.width) * 100}%`, // Match VAULT_SIZE_FT scaling
                    height: `${((warehouse.rows * 5) / warehouse.length) * 100}%`, // Match VAULT_SIZE_FT scaling
                    backgroundColor: "rgba(0, 0, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(0, 0, 255, 0.5)", // Add border for better visibility
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.5rem", // Fixed font size for better visibility
                      fontWeight: "bold",
                      color: "black",
                    }}
                  >
                    VAULTS
                  </span>
                </div>
              ) : (
                "This warehouse does not have any fields"
              )}

              {/* Render Racks */}
              {racks.map((rack, index) => {
                const isHorizontal = rack.orientation === "horizontal";
                const rackWidth = isHorizontal ? rack.width : rack.length;
                const rackHeight = isHorizontal ? rack.length : rack.width;

                return (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      top: `${(rack.position.y / warehouse.length) * 100}%`,
                      left: `${(rack.position.x / warehouse.width) * 100}%`,
                      width: `${(rackWidth / warehouse.width) * 100}%`,
                      height: `${(rackHeight / warehouse.length) * 100}%`,
                      backgroundColor: "rgba(0, 0, 255, 0.2)",
                      border: "1px solid blue",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="text-xs text-center">{rack.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Warehouse View */}
          <div className="h-[25vh]">
            {selectedField ? (
              <FieldInfo field={selectedField} />
            ) : (
              "Select a field to view its info"
            )}
          </div>
          <div className="flex-grow max-w-full overflow-x-hidden">
            {fieldsArr.length ? (
              <FieldGrid
                warehouse={warehouse}
                handleFieldClick={handleFieldClick}
                style={{ maxWidth: "65vw", margin: "0 auto" }}
                currentField={selectedField?.id ? selectedField.id : null}
              />
            ) : (
              "This warehouse does not have any fields"
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WarehousePage;