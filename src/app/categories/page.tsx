import { getAllCategories } from "@/actions/actions";
import Image from "next/image";
import Link from "next/link";

export default async function CategoriesList() {
  const categories = await getAllCategories();
  
  return (
    <div className="p-4 md:w-[92%] md:m-auto">
    
        <h1 className="text-1xl  mb-3">All Category</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
        
        {categories.map(category => (
          <Link 
            key={category.id}
            href={`/category/${category.id}`}
            className="group relative block rounded-lg overflow-hidden hover:shadow-md transition-all"
            aria-label={category.categoryName}
          >
            {/* Category Banner Image */}
            <div className="aspect-square bg-gray-100">
              {category.images?.[0] ? (
                <Image
                  src={category.images[0]}
                  alt={category.categoryName}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
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