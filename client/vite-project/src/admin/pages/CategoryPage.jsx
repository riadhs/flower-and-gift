import useCategories from "../hooks/useCategories";


const { categories } = useCategories();
const names = categories.map((c) => c.name);
const idx = names.indexOf(category);

const prev = idx > 0 ? names[idx - 1] : names[names.length - 1];
const next = idx < names.length - 1 ? names[idx + 1] : names[0];


function goCategory(catName) {
  const found = categories.find((c) => c.name === catName);
  if (!found) return;

  setActiveCategory(catName);
  setQuery("");
  navigate(`/category/${found.slug}`);
}
