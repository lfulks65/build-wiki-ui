import { Clock } from "lucide-react";

interface ReadingTimeProps {
  minutes: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Small badge showing estimated reading time.
 * Hidden when minutes is 0 or NaN.
 */
export default function ReadingTime({
  minutes,
  size = "sm",
  className = "",
}: ReadingTimeProps) {
  if (!minutes || Number.isNaN(minutes) || minutes < 1) {
    return null;
  }

  const sizeClasses =
    size === "md"
      ? "text-sm"
      : "text-xs";

  const iconSize = size === "md" ? 16 : 14;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full px-2.5 py-1
        bg-gray-100 dark:bg-gray-800
        text-gray-500 dark:text-gray-400
        ${sizeClasses}
        ${className}
      `.trim()}
    >
      <Clock width={iconSize} height={iconSize} />
      {minutes} min read
    </span>
  );
}
