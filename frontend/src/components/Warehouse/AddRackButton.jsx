export default function AddRackButton({ onClick }) {
  return (
    <div className="flex gap-2 text-xs md:text-sm h-full items-center">
      <button onClick={onClick} className="text-blue-500 cursor-pointer">+ Add Rack</button>
    </div>
  );
}