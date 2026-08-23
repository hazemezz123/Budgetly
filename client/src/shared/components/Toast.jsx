import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const tint = (name, percent) =>
    `color-mix(in srgb, var(--color-${name}) ${percent}%, transparent)`;
  const darken = (name) =>
    `color-mix(in srgb, var(--color-${name}) 75%, black)`;

  const styles = {
    success: {
      bg: tint("success", 12),
      border: tint("success", 30),
      text: darken("success"),
    },
    error: {
      bg: tint("error", 12),
      border: tint("error", 30),
      text: darken("error"),
    },
    warning: {
      bg: tint("warning", 12),
      border: tint("warning", 30),
      text: darken("warning"),
    },
    info: {
      bg: tint("info", 12),
      border: tint("info", 30),
      text: darken("info"),
    },
  };

  const style = styles[type];

  return (
    <div
      className="border rounded-2xl p-4 shadow-lg backdrop-blur-sm flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in font-primary"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color: style.text }}>
        {icons[type]}
      </div>
      <p
        className="flex-1 text-sm font-medium leading-relaxed"
        style={{ color: style.text }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5"
        aria-label="إقفل"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
