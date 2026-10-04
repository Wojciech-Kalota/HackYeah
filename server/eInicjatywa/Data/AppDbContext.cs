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
            .HasForeignKey(i => i.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasOne(u => u.District)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DistrictId).IsRequired(false);
        modelBuilder.Entity<District>()
            .HasData
            (
                new() { Id = Guid.Parse("01a1040b-379b-741b-99af-60e9de18e28b"), Name = "Bochnia" },
                new() { Id = Guid.Parse("01a1040b-379b-78c2-8241-0308ab9d0b1b"), Name = "Bochnia" },
                new() { Id = Guid.Parse("01a1040b-379b-7e0c-b55e-c1763e214f77"), Name = "Drwinia" },
                new() { Id = Guid.Parse("01a1040b-379b-7bf7-ab62-f5cecd92cd1d"), Name = "Lipnica Murowana" },
                new() { Id = Guid.Parse("01a1040b-379b-7aff-82c7-55d1ce1939da"), Name = "Łapanów" },
                new() { Id = Guid.Parse("01a1040b-379b-7fa2-a4cb-ea294f4a5ecc"), Name = "Nowy Wiśnicz" },
                new() { Id = Guid.Parse("01a1040b-379b-7707-9ff3-d6480f2f2e6d"), Name = "Rzezawa" },
                new() { Id = Guid.Parse("01a1040b-379b-7594-91e5-0537198c76a1"), Name = "Trzciana" },
                new() { Id = Guid.Parse("01a1040b-379b-7ede-bd33-7d83da453a92"), Name = "Żegocina" },

                new() { Id = Guid.Parse("01a1040b-379b-7c5e-9bc3-fc24fb1db8c7"), Name = "Borzęcin" },
                new() { Id = Guid.Parse("01a1040b-379b-763a-8f33-64bae1aceea5"), Name = "Brzesko" },
                new() { Id = Guid.Parse("01a1040b-379b-78e5-97e5-dcbc78301c48"), Name = "Czchów" },
                new() { Id = Guid.Parse("01a1040b-379b-72f4-9765-15fbecd52cae"), Name = "Dębno" },
                new() { Id = Guid.Parse("01a1040b-379b-7a33-99c4-1d0bd576f327"), Name = "Gnojnik" },
                new() { Id = Guid.Parse("01a1040b-379b-7fa3-b9f8-f7978a0757bc"), Name = "Iwkowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7a61-bef3-079748ea0766"), Name = "Szczurowa" },

                new() { Id = Guid.Parse("01a1040b-379b-70b3-90ed-99fd625d6240"), Name = "Alwernia" },
                new() { Id = Guid.Parse("01a1040b-379b-7885-8bd8-3987f64cb843"), Name = "Babice" },
                new() { Id = Guid.Parse("01a1040b-379b-7b44-9eea-591d2f82ee8b"), Name = "Chrzanów" },
                new() { Id = Guid.Parse("01a1040b-379b-7d48-b5c2-b4e970abb370"), Name = "Libiąż" },
                new() { Id = Guid.Parse("01a1040b-379b-7f71-b005-09bf63c3c7fa"), Name = "Trzebinia" },

                new() { Id = Guid.Parse("01a1040b-379b-739d-ad8c-0a39824763e1"), Name = "Bolesław" },
                new() { Id = Guid.Parse("01a1040b-379b-76cb-b75a-62504a22fe34"), Name = "Dąbrowa Tarnowska" },
                new() { Id = Guid.Parse("01a1040b-379b-756b-9804-200a01bba942"), Name = "Gręboszów" },
                new() { Id = Guid.Parse("01a1040b-379b-7a15-94c5-c6a232fc7fdc"), Name = "Mędrzechów" },
                new() { Id = Guid.Parse("01a1040b-379b-756d-83b9-36f0633834f5"), Name = "Olesno" },
                new() { Id = Guid.Parse("01a1040b-379b-792d-8263-0f0e084365b8"), Name = "Radgoszcz" },
                new() { Id = Guid.Parse("01a1040b-379b-728a-a9ed-1338188c2cb0"), Name = "Szczucin" },

                new() { Id = Guid.Parse("01a1040b-379b-705c-9e85-216deef439bc"), Name = "Biecz" },
                new() { Id = Guid.Parse("01a1040b-379b-7294-8895-5ff6cb270304"), Name = "Bobowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7e64-88cf-1fcffeed26f6"), Name = "Gorlice" },
                new() { Id = Guid.Parse("01a1040b-379b-7600-a705-09796a6be78f"), Name = "Gorlice" },
                new() { Id = Guid.Parse("01a1040b-379b-7c82-a058-dadb3b000bf4"), Name = "Lipinki" },
                new() { Id = Guid.Parse("01a1040b-379b-76b4-afef-485a0be2fc1f"), Name = "Łużna" },
                new() { Id = Guid.Parse("01a1040b-379b-7f02-b085-e0f673a33d25"), Name = "Moszczenica" },
                new() { Id = Guid.Parse("01a1040b-379b-7163-8045-06eb5398bc18"), Name = "Ropa" },
                new() { Id = Guid.Parse("01a1040b-379b-708f-8f8f-b87e8ec454e7"), Name = "Sękowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7935-9079-8f3ba8006686"), Name = "Uście Gorlickie" },

                new() { Id = Guid.Parse("01a1040b-379b-7209-940d-c7318fc8ed50"), Name = "Czernichów" },
                new() { Id = Guid.Parse("01a1040b-379b-7e4a-86d9-90b31be5ba70"), Name = "Igołomia-Wawrzeńczyce" },
                new() { Id = Guid.Parse("01a1040b-379b-7d21-966d-a3189f59c74b"), Name = "Iwanowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7bea-b040-de240a5e07e8"), Name = "Jerzmanowice-Przeginia" },
                new() { Id = Guid.Parse("01a1040b-379b-7ad2-b2cb-c0329babb46d"), Name = "Kocmyrzów-Luborzyca" },
                new() { Id = Guid.Parse("01a1040b-379b-78a4-94ae-0be9a0f322f6"), Name = "Krzeszowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7d03-82b8-35b964e1b66b"), Name = "Liszki" },
                new() { Id = Guid.Parse("01a1040b-379b-740c-8e28-1687b1620bf0"), Name = "Michałowice" },
                new() { Id = Guid.Parse("01a1040b-379b-73e9-a9c0-2964d5a57434"), Name = "Mogilany" },
                new() { Id = Guid.Parse("01a1040b-379b-793e-89ad-2aa9201acae9"), Name = "Skała" },
                new() { Id = Guid.Parse("01a1040b-379b-7ac8-b833-d3da8b5dce89"), Name = "Skawina" },
                new() { Id = Guid.Parse("01a1040b-379b-747f-a82d-63f3fca61533"), Name = "Słomniki" },
                new() { Id = Guid.Parse("01a1040b-379b-7f4a-80fd-6080bbecbba1"), Name = "Sułoszowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7ad0-9fcd-f37ef0c17e2b"), Name = "Świątniki Górne" },
                new() { Id = Guid.Parse("01a1040b-379b-7cb3-b602-301e56526a1c"), Name = "Wielka Wieś" },
                new() { Id = Guid.Parse("01a1040b-379b-7b2a-b8ed-579951d53b2c"), Name = "Zabierzów" },
                new() { Id = Guid.Parse("01a1040b-379b-75e2-80ae-c23dd47bbac6"), Name = "Zielonki" },

                new() { Id = Guid.Parse("01a1040b-379b-7286-89a9-727b4dbc1a6b"), Name = "Dobra" },
                new() { Id = Guid.Parse("01a1040b-379b-7406-85c2-cd8f503b5364"), Name = "Jodłownik" },
                new() { Id = Guid.Parse("01a1040b-379b-75c8-8683-7c30721db01a"), Name = "Kamienica" },
                new() { Id = Guid.Parse("01a1040b-379b-7638-bf14-8af6eb45075c"), Name = "Laskowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7b7b-910d-6674dce478a2"), Name = "Limanowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7eb5-963b-b169f36bdca4"), Name = "Limanowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7f59-95be-7fe055f20925"), Name = "Łukowica" },
                new() { Id = Guid.Parse("01a1040b-379b-7bde-adb2-cd63eabe1f02"), Name = "Mszana Dolna" },
                new() { Id = Guid.Parse("01a1040b-379b-792a-ac35-8d7dd9105efc"), Name = "Mszana Dolna" },
                new() { Id = Guid.Parse("01a1040b-379b-7280-8e00-effb0f70a18f"), Name = "Niedźwiedź" },
                new() { Id = Guid.Parse("01a1040b-379b-7b69-8bd8-8e6acb657149"), Name = "Słopnice" },
                new() { Id = Guid.Parse("01a1040b-379b-719a-972a-eac280b5528f"), Name = "Szczawa" },
                new() { Id = Guid.Parse("01a1040b-379b-7621-a932-49a17d8d8105"), Name = "Tymbark" },

                new() { Id = Guid.Parse("01a1040b-379b-766d-8e63-ebe96d9f2d8e"), Name = "Charsznica" },
                new() { Id = Guid.Parse("01a1040b-379b-762c-ac6b-31a3b1fd350e"), Name = "Gołcza" },
                new() { Id = Guid.Parse("01a1040b-379b-7bce-a576-3eca585c0869"), Name = "Kozłów" },
                new() { Id = Guid.Parse("01a1040b-379b-7269-8a5a-7fba1724b502"), Name = "Książ Wielki" },
                new() { Id = Guid.Parse("01a1040b-379b-7026-93c1-0bffed5b10b4"), Name = "Miechów" },
                new() { Id = Guid.Parse("01a1040b-379b-7670-9e5f-bb1a2f54047f"), Name = "Racławice" },
                new() { Id = Guid.Parse("01a1040b-379b-7dfe-9587-39f4d54ac82b"), Name = "Słaboszów" },

                new() { Id = Guid.Parse("01a1040b-379b-7620-81f3-74b35c612cc8"), Name = "Dobczyce" },
                new() { Id = Guid.Parse("01a1040b-379b-790a-b6ac-8ab2ddabbacb"), Name = "Lubień" },
                new() { Id = Guid.Parse("01a1040b-379b-7283-a047-c88cd5149e8c"), Name = "Myślenice" },
                new() { Id = Guid.Parse("01a1040b-379b-78c4-9a62-39634cbc4c9f"), Name = "Pcim" },
                new() { Id = Guid.Parse("01a1040b-379b-7717-b5fa-b00761ad2e2a"), Name = "Raciechowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7791-9f2a-dbe5f38a8a07"), Name = "Siepraw" },
                new() { Id = Guid.Parse("01a1040b-379b-725e-af59-befd9fd63083"), Name = "Sułkowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7b77-a6b9-14c7763dfb8a"), Name = "Tokarnia" },
                new() { Id = Guid.Parse("01a1040b-379b-712d-8eb5-200801b643bc"), Name = "Wiśniowa" },

                new() { Id = Guid.Parse("01a1040b-379b-7cb1-9905-29f018baeb8d"), Name = "Chełmiec" },
                new() { Id = Guid.Parse("01a1040b-379b-70fe-8aba-02fb7928b7b2"), Name = "Gródek nad Dunajcem" },
                new() { Id = Guid.Parse("01a1040b-379b-78ab-a055-fde9926d141e"), Name = "Grybów" },
                new() { Id = Guid.Parse("01a1040b-379b-7622-9d6a-6fd6356c9c29"), Name = "Grybów" },
                new() { Id = Guid.Parse("01a1040b-379b-7275-b0c9-dc928f39fd61"), Name = "Kamionka Wielka" },
                new() { Id = Guid.Parse("01a1040b-379b-768b-806b-55f12f2413ce"), Name = "Korzenna" },
                new() { Id = Guid.Parse("01a1040b-379b-7fb4-9aff-52d9a88b4f26"), Name = "Krynica-Zdrój" },
                new() { Id = Guid.Parse("01a1040b-379b-793a-a860-f792854fa4a7"), Name = "Łabowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7969-8321-1ac9dc1130a9"), Name = "Łącko" },
                new() { Id = Guid.Parse("01a1040b-379b-7beb-95aa-6338076d9319"), Name = "Łososina Dolna" },
                new() { Id = Guid.Parse("01a1040b-379b-7392-a636-424b25258737"), Name = "Muszyna" },
                new() { Id = Guid.Parse("01a1040b-379b-7dd7-83e1-381a498a1792"), Name = "Nawojowa" },
                new() { Id = Guid.Parse("01a1040b-379b-7dbb-bc5c-7f9da9f2a60f"), Name = "Piwniczna-Zdrój" },
                new() { Id = Guid.Parse("01a1040b-379b-7d7e-b1fe-b899974ef07d"), Name = "Podegrodzie" },
                new() { Id = Guid.Parse("01a1040b-379b-7caa-ad43-48130916a6c3"), Name = "Rytro" },
                new() { Id = Guid.Parse("01a1040b-379b-7da5-9fae-eb558e7bdf60"), Name = "Stary Sącz" },

                new() { Id = Guid.Parse("01a1040b-379b-71a2-b1b8-2c3b480e553d"), Name = "Czarny Dunajec" },
                new() { Id = Guid.Parse("01a1040b-379b-76bf-a10d-ca6b341a1326"), Name = "Czorsztyn" },
                new() { Id = Guid.Parse("01a1040b-379b-7b7b-a018-5bd9ab6b0041"), Name = "Jabłonka" },
                new() { Id = Guid.Parse("01a1040b-379b-7d84-be17-1f817a2df56a"), Name = "Krościenko nad Dunajcem" },
                new() { Id = Guid.Parse("01a1040b-379b-7c44-9c87-4d7c655cfd25"), Name = "Lipnica Wielka" },
                new() { Id = Guid.Parse("01a1040b-379b-7dba-a641-9c223ac4f480"), Name = "Łapsze Niżne" },
                new() { Id = Guid.Parse("01a1040b-379b-726b-838c-099c74e1ec75"), Name = "Nowy Targ" },
                new() { Id = Guid.Parse("01a1040b-379b-7fed-866b-f1ed812e295f"), Name = "Nowy Targ" },
                new() { Id = Guid.Parse("01a1040b-379b-715f-84ee-b5d62a633f6f"), Name = "Ochotnica Dolna" },
                new() { Id = Guid.Parse("01a1040b-379b-7fec-b770-ffe57b347948"), Name = "Raba Wyżna" },
                new() { Id = Guid.Parse("01a1040b-379b-75ff-bda3-64ae8e96f294"), Name = "Rabka-Zdrój" },
                new() { Id = Guid.Parse("01a1040b-379b-7366-9ccc-894fa946b3ba"), Name = "Spytkowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7fe9-8504-52fe6ba17e43"), Name = "Szaflary" },
                new() { Id = Guid.Parse("01a1040b-379b-741e-ba0f-2ecd25c5253a"), Name = "Szczawnica" },

                new() { Id = Guid.Parse("01a1040b-379b-79f5-8ff0-776340e3e272"), Name = "Nowy Sącz" },

                new() { Id = Guid.Parse("01a1040b-379b-70c8-9e6f-eb2a0161977f"), Name = "Bolesław" },
                new() { Id = Guid.Parse("01a1040b-379b-7707-8848-62b567531164"), Name = "Bukowno" },
                new() { Id = Guid.Parse("01a1040b-379b-77f5-9db6-7d4a1eed17c3"), Name = "Klucze" },
                new() { Id = Guid.Parse("01a1040b-379b-7641-a16e-ba45a1ee458d"), Name = "Olkusz" },
                new() { Id = Guid.Parse("01a1040b-379b-7b73-b05e-dbbdf08c2ead"), Name = "Trzyciąż" },
                new() { Id = Guid.Parse("01a1040b-379b-7828-a036-abc447778330"), Name = "Wolbrom" },

                new() { Id = Guid.Parse("01a1040b-379b-7a43-b003-7e43c554a565"), Name = "Brzeszcze" },
                new() { Id = Guid.Parse("01a1040b-379b-773f-8e0b-eb4b251fac31"), Name = "Chełmek" },
                new() { Id = Guid.Parse("01a1040b-379b-76c3-a134-ce41706d1992"), Name = "Kęty" },
                new() { Id = Guid.Parse("01a1040b-379b-7461-aaa4-e7a894f63364"), Name = "Osiek" },
                new() { Id = Guid.Parse("01a1040b-379b-70f8-98b2-89a0f530885f"), Name = "Oświęcim" },
                new() { Id = Guid.Parse("01a1040b-379b-7072-9da9-60505456c59f"), Name = "Oświęcim" },
                new() { Id = Guid.Parse("01a1040b-379b-70b2-97ce-a425234684d1"), Name = "Polanka Wielka" },
                new() { Id = Guid.Parse("01a1040b-379b-7fff-b100-c14bf65e37bb"), Name = "Przeciszów" },
                new() { Id = Guid.Parse("01a1040b-379b-7cb3-bbfe-44970de54ffd"), Name = "Zator" },

                new() { Id = Guid.Parse("01a1040b-379b-7f85-8a3b-9ff060867407"), Name = "Koniusza" },
                new() { Id = Guid.Parse("01a1040b-379b-7d73-9ed0-ddb0ac4557f8"), Name = "Koszyce" },
                new() { Id = Guid.Parse("01a1040b-379b-742d-b379-6c8a9924f3ed"), Name = "Nowe Brzesko" },
                new() { Id = Guid.Parse("01a1040b-379b-7e00-8ea6-c6bf12137b7a"), Name = "Pałecznica" },
                new() { Id = Guid.Parse("01a1040b-379b-76f6-a64e-03ce202d44ea"), Name = "Proszowice" },
                new() { Id = Guid.Parse("01a1040b-379b-79b4-9b0c-1d026b31b2ad"), Name = "Radziemice" },

                new() { Id = Guid.Parse("01a1040b-379b-74d3-9894-d464c3fdcf19"), Name = "Budzów" },
                new() { Id = Guid.Parse("01a1040b-379b-79a4-baec-dbade89cfeed"), Name = "Bystra-Sidzina" },
                new() { Id = Guid.Parse("01a1040b-379b-7a27-8f55-15e58beab03c"), Name = "Jordanów" },
                new() { Id = Guid.Parse("01a1040b-379b-7c9f-bbf6-5861723ab5c0"), Name = "Jordanów" },
                new() { Id = Guid.Parse("01a1040b-379b-706c-bdfa-a80e2a31692d"), Name = "Maków Podhalański" },
                new() { Id = Guid.Parse("01a1040b-379b-7475-b434-b9e0299934fa"), Name = "Stryszawa" },
                new() { Id = Guid.Parse("01a1040b-379b-7c55-93bc-6cbaf1c347d2"), Name = "Sucha Beskidzka" },
                new() { Id = Guid.Parse("01a1040b-379b-793e-949c-f24fcf7ff8da"), Name = "Zawoja" },
                new() { Id = Guid.Parse("01a1040b-379b-789b-8bf6-4706c283ac8e"), Name = "Zembrzyce" },

                new() { Id = Guid.Parse("01a1040b-379b-7e14-91e1-d18ab976bb44"), Name = "Ciężkowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7568-b7bc-5f78fa3e10ea"), Name = "Gromnik" },
                new() { Id = Guid.Parse("01a1040b-379b-721c-9655-1b94b6ff31ab"), Name = "Lisia Góra" },
                new() { Id = Guid.Parse("01a1040b-379b-73f8-aa70-89e3d71e62ca"), Name = "Pleśna" },
                new() { Id = Guid.Parse("01a1040b-379b-7ba5-9b0a-f04581cd71af"), Name = "Radłów" },
                new() { Id = Guid.Parse("01a1040b-379b-7337-8304-af95afe75f5d"), Name = "Ryglice" },
                new() { Id = Guid.Parse("01a1040b-379b-763a-874c-a5fe79260f14"), Name = "Rzepiennik Strzyżewski" },
                new() { Id = Guid.Parse("01a1040b-379b-7685-a126-15d534221453"), Name = "Skrzyszów" },
                new() { Id = Guid.Parse("01a1040b-379b-7635-939c-b802a8bf4cd1"), Name = "Szerzyny" },
                new() { Id = Guid.Parse("01a1040b-379b-70c4-9fa1-865bcb406aad"), Name = "Tarnów" },
                new() { Id = Guid.Parse("01a1040b-379b-7a51-bb0f-fb0bc2c3d2f9"), Name = "Tuchów" },
                new() { Id = Guid.Parse("01a1040b-379b-7f6c-b817-72cb8fd1dce9"), Name = "Wierzchosławice" },
                new() { Id = Guid.Parse("01a1040b-379b-7b98-8106-bec34b6a7227"), Name = "Wietrzychowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7b09-96a5-f954ebdc7fba"), Name = "Wojnicz" },
                new() { Id = Guid.Parse("01a1040b-379b-704b-b99a-b4a168e6289e"), Name = "Zakliczyn" },
                new() { Id = Guid.Parse("01a1040b-379b-7377-8d1a-73d7edacaa4b"), Name = "Żabno" },
                new() { Id = Guid.Parse("01a1040b-379b-7a28-b5cc-f9841f1f0dd7"), Name = "Tarnów" },

                new() { Id = Guid.Parse("01a1040b-379b-78c3-a9ab-6897be976224"), Name = "Biały Dunajec" },
                new() { Id = Guid.Parse("01a1040b-379b-776f-8906-58cb32c301b7"), Name = "Bukowina Tatrzańska" },
                new() { Id = Guid.Parse("01a1040b-379b-705b-8a40-aa7dd9a92b8a"), Name = "Kościelisko" },
                new() { Id = Guid.Parse("01a1040b-379b-7e0c-9be6-c69a37c4d430"), Name = "Poronin" },
                new() { Id = Guid.Parse("01a1040b-379b-7b0d-8c7f-8da100d37537"), Name = "Zakopane" },

                new() { Id = Guid.Parse("01a1040b-379b-7b58-b552-c15e1cb7b8ce"), Name = "Andrychów" },
                new() { Id = Guid.Parse("01a1040b-379b-716c-8b7c-e27c57bb7fcc"), Name = "Brzeźnica" },
                new() { Id = Guid.Parse("01a1040b-379b-79ed-8c63-47100d6a7577"), Name = "Kalwaria Zebrzydowska" },
                new() { Id = Guid.Parse("01a1040b-379b-71ec-9eb1-60dcbd18d59a"), Name = "Lanckorona" },
                new() { Id = Guid.Parse("01a1040b-379b-759f-a441-d37112119eab"), Name = "Mucharz" },
                new() { Id = Guid.Parse("01a1040b-379b-76db-a767-83d184b8be7e"), Name = "Spytkowice" },
                new() { Id = Guid.Parse("01a1040b-379b-72f6-b9c3-8e6289b0ea9b"), Name = "Stryszów" },
                new() { Id = Guid.Parse("01a1040b-379b-747e-b487-aa3c8ae7df05"), Name = "Tomice" },
                new() { Id = Guid.Parse("01a1040b-379b-7d73-bde9-68445188e24e"), Name = "Wadowice" },
                new() { Id = Guid.Parse("01a1040b-379b-72bf-8740-8a92b43a3613"), Name = "Wieprz" },

                new() { Id = Guid.Parse("01a1040b-379b-739e-87f9-66d046b32007"), Name = "Biskupice" },
                new() { Id = Guid.Parse("01a1040b-379b-73e1-892a-9362e9d53f00"), Name = "Gdów" },
                new() { Id = Guid.Parse("01a1040b-379b-7125-b9ef-fb55e9df0f81"), Name = "Kłaj" },
                new() { Id = Guid.Parse("01a1040b-379b-7c0c-aa6f-f10b93bd6511"), Name = "Niepołomice" },
                new() { Id = Guid.Parse("01a1040b-379b-75a2-97cb-59708187dea1"), Name = "Wieliczka" },

                new() { Id = Guid.Parse("01a1040b-379b-7980-8ace-16e29988996f"), Name = "I Stare Miasto" },
                new() { Id = Guid.Parse("01a1040b-379b-70ab-b9f7-b1bb9933256d"), Name = "II Grzegórzki" },
                new() { Id = Guid.Parse("01a1040b-379b-74af-8856-08cd15e73cd6"), Name = "III Prądnik Czerwony" },
                new() { Id = Guid.Parse("01a1040b-379b-765f-ac8f-1599f3bee59b"), Name = "IV Prądnik Biały" },
                new() { Id = Guid.Parse("01a1040b-379b-71b9-bb1a-7b416a1a63db"), Name = "V Krowodrza" },
                new() { Id = Guid.Parse("01a1040b-379b-77d9-a1c1-fe6c24e2cab6"), Name = "VI Bronowice" },
                new() { Id = Guid.Parse("01a1040b-379b-74e3-97b7-2b27c1943453"), Name = "VII Zwierzyniec" },
                new() { Id = Guid.Parse("01a1040b-379b-703a-86eb-a5a468730430"), Name = "VIII Dębniki" },
                new() { Id = Guid.Parse("01a1040b-379b-7b8d-a8df-cafd11e28520"), Name = "IX Łagiewniki-Borek Fałęcki" },
                new() { Id = Guid.Parse("01a1040b-379b-7238-9eae-6d09f0d0aa6e"), Name = "X Swoszowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7cba-84a2-31f901beb208"), Name = "XI Podgórze Duchackie" },
                new() { Id = Guid.Parse("01a1040b-379b-71b8-b8af-7f5b63888fd2"), Name = "XII Bieżanów-Prokocim" },
                new() { Id = Guid.Parse("01a1040b-379b-767d-976d-9a397fe1cb69"), Name = "XIII Podgórze" },
                new() { Id = Guid.Parse("01a1040b-379b-7183-b626-527c930e1a66"), Name = "XIV Czyżyny" },
                new() { Id = Guid.Parse("01a1040b-379b-7ebb-8353-216d598c117a"), Name = "XV Mistrzejowice" },
                new() { Id = Guid.Parse("01a1040b-379b-7069-a720-a4be93b9cb90"), Name = "XVI Bieńczyce" },
                new() { Id = Guid.Parse("01a1040b-379b-75cc-bf98-0085b05b1313"), Name = "XVII Wzgórza Krzesławickie" },
                new() { Id = Guid.Parse("01a1040b-379b-7d4a-ad15-e2cfcf63f85f"), Name = "XVIII Nowa Huta" }
            );

        modelBuilder.Entity<Category>()
            .HasData
            (
                new () { Id = Guid.Parse("01a104fb-7d11-77b5-adf7-233e51a05e92"), Name = "Bezpieczeństwo" },
                new () { Id = Guid.Parse("01a104fb-7d11-7b01-9319-e1b72378436c"), Name = "Czystość i odpady" },
                new () { Id = Guid.Parse("01a104fb-7d11-7a33-89bf-244e7be3dfaf"), Name = "Edukacja" },
                new () { Id = Guid.Parse("01a104fb-7d11-70ef-9aa5-f94e0000915d"), Name = "Infrastruktura drogowa" },
                new () { Id = Guid.Parse("01a104fb-7d11-710d-b9f6-a3c4fa059fde"), Name = "Infrastruktura rowerowa" },
                new () { Id = Guid.Parse("01a104fb-7d11-7538-81ee-7133f477b457"), Name = "Kultura" },
                new () { Id = Guid.Parse("01a104fb-7d11-7bce-8827-fa296ee77e8a"), Name = "Sport i rekreacja" },
                new () { Id = Guid.Parse("01a104fb-7d11-70c3-81b9-5a914e5a9d3c"), Name = "Tereny zielone" },
                new () { Id = Guid.Parse("01a104fb-7d11-706b-8c6f-ae2aebdd9b31"), Name = "Transport publiczny" },
                new () { Id = Guid.Parse("01a104fb-7d11-74ec-a17d-f3ac1ee247c0"), Name = "Zdrowie i dostępność" }
            );

        modelBuilder.Entity<Status>()
            .HasData
            (
                new () { Id = Guid.Parse("01a104fb-7d11-798f-8bcf-a2608258b2d3"), Name = "submitted" },
                new () { Id = Guid.Parse("01a104fb-7d11-7f3e-9633-c8ca561f9467"), Name = "under_review" },
                new () { Id = Guid.Parse("01a104fb-7d11-74a2-9477-9b26b0968fa9"), Name = "accepted" },
                new () { Id = Guid.Parse("01a104fb-7d11-7988-affe-7ecb76adf1bc"), Name = "in_progress" },
                new () { Id = Guid.Parse("01a104fb-7d11-7215-96fb-f16cb32d6308"), Name = "completed" },
                new () { Id = Guid.Parse("01a104fb-7d11-7c78-a8e5-913da2fa5d26"), Name = "rejected" }
            );
    }
}
