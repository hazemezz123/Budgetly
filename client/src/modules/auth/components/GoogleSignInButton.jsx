import { useGoogleSignIn } from "../hooks";

export default function GoogleSignInButton() {
  const { buttonRef, error, loading } = useGoogleSignIn();

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="flex items-center gap-3 my-4" aria-hidden="true">
        <div className="flex-1 h-px bg-(--color-border)" />
        <span className="text-sm text-(--color-secondary)">أو</span>
        <div className="flex-1 h-px bg-(--color-border)" />
      </div>

      {error && (
        <p className="text-sm text-(--color-error) text-center mb-3" role="alert">
          {error}
        </p>
      )}

      <div
        ref={buttonRef}
        className={`flex justify-center ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
        aria-label="تسجيل الدخول عبر جوجل"
      />
    </>
  );
}
