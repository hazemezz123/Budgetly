import { Link } from "react-router-dom";
import { AuthCard } from "../components";
import { useLogin } from "../hooks";

/* Win2k field label style */
const labelStyle = {
  fontSize: "12px",
  color: "#000000",
  fontWeight: "bold",
  display: "block",
  marginBottom: "3px",
  direction: "rtl",
  fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
};

/* Win2k sunken text-input style */
const inputStyle = {
  width: "100%",
  padding: "3px 6px",
  fontSize: "13px",
  fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
  background: "#ffffff",
  color: "#000000",
  border: "2px solid",
  borderColor: "#808080 #ffffff #ffffff #808080",
  boxShadow: "inset 1px 1px 0 #404040",
  outline: "none",
  direction: "rtl",
  borderRadius: "0",
};

/* Win2k raised 3-D button */
const win2kBtnStyle = {
  fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
  fontSize: "12px",
  background: "#d4d0c8",
  color: "#000000",
  border: "2px solid",
  borderColor: "#ffffff #808080 #808080 #ffffff",
  boxShadow: "inset -1px -1px 0 #404040, inset 1px 1px 0 #dfdfdf",
  padding: "4px 16px",
  cursor: "pointer",
  minWidth: "75px",
  direction: "rtl",
};

const Win2kButton = ({ children, type = "button", onClick, style = {}, "aria-label": ariaLabel }) => {
  const handleMouseDown = (e) => {
    e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080";
    e.currentTarget.style.boxShadow =
      "inset 1px 1px 0 #404040, inset -1px -1px 0 #dfdfdf";
    e.currentTarget.style.paddingTop = "5px";
    e.currentTarget.style.paddingLeft = "17px";
  };
  const handleMouseUp = (e) => {
    e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff";
    e.currentTarget.style.boxShadow =
      "inset -1px -1px 0 #404040, inset 1px 1px 0 #dfdfdf";
    e.currentTarget.style.paddingTop = "4px";
    e.currentTarget.style.paddingLeft = "16px";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-label={ariaLabel}
      style={{ ...win2kBtnStyle, ...style }}
    >
      {children}
    </button>
  );
};

const Login = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useLogin();

  const footerLink = (
    <p style={{ fontSize: "11px", color: "#000080", direction: "rtl" }}>
      معندكش حساب؟{" "}
      <Link
        to="/register"
        style={{ color: "#000080", textDecoration: "underline" }}
      >
        سجل دلوقتي
      </Link>
    </p>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#008080",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        zIndex: 50,
      }}
    >
    <AuthCard
      subtitle="اسهل طريقة عشان تتابع فيها مصاريف السكن"
      error={error}
      loading={loading}
      loadingText="بندخلك اهو اصبر شوية..."
      footer={footerLink}
    >
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Username field */}
        <div>
          <label htmlFor="username" style={labelStyle}>
            &amp;اسم المستخدم:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={inputStyle}
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" style={labelStyle}>
            &amp;كلمة المرور:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: "right", direction: "rtl" }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: "11px", color: "#000080", textDecoration: "underline" }}
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* Separator */}
        <div
          style={{
            borderTop: "1px solid #808080",
            borderBottom: "1px solid #ffffff",
            margin: "6px 0",
          }}
        />

        {/* Buttons row — OK / Cancel style */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", direction: "rtl" }}>
          <Win2kButton
            type="submit"
            aria-label="دخول التطبيق"
            style={{
              background: "#d4d0c8",
              fontWeight: "bold",
              minWidth: "80px",
            }}
          >
            ✔ دخول
          </Win2kButton>
          <Win2kButton type="button">إلغاء</Win2kButton>
        </div>
      </form>
    </AuthCard>
    </div>
  );
};

export default Login;
