var player,
  device_type,
  localStream,
  ua = detect.parse(navigator.userAgent),
  battery_elem = document.getElementById("battery_percent"),
  cpu = document.getElementById("cpu_cores"),
  mem = document.getElementById("device_mem"),
  online = document.getElementById("online_stat"),
  sys = document.getElementById("operating_sys");

//window.onload(()=> {
  default_run();
//})

window.addEventListener("online", checkInternet);
window.addEventListener("offline", checkInternet);

//var target = document.getElementById("target");

//const socket = io();
const test_btns = document.getElementsByClassName("btn");
const speaker_btns = document.getElementsByClassName("speaker-btn");

/*Speaker Audio*/

let leftAud = new Audio("https://www.htsdl.com/soundCheck/leftSpeaker.mp3");
let midAud = new Audio("https://www.htsdl.com/soundCheck/centerChannel.mp3");
let rightAud = new Audio("https://www.htsdl.com/soundCheck/rightSpeaker.mp3");

Array.from(test_btns).forEach((button) => {
  button.addEventListener("click", async () => {
    if (button.dataset.test == "camera") {
      await loadLocalVid();
    } else if (button.dataset.test == "keyboard") {
      document.getElementById("fullKeyboard").focus();
    } else if (button.dataset.test == "microphone") {
      testMic();
    } else if (button.dataset.test == "speaker") {
      button.disabled = true;
      setTimeout(()=>{
        button.disabled = false;
      }, 7000)
      testAudio(leftAud, midAud, rightAud);
    }
  });
});

Array.from(speaker_btns).forEach((button) => {
  button.addEventListener("click", async ()=>{
    if(button.dataset.speaker == "left") {
      leftAud.setPosition = 0;
      leftAud.play();
    }
    else if(button.dataset.speaker == "middle"){
      midAud.setPosition = 0;
      midAud.play();
    }
    else if(button.dataset.speaker == "right") {
      rightAud.setPosition = 0;
      rightAud.play();
    }
  } )
})

async function loadLocalVid() {
  try {
    console.log("starting local video");
    // Ask the user for permission to user camera/microphone
    localStream = await navigator.mediaDevices.getUserMedia({
      // # { width: { exact: 320 }, height: { exact: 240 } }
      // { echoCancellation: true }
      video: true,
      audio: false,
    });

    //const display_media = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
    //const user_audio = await navigator.mediaDevices.getUserMedia({audio: true});
    //localStream = await getScreenshareWithMicrophone();

    let localVideoEl = document.getElementById("localVideo");
    window.stream = localStream;
    // Set the source of the el to our local video stream
    console.log("Src Object Supported");
    //localVideoEl.removeAttribute("width");
    //localVideoEl.removeAttribute("height");
    localVideoEl.srcObject = localStream;
    // Avoid using this in new browsers
    localVideoEl.onloadedmetadata = function (e) {
      localVideoEl.play();
    };
  } catch (e) {
    console.log("Camera Error: " + e);
  }
}

// Press any key and the result will display on the page.
document.getElementById("fullKeyboard").addEventListener(
  "keydown",
  function (event) {
    event.preventDefault();
    //alert(e.code);
    console.log(event.code);
    greenKey(event.code);
  },
  true
);

document.getElementById("fullKeyboard").addEventListener(
  "keyup",
  function (event) {
    event.preventDefault();
    //alert(e.code);
    //console.log(e.code)
    if (document.getElementById(event.code).classList.contains("active")) {
      document.getElementById(event.code).classList.remove("active");
    }
  },
  true
);

let promise;

async function getBattery() {
  if ('getBattery' in navigator || ('battery' in navigator && 'Promise' in window)) {
  await navigator.getBattery().then(function (battery) {
    let bat_charging = battery.charging ? "charging" : "discharging";
    let bat_level = battery.level;

    battery.addEventListener("chargingchange", onChargingChange);
    battery.addEventListener("levelchange", onLevelChange);
    promise = Math.round(bat_level * 100) + "% " + bat_charging;
    battery_elem.innerText = promise;
    //return promise;
  }).catch(function(err) {
    console.log(err)
  });
}
}

function onChargingChange() {
  let bat_charging = this.charging ? "charging" : "discharging";
  let state_change = (battery_elem.innerText.split(" ")[1] = bat_charging);
  battery_elem.innerText =
    battery_elem.innerText.split(" ")[0] + " " + state_change;
  //handleChange('Battery charging changed to ' + (this.charging ? 'charging' : 'discharging') + '')
}
function onLevelChange() {
  let new_level = this.level;
  let previous = new_level + 1;
  battery_elem.innerText.replace(previous, new_level);
}

function greenKey(keyChanged) {
  //For ChromeBooks with the weird search button:
  if (keyChanged == "MetaLeft") {
    keyChanged = "CapsLock";
  }
  //if(nextID !== undefined){
  //playAudio();
  document.getElementById(keyChanged).classList.add("active");
  document.getElementById(keyChanged).style.backgroundColor =
    "var(--default-color)";
  //}
}

function testAudio(a, b, c) {
  a.play();
  setTimeout(() => {
    a.pause();
    b.play();

    setTimeout(() => {
      b.pause();
      c.play();
      setTimeout(() => {
        c.pause();
      }, 2300);
    }, 2400);
  }, 2300);
}

function checkInternet(a) {
  if (a == "function") {
    if (navigator.onLine == true) {
      return "🟢 Operational";
    } else {
      return "🔴 Down";
    }
  } else {
    let state = navigator.onLine ? 'online' : 'offline';
    if (state == "online") {
      online.innerText = "🟢 Operational";
    } else if (state == "offline") {
      online.innerText = "🔴 Down";
    }
  }
}

async function default_run() {
  //battery_elem.innerText = await getBattery();
  await getBattery()
  cpu.innerText = navigator.hardwareConcurrency + " Cores";
  mem.innerText = navigator.deviceMemory + " GB of RAM";
  online.innerText = await checkInternet("function");
  sys.innerText = ua.browser.version;
}

/*audio below*/

var volumeVisualizer, audioContext, audioSource, analyser, averageVolume, volumes;

async function testMic() {
  let volumeCallback = null;
  let volumeInterval = null;
  volumeVisualizer = document.getElementById("volume-visualizer");
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
      },
    });
    audioContext = new AudioContext();
    audioSource = audioContext.createMediaStreamSource(audioStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.minDecibels = -110;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;
    audioSource.connect(analyser);
    volumes = new Uint8Array(analyser.frequencyBinCount);
    volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);
      let volumeSum = 0;
      for (const volume of volumes) volumeSum += volume;
      averageVolume = volumeSum / volumes.length;
      volumeVisualizer.style.setProperty(
        "--volume",
        (averageVolume * 100) / volumes.length + "%"
      );
      var taxi;
      taxi = document.getElementById("mic_result");
      taxi.innerText = "Result: Your Microphone is Working! 😇";
    };
    if (volumeCallback !== null && volumeInterval === null) {
            volumeInterval = setInterval(volumeCallback, 100);
    }
  } catch (e) {
    console.error(
      "Failed to initialize volume visualizer, simulating instead...",
      e
    );
    let lastVolume = 50;
    volumeCallback = () => {
      const volume = Math.min(
        Math.max(Math.random() * 100, 0.8 * lastVolume),
        1.2 * lastVolume
      );
      lastVolume = volume;
      volumeVisualizer.style.setProperty("--volume", volume + "%");
      var taxi;
      taxi = document.getElementById("mic_result");
      taxi.innerText = "Result: Microphone is not working! ❌";
    };
  }
}


//Sidemenu Animation & element

var sidemenu_items = document.getElementsByClassName("item");

Array.from(sidemenu_items).forEach(function(item) {
  item.addEventListener("click", function() {
    let i = 0,
        elem = item.href.split("#")[1],
        current_visible_elem = document.getElementsByClassName("visible")[0];

    for(i=0; i < sidemenu_items.length; i++) {
      sidemenu_items[i].classList.remove("selected");
    }
    if(document.getElementById(elem) !== null) {
      if(elem !== current_visible_elem.id) {
        let new_visible_elem = document.getElementById(elem);
        window.hideElem(current_visible_elem);
        window.scrollTo(0,0);
        window.showElem(new_visible_elem);
        window.scrollTo(0,0);
      }
    }
    //document.getElementById(elem).focus();
    item.classList.toggle("selected");
  })
})



