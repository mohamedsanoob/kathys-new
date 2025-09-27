
import AdBanner from "./_components/AdBanner";
import Collections from "./_components/Collections";
// import Community from "./_components/Community";
import Footer from "./_components/Footer";
import Help from "./_components/Help";
// import ImageSwiper from "./_components/ImageSwiper";
import Rating from "./_components/Rating";


 

export default function Home() {
 
  
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* <ImageSwiper /> */}
      {/* <Community /> */}
      <Collections />
        <AdBanner
                dataAdFormat="auto"
                dataFullWidthResponsive={true}
                dataAdSlot="9638943294"
              />
      <Rating />
      <Help />
      <Footer />
    </div>
  );
}
