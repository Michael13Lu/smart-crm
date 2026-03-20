namespace SmartCRM.Core.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string Role // "Admin" | "Manager" | "Viewer"
);

public record AuthResponse(
    string Token,
    string Email,
    string FullName,
    string Role,
    DateTime ExpiresAt
);

public record UserDto(
    string Id,
    string Email,
    string FullName,
    string Role,
    bool IsActive,
    DateTime CreatedAt
);
