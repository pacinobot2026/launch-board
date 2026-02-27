import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function LaunchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

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

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Move task between sections
    setLaunch(prev => {
      const newSections = [...prev.sections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);
      
      const [movedTask] = sourceSection.tasks.splice(source.index, 1);
      destSection.tasks.splice(destination.index, 0, movedTask);
      
      return { ...prev, sections: newSections };
    });
  };

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
    
    // Update selectedTask if modal is open
    if (selectedTask?.id === taskId) {
      const updatedTask = launch.sections
        .find(s => s.id === sectionId)?.tasks
        .find(t => t.id === taskId);
      if (updatedTask) {
        const newChecklists = [...updatedTask.checklists];
        newChecklists[checklistIdx].items[itemIdx].completed = 
          !newChecklists[checklistIdx].items[itemIdx].completed;
        setSelectedTask({ ...updatedTask, checklists: newChecklists });
      }
    }
  };

  const calculateSectionProgress = (section) => {
    if (!section.tasks || section.tasks.length === 0) return 0;
    const completed = section.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / section.tasks.length) * 100);
  };

  const calculateChecklistProgress = (task) => {
    if (!task.checklists || task.checklists.length === 0) return 0;
    let total = 0;
    let completed = 0;
    task.checklists.forEach(checklist => {
      checklist.items?.forEach(item => {
        total++;
        if (item.completed) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-border mx-auto mb-6"></div>
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

  // Get section ID for selected task
  const getTaskSection = (taskId) => {
    return launch.sections?.find(s => s.tasks?.some(t => t.id === taskId));
  };

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

        {/* Board View with Drag & Drop */}
        {view === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
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

                        {/* Tasks - Droppable */}
                        <Droppable droppableId={section.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar ${
                                snapshot.isDraggingOver ? 'bg-blue-500/5 rounded-xl' : ''
                              }`}
                            >
                              {section.tasks?.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedTask(task)}
                                      className={`group relative rounded-xl p-4 h-32 flex flex-col transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                                        snapshot.isDragging 
                                          ? 'shadow-2xl ring-2 ring-purple-500 scale-105 rotate-2' 
                                          : task.status === 'completed' 
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
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              toggleTaskComplete(section.id, task.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
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
                                        {task.checklists && task.checklists.length > 0 && (
                                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                                            <span className="text-xs">✓</span>
                                            <span className="text-xs font-medium">{calculateChecklistProgress(task)}%</span>
                                          </div>
                                        )}
                                        <div className="ml-auto flex items-center gap-1.5">
                                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-500/50" title="Priority"></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DragDropContext>
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
                        onClick={() => setSelectedTask(task)}
                        className={`group rounded-xl p-4 transition-all hover:scale-[1.01] cursor-pointer ${
                          task.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30' 
                            : 'bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={(e) => {
                              e.stopPropagation();
                              const sectionId = getTaskSection(task.id)?.id;
                              if (sectionId) toggleTaskComplete(sectionId, task.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {task.url && (
                                <a 
                                  href={task.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>🔗</span>
                                  <span>View in Trello</span>
                                </a>
                              )}
                              {task.checklists && task.checklists.length > 0 && (
                                <span className="text-sm text-gray-400">
                                  ✓ {calculateChecklistProgress(task)}% complete
                                </span>
                              )}
                            </div>
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="relative bg-gradient-to-br from-slate-900 to-blue-900 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
            
            {/* Modal Header */}
            <div className="relative border-b border-white/10 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedTask.name}</h2>
                  <p className="text-gray-400 text-sm">In list: {getTaskSection(selectedTask.id)?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative overflow-y-auto max-h-[calc(90vh-120px)] p-6 custom-scrollbar">
              {/* Description */}
              {selectedTask.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</h3>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <p className="text-white leading-relaxed">{selectedTask.description}</p>
                  </div>
                </div>
              )}

              {/* Checklists */}
              {selectedTask.checklists && selectedTask.checklists.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Checklist</h3>
                  <div className="space-y-4">
                    {selectedTask.checklists.map((checklist, checklistIdx) => {
                      const totalItems = checklist.items?.length || 0;
                      const completedItems = checklist.items?.filter(i => i.completed).length || 0;
                      const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                      
                      return (
                        <div key={checklistIdx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-white">{checklist.name}</h4>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                              {checklistProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${checklistProgress}%` }}
                            ></div>
                          </div>
                          <div className="space-y-2">
                            {checklist.items?.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => {
                                    const sectionId = getTaskSection(selectedTask.id)?.id;
                                    if (sectionId) toggleChecklistItem(sectionId, selectedTask.id, checklistIdx, itemIdx);
                                  }}
                                  className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer"
                                />
                                <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trello Link */}
              {selectedTask.url && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Links</h3>
                  <a
                    href={selectedTask.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-4 transition-all group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <span className="text-xl">🔗</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">View in Trello</div>
                      <div className="text-sm text-gray-400">Open original card</div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-400 group-hover:text-white transition-colors">→</span>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="relative border-t border-white/10 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <button
                onClick={() => {
                  const sectionId = getTaskSection(selectedTask.id)?.id;
                  if (sectionId) toggleTaskComplete(sectionId, selectedTask.id);
                  setSelectedTask(null);
                }}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  selectedTask.status === 'completed'
                    ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30 hover:from-gray-500/30 hover:to-gray-600/30'
                    : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 shadow-lg shadow-green-500/20'
                }`}
              >
                {selectedTask.status === 'completed' ? '✓ Mark Incomplete' : '✓ Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
