using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public class StatusDto
    {
        public string Name { get; set; }

        public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
    }
}
