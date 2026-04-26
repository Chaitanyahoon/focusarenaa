using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FocusArena.Infrastructure.Migrations
{
    public partial class AddDailyQuestLastProgressAt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastProgressAt",
                table: "DailyQuestLogs",
                type: "datetime(6)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastProgressAt",
                table: "DailyQuestLogs");
        }
    }
}
