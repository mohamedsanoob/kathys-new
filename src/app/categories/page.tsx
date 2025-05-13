"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/actions/actions";

interface Category {
  id: string;
  categoryName: string;
  images?: string[];
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories()
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:w-[92%] md:m-auto">
      <h1 className="text-1xl mb-3">All Category</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group relative block rounded-lg overflow-hidden hover:shadow-md transition-all"
            aria-label={category.categoryName}
            prefetch={true}
          >
            {/* Category Banner Image */}
            <div className="aspect-square bg-gray-100 relative">
              {category.images?.[0] ? (
                <Image
                  src={category.images[0]}
                  alt={category.categoryName}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>

            {/* Category Name Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-end p-3">
              <h3 className="text-white font-medium text-center w-full drop-shadow-md">
                {category.categoryName}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}