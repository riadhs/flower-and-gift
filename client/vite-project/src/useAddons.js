import { useEffect, useState } from "react";
import axios from "axios";

const publicApi = axios.create({ baseURL: "/api" });

export default function useAddons() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await publicApi.get("/addons");

        // ✅ Normalize DB → crossSellAddons shape
        const normalized = (res.data || []).map((a) => {
          const img =
            a.img ||
            a.image_url ||
            a.imageUrl ||
            a.image ||
            "";

          // if backend sends cents, convert:
          const price =
            typeof a.price === "number"
              ? a.price
              : typeof a.price_cents === "number"
              ? a.price_cents / 100
              : typeof a.priceCents === "number"
              ? a.priceCents / 100
              : 0;

          const variants = (a.variants || []).map((v) => ({
            id: String(v.id), // important for your cart keys
            label: v.label,
            price:
              typeof v.price === "number"
                ? v.price
                : typeof v.price_cents === "number"
                ? v.price_cents / 100
                : typeof v.priceCents === "number"
                ? v.priceCents / 100
                : 0,
          }));

          const base = {
            id: String(a.id),     // important for cart keys
            title: a.title,
            img,
          };

          // if variants exist, do NOT include "price" (same as crossSellAddons)
          if (variants.length) return { ...base, variants };

          // no variants -> include price
          return { ...base, price };
        });

        setAddons(normalized);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || "Failed to load add-ons");
        setAddons([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { addons, loading, error };
}
