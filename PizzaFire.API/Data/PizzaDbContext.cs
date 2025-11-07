using Microsoft.EntityFrameworkCore;
using PizzaFire_API.Models;

namespace PizzaFire_API.Data
{
    public class PizzaDbContext : DbContext
    {
        public PizzaDbContext(DbContextOptions<PizzaDbContext> options) : base(options) { }

        public DbSet<Pizza> Pizzas { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<PizzaIngredient> PizzaIngredients { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<OrderDetails> OrderDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка связи многие-ко-многим для пицц и ингредиентов
            modelBuilder.Entity<PizzaIngredient>()
                .HasKey(pi => new { pi.PizzaId, pi.IngredientId });

            modelBuilder.Entity<PizzaIngredient>()
                .HasOne(pi => pi.Pizza)
                .WithMany(p => p.PizzaIngredients)
                .HasForeignKey(pi => pi.PizzaId);

            modelBuilder.Entity<PizzaIngredient>()
                .HasOne(pi => pi.Ingredient)
                .WithMany(i => i.PizzaIngredients)
                .HasForeignKey(pi => pi.IngredientId);

            // Настройка связей для заказов
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Pizza)
                .WithMany()
                .HasForeignKey(oi => oi.PizzaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderDetails>()
                .HasOne(od => od.Order)
                .WithOne(o => o.OrderDetails)
                .HasForeignKey<OrderDetails>(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Настройка точности для decimal полей
            modelBuilder.Entity<Ingredient>()
                .Property(i => i.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.ItemPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Pizza>()
                .Property(p => p.BasePrice)
                .HasPrecision(18, 2);

            // Настройка индексов для производительности
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email);

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.UserId);

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.Status);

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderDate);
        }
    }
}