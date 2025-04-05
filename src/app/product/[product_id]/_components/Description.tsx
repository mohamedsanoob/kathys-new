const Description = ({ description }: { description: string }) => {
        const sizes= ['M - 38','L - 40','XL - 42','XXL - 44','XXXL - 46']
  return (
    <div className="text-md">
      <p>{description}</p>
      <div>
        <p>SIZE CHART</p>
        <div className="flex flex-col gap-2">
          {sizes.map((size, index) => (
            <div key={index}>
              <p>{size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Description;
