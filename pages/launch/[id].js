import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LaunchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // board, list, timeline
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

  const toggleChecklistItem = (sectionId, taskId, checklistIdx, itemIdx) => {
    setLaunch(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: section.tasks.map(task => {
              if (task.id === taskId) {
                const newChecklists = [...task.checklists];
                newChecklists[checklistIdx].items[itemIdx].completed = 
                  !newChecklists[checklistIdx].items[itemIdx].completed;
                return { ...task, checklists: newChecklists };
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Launch...</div>
        </div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Launch not found</div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const totalTasks = launch.sections?.reduce((sum, s) => sum + (s.tasks?.length || 0), 0) || 0;
  const completedTasks = launch.sections?.reduce((sum, s) => 
    sum + (s.tasks?.filter(t => t.status === 'completed').length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between mt-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {launch.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span>📅 {launch.launchDate}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  launch.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-700/50 text-gray-300'
                }`}>
                  {launch.status}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{completedTasks}/{totalTasks}</div>
                <div className="text-xs text-gray-400">Tasks Complete</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{overallProgress}%</div>
                <div className="text-xs text-gray-400">Progress</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${overallProgress}%` }}
              >
                <span className="text-xs font-bold">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'board' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📋 Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📝 List
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Board View */}
        {view === 'board' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {(searchTerm ? filteredSections : launch.sections)?.map(section => {
                const progress = calculateSectionProgress(section);
                const taskCount = section.tasks?.length || 0;
                const completedCount = section.tasks?.filter(t => t.status === 'completed').length || 0;
                
                return (
                  <div key={section.id} className="flex-shrink-0 w-80">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 h-full">
                      {/* Section Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">{section.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                          <span>{completedCount}/{taskCount} tasks</span>
                          <span className="font-bold text-blue-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {section.tasks?.map(task => (
                          <div 
                            key={task.id} 
                            className={`bg-gray-900/50 border rounded-lg p-4 hover:border-blue-500/50 transition-all ${
                              task.status === 'completed' 
                                ? 'border-green-500/30 bg-green-900/10' 
                                : 'border-gray-700'
                            }`}
                          >
                            {/* Task Header */}
                            <div className="flex items-start gap-3 mb-2">
                              <input
                                type="checkbox"
                                checked={task.status === 'completed'}
                                onChange={() => toggleTaskComplete(section.id, task.id)}
                                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
                              />
                              <div className="flex-1">
                                <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                  {task.name}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-400 mt-1">{task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
                                )}
                              </div>
                            </div>

                            {/* Checklists */}
                            {task.checklists?.map((checklist, checklistIdx) => (
                              <div key={checklistIdx} className="mt-3 ml-8 space-y-1">
                                <p className="text-xs font-medium text-gray-400 mb-1">{checklist.name}</p>
                                {checklist.items?.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => toggleChecklistItem(section.id, task.id, checklistIdx, itemIdx)}
                                      className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900 cursor-pointer"
                                    />
                                    <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                      {item.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}

                            {/* Task URL */}
                            {task.url && (
                              <a 
                                href={task.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                              >
                                🔗 View in Trello
                              </a>
                            )}
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
          <div className="space-y-6">
            {(searchTerm ? filteredSections : launch.sections)?.map(section => {
              const progress = calculateSectionProgress(section);
              
              return (
                <div key={section.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{section.name}</h3>
                    <span className="text-blue-400 font-bold">{progress}%</span>
                  </div>
                  
                  <div className="space-y-3">
                    {section.tasks?.map(task => (
                      <div 
                        key={task.id}
                        className={`bg-gray-900/50 border rounded-lg p-4 ${
                          task.status === 'completed' 
                            ? 'border-green-500/30 bg-green-900/10' 
                            : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => toggleTaskComplete(section.id, task.id)}
                            className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-gray-400 mt-1">{task.description}</p>
                            )}
                            
                            {task.checklists?.map((checklist, checklistIdx) => (
                              <div key={checklistIdx} className="mt-3 space-y-1">
                                <p className="text-sm font-medium text-gray-400">{checklist.name}</p>
                                {checklist.items?.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex items-center gap-2 ml-4">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => toggleChecklistItem(section.id, task.id, checklistIdx, itemIdx)}
                                      className="w-4 h-4 rounded border-gray-600 text-green-500 cursor-pointer"
                                    />
                                    <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                      {item.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.7);
        }
      `}</style>
    </div>
  );
}
