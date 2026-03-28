import { useEffect, useRef } from "react";

interface TithelyEmbedProps {
  embedCode: string;
}

export function TithelyEmbed({ embedCode }: TithelyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedCode) return;

    // Detect if this is a Tithely Button code (contains data-form)
    const formIdMatch = embedCode.match(/data-form=["']([^"']+)["']/);
    
    if (formIdMatch && formIdMatch[1]) {
      const formId = formIdMatch[1];
      // Transform into a full-height direct-embed iframe for the "In-App" Look
      containerRef.current.innerHTML = `
        <iframe 
          src="https://give.tithe.ly/?formId=${formId}" 
          width="100%" 
          height="800px" 
          style="border:none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" 
          allow="payment"
        ></iframe>
      `;
      return;
    }

    // Standard Fallback: Parse the embed code
    const parser = new DOMParser();
    const doc = parser.parseFromString(embedCode, "text/html");
    const scripts = Array.from(doc.querySelectorAll("script"));
    const otherHtml = embedCode.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // 1. Render the HTML
    containerRef.current.innerHTML = otherHtml;

    // Ensure any iframes in the HTML are full-width
    const iframes = containerRef.current.querySelectorAll("iframe");
    iframes.forEach(iface => {
      iface.style.width = "100%";
      if (iface.height === "" || iface.height === "0") iface.height = "800";
    });

    // 2. Load and execute scripts
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;

      if (newScript.src.includes("tithe.ly")) {
        const existing = document.querySelector(`script[src*="tithe.ly"]`);
        if (existing) existing.remove();
      }
      document.head.appendChild(newScript);
    });
  }, [embedCode]);

  return (
    <div 
      ref={containerRef} 
      className="tithely-container flex flex-col items-center justify-center w-full"
    />
  );
}
