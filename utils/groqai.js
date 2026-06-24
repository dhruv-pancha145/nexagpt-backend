import "dotenv/config";


// we test the api end point with use this code
const getGroqAPIResponse = async(message) => {
 const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
          "model": "llama-3.3-70b-versatile",
          "messages" : [{
          role:"user",
          content: message
          }]
    })
  };

  try {
 const responce = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
 const data = await responce.json();
//  console.log(data);
 return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
  }
}

export default getGroqAPIResponse;