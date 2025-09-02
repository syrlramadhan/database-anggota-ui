'use client';

export default function Input({
  label,
  error,
  required = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 placeholder-gray-400 ${
          error 
            ? 'border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500' 
            : ''
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      
      {error && (
        <div id={`${inputId}-error`} className="flex items-center mt-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}
