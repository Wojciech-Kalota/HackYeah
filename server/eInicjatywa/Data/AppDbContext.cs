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
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<IdeaCategory> IdeaCategories => Set<IdeaCategory>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // USER_ROLES CONFIG
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);
        const string ADMIN_USER_ID = "01a102e0-2f5c-70af-97a4-d6080a3ac21c";
        const string NORMAL_USER_ID =  "01a102e0-2f5c-7f30-b99c-88b488f589c0";

        modelBuilder.Entity<Role>()
            .HasData
            (
                new Role {Id = Guid.Parse(ADMIN_USER_ID) , Name = "ADMIN_USER"},
                new Role {Id = Guid.Parse(NORMAL_USER_ID) , Name = "NORMAL_USER"}
            );

        modelBuilder.Entity<IdeaCategory>()
            .HasKey(ic => new { ic.CategoryId, ic.IdeaId });
        modelBuilder.Entity<IdeaCategory>()
            .HasOne(ic => ic.Categorie)
            .WithMany(c => c.IdeaCategories)
            .HasForeignKey(ic => ic.CategoryId);
        modelBuilder.Entity<IdeaCategory>()
            .HasOne(ic => ic.Idea)
            .WithMany(i => i.IdeaCategorys)
            .HasForeignKey(ic=> ic.IdeaId);

        modelBuilder.Entity<Idea>()
            .HasOne(i => i.Author)
            .WithMany(u => u.AuthoredIdeas)
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasOne(u => u.District)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DistrictId).IsRequired(false);
    }
}