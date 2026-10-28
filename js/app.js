var $ = function(id){ return document.getElementById(id); };
var MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
var DAYS = ["سبت","أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة"];
var page = document.body.getAttribute("data-page");

/* ---------- music ---------- */
var song = $("song");
function playSong(){
  if(!song) return;
  song.volume = .8;
  var p = song.play();
  if(p && p.catch) p.catch(function(){
    var go = function(){ song.play(); ["click","touchstart","keydown"].forEach(function(e){ document.removeEventListener(e,go); }); };
    ["click","touchstart","keydown"].forEach(function(e){ document.addEventListener(e,go); });
  });
}
if($("mute")) $("mute").onclick = function(){
  if(song.paused){ song.play(); this.textContent="🔊"; } else { song.pause(); this.textContent="🔇"; }
};

/* ---------- falling / rising things ---------- */
function spawn(list, cls){
  var e = document.createElement("div");
  e.className = cls;
  e.textContent = list[Math.floor(Math.random()*list.length)];
  e.style.left = Math.random()*96 + "vw";
  e.style.fontSize = (16 + Math.random()*20) + "px";
  e.style.animationDuration = (5 + Math.random()*5) + "s";
  document.body.appendChild(e);
  setTimeout(function(){ e.remove(); }, 11000);
}
function startFalling(list, cls, every){ setInterval(function(){ spawn(list, cls); }, every); }

/* ---------- calendar ---------- */
function calendar(el, y, m, d){
  var first = (new Date(y, m-1, 1).getDay() + 1) % 7;   // week starts on Saturday
  var n = new Date(y, m, 0).getDate();
  var h = '<h3>' + MONTHS[m-1] + ' ' + y + '</h3><div class="cg">';
  DAYS.forEach(function(x){ h += '<b>' + x + '</b>'; });
  for(var i=0;i<first;i++) h += '<span></span>';
  for(var k=1;k<=n;k++) h += '<span' + (k===d ? ' class="mark"' : '') + '>' + k + '</span>';
  el.innerHTML = h + '</div>';
}

/* ---------- counter (years, months, days, h, m, s) ---------- */
function counter(el, from){
  var s = new Date(from[0], from[1]-1, from[2]);
  function tick(){
    var n = new Date(), y = n.getFullYear()-s.getFullYear(), m = n.getMonth()-s.getMonth(), d = n.getDate()-s.getDate();
    if(d < 0){ m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
    if(m < 0){ y--; m += 12; }
    var v = [[y,"سنة"],[m,"شهر"],[d,"يوم"],[n.getHours(),"ساعة"],[n.getMinutes(),"دقيقة"],[n.getSeconds(),"ثانية"]];
    el.innerHTML = v.map(function(x){ return '<div class="box"><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join("");
  }
  tick(); setInterval(tick, 1000);
}

/* ---------- photo rows ---------- */
function gallery(el, items){
  el.innerHTML = items.map(function(it){
    return '<div class="item"><img src="' + it.img + '" alt=""><div><div class="cap">' + it.cap + '</div>' +
      it.lines.map(function(l){ return '<p class="ln">' + l + '</p>'; }).join("") + '</div></div>';
  }).join("");
}

/* ---------- pages ---------- */
if(page === "intro"){
  startFalling(["🎉","🎊","✨","🎈","💖"], "fall", 350);
  startFalling(["🎈","🎈","🎂"], "rise", 700);
}
if(page === "main"){
  playSong();
  startFalling(["🍰","🎂","🎈","🎉","🎁"], "fall", 700);
  calendar($("cal"), CFG.birth[0], CFG.birth[1], CFG.birth[2]);
  counter($("counter"), CFG.birth);
  gallery($("gal"), CFG.bday);
}
if(page === "private"){
  var unlock = function(){
    $("gate").style.display = "none"; $("content").style.display = "block";
    document.body.className = "love"; song.src = "audio/song2.mp3"; playSong();
    startFalling(["❤️","🧸","💖","🧸","💕","❤️"], "fall", 450);
    calendar($("cal"), CFG.start[0], CFG.start[1], CFG.start[2]);
    counter($("counter"), CFG.start);
    gallery($("gal"), CFG.love);
    $("letter").textContent = CFG.letter;
    $("env").onclick = function(){ $("modal").classList.add("on"); };
    $("modal").onclick = function(){ this.classList.remove("on"); };
  };
  $("hint").textContent = CFG.hint;
  $("go").onclick = function(){
    if($("pw").value.trim() === CFG.password) unlock();
    else { $("err").textContent = "كلمة السر غلط 💔 جرّبي تاني"; $("pw").classList.add("shake"); setTimeout(function(){ $("pw").classList.remove("shake"); }, 450); }
  };
  $("pw").onkeydown = function(e){ if(e.key === "Enter") $("go").click(); };
}
