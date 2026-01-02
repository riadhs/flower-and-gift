const flowerBouquet = [
  {
    id: 1,
    category: "Flower Bouquet",
    title: "Pink Roses",
    desc: "Hand-arranged, wrapped, bow-tied pink roses…",
    price: 40.0,
    img:
      "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    category: "Flower Bouquet",
    title: "Red Roses",
    desc: "Hand-arranged wrapped roses tied with floral paper…",
    price: 40.0,
    img:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    category: "Flower Bouquet",
    title: "Sunflower + Red Roses",
    desc: "1 sunflower + 10 red roses. Wrapped & ribboned…",
    price: 60.0,
    img:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },

  // 9 more items (total 12)
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: 100 + i,
    category: "Flower Bouquet",
    title: `Bouquet Special #${i + 1}`,
    desc: "Seasonal bouquet with premium wrapping and ribbon…",
    price: 35 + i,
    img:
      "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80",
  })),
];

export default flowerBouquet;
