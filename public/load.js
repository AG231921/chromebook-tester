navigator.wakeLock.request("screen");

let script1 = document.createElement("script");
script1.src = "https://cdn.socket.io/4.5.1/socket.io.js";
let script2 = document.createElement("script");
script2.src = "/detect.min.js";
let script3 = document.createElement("script");
script3.src = "/script.js";

document.body.append(script1);
document.body.append(script2);
script1.onload = () => {
  document.body.append(script3);
};
