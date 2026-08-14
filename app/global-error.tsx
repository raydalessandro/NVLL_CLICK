"use client";

/**
 * Ultimo confine: qui il layout radice non è disponibile, quindi html/body
 * e gli stili minimi vanno dichiarati in linea.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeContent: "center",
          gap: 18,
          padding: 32,
          background: "#070806",
          color: "#d8d8cf",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
        }}
      >
        <p style={{ font: "10px monospace", letterSpacing: ".2em", color: "#b8ff35", margin: 0 }}>
          ERRORE / CRITICO
        </p>
        <h1 style={{ fontSize: 44, letterSpacing: "-.07em", lineHeight: 0.9, margin: 0 }}>
          SISTEMA
          <br />
          FERMO
        </h1>
        {error.digest && (
          <p style={{ font: "9px monospace", color: "#85877f", margin: 0 }}>RIF. {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            justifySelf: "center",
            padding: "15px 22px",
            border: "1px solid #d8d8cf",
            background: "#d8d8cf",
            color: "#070806",
            font: "10px monospace",
            letterSpacing: ".14em",
            cursor: "pointer",
          }}
        >
          RIPROVA
        </button>
      </body>
    </html>
  );
}
