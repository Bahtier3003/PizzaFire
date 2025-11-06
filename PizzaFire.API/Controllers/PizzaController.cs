using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaFire_API.Data;
using PizzaFire_API.Models;

namespace PizzaFire_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PizzaController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public PizzaController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Pizza>>> GetPizzas()
        {
            try
            {
                var pizzas = await _context.Pizzas.ToListAsync();
                return Ok(pizzas);
            }
            catch (Exception ex)
            {
                // Fallback to demo data
                return GetDemoPizzas();
            }
        }

        [HttpGet("ingredients")]
        public async Task<ActionResult<List<Ingredient>>> GetIngredients()
        {
            try
            {
                var ingredients = await _context.Ingredients.ToListAsync();
                return Ok(ingredients);
            }
            catch (Exception ex)
            {
                return GetDemoIngredients();
            }
        }

        private ActionResult<List<Pizza>> GetDemoPizzas()
        {
            var demoPizzas = new List<Pizza>
            {
                new Pizza { Id = 1, Name = "Маргарита", Description = "Классическая итальянская пицца с сыром и томатным соусом", BasePrice = 450, ImageUrl = "images/margarita.png" },
                new Pizza { Id = 2, Name = "Пепперони", Description = "Острая пицца с пепперони и расплавленным сыром", BasePrice = 550, ImageUrl = "images/pepperoni.png" },
                new Pizza { Id = 3, Name = "Бекон Грибная", Description = "С беконом, шампиньонами и ароматными травами", BasePrice = 600, ImageUrl = "images/beconMushroom.png" },
                new Pizza { Id = 4, Name = "Гавайская", Description = "С курицей, ананасом и сладким соусом", BasePrice = 650, ImageUrl = "images/hawaiian.png" },
                new Pizza { Id = 5, Name = "Вегетарианская", Description = "Без мяса, с свежими овощами и зеленью", BasePrice = 500, ImageUrl = "images/vegetarian.png" },
                new Pizza { Id = 6, Name = "Четыре сыра", Description = "Богатая комбинация четырех видов сыра", BasePrice = 700, ImageUrl = "images/fourcheeses.png" }
            };
            return Ok(demoPizzas);
        }

        private ActionResult<List<Ingredient>> GetDemoIngredients()
        {
            var demoIngredients = new List<Ingredient>
            {
                new Ingredient { Id = 1, Name = "Сыр Моцарелла", Price = 50 },
                new Ingredient { Id = 2, Name = "Томатный соус", Price = 30 },
                new Ingredient { Id = 3, Name = "Пепперони", Price = 70 },
                new Ingredient { Id = 4, Name = "Бекон", Price = 80 },
                new Ingredient { Id = 5, Name = "Шампиньоны", Price = 40 },
                new Ingredient { Id = 6, Name = "Оливки", Price = 60 },
                new Ingredient { Id = 7, Name = "Красный лук", Price = 25 },
                new Ingredient { Id = 8, Name = "Сладкий перец", Price = 35 },
                new Ingredient { Id = 9, Name = "Курица", Price = 90 },
                new Ingredient { Id = 10, Name = "Ананас", Price = 45 },
                new Ingredient { Id = 11, Name = "Пармезан", Price = 65 },
                new Ingredient { Id = 12, Name = "Томаты", Price = 40 },
                new Ingredient { Id = 13, Name = "Салями", Price = 75 },
                new Ingredient { Id = 14, Name = "Ветчина", Price = 70 },
                new Ingredient { Id = 15, Name = "Маслины", Price = 55 }
            };
            return Ok(demoIngredients);
        }
    }
}