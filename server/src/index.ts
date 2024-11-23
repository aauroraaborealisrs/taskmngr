import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Task Manager API with ESM is running!');
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
