import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

/**
 * Hook para carregar o widget do Tawk.to em português.
 */
const useTawkTo = (tawkId?: string) => {
  useEffect(() => {
    if (!tawkId) return;
    if (document.getElementById("tawk-script")) return;

    // Configurar API antes do carregamento
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    window.Tawk_API.onLoad = function () {
      window.Tawk_API.setAttributes({ language: "pt" }, function (error: any) {
        if (error) console.warn("Tawk.to setAttributes error:", error);
      });
    };

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("tawk-script");
      if (el) el.remove();
    };
  }, [tawkId]);
};

export default useTawkTo;
