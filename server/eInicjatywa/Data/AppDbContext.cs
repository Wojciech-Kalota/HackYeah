using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Data;
using eInicjatywa.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Duplicate> Duplicates => Set<Duplicate>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<Upvote> Upvotes => Set<Upvote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}