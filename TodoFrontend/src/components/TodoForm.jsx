import React, { useState } from 'react';

const TodoForm = ({ onTodoAdded }) => {
  const [newTodoName, setNewTodoName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodoName.trim()) {
      alert('Görev adı boş bırakılamaz!');
      return;
    }

    const newTodo = {
      name: newTodoName,
      isComplete: false,
      lastUpdated: new Date().toISOString(), // Yeni eklenen: ISO formatında güncel tarih
      completionDate: null // Yeni eklenen: Başlangıçta null olacak
    };

    try {
      const response = await fetch('http://localhost:5231/api/TodoItems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewTodoName('');
      if (onTodoAdded) {
        onTodoAdded(); // TodoList'i yenilemek için App.jsx'e bildir
      }
      console.log('Yeni görev başarıyla eklendi.');
    } catch (error) {
      console.error("Yeni görev eklenirken hata oluştu:", error);
      alert('Yeni görev eklenirken bir hata oluştu. Lütfen konsolu kontrol edin.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Yeni görev ekle..."
        value={newTodoName}
        onChange={(e) => setNewTodoName(e.target.value)}
      />
      <button type="submit">Ekle</button>
    </form>
  );
};

export default TodoForm;