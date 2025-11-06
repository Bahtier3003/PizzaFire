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
            modelBuilder.Entity<PizzaIngredient>()
                .HasKey(pi => new { pi.PizzaId, pi.IngredientId });

            // Добавляем точность для decimal полей
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
        }
    }
}
