const express = require('express');

// Mock
const COLUMN = {
  TODO: 'TODO',
  PROGRESS: 'PROGRESS',
  DONE: 'DONE',
};

const MESSAGE = {
  VALUE_NULL: '필요한 값이 없습니다.',
  VALUE_INVALID: '파라미터 값이 잘못 되었습니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류',
};

let notes = [
  {
    id: 1,
    column: COLUMN.TODO,
    content: '해커톤 끝내기',
    writer: {
      name: 'default',
    },
  },
  {
    id: 2,
    column: COLUMN.PROGRESS,
    content: '맥도날드 먹기',
    writer: {
      name: 'default',
    },
  },
  {
    id: 3,
    column: COLUMN.DONE,
    content: '코테 공부하기',
    writer: {
      name: 'default',
    },
  },
];

const app = express();
const PORT = 5678;

app.use(express.static('public'));
app.use(express.json());

const confirmId = id => notes.some(note => note.id === +id);

app.get('/api/notes', (req, res) => {
  res.send(notes);
});

app.post('/api/notes', (req, res) => {
  if (!Object.keys(req.body).length) return res.status(400).send({ error: '400', message: MESSAGE.VALUE_NULL });
  const newNote = req.body;
  notes = [newNote, ...notes];
  res.send(newNote);
});

// TODO : payload 안들어왔을 때 처리하기
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  if (!Object.keys(req.body).length) return res.status(400).send({ error: '400', message: MESSAGE.VALUE_NULL });
  const updateNote = req.body;
  if (!confirmId(id)) return res.status(400).send({ error: '400', message: MESSAGE.VALUE_INVALID });
  notes = notes.map(note => (note.id === +id ? updateNote : note));
  res.send(updateNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  if (!confirmId(id)) return res.status(400).send({ error: '400', message: MESSAGE.VALUE_INVALID });
  const deleteNote = notes.filter(note => note.id === +id)[0];
  notes = notes.filter(note => note.id !== +id);
  res.send(deleteNote);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
