using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FocusArena.Application.DTOs;
using Xunit;

namespace FocusArena.IntegrationTests;

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Name = "Integration Test User",
            Email = $"testuser_{Guid.NewGuid()}@focusarena.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
        var content = await response.Content.ReadAsStringAsync();

        // Assert - The Register endpoint has its own try-catch that returns 500 with details
        // If we get OK, great. If we get 500, print the error for debugging.
        if (response.StatusCode == HttpStatusCode.InternalServerError)
        {
            // The AuthController catches exceptions. This test documents the server error.
            content.Should().NotBeNullOrEmpty("Server returned 500 with body: " + content);
            // Skip assertion - document the issue
            Assert.Fail($"Server returned 500: {content}");
        }

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Contain("@focusarena.com");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // Arrange - Register first
        var email = $"loginuser_{Guid.NewGuid()}@focusarena.com";
        var password = "Password123!";

        var registerDto = new RegisterDto
        {
            Name = "Login Test User",
            Email = email,
            Password = password
        };
        var regResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        if (!regResponse.IsSuccessStatusCode)
        {
            var regContent = await regResponse.Content.ReadAsStringAsync();
            Assert.Fail($"Registration failed ({regResponse.StatusCode}): {regContent}");
        }

        // Act - Login
        var loginDto = new LoginDto
        {
            Email = email,
            Password = password
        };
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK, because: $"Response body: {content}");
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange - Register first
        var email = $"wrongpw_{Guid.NewGuid()}@focusarena.com";
        var registerDto = new RegisterDto
        {
            Name = "Wrong PW User",
            Email = email,
            Password = "Password123!"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Act - try login with wrong password
        var loginDto = new LoginDto
        {
            Email = email,
            Password = "WrongPassword999!"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
