const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware para poder leer JSON del body
app.use(cors());
app.use(express.json());

// Endpoint que espera los datos por POST
app.post('/validate', async (req, res) => {
    const { sub_key, user_id } = req.body; // <-- CAMBIADO mo_no por user_id

    if (!sub_key || !user_id) {
        return res.status(400).json({ error: 'Faltan parámetros sub_key y user_id.' });
    }

    try {
        // Consulta a Supabase REST API
        const { data } = await axios.get('https://rscbunzafavbqopxvwpq.supabase.co/rest/v1/licences_wild', {
            params: {
                sub_key: `eq.${sub_key}`,
                user_id: `eq.${user_id}`,   // <-- Aquí también usa user_id
                valid: 'is.true'
            },
            headers: {
                apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2J1bnphZmF2YnFvcHh2d3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjA4MjYsImV4cCI6MjA2Mjk5NjgyNn0.zgiSaPIWP8JL_013-Zl8H_0mR_7uBSH3JmCOakFXm4o',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2J1bnphZmF2YnFvcHh2d3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjA4MjYsImV4cCI6MjA2Mjk5NjgyNn0.zgiSaPIWP8JL_013-Zl8H_0mR_7uBSH3JmCOakFXm4o'
            }
        });

        if (data.length > 0) {
            const hoy = new Date();
            const expiracion = new Date(data[0].expires_at);
            if (expiracion >= hoy) {
                return res.json({ valid: true, expires_at: expiracion });
            } else {
                return res.json({ valid: false, error: "Licencia expirada" });
            }
        } else {
            return res.json({ valid: false, error: "Licencia o número no válido" });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error validando la licencia', detalle: err.message });
    }
});

// Home simple
app.get('/', (req, res) => {
    res.send('API de validación de licencias funcionando');
});

// Arrancar el server
app.listen(PORT, () => {
    console.log('API corriendo en el puerto', PORT);
});
