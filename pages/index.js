import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/launches.json')
      .then(res => res.json())
      .then(data => {
        setLaunches(data.launches);
        setLoading(false);
      });
  }, []);

  const calculateProgress = (launch) => {
    if (!launch.sections) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    
    launch.sections.forEach(section => {
      if (section.tasks) {
        section.tasks.forEach(task => {
          totalTasks++;
          if (task.status === 'completed') completedTasks++;
        });
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Launch Board...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                🚀 Launch Board
              </h1>
              <p className="text-gray-400 text-lg">Track your product launches from idea to execution</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{launches.length}</div>
              <div className="text-sm text-gray-400">Active Launches</div>
            </div>
          </div>
        </header>

        {/* Launch Cards */}
        <div className="grid gap-6">
          {launches.map(launch => {
            const progress = calculateProgress(launch);
            const totalSections = launch.sections?.length || 0;
            const totalTasks = launch.sections?.reduce((sum, s) => sum + (s.tasks?.length || 0), 0) || 0;
            
            return (
              <Link href={`/launch/${launch.id}`} key={launch.id}>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                        {launch.name}
                      </h2>
                      <p className="text-gray-400">
                        📅 Launch Date: <span className="text-white font-medium">{launch.launchDate}</span>
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      launch.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                    }`}>
                      {launch.status}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-400">{totalSections}</div>
                      <div className="text-xs text-gray-400">Sections</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-400">{totalTasks}</div>
                      <div className="text-xs text-gray-400">Tasks</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">{progress}%</div>
                      <div className="text-xs text-gray-400">Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
