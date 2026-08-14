"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="system-page section-pad">
      <span className="eyebrow">ERRORE / RECUPERABILE</span>
      <h1>
        SEGNALE
        <br />
        INTERROTTO
      </h1>
      <p>Qualcosa si è rotto mentre questa superficie veniva costruita.</p>
      {error.digest && <small className="digest">RIF. {error.digest}</small>}
      <button type="button" className="primary-cta" onClick={reset}>
        RIPROVA
      </button>
    </div>
  );
}
