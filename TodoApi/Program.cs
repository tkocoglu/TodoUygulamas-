using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// builder.Services.AddOpenApi(); // Bu satırı kaldırın veya yorum satırı yapın

builder.Services.AddEndpointsApiExplorer(); // API uç noktalarını keşfetmek için gerekli
builder.Services.AddSwaggerGen(); // Swagger/OpenAPI tanımını oluşturmak için gerekli
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS politikasını tanımlama
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", // Bu politikaya bir isim veriyoruz
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") // React uygulamanızın URL'si
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi(); // Bu satırı kaldırın veya yorum satırı yapın
    app.UseSwagger(); // Swagger middleware'ini etkinleştirir
    app.UseSwaggerUI(); // Swagger UI'ı kullanıma açar
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseAuthorization(); // Bu satırı ekleyelim, varsayılan şablonlarda genellikle olur
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi(); // Yeni eklenen: Bu satır, bu endpoint'in Swagger dokümantasyonunda görünmesini sağlar.

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}