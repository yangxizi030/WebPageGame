// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }

    var dplatform = svgdoc.getElementById("disappearingplatforms");
    if(dplatform.childNodes.length>0){
    for (var i = 0; i < dplatform.childNodes.length; i++) {
    var ddplatform = dplatform.childNodes.item(i);
    if(ddplatform.nodeName != "rect") continue;
      var x = parseFloat(ddplatform.getAttribute("x"));
      var y = parseFloat(ddplatform.getAttribute("y"));
      var w = parseFloat(ddplatform.getAttribute("width"));
      var h = parseFloat(ddplatform.getAttribute("height"));
      if(intersect(new Point(x,y), new Size(w,h), new Point(player.position.x,player.position.y),PLAYER_SIZE)){
        var platformOpacity = parseFloat(ddplatform.style.getPropertyValue("opacity"));
        platformOpacity -= 0.1;
        ddplatform.style.setProperty("opacity", platformOpacity, null);
        if(platformOpacity==0) dplatform.removeChild(ddplatform);
         return true;
      }
 }
}

    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }


}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(38, 38);         // The size of the player
var SCREEN_SIZE = new Size(800, 600);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(15, 15);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen

var remain = 8;
var Timeremain = 100;
var bulletremain = 8;
var curScore = 0;
var playFaceLeft = false;
var monsterFaceLeft = false;
var cheat = false;
var namePlayer;
var bgm_music;
var gameTimer;
var barTimer;
//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
    bgm_music = svgdoc.getElementById("back");
    reStart("");
  }
function reStart(name){
    //var lastName = document.cookie.substring(document.cookie.lastIndexOf("=")+1,document.cookie.lastIndexOf("%"));
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("bulletsToLeft", false);
    cleanUpGroup("monsterbullets", false);
    cleanUpGroup("monsterbulletsToLeft", false);
    cleanUpGroup("shootmonster", false);
    cleanUpGroup("goodThings", false);

    remain = 8;
    Timeremain = 100;
    bulletremain = 8;
    svgdoc.getElementById("bulletLeft").innerHTML = "Bullet Left: "+bulletremain;
    curScore = 0;
    svgdoc.getElementById("timeRemaining").innerHTML = "Time Remains: "+Timeremain+"s";
    svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
    playFaceLeft = false;
    monsterFaceLeft = false;
    cheat = false;
    gameTimer = null;
    barTimer = null;

    //ask player's name
    namePlayer = prompt("Please enter the player's name:", name);
    if(namePlayer=="") namePlayer = "Anonymous";
    svgdoc.getElementById("playername").innerHTML = namePlayer;


    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    // Create the monsters
    var temp = 5;
    while(temp>0){
      var x = Math.floor(Math.random()*800);
      var y = Math.floor(Math.random()*500);
      // in case too close to the player
      if(x<100 && y>400) x+=100;

     createMonster(x, y);
  //   moveMonster();
     temp--;

  }
  var x_ = Math.floor(Math.random()*700);
  var y_ = Math.floor(Math.random()*500);
  var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  svgdoc.getElementById("shootmonster").appendChild(monster);
  monster.setAttribute("x", x_);
  monster.setAttribute("y", y_);
  if((x_-player.position.x)<100) x_+=40;
  if((y_-player.position.y)<100) y_-=40;
  monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
  ifdead=false;
  monsterShoot();

  //create goodThings

  temp=8;
  while(temp>0){
    var x1 = Math.floor(Math.random()*700);
    var y1 = Math.floor(Math.random()*500);
    // check overlap with platform
    var okay=true;
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
      var platform = platforms.childNodes.item(i);
      if(platform.nodeName != "rect") continue;
      var x = parseFloat(platform.getAttribute("x"));
      var y = parseFloat(platform.getAttribute("y"));
      var w = parseFloat(platform.getAttribute("width"));
      var h = parseFloat(platform.getAttribute("height"));
      if(intersect(new Point(x,y), new Size(w,h), new Point(x1,y1), MONSTER_SIZE)) okay=false;
    }
    var platforms = svgdoc.getElementById("disappearingplatforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
      var platform = platforms.childNodes.item(i);
      if(platform.nodeName != "rect") continue;
      var x = parseFloat(platform.getAttribute("x"));
      var y = parseFloat(platform.getAttribute("y"));
      var w = parseFloat(platform.getAttribute("width"));
      var h = parseFloat(platform.getAttribute("height"));
      if(intersect(new Point(x,y), new Size(w,h), new Point(x1,y1), MONSTER_SIZE)) okay=false;
    }

      if(okay) {
      createGood(x1, y1);
      temp--;
      }
}
      //Transform
    checkTransform();
      // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    //set Timer
    gameTimer = setInterval("timeUpdate()", 1000);
    barTimer = setInterval("barUpdate()", 100);
}
function barUpdate(){
  if(svgdoc.getElementById("timebar").getAttribute("width")>0 && cheat==false )
  svgdoc.getElementById("timebar").setAttribute("width",svgdoc.getElementById("timebar").getAttribute("width")-0.1);
}
function timeUpdate(){

  Timeremain--;
  if(cheat)   Timeremain++;
  svgdoc.getElementById("timeRemaining").innerHTML = "Time Remains: "+Timeremain+"s";
  if(Timeremain==0){
    curScore+=100*zoom;
    svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
    var fails = svgdoc.getElementById("fail");
    fails.play();
    bgm_music.pause();
  if(confirm("Game over! Your score is:"+curScore+". Your name is "+namePlayer+". Start Again?")){
    storeScore(namePlayer, curScore);
      reStart(namePlayer);
  }else{
    endGame(namePlayer, curScore);
  }
  clearInterval(gameInterval);
  }
}
//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

