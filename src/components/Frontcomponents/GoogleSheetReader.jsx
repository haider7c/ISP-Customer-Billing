import React, { useEffect, useState } from 'react';

const SHEET_ID = "2PACX-1vRxm6UqNPibinomgadQCidbjXPcL_14ADOnX4qaN3OIWpOGY1bi_FBPTcsvBLYO_P4lo3Va1oPInQP1";
const BASE_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&sheet=`;

// ⚠️ You must match the exact names of your sheet tabs!
const SHEET_TABS = [
  "May-2021",
  "June-2021",
  "July 2021",
  "August 2021",
  "September 2021",
  "October 2021",
  "Sheet9",
  "November 2021"
];

function GoogleSheetTabsViewer() {
  const [selectedTab, setSelectedTab] = useState(SHEET_TABS[0]);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);

  const fetchSheetData = (sheetName) => {
    fetch(BASE_URL + encodeURIComponent(sheetName))
      .then(res => res.text())
      .then(csv => {
        const lines = csv.trim().split("\n").map(line => line.split(","));
        const [headerRow, ...dataRows] = lines;
        setHeaders(headerRow);
        setRows(dataRows);
      })
      .catch(err => {
        console.error("Error fetching sheet data:", err);
        setHeaders([]);
        setRows([]);
      });
  };

  useEffect(() => {
    fetchSheetData(selectedTab);
  }, [selectedTab]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Sheet</h2>
      <select
        className="mb-4 border px-3 py-2"
        onChange={(e) => setSelectedTab(e.target.value)}
        value={selectedTab}
      >
        {SHEET_TABS.map((name, idx) => (
          <option key={idx} value={name}>{name}</option>
        ))}
      </select>

      {rows.length > 0 ? (
        <table className="border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="border px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border px-3 py-1">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-red-500">No data available for this sheet.</p>
      )}
    </div>
  );
}

export default GoogleSheetTabsViewer;
