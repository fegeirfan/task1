import { Router } from 'express';
import Note from '../models/note.js';

const router = Router();

router.get('/', (req, res, next) => {
  const notes = Note.list();
  res.json(notes);
});

router.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);

  try {
    const note = Note.get(id);
    res.json(note);
  } catch (e) {
    next(e);
  }
});

router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  try {
    const note = Note.create(title, content);
    res.status(201).json(note);
  } catch (e) {
    next(e);
  }
});
router.put('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  try {
    const note = Note.update(id, title, content);
    res.json(note);
  } catch (e) {
    next(e);
  }
});
router.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id);

  try {
    Note.remove(id);
    res.json({ result: 'success' });
  } catch (e) {
    next(e);
  }
});
export default router;