async function checkLogin() {
  const response = await fetch("http://localhost:3000/check", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.sess;
}
async function fillForm() {
  try {
    const info = await checkLogin();
    const userNameElement = document.getElementById("user-name");
    let h3 = document.createElement('h3')
    h3.innerText = `Username: ${info.username}`;
    userNameElement.innerHTML = "";
    userNameElement.append(h3);
    const response = await fetch("http://localhost:3000/gethistory", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    let messageElement = Object.keys(data).map((key) => {
      return data[`${key}`];
    });
    messageElement = messageElement.map((ele) => {
      let div = document.createElement('div');
      let date = document.createElement('h4')
      let touser = document.createElement('h4')
      let message = document.createElement('h4')
      date.innerText = `Date: ${ele.date}`;
      message.innerText = `Message: ${ele.message}`;
      touser.innerText = `Reciever: ${ele.touser}`;
      div.append(date);
      div.append(touser);
      div.append(message);
      div.className = "message-history";
      return div;
    });
    document.getElementById("his").innerHTML = "";
    document.getElementById("his").append(...messageElement);
  } catch (err) {
    console.log(err);
  }
}
fillForm();

const sendButton = document.getElementById("submit");
sendButton.addEventListener("click", () => {
  sendMessage();
});
async function sendMessage() {
  const toUSer = document.getElementById("to-user").value;
  const message = document.getElementById("message").value;
  const notify = document.getElementById("notify");

  if (!toUSer || !message) {
    notify.innerHTML = "Reciever or Message are empty";
  } else {
    const formData = {
      touser: toUSer,
      message: message,
    };
    try {
      const response = await fetch("http://localhost:3000/pushnotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.error) {
        notify.innerHTML = data.error;
      } else {
        notify.innerHTML = "Send Successfully";
        fillForm()
      }
    } catch (err) {
      notify.innerHTML = "Server err";
    }
  }
}
const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", async () => {
  await fetch("http://localhost:3000/logout", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(() => {
    location.reload();
  });
});
