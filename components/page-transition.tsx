"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./logo";

const SLATS = 22;
// Müşteri paneli, ödeme ve giriş sayfalarında geçiş animasyonu yok: sık gezilen, işlevsel ekranlar.
const FUNCTIONAL = /^\/(panel|abonelik|giris|kayit|sifre-sifirla|sifremi-unuttum|yonetim|api)(\/|$)/;

type Phase = "idle" | "kapaniyor" | "bekliyor" | "aciliyor";

/*
 * Sayfa geçişi: tanıtım sayfaları arasında bir bağlantıya tıklanınca kepenk aşağı iner (kapanır), yeni sayfa arkada
 * yüklenir, yüklenince kepenk yukarı kayarak açılır. İlk açılıştaki kepenkle (components/kepenk.tsx) aynı görünüm.
 * Atlanan durumlar: "hareketi azalt" tercihi, Ctrl/Shift/Cmd tıklaması, yeni sekme, aynı sayfa, harici bağlantı,
 * işlevsel sayfalar (yukarıdaki liste). Geri/ileri düğmesi normal çalışır. Yeni sayfa 8 saniyede gelmezse kepenk
 * yine de açılır (ağ sorununda ekran kilitli kalmasın).
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhaseState] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const timers = useRef<number[]>([]);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Yeni sayfa geldi: kepenk açılır
  useEffect(() => {
    if (phaseRef.current === "bekliyor") {
      clearTimers();
      setPhase("aciliyor");
      later(() => setPhase("idle"), 450);
    }
  }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (reduce.matches || phaseRef.current !== "idle") return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (FUNCTIONAL.test(url.pathname) || FUNCTIONAL.test(window.location.pathname)) return;

      // Next Link'in kendi geçişini durdur; kepenk kapandıktan sonra biz gideriz
      e.preventDefault();
      e.stopPropagation();
      setPhase("kapaniyor");
      later(() => {
        setPhase("bekliyor");
        router.push(url.pathname + url.search + url.hash);
        later(() => {
          if (phaseRef.current === "bekliyor") {
            setPhase("aciliyor");
            later(() => setPhase("idle"), 450);
          }
        }, 8000);
      }, 270);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, [router]);

  return (
    <div className="kg" data-phase={phase} aria-hidden="true">
      <div className="flex h-full flex-col">
        {Array.from({ length: SLATS }, (_, i) => (
          <div key={i} className={`kepenk-lama ${i % 2 === 0 ? "kepenk-lama-a" : "kepenk-lama-b"}`} />
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="border-4 border-tabela bg-gece p-6 shadow-[8px_8px_0_#0a2319]">
          <LogoMark height={64} color="sari" />
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div className="relative h-5 w-44 bg-tabela">
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gece" />
        </div>
        <div className="mx-auto h-2 w-48 bg-murekkep" />
      </div>
    </div>
  );
}
