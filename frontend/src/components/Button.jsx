import clsx from "clsx";

const VARIANT_CLASSES = {
  primary: "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)]",
  accent: "bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-primary)]",
  danger: "bg-[color:var(--color-danger)] text-white hover:bg-red-700",
  success: "bg-[color:var(--color-success)] text-white hover:bg-emerald-700",
  warning: "bg-[color:var(--color-warning)] text-white hover:bg-yellow-600",
  outline: "bg-white border border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white",
  ghost: "bg-transparent border-none text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10",
  link: "bg-transparent border-none text-[color:var(--color-primary)] underline hover:text-[color:var(--color-accent)] p-0",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1 text-xs rounded",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-2.5 text-base rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={clsx(
        "font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
