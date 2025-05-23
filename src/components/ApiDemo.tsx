import { useState } from 'react';
import { useHealthCheck, useGreeting, useEcho } from '../hooks/useDemo';
import { Button } from './Button';

export const ApiDemo = () => {
  const [echoMessage, setEchoMessage] = useState('');
  const [name, setName] = useState('');
  
  const { data: health, isLoading: healthLoading, error: healthError } = useHealthCheck();
  const { data: greeting, isLoading: greetingLoading } = useGreeting(name || undefined);
  const { mutate: sendEcho, isPending: echoLoading, data: echoData } = useEcho();

  const handleEcho = () => {
    if (echoMessage.trim()) {
      sendEcho(echoMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">API Demo</h2>
        <p className="text-gray-600">Modern React app with backend connectivity</p>
      </div>

      {/* Health Check Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold mb-4">Health Check</h3>
        {healthLoading && <p className="text-blue-600">Checking API health...</p>}
        {healthError && (
          <p className="text-red-600">API Error: {(healthError as any).message}</p>
        )}
        {health && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">✅ API is healthy!</p>
            <pre className="text-sm text-green-700 mt-2">
              {JSON.stringify(health.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Greeting Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold mb-4">Greeting API</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {greetingLoading && <p className="text-blue-600">Loading greeting...</p>}
          {greeting && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">{greeting.data?.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Echo Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold mb-4">Echo API</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="echo" className="block text-sm font-medium text-gray-700 mb-2">
              Message to Echo
            </label>
            <input
              id="echo"
              type="text"
              value={echoMessage}
              onChange={e => setEchoMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button 
            onClick={handleEcho}
            loading={echoLoading}
            disabled={!echoMessage.trim()}
          >
            Send Echo
          </Button>
          {echoData && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800">Echo: {echoData.data?.echo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 