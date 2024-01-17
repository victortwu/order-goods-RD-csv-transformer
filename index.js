const fs = require("fs");
const { v4 } = require("uuid");
const readline = require("readline");

const stream = fs.createReadStream("rdpurchases.csv");
const reader = readline.createInterface({ input: stream });

const allItems = [];

let processInvoices = false;

reader.on("line", (line) => {
  if (line.startsWith('"Invoice: "')) {
    processInvoices = true;
    return;
  }

  if (processInvoices) {
    const parsedLine = line.split(",");

    if (parsedLine.length >= 4) {
      const randomID = v4();
      const upc = parsedLine[0].replace(/"/g, "").trim();
      const description = parsedLine[1].replace(/"/g, "").trim();

      if (upc.length > 8) {
        allItems.push({
          id: randomID,
          vendorProductName: description,
          upc: upc,
          name: "",
          vendorID: "Restaurant Depot",
          category: "Food COGS",
        });
      }
    }
  }
});

reader.on("close", () => {
  const unique = new Map(allItems.map((item) => [item.upc, item]));
  const uniqueItems = Array.from(unique.values());

  fs.writeFile("output.json", JSON.stringify(uniqueItems, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("CSV file processed and output.json created.");
    }
  });
});
