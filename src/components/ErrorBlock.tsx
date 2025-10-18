import { AlertCircle, SearchX } from "lucide-react";

type Props = {
  variant?: "error" | "empty";
  title: string;
  message?: string;
  action?: React.ReactNode;
};

export default function ErrorBlock({
  variant = "empty",
  title,
  message,
  action,
}: Props) {
  const VIcon = variant === "error" ? AlertCircle : SearchX;
  const color = variant === "error" ? "text-rose-600" : "text-gray-600";
  const ring =
    variant === "error"
      ? "ring-rose-200 bg-rose-50"
      : "ring-gray-200 bg-gray-50";
  return (
    <div className="text-center p-6">
      <div
        className={`mx-auto w-14 h-14 ${ring} ring-2 rounded-full flex items-center justify-center mb-3`}
      >
        <VIcon className={`w-7 h-7 ${color}`} />
      </div>
      <div className="text-xl font-bold text-gray-900">{title}</div>
      {message && (
        <div className="max-w-md mx-auto text-gray-700 mt-1">{message}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
