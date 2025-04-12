"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Rating = () => {
  return (
    <div className="max-w-[1290px] mx-auto px-4 pt-16 pb-12 flex flex-col md:flex-row items-center gap-12">
      {/* Left Image */}
      <Image
        src="https://dressupfashion.in/wp-content/uploads/2025/03/banner2.jpg.webp"
        alt="image"
        width={1000}
        height={1000}
        className="w-full md:w-1/2 rounded-md object-cover"
      />

      {/* Right Content */}
      <div className="w-full md:w-1/2 flex flex-col gap-8">
        {/* Headline Section */}
        <div className="flex flex-col gap-3">
          <p className="font-medium text-sm sm:text-base text-gray-600">
            200K+ collections
          </p>
          <h4 className="text-3xl sm:text-4xl font-semibold leading-snug">
            Kerala&apos;s Most Loved
            <br />
            Ethnic Store ❤️
          </h4>
          <p className="text-gray-500 text-sm sm:text-base">
            With 200k+ fans, we’re proud to be Kerala&apos;s most loved ethnic
            store! Explore timeless classics and trendy ethnic collections
            crafted for every occasion. Shop now and embrace elegance like never
            before!
          </p>
        </div>

        {/* CTA Button */}
        <div className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer transition w-fit">
          <p className="text-sm sm:text-base">Shop Now</p>
          <ArrowRight size={18} />
        </div>

        <hr className="border-gray-200" />

        {/* Swiper (placeholder) */}
        <div>
          <Swiper slidesPerView={1} spaceBetween={10}>
            <SwiperSlide>
              <div className="p-4 bg-gray-100 rounded-md text-sm text-gray-700">
                {/* Example Review */}
                “Love the collection! The quality and colors are amazing. Will
                shop again for sure!”
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="p-4 bg-gray-100 rounded-md text-sm text-gray-700">
                “Fast delivery and great customer service. Loved the saree I
                received!”
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Rating;
