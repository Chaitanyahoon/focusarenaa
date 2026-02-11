using FocusArena.Application.Services;
using FocusArena.Domain.Enums;
using Xunit;

namespace FocusArena.Tests
{
    public class XPCalculationServiceTests
    {
        private readonly XPCalculationService _xpService;

        public XPCalculationServiceTests()
        {
            _xpService = new XPCalculationService();
        }

        [Theory]
        [InlineData(TaskDifficulty.Easy, 10)]
        [InlineData(TaskDifficulty.Medium, 20)]
        [InlineData(TaskDifficulty.Hard, 40)]
        public void CalculateXP_ReturnsCorrectBaseValue(TaskDifficulty difficulty, int expected)
        {
            // Act
            var result = _xpService.CalculateXP(difficulty);

            // Assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void CalculateXP_WithStreak_AppliesMultiplier()
        {
            // Arrange
            var difficulty = TaskDifficulty.Medium; // Base 20
            var currentStreak = 5; // 5% bonus per day = +25%

            // Act
            var result = _xpService.CalculateXP(difficulty, currentStreak);

            // Assert (20 * 1.25 = 25)
            Assert.Equal(25, result);
        }

        [Fact]
        public void CalculateXP_MaxStreakBonus_IsCapped()
        {
            // Arrange
            var difficulty = TaskDifficulty.Medium; // Base 20
            var currentStreak = 100; // Should cap at 50% (1.5x)

            // Act
            var result = _xpService.CalculateXP(difficulty, currentStreak);

            // Assert (20 * 1.5 = 30)
            Assert.Equal(30, result);
        }
    }
}
