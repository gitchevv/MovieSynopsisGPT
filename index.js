
import { process } from "./env"
import { Configuration, OpenAIApi } from "openai"

const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)


document.getElementById("send-btn").addEventListener("click", () => {
const setupTextarea = document.getElementById('setup-textarea') 

  if (setupTextarea.value) {
    const userInput = setupTextarea.value;

    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchBotSynopsis(userInput)
    
  }
})

async function fetchBotReply(outline){
  const response =  await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Mention how exciting ${outline} is as a movie idea. Use maximum of 30 words.`,
    max_tokens: 230
  }); 
  // console.log(response)
  movieBossText.innerText = response.data.choices[0].text.trim()
  setupInputContainer.innerHTML = ""
}

async function fetchBotSynopsis(outline){
  
  const response =  await openai.createCompletion({
    model: "text-davinci-003",
    prompt: ` Generate a movie synopsis from outline, similar to the example. Include an actor for each character, think about who would fit best. Separate with paragraphs. 
    ###
    outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. 
    When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). 
    But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, 
    Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, 
    but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, 
    Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    outline: ${outline}
    synopsis: 
    `,
    max_tokens: 230
  }); 
  // console.log(response)
  const synopsis = response.data.choices[0].text.trim()
  // document.getElementById('output-container').style.display = 'block'
  document.getElementById('output-text').style.display = 'block';
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  fetchCast(synopsis)
}

async function fetchTitle(synopsis) {
  const response =  await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a short movie title based on ${synopsis}`,
    temperature: 0.1
  }); 

  const title = response.data.choices[0].text
  document.getElementById('output-title').style.display = 'block'
  document.getElementById('output-title').innerText = title

  fetchImagePrompt(title, synopsis)
}

async function fetchCast(synopsis) {

  const response =  await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Give me the names of the actors from the synopsis
    ###
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. 
    When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). 
    But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, 
    Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, 
    but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, 
    Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    names: Tom Cruise, Kelly McGillis, Val Kilmer
    ###
    synopsis: ${synopsis}
    names: 
    `,
    max_tokens: 50
  }); 

  document.getElementById('output-stars').style.display = '';
  document.getElementById('output-stars').innerText = response.data.choices[0].text

}

async function fetchImagePrompt(title, synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Write an image prompt that will be used for DALLE, based on movie title and synopsis. Compose the prompt so there is no text in the image. Include faces.
    ###
    title: Love's Time Warp

    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. 
    As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). 
    With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. 
    But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.

    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. 
    In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. 
    A semi-transparent image of war is super-imposed over the scene.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    max_tokens: 100,
    temperature: 0.1,
  })

  const imgPrompt = response.data.choices[0].text;
  console.log(imgPrompt)
  fetchImageURL(imgPrompt)
} 

async function fetchImageURL(imgPrompt) {
  const response = await openai.createImage({
    prompt: imgPrompt,
    n: 1,
    size: "256x256",
  });
  
  // console.log(response)
  const url = response.data.data[0].url
  document.getElementById('output-img-container').innerHTML = `<img src="${url}">`



  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}


