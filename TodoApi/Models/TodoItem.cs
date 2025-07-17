using System;
using System.ComponentModel.DataAnnotations; // Eğer kullanmıyorsanız ekleyin

namespace TodoApi.Models
{
    public class TodoItem
    {
        public long Id { get; set; }

        [Required] // İsim boş olamaz
        public string? Name { get; set; }
        public bool IsComplete { get; set; }

        // Yeni eklenen özellikler
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow; // Oluşturulduğunda veya güncellendiğinde ayarlanacak
        public DateTime? CompletionDate { get; set; } // Tamamlandığında ayarlanacak, null olabilir
    }
}