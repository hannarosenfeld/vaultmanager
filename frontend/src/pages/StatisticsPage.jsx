import { useSelector } from "react-redux";
import WarehouseStatsPage from "../components/Statistics/WarehouseStatsTable";

function StatisticsPage() {
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouseArr = Object.values(warehouses);

  return (
    <div className="p-4">
      {/* <h1 className="text-xl mb-4">Statistics</h1> */}
      {warehouseArr.map((warehouse) => (
        <div key={warehouse.id}>
          <WarehouseStatsPage warehouse={warehouse} />  
        </div>
      ))}
    </div>
  );
}

export default StatisticsPage;
