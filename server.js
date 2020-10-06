const express = require('express');

const app = express();

app.use(express.static(__dirname));

app.listen(5500, err => {
  if (!err) console.log("Up and running =-----> ", 5500);
});
