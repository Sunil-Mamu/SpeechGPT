<script setup>
import { ref } from 'vue'
import { useAVLine } from 'vue-audio-visual'
import axios from 'axios'

const player = ref(null)
const canvas = ref(null)
let mySource = ref(null)
let action = ref('')
let output = ref('')


useAVLine(player, canvas, {
  src: mySource,
  canvHeight: 300,
  canvwWidth: 1000,
  barColor: 'green'
})  

const runSpeechRecognition = () => { 
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    recognition.onstart = () => {
        action.value = "Listening, please ask your question..."
    };

    recognition.onspeechend = () => {
        action.value = "stopped listening...";
        recognition.stop();
    }

    recognition.onresult = async (event) => {
        var transcript = event.results[0][0].transcript;
          output.value = transcript
    
        try {
            let res = await axios.post('http://localhost:4001/api/text-to-audio-file', {
                  text: event.results[0][0].transcript
            })
            if (res.data) {
                mySource.value = '/voice/' + res.data + '.mp3'
                setTimeout(() => { player.value.play() }, 500)
            }
        } catch (err) {
            console.log(err)
        }
    };

    recognition.start();

}
    </script>

<template>
<div class="btn-section">
    <button type="button"   @click="runSpeechRecognition()">Ask question</button>
</div>
<div class = "display-section">
    <div class="action" v-if="action">{{  action }}</div>
    <div class="output"  v-if="output"> <b>Question</b>: {{ output }}</div>

</div>
<div>
    <audio id="player" ref="player" :src="mySource" type="audio/mpeg" controls hidden></audio>
    <canvas ref="canvas" width="1000" height="300"></canvas>
</div>
</template>

<style >
body{
    background-color: #000;
}
canvas{
    display: block;
    margin: 0 auto;
    border: 1px solid #000;
    margin-top: 20px;
}
.btn-section{
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
button{
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    margin: 10px;
}
.display-section{
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
.action {
    font-size: 20px;
    color: #4CAF50;
    margin: 10px;
}
.output {
    font-size: 20px;
    color: #4CAF50;
    margin: 10px;
}
</style>
