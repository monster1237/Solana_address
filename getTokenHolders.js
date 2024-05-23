const fs = require("fs");
const ExcelJS = require("exceljs");

const findHolders = async () => {
  let page = 1;
  let allOwners = new Set();

  // Your code for fetching holders...
  const apiKey = process.env.HELIS_API_KEY;

  if (!apiKey) {
    console.error("API key not found in environment variables.");
    process.exit(1);
  }

  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  const { default: fetch } = await import("node-fetch");

  while (true) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccounts",
        id: "helius-test",
        params: {
          page: page,
          limit: 1000,
          displayOptions: {},
          // Replace this mint address with the token address you are interested in
          mint: "8Hmcp4wGAm8yA3vUo6v9TYNQt6ZEgrLoMiwzPqdQCmYn",
        },
      }),
    });
    const data = await response.json();

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log(`No more results. Total pages: ${page - 1}`);
      break;
    }
    console.log(`Processing results from page ${page}`);
    data.result.token_accounts.forEach((account) =>
      allOwners.add(account.owner),
    );
    page++;
  }

  // After fetching all holders
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Holders");

  worksheet.columns = [
    { header: "Address", key: "address", width: 40 },
  ];

  Array.from(allOwners).forEach((address) => {
    worksheet.addRow({ address: address });
  });

  const excelFilename = "output.xlsx";
  await workbook.xlsx.writeFile(excelFilename);
  console.log(`Excel file "${excelFilename}" has been generated.`);
};

findHolders();
