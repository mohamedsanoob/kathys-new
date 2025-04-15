const Description = ({ description }: { description: string }) => {
  // const sizes = ["M - 38", "L - 40", "XL - 42", "XXL - 44", "XXXL - 46"];

  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: description }} />

      {/* <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium mb-3">SIZE CHART</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {sizes.map((size, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md p-2 text-center hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm sm:text-base">{size}</p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Description;
