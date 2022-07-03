require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

const { PubSub } = require("@google-cloud/pubsub");

const projectId = process.env.GOOGLE_PROJECT_ID;
const keyFilename = "./private/cloud-run-500-0f9acb44eefc.json";

// Instantiates a new PubSub client
const pubSubClient = new PubSub({ projectId, keyFilename });

const subscriptionNameOrId = "buildComplete-sub";
const timeout = 60 * 60;

function listenForMessage() {
  console.log('Application running...')
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = (message) => {
    console.log(`Received message ${message.id}`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();

    // send message using Twilio client
    twilioClient.messages
      .create({
        body: "Build complete! From Impatient Dev",
        from: process.env.TWILIO_SRC_TEL,
        to: process.env.TWILIO_DST_TEL,
      })
      .then((message) => console.log(message.sid));
  };

  // Listen for new messages until timeout is hit
  subscription.on("message", messageHandler);

  // Comment this out if for continuous pull
  //   setTimeout(() => {
  //   // Turns off the subscription listener
  //     subscription.removeListener("message", messageHandler);
  //     console.log(`${messageCount} message(s) received`);
  //   }, timeout * 1000);
}

listenForMessage();
