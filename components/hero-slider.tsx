"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Ana sayfa ilk ekran kaydırıcısı. Slaytlar sunucuda hazırlanır, burada yalnızca gezinme vardır.
 * Erişilebilirlik: oklar, noktalar, durdur düğmesi; fare veya odak üstündeyken ve "hareketi azalt"
 * tercihinde otomatik geçiş yapılmaz; görünmeyen slayt `inert` olduğundan klavye odağı oraya gitmez.
 */
export function HeroSlider({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(true); // sunucuda ve ilk çizimde otomatik geçiş yok
  const n = slides.length;

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const idx = (i + n) % n;
      el.scrollTo({ left: idx * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [n, reduced],
  );

  useEffect(() => {
    if (!playing || held || reduced || n < 2) return;
    const id = setInterval(() => goTo(current + 1), 8000);
    return () => clearInterval(id);
  }, [playing, held, reduced, n, current, goTo]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  const ctl = "grid h-11 w-11 place-items-center border-2 border-beyaz/50 text-beyaz hover:bg-beyaz hover:text-gece";

  return (
    <div
      role="group"
      aria-roledescription="kaydırıcı"
      aria-label="Öne çıkanlar"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div ref={track} onScroll={onScroll} className="relative flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-live={playing && !held && !reduced ? "off" : "polite"}>
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slayt" aria-label={`${i + 1} / ${n}: ${labels[i]}`} inert={i !== current} className="w-full shrink-0 snap-start">
            {s}
          </div>
        ))}
      </div>

      {n > 1 ? (
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pb-8">
          <ol className="flex items-center gap-2" aria-label="Slayt seçimi">
            {slides.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1}. slayt: ${labels[i]}`}
                  aria-current={i === current ? "true" : undefined}
                  className={`h-3 border-2 border-beyaz/70 transition-all ${i === current ? "w-10 bg-tabela" : "w-3 bg-transparent hover:bg-beyaz/40"}`}
                />
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            {!reduced ? (
              <button type="button" className={ctl} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Otomatik geçişi durdur" : "Otomatik geçişi başlat"}>
                {playing ? (
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4"><path d="M5 3h3.5v14H5zM11.5 3H15v14h-3.5z" fill="currentColor" /></svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4"><path d="M5 3l12 7-12 7z" fill="currentColor" /></svg>
                )}
              </button>
            ) : null}
            <button type="button" className={ctl} onClick={() => goTo(current - 1)} aria-label="Önceki slayt">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5"><path d="M12.5 3.5L6 10l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>
            </button>
            <button type="button" className={ctl} onClick={() => goTo(current + 1)} aria-label="Sonraki slayt">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5"><path d="M7.5 3.5L14 10l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="pb-8" />
      )}
    </div>
  );
}
