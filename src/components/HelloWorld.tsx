import { config } from '../utils/config';

export const HelloWorld = () => {
  return (
    <div className="text-center p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          👋 Hello World!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Welcome to your modern React TypeScript app with Vite
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Tech Stack:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>⚛️ React {import.meta.env.REACT_VERSION || '19'}</li>
            <li>📘 TypeScript</li>
            <li>⚡ Vite</li>
            <li>🌐 Axios for API calls</li>
            <li>🔄 TanStack Query for data fetching</li>
            <li>🐻 Zustand for state management</li>
            <li>🎨 Tailwind CSS (via classes)</li>
          </ul>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>App: {config.appName}</p>
          <p>Version: {config.version}</p>
          <p>Environment: {config.environment}</p>
        </div>
      </div>
    </div>
  );
}; 