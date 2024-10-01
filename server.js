const express = require('express');
const index = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', index);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
