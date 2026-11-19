import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select...',
  searchPlaceholder = 'Type to search...',
  required = false,
  className = '',
  disabled = false,
  allowCustom = false,
  renderOption = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const customInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens in standard select mode
  useEffect(() => {
    if (!allowCustom && isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, allowCustom]);

  // Normalize options to { value, label, flag } objects
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: opt.value || opt.name || opt.label || '',
      label: opt.name || opt.label || opt.value || '',
      flag: opt.flag || null,
      code: opt.code || null
    };
  });

  // Filter options
  const filterQuery = allowCustom ? (value || '') : searchTerm;
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const selectedOption =
    normalizedOptions.find(opt => opt.value === value) ||
    (value ? { value, label: value } : null);

  const handleSelect = (optVal) => {
    onChange(optVal);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleStandardKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && !normalizedOptions.some(o => o.label.toLowerCase() === (value || '').toLowerCase())) {
        handleSelect(filteredOptions[0].value);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* --- MODE 1: ALLOW CUSTOM (DIRECT EDITABLE COMBOBOX) --- */}
      {allowCustom ? (
        <div className="relative flex items-center">
          <input
            ref={customInputRef}
            type="text"
            disabled={disabled}
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={handleCustomKeyDown}
            placeholder={placeholder}
            className={`w-full px-4 py-3 pr-16 rounded-xl border text-xs sm:text-sm text-gray-900 transition-all outline-none placeholder-gray-400 ${
              disabled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : isOpen
                ? 'border-[#134e35] ring-1 ring-[#134e35] bg-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(true);
                  customInputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setIsOpen(!isOpen);
                  if (!isOpen) customInputRef.current?.focus();
                }
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Show options"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#134e35]' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        /* --- MODE 2: STANDARD SEARCHABLE SELECT (DROPDOWN MODAL) --- */
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm text-left transition-all outline-none cursor-pointer ${
            disabled
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : isOpen
              ? 'border-[#134e35] ring-1 ring-[#134e35] bg-white'
              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.flag && <span className="text-base">{selectedOption.flag}</span>}
            <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#134e35]' : ''}`} />
        </button>
      )}

      {/* --- DROPDOWN POPOVER --- */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn max-h-72 flex flex-col">
          
          {/* Internal search box ONLY for standard mode */}
          {!allowCustom && (
            <div className="p-2.5 border-b border-gray-100 bg-[#f9faf9] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleStandardKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#134e35] focus:ring-1 focus:ring-[#134e35]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto flex-1 p-1.5 divide-y divide-gray-50">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-gray-500">
                {allowCustom && value?.trim() ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">Custom: &quot;{value.trim()}&quot;</p>
                    <p className="text-[11px] text-emerald-600 font-medium">✓ Will be saved as your district</p>
                  </div>
                ) : (
                  <span>No matching options found</span>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = (opt.value || '').toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => {
                      // Use onMouseDown so it fires before onBlur on the input
                      e.preventDefault();
                      handleSelect(opt.value);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#134e35] text-white font-bold'
                        : 'text-gray-800 hover:bg-[#f0f4f1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.flag && <span className="text-base">{opt.flag}</span>}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
