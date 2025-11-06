namespace PizzaFire_API.Models
{
    public class Ingredient
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public List<PizzaIngredient> PizzaIngredients { get; set; } = new();
    }
}
