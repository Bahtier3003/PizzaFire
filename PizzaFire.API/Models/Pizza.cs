namespace PizzaFire_API.Models
{
    public class Pizza
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public List<PizzaIngredient> PizzaIngredients { get; set; } = new();
    }
}