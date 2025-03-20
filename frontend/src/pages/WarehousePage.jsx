import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse, setCurrentField } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import FieldGrid from "../components/Warehouse/FieldGrid";
import FieldInfo from "../components/Warehouse/FieldInfo";
import { getCurrentFieldThunk } from "../store/warehouse";

function WarehousePage() {
  const { warehouseName } = useParams();
  const dispatch = useDispatch();
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [fieldsArr, setFieldsArr] = useState(null);
  const selectedField = useSelector((state) => state.warehouse.currentField);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!warehouse) {
    return <div>Warehouse could not be fetched</div>;
  }

  return (
    <div className="flex flex-col max-w-[100vw] p-4">
      <h1 className="text-xl font-bold mb-2 text-center">{warehouse.name}</h1>
      <div className="h-[25vh]">
        { selectedField ? (
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
    </div>
  );
}

export default WarehousePage;