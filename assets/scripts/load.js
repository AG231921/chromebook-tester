navigator.wakeLock.request("screen");

let script1 = document.createElement("script");
script1.src = "https://cdn.socket.io/4.5.2/socket.io.js";
let script2 = document.createElement("script");
script2.src = "/assets/scripts/detect.min.js";
let script3 = document.createElement("script");
script3.src = "/assets/scripts/script.js";

//document.body.append(script1);
document.body.append(script2);
document.body.append(script3);
//script1.onload = () => {
//};

window.hideElem = async (element) => {
  element.classList.add("display");
  if(element.classList.contains("visible")) {
    element.classList.remove("visible");
  }
  //element.scrollTo({top:0, left:0, behavior: 'smooth'});
  setTimeout(() => element.classList.add("hidden"), 1000);
}

window.showElem = async (element) => {
  element.classList.add("visible");
  if(element.classList.contains("hidden")) {
    element.classList.remove("display");
  }
  //element.scrollTo({top:0, left:0, behavior: 'smooth'});
  setTimeout(() => element.classList.remove("hidden"), 1000)
}