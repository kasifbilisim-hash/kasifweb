"use client";

import { useEffect, useRef } from "react";

/**
 * iyzico `checkoutFormContent` HTML döndürür (script + #iyzipay-checkout-form div).
 * innerHTML ile eklenen script'ler çalışmaz; bu yüzden script'ler yeniden oluşturulur.
 * İçerik yalnızca iyzico API'sinden (sunucu tarafında) gelir, kullanıcı girdisi değildir.
 */
export function IyzicoForm({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = html;
    container.querySelectorAll("script").forEach((old) => {
      const fresh = document.createElement("script");
      for (const attr of old.attributes) fresh.setAttribute(attr.name, attr.value);
      fresh.text = old.text;
      old.replaceWith(fresh);
    });
    return () => {
      container.innerHTML = "";
    };
  }, [html]);

  return (
    <div>
      <p className="mb-4 text-soluk">Kart bilgilerinizi iyzico&apos;nun güvenli formuna girersiniz. Biz görmeyiz.</p>
      <div ref={ref} />
    </div>
  );
}
