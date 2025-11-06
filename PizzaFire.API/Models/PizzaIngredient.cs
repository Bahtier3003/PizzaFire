namespace PizzaFire_API.Models
{
    public class PizzaIngredient
    {
        public int PizzaId { get; set; }
        public Pizza Pizza { get; set; } = null!;
        public int IngredientId { get; set; }
        public Ingredient Ingredient { get; set; } = null!;
        public bool IsBaseIngredient { get; set; }
    }
}