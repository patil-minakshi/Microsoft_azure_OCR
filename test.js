 
const { ImageAnalysisClient , KeyCredential } = require ('@azure-rest/ai-vision-image-analysis');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');
 
 
 
const fs = require('fs');
 
const Destination = '././PS1-TR-Data/output.txt/'

require('dotenv').config()

const endpoint = process.env.VISION_ENDPOINT
const key = process.env.VISION_KEY
const credential = new AzureKeyCredential(key);
//const  allFiles = []

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
const Folderpath = './PS1-TR-Data/images/';
const GroundtruthPath = './PS1-TR-Data/groundtruth/'

async function analyzeImageFromFile(Imagepath) {

     try{
        const Readed = fs.readFileSync(Imagepath)
         const result = await client.path('/imageanalysis:analyze').post({
    body: Readed,
    queryParameters: {
      features: feature,
      language: language,
      'smartcrops-aspect-ratios' : ratio
    },
    contentType: 'application/octet-stream'
  });
  return result.body
     }
     catch (err){
        console.log(err);

     }
    

}

async function CompareString (){
   
 for (let i = 0; i< 100; i++) {
  const Truthpath  = `${GroundtruthPath}${i}.txt`
  const Imagepath = `${Folderpath}${i}.jpg`
  const result = await analyzeImageFromFile(Imagepath)
  if(result.readResult){
    result.readResult.blocks.forEach(block => {
        const Result = fs.readFileSync(Truthpath , 'utf-8').trim()
        const TextfromImage = block.lines[0].text.replace(/\s/g, '')  // UTF12458
        if(TextfromImage  != Result){

            fs.appendFile(Destination , `${Result} and ${TextfromImage} are not same`  + '\n' ,(err)=>{
                if(err){
                    console.log("error appending file" ,err);
                } else{
                    console.log("apended wrong file");
                }
            })
        } else{
            fs.appendFile(Destination , `${Result} and ${TextfromImage} are same` + '\n'  ,(err) => {
                if(err){
                    console.log("error appending file" ,err);
                } else{
                    console.log("apended right file");
                }
            })
        }

    });
  } else{
    const massage = "cannot read this file"
    fs.appendFile(Destination , massage + '\n' , (err)=>{
        if(err){
            console.log("error appending file" ,err);
        }else{
            console.log("done");
        }
    } )
    console.log("no such a response found");
  }
//   const ImageResult = await analyzeImageFromFile(Imagepath)
//   if(ImageResult.readResult){
//     ImageResult.readResult.blocks.forEach(block => {
         
//         const truthBuffer = fs.readFileSync(Truthpath); // 0.txt
//         const Stringtruth = truthBuffer.toString().trim()
//         if(Stringtruth === `${block.lines[0].text}`){
//             console.log(`${truthBuffer} ,${block.lines[0].text}`);
//         }else{
//             console.log("no file found");
//         }
//     })
//   }
}
}
CompareString()
 
