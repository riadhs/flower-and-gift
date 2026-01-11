import { useEffect, useState } from "react";
import axios from "axios";

const publicApi = axios.create({ baseURL: "/api" });

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await publicApi.get("/categories");
        setCategories(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { categories, loading };
}
