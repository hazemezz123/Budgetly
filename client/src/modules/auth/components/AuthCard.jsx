import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex items-center justify-center min-h-[85vh] font-primary">
      <Card className="w-full max-w-md rounded-3xl border-(--color-border) bg-(--color-surface) shadow-2xl">
        <CardContent className="p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/logo.png"
              alt="بدجتلي - Budgetly"
              className="w-28 h-auto dark:invert"
            />
          </div>

          <div className="text-center mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-(--color-dark) mb-2">{title}</h1>
            )}
            {subtitle && <p className="text-(--color-secondary)">{subtitle}</p>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-(--color-primary)" />
              <p className="mt-3 text-sm text-(--color-muted)">
                {loadingText || "لحظة واحدة..."}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="bg-(--color-error)/10 text-(--color-error) p-4 rounded-2xl mb-6 text-sm text-center border border-(--color-error)/20 flex items-center gap-2 justify-center"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {children}

              {footer && <div className="mt-6 text-center">{footer}</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
