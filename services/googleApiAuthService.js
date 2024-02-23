const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis')


//define scope
const SCOPE = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];


//fetch and store token
const TOKEN_PATH = path.join(process.cwd(),'./credentials/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(),'./credentials/credentials.json')


//read previously authorized credentails from saved file
async function LoadSavedCredentials(){
    try{
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch(err){
        return null;
    }
}


async function saveCredentials(client){
    try{
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.web || keys.installed;
        const payload = JSON.stringify({
            type:'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });

        await fs.writeFile(TOKEN_PATH, payload);    
    } catch(err){
        return null;
    }
}

async function authorize(){
    let client = await LoadSavedCredentials();
    if(client){
        return client;
    }   

    client = await authenticate({
        scopes: SCOPE,
        keyfilePath: CREDENTIALS_PATH
    });

    if(client.credentials){
        await saveCredentials(client);
    }
    return client;
}


authorize().catch(console.error);



module.exports = authorize