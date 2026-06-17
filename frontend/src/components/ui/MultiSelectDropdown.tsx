import React, { useState, useRef, useEffect } from 'react';

interface Option {
    id: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
    label?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selectedIds, onChange, placeholder = 'Buscar...', label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));
    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()) && !selectedIds.includes(opt.id));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(item => item !== id));
        } else {
            onChange([...selectedIds, id]);
            setSearch('');
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            {label && <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</label>}
            
            <div 
                className="w-full min-h-12 bg-white border border-outline-variant rounded-lg flex flex-col focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-2 gap-2 cursor-text"
                onClick={() => setIsOpen(true)}
            >
                {/* Search Input */}
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selectedOptions.length === 0 ? placeholder : 'Buscar mais...'}
                    className="w-full outline-none bg-transparent text-body-md text-on-surface"
                />

                {/* Chips */}
                {selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedOptions.map(opt => (
                            <div key={opt.id} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-sm">
                                <span>{opt.label}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleOption(opt.id); }}
                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div 
                                key={opt.id} 
                                onClick={() => toggleOption(opt.id)}
                                className="px-4 py-2 hover:bg-surface-container-low cursor-pointer text-body-md text-on-surface"
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-body-sm text-on-surface-variant italic text-center">
                            Nenhum resultado encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
