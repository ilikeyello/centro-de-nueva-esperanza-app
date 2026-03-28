import { useEffect, useRef } from "react";

interface TithelyEmbedProps {
  embedCode: string;
}

export function TithelyEmbed({ embedCode }: TithelyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedCode) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create a temporary element to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(embedCode, "text/html");
    const elements = Array.from(doc.body.childNodes);

    elements.forEach((node) => {
      if (node instanceof HTMLScriptElement) {
        // Scripts injected via innerHTML don't execute, so we must recreate them
        const script = document.createElement("script");
        Array.from(node.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        script.innerHTML = node.innerHTML;
        document.head.appendChild(script);
      } else {
        // Clone other elements (buttons, divs, etc.)
        const clone = node.cloneNode(true);
        containerRef.current?.appendChild(clone);
      }
    });

    return () => {
      // Optional: cleanup scripts if they were added to head? 
      // Usually Tithely scripts are idempotent so it's safer to leave them 
      // but we could track them if needed.
    };
  }, [embedCode]);

  return (
    <div 
      ref={containerRef} 
      className="tithely-container flex flex-col items-center justify-center w-full"
    />
  );
}
