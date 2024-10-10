const express = require("express");
const edgedb = require("edgedb");
const app = express();

const client = edgedb.createClient();

// Check if the person is an active beneficiary
app.get("/is_beneficiary", async (req, res) => {
  const { name, cpf } = req.query;
  if (!name || !cpf)
    return res.status(400).json({ error: "Name and CPF are required" });

  try {
    const beneficiary = await client.query(`
      SELECT Beneficiary {
      id,
        name,
        cpf
      } FILTER .name ILIKE '%${name}%' AND .cpf = <str>$cpf
    `, { cpf });

    if (beneficiary.length > 0)
      res.json({ status: "active", ...beneficiary[0] });
    else
      res.status(404).json({ error: "Beneficiary not found" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Check if the time slot is available
app.get("/check_availability", async (req, res) => {
  const { date, time } = req.query;
  if (!date || !time)
    return res.status(400).json({ error: "Date and time are required" });


  try {
    const timeSlotTaken = await client.query(`
      SELECT Schedule
      FILTER .date = <cal::local_date>$date AND .time = <cal::local_time>$time
    `, { date, time });

    if (timeSlotTaken.length <= 0)
      res.json({ available: false, message: "Time slot unavailable" });
    else
      res.json({ available: true, message: "Time slot available" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});
// Schedule a time slot for the person
app.post("/schedule", async (req, res) => {
  const { date, time, beneficiary_id } = req.query;
  if (!beneficiary_id || !date || !time)
    return res.status(400).json({ error: "Beneficiary ID, date, and time are required" });

  try {
    const beneficiary = await client.query(`
      SELECT Beneficiary {
        id
      } FILTER .id = <uuid>$beneficiary_id
    `, { beneficiary_id });

    if (beneficiary.length <= 0)
      return res.status(404).json({ error: "Beneficiary not found" });

    const timeSlotTaken = await client.query(`
      SELECT Schedule
      FILTER .date = <cal::local_date>${date} AND .time = <cal::local_time>${time}
    `);

    if (timeSlotTaken.length > 0)
      return res.json({ available: false, message: "Time slot unavailable" });

    await client.execute(`
      INSERT Schedule {
        date := <cal::local_date>${date},
        time := <cal::local_time>${time},
        beneficiary := <uuid>$beneficiary_id
      }
    `, { beneficiary_id });

    res.json({ available: true, message: "Time slot successfully scheduled" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.get("/schedule", async (req, res) => {
  try {
    const schedule = await client.query(`
      SELECT Schedule {
        date,
        time,
        beneficiary: {
          id,
          name
        }
      }
    `);

    res.json(schedule);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Handling unknown routes
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

module.exports = app;
