"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";

const images = [
  "https://dressupfashion.in/wp-content/uploads/2025/03/web4.2-1.jpg",
  "https://dressupfashion.in/wp-content/uploads/2025/03/web1.2.jpg",
  "https://dressupfashion.in/wp-content/uploads/2025/03/web1.2.jpg",
];

const ImageSwiper = () => {
  return (
    <div>
      <Swiper
        navigation={true}
        pagination={{
          dynamicBullets: true,
        }}
        loop={true}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {images.map((item, index) => (
          <SwiperSlide key={index}>
            <Image src={item} width={1000} height={1000} alt="image" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSwiper;
