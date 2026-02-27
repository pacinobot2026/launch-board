import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LaunchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    fetch('/data/launches.json')
      .then(res => res.json())
      .then(data => {
        const foundLaunch = data.launches.find(l => l.id === id);
        setLaunch(foundLaunch);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Launch not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back to all launches
        </Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{launch.name}</h1>
          <p className="text-gray-400">Launch Date: {launch.launchDate}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
            launch.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
          }`}>
            {launch.status}
          </span>
        </header>

        <div className="grid gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Overview</h2>
            <p className="text-gray-400">Import Trello data to see sections and tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
