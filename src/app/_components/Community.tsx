import { Instagram } from "lucide-react";

const communities = [
  {
    collectionName: "ETHNIC COLLECTIONS",
    logo: <Instagram />,
    name: "Instagram",
  },
  {
    collectionName: "ETHNIC COLLECTIONS",
    logo: <Instagram />,
    name: "Instagram",
  },
  {
    collectionName: "ETHNIC COLLECTIONS",
    logo: <Instagram />,
    name: "Instagram",
  },
  {
    collectionName: "ETHNIC COLLECTIONS",
    logo: <Instagram />,
    name: "Instagram",
  },
];

const Community = () => {
  return (
    <div className="max-w-[1290px] mx-auto pt-10 md:pt-20 pb-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 text-center md:text-left">
        <h4 className="text-3xl font-medium">
          Join our 200k+
          <br />
          Community
        </h4>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {communities.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >
            <p className="font-semibold text-center text-[8px] md:text-base">
              {item.collectionName}
            </p>

            <div className="text-primary">{item.logo}</div>
            <p className="text-sm">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