var monsterMoveTimer;
//
// This function creates the monsters in the game
//


function createMonster(x, y) {

  var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  svgdoc.getElementById("monsters").appendChild(monster);
  monster.setAttribute("x", x);
  monster.setAttribute("y", y);
  var x_ = Math.floor(Math.random()*700);
  var y_ = Math.floor(Math.random()*500);
//  moveMonster(monster, x, y, x_, y_);
  monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
  // var monsterleft = svgdoc.getElementById("monsterleft");
  // monsterleft.setAttribute("transform", "translate(" +MONSTER_SIZE.w + ", 0) scale(-1,1)");

}

function createGood(x,y) {
  var good = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  svgdoc.getElementById("goodThings").appendChild(good);
  good.setAttribute("x", x);
  good.setAttribute("y", y);
  good.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodThing");
}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    //if all bullets used
    if(bulletremain==0) return;
    var shoot = svgdoc.getElementById("shoot");
    shoot.play();
    bulletremain--;
    if(cheat) bulletremain++;
    svgdoc.getElementById("bulletLeft").innerHTML = "Bullet Left: "+bulletremain;
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    if(!playFaceLeft){
    svgdoc.getElementById("bullets").appendChild(bullet);
    var bullet_x = player.position.x + (PLAYER_SIZE / 2) - (BULLET_SIZE.w / 2);
    var bullet_y = player.position.y + (PLAYER_SIZE / 2) - (BULLET_SIZE.h / 2);
    bullet.setAttribute("x", player.position.x);
    bullet.setAttribute("y", player.position.y);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullet").setAttribute("transform", "translate(" +BULLET_SIZE.w + ", 0) scale(1,1)");
  }else {
    svgdoc.getElementById("bulletsToLeft").appendChild(bullet);
    var bullet_x = player.position.x + (PLAYER_SIZE / 2) - (BULLET_SIZE.w / 2);
    var bullet_y = player.position.y + (PLAYER_SIZE / 2) - (BULLET_SIZE.h / 2);
    bullet.setAttribute("x", player.position.x);
    bullet.setAttribute("y", player.position.y);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bulletleft");
    svgdoc.getElementById("bulletleft").setAttribute("transform", "translate(" +BULLET_SIZE.w + ", 0) scale(-1,1)");
  }

}


