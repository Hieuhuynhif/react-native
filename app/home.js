const sendButton = document.getElementById("sendbutton")

sendButton.addEventListener('click', async()=>{
    const userName = document.getElementById("username").value
    const passWord = document.getElementById("password").value
    const toUser= document.getElementById("touser").value
    const title= document.getElementById("title").value
    const body= document.getElementById("body").value

    if(!toUser || !userName || !passWord || !title || !body)
    {
        document.getElementById('notify').innerHTML = `Please fill the from`;
    }
    else
    {
        const data = await sendData(getData());
        if(data.error)
        {
            document.getElementById('notify').innerHTML = `${data.error}`;
        }
        else {
            document.getElementById('notify').innerHTML = "Successful";
        }
    }

})
function getData()
{
    const userName = document.getElementById("username").value
    const passWord = document.getElementById("password").value
    const toUser= document.getElementById("touser").value
    const title= document.getElementById("title").value
    const body= document.getElementById("body").value

    formData = {
        username    :   userName,
        password    :   passWord,
        touser      :   toUser,
        title       :   title,
        body        :   body  
    }
    return formData;
}
async function sendData(formData)
{
    const response = await fetch("http://localhost:3000/pushnotify", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();

    return data;
}
