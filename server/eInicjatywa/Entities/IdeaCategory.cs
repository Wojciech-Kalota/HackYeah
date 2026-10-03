namespace eInicjatywa.Entities
{
    public class IdeaCategory
    {
        public Guid IdeaId { get; set; }
        public Guid CategoryId { get; set; }
        public Idea Idea { get; set; } = null!;
        public Category Categorie { get; set; } = null!;
    }
}
