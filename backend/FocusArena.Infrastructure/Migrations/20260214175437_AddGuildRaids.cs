using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FocusArena.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGuildRaids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Guilds_GuildId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_GuildId",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "GuildRaidId",
                table: "Tasks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGuildTask",
                table: "Tasks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "GuildRaids",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    GuildId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TotalHP = table.Column<int>(type: "int", nullable: false),
                    CurrentHP = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ClearedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    BossName = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuildRaids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuildRaids_Guilds_GuildId",
                        column: x => x.GuildId,
                        principalTable: "Guilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_GuildRaidId",
                table: "Tasks",
                column: "GuildRaidId");

            migrationBuilder.CreateIndex(
                name: "IX_Guilds_LeaderId",
                table: "Guilds",
                column: "LeaderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuildRaids_GuildId",
                table: "GuildRaids",
                column: "GuildId");

            migrationBuilder.AddForeignKey(
                name: "FK_Guilds_Users_LeaderId",
                table: "Guilds",
                column: "LeaderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_GuildRaids_GuildRaidId",
                table: "Tasks",
                column: "GuildRaidId",
                principalTable: "GuildRaids",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Guilds_Users_LeaderId",
                table: "Guilds");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_GuildRaids_GuildRaidId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "GuildRaids");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_GuildRaidId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Guilds_LeaderId",
                table: "Guilds");

            migrationBuilder.DropColumn(
                name: "GuildRaidId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "IsGuildTask",
                table: "Tasks");

            migrationBuilder.CreateIndex(
                name: "IX_Users_GuildId",
                table: "Users",
                column: "GuildId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Guilds_GuildId",
                table: "Users",
                column: "GuildId",
                principalTable: "Guilds",
                principalColumn: "Id");
        }
    }
}
