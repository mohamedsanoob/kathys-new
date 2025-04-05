import Collections from "./_components/Collections";
import Community from "./_components/Community";
import Footer from "./_components/Footer";
import Help from "./_components/Help";
import ImageSwiper from "./_components/ImageSwiper";
import Navbar from "./_components/Navbar";
import Rating from "./_components/Rating";

export default function Home() {
  return (
    <div>
      <Navbar />
      <ImageSwiper />
      <Community />
      <Collections />
      <Rating />
      <Help />
      <Footer />
    </div>
  );
}
