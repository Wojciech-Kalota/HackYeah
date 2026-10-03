using System.Collections;

namespace eInicjatywa.Entities
{
    public class Status
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; } = string.Empty;

        public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
    }
}
