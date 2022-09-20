var player,
  device_type,
  localStream,
  ua = detect.parse(navigator.userAgent),
  battery_elem = document.getElementById("battery_percent"),
  cpu = document.getElementById("cpu_cores"),
  mem = document.getElementById("device_mem"),
  online = document.getElementById("online_stat"),
  sys = document.getElementById("operating_sys");

default_run();

window.addEventListener("online", checkInternet);
window.addEventListener("offline", checkInternet);

//var target = document.getElementById("target");

const socket = io();
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
  if (a) {
    if (navigator.onLine == true) {
      return "🟢 Operational";
    } else if (navigator.onLine !== true) {
      return "🔴 Down";
    }
  } else {
    if (navigator.onLine == true) {
      online.innerText = "🟢 Operational";
    } else if (navigator.onLine !== true) {
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


//Sidemenu Animation

var sidemenu_items = document.getElementsByClassName("item");

Array.from(sidemenu_items).forEach(function(item) {
  item.addEventListener("click", function() {
    for(let i=0; i < sidemenu_items.length; i++) {
      sidemenu_items[i].classList.remove("selected");
    }
    item.classList.toggle("selected");
  })
})