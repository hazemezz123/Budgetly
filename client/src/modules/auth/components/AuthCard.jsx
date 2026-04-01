import { AlertCircle } from "lucide-react";
import { Loader } from "../../../shared/components";

/* =====================================================
   Windows 2000 / Classic System UI AuthCard
   - Outer window frame with title bar + chrome buttons
   - Inner beveled dialog area (inset box-shadow trick)
   - Tahoma / MS Sans Serif system font feel
   ===================================================== */

// Win2k 3-D raised border utility
const bevelRaised =
  "border-t-2 border-l-2 border-[#ffffff] border-b-2 border-r-2 [border-bottom-color:#808080] [border-right-color:#808080] [box-shadow:inset_-1px_-1px_0_#404040,inset_1px_1px_0_#dfdfdf]";

// Win2k 3-D sunken/inset border utility
const bevelSunken =
  "[box-shadow:inset_1px_1px_0_#808080,inset_-1px_-1px_0_#ffffff,inset_2px_2px_0_#404040,inset_-2px_-2px_0_#dfdfdf]";

export default function AuthCard({
  title,
  subtitle,
  error,
  loading,
  loadingText,
  children,
  footer,
}) {
  return (
    <div
      style={{ fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif", width: "100%", maxWidth: "360px" }}
    >
      {/* ── Outer Window Frame ── */}
      <div
        style={{
          background: "#d4d0c8",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow:
            "inset -1px -1px 0 #404040, inset 1px 1px 0 #dfdfdf, 4px 4px 8px rgba(0,0,0,0.45)",
          width: "100%",
        }}
      >
        {/* ── Title Bar ── */}
        <div
          className="flex items-center justify-between px-2 py-1 select-none"
          style={{
            background:
              "linear-gradient(to right, #000080 0%, #1084d0 60%, #000080 100%)",
            height: "28px",
          }}
        >
          {/* Icon + Title */}
          <div className="flex items-center gap-1">
            {/* Pixel computer icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{ imageRendering: "pixelated" }}
            >
              <rect x="1" y="2" width="14" height="9" fill="#d4d0c8" />
              <rect x="2" y="3" width="12" height="7" fill="#000080" />
              <rect x="3" y="11" width="10" height="2" fill="#808080" />
              <rect x="5" y="13" width="6" height="1" fill="#d4d0c8" />
            </svg>
            <span
              className="text-white font-bold text-xs"
              style={{ textShadow: "1px 1px 0 #000040" }}
            >
              Budgetly — تسجيل الدخول
            </span>
          </div>
          {/* Window Control Buttons */}
          <div className="flex gap-1">
            {["—", "□", "✕"].map((icon) => (
              <button
                key={icon}
                aria-hidden="true"
                tabIndex={-1}
                className="flex items-center justify-center text-black font-bold text-xs leading-none cursor-default"
                style={{
                  width: "16px",
                  height: "14px",
                  background: "#d4d0c8",
                  border: "1px solid",
                  borderColor: "#ffffff #808080 #808080 #ffffff",
                  boxShadow: "inset -1px -1px 0 #404040",
                  fontSize: "9px",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Dialog Body ── */}
        <div className="p-5">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div
              style={{
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                boxShadow: "inset 1px 1px 0 #404040",
                padding: "6px 12px",
                background: "#ffffff",
              }}
            >
              <img
                src="/assets/logo.png"
                alt="Budgetly"
                style={{ height: "44px", width: "auto", display: "block" }}
                className="dark:invert"
              />
            </div>
          </div>

          {/* Subtitle inside a groupbox */}
          {subtitle && (
            <fieldset
              className="mb-4"
              style={{
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                boxShadow: "inset 1px 1px 0 #dfdfdf",
                padding: "4px 8px 6px",
              }}
            >
              <legend
                className="text-xs font-bold px-1"
                style={{ color: "#000080" }}
              >
                معلومات
              </legend>
              <p
                className="text-xs text-center leading-relaxed"
                style={{ color: "#000000", direction: "rtl" }}
              >
                {subtitle}
              </p>
            </fieldset>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div
              className="flex items-center gap-2 mb-4 px-3 py-2 text-xs"
              style={{
                background: "#fff0f0",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                boxShadow: "inset 1px 1px 0 #404040",
                color: "#cc0000",
                direction: "rtl",
              }}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={14} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Separator */}
          <div
            className="mb-4"
            style={{
              borderTop: "1px solid #808080",
              borderBottom: "1px solid #ffffff",
            }}
          />

          {loading ? (
            <Loader text={loadingText || "لحظة واحدة..."} />
          ) : (
            <>
              {children}

              {footer && (
                <>
                  <div
                    className="my-4"
                    style={{
                      borderTop: "1px solid #808080",
                      borderBottom: "1px solid #ffffff",
                    }}
                  />
                  <div
                    className="text-center text-xs"
                    style={{ color: "#000080", direction: "rtl" }}
                  >
                    {footer}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* ── Status Bar ── */}
        <div
          className="flex items-center px-2 py-1 text-xs gap-2"
          style={{
            background: "#d4d0c8",
            borderTop: "1px solid #808080",
          }}
        >
          <div
            style={{
              border: "1px solid",
              borderColor: "#808080 #ffffff #ffffff #808080",
              padding: "1px 6px",
              fontSize: "10px",
              color: "#000000",
            }}
          >
            جاهز
          </div>
          <div
            style={{
              border: "1px solid",
              borderColor: "#808080 #ffffff #ffffff #808080",
              padding: "1px 6px",
              fontSize: "10px",
              color: "#000000",
            }}
          >
            Budgetly v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