/* Barcode Scanner Function + Enabler & Disabler */

var barcode = "";
var bc_interval;
var bc_btn = document.getElementById("bc_btn");

//document.addEventListener("keydown", handleBarcode, false);

bc_btn.addEventListener("click", function(evt) {
  if(bc_btn.classList.contains("clicked")) {
    bc_btn.classList.remove("clicked");
    //document.removeEventListener("keydown", handleBarcode, false);
    document.removeEventListener("scan", printBarcode);
  } else {
    br_gen_func();
    bc_btn.classList.add("clicked");
    document.addEventListener("scan", printBarcode);
    //document.addEventListener("keydown", handleBarcode, false);
  }
})

var br_gen_func = (function() {
  var executed = false;
  return function() {
      if (!executed) {
          executed = true;
          let br_gen_script = document.createElement("script");
          br_gen_script.src = "/assets/scripts/jsbarcode.js";
          document.body.append(br_gen_script);
          br_gen_script.onload = function() {
          JsBarcode("#barcode", "Sample Barcode", {
            displayValue: false,
            background: "var(--section-color)",
            lineColor: "var(--text-color)",
          });
          let onscan_script = document.createElement("script");
          onscan_script.src = "/assets/scripts/onscan.min.js";
          document.body.append(onscan_script)
          onscan_script.onload = function() {
            onScan.attachTo(document);
            document.addEventListener("scan", printBarcode);
          }
       }
    }
  };
})();

function printBarcode(scanned_barcode, iQuantity) {
  let code = scanned_barcode.detail.scanCode;
  let boxes = ["A19611","A18078","A14630","LD00514","A19117","A19584","LD00020","A19947","LD01213","A14701","A14585","A19314","A20086","A20021","A15445","LD00909","A19990","A19162","A14818","LD00184","LD00364","A20074","A17007","A19056","A20080","A19706","A19326","LD00973","A14515","A19414","A14317","A14362","LD00433","A14597","A14401"];
  let serial_tags = ["7QG4TQ3","JVN24D3","JBZTN53","27NG7Y2","6YZ3TQ3","4L06TQ3","BY6K7Y2","414F6Y2","45N7TQ3","5PC9TQ3","1FHT0Z2","F0Y0043","76HWZ33","B3K8TQ3","GVF9TQ3","HFFFTQ3","2YWXN53","C0FG6Y2","3SX6TQ3","2ZWDTQ3","8X4ZZ33","6R7G6Y2","2NNG7Y2","3TG7TQ3","73PSN53","JGQ8TQ3","8HC8TQ3","DZCHTQ3","8BC8TQ3","B7BP7Y2","BDMZZ33","D09RTQ3","1NF1P53","J6HZN53","DFJN7Y2","D381P53","BSKH7Y2","6JRX8D3","88MGTQ3","2LMS8D3","47LVZ33"];
  if(boxes.includes(code) == true) {
    let in_the_box = new Audio("/assets/gui/inboxes.mp3");
    in_the_box.play();
  } else if(serial_tags.includes(code)) {
    let in_the_box = new Audio("/assets/gui/inboxes.mp3");
    in_the_box.play();
  }

    /* 
  
    https://shancarter.github.io/mr-data-converter/

    https://codepen.io/pen
 
    let str = '';
    str = str.replaceAll("],[", ",");
    str = str.replace("[[", "[");
    str = str.replaceAll("-", "");
    str = str.replace("]]", "]");
    document.body.innerText = str;


    */
  navigator.clipboard.writeText(code);
  JsBarcode("#barcode", scanned_barcode, {
    displayValue: false,
    background: "var(--section-color)",
    lineColor: "var(--text-color)",
  });
  console.log(scanned_barcode)
  console.log(JSON.stringify(scanned_barcode))
	document.getElementById("last-barcode").innerText = code;
}

function handleBarcode(evt) {
	if (bc_interval) clearInterval(bc_interval);
	if (evt.code == "Enter") {
		if (barcode) printBarcode(barcode);
		barcode = "";
		return;
	}
	if (evt.key != "Shift") barcode += evt.key;
	bc_interval = setInterval(() => (barcode = ""), 20);
}


/* Email Directory Code */