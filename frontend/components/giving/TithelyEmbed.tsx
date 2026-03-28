import { useEffect, useRef } from "react";

interface TithelyEmbedProps {
  embedCode: string;
}

export function TithelyEmbed({ embedCode }: TithelyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedCode) return;

    // Parse the embed code to separate scripts from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(embedCode, "text/html");
    const scripts = Array.from(doc.querySelectorAll("script"));
    const otherHtml = embedCode.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // 1. Render the HTML (buttons, markers, etc.)
    containerRef.current.innerHTML = otherHtml;

    // 2. Load and execute scripts
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      
      // Copy attributes (src, async, etc.)
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content (for inline scripts)
      newScript.textContent = oldScript.textContent;

      // Force refresh if it's the Tithely widget script
      if (newScript.src.includes("tithe.ly")) {
        // If the script is already in the head, we might need to remove it or 
        // Tithe.ly might need to re-scan. Removing and re-adding can help.
        const existing = document.querySelector(`script[src*="tithe.ly"]`);
        if (existing) existing.remove();
      }

      document.head.appendChild(newScript);
    });

    return () => {
      // We don't necessarily want to remove the script on unmount 
      // as it might be needed for the modal to close or re-open.
    };
  }, [embedCode]);

  return (
    <div 
      ref={containerRef} 
      className="tithely-container flex flex-col items-center justify-center w-full"
    />
  );
}
