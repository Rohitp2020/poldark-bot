async function callAPI() {
  const response = await fetch("/api/hello");
  const data = await response.json();
  document.getElementById("response").innerText = data.message;
}

async function callAPITime() {
  const response = await fetch("/api/time");
  const data = await response.json();
  document.getElementById("output").innerText = data.currentTime;
}

// This function is for simple GET request i want to send for Gemini----
// async function getGemini() {
//   const response = await fetch("/api/gemini");
//   const data = await response.json();
//   document.getElementById("geminiOutput").innerText = data.reply;
// }

// This function is for POST request where a user asks the question--- (This is for text-to-text)
// for this function use indexDemo.html
async function getGemini() {
  const userQuestion = document.getElementById("geminiInput").value;

  if(!userQuestion.trim()){
    document.getElementById("geminiOutput").innerText = "⚠️ Please enter a question first.";
    return;
  }

  try {
    const res = await fetch("/api/gemini",{
      method: "POST",
      headers: {"Content-type":"application/json"},
      body: JSON.stringify({question: userQuestion})
    });

    // here we have our result
    const data = await res.json();
    document.getElementById("geminiOutput").innerText = data.answer;
  } catch (error) {
    console.error("Error calling Gemini API:", err);
    document.getElementById("geminiOutput").innerText = "❌ Error calling Gemini API.";
  }
}

// This is the step-1 of our sending voice from fronted to the backend
function startListening(){
  // first we check if browser supports speechRecognition
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
  // real time when bot speaking it notices
  const synth = window.speechSynthesis;

  if(!speechRecognition){
    alert("Your browser does not support speech recognition.");
    return;
  }

  const recognition = new SpeechRecognition(); // This creates a new speech recognition object using the Web Speech API.
  recognition.lang = "en-US";  // choosing English talking ("hi-IN") for hindi
  recognition.interimResults = false; // With interim results false (your setting) → you only get the final clean text once you stop speaking.
  recognition.maxAlternatives = 1; // how many guesses you want, (like we said "recognition" or "recondition").

  recognition.start();

  recognition.onstart = () => {
    // Stop Gemini if it's speaking when user starts
  if (synth.speaking) {
    synth.cancel();
  }
  document.getElementById("voiceInput").innerText = "Listening...";
  }

  recognition.onspeechend = () => {
    recognition.stop();
  }

  // When the speech recognition engine finishes detecting speech and produces text, it will trigger (fire) an onresult event.
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("voiceInput").innerText = "You said.." + transcript;

    // now we will send this transcript to our gemini API
    getGeminiListen(transcript);
  }

  recognition.onerror = (event) => {
    document.getElementById("voiceInput").innerText = "Error..." + event.error;
  }
}

// By this function we are hitting our gemini API using our voiced question
async function getGeminiListen(askQuestion) {
  if(!askQuestion.trim()){
    //document.getElementById("geminiOutput").innerText = "⚠️ Please enter a question first.";
    alert("⚠️ Please enter a question first.");
    return;
  }

  try {
    const res = await fetch("/api/gemini",{
      method: "POST",
      headers: {"Content-type":"application/json"},
      body: JSON.stringify({question: askQuestion})
    });

    // here we have our result
    const data = await res.json();
    const answer = data.answer;
    //document.getElementById("geminiOutput").innerText = "Gemini says..."+answer;

    // here we allow gemini to speak
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = "en-US";
    utterance.rate = 1; // Speed (1 = normal)
    utterance.pitch = 1; // voice pitch
    speechSynthesis.speak(utterance);

  } catch (error) {
    console.error("Error calling Gemini API:", err);
    //document.getElementById("geminiOutput").innerText = "❌ Error calling Gemini API.";
    alert("❌ Error calling Gemini API.");
  }

}

