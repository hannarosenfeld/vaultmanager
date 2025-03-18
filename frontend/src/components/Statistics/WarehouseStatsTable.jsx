function WarehouseStatsPage({ warehouse }) {
  const warehouseName = warehouse.name;
  const fieldsArr = Object.values(warehouse.fields);
  const vaultFields = fieldsArr.filter(field => field.type === "vault").length;
  const couchboxFields = fieldsArr.filter(field => field.type === "couchbox-T").length;
  const warehouseCapacity = (vaultFields * 3) + (couchboxFields * 4);
  const filledFields = fieldsArr.filter(field => Object.values(field.vaults).length);
  const allVaultsPresentInWarehouse = filledFields.flatMap(field => Object.values(field.vaults));
  const numberOfAllVaults = allVaultsPresentInWarehouse.length;
  const numberOfEmptyVaults = allVaultsPresentInWarehouse.filter(vault => vault.customer_name.includes("EMPTY") && vault.type === "vault").length;   
  const numberOfEmptyCouchboxes = allVaultsPresentInWarehouse.filter(vault => vault.customer_name.includes("EMPTY") && vault.type === "couchbox").length;   

  const onlyCustomerVaults = allVaultsPresentInWarehouse.filter(vault => !vault.customer_name.includes("EMPTY"));
  
  const percentage = Math.round((onlyCustomerVaults.length / warehouseCapacity) * 100);

  return (
    <div className="relative overflow-x-auto mb-5">
      <h1 className="text-2xl font-bold mb-4">{warehouseName}</h1>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3">Metric</th>
            <th scope="col" className="px-6 py-3">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b ">
            <td className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap">Number of Potential Spaces</td>
            <td className="px-6 py-4">{warehouseCapacity}</td>
          </tr>
          {/* <tr className="bg-white border-b ">
            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">Number of All Vaults</td>
            <td className="px-6 py-4">{numberOfAllVaults}</td>
          </tr> */}
          <tr className="bg-white border-b">
            <td className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap">Number of Empty Vaults</td>
            <td className="px-6 py-4">{numberOfEmptyVaults}</td>
          </tr>
          <tr className="bg-white">
            <td className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap">Number of Empty Couchboxes</td>
            <td className="px-6 py-4">{numberOfEmptyCouchboxes}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WarehouseStatsPage;