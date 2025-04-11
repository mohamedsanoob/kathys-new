import { FacebookIcon, InstagramIcon, YoutubeIcon } from "lucide-react";

const Help = () => {
  return (
    <div className="bg-black text-white">
      <div className="flex flex-col md:flex-row justify-between items-center py-10 md:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-[1290px] m-auto gap-8 md:gap-0">
        <div className="w-full md:w-1/2 flex flex-col gap-4 items-center md:items-start">
          <h3 className="text-2xl sm:text-3xl font-medium text-center md:text-left">
            Join 200k+ Community
          </h3>
          <div className="flex gap-4 items-center">
            <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:opacity-80 transition-opacity" />
            <FacebookIcon className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:opacity-80 transition-opacity" />
            <YoutubeIcon className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:opacity-80 transition-opacity" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-3 items-center md:items-start">
          <p className="text-2xl sm:text-3xl font-medium text-center md:text-left">
            Need help?
          </p>
          <p className="text-2xl sm:text-3xl font-medium text-center md:text-left">
            (+91) 9876543210
          </p>
          <p className="text-gray-400 text-sm sm:text-base text-center md:text-left">
            We are available 10am - 7pm
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;