using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FocusArena.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGateColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BossName",
                table: "Gates",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Gates",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BossName",
                table: "Gates");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Gates");
        }
    }
}
