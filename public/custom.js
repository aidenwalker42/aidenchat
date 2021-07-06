
// global vairables....
let client, channel, username, activeUser;

client = new StreamChat('2zqj9j55gz8v');

async function generateToken(username) {
    const heroku = "https://aidenchat.herokuapp.com"
    const local = "http://localhost:8800"
  const { token } = (await axios.get(`${heroku}/token?username=${username}`)).data;
  console.log(token) //token is equal to the data of the get request
  return token; //return to initalizeClient
}

async function initializeClient() {
    const token = await generateToken(username); //set token to the token value of the username
    
    try{
        await client.setUser(
        {
            id: username,
            name: 'The user name', // Update this name dynamically
            image: 'https://bit.ly/2u9Vc0r' // user image
        },
        token
        ); // token generated from Node server
    }
    catch(e)
    {
        document.getElementById("exists").innerHTML = "That user has been deleted forever!";
        console.log(e.message);
        return "error";
    }
    await listUsers();
    await client.on(event => {
        console.log(event);
        if(event.type === "user.presence.changed" || event.type === "notification.added_to_channel"){
            listUsers();
        }
    })
    
    return client;
  }

const user = document.getElementById('user-login-input');

user.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    checkAuthState();
  }
});

checkAuthState();

async function checkAuthState() {
  if (!user.value) { //if nothing was entered
    document.getElementById('login-block').style.display = 'grid';
    document.getElementsByClassName('chat-container')[0].style.display = 'none';
  } else {
    username = user.value; //set global variable

    //initialize user, returns client
    if(await initializeClient() !== "error")
    {
    document.getElementsByClassName('chat-container')[0].style.display = 'grid'; //display chat
    document.getElementById('login-block').style.display = 'none'; //no more login
    }
    else{
        client.disconnect();
    }
  }
}

function populateUsers(users) {
    // remove the current users from the list of users
    const otherUsers = users.filter(user => user.id !== username && user.online);
    console.log(otherUsers)
  
    const usersElement = document.getElementById('users');
    usersElement.innerHTML = "";
    otherUsers.map(user => {
      const userElement = document.createElement('div');
  
      userElement.className = 'user';
      userElement.id = user.id;
      userElement.textContent = user.id;
      userElement.onclick = () => selectUserHandler(user);
  
      usersElement.append(userElement);
    });
  }

  async function selectUserHandler(userPayload) {
    if (activeUser === userPayload.id) return; // current active user, so do not proceed...
  
    activeUser = userPayload.id;
  
    // remove the 'active' class from all users
    const allUsers = document.getElementsByClassName('user');
    Array.from(allUsers).forEach(user => {
      user.classList.remove('active');
    });
  
    // add the 'active' class to the current selected user
    const userElement = document.getElementById(userPayload.id);
    userElement.classList.add('active');
  
    // remove all previous messages in the message container...
    const messageContainer = document.getElementById('messages');
    messageContainer.innerHTML = '';

    await initializeChannel([username, userPayload.id]);
  
    // []
  }

  async function listUsers() {
    const filters = {};
    const response = await client.queryUsers(filters);
    populateUsers(response.users);
    return response;
  }

  async function initializeChannel(members) {
    //members => array of users, [user1, user2]
    channel = client.channel('messaging', {
      members: members,
      session: 8 // custom field, you can add as many as you want
    });
  
    await channel.watch();

    channel.on('message.new', event => {
        appendMessage(event.message);
    });
    channel.state.messages.forEach(message => {
        appendMessage(message);
    });
  }

  function appendMessage(message) {
    const messageContainer = document.getElementById('messages');
  
    // Create and append the message div
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${
      message.user.id === username ? 'message-right' : 'message-left' //if username is equal to the message userid
    }`;
  
    // Create the username div
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'message-username';
    usernameDiv.textContent = `${message.user.id}:`;
  
    // Append the username div to the MessageDiv
    messageDiv.append(usernameDiv);
  
    // Create the main message text div
    const messageTextDiv = document.createElement('div');
    messageTextDiv.textContent = message.text;
  
    // Append the username div to the MessageDiv
    messageDiv.append(messageTextDiv);
  
    // Then append the messageDiv to the "messages" div
    messageContainer.appendChild(messageDiv);
  }

  async function sendMessage(message) {
    return await channel.sendMessage({
      text: message
    });
  }

const inputElement = document.getElementById('message-input');

inputElement.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    sendMessage(inputElement.value);
    inputElement.value = '';
  }
});

    async function del(){
    const {res} = (await axios.get(`https://aidenchat.herokuapp.com/logout?username=${username}`)).data;
    console.log(res)
    location.reload();
    return;
}

const delButton = document.getElementById("delete");

delButton.onclick = () => {
    delButton.innerHTML = "You will never be able to log back into this account, click to confirm";
    delButton.onclick = () => del();
}

const logoutButton = document.getElementById("logout")

logoutButton.onclick = () => {
    location.reload();
}