import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import CONSTANTS from "../constant.js";

dotenv.config(); // Load .env

const router = express.Router();

// Hello API
router.get("/hello", (req, res) => {
  res.json({ message: "Hello from Node.js Backend API!" });
});

// Time API
router.get("/time", (req, res) => {
  const now = new Date();
  res.json({ currentTime: now.toString() });
});

// Setup Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is GET Request Gemini hit
// router.get("/gemini", async (req, res) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const result = await model.generateContent("What is a car!");
//     const text = result.response.text();

//     res.json({ reply: text });
//   } catch (error) {
//     console.error("Gemini API error:", error);
//     res.status(500).json({ error: "Something went wrong with Gemini API." });
//   }
// });

// This is POST Request Gemini hit.
router.post("/gemini",async (req,res) => {
  const {question} = req.body;
  
  if(!question){
    return res.status(400).json({error:"A Question is required!"});
  }

  try {
    const result = await getAnswer(question);
    let text = "";
    for(let ask in CONSTANTS.BASIC_PERSONALITY){
      console.log("ABOVE ASK:---"+ask);
      console.log("LOWER ASK:---"+question.toLowerCase().includes(ask));
      if(question.toLowerCase().includes(ask)){
        console.log("INSIDE IF:---"+ask);
        text = result;
        break;
      }
    }
    console.log("text came----:"+text);
    if(text == ""){
      console.log("text of null text:"+text);
      text = result.response.text();
    }
    
    console.log("Text--------"+text);

    // this is our result
    res.json({ answer: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to fetch Gemini response" });
  }
  
});

async function getAnswer(question){
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const lowerQuestion = question.toLowerCase();
  console.log("lowerQuestion for Now:----"+lowerQuestion);
  let result = "";
  for(let ask in CONSTANTS.BASIC_PERSONALITY){
    console.log("ask in personality:--"+ask);
    if(lowerQuestion.includes(ask)){
      console.log("ASK RESPONSE:--"+CONSTANTS.BASIC_PERSONALITY[ask]);
      CONSTANTS.USER_ASKED_Q_A.lowerQuestion = CONSTANTS.BASIC_PERSONALITY[ask];
      result = CONSTANTS.BASIC_PERSONALITY[ask];
      return result;
    }
  }
  console.log("Outside For loop:--"+lowerQuestion)
  result = await model.generateContent(lowerQuestion + ". Answer in two or three lines only, not big answers.");
  CONSTANTS.USER_ASKED_Q_A.lowerQuestion = result.response.text();
  result = await model.generateContent(CONSTANTS.USER_ASKED_Q_A.lowerQuestion + ". Read all the question given in keys and answers in values based on that give me the answer of this question: "+lowerQuestion);
  return result;
}

export default router;
