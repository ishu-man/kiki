// this is where I will POST the user's inputs..
const preferencesURL =  'http://127.0.0.1:8000/api/preferences/';

const submitButton = document.querySelector(".submit-button");
submitButton.addEventListener("click", async (event)=> {
    // add form validation
    event.preventDefault();
    const topicInput = document.querySelector('#topic').value;
    const contextInput = document.querySelector('#context').value;
    const goalInput = document.querySelector('#goal').value;

    const formJSON = {
        "topic": topicInput, 
        "context": contextInput, 
        "goal": goalInput
    }
    try {
        submitButton.setAttribute("class", "submit-button-processing");
        response = await POSTtoEndpoint(formJSON, preferencesURL);
        window.location.href = 'audio-listen.html';
    } catch (error) {
        console.error(error);
    }
}) 

async function POSTtoEndpoint(formData, targetURL) {
    try {
    response = await fetch(targetURL, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    } catch (error) {
    console.error(error.message);
  }
}
