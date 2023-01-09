const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './src')));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'src/index.html'));
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
