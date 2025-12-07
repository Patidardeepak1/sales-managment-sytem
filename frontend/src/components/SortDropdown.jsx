const SortDropdown = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'date', label: 'Date (Newest First)', defaultOrder: 'desc' },
    { value: 'quantity', label: 'Quantity', defaultOrder: 'asc' },
    { value: 'customerName', label: 'Customer Name (A-Z)', defaultOrder: 'asc' },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === sortBy);

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    const option = sortOptions.find((opt) => opt.value === newSortBy);
    onSortChange(newSortBy, option.defaultOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort"
        value={sortBy}
        onChange={handleSortChange}
        className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;

