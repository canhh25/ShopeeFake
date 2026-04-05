-- Checkout schema: Order (totalAmount, status PENDING, phone, shippingAddress), OrderItem.priceAtPurchase

PRAGMA foreign_keys=OFF;

CREATE TABLE "Order_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "phone" TEXT,
    "shippingAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_new_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Order_new" ("id", "userId", "totalAmount", "status", "phone", "shippingAddress", "createdAt", "updatedAt")
SELECT
    "id",
    "userId",
    "total",
    CASE WHEN lower("status") = 'pending' THEN 'PENDING' ELSE upper("status") END,
    NULL,
    NULL,
    "createdAt",
    "updatedAt"
FROM "Order";

CREATE TABLE "OrderItem_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" REAL NOT NULL,
    CONSTRAINT "OrderItem_new_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_new_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "OrderItem_new" ("id", "orderId", "productId", "quantity", "priceAtPurchase")
SELECT "id", "orderId", "productId", "quantity", "price" FROM "OrderItem";

DROP TABLE "OrderItem";
DROP TABLE "Order";
ALTER TABLE "Order_new" RENAME TO "Order";
ALTER TABLE "OrderItem_new" RENAME TO "OrderItem";

PRAGMA foreign_keys=ON;
