const express = require("express");
const app = express();
var http = require("http").createServer(app);
var port = process.env.PORT || 3000;
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
var req = require("request");
//const editJsonFile = require("edit-json-file");
const shrinkRay = require("shrink-ray-current");
const { instrument } = require("@socket.io/admin-ui");
instrument(io, {
  auth: false,
  namespaceName: "/admin"
});

var DotJson = require('dot-json');
var file = new DotJson('users.json');




app.use(shrinkRay());
app.use(express.json());

app.use("*", checkHttps);
app.use(express.static("public", {maxAge: 0}));



app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
  //response.sendFile(__dirname + "/yt.html");
});

//let file = editJsonFile(`${__dirname}/users.json`)

app.get("/web", (request, response) => {
//console.log(file.get("110985367046008285478.name"))
  //file.set('110985367046008285478.name', 'John Doe').save();
  response.send(file.get())

})

app.post("/account", (request, response) => {
  let json = request.body;
  let id = json.id;
  //let img = ()
  console.log(json)
  //if(file.get(response.body.id) === undefined) return;
  //file.set("" + id + "" + ".name", json.name)
  //file.set("" + id + "" + ".email", json.email)
  //file.set("" + id + "" + ".image", json.profile)
  //file.set("" + id + "" + ".phone", json.phone)
  //file.save()
  if(id !== "" || id !== undefined) {
  file.set(id + ".name", json.name).set(id + ".email", json.email).set(id + ".image", json.image).set(id + ".phone", json.phone).save(function(){
    console.log('saved');
  response.sendStatus(200)
});
  }
})

/*app.get("/url", async (request, response) => {
  if (request.query.q) {
    var val = request.query.q;

    console.log(request.query.q);

    let urlObject = new URL(val),
      hostname = urlObject.host,
      href = urlObject.href;
    if (hostname == "www.youtube.com") {
      const options1 = ["--username=user", "--password=hunter2"];

      /*youtubedl.getInfo(val, options1, function(err, info) {
        if (err) throw err;

        //console.log('id:', info.id)
        //console.log('title:', info.title)
        console.log("url:", info.url);
        response.status(200).send(info.url);
        
        //console.log('thumbnail:', info.thumbnail)
        //console.log('description:', info.description)
        //console.log('filename:', info._filename)
        //console.log('format id:', info.format_id)
      });

      getInfo(val, ['--format=best']).then(info => {
        // info.items[0] should contain the output of youtube-dl --dump-json
        console.log(info.items[0].url);

        response.status(200).send(info.items[0].url);
      });
    } else {
      response.status(200).send(val);
    }
    console.log(hostname);
  } else {
    response.send("url missing");
  }
});*/

app.get("/iframe", (request, response) => {
  response.sendFile(__dirname + "/views/iframe.html");
  //requested url by user for show
});

app.get("/youtube", (request, response) => {
  response.sendFile(__dirname + "/views/betaindex.html");
});

app.get("/turn", (request, response) => {
  var options = {
    method: "PUT",
    url: "https://demo.xirsys.com/webrtc/_turn",
    headers: {
      "postman-token": "90e7b0a0-f8e2-22af-a555-b6d87823c5cd",
      "cache-control": "no-cache",
    },
  };

  req(options, function (error, res, body) {
    if (error) throw new Error(error);
    response.setHeader("Content-Type", "application/json");
    response.send(body);
    //response.send(response.json(body));
  });
});

app.get("/test", (request, response) => {
  response.sendFile(__dirname + "/index.html");
  //requested url by user for show
});

app.get("/beta", (request, response) => {
  response.sendFile(__dirname + "/index.html");
  //requested url by user for show
});

function getKeyByValue(object, value) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      if (object[prop] === value) return prop;
    }
  }
}

var room, user;
var users = {};
var in_call = {};
//var members = 0;
io.on("connection", (socket) => {
  var addedUser = "false";
  /*socket.on("new-user", (name, number) => {
    if (Object.values(users).includes(number)) {
      socket.emit("taken");
    } else {
      members++;
      socket.username = name;
      addedUser = "true";
      users[name] = number;
    }
  });*/

  socket.on("new-user", async (data, device) => {
    //console.log(data);
    let user_object = Object.values(users);
    // console.log(user_object + " " + Object.keys(users).includes(data));
    if (Object.values(users).includes(data)) {
      console.log("taken but adding");
      //socket.emit("taken");
      addedUser = "true";
      let name = data.split(";")[1];
      console.log(data);
      data = data.replace(name, name + " (" + device + ")");
      console.log(data);
      users[socket.id] = data;
      socket.username = data;
      console.log("126:  " + JSON.stringify(users));
      socket.emit("socket-id", socket.id);
      //setTimeout(() => {
        socket.emit("users", users);
        socket.broadcast.emit("users", users);
      //}, 500);
    } else {
      addedUser = "true";
      users[socket.id] = data;
      socket.username = data;
      console.log("136: " + JSON.stringify(users));
      socket.emit("socket-id", socket.id);
      //setTimeout(() => {
        socket.emit("users", users);
        socket.broadcast.emit("users", users);
      //}, 500);
      //users[socket.id] = data + socket.id + ";";

      //console.log("data:   " + JSON.stringify(users));
    }
  });

  socket.on("join-room", (room_uuid) => {
    socket.join(room_uuid);
    console.log(socket.rooms);
  });

  socket.on("user", () => {
    //members++;
    socket.emit("members");
  });

  socket.on("icecandidate", (candidate) => {
    console.log(
      `Received ICE Candidate from ${socket.id}. Broadcasting to the crowd.`
    );
    socket.broadcast.emit("incoming_icecandidate", candidate);
  });

  socket.on("added-url", (data) => {
    socket.broadcast.emit("url", data);
  });

  socket.on("ytvideo-playing", () => {
    socket.broadcast.emit("user-ytvideo-playing");
  });

  socket.on("ytvideo-paused", () => {
    socket.broadcast.emit("user-ytvideo-paused");
  });
  //socket.to("room").emit(data)

  socket.on("socket-offer", (id, name, profile, my_id) => {
    socket.broadcast.to(id).emit("socket-offer", name, profile, my_id);
  });

  socket.on("socket-answer", (user, room) => {
    socket.broadcast.to(user).emit("socket-answer", room);
  });

  socket.on("offer", (offer) => {
    console.log("Broadcasting offer");
    socket.broadcast.emit("offer", offer);
  });

  socket.on("data", (data) => {
    socket.broadcast.emit("data", data);
  });

  socket.on("answer", (answer) => {
    console.log("Broadcasting answer");
    socket.broadcast.emit("answer", answer);
  });

  socket.on("answer-offer", (answer) => {
    console.log("Broadcasting answer");
    socket.broadcast.emit("answer-offer", answer);
  });

  socket.on("answer-again", (answer) => {
    console.log("Broadcasting answer");
    socket.broadcast.emit("answer-again", answer);
  });

  socket.on("decline", () => {
    console.log("Broadcasting decline");
    socket.broadcast.emit("declined");
  });

  socket.on("hangup", () => {
    console.log("Broadcasting hangup");
    socket.broadcast.emit("hangup");
  });

  socket.on("disconnect", () => {
    //console.log(users[socket.id]);
    if (addedUser !== "false") {
      //    members--;
      addedUser = "false";
      delete users[socket.id];
      socket.broadcast.emit("users", users);
    } else {
      console.log("user does not exist");
    }
  });
});
http.listen(port, () => {
  console.log("listening on *:" + port);
});

function checkHttps(req, res, next) {
  if (req.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    res.redirect("https://" + req.hostname + req.url);
  }
}

// MOVIE AND SHOW
