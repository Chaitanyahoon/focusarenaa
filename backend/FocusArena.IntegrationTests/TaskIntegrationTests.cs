using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using FocusArena.Application.DTOs;
using FocusArena.Domain.Enums;
using Xunit;

namespace FocusArena.IntegrationTests;

public class TaskIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TaskIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UpdateTaskStatus_WithDtoPayload_UpdatesTask()
    {
        var token = await RegisterAndLoginAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createResponse = await _client.PostAsJsonAsync("/api/tasks", new CreateTaskDto
        {
            Title = "Status Test Task",
            Description = "Verify status update contract",
            Category = TaskCategory.Work,
            Difficulty = TaskDifficulty.Medium
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();
        createdTask.Should().NotBeNull();

        var updateResponse = await _client.PutAsJsonAsync($"/api/tasks/{createdTask!.Id}/status", new
        {
            status = TaskStatus.Doing
        });

        updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var tasks = await _client.GetFromJsonAsync<List<TaskDto>>("/api/tasks");
        tasks.Should().NotBeNull();
        tasks!.Single(t => t.Id == createdTask.Id).Status.Should().Be(TaskStatus.Doing);
    }

    private async Task<string> RegisterAndLoginAsync()
    {
        var email = $"taskuser_{Guid.NewGuid()}@focusarena.com";
        const string password = "Password123!";

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new RegisterDto
        {
            Name = "Task User",
            Email = email,
            Password = password
        });

        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = email,
            Password = password
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        auth.Should().NotBeNull();
        auth!.Token.Should().NotBeNullOrWhiteSpace();
        return auth.Token;
    }
}
