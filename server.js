const express = require('express');
const app = express();

// Stream Chat server SDK
const StreamChat = require('stream-chat').StreamChat;
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

const port = process.env.PORT || 8800;

app.listen(port, () => {
  console.log('listening on port ' + port);
});

const serverClient = new StreamChat('2zqj9j55gz8v', 'meruqm7v7exrjm72en62vratcau6t8kqmsbpxby4gbj5ys7s8hn3efq9yvyhpz66');

app.get('/token', (req, res) => {
    console.log("hit")
  const { username } = req.query;
  console.log(username)
  if (username) {
    const token = serverClient.createToken(username);
    console.log(token)
    console.log(serverClient);
    res.status(200).json({ token, status: 'sucess' });
  } else {
    res.status(401).json({ message: 'invalid request', status: 'error' });
  }
});

app.get("/logout", (req, res) => {
    const { username } = req.query;
    serverClient.deleteUser(username, { 
        delete_conversation_channels: true, 
        mark_messages_deleted: true, 
        hard_delete: true
    });
    res.status(200).send(username + " Deleted");
});