'use client';

export default function Select({
  label,
  error,
  required = false,
  options = [],
  placeholder = 'Pilih...',
  className = '',
  id,
  ...props
}) {
  const selectId = id || props.name;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
          error 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-red-500 flex items-center">
          <span className="w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
