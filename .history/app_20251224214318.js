const express = require('express');
const path = require('path');
const { syncDatabase } = require('./models'); // Model index dosyasını çağırıyoruz

const app = express();

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes (Şimdilik boş, sonra ekleyeceğiz)
app.get('/', (req, res) => {
    res.send('<h1>Job Portal Backend is Running... 🚀</h1><p>Database sync complete.</p>');
});

// Server Başlatma
const PORT = process.env.PORT || 3050;

// Önce veritabanını senkronize et, sonra sunucuyu başlat
syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
    });
});