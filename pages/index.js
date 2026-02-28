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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-full"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-border mx-auto mb-6"></div>
          </div>
          <div className="text-white text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 rounded-full"></div>
              <h1 className="relative text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                🚀 Launch Board
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Track your product launches from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">idea to execution</span>
          </p>
          
          {/* Stats Banner */}
          <div className="mt-8 inline-flex items-center gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{launches.length}</div>
              <div className="text-sm text-gray-400 mt-1">Active Launches</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {launches.reduce((sum, l) => {
                  const total = l.sections?.reduce((s, sec) => s + (sec.tasks?.length || 0), 0) || 0;
                  return sum + total;
                }, 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">Total Tasks</div>
            </div>
          </div>

          {/* New from Template Button */}
          <div className="mt-8">
            <Link href="/templates">
              <div className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer">
                <span className="text-2xl group-hover:scale-125 transition-transform">✨</span>
                <span>New from Template</span>
                <span className="text-sm opacity-75">→</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Launch Cards */}
        <div className="grid gap-6 max-w-5xl mx-auto">
          {launches.map(launch => {
            const progress = calculateProgress(launch);
            const totalSections = launch.sections?.length || 0;
            const totalTasks = launch.sections?.reduce((sum, s) => sum + (s.tasks?.length || 0), 0) || 0;
            const completedTasks = launch.sections?.reduce((sum, s) => 
              sum + (s.tasks?.filter(t => t.status === 'completed').length || 0), 0) || 0;
            
            return (
              <Link href={`/launch/${launch.id}`} key={launch.id}>
                <div className="group relative">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 cursor-pointer shadow-2xl group-hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                          {launch.name}
                        </h2>
                        <p className="text-gray-400 flex items-center gap-2">
                          <span className="text-xl">📅</span>
                          <span className="font-medium">Launch Date: <span className="text-white">{launch.launchDate}</span></span>
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm ${
                        launch.status === 'active' 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20' 
                          : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}>
                        {launch.status}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="relative group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 group-hover/stat:scale-105 transition-transform">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{totalSections}</div>
                          <div className="text-xs text-gray-400 mt-1 font-medium">Sections</div>
                        </div>
                      </div>
                      <div className="relative group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 group-hover/stat:scale-105 transition-transform">
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{completedTasks}/{totalTasks}</div>
                          <div className="text-xs text-gray-400 mt-1 font-medium">Tasks</div>
                        </div>
                      </div>
                      <div className="relative group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl blur-xl opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 group-hover/stat:scale-105 transition-transform">
                          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{progress}%</div>
                          <div className="text-xs text-gray-400 mt-1 font-medium">Complete</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-20"></div>
                      <div className="relative w-full bg-white/5 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-white/10 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 rounded-full relative overflow-hidden"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
