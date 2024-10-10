const express = require("express");
const fs = require('fs');
const app = express();

// Helper function to read JSON files
function readJsonFileSync(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// Helper function to save JSON files
function writeJsonFileSync(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Check if the person is an active beneficiary
app.get("/is_beneficiary", (req, res) => {
  const { name, cpf } = req.query;
  if (!name || !cpf)
    return res.status(400).json({ error: "Name and CPF are required" });

  const beneficiaries = readJsonFileSync('./data/beneficiaries.json');

  const beneficiary = beneficiaries.find(b => b.name.indexOf(name) != -1 && b.cpf == cpf);

  if (beneficiary)
    res.json({ status: "active", ...beneficiary });
  else
    res.status(404).json({ error: "Beneficiary not found" });
});

// Check if the time slot is available
app.get("/check_availability", (req, res) => {
  const { date, time } = req.query;
  if (!date || !time)
    return res.status(400).json({ error: "Date and time are required" });


  const schedule = readJsonFileSync('./data/schedule.json');

  const timeSlotTaken = schedule.some(s => s.date === date && s.time === time);

  if (timeSlotTaken)
    res.json({ available: false, message: "Time slot unavailable" });
  else
    res.json({ available: true, message: "Time slot available" });

});

// Schedule a time slot for the person
app.post("/schedule", (req, res) => {
  const { id, date, time } = req.query;
  if (!id || !date || !time)
    return res.status(400).json({ error: "ID, date, and time are required" });

  const beneficiaries = readJsonFileSync('./data/beneficiaries.json');
  const schedule = readJsonFileSync('./data/schedule.json');

  // Check if the person is a beneficiary
  const beneficiary = beneficiaries.find(b => b.id === id);
  if (!beneficiary)
    return res.status(404).json({ error: "Beneficiary not found" });

  // Check if the time slot is already taken
  const timeSlotTaken = schedule.some(s => s.date === date && s.time === time);
  if (timeSlotTaken)
    return res.json({ available: false, message: "Time slot unavailable" });

  // Schedule the time slot
  schedule.push({ id, date, time });
  writeJsonFileSync('./data/schedule.json', schedule);

  res.json({ available: false, message: "Time slot successfully scheduled" });
});

app.get("/schedule", (req, res) => {
  const schedule = readJsonFileSync('./data/schedule.json');

  res.json(schedule);
});

// Handling unknown routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// app.listen(3001, () => {
//   console.log("Server running on port 3001");
// });

module.exports = app;