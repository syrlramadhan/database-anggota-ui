'use client';

export default function SystemInformation() {
  const systemInfo = [
    { label: 'System Version', value: 'v2.1.0' },
    { label: 'Database Size', value: '42.3 MB' },
    { label: 'Last Updated', value: 'Aug 29, 2025' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systemInfo.map((info, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">{info.label}</h4>
            <p className="text-sm text-gray-600">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
