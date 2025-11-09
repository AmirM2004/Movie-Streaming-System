const express = require('express');
const cors = require('cors');
const mainRouter = require("./routes/main.js");
const app = express();

const path = require('path');

app.use('/public', express.static(path.join(__dirname, 'public'))); // فایل‌های استاتیک در مسیر public

app.use(cors());
app.use(express.json());

app.use("/api" , mainRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
