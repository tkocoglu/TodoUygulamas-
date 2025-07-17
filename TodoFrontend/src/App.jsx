import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import { useState } from 'react';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleListRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="App">
      {/* Dikdörtgenle işaretlediğiniz, sabit kalmasını istediğiniz üst kısım */}
      <div className="app-fixed-header-form">
        <h1>Todo Uygulaması</h1>
        
        <TodoForm onTodoAdded={handleListRefresh} />

        <h2 className="todo-list-heading">Yapılacaklar Listesi</h2>
      </div>

      {/* Kaydırılabilir liste alanı */}
      <div className="app-scrollable-list">
        <TodoList key={refreshKey} onTodoAdded={handleListRefresh} />
      </div>
    </div>
  );
}

export default App;