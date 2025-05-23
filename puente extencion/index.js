const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// TU API KEY DE SUPABASE
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2J1bnphZmF2YnFvcHh2d3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjA4MjYsImV4cCI6MjA2Mjk5NjgyNn0.zgiSaPIWP8JL_013-Zl8H_0mR_7uBSH3JmCOakFXm4o";

app.use(express.json());

// Endpoint para validar licencia
app.get('/validar', async (req, res) => {
  const { sub_key, user_id } = req.query;

  if (!sub_key || !user_id) {
    return res.status(400).json({ error: "Faltan parámetros: sub_key y user_id son requeridos." });
  }

  const url = `https://rscbunzafavbqopxvwpq.supabase.co/rest/v1/licences_wild?sub_key=eq.${sub_key}&user_id=eq.${user_id}&valid=eq.true`;
  try {
    const resp = await fetch(url, {
      headers: {
        "apikey": SUPABASE_API_KEY,
        "Authorization": `Bearer ${SUPABASE_API_KEY}`
      }
    });
    const data = await resp.json();
    if (data.length > 0) {
      const expiracion = new Date(data[0].expires_at);
      if (expiracion >= new Date()) {
        return res.json({ ok: true, expires_at: expiracion });
      } else {
        return res.status(403).json({ ok: false, error: "Licencia vencida" });
      }
    } else {
      return res.status(403).json({ ok: false, error: "Licencia o usuario no válido" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('API de licencias activa');
});

app.listen(PORT, () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});
