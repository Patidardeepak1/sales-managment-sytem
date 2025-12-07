const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const maxVisible = 6; // only show 6 pages at a time

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1 mt-6">

      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-3 py-1.5 text-sm font-medium rounded 
          ${currentPage === 1 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "text-gray-700 hover:bg-gray-100"}`}
      >
        Prev
      </button>

      {/* Visible Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            currentPage === page
              ? "bg-gray-800 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-3 py-1.5 text-sm font-medium rounded 
          ${currentPage === totalPages 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "text-gray-700 hover:bg-gray-100"}`}
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;
