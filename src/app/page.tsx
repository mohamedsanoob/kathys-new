import Collections from "./_components/Collections";
// import Community from "./_components/Community";
import Footer from "./_components/Footer";
import Help from "./_components/Help";
// import ImageSwiper from "./_components/ImageSwiper";
import Rating from "./_components/Rating";

// Collections reads Firestore via the Admin SDK; render server-side per
// request (withCache handles the 5-min memo) instead of prerendering at build
// (which would require Firebase creds to be present at build time).
export const dynamic = "force-dynamic";

export default function Home() {
 
  
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* <ImageSwiper /> */}
      {/* <Community /> */}
      <Collections />
      <Rating />
      <Help />
      <Footer />
    </div>
  );
}
