import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// change this if your backend runs on a different port
const API_BASE = "http://localhost:5000";  //without bite proxy

function groupByCategory(products) {
  const byCategory = {};
  for (const p of products) {
    const cat = p.category || "Uncategorized";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }
  return byCategory;
}

export default function useProducts() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // const res = await axios.get(`${API_BASE}/api/products`); //without bite proxy
        const res = await axios.get("/api/products");

        if (!cancelled) setAll(res.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byCategory = useMemo(() => groupByCategory(all), [all]);

  return { all, byCategory, loading, error };
}
