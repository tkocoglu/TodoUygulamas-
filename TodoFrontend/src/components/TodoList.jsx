import React, { useState, useEffect } from 'react';

// Tarih formatlama yardımcı fonksiyonu
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  let formattedDate = date.toLocaleDateString('tr-TR', options);
  if (includeTime) {
    formattedDate += ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  return formattedDate;
};

const TodoList = ({ onTodoAdded }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null); // Hangi todo'nun düzenlendiğini tutar
  const [editedName, setEditedName] = useState(''); // Düzenlenen adı tutar

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5231/api/TodoItems');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Fetching todos failed:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [onTodoAdded]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5231/api/TodoItems/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      if (onTodoAdded) {
          onTodoAdded();
      }
      console.log(`Todo ${id} başarıyla silindi.`);

    } catch (error) {
      console.error("Todo silinirken hata oluştu:", error);
      alert('Görevi silerken bir hata oluştu. Lütfen konsolu kontrol edin.');
    }
  };

  const handleToggleComplete = async (todo) => {
    const newIsComplete = !todo.isComplete;
    const newCompletionDate = newIsComplete ? new Date().toISOString() : null;
    const newLastUpdated = new Date().toISOString();

    const updatedTodo = {
      ...todo,
      isComplete: newIsComplete,
      completionDate: newCompletionDate,
      lastUpdated: newLastUpdated
    };

    try {
      const response = await fetch(`http://localhost:5231/api/TodoItems/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTodo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === todo.id ? updatedTodo : t))
      );
      console.log(`Todo ${todo.id} tamamlanma durumu güncellendi.`);

    } catch (error) {
      console.error("Todo durumu güncellenirken hata oluştu:", error);
      alert('Görevi güncellerken bir hata oluştu. Lütfen konsolu kontrol edin.');
    }
  };

  const handleEditClick = (todo) => {
    setEditId(todo.id);
    setEditedName(todo.name);
  };

  const handleSaveEdit = async (todoId) => {
    if (!editedName.trim()) {
      alert('Görev adı boş bırakılamaz!');
      return;
    }

    const originalTodo = todos.find(t => t.id === todoId);
    if (!originalTodo) return;

    const newLastUpdated = new Date().toISOString();

    const updatedTodo = {
      ...originalTodo,
      name: editedName,
      lastUpdated: newLastUpdated
    };

    try {
      const response = await fetch(`http://localhost:5231/api/TodoItems/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTodo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === todoId ? updatedTodo : t))
      );
      setEditId(null);
      setEditedName('');
      console.log(`Todo ${todoId} adı güncellendi.`);

    } catch (error) {
      console.error("Todo adı güncellenirken hata oluştu:", error);
      alert('Görevin adını güncellerken bir hata oluştu. Lütfen konsolu kontrol edin.');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditedName('');
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error.message}</div>;
  }

  return (
    <>
      {todos.length === 0 ? (
        <p>Henüz yapılacak bir şey yok. Yeni bir görev ekleyin!</p>
      ) : (
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              {/* Güncelleme tarihi, sağ üstte görünür */}
              {todo.lastUpdated && (
                <span className="last-updated-date">
                  Güncelleme Tarihi: {formatDate(todo.lastUpdated)}
                </span>
              )}

              <div className="checkbox-completion-container"> {/* Yeni eklenen kapsayıcı */}
                <input
                  type="checkbox"
                  checked={todo.isComplete}
                  onChange={() => handleToggleComplete(todo)}
                />
                {/* Tamamlanma tarihi, sadece tamamlandığında görünür ve checkbox'ın yanında */}
                {todo.isComplete && todo.completionDate && (
                  <span className="completion-date">
                    Tamamlandı: {formatDate(todo.completionDate, true)}
                  </span>
                )}
              </div>

              {editId === todo.id ? (
                <div className="edit-panel">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSaveEdit(todo.id)} className="save-btn">Kaydet</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">İptal</button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    onDoubleClick={() => handleEditClick(todo)}
                    style={{ textDecoration: todo.isComplete ? 'line-through' : 'none', cursor: 'pointer' }}
                  >
                    {todo.name}
                  </span>
                  {' '}
                  <button onClick={() => handleDelete(todo.id)} className="delete-btn">Sil</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default TodoList;