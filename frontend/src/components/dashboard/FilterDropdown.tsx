import React, { useEffect, useRef } from "react";

const filterValue = ["all", "pending", "confirmed", "rejected", "cancelled", "done"];

interface FilterDropdownProps {
    selection: string;
    setSelection: (val: string) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ selection, setSelection, isOpen, setIsOpen }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-[150px] text-white border-2 border-transparent hover:border-accent/20 px-4 py-2 rounded-lg transition duration-300 flex items-center justify-between bg-[#121212]"
            >
                <span className="capitalize">{selection}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-40 rounded-xl shadow-2xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden animate-fade-in">
                    <div className="py-1">
                        {filterValue.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setSelection(filter);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 capitalize ${selection === filter
                                    ? "bg-accent/10 text-accent font-bold"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
