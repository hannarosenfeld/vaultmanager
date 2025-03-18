const ActionButton = ({ onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-md text-xs px-1 py-0.5 me-0.5 mb-1"
  >
    <span className="material-symbols-outlined text-xs">{icon}</span>
    {label && <span className="ml-0.5 text-xs">{label}</span>}
  </button>
);

export default ActionButton;