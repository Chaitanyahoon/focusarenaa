using FocusArena.Domain.Entities;
using System.Collections.Generic;

namespace FocusArena.Application.Interfaces;

public interface IProceduralGenerationService
{
    /// <summary>
    /// Analyzes user task history/titles and generates a customized Dungeon Boss name.
    /// </summary>
    string GenerateBossNameFromKeywords(IEnumerable<string> taskTitles);

    /// <summary>
    /// Generates randomized stats for a given boss target level.
    /// </summary>
    (int BossMaxHp, int XpReward, int GoldReward) GenerateBossStats(GateRank rank, int playerLevel);
}
