"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

interface ProductImageProps {
  images: string[];
}

const ProductImage: React.FC<ProductImageProps> = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!images || images.length === 0) return <p>No images available</p>;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current || !zoom) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    // Add more gap on mobile by limiting the position range
    if (isMobile) {
      x = Math.max(25, Math.min(75, x)); // Keep cursor within center 50% of image
      y = Math.max(25, Math.min(75, y));
    } else {
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
    }

    setPosition({ x, y });
  };

  return (
    <div className="w-[90%] md:w-[40%] flex flex-col m-auto gap-4">
      <Swiper
        loop={true}
        spaceBetween={10}
        centeredSlides={true}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              ref={imageRef}
              className="relative overflow-hidden cursor-zoom-in h-auto"
              onTouchStart={() => isMobile && setZoom(prev => !prev)}
              onMouseEnter={() => !isMobile && setZoom(true)}
              onMouseLeave={() => !isMobile && setZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={image}
                alt="product-image"
                width={1000}
                height={1000}
                className="transition-transform duration-200 object-cover lg:object-contain"
                style={{
                  transform: zoom 
                    ? `scale(${isMobile ? 1.8 : 2.4})` 
                    : "scale(1)",
                  transformOrigin: `${position.x}% ${position.y}%`,
                }}
              />
              {isMobile && zoom && (
                <div className="absolute inset-0 border-2 border-gray-400 pointer-events-none"
                  style={{
                    left: '25%',
                    right: '25%',
                    top: '25%',
                    bottom: '25%',
                  }}
                ></div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={4}
        slidesPerView={4}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
        style={{ width: "100px !important" }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="w-10">
            <div
              className="relative overflow-hidden border border-gray-300 cursor-pointer"
              style={{ width: 75, height: 75 }}
            >
              <Image src={image} alt={`product-thumbnail-${index + 1}`} fill />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductImage;