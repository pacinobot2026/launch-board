import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Templates() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/data/templates.json')
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates);
        setLoading(false);
      });
  }, []);

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setBoardName(template.name.replace(/^[🚀🎥🎓📚💻]\s/, '')); // Remove emoji from suggested name
  };

  const createFromTemplate = async () => {
    if (!boardName.trim()) {
      alert('Please enter a name for your board');
      return;
    }

    setCreating(true);

    // Create new board from template
    const newBoard = {
      id: boardName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: boardName,
      launchDate: new Date().toISOString().split('T')[0],
      status: 'active',
      sections: selectedTemplate.sections.map((section, sectionIdx) => ({
        id: `section-${sectionIdx}`,
        name: section.name,
        tasks: section.tasks.map((task, taskIdx) => ({
          id: `task-${sectionIdx}-${taskIdx}`,
          name: task.name,
          description: task.description || '',
          status: 'pending',
          url: '',
          checklists: []
        }))
      }))
    };

    // In a real app, this would POST to an API
    // For now, we'll just navigate to the board
    // TODO: Actually save the board data
    
    router.push(`/launch/${newBoard.id}`);
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
          <div className="text-white text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Loading Templates...</div>
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

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all mb-6">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          <div className="text-center mt-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Launch Templates
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Start your next project with pre-built workflows. Choose a template and customize it for your launch.
            </p>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {templates.map(template => {
            const totalTasks = template.sections.reduce((sum, s) => sum + s.tasks.length, 0);
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <div
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl transition-opacity duration-300 ${
                  isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'
                }`}></div>
                
                <div className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
                  isSelected 
                    ? 'border-blue-400/50 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/10 group-hover:border-purple-400/30'
                }`}>
                  <div className="text-5xl mb-4">{template.name.split(' ')[0]}</div>
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {template.name.substring(template.name.indexOf(' ') + 1)}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-400">📋</span>
                      <span>{template.sections.length} sections</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-400">✓</span>
                      <span>{totalTasks} tasks</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-semibold">
                        ✓ Selected
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Board Section */}
        {selectedTemplate && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Your Board
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g., Q1 2026 Product Launch"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all"
                />
              </div>

              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                <p className="text-sm text-blue-200">
                  <strong>Template:</strong> {selectedTemplate.name}<br />
                  <strong>Includes:</strong> {selectedTemplate.sections.length} sections with {selectedTemplate.sections.reduce((sum, s) => sum + s.tasks.length, 0)} pre-configured tasks
                </p>
              </div>

              <button
                onClick={createFromTemplate}
                disabled={creating || !boardName.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Board...' : 'Create Board from Template'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
