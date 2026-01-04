import { useMemo, useState } from "react";

export default function ProductCard({ p, onAdd }) {
  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

  const defaultVariant = useMemo(() => (hasVariants ? p.variants[0] : null), [hasVariants, p.variants]);
  const [variantId, setVariantId] = useState(defaultVariant?.id || "");

  const selectedVariant = hasVariants
    ? p.variants.find((v) => v.id === variantId) || p.variants[0]
    : null;

  const displayPrice = hasVariants ? selectedVariant.price : p.price;

  function handleAdd() {
    //  pass variant label + price into cart
    onAdd({
      ...p,
      price: displayPrice, // final selected price
      selectedVariant: selectedVariant
        ? {
            id: selectedVariant.id,
            label: selectedVariant.label,
            price: selectedVariant.price,
          }
        : null,
    });
  }

  return (
    <article className="card">
      <div className="thumb">
        <img src={p.img} alt={p.title} />
        <button className="addBtn" type="button" onClick={handleAdd} title="Add to cart">
          +
        </button>
      </div>

      <div className="cardBody">
        <div className="cardTitle">{p.title}</div>
        <div className="cardDesc">{p.desc}</div>

        {hasVariants && (
          <div className="variantRow">
            <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              {p.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — ${v.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="cardPrice">${Number(displayPrice).toFixed(2)}</div>
      </div>
    </article>
  );
}