const books = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function generateId() {
  return +new Date().getTime();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBook(bookObject) {
  const {id, title, author, year, isComplete} = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;
  textTitle.setAttribute('data-testid', `bookItemTitle`);

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${author}`;
  textAuthor.setAttribute('data-testid', `bookItemAuthor`);

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${year}`;
  textYear.setAttribute('data-testid', `bookItemYear`);

  const compleateButton = document.createElement('button');
  compleateButton.setAttribute('data-testid', `bookItemIsCompleteButton`)
  if (isComplete) {
    compleateButton.innerText = `Takselesai dibaca`
    compleateButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });
  } else {
    compleateButton.innerText = `Selesai dibaca`;
    compleateButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });
  }

  const deletButton = document.createElement('button');
  deletButton.setAttribute('data-testid', `bookItemDeleteButton`);
  deletButton.innerText = `Hapus Buku`;
  deletButton.addEventListener('click', function () {
    removeBook(id);
  })

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', `bookItemEditButton`);
  editButton.innerText = `Edit Buku`;
  editButton.addEventListener('click', function () {
    editBook(id);
  })

  const btnContainer = document.createElement('div');
  btnContainer.append(compleateButton,deletButton,editButton);

  const bookitem = document.createElement('div');
  bookitem.setAttribute('data-bookid', `${id}`);
  bookitem.setAttribute('data-testid',`bookItem`);
  bookitem.append(textTitle,textAuthor,textYear,btnContainer);

  return bookitem;
}

function addBook() {
  const titleFill = document.getElementById('bookFormTitle').value;
  const authorFill = document.getElementById('bookFormAuthor').value;
  const yearFill = document.getElementById('bookFormYear').value;
  const theYear = Number(yearFill);
  const compleateBoll = document.getElementById('bookFormIsComplete');
  const isCheked = compleateBoll.checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, titleFill, authorFill, theYear, isCheked)
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  handleStorageEvent('added');
}

function filterBook() {
  const searchInput = document.getElementById('searchBookTitle');
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (!searchInput.value.trim()) {
    alert('Maaf kolom pencarian kosong')
    location.reload();
  } else {
    books.length = 0;
    for (const book of data) {
      if (book.title.toLowerCase().includes(searchInput.value.toLowerCase())) {
        books.push(book);
      }
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  handleStorageEvent('changed');
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  handleStorageEvent('deleted');
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  handleStorageEvent('undo');
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  if (bookTarget) {

    let newTitle = '';
    while (!newTitle.trim()) {
      newTitle = prompt('Masukan Judul Baru:', bookTarget.title);
      if (!newTitle.trim()) alert('Judul tidak boleh kosong.');
    }

    let newAuthor = '';
    while (!newAuthor.trim()) {
      newAuthor = prompt('Masukan Authornya:', bookTarget.author);
      if (!newAuthor.trim()) alert('Author tidak boleh kosong.');
    }

    let newYear = '';
    while (!newYear.trim()) {
      newYear = prompt('Masukan Tahunnya:', bookTarget.year);
      if (!newYear.trim()) alert('Tahun tidak boleh kosong.');
    }

    bookTarget.title = newTitle;
    bookTarget.author = newAuthor;
    bookTarget.year = Number(newYear);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    handleStorageEvent('changed');
  } 
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function handleStorageEvent(type) {
  let message = "";
  switch(type) {
    case 'added':
      message = "Data baru ditambahkan";
      break;
    case 'deleted':
      message = "Data dihapus";
      break;
    case 'changed':
      message = "Data diubah";
      break;
    case 'undo':
      message = "Data diubah kembali status bacanya";
      break;
  }
  alert(message);
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const filterForm = document.getElementById('searchBook');
  filterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
  if (books.length == 0) {
    incompleteBookList.innerHTML = 'maaf buku masih kosong atau tidak ketemu';
    completeBookList.innerHTML = 'maaf buku masih kosong atau tidak ketemu';
  }
});