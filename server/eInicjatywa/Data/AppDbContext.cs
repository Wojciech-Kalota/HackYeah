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

        const string ADMIN_USER_ID = "01a102e0-2f5c-70af-97a4-d6080a3ac21c";
        const string NORMAL_USER_ID =  "01a102e0-2f5c-7f30-b99c-88b488f589c0";

        modelBuilder.Entity<Role>()
            .HasData
            (
                new Role {Id = Guid.Parse(ADMIN_USER_ID) , Name = "ADMIN_USER"},
                new Role {Id = Guid.Parse(NORMAL_USER_ID) , Name = "NORMAL_USER"}
            );
    }
}