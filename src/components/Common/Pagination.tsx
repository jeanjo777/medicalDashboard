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
    <div className="flex flex-col sm:flex-row items-center justify-between theme-bg-secondary rounded-lg px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border theme-border gap-3 sm:gap-0">
      <div className="text-xs sm:text-sm theme-text-muted text-center sm:text-left">
        <span className="hidden sm:inline">Affichage de </span>
        <span className="font-medium theme-text-primary">{startItem}</span> à{' '}
        <span className="font-medium theme-text-primary">{endItem}</span>
        <span className="hidden sm:inline"> sur{' '}
        <span className="font-medium theme-text-primary">{totalItems}</span> résultats</span>
        <span className="sm:hidden"> / {totalItems}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border theme-border theme-text-muted hover:text-[var(--text-primary)] hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="First page"
        >
          <ChevronsLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border theme-border theme-text-muted hover:text-[var(--text-primary)] hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-1 sm:py-2 theme-text-muted text-xs sm:text-sm">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`
                  min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors active:scale-95 cursor-pointer
                  ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'theme-text-muted hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
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
          className="p-1.5 sm:p-2 rounded-lg border theme-border theme-text-muted hover:text-[var(--text-primary)] hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg border theme-border theme-text-muted hover:text-[var(--text-primary)] hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 min-w-[36px] sm:min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="Last page"
        >
          <ChevronsRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
