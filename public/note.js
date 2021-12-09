import fetch from './utils/fetch.js';

// get Test
fetch.get('/api/notes').then(res => console.log(res));

const $draggables = document.querySelectorAll('.draggable');
const $columns = document.querySelectorAll('.column');

$draggables.forEach($draggable => {
  $draggable.addEventListener('dragstart', () => {
    $draggable.classList.add('dragging');
  });

  $draggable.addEventListener('dragend', () => {
    $draggable.classList.remove('dragging');
  });
});

function getDragAfterElement (container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

$columns.forEach($noteContainer => {
  $noteContainer.addEventListener('dragover', e => {
    e.preventDefault();
    if (!e.target.classList.contains('note-list')) return;
    const draggable = document.querySelector('.dragging');
    // if (draggable.dataset.column === $noteContainer.dataset.column) return;
    const afterElement = getDragAfterElement($noteContainer, e.clientY);
    if (afterElement === undefined) {
      e.target.appendChild(draggable);
    } else {
      e.target.insertBefore(draggable, afterElement);
    }
    const draggingNoteData = {
      id: +draggable.dataset.id,
      column: $noteContainer.dataset.column,
      content: draggable.querySelector('.note-content-view').innerText,
      writer: {
        name: draggable.querySelector('.note-writer-id').innerText
      }
    };
    // PUT으로 서버에 데이터 업데이트 보내기
    if ($noteContainer.dataset.column !== draggable.dataset.column) {
      fetch.put(`/api/notes/${draggable.dataset.id}`, draggingNoteData);
      draggable.dataset.column = $noteContainer.dataset.column;
    }
  });
});