//
// This function lets monster to shoot.
//

var ifmonsterShoot;
var ifdead;
function monsterShoot(){
  if(ifdead) return;
  var monsters = svgdoc.getElementById("shootmonster");
  //check if the special monster is dead
  var monster = monsters.childNodes.item(0);
  if( monster==null) return;
  var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  ifmonsterShoot = true;

  if(!monsterFaceLeft){
  svgdoc.getElementById("monsterbullets").appendChild(bullet);
  var x = parseInt(monster.getAttribute("x"));
  var y = parseInt(monster.getAttribute("y"));
  bullet.setAttribute("x", x);
  bullet.setAttribute("y", y);
  bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bulletM");
  svgdoc.getElementById("bulletM").setAttribute("transform", "translate(" +BULLET_SIZE.w + ", 0) scale(1,1)");
  }
  if(monsterFaceLeft){
  svgdoc.getElementById("monsterbulletsToLeft").appendChild(bullet);
  var x = parseInt(monster.getAttribute("x"));
  var y = parseInt(monster.getAttribute("y"));
  bullet.setAttribute("x", x);
  bullet.setAttribute("y", y);
  bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bulletM");
  svgdoc.getElementById("bulletM").setAttribute("transform", "translate(" +BULLET_SIZE.w + ", 0) scale(-1,1)");

  }
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            if(!playFaceLeft){
              var player1 = svgdoc.getElementById("playerExceptname");
              player1.setAttribute("transform", "translate(" +PLAYER_SIZE.w + ", 0) scale(-1,1)");

            }
            playFaceLeft = true;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            if(playFaceLeft){
              var player1 = svgdoc.getElementById("playerExceptname");
              player1.setAttribute("transform", "translate(0, 0) scale(1,1)");
            }
            playFaceLeft = false;
            break;

        case "W".charCodeAt(0):
            if (cheat || player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case 32:
            if(canShoot)
               shootBullet();
            break;
        case "C".charCodeAt(0):
            cheat = true;
            var player2 = svgdoc.getElementById("playerExceptname");
            player2.setAttribute("style", "opacity:0.5");
            break;
        case "V".charCodeAt(0):
            cheat = false;
            var player2 = svgdoc.getElementById("playerExceptname");
            player2.setAttribute("style", "opacity:1");
            break;

    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {


    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

	// For each monster check if it overlaps with the player
        // if yes, stop the game
        if(!cheat && intersect(new Point(player.position.x,player.position.y),PLAYER_SIZE,new Point(x,y), MONSTER_SIZE)) {
          curScore+=100-Timeremain;
          if(zoom==2.0)   curScore+=100-Timeremain;
        svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
          var fails = svgdoc.getElementById("fail");
          fails.play();
          bgm_music.pause();
          if(confirm("Game over! Your score is:"+curScore+". Your name is "+namePlayer+". Start Again?")){
            storeScore(namePlayer, curScore);
            reStart(namePlayer);
          }else{
            endGame(namePlayer, curScore);
          }
          clearInterval(gameInterval);
          clearInterval(gameTimer);
        }

    }

   //check if eat a bread
   var goods = svgdoc.getElementById("goodThings");
   for (var i = 0; i < goods.childNodes.length; i++) {
       var good = goods.childNodes.item(i);
       var x = parseInt(good.getAttribute("x"));
       var y = parseInt(good.getAttribute("y"));

   // For each monster check if it overlaps with the player
       // if yes, stop the game
       if(intersect(new Point(player.position.x,player.position.y),PLAYER_SIZE,new Point(x,y), MONSTER_SIZE)) {
         curScore+=10*zoom;
         goods.removeChild(good);
         remain--;
         i--;
       }

   }
   //check if win
   if(remain==0 && (Math.abs(player.position.x-0)<=30)  && (Math.abs(player.position.y-40)<=30)){
     var wins = svgdoc.getElementById("win");
     wins.play();
     bgm_music.pause();
     curScore+=100-Timeremain;
     if(zoom==2.0)   curScore+=100-Timeremain;
     svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
     svgdoc.getElementById("timeRemaining").innerHTML = "Time Remains: "+Timeremain+"s";
     endGame(namePlayer, curScore);
     alert("You win!");
     svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
     clearInterval(gameInterval);
     clearInterval(gameTimer);
   }


    //check if player is hitted by bullet
    if(!ifdead){
    var bullets = svgdoc.getElementById("monsterbullets");
    if(bullets.childNodes.length>0){
      var bullet = bullets.childNodes.item(0);
      var x = parseInt(bullet.getAttribute("x"));
      var y = parseInt(bullet.getAttribute("y"));
      if(!cheat && intersect(new Point(x,y), BULLET_SIZE,new Point(player.position.x,player.position.y),PLAYER_SIZE)) {
        curScore+=100-Timeremain;
        if(zoom==2.0)   curScore+=100-Timeremain;
        svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
        var fails = svgdoc.getElementById("fail");
        fails.play();
        bgm_music.pause();
        if(confirm("Game over! Your score is:"+curScore+". Your name is "+namePlayer+". Start Again?")){
          storeScore(namePlayer, curScore);
          reStart(namePlayer);
        }else{
          endGame(namePlayer, curScore);
        }
        clearInterval(gameInterval);
        clearInterval(gameTimer);
      }
    }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

	// For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet

        if(intersect(new Point(x,y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
          curScore+=10*zoom;
          if(zoom==2.0) curScore+=10;
          svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
          monsters.removeChild(monster);
          i--;
          bullets.removeChild(bullet);
          j--;
          var monsterss = svgdoc.getElementById("monstersound");
          monsterss.play();
        }
        }

          var monsters = svgdoc.getElementById("shootmonster");
          var monster = monsters.childNodes.item(0);
          if(monsters.childNodes.length>0){
          var mx = parseInt(monster.getAttribute("x"));
          var my = parseInt(monster.getAttribute("y"));
        if(intersect(new Point(x,y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
          curScore+=10*zoom;
          if(zoom==2.0) curScore+=10;
          monsters.removeChild(monster);
          curScore+=10*zoom;
          svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
          ifdead=true;
          var bullets_ = svgdoc.getElementById("monsterbullets");
          if(bullets_.childNodes.length>0){
          var bullet_ = bullets_.childNodes.item(0);
          bullets_.removeChild(bullet_);
        }
          bullets.removeChild(bullet);
          i--;
          var monsterss = svgdoc.getElementById("monstersound");
          monsterss.play();
        }

      }
    }
    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bulletsToLeft");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

	// For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet

        if(intersect(new Point(x,y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
          curScore+=10*zoom;
          if(zoom==2.0) curScore+=10;
          svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
          monsters.removeChild(monster);
          i--;
          bullets.removeChild(bullet);
          j--;
          var monsterss = svgdoc.getElementById("monstersound");
          monsterss.play();
        }
        }

          var monsters = svgdoc.getElementById("shootmonster");
          var monster = monsters.childNodes.item(0);
          if(monsters.childNodes.length>0){
          var mx = parseInt(monster.getAttribute("x"));
          var my = parseInt(monster.getAttribute("y"));
        if(intersect(new Point(x,y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
          monsters.removeChild(monster);
          curScore+=10*zoom;
          if(zoom==2.0) curScore+=10;
          svgdoc.getElementById("scoreGotten").innerHTML="Score: "+curScore;
          ifdead=true;
          var bullets_ = svgdoc.getElementById("monsterbullets");
          if(bullets_.childNodes.length>0){
          var bullet_ = bullets_.childNodes.item(0);
          bullets_.removeChild(bullet_);
        }
          bullets.removeChild(bullet);
          i--;
          var monsterss = svgdoc.getElementById("monstersound");
          monsterss.play();
        }

      }
    }
}

function checkTransform(){
  if((Math.abs(player.position.x-5)<=30)  && (Math.abs(player.position.y-150)<=30)){
  player.position.x = 770;
  player.position.y = 50;
}else
  if((Math.abs(player.position.x-770)<=30)  && (Math.abs(player.position.y-50)<30)){
  player.position.x = 5;
  player.position.y = 150;
  }

  var monsters = svgdoc.getElementById("monsters");
  for (var i = 0; i < monsters.childNodes.length; i++) {
      var monster = monsters.childNodes.item(i);
      var x = parseInt(monster.getAttribute("x"));
      var y = parseInt(monster.getAttribute("y"));
      if(x>(player.position.x)){
         monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterleft");
         monster.setAttribute("x", x - 1);
      }else{
        monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
        monster.setAttribute("x", x + 1);
      }
      if(y>(player.position.y)){
        monster.setAttribute("y", y - 1);
      }else{
        monster.setAttribute("y", y + 1);
      }
    }
  var monsters = svgdoc.getElementById("shootmonster");
  if(monsters.childNodes.length>0){
  var monster = monsters.childNodes.item(0);
  var x = parseInt(monster.getAttribute("x"));
  var y = parseInt(monster.getAttribute("y"));
  if(x>(player.position.x)){
    monsterFaceLeft=true;
     monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterleft");
     monster.setAttribute("x", x - 1);
  }else{
    monsterFaceLeft = false;
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("x", x + 1);
  }
  if(y>(player.position.y)){
    monster.setAttribute("y", y - 1);
  }else{
    monster.setAttribute("y", y + 1);
  }
}
setTimeout("checkTransform()",200);
}
//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }

    //move to LEFT
    var bullets = svgdoc.getElementById("bulletsToLeft");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x - BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x < 0) {
            bullets.removeChild(node);
            i--;
        }
    }

    if(ifmonsterShoot && !ifdead){
      var bullets = svgdoc.getElementById("monsterbullets");
      if(bullets.childNodes.length>0){
      var node = bullets.childNodes.item(0);
      var x = parseInt(node.getAttribute("x"));
      node.setAttribute("x", x + BULLET_SPEED);
      if (x > SCREEN_SIZE.w) {
          bullets.removeChild(node);
          ifmonsterShoot = false;
          monsterShoot();
      }
      }

      var bullets = svgdoc.getElementById("monsterbulletsToLeft");
      if(bullets.childNodes.length>0){
      var node = bullets.childNodes.item(0);
      var x = parseInt(node.getAttribute("x"));
      node.setAttribute("x", x - BULLET_SPEED);
      if (x < 0) {
          bullets.removeChild(node);
          ifmonsterShoot = false;
          monsterShoot();
      }
      }

    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
//    var bgm_music = svgdoc.getElementById("back");
    bgm_music.play();
    // Check collisions, call the collisionDetection when you create the monsters and bullets
    collisionDetection();
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;


    // Move the bullets, call the movebullets when you create the monsters and bullets
    moveBullets();
    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0)
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0)
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;

    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
}

function hideStart() {
  svgdoc.getElementById("startpage").style.display='none';
  return false;
}

function storeScore(name, score) {
  // Get the high score table from cookies
  var table = getHighScoreTable();
  // Create the new score record
  var record = new ScoreRecord(name,score);
  // Insert the new score record
  var pos = table.length;
  for (var i = 0; i < table.length; i++){
    if(record.score > table[i].score) {
      pos = i;
      break;
    }
  }
  // Store the new high score table
  table.splice(pos, 0, record);
  setHighScoreTable(table);
}

function endGame(name, score) {
  cheat=true;
  // Get the high score table from cookies
  var table = getHighScoreTable();
  // Create the new score record
  var record = new ScoreRecord(name,score);
  // Insert the new score record
  var pos = table.length;
  for (var i = 0; i < table.length; i++){
    if(record.score > table[i].score) {
      pos = i;
      break;
    }
  }
  // Store the new high score table
  table.splice(pos, 0, record);
  setHighScoreTable(table);
  // Show the high score table
  showHighScoreTable(name, table);
  return;
}
