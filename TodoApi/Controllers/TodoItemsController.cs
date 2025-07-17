using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models; 


namespace TodoApi.Controllers
{
    [Route("api/[controller]")] // API yolu: /api/TodoItems
    [ApiController] // Bu sınıfın bir API controller olduğunu belirtir
    public class TodoItemsController : ControllerBase
    {
        private readonly TodoContext _context;

        public TodoItemsController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/TodoItems
        [HttpGet] // Tüm Todo öğelerini getirir
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            return await _context.TodoItems.ToListAsync();
        }

        // GET: api/TodoItems/5
        [HttpGet("{id}")] // Belirli bir Id'ye sahip Todo öğesini getirir
        public async Task<ActionResult<TodoItem>> GetTodoItem(long id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound(); // Eğer öğe bulunamazsa 404 döndür
            }

            return todoItem;
        }

        // PUT: api/TodoItems/5
        // Bir Todo öğesini günceller
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(long id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            // Mevcut TodoItem'ı veritabanından al
            var existingTodoItem = await _context.TodoItems.FindAsync(id);
            if (existingTodoItem == null)
            {
                return NotFound();
            }

            // Sadece adı veya IsComplete durumu değiştiğinde LastUpdated'ı güncelle
            if (existingTodoItem.Name != todoItem.Name || existingTodoItem.IsComplete != todoItem.IsComplete)
            {
                existingTodoItem.LastUpdated = DateTime.UtcNow;
            }

            // IsComplete durumu değiştiğinde CompletionDate'i güncelle
            if (todoItem.IsComplete && !existingTodoItem.IsComplete) // Yeni tamamlandıysa
            {
                existingTodoItem.CompletionDate = DateTime.UtcNow;
            }
            else if (!todoItem.IsComplete && existingTodoItem.IsComplete) // Tamamlanması kaldırıldıysa
            {
                existingTodoItem.CompletionDate = null;
            }

            // Adı ve IsComplete durumunu güncelle (LastUpdated ve CompletionDate yukarıda ayarlandı)
            existingTodoItem.Name = todoItem.Name;
            existingTodoItem.IsComplete = todoItem.IsComplete;

            _context.Entry(existingTodoItem).State = EntityState.Modified; // existingTodoItem'ı modify olarak işaretle

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TodoItems
        // Yeni bir Todo öğesi ekler
        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {

            // Yeni bir görev oluşturulurken LastUpdated alanını otomatik olarak ayarla
            todoItem.LastUpdated = DateTime.UtcNow;
            // Yeni bir görev oluşturulurken IsComplete false, CompletionDate null olmalı
            todoItem.IsComplete = false;
            todoItem.CompletionDate = null;

            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            // Oluşturulan öğenin detaylarıyla birlikte 201 Created durum kodu döndürür
            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        // DELETE: api/TodoItems/5
        [HttpDelete("{id}")] // Belirli bir Id'ye sahip Todo öğesini siler
        public async Task<IActionResult> DeleteTodoItem(long id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound(); // Eğer öğe bulunamazsa 404 döndür
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent(); // Başarılı silme sonrası içerik yok döndür
        }

        private bool TodoItemExists(long id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}