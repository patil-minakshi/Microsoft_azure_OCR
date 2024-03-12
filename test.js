 

const fs = require('fs');
const { ImageAnalysisClient , KeyCredential } = require ('@azure-rest/ai-vision-image-analysis');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');


 
require('dotenv').config()

const predicted =     'TR13X3008'

const endpoint = process.env['VISION_ENDPOINT'] || '<your_endpoint>';
const key = process.env['VISION_KEY'] || '<your_key>';
const credential = new AzureKeyCredential(key);



const destinationFIle = './PS1-TR-Data/output.txt/'

const client = createClient (endpoint, credential);

const feature = [
  'Caption',
  'DenseCaptions',
  'Objects',
  'People',
  'Read',
  'SmartCrops',
  'Tags'
];
const ratio = [0.9, 1.33];

const language = 'en'
const imagePath = './PS1-TR-Data/images/27.jpg';

async function analyzeImageFromFile() {
  const imageBuffer = fs.readFileSync(imagePath);

  const result = await client.path('/imageanalysis:analyze').post({
    body: imageBuffer,
    queryParameters: {
      features: feature,
      language: language,
      'smartcrops-aspect-ratios' : ratio
    },
    contentType: 'application/octet-stream'
  });

  const iaResult = result.body;


  if (iaResult.captionResult) {
    console.log(`Caption: ${iaResult.captionResult.text} (confidence: ${iaResult.captionResult.confidence})`);
  }
  if (iaResult.readResult) {
    iaResult.readResult.blocks.forEach(block => {
      if(block.lines[0].text.split(' ').join('') != predicted){
        const InCorrect = `${block.lines[0].text} , ${predicted } are not correct`
        fs.appendFile(destinationFIle , InCorrect + '\n' , (err)=>{
          if(err){
            console.log(err);
          }
          else{
            console.log("Non correct file send");
          }
          
        }) 
        // console.log(` ${block.lines[0].text} and ${predicted} are correct`);
      } else{
        const correct = `${block.lines[0].text} , ${predicted } are correct`
        fs.appendFile(destinationFIle , correct  +  '\n' ,  (err) =>{
          if(err){
            console.log("correct writing error"  ,err);
          }
          else{
            console.log(" correct file  send");
          }
        })
      }
    
    })    

  }
}

analyzeImageFromFile();