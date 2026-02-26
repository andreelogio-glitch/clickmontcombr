import { useEffect } from "react";

/**
 * Hook para carregar o widget do Tawk.to.
 * Substitua PROPERTY_ID e WIDGET_ID pelos valores reais do seu painel Tawk.to.
 * Exemplo: useTawkTo("1abc123/default") 
 */
const useTawkTo = (tawkId?: string) => {
  useEffect(() => {
    if (!tawkId) return;

    // Evita carregar duas vezes
    if (document.getElementById("tawk-script")) return;

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
