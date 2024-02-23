const authorize = require('../Reminder_On_Email/services/googleApiAuthService')
const {listOfLabels, sendEmail} = require('../Reminder_On_Email/services/gmailApiServices')



async function test(){
    let auth = await authorize().then().catch(console.error);
    await listOfLabels(auth).then().catch(console.error);

    let msg = 'TO: jety2218@gmail.com\n'+'Subject: Test Email\n'+'Content-Type: text/html; charset = utf-8\n\n' + 'Hello World!';

    await sendEmail(auth,msg)
}


test().catch(console.error);