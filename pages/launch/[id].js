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
  const [showAddCard, setShowAddCard] = useState(null);
  const [newCardName, setNewCardName] = useState('');

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
    const { source, destination, draggableId, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Dragging columns
    if (type === 'COLUMN') {
      setLaunch(prev => {
        const newSections = Array.from(prev.sections);
        const [removed] = newSections.splice(source.index, 1);
        newSections.splice(destination.index, 0, removed);
        return { ...prev, sections: newSections };
      });
      return;
    }

    // Dragging cards
    setLaunch(prev => {
      const newSections = [...prev.sections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);
      
      const [movedTask] = sourceSection.tasks.splice(source.index, 1);
      destSection.tasks.splice(destination.index, 0, movedTask);
      
      return { ...prev, sections: newSections };
    });
  };

  const addCard = (sectionId) => {
    if (!newCardName.trim()) return;
    
    setLaunch(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: [
              ...section.tasks,
              {
                id: `task-${Date.now()}`,
                name: newCardName,
                description: '',
                status: 'pending',
                checklists: []
              }
            ]
          };
        }
        return section;
      })
    }));
    
    setNewCardName('');
    setShowAddCard(null);
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
          <div className="text-white text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Loading Launch Board...</div>
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
                🚀 Launch Board
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">{completedTasks}/{totalTasks}</div>
                  <div className="text-xs text-gray-300 mt-1 font-medium">Tasks Complete</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{overallProgress}%</div>
                  <div className="text-xs text-gray-300 mt-1 font-medium">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30"></div>
            <div className="relative w-full bg-white/10 backdrop-blur-sm rounded-full h-6 overflow-hidden border border-white/20 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-700 rounded-full flex items-center justify-end pr-3 shadow-2xl relative overflow-hidden"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                <span className="text-xs font-bold relative z-10 drop-shadow-lg">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1.5 border border-white/20 shadow-lg">
            <button
              onClick={() => setView('board')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                view === 'board' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📋 Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pl-11 w-80 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all placeholder-gray-400 shadow-lg"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          </div>
        </div>

        {/* Board View with Drag & Drop */}
        {view === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="overflow-x-auto pb-6"
                >
                  <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                    {(searchTerm ? filteredSections : launch.sections)?.map((section, index) => {
                      const progress = calculateSectionProgress(section);
                      const taskCount = section.tasks?.length || 0;
                      const completedCount = section.tasks?.filter(t => t.status === 'completed').length || 0;
                      
                      return (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex-shrink-0 w-80 transition-all duration-300 ${
                                snapshot.isDragging ? 'scale-105 rotate-2 opacity-80' : ''
                              }`}
                            >
                              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full shadow-2xl hover:shadow-purple-500/20 transition-all">
                                {/* Section Header - Draggable */}
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mb-5">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
                                      <span className="text-gray-400">⋮⋮</span>
                                      {section.name}
                                    </h3>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                                    <span className="font-medium">{completedCount}/{taskCount} tasks</span>
                                    <span className="font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{progress}%</span>
                                  </div>
                                  <div className="relative">
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20 shadow-inner">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500 relative overflow-hidden shadow-lg"
                                        style={{ width: `${progress}%` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Tasks - Droppable */}
                                <Droppable droppableId={section.id} type="TASK">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar mb-4 rounded-xl transition-all duration-300 ${
                                        snapshot.isDraggingOver ? 'bg-blue-500/10 p-2 border-2 border-dashed border-blue-400/50' : ''
                                      }`}
                                    >
                                      {section.tasks?.map((task, taskIndex) => (
                                        <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              onClick={() => setSelectedTask(task)}
                                              className={`group relative rounded-xl p-4 h-32 flex flex-col transition-all duration-300 hover:scale-[1.03] cursor-pointer ${
                                                snapshot.isDragging 
                                                  ? 'shadow-2xl ring-4 ring-purple-400/50 scale-110 rotate-3 bg-gradient-to-br from-white/20 to-white/30' 
                                                  : task.status === 'completed' 
                                                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 shadow-lg shadow-green-500/20' 
                                                    : 'bg-gradient-to-br from-white/10 to-white/15 border-2 border-white/20 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/30'
                                              }`}
                                            >
                                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-300"></div>
                                              
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
                                                    className="mt-1 w-5 h-5 flex-shrink-0 rounded-lg border-2 border-white/30 bg-white/10 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer transition-all shadow-md"
                                                  />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                  <h4 className={`font-semibold line-clamp-2 text-sm leading-snug ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-white drop-shadow-sm'}`}>
                                                    {task.name}
                                                  </h4>
                                                  {task.description && (
                                                    <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Task Footer */}
                                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 relative z-10">
                                                {task.url && (
                                                  <a 
                                                    href={task.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 hover:bg-blue-400/30 border border-white/20 hover:border-blue-400/50 transition-all group/icon shadow-md"
                                                    title="View in Trello"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <span className="text-sm group-hover/icon:scale-125 transition-transform">🔗</span>
                                                  </a>
                                                )}
                                                {task.checklists && task.checklists.length > 0 && (
                                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-md">
                                                    <span className="text-xs font-bold">✓</span>
                                                    <span className="text-xs font-bold text-blue-200">{calculateChecklistProgress(task)}%</span>
                                                  </div>
                                                )}
                                                <div className="ml-auto flex items-center gap-1.5">
                                                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-500/50 animate-pulse" title="Priority"></div>
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

                                {/* Add Card Button */}
                                {showAddCard === section.id ? (
                                  <div className="mt-3 space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Enter card title..."
                                      value={newCardName}
                                      onChange={(e) => setNewCardName(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && addCard(section.id)}
                                      autoFocus
                                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 shadow-lg"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => addCard(section.id)}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg"
                                      >
                                        Add Card
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAddCard(null);
                                          setNewCardName('');
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all border border-white/20"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowAddCard(section.id)}
                                    className="w-full mt-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-purple-400/50 rounded-xl py-3 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group shadow-lg"
                                  >
                                    <span className="text-xl group-hover:scale-125 transition-transform">+</span>
                                    <span>Add Card</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* List View - same as before but with better visuals */}
        {view === 'list' && (
          <div className="space-y-5">
            {(searchTerm ? filteredSections : launch.sections)?.map(section => {
              const progress = calculateSectionProgress(section);
              
              return (
                <div key={section.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{section.name}</h3>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{progress}%</span>
                  </div>
                  
                  <div className="space-y-3">
                    {section.tasks?.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`group rounded-xl p-4 transition-all hover:scale-[1.01] cursor-pointer ${
                          task.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 shadow-lg' 
                            : 'bg-gradient-to-br from-white/10 to-white/15 border-2 border-white/20 hover:border-purple-400/50 shadow-lg'
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
                            className="mt-1 w-5 h-5 rounded-lg border-2 border-white/30 bg-white/10 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg mb-1 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {task.url && (
                                <a 
                                  href={task.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>🔗</span>
                                  <span>View in Trello</span>
                                </a>
                              )}
                              {task.checklists && task.checklists.length > 0 && (
                                <span className="text-sm text-gray-300 font-medium">
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

      {/* Task Detail Modal - same content, better visuals */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-2 border-white/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Modal Header */}
            <div className="relative border-b border-white/20 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{selectedTask.name}</h2>
                  <p className="text-gray-300 text-sm">In list: <span className="font-medium text-blue-300">{getTaskSection(selectedTask.id)?.name}</span></p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all shadow-lg"
                >
                  <span className="text-2xl text-white">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative overflow-y-auto max-h-[calc(90vh-200px)] p-6 custom-scrollbar">
              {/* Description */}
              {selectedTask.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Description</h3>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg">
                    <p className="text-white leading-relaxed">{selectedTask.description}</p>
                  </div>
                </div>
              )}

              {/* Checklists */}
              {selectedTask.checklists && selectedTask.checklists.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Checklist</h3>
                  <div className="space-y-4">
                    {selectedTask.checklists.map((checklist, checklistIdx) => {
                      const totalItems = checklist.items?.length || 0;
                      const completedItems = checklist.items?.filter(i => i.completed).length || 0;
                      const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                      
                      return (
                        <div key={checklistIdx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white text-lg">{checklist.name}</h4>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                              {checklistProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden border border-white/20 shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300 shadow-lg"
                              style={{ width: `${checklistProgress}%` }}
                            ></div>
                          </div>
                          <div className="space-y-2">
                            {checklist.items?.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-3 group hover:bg-white/10 rounded-lg p-2.5 transition-all">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => {
                                    const sectionId = getTaskSection(selectedTask.id)?.id;
                                    if (sectionId) toggleChecklistItem(sectionId, selectedTask.id, checklistIdx, itemIdx);
                                  }}
                                  className="w-5 h-5 rounded-lg border-2 border-white/30 bg-white/10 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 cursor-pointer shadow-md"
                                />
                                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-white'}`}>
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
                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Links</h3>
                  <a
                    href={selectedTask.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border-2 border-blue-400/40 hover:border-blue-400/60 rounded-xl p-4 transition-all group shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-400/30 group-hover:bg-blue-400/40 transition-all shadow-md">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">View in Trello</div>
                      <div className="text-sm text-gray-300">Open original card</div>
                    </div>
                    <div className="text-gray-300 group-hover:text-white transition-colors text-xl">→</div>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="relative border-t border-white/20 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl">
              <button
                onClick={() => {
                  const sectionId = getTaskSection(selectedTask.id)?.id;
                  if (sectionId) toggleTaskComplete(sectionId, selectedTask.id);
                  setSelectedTask(null);
                }}
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-xl text-lg ${
                  selectedTask.status === 'completed'
                    ? 'bg-gradient-to-r from-gray-500/30 to-gray-600/30 text-gray-200 border-2 border-gray-400/40 hover:from-gray-500/40 hover:to-gray-600/40'
                    : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border-2 border-green-400/50 hover:from-green-500/40 hover:to-emerald-500/40 shadow-green-500/30'
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
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(96, 165, 250, 0.6), rgba(168, 85, 247, 0.6));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(96, 165, 250, 0.9), rgba(168, 85, 247, 0.9));
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
          animation: shimmer 2.5s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
