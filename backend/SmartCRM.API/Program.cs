using Microsoft.AspNetCore.Identity;
using SmartCRM.API.Extensions;
using SmartCRM.Core.Entities;
using SmartCRM.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// ── Railway: override connection string from DATABASE_URL env var ──
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrEmpty(databaseUrl))
{
    // Railway provides postgresql://user:password@host:port/db
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':');
    var connStr = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
    builder.Configuration["ConnectionStrings:DefaultConnection"] = connStr;
}

// ── Railway: override JWT secret from env var ─────────────────
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
if (!string.IsNullOrEmpty(jwtSecret))
    builder.Configuration["Jwt:Secret"] = jwtSecret;

// ── Services ──────────────────────────────────────────────────
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityWithRoles();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRepositories();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ── CORS: allow frontend origin ───────────────────────────────
var frontendOrigin = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
                frontendOrigin,
                "http://localhost:3000",
                "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── Pipeline ──────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Seed ──────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    try
    {
        await DbSeeder.SeedAsync(db, userManager, roleManager);
        app.Logger.LogInformation("✅ Database initialized successfully");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "❌ Database initialization failed");
    }
}

app.Run();
