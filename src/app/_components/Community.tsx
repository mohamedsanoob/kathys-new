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
    <div className="flex justify-between items-center pt-20 pb-8 max-w-[1290px] m-auto">
      <h4 className="text-3xl font-[500]">
        Join our 200k+
        <br />
        Community
      </h4>
      <div className="flex flex-wrap gap-4">
        {communities.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-4 p-8 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-lg"
          >
            <p className="font-[600] text-sm">{item?.collectionName}</p>
            <div>{item?.logo}</div>
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
