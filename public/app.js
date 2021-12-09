import fetch from './utils/fetch.js';

const COLUMN = {
  TODO: 'TODO',
  PROGRESS: 'PROGRESS',
  DONE: 'DONE',
};

let notes = [
  {
    id: 1,
    column: COLUMN.TODO,
    content: 'content1',
    writer: {
      name: 'default1',
    },
  },
  {
    id: 2,
    column: COLUMN.TODO,
    content: 'content2',
    writer: {
      name: 'default2',
    },
  },
  {
    id: 3,
    column: COLUMN.PROGRESS,
    content: 'content3',
    writer: {
      name: 'default3',
    },
  },
  {
    id: 4,
    column: COLUMN.DONE,
    content: 'content4',
    writer: {
      name: 'default4',
    },
  },
];

const $columnList = document.querySelectorAll('.note-list');
const $columnContainer = document.querySelector('.column-container');
const $kanbanColumn = document.querySelectorAll('.kanban-column');

const clearList = () => {
  $columnList.forEach(colList => (colList.textContent = ''));
};

// const generateId = () => {
//   notes.forEach(({ id }) => {});
// };

const renderNoteByCol = (notes, colList) => {
  notes.forEach(note => {
    const template = `
    <li data-id="${note.id}" data-column=${note.column} class="note-container draggable" draggable="true">
    <div class="note-icon"><box-icon name="spreadsheet"></box-icon></div>
    <div class="note-content">
      <p class="note-content-view">
        ${note.content}
      </p>
      <textarea class="note-content-input block"></textarea>
      <p class="note-writer">Added by <span class="note-writer-id">${note.writer.name}</span></p>
    </div>
    <button class="note-edit-btn"><box-icon name="edit-alt" animation="tada-hover"></box-icon></button>
    <button class="note-delete-btn"><box-icon name="trash" animation="tada-hover"></box-icon></button>
  </li>`;
    colList.insertAdjacentHTML('beforeend', template);
  });
};

const renderNotes = () => {
  const todo = [];
  const progress = [];
  const done = [];

  notes.forEach(el => {
    if (el.column === COLUMN.TODO) todo.push(el);
    else if (el.column === COLUMN.PROGRESS) progress.push(el);
    else done.push(el);
  });

  console.log($columnList);

  [...$columnList].forEach(colList => {
    if (colList.classList.contains('todo')) {
      renderNoteByCol(todo, colList);
    } else if (colList.classList.contains('progress')) {
      renderNoteByCol(progress, colList);
    } else if (colList.classList.contains('done')) {
      renderNoteByCol(done, colList);
    }
  });
};

const addNote = colList => {
  const $noteContentView = document.querySelector('.note-content-view.block');

  if ($noteContentView !== null) {
    colList.lastChild.remove();
    return;
  }

  const template = [];

  template.push(`<div class="add-note-container">
  <textarea class="add-note-content-input"></textarea>
  <div class="add-note-submit-form">
    <button class="note-add-btn">Add</button>
    <button class="note-cancel-btn">Cancel</button>
  </div>
</div>`);

  colList.insertAdjacentHTML('afterbegin', template.join(''));
};

const editNote = target => {
  const $noteContentView = target.parentNode.querySelector('.note-content-view');
  const $noteContentInput = target.parentNode.querySelector('.note-content-input');
  const targetId = target.parentNode.dataset.id;

  if ($noteContentInput.classList.contains('block')) {
    $noteContentInput.classList.toggle('block');
    $noteContentView.classList.toggle('block');
  } else if ($noteContentView.classList.contains('block')) {
    const userInput = $noteContentInput.value;
    let targetNote = {};
    notes.forEach(note => {
      if (note.id === +targetId) {
        targetNote = { ...note, content: userInput };
        note = targetNote;
      }
    });

    (async () => {
      const res = await fetch.put(`api/notes/${targetId}`, targetNote);

      renderNotes();
    })();
  }
};

const deleteNote = target => {
  const targetId = target.parentNode.dataset.id;
  notes = notes.filter(note => note.id !== +targetId);

  (async () => {
    const res = await fetch.delete(`api/notes/${targetId}`);
    console.log('DELETE', res);
    clearList();
    renderNotes();
  })();
};

$columnContainer.addEventListener('click', e => {
  const eventTarget = e.target;
  const eventTargetParent = e.target.parentNode;
  const targetClsList = eventTarget.classList;
  const targetParentClsList = eventTargetParent.classList;

  if (
    !targetClsList.contains('icon-plus') &&
    !targetParentClsList.contains('note-edit-btn') &&
    !targetParentClsList.contains('note-delete-btn')
  )
    return;

  if (targetParentClsList.contains('note-edit-btn')) {
    editNote(eventTargetParent);
    return;
  }

  if (targetParentClsList.contains('note-delete-btn')) {
    deleteNote(eventTargetParent);
    return;
  }

  const columnList = eventTarget.parentNode.nextSibling.nextSibling;

  addNote(columnList);
});

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    const res = await fetch.get('api/notes');
    notes = await res;
    renderNotes();

    console.log(res);

    const $draggables = document.querySelectorAll('.draggable');

    $draggables.forEach($draggable => {
      $draggable.addEventListener('dragstart', () => {
        $draggable.classList.add('dragging');
      });

      $draggable.addEventListener('dragend', () => {
        $draggable.classList.remove('dragging');
      });
    });
  })();
});
