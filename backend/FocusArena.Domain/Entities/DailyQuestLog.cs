using System;
using System.ComponentModel.DataAnnotations;

namespace FocusArena.Domain.Entities
{
    public class DailyQuestLog
    {
        public int Id { get; set; }

        public int DailyQuestId { get; set; }
        public DailyQuest DailyQuest { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public DateTime Date { get; set; } // The date this log belongs to

        public int CurrentCount { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime? CompletedAt { get; set; }
    }
}
