using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public class CategoryDto
    {
        public string Name { get; set; }

        public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
    }
}
