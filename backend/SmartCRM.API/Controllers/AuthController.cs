using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartCRM.Core.DTOs.Auth;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using SmartCRM.Infrastructure.Data;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IJwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Invalid email or password" });

        if (!user.IsActive)
            return Forbid();

        var roles = await userManager.GetRolesAsync(user);
        var token = jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponse(
            Token: token,
            Email: user.Email!,
            FullName: user.FullName,
            Role: roles.FirstOrDefault() ?? "Viewer",
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        ));
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!DbSeeder.Roles.Contains(request.Role))
            return BadRequest(new { message = $"Valid roles: {string.Join(", ", DbSeeder.Roles)}" });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        await userManager.AddToRoleAsync(user, request.Role);

        var roles = await userManager.GetRolesAsync(user);
        var token = jwtService.GenerateToken(user, roles);

        return Created($"/api/users/{user.Id}", new AuthResponse(
            Token: token,
            Email: user.Email!,
            FullName: user.FullName,
            Role: request.Role,
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        ));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

        var user = await userManager.FindByIdAsync(userId!);
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new UserDto(
            Id: user.Id,
            Email: user.Email!,
            FullName: user.FullName,
            Role: roles.FirstOrDefault() ?? "Viewer",
            IsActive: user.IsActive,
            CreatedAt: user.CreatedAt
        ));
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = userManager.Users.Where(u => u.IsActive).ToList();
        var result = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            result.Add(new UserDto(
                Id: user.Id,
                Email: user.Email!,
                FullName: user.FullName,
                Role: roles.FirstOrDefault() ?? "Viewer",
                IsActive: user.IsActive,
                CreatedAt: user.CreatedAt
            ));
        }

        return Ok(result);
    }
}
