interface Variant {
  optionValue: string[];
  optionName: string;
}

const Information = ({ variants }: { variants: Variant[] }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl sm:text-2xl font-semibold">
        Additional Information
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {variants?.map((variant) => (
              <tr key={variant.optionName} className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm sm:text-base font-medium text-gray-700 bg-gray-50">
                  {variant.optionName}
                </td>
                <td className="py-3 px-4 text-sm sm:text-base text-gray-600">
                  {variant.optionValue.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Information;
