import Addresses from "./_components/Addresses";
import Account from "./_components/Account";
import AllOrders from "./_components/AllOrders";
import HomeItems from "./_components/HomeItems";
import Signout from "./_components/Signout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";



const page = ({ searchParams }: { searchParams: { category?: string } }) => {
  
  const activeComponent = searchParams?.category;
  const showContentOnMobile = !!activeComponent;

  const renderComponent = () => {
    switch (activeComponent) {
      case "orders":
        return <AllOrders />;
      case "addresses":
        return <Addresses />;
      case "signout":
        return <Signout />;
      default:
        return <AllOrders />;
    }
  };



  return (
    <div>
      <div>
    <Account/>
        <div className="flex flex-col md:flex-row border border-gray-200 rounded-md md:shadow-md w-[90%]  mx-auto">
          {/* Mobile back button - shown only when content is visible on mobile */}
          {showContentOnMobile && (
            <div className="md:hidden flex items-center p-4 border-b border-gray-200">
              <Link href="/account" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to menu</span>
              </Link>
            </div>
          )}

          {/* Sidebar - hidden on mobile when content is shown */}
          <div className={`w-full md:w-[25%] ${showContentOnMobile ? 'hidden md:block' : 'block'} border-b md:border-b-0 md:border-r border-gray-200`}>
            <HomeItems activeCategory={activeComponent} />
          </div>
          
          {/* Content area - shown on mobile when category selected, always on desktop */}
          <div className={`${showContentOnMobile ? 'block' : 'hidden md:block'} w-full md:w-[75%] p-4`}>
            {renderComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;