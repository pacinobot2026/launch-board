import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LaunchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!id) return;
    
    fetch('/launches.json')
      .then(res => res.json())
      .then(data => {
        const foundLaunch = data.launches.find(l => l.id === id);
        setLaunch(foundLaunch);
        setLoading(false);
      });
  }, [id]);

  const toggleTaskComplete = (sectionId, taskId) => {
    setLaunch(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: section.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  status: task.status === 'completed' ? 'pending' : 'completed'
                };
              }
              return task;
            })
          };
        }
        return section;
      })
    }));
  };

  const calculateSectionProgress = (section) => {
    if (!section.tasks || section.tasks.length === 0) return 0;
    const completed = section.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / section.tasks.length) * 100);
  };

  const calculateOverallProgress = () => {
    if (!launch?.sections) return 0;
    let total = 0;
    let completed = 0;
    launch.sections.forEach(section => {
      section.tasks?.forEach(task => {
        total++;
        if (task.status === 'completed') completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const filteredSections = launch?.sections?.map(section => ({
    ...section,
    tasks: section.tasks?.filter(task => 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.tasks?.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-full"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-border mx-auto mb-6" style={{ maskImage: 'linear-gradient(transparent 50%, black 50%)', WebkitMaskImage: 'linear-gradient(transparent 50%, black 50%)' }}></div>
          </div>
          <div className="text-white text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Loading Launch...</div>
        </div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Launch not found</div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const totalTasks = launch.sections?.reduce((sum, s) => sum + (s.tasks?.length || 0), 0) || 0;
  const completedTasks = launch.sections?.reduce((sum, s) => 
    sum + (s.tasks?.filter(t => t.status === 'completed').length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all mb-6">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-start justify-between mt-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {launch.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  {launch.launchDate}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  launch.status === 'active' 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20' 
                    : 'bg-white/5 text-gray-300 border border-white/10'
                }`}>
                  {launch.status}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-2xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{completedTasks}/{totalTasks}</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">Tasks Complete</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-2xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{overallProgress}%</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-20"></div>
            <div className="relative w-full bg-white/5 backdrop-blur-sm rounded-full h-6 overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 rounded-full flex items-center justify-end pr-3 shadow-lg relative overflow-hidden"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                <span className="text-xs font-bold relative z-10">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setView('board')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                view === 'board' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📋 Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📝 List
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2.5 pl-10 w-80 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder-gray-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>

        {/* Board View */}
        {view === 'board' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-5" style={{ minWidth: 'min-content' }}>
              {(searchTerm ? filteredSections : launch.sections)?.map(section => {
                const progress = calculateSectionProgress(section);
                const taskCount = section.tasks?.length || 0;
                const completedCount = section.tasks?.filter(t => t.status === 'completed').length || 0;
                
                return (
                  <div key={section.id} className="flex-shrink-0 w-80">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 h-full shadow-2xl">
                      {/* Section Header */}
                      <div className="mb-5">
                        <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{section.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span className="font-medium">{completedCount}/{taskCount} tasks</span>
                          <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{progress}%</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative overflow-hidden"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {section.tasks?.map(task => (
                          <div 
                            key={task.id} 
                            className={`group relative rounded-xl p-4 h-32 flex flex-col transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                              task.status === 'completed' 
                                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30' 
                                : 'bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-500/50'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
                            
                            {/* Task Header */}
                            <div className="flex items-start gap-3 flex-1 relative z-10">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'completed'}
                                  onChange={() => toggleTaskComplete(section.id, task.id)}
                                  className="mt-1 w-5 h-5 flex-shrink-0 rounded-md border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer transition-all"
                                />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <h4 className={`font-semibold line-clamp-2 text-sm leading-snug ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                  {task.name}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Task Footer */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 relative z-10">
                              {task.url && (
                                <a 
                                  href={task.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 transition-all group/icon"
                                  title="View in Trello"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-sm group-hover/icon:scale-110 transition-transform">🔗</span>
                                </a>
                              )}
                              <div className="ml-auto flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-500/50" title="Priority"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-5">
            {(searchTerm ? filteredSections : launch.sections)?.map(section => {
              const progress = calculateSectionProgress(section);
              
              return (
                <div key={section.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{section.name}</h3>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{progress}%</span>
                  </div>
                  
                  <div className="space-y-3">
                    {section.tasks?.map(task => (
                      <div 
                        key={task.id}
                        className={`group rounded-xl p-4 transition-all hover:scale-[1.01] ${
                          task.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30' 
                            : 'bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => toggleTaskComplete(section.id, task.id)}
                            className="mt-1 w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                            )}
                            {task.url && (
                              <a 
                                href={task.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
                              >
                                <span>🔗</span>
                                <span>View in Trello</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
