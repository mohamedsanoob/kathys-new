import { FacebookIcon, InstagramIcon, YoutubeIcon } from "lucide-react";

const Help = () => {
  return (
    <div className="bg-black text-white">
      <div className="flex justify-between items-center py-20 max-w-[1290px] m-auto ">
        <div className="w-1/2 flex flex-col gap-4">
          <h3 className="text-3xl font-medium">Join 200k+ Community</h3>
          <div className="flex gap-4 items-center">
            <InstagramIcon className="w-8 h-8 cursor-pointer" />
            <FacebookIcon className="w-8 h-8 cursor-pointer" />
            <YoutubeIcon className="w-8 h-8 cursor-pointer" />
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-3">
          <p className="text-3xl font-medium">Need help?</p>
          <p className="text-3xl font-medium">(+91) 9876543210</p>
          <p className="text-gray-400">We are available 10am - 7pm</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
