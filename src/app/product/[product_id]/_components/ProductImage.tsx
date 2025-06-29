"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!images?.length) return <p>No images available</p>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoom || isMobile) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="w-[90%] md:w-[40%] flex flex-col m-auto gap-4">
      {/* Main slider */}
      <Swiper
        loop
        spaceBetween={10}
        centeredSlides
        navigation
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
        onSwiper={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
          setZoom(false);
          setPosition({ x: 50, y: 50 });
        }}
      >
        {images?.map((src, idx) => {
          const isActive = idx === activeIndex;
          return (
            <SwiperSlide key={idx}>
              <div
                className="relative w-full h-full"
                style={{ transform: isActive && zoom ? undefined : "scale(1)" }}
                onMouseEnter={() => isActive && !isMobile && setZoom(true)}
                onMouseLeave={() => isActive && !isMobile && setZoom(false)}
                onMouseMove={isActive ? handleMouseMove : undefined}
              >
                {!loadedImages[idx] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
                )}
          <Image
  src={src}
  alt={`product-image-${idx + 1}`}
  width={800}  // Optimal max width for high-res displays
  height={1400}  // Base height that maintains aspect ratio
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" // Responsive breakpoints
  className="w-full h-auto max-h-[80vh] max-w-full object-contain z-10"
  style={{
    transform: isActive && !isMobile && zoom ? "scale(2.4)" : "scale(1)",
    transformOrigin: `${position.x}% ${position.y}%`,
    transition: "transform 0.1s ease-out, opacity 0.3s ease-in-out",
    opacity: loadedImages[idx] ? 1 : 0,
  }}
  priority={idx === 0}
  loading={idx > 2 ? "lazy" : "eager"}
  quality={80}  // Slightly higher quality for zoom capability
  onLoadingComplete={() => handleImageLoad(idx)}
/>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop
        spaceBetween={4}
        slidesPerView={4}
        watchSlidesProgress
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
      >
        {images?.map((src, idx) => (
          <SwiperSlide key={idx} className="w-10">
            <div
              className="relative overflow-hidden border border-gray-300 cursor-pointer"
              style={{ width: 75, height: 75 }}
            >
              {!loadedImages[idx] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
              )}
              <Image
                src={src}
                alt={`product-thumbnail-${idx + 1}`}
                fill
                className="z-10 object-cover"
                style={{
                  opacity: loadedImages[idx] ? 1 : 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
                onLoadingComplete={() => handleImageLoad(idx)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductImage;
