const qrcode = require('qrcode-terminal')
const {Client} = require('whatsapp-web.js')
const request = require('request')

const baseUrl = "http://api.weatherapi.com/v1/current.json?key=04d9a2b9228442e4aeb52326210209&q="

const puppeteerOptions = {
    headless: true,
    args: ['--no-sandbox'],
}

const client = new Client({
    pupeteer: puppeteerOptions,
})

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
})

client.on('ready', () =>{
    console.log('Client is ready!')
})

function getAllMethods(obj){
return Object.keys(obj)
                .filter((key) => typeof obj[key] === 'function')
                .map((key) => obj[key]);
}

client.on('message', (message) =>{
    const messageBody = message.body
    if(messageBody.startsWith('!')){
        let query = messageBody.slice(1);
        let list = query.split(" ");
        if(list[0] == "weather"){
            console.log("Weather..")
            let options = {
            'method': 'GET',
            'url': baseUrl + list[1],
            };
            let id;
            request(options, function (error, response) {
            try{
                if (error) throw new Error(error);
                id = JSON.parse(response.body)
                console.log(id);
                let repl = "Location: " + id['location']['name'] +', ' + id['location']['region'] + "\nTime: " + id['location']['localtime'] + "\nTemperature: " + id.current.temp_c + "°C /" + id.current.temp_f + "°F\n" + id['current']['condition'].text
                message.reply(repl);
            }
            catch(err){
                message.reply('Please enter a valid location');
            }
            });
        }
        if(list[0] == "search"){
            console.log("Searching...");
            try{
                let request = require('request');
                let search_string = "";
                for(let i = 1; i<list.length; i++){
                    search_string += list[i] + " ";
                }
                let options = {
                  'method': 'GET',
                  'url': 'https://api.duckduckgo.com/?q='+search_string+'&format=json',
                };
                let id;
                request(options, function (error, response){
                    try{
                        id = JSON.parse(response.body);
                        if(id['Abstract'] == ""){
                            id['Abstract'] = id["RelatedTopics"][0]["Text"];
                        }
                        let msg = id["Heading"] +"\n\n" + id["Abstract"];
                        console.log(msg);
                        message.reply(msg);
                    }catch(err){
                        message.reply("No results found");
                    }
                   
                });
            }catch(err){
                message.reply("No results found");
            }
            
        }
    }    
})
client.initialize()
