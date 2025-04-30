import { getProductsByCategory, getCategoryById } from "@/actions/actions";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const limit = ITEMS_PER_PAGE;
  const cursor = null;

  // Fetch main data
  const { products: fetchedProducts, totalCount, categories } = await getProductsByCategory(
    id,
    limit,
    cursor
  );

  // Fetch current category details
  const currentCategory = await getCategoryById(id);
  
  // Fetch all subcategory details
  const subCategoriesPromises = (categories?.subCategories || []).map((subCategoryId: string) => 
    getCategoryById(subCategoryId)
  );
  const subCategoriesDetails = await Promise.all(subCategoriesPromises);

  const initialProducts = fetchedProducts.map((product) => ({
    ...product,
    createdDate: product.createdDate
      ? (product.createdDate as Timestamp).toMillis()
      : null,
    updatedDate: product.updatedDate
      ? (product.updatedDate as Timestamp).toMillis()
      : null,
  }));

  return (
    <div className="flex flex-col max-w-[1290px] mx-auto md:mt-[1rem] p-1">
      {/* Subcategories row with images */}
    {subCategoriesDetails.length > 0 && (
  <div className="mb-5 mt-3 px-2 md:px-0">
 
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10">
      {subCategoriesDetails.filter(Boolean).map((subCategory) => (
        <Link
          key={subCategory.id}
          href={`/category/${subCategory.id}`}
          className="group relative overflow-hidden rounded-md aspect-square hover:shadow-md transition-all duration-200"
        >
          {subCategory.images?.[0] && (
            <div className="absolute inset-0">
              <Image
                src={subCategory.images[0]}
                alt={subCategory.categoryName}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-103"
                sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, 70px"
                quality={80}
                priority={false}
              />
              <div className="absolute inset-0  bg-opacity-25 group-hover:bg-opacity-15 transition-all duration-150" />
            </div>
          )}
          <div className="relative  h-full flex items-end p-2">
            <span className="text-white font-medium text-sm drop-shadow-sm line-clamp-2">
              {subCategory.categoryName}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}

      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        <FilterSection categoryName={id} />
        <ProductsSection
          initialProducts={initialProducts}
          totalProducts={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          categoryName={id}
        />
      </div>
    </div>
  );
};

export default Page;