import Collections from "./_components/Collections";
// import Community from "./_components/Community";
import Footer from "./_components/Footer";
import Help from "./_components/Help";
// import ImageSwiper from "./_components/ImageSwiper";
import Rating from "./_components/Rating";
import { getCollectionsWithProductsServer } from "@/lib/queries";

// Collections are fetched via the Admin SDK on the server (batched), with
// withCache handling the 5-min memo. force-dynamic avoids needing Firebase
// creds at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const collections = await getCollectionsWithProductsServer();

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* <ImageSwiper /> */}
      {/* <Community /> */}
      <Collections initialData={collections as any} />
      <Rating />
      <Help />
      <Footer />
    </div>
  );
}
