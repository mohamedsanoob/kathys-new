// ./Information.tsx

interface Variant {
  optionValue: string[];
  optionName: string;
}

const Information = ({ variants }: { variants: Variant[] }) => {
  console.log(variants, "avvvvvv");
  return (
    <div>
      <p className="text-2xl">Additional Information</p>
      <table className="table-auto border-collapse border border-gray-200 w-full">
        <tbody>
          {/* Added tbody */}
          {variants?.map((variant) => (
            <tr key={variant.optionName} className="border-b border-gray-200 ">
              {/* Corrected key to variant.optionName */}
              <td className="border border-gray-200 text-lg font-medium p-2 w-1/4">
                {variant.optionName}
              </td>
              <td className="w-3/4 p-2">
                {variant.optionValue.map((value, index) => (
                  <span key={index}>
                    {value}
                    {index === variant.optionValue.length - 1 ? "" : ", "}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Information;
