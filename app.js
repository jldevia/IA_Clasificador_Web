const express = require('express')
const app = express()
const routers = require('./routers')
const port = 3000

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use('/', routers);
app.use(express.static('public'));

app.listen(port, () => console.log(`App ejecutandose en el puerto ${port}!`));