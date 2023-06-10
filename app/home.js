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

async function getHistory(key) {
  const formData = {
    key: key,
  };
  const response = await fetch("http://localhost:3000/gethistory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  let messageElements = [];
  if (key) {
    messageElements = Object.keys(data).map((key) => {
      return data[`${key}`];
    });
  } else {
    fillCategory(data);
    let messageElement = Object.keys(data).map((key) => {
      let elements = data[`${key}`];
      elements = Object.keys(elements).map((ele) => {
        return elements[`${ele}`];
      });
      return elements;
    });
    messageElement.forEach((ele) => {
      messageElements.push(...ele);
    });
  }
  return messageElements;
}

async function fillHistory(data) {
  let messageElements = data.map((element) => {
    let div = document.createElement("div");
    let date = document.createElement("h6");
    let touser = document.createElement("h6");
    let message = document.createElement("h6");
    let name = document.createElement("h6");
    let age = document.createElement("h6");
    date.innerText = `Date: ${element.date}`;
    message.innerText = `Message: ${element.message}`;
    touser.innerText = `Reciever: ${element.touser}`;
    name.innerText = `Name: ${element.name}`;
    age.innerText = `Age: ${element.age}`;
    div.append(date);
    div.append(touser);
    div.append(name);
    div.append(age);
    div.append(message);
    div.className = "message-history";
    return div;
  });

  document.getElementById("his").innerHTML = "";
  document.getElementById("his").append(...messageElements);
}

async function fillCategory(data) {
  document.getElementById("select").innerText = "All Reciever ";
  let cateElement = ["All Reciever "];
  cateElement.push(...Object.keys(data));
  cateElement = cateElement.map((key) => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.className = "dropdown-item";
    a.innerText = key;
    li.append(a);
    li.addEventListener("click", async () => {
      document.getElementById("select").innerText = key;
      if (key == "All Reciever ") {
        fillHistory(await getHistory());
      } else {
        fillHistory(await getHistory(key));
      }
    });
    return li;
  });

  document.getElementById("dropdown-menu").innerHTML = "";
  document.getElementById("dropdown-menu").append(...cateElement);
}
async function fillForm() {
  try {
    const info = await checkLogin();
    const userNameElement = document.getElementById("user-name");
    let h3 = document.createElement("h3");
    h3.innerText = `Sent Message`;
    userNameElement.innerHTML = "";
    userNameElement.append(h3);
    const data = await getHistory();
    console.log(data);
    fillHistory(data);
  } catch (err) {
    console.log(err);
  }
}

async function sendMessage() {
  const toUSer = document.getElementById("to-user");
  const message = document.getElementById("message");
  const notify = document.getElementById("notify");

  const from = document.getElementById("from");
  const to = document.getElementById("to");
  let formData;
  if (toUSer) {
    if (!toUSer.value || !message.value) {
      notify.innerHTML = "Reciever or Message are empty";
    } else {
      formData = {
        touser: toUSer.value,
        message: message.value,
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
          await fillForm();
        }
      } catch (err) {
        notify.innerHTML = "Server err";
      }
    }
  } else {
    if (!from.value || !to.value || !message.value) {
      notify.innerHTML = "Please, Fill the Form ! ";
    } else {
      formData = {
        from: from.value,
        to: to.value,
        message: message.value,
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
          await fillForm();
        }
      } catch (err) {
        notify.innerHTML = "Server err";
      }
    }
  }
  setTimeout(() => {
    notify.innerHTML = "";
  }, 5000);
}

fillForm();
document.getElementById("submit").addEventListener("click", () => {
  sendMessage();
});
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
document.getElementById("by-username").addEventListener("click", () => {
  document.getElementById("dropdown-type").innerText = "By Username";
  let input = document.createElement("input");
  input.className = "to-user";
  input.id = "to-user";
  input.placeholder = "Reciever";
  input.type = "text";
  document.getElementById("type").innerHTML = "";
  document.getElementById("type").append(input);
});
document.getElementById("by-age").addEventListener("click", () => {
  document.getElementById("dropdown-type").innerText = "By Age";
  let inputFrom = document.createElement("input");
  inputFrom.className = "from";
  inputFrom.id = "from";
  inputFrom.placeholder = "From";
  inputFrom.type = "text";

  let inputTo = document.createElement("input");
  inputTo.className = "to";
  inputTo.id = "to";
  inputTo.placeholder = "To";
  inputTo.type = "text";

  document.getElementById("type").innerHTML = "";
  document.getElementById("type").append(inputFrom);
  document.getElementById("type").append(inputTo);
});
