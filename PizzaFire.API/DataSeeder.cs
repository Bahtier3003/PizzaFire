using Microsoft.EntityFrameworkCore;
using PizzaFire_API.Data;
using PizzaFire_API.Models;

namespace PizzaFire_API
{
    public static class DataSeeder
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PizzaDbContext>();

            Console.WriteLine("=== Starting Data Seeder ===");

            try
            {
                await SeedPizzas(context);
                await SeedIngredients(context);

                Console.WriteLine("=== Data Seeder Completed Successfully ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== Data Seeder Failed: {ex.Message} ===");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
        }

        private static async Task SeedPizzas(PizzaDbContext context)
        {
            Console.WriteLine("Checking pizzas...");
            var pizzaCount = await context.Pizzas.CountAsync();
            Console.WriteLine($"Current pizza count: {pizzaCount}");

            if (pizzaCount == 0)
            {
                Console.WriteLine("Seeding pizzas...");

                var pizzas = new List<Pizza>
                {
                    new Pizza
                    {
                        Name = "Маргарита",
                        Description = "Классическая итальянская пицца с сыром и томатным соусом",
                        BasePrice = 450,
                        ImageUrl = "images/margarita.png"
                    },
                    new Pizza
                    {
                        Name = "Пепперони",
                        Description = "Острая пицца с пепперони и расплавленным сыром",
                        BasePrice = 550,
                        ImageUrl = "images/pepperoni.png"
                    },
                    new Pizza
                    {
                        Name = "Бекон Грибная",
                        Description = "С беконом, шампиньонами и ароматными травами",
                        BasePrice = 600,
                        ImageUrl = "images/bacon-mushroom.png"
                    },
                    new Pizza
                    {
                        Name = "Гавайская",
                        Description = "С курицей, ананасом и сладким соусом",
                        BasePrice = 650,
                        ImageUrl = "images/hawaiian.png"
                    },
                    new Pizza
                    {
                        Name = "Вегетарианская",
                        Description = "Без мяса, с свежими овощами и зеленью",
                        BasePrice = 500,
                        ImageUrl = "images/vegetarian.png"
                    },
                    new Pizza
                    {
                        Name = "Четыре сыра",
                        Description = "Богатая комбинация четырех видов сыра",
                        BasePrice = 700,
                        ImageUrl = "images/fourcheeses.png"
                    }
                };

                await context.Pizzas.AddRangeAsync(pizzas);
                var saved = await context.SaveChangesAsync();
                Console.WriteLine($"Pizzas seeded successfully. Saved {saved} records.");
                Console.WriteLine($"New pizza count: {await context.Pizzas.CountAsync()}");
            }
            else
            {
                Console.WriteLine("Pizzas already exist, skipping seeding.");
            }
        }

        private static async Task SeedIngredients(PizzaDbContext context)
        {
            Console.WriteLine("Checking ingredients...");
            var ingredientCount = await context.Ingredients.CountAsync();
            Console.WriteLine($"Current ingredient count: {ingredientCount}");

            if (ingredientCount == 0)
            {
                Console.WriteLine("Seeding ingredients...");

                var ingredients = new List<Ingredient>
                {
                    new Ingredient { Name = "Сыр Моцарелла", Price = 50 },
                    new Ingredient { Name = "Томатный соус", Price = 30 },
                    new Ingredient { Name = "Пепперони", Price = 70 },
                    new Ingredient { Name = "Бекон", Price = 80 },
                    new Ingredient { Name = "Шампиньоны", Price = 40 },
                    new Ingredient { Name = "Оливки", Price = 60 },
                    new Ingredient { Name = "Красный лук", Price = 25 },
                    new Ingredient { Name = "Сладкий перец", Price = 35 },
                    new Ingredient { Name = "Курица", Price = 90 },
                    new Ingredient { Name = "Ананас", Price = 45 },
                    new Ingredient { Name = "Пармезан", Price = 65 },
                    new Ingredient { Name = "Томаты", Price = 40 },
                    new Ingredient { Name = "Салями", Price = 75 },
                    new Ingredient { Name = "Ветчина", Price = 70 },
                    new Ingredient { Name = "Маслины", Price = 55 }
                };

                await context.Ingredients.AddRangeAsync(ingredients);
                var saved = await context.SaveChangesAsync();
                Console.WriteLine($"Ingredients seeded successfully. Saved {saved} records.");
                Console.WriteLine($"New ingredient count: {await context.Ingredients.CountAsync()}");
            }
            else
            {
                Console.WriteLine("Ingredients already exist, skipping seeding.");
            }
        }

       
    }
}