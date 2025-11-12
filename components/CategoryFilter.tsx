"use client";

import { useState, useEffect } from "react";

export default function CategoryFilter({ categories, onChange }: any) {
  const [selected, setSelected] = useState("all");

  const handleChange = (slug: string) => {
    setSelected(slug);
    onChange(slug);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => handleChange("all")}
        className={`px-4 py-2 rounded-lg border ${
          selected === "all" ? "bg-blue-600 text-white" : "bg-white text-black"
        }`}
      >
        All
      </button>
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => handleChange(cat.slug)}
          className={`px-4 py-2 rounded-lg border ${
            selected === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-white text-black"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
