-- DropForeignKey
ALTER TABLE "InventoryHistory" DROP CONSTRAINT "InventoryHistory_inventoryId_fkey";

-- AddForeignKey
ALTER TABLE "InventoryHistory" ADD CONSTRAINT "InventoryHistory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
