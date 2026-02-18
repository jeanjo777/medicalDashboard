import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPrevious,
  onNext,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-[#1e293b] rounded-lg px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border border-[#334155] gap-3 sm:gap-0">
      <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
        <span className="hidden sm:inline">Affichage de </span>
        <span className="font-medium text-white">{startItem}</span> à{' '}
        <span className="font-medium text-white">{endItem}</span>
        <span className="hidden sm:inline"> sur{' '}
        <span className="font-medium text-white">{totalItems}</span> résultats</span>
        <span className="sm:hidden"> / {totalItems}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border border-[#334155] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
          aria-label="First page"
        >
          <ChevronsLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border border-[#334155] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-1 sm:py-2 text-gray-400 text-xs sm:text-sm">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`
                  min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors active:scale-95
                  ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#334155]'
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg border border-[#334155] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
          aria-label="Next page"
        >
          <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg border border-[#334155] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
          aria-label="Last page"
        >
          <ChevronsRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
