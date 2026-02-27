const fs = require('fs');

// Read files
const cards = JSON.parse(fs.readFileSync('./data/trello-cards.json', 'utf8'));
const lists = JSON.parse(fs.readFileSync('./data/trello-lists.json', 'utf8'));

// Create list map
const listMap = {};
lists.forEach(list => {
  listMap[list.id] = list.name;
});

// Group cards by list
const sections = {};
cards.forEach(card => {
  const listId = card.idList;
  const listName = listMap[listId] || 'Unknown';
  
  if (!sections[listId]) {
    sections[listId] = {
      id: listId,
      name: listName,
      tasks: []
    };
  }
  
  // Extract checklist items
  const checklists = (card.checklists || []).map(checklist => ({
    name: checklist.name,
    items: (checklist.checkItems || []).map(item => ({
      name: item.name,
      completed: item.state === 'complete'
    }))
  }));
  
  sections[listId].tasks.push({
    id: card.id,
    name: card.name,
    description: card.desc || '',
    url: card.url,
    status: 'pending',
    checklists: checklists
  });
});

// Build launch data
const launch = {
  id: 'aibot-studio',
  name: 'AIBot Studio',
  launchDate: '2026-01-27',
  status: 'active',
  sections: Object.values(sections)
};

// Save
const launchesData = {
  launches: [launch]
};

fs.writeFileSync('./data/launches.json', JSON.stringify(launchesData, null, 2));
console.log(`✓ Imported ${cards.length} cards across ${lists.length} sections`);
console.log(`✓ Saved to data/launches.json`);
