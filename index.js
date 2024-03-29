const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public')) // zpristupni klientovi pomoci public slozky, neni to bezpecne
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))