using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Data;
using eInicjatywa.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<District> Districts => Set<District>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}