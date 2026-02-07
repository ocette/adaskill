require("dotenv").config();

const express = require("express");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 4242;

// Initialisation de la connexion Neon
const sql = neon(`${process.env.DATABASE_URL}`);

// Route de test
app.get("/", async (_, res) => {
  const response = await sql`SELECT version()`;
  const { version } = response[0];
  res.json({ version });
});

app.get("/themes-skills", async (req, res) => {
  const data = await sql`
    SELECT 
      themes.id AS theme_id,
      themes.libelle,
      skills.id AS skill_id,
      skills.intitule,
      skills.niveau
    FROM themes
    LEFT JOIN skills ON skills.themes_id = themes.id
    ORDER BY themes.id
  `;

  res.json(data);
});

app.post("/themes", express.json(), async (req, res) => {
  const { libelle } = req.body;

  const result = await sql`
    INSERT INTO themes (libelle)
    VALUES (${libelle})
    RETURNING *
  `;

  res.json(result[0]);
});

app.post("/skills", express.json(), async (req, res) => {
  const { intitule, niveau, themes_id } = req.body;

  const result = await sql`
    INSERT INTO skills (intitule, niveau, themes_id)
    VALUES (${intitule}, ${niveau}, ${themes_id})
    RETURNING *
  `;

  res.json(result[0]);
});

app.delete("/skills/:id", async (req, res) => {
  await sql`DELETE FROM skills WHERE id = ${req.params.id}`;
  res.json({ message: "Skill supprimé" });
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});
