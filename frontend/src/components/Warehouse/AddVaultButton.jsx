export default function AddVaultButton({ type, onClick }) {
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="flex gap-2 text-xs md:text-sm h-full items-center">
      <button onClick={onClick} className="text-blue-500 cursor-pointer">+ Add {capitalizedType}</button>
    </div>
  );
}