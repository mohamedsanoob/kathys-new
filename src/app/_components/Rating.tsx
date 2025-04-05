'use client'
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Swiper,SwiperSlide } from "swiper/react";

const Rating = () => {
  return (
    <div className="flex justify-between gap-12 items-center pt-20 pb-8 max-w-[1290px] m-auto">
      <Image
        src={
          "https://dressupfashion.in/wp-content/uploads/2025/03/banner2.jpg.webp"
        }
        alt="image"
        width={1000}
        height={1000}
        className="w-1/2"
      />
      <div className="w-1/2 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="font-medium">200K+ collections</p>
          <h4 className="text-5xl font-medium">
            Kerala&apos;s Most Loved
            <br />
            Ethnic Store❤️
          </h4>
          <p className="text-gray-500">
            With 200k+ fans, we’re proud to be Kerala&apos;s most loved ethnic
            store! Explore timeless classics and trendy ethnic collections
            crafted for every occasion. Shop now and embrace elegance like never
            before!
          </p>
        </div>
        <div className="cursor-pointer flex gap-2 px-4 py-2 border border-gray-300 w-fit">
          <p className="">Shop Now</p>
          <ArrowRight />
        </div>
        <hr className="text-gray-300" />
        <div>
          <Swiper>
            <SwiperSlide></SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Rating;
