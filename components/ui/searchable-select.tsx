'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SearchableSelectOption {
  id: string;
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onSearch?: (searchTerm: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  searchPlaceholder = '검색...',
  disabled = false,
  required = false,
  className,
  onSearch,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  emptyMessage = '항목이 없습니다.',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle search with debounce
  useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current || !onLoadMore || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement && isOpen) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen, handleScroll]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div ref={containerRef} className={cn('relative', className)}>
        {/* Selected value button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-left',
            'focus:outline-none focus:border-blue-500',
            'flex items-center justify-between',
            disabled && 'opacity-50 cursor-not-allowed',
            !selectedOption && 'text-gray-500',
          )}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <i
            className={cn(
              'fas fa-chevron-down transition-transform',
              isOpen && 'transform rotate-180',
            )}
          ></i>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Options list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: '200px' }}
            >
              {isLoading && filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  로딩 중...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors',
                        'flex items-center gap-2',
                        value === option.value && 'bg-blue-50 text-blue-700',
                      )}
                    >
                      {value === option.value && (
                        <i className="fas fa-check text-blue-600"></i>
                      )}
                      <span>{option.label}</span>
                    </button>
                  ))}
                  {isLoading && filteredOptions.length > 0 && (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      로딩 중...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

