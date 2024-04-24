import express from "express";
import bodyParser from "body-parser";
import mqtt from "mqtt";
import fs from "fs-extra";
import session from "express-session";

//import { dirname } from "path";
//import { fileURLToPath } from "url";

//const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
let client = null;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "7iowlq3289@#8#*(!", // random string
    resave: false,
    saveUninitialized: true,
  })
);

function connectToBroker(req, res, next) {
  const host = "wss://" + req.body["host"];
  const port = req.body["port"];
  const userID = req.body["username"];
  const passwordID = req.body["password"];

  var options = {
    host: host,
    schema: "wss://",
    path: "/mqtt",
    port: port,
    protocolId: "MQTT",
    protocolVersion: 4,
    username: userID,
    password: passwordID,
  };

  client = mqtt.connect(host, options);

  client.on("connect", function () {
    console.log("Client connected");
    req.session.connectionStatus = "Connected"; // Store connection status in session
    res.redirect("/");
  });
}

function disconnectFromBroker(req, res, next) {
  console.log("diconnecting...");
  setTimeout(function () {
    client.end();
    console.log(
      "Client with ID: " + client.options.clientId + ", is disconnected"
    );
  }, 100); // stop after 0.001sec
  res.redirect("/");
}

app.get("/", (req, res) => {
  res.render("index.ejs", {
    connectionStatus: req.session.connectionStatus || "Disconnected",
  });
});

app.post("/connect", connectToBroker);

// Handle disconnect request
app.post("/disconnect", (req, res) => {
  disconnectFromBroker(req, res); // Call the disconnect function
});

app.post("/subscribe", (req, res) => {});

app.post("/publish", (req, res) => {
  const topic_publisher = req.body["topic-publisher"];
  const message_publisher = req.body["message-publisher"];

  // Retrieve connectionStatus from session
  const connectionStatus = req.session.connectionStatus || "Disconnected";

  client.publish(topic_publisher, message_publisher);

  const publisher =
    "Published to topic " +
    topic_publisher +
    " ,the message: " +
    message_publisher;

  res.render("index.ejs", { publisherData: publisher, connectionStatus });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
