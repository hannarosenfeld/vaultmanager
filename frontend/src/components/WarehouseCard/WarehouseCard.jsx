import { Link } from "react-router-dom";

function WarehouseCard({ openDeleteModal, warehouse }) {
  const fieldsArr = Object.values(warehouse.fields);
  const filledFields = fieldsArr.filter(
    (field) => Object.values(field.vaults).length
  );
  const allVaultsPresentInWarehouse = filledFields.flatMap((field) =>
    Object.values(field.vaults)
  );
  
  // Count total vaults
  const totalVaults = allVaultsPresentInWarehouse.length;
  
  // Count empty vaults
  const emptyVaults = allVaultsPresentInWarehouse.filter(
    (vault) => vault.customer_name && vault.customer_name.includes("EMPTY")
  ).length;
  
  // Count non-empty vaults (vaults that take up space)
  const nonEmptyVaults = totalVaults - emptyVaults;
  
  // Use only non-empty vaults for capacity calculation
  const warehouseCapacity = warehouse.warehouseCapacity;
  const percentage = Math.round(
    (nonEmptyVaults / warehouseCapacity) * 100
  );
  
  let percentageColor;
  if (percentage >= 75) {
    percentageColor = "text-red-500";
  } else if (percentage >= 50) {
    percentageColor = "text-orange-500";
  } else if (percentage >= 25) {
    percentageColor = "text-yellow-500";
  } else {
    percentageColor = "text-green-500";
  }

  return (
    <div
      key={warehouse.id}
      className="border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100"
    >
      <Link
        to={`/warehouse/${warehouse.name.toLowerCase().split(" ").join("-")}`}
        className="block cursor-pointer p-4"
      >
        <div>
          <div className="text-lg font-semibold text-gray-800 justify-between flex">
            <span>{warehouse.name}</span>
            <span className={percentageColor}>{percentage}%</span>
          </div>
        </div>
      </Link>
      <hr className="border-gray-300" />
      <div className="py-2 px-4 hover:bg-blue-100 bg-blue-50">
        <Link
          to={`/edit/${warehouse.name.toLowerCase().split(" ").join("-")}`}
          className="text-blue-500 hover:text-blue-700 flex items-center p-2 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
          Edit
        </Link>
      </div>
      <hr className="border-gray-300" />
      <div
        className="py-2 px-4 hover:bg-red-100 text-red-500 hover:text-red-700 cursor-pointer"
        onClick={() => openDeleteModal(warehouse)}
      >
        <div className="flex items-center p-2 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
          <span className="ml-1">Delete</span>
        </div>
      </div>
    </div>
  );
}

export default WarehouseCard;
