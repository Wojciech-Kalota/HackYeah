using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public class DistrictDto
    {
        public string Name { get; set; }

        public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
