import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/launches.json')
      .then(res => res.json())
      .then(data => {
        setLaunches(data.launches);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Launch Management System</h1>
          <p className="text-gray-400">Manage product launches - Track tasks, progress, and timelines</p>
        </header>

        <div className="grid gap-6">
          {launches.map(launch => (
            <Link href={`/launch/${launch.id}`} key={launch.id}>
              <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{launch.name}</h2>
                    <p className="text-gray-400">Launch Date: {launch.launchDate}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    launch.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {launch.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
