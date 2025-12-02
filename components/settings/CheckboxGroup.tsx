'use client';

interface CheckboxOption {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  onChange: (id: string, checked: boolean) => void;
  className?: string;
}

export function CheckboxGroup({ options, onChange, className = '' }: CheckboxGroupProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {options.map((option) => (
        <label
          key={option.id}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={option.checked}
            disabled={option.disabled}
            onChange={(e) => onChange(option.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

