const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }))

const users = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const userId = Math.floor(Math.random() * 1000000);
  const user = {
    username: username,
    _id: userId,
  };
  users.push(user);
  res.json({ username: username, _id: userId });
})

app.get('/api/users', (req, res) => {
  res.json(users);
})

app.get('/api/user/:_id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
})


app.post('/api/user/:_id/excercise', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { description, duration, date } = req.body;
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
  };

  user.logs.push(exercise);
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  });
})

app.get('/api/user/:_id/logs', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { from, to, limit } = req.query;
  let logs = user.logs;

  if (from) {
    logs = logs.filter(log => log.date >= new Date(from));
  }
  if (to) {
    logs = logs.filter(log => log.date <= new Date(to));
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: log.date.toDateString(),
    })),
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
