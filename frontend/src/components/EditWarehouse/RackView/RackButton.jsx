export default function RackButton({ onClick, label, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`border border-black flex items-center justify-center ${className}`}
    >
      {label}
    </button>
  );
}