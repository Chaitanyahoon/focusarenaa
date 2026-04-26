using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FocusArena.Application.Services;

public class ProceduralGenerationService : IProceduralGenerationService
{
    private static readonly Dictionary<string, string[]> KeywordToBossMapping = new(StringComparer.OrdinalIgnoreCase)
    {
        { "code", new[] { "The Bug Swarm", "Syntax Terror", "Null Reference Leviathan" } },
        { "coding", new[] { "The Bug Swarm", "Syntax Terror", "Spaghetti Code Behemoth" } },
        { "bug", new[] { "Null Reference Leviathan", "The Infinite Loop", "Concurrency Phantom" } },
        { "gym", new[] { "Iron Golem", "The Exhaustion Specter", "Lactic Acid Slime" } },
        { "workout", new[] { "Iron Golem", "The Exhaustion Specter", "Cardio Demon" } },
        { "design", new[] { "The Blank Canvas", "Pixel Perfector", "Color Palette Chimera" } },
        { "study", new[] { "The Procrastination Demon", "Exam Anxiety Wraith", "Distraction Imp" } },
        { "math", new[] { "Algebraic Nightmare", "Calculus Dragon", "The Unsolvable Equation" } }
    };

    private static readonly string[] GenericBosses = new[]
    {
        "The Shadow Knight", 
        "Goblin King", 
        "Slime Monarch", 
        "Orc Warlord", 
        "The Restless Soul",
        "Abyssal Watcher"
    };

    public string GenerateBossNameFromKeywords(IEnumerable<string> taskTitles)
    {
        if (taskTitles == null || !taskTitles.Any())
            return GetRandomElement(GenericBosses);

        var allWords = taskTitles
                        .SelectMany(t => t.Split(new[] { ' ', ',', '.' }, StringSplitOptions.RemoveEmptyEntries))
                        .Select(w => w.ToLowerInvariant())
                        .ToList();

        var possibleBosses = new List<string>();

        foreach (var word in allWords)
        {
            if (KeywordToBossMapping.TryGetValue(word, out var bosses))
            {
                possibleBosses.AddRange(bosses);
            }
        }

        if (possibleBosses.Any())
        {
            return GetRandomElement(possibleBosses.ToArray());
        }

        return GetRandomElement(GenericBosses);
    }

    public (int BossMaxHp, int XpReward, int GoldReward) GenerateBossStats(GateRank rank, int playerLevel)
    {
        var random = new Random();
        
        // Multiplier based on rank (E = 1, S = 6)
        double rankMultiplier = (int)rank + 1;
        
        // Base modifiers
        double levelBonus = 1.0 + (playerLevel * 0.1);

        int maxHp = (int)(100 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.2 - 0.1)));
        int xp = (int)(25 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.2)));
        int gold = (int)(10 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.3)));

        // Ensure minimums
        xp = Math.Max(10, xp);
        gold = Math.Max(5, gold);
        maxHp = Math.Max(50, maxHp);

        return (maxHp, xp, gold);
    }

    private string GetRandomElement(string[] array)
    {
        var random = new Random();
        return array[random.Next(array.Length)];
    }
}
