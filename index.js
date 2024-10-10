const express = require("express");
const edgedb = require("edgedb");
const e = require("./dbschema/edgeql-js"); // Importa consultas geradas pelo EdgeDB
const app = express();

const client = edgedb.createClient(); // Cria o cliente EdgeDB

// Check if the person is an active beneficiary
app.get("/is_beneficiary", async (req, res) => {
  const { name, cpf } = req.query;
  if (!name || !cpf)
    return res.status(400).json({ error: "Name and CPF are required" });

  try {
    const beneficiary = await e
      .select(e.Beneficiary, (b) => ({
        name: true,
        cpf: true,
        filter: e.op(
          e.op(b.name, 'ilike', `%${name}%`),
          'and',
          e.op(b.cpf, '=', cpf)
        )
      }))
      .run(client);

    if (beneficiary.length > 0)
      res.json({ status: "active", ...beneficiary[0] });
    else
      res.status(404).json({ error: "Beneficiary not found" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});

// Check if the time slot is available
app.get("/check_availability", async (req, res) => {
  const { date, time } = req.query;
  if (!date || !time)
    return res.status(400).json({ error: "Date and time are required" });

  try {
    const timeSlotTaken = await e
      .select(e.Schedule, (s) => ({
        filter: e.op(
          e.op(s.date, '=', date),
          'and',
          e.op(s.time, '=', time)
        )
      }))
      .run(client);

    if (timeSlotTaken.length > 0)
      res.json({ available: false, message: "Time slot unavailable" });
    else
      res.json({ available: true, message: "Time slot available" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});

// Schedule a time slot for the person
app.post("/schedule", async (req, res) => {
  const { id, date, time } = req.query;
  if (!id || !date || !time)
    return res.status(400).json({ error: "ID, date, and time are required" });

  try {
    const beneficiary = await e
      .select(e.Beneficiary, (b) => ({
        id: true,
        filter: e.op(b.id, '=', id)
      }))
      .run(client);

    if (beneficiary.length === 0)
      return res.status(404).json({ error: "Beneficiary not found" });

    const timeSlotTaken = await e
      .select(e.Schedule, (s) => ({
        filter: e.op(
          e.op(s.date, '=', date),
          'and',
          e.op(s.time, '=', time)
        )
      }))
      .run(client);

    if (timeSlotTaken.length > 0)
      return res.json({ available: false, message: "Time slot unavailable" });

    await e.insert(e.Schedule, {
      id,
      date,
      time
    }).run(client);

    res.json({ available: true, message: "Time slot successfully scheduled" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});

app.get("/schedule", async (req, res) => {
  try {
    const schedule = await e
      .select(e.Schedule, () => ({
        id: true,
        date: true,
        time: true
      }))
      .run(client);

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});

// Handling unknown routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

module.exports = app;
