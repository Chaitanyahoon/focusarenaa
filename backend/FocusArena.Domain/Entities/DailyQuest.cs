using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FocusArena.Domain.Entities
{
    public class DailyQuest
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } // e.g. "Push-ups"

        public string Description { get; set; }

        public int TargetCount { get; set; } // e.g. 100
        public string Unit { get; set; } // e.g. "reps"

        public int Difficulty { get; set; } // 1-5, used for XP calculation

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
