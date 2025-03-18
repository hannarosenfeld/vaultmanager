import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllVaults } from "../store/print";
import Papa from "papaparse";

function PrintStudio() {
  const dispatch = useDispatch();
  const vaults = useSelector((state) => state.print.vaults);

  useEffect(() => {
    dispatch(fetchAllVaults());
  }, [dispatch]);

  const handleDownloadCSV = () => {
    const csvData = vaults.map((vault) => ({
      "Vault Name": vault.name,
      "Customer Name": vault.customer_name,
      "Vault Type": vault.type,
      "Position": vault.position,
      "Field Name": vault.field_name,
      "Warehouse Name": vault.warehouse_name,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vaults.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort vaults by customer name
  const sortedVaults = [...vaults].sort((a, b) =>
    a.customer_name.localeCompare(b.customer_name)
  );

  return (
    <div className="p-4">
      <h1>Print Studio</h1>
      <div className="mt-4">
        <button
          onClick={handleDownloadCSV}
          className="flex items-center p-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          <span className="material-symbols-outlined mr-2">download</span>
          Download CSV
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        {sortedVaults.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-xs">
                <th className="py-2 text-center">Vault #</th>
                <th className="py-2 text-center">Customer</th>
                <th className="py-2 text-center">Type</th>
                <th className="py-2 text-center">Pos</th>
                <th className="py-2 text-center">Field</th>
                <th className="py-2 text-center">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {sortedVaults.map((vault) => (
                <tr key={vault.id} className="text-xs">
                  <td className="border px-4 py-2 text-center">{vault.name}</td>
                  <td className="border px-4 py-2 text-center">
                    {vault.customer_name}
                  </td>
                  <td className="border px-4 py-2 text-center">{vault.type}</td>
                  <td className="border px-4 py-2 text-center">
                    {vault.position}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {vault.field_name}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {vault.warehouse_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vaults found</p>
        )}
      </div>
    </div>
  );
}

export default PrintStudio;