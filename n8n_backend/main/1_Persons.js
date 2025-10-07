const month = "August";
const data = [
  { name: "Aditya", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAYhSiDcAAA=" },
  { name: "Jackline", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBFwOAAA=" },
  // { name: "Kunal", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBFwMAAA=" },
  // { name: "Neha", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBFwPAAA=" },
  { name: "Nikhil", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBFwLAAA=" },
  { name: "Pinky", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBIrUAAA=" },
  { name: "Priti", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBFwKAAA=" },
  { name: "Sherly", sheetId: "AAMkADc3NDZlNTJiLTU1YzQtNDY5MC1iYWI3LTRlMDBiYjBjMDBlYQAuAAAAAAAd915hjToISIKMie1ULxjYAQC-iXgmjkNkRKP75V6LUzKPAAXpBIrTAAA=" }
];

function getMonthDates(monthInput, yearInput = new Date().getFullYear()) {
  let month;

  if (isNaN(monthInput)) {
    month = new Date(`${monthInput} 1, ${yearInput}`).getMonth();
  } else {
    month = Number(monthInput) - 1;
  }

  if (isNaN(month)) {
    throw new Error("Invalid month input. Use month name or number (1–12).");
  }

  const startDate = new Date(Date.UTC(yearInput, month, 1));
  const endDate = new Date(Date.UTC(yearInput, month + 1, 0));

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function getISOStringFromInput(inputDate) {
  const parts = inputDate.split("-");

  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date)) throw new Error("Invalid date provided.");
    return { start: date.toISOString(), end: date.toISOString() };
  } 
  
  if (parts.length === 1) {
    return getMonthDates(parts[0]);
  }

  throw new Error("Invalid input format. Use 'dd-mm-yyyy' or 'month'.");
}

// Return each as an item with month added
return data.map(entry => ({
  json: {
    name: entry.name,
    sheetId: entry.sheetId,
    month: month,
    startDate:getISOStringFromInput(month).start,
    endDate:getISOStringFromInput(month).end,
  }
}));
