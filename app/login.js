const sendButton = document.getElementById("submit");


sendButton.addEventListener("click", async () => {
  const userName = document.getElementById("user-name").value;
  const passWord = document.getElementById("pass-word").value;

  if (!userName || !passWord) {
    document.getElementById(
      "notify"
    ).innerHTML = `Username or Password is empty`;
  } else {
    const data = await sendData(getData());
    if (data.error) {
      document.getElementById("notify").innerHTML = `${data.error}`;
    } else {
      location.reload();
    }
  }
});
function getData() {
  const userName = document.getElementById("user-name").value;
  const passWord = document.getElementById("pass-word").value;

  formData = {
    username: userName,
    password: passWord,
  };
  return formData;
}
async function sendData(formData) {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const data = await response.json();

  return data;
}
