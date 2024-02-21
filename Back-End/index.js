
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const polly = new PollyClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: "YOU ACCESS KEY ID HERE",
        secretAccessKey: "YOUR SECRET ACCESS KEY HERE",
    },
});

const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: "YOUR OPENAI API KEY HERE"
})



app.use(bodyParser.json());
app.use(cors());

app.post('/api/text-to-audio-file', async (req, res) => {
   try {
    const conversation = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": req.body.text || "Hello!" }
    ];
    
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversation,
    });
    
    let num = (Math.random() * 10000).toFixed(0);

    
    const params = {
        OutputFormat: "mp3",
        Text: completion.choices[0].message.content,
        VoiceId: "Joanna"
    };

    const data = await polly.send(new SynthesizeSpeechCommand(params));

    
    const filePath = "../public/voice/";
    const fileName = num + ".mp3";

   // Convert the IncomingMessage to a Buffer
   const buffers = [];
   data.AudioStream.on('data', chunk => buffers.push(chunk));
   data.AudioStream.on('end', () => {
       const buffer = Buffer.concat(buffers);
       fs.writeFile(path.join(filePath, fileName), buffer, (writeErr) => {
           if (writeErr) {
               console.error(writeErr);
               res.status(500).json({ error: "Error writing audio file" });
               return;
           }

           res.status(200).json(num);
       });
   });
} catch (error) {
   console.error("Error processing request:", error);
   res.status(500).json({ error: "Internal Server Error" });
}
});

app.listen(4001, () => {
console.log(`Server is ready at http://localhost:4001`);
});