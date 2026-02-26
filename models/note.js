const notes = [{
  id: 1,
  title: 'first note',
  content: 'My first note is here.',
},
{
  id: 2,
  title: 'secondnote',
  content: 'My second note is here.'
}
];

const list = () => {
  return notes.map(({ id, title }) => ({
    id,
    title
  }));
};

const get = (id) => {
  const note = notes.find((note) => note.id === id);

  if (!note) {
    throw new Error('Note not found');
  }

  return note;
};
const create = (title, content) => {
  const lastId = notes.length
    ? notes[notes.length - 1].id
    : 0;

  const newNote = {
    id: lastId + 1,
    title,
    content
  };

  notes.push(newNote);
  return newNote;
};

const update = (id, title, content) => {
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    throw new Error('Note not found for update');
  }

  const updatedNote = {
    ...notes[index],
    title,
    content
  };

  notes[index] = updatedNote;
  return updatedNote;
};
const remove = (id) => {
  const exists = notes.some((note) => note.id === id);

  if (!exists) {
    throw new Error('Note not found for delete');
  }

  notes.splice(exists, 1);
  // notes = notes.filter(note => note.id !== id);
  return;
};


export default {
  list,
   get,
    create, 
    update, 
    remove
};
