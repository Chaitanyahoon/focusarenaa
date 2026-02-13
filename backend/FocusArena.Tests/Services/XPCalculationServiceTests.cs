using FocusArena.Application.Services;
using FocusArena.Application.Interfaces;
using Xunit;

namespace FocusArena.Tests.Services;

public class XPCalculationServiceTests
{
    private readonly IXPCalculationService _xpService;

    public XPCalculationServiceTests()
    {
        _xpService = new XPCalculationService();
    }

    [Theory]
    [InlineData(50, 0, false, 50)]   // Base 50, Streak 0, No Early -> 50
    [InlineData(50, 5, false, 55)]   // Base 50, Streak 5, No Early -> 55 (Streak added)
    [InlineData(50, 0, true, 55)]    // Base 50, Streak 0, Early -> 55 (+5 Bonus)
    [InlineData(50, 10, true, 65)]   // Base 50, Streak 10, Early -> 65 (50 + 10 + 5)
    public void CalculateTaskXP_ReturnsCorrectXP(int baseDifficultyXP, int streakBonus, bool earlyCompletion, int expectedXP)
    {
        // Act
        var result = _xpService.CalculateTaskXP(baseDifficultyXP, streakBonus, earlyCompletion);

        // Assert
        Assert.Equal(expectedXP, result);
    }

    [Theory]
    [InlineData(1, 5)]    // 1 streak -> 5 bonus
    [InlineData(5, 25)]   // 5 streak -> 25 bonus
    [InlineData(10, 50)]  // 10 streak -> 50 bonus
    public void GetStreakBonus_ReturnsCorrectBonus(int streakCount, int expectedBonus)
    {
        // Act
        var result = _xpService.GetStreakBonus(streakCount);

        // Assert
        Assert.Equal(expectedBonus, result);
    }

    [Fact]
    public void GetWeeklyConsistencyBonus_Returns20_When7TasksCompleted()
    {
        // Act
        var result = _xpService.GetWeeklyConsistencyBonus(7);

        // Assert
        Assert.Equal(20, result);
    }

    [Fact]
    public void GetWeeklyConsistencyBonus_Returns0_WhenLessThan7TasksCompleted()
    {
        // Act
        var result = _xpService.GetWeeklyConsistencyBonus(6);

        // Assert
        Assert.Equal(0, result);
    }
}
