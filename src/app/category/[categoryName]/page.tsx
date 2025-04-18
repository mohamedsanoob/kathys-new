import { getProductsByCategory } from "@/actions/actions";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { Timestamp } from "firebase/firestore";

const ITEMS_PER_PAGE = 2;

const Page = async ({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) => {
  const { categoryName } = await params;
  const limit = ITEMS_PER_PAGE;
  const cursor = null;

  const { products: fetchedProducts, totalCount } = await getProductsByCategory(
    categoryName,
    limit,
    cursor
  );

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
    <div className="flex flex-col md:flex-row gap-8 max-w-[1290px] mx-auto md:mt-[3.75rem] p-4">
      <FilterSection categoryName={categoryName} />
      <ProductsSection
        initialProducts={initialProducts}
        totalProducts={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        categoryName={categoryName}
      />
    </div>
  );
};

export default Page;
