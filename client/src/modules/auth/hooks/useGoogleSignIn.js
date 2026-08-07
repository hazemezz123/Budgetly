/* global google */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_URL = "https://accounts.google.com/gsi/client";

export function useGoogleSignIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const handlerRef = useRef();
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  handlerRef.current = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(response.credential);
      toast.success("أهلاً بيك!");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "فشل تسجيل الدخول عبر جوجل";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return;

    const render = () => {
      if (
        !window.google?.accounts?.id ||
        !buttonRef.current ||
        buttonRef.current.dataset.gsiRendered
      ) {
        return;
      }
      buttonRef.current.dataset.gsiRendered = "true";
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp) => handlerRef.current(resp),
      });
      google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        locale: "ar",
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = render;
    script.onerror = () =>
      setError("تعذر تحميل زر تسجيل الدخول عبر جوجل");
    document.head.appendChild(script);
  }, []);

  return { buttonRef, error, loading };
}
