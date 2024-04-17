import express from "express";
import bodyParser from "body-parser";
import mqtt from "mqtt";
import fs from "fs-extra";

//import { dirname } from "path";
//import { fileURLToPath } from "url";

//const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
let status;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

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

  const client = mqtt.connect(host, options);

  client.on("connect", function () {
    console.log("Client connected");
    status = "Connected";
    res.redirect("/");
  });
}

function disconnectFromBroker(req, res, next) {
  res.redirect("/");
}

app.get("/", (req, res) => {
  res.render("index.ejs", { connectionStatus: status });
});

app.post("/connect", connectToBroker);

// Handle disconnect request
app.post("/disconnect", disconnectFromBroker);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
