import Navbar from "../_components/Navbar";
import Addresses from "./_components/Addresses";
import AllOrders from "./_components/AllOrders";
import HomeItems from "./_components/HomeItems";
import Signout from "./_components/Signout";

const page = ({ searchParams }: { searchParams: { category?: string } }) => {
  const activeComponent = searchParams?.category || "orders"; // Improved default

  const renderComponent = () => {
    switch (activeComponent) {
      case "orders":
        return <AllOrders />;
      case "addresses":
        return <Addresses />;
      case "signout":
        return <Signout />; // Signout component should handle the logic
      default:
        console.error(`Unknown active component: ${activeComponent}`);
        return <AllOrders />; // Default with error logging
    }
  };

  return (
    <div>
        <Navbar />
      <div>
        <div className="container mx-auto flex w-[90%] justify-between py-4">
          <p className="text-xl font-medium">Account</p>
          <p className="text-lg">+91 7994914856</p>
        </div>
        <div className="flex border border-gray-200 rounded-md shadow-md w-[90%] h-[80dvh] mx-auto">
          <div className="w-[25%] border-r border-gray-200">
            <HomeItems activeCategory={activeComponent} />
          </div>
          <div className="w-[75%] p-4">{renderComponent()}</div>
        </div>
      </div>
    </div>
  );
};

export default page;
