using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FocusArena.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreShopItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ShopItems",
                columns: new[] { "Id", "Description", "EffectData", "ImageUrl", "Name", "Price", "Type" },
                values: new object[,]
                {
                    { 5, "A mysterious box containing random rewards (Gold, Items, or Jackpot).", "{\"effect\":\"random_reward\",\"pool\":\"standard\"}", "https://api.dicebear.com/9.x/glass/svg?seed=box", "Shadow Extract", 500, "Consumable" },
                    { 6, "Official license required to establish a new Guild.", "{\"effect\":\"unlock_feature\",\"feature\":\"create_guild\"}", "https://api.dicebear.com/9.x/glass/svg?seed=charter", "Guild Charter", 5000, "KeyItem" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
