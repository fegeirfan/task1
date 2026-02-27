const notes = [{
  id: 1,
  title: 'first note',
  content: 'My first note is here.',
  author: 'Admin'
},
{
  id: 2,
  title: 'secondnote',
  content: 'My second note is here.',
  author: 'Admin'
}
];

const list = () => {
  return notes.map(({ id, title, author }) => ({
    id,
    title,
    author
  }));
};

const get = (id) => {
  const note = notes.find((note) => note.id === id);

  if (!note) {
    throw new Error('Note not found');
  }

  return note;
};
const create = (title, content, author = 'Anonymous') => {
  const lastId = notes.length
    ? notes[notes.length - 1].id
    : 0;

  const newNote = {
    id: lastId + 1,
    title,
    content,
    author
  };

  notes.push(newNote);
  return newNote;
};

const update = (id, title, content, author) => {
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    throw new Error('Note not found for update');
  }

  const updatedNote = {
    ...notes[index],
    title,
    content,
    author: author || notes[index].author
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
