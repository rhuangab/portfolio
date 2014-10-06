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
    //if(type == "player"){
        this.node = svgdoc.getElementById("player");
        this.position = PLAYER_INIT_POS;
        this.motion = motionType.NONE;
        this.verticalSpeed = 0;
    /*}
    else if(type == "monster")
    {
        var tempx;
        var tempy;
        do{
            tempx = 20 + Math.random()*560;
            tempy = 20 + Math.random()*520;
        }while(collidePlatform(new Point(tempx,tempy),MONSTER_SIZE)
               || (tempx < 150 && tempy < 60));
        var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        svgdoc.getElementById("monsters").appendChild(monster);
        monster.setAttribute("x", tempx);
        monster.setAttribute("y", tempy);
        monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
        this.node = monster;
        this.position = new Point(tempx,tempy);
        this.motion = Math.random() >= 0.5 ? motionType.RIGHT : motionType.LEFT;
        this.verticalSpeed = 0;
    }*/
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
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (node.id == "movingPlatform2" && player.position.x > 530)
        {
            //alert(player.isOnPlatform());
        }
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
    if (position.x < 0) {position.x = 0;}
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) {
        position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
  
    }    if (position.y < 0) {
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
var LEVEL = 1;
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game
var MONSTER_SIZE = new Size(40, 40); // The size of a monster
var CANDY_SIZE = new Size(40,40);
//
// Variables in the game
//
var cheatMode = false;
var blood = 2;
var canHurt = true;

var numberOfMonster = 6;
var numberOfCandy = 5;
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var score = 0;
var SCOREUNIT = 1;
var timeLeft = 100;
var timeLeftTimer;
var evevt = null;
var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
//var monsterArray = new Array();
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen

//bullet variable
var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet
                                    //  = pixels it moves each game loop
var STAR_SIZE = new Size(40,40);

var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet
var bulletLeft = 8;
var currentName;
var flipped = false;
var bulletDirection = new Array();
var isLevelUped = false;
var bulletTransformString = null;
var tx = 0;
var ty = 0;

//game sound
var jumpSound = document.getElementById("jump");
var shootSound = document.getElementById("shoot");


//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
    event = evt;
    //createPlatforms();
    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);
    cleanUpGroup("monsters", true);
    cleanUpGroup("candys", true);
    setName();
    // Create the player
    player = new Player();

    //creat monster
    addDisappearingPlatform();
    addMonster();
    addCandy();
    
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timeLeftTimer = setInterval("updateTimeLeft()", 1000);
    jumpSound = document.getElementById("jump");
    shootSound = document.getElementById("shoot");
}

function loadZoomMode(evt)
{
    zoom = 2.0;
    SCOREUNIT = 2;
    load(evt);
}


function setName()
{
    if(LEVEL == 1)
    {
        currentName = prompt("Please enter your name",currentName);
        if(currentName)
        {
            svgdoc.getElementById("playerName").firstChild.data = currentName;
        }
        else
        {
            currentName = "Anonymous"
            svgdoc.getElementById("playerName").firstChild.data = "Anonymous";
        }
    }
}

function createPlatforms()
{
    var blueprint = [
                     "               ",
                     "######   ####  ",
                     "###            ",
                     "##          ###",
                     "    #######    ",
                     "#              ",
                     "##    ###     #",
                     "###          ##",
                     "####       ####",
                     "               ",
                     "#    ####      ",
                     "##        #####",
                     "####           ",
                     "###############"
                     ];
    for(var i = 0;i < blueprint.length; i++)
    {
        for(var j = 0;j < blueprint[i].length; j++)
        {
            var plane = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
            plane.setAttribute("x", 100);
            plane.setAttribute("y", 90);
            plane.setAttribute("width", 60);
            plane.setAttribute("height", 20);
            if(blueprint[i][j] == '#')
            {
                var p = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
                svgdoc.getElementById("platforms").appendChild(p);
                p.setAttribute("x", j*40);
                p.setAttribute("y", i*40);
                p.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#platform1");
            }
        }
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


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            flipLeftPlayer();
            player.motion = motionType.LEFT;
            break;

        case "D".charCodeAt(0):
            flipRightPlayer();
            player.motion = motionType.RIGHT;
            break;
			

        // Add your code here
        case "W".charCodeAt(0):
        	if (player.isOnPlatform()){
        		player.verticalSpeed = JUMP_SPEED;
                //jumpSound.Stop();
                if(jumpSound != null){
                    jumpSound.currentTime = 0;
                    jumpSound.Play();
                }
        	}
        	break;
        case 32: // spacebar = shoot
        case "M".charCodeAt(0):
        	if (cheatMode || canShoot && bulletLeft > 0)
            {
                if(zoom!=2.0)
                    shootBullet();
                else
                    shootZoomedBullet();
            }
            break;
        case "C".charCodeAt(0):
            cheatMode = !cheatMode;
            svgdoc.getElementById("cheatMode").firstChild.data = cheatMode? "ON":"OFF";
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
// This function updates the position and motion of the player in the system
//
function gamePlay() {
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

	
    updateScreen();
    moveBullets();
    moveMonster();
    movePlatform();
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
    
    // Add your code here
    if(zoom == 2.0){
        updateZoomScreen();
	}
    operateDisappearingPlatform();
}

function updateZoomScreen()
{
    var platforms = svgdoc.getElementById("platforms");
    var monsters = svgdoc.getElementById("monsters");
    var candys = svgdoc.getElementById("candys");
    sx = zoom;
	sy = zoom;
    tx = SCREEN_SIZE.w/2-((player.position.x)*zoom+PLAYER_SIZE.w);
    ty = SCREEN_SIZE.h/2-((player.position.y)*zoom+PLAYER_SIZE.h/2);
	//tx =  -(player.position.x)// + PLAYER_SIZE.w/2 );
	//ty =  -(player.position.y)// + PLAYER_SIZE.h/2 );
    
    if((player.position.x+PLAYER_SIZE.w/2)*zoom < SCREEN_SIZE.w/2
       && (player.position.y+PLAYER_SIZE.h/2)*zoom < SCREEN_SIZE.h/2) //left-up
    {
        tx = ty = 0;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + player.position.x*zoom + "," + player.position.y*zoom + ")scale(" + zoom + "," + zoom + ")");
    }
    else if((player.position.x+PLAYER_SIZE.w/2)*zoom < SCREEN_SIZE.w/2 && player.position.y+PLAYER_SIZE.h/2 >= SCREEN_SIZE.h * 3/4) //left-down
    {
        ty = -SCREEN_SIZE.h;
        tx = 0;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + player.position.x*zoom + "," + ((player.position.y-420)*zoom+280) + ")scale(" + zoom + "," + zoom + ")");
    }
    else if(player.position.x+PLAYER_SIZE.w/2 >= SCREEN_SIZE.w * 3/4 && (player.position.y+PLAYER_SIZE.h/2)*zoom < SCREEN_SIZE.h/2) //right-up
    {
        tx = -SCREEN_SIZE.w;
        ty = 0;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + ((player.position.x-450)*zoom+300)  + "," + (player.position.y)*zoom + ")scale(" + zoom + "," + zoom + ")");
    }
    else if(player.position.x+PLAYER_SIZE.w/2 >= SCREEN_SIZE.w * 3/4 && player.position.y+PLAYER_SIZE.h/2 >= SCREEN_SIZE.h * 3/4) //down-right
    {
        //else if((zoom*SCREEN_SIZE.w - (player.position.x+PLAYER_SIZE.w/2)*zoom)<SCREEN_SIZE.w/2
        //        || (zoom*SCREEN_SIZE.h - (player.position.y+PLAYER_SIZE.h/2)*zoom) <SCREEN_SIZE.h/2)
        tx = - (SCREEN_SIZE.w);
        ty = - (SCREEN_SIZE.h);
        player.node.setAttribute("transform", bulletTransformString = "translate(" + ((player.position.x-450)*zoom+300) + "," + ((player.position.y-420)*zoom+280) + ")scale(" + zoom + "," + zoom + ")");
    }
    else if((player.position.x+PLAYER_SIZE.w/2)*zoom < SCREEN_SIZE.w/2) //left-middle
    {
        ty = -((player.position.y - 140)*zoom + PLAYER_SIZE.h/2);
        tx = 0;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + player.position.x*zoom + "," + (SCREEN_SIZE.h/2-PLAYER_SIZE.h/2) + ")scale(" + zoom + "," + zoom + ")");
    }
    else if((player.position.y+PLAYER_SIZE.h/2)*zoom < SCREEN_SIZE.h/2) //up-middle
    {
        tx = -(player.position.x + PLAYER_SIZE.w/2 - 150)*zoom;
        ty = 0;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + (300-40) + "," + (player.position.y)*zoom + ")scale(" + zoom + "," + zoom + ")");
    }
    else if(player.position.x+PLAYER_SIZE.w/2 >= SCREEN_SIZE.w * 3/4) //right-middle
    {
        ty = -((player.position.y - 140)*zoom + PLAYER_SIZE.h/2);
        tx = -SCREEN_SIZE.w;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + ((player.position.x-450)*zoom+300) + "," + (SCREEN_SIZE.h/2-PLAYER_SIZE.h/2) + ")scale(" + zoom + "," + zoom + ")");
    }
    else if(player.position.y+PLAYER_SIZE.h/2 >= SCREEN_SIZE.h * 3/4) //down-middle
    {
        tx = -(player.position.x + PLAYER_SIZE.w/2 - 150)*zoom;
        ty = -SCREEN_SIZE.h;
        player.node.setAttribute("transform", bulletTransformString = "translate(" + (300-40) + "," + ((player.position.y-420)*zoom+280) + ")scale(" + zoom + "," + zoom + ")");
    }
    else
    {
        player.node.setAttribute("transform", bulletTransformString = "translate(" + (300-40) + "," + (280-20) + ")scale(" + zoom + "," + zoom + ")");
    }
    //svgdoc.getElementById("playerName").firstChild.data = player.position.x+","+player.position.y;
    
	platforms.setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + sx + "," + sy + ")");
    for (var j = 0; j < candys.childNodes.length; j++) {
        var candy = candys.childNodes.item(j);
        candy.setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")");
    }
    svgdoc.getElementById("star").setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")");
	    //player.node.setAttribute("transform", "translate(" + 300 + "," + 280 + ")scale(" + zoom + "," + zoom + ")");
}

function operateDisappearingPlatform()
{
    //update disappearing platforms
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (node.getAttribute("type") == "disappearing") {
            var px = parseFloat(node.getAttribute("x"));
            var py = parseFloat(node.getAttribute("y"));
            var pwidth = parseFloat(node.getAttribute("width"));
            var pheight = parseFloat(node.getAttribute("height"));
            if((px-pwidth/2) <= player.position.x && player.position.x <= (px+pwidth/2)
               && py-PLAYER_SIZE.w <= player.position.y && player.position.y <= py)
            {
                var platformOpacity = parseFloat(node.style.getPropertyValue("opacity"));
                platformOpacity -= 0.11;
                node.style.setProperty("opacity", platformOpacity, null);
                
                if(platformOpacity <= 0)
                {
                    platforms.removeChild(node);
                }
            }
        }
    }
}

function increaseZoom(){
	zoom = 2.0;

}

function addMonster(){
    for(var i = 0; i < numberOfMonster; i++)
    {
        var tempx;
        var tempy;
        var size1 = new Size(45,45);
        do{
            tempx = 20 + Math.random()*539;
            tempy = 30 + Math.random()*490;
            
        }while(collidePlatform(new Point(tempx,tempy),size1)
               || (tempx < 150 && tempy < 60));
        var innerMonster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        innerMonster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
        /*
        var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "g");
        monster.appendChild(innerMonster);
        monster.setAttribute("toRight", Math.random() >= 0.5? true : false);
        monster.setAttribute("x", tempx);
        monster.setAttribute("y", tempy);
        //monster.style.setProperty("fill","white",null);
        monster.setAttribute("width", 40);
        monster.setAttribute("height", 40);
        //monster.style.setProperty("opacity",0,null);
        svgdoc.getElementById("monsters").appendChild(monster);

        alert("length"+monster.childNodes.length);
        */
        var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        svgdoc.getElementById("monsters").appendChild(monster);
        //monster.setAttribute("direction", Math.random() >= 0.5? "left" : "right");
        monster.setAttribute("direction","right");
        //tempx = tempy = 150;
        monster.setAttribute("x", tempx);
        monster.setAttribute("y", tempy);
        if(monster.getAttribute("direction") == "left")
        {
            monster.setAttribute("transform", "translate("+tempx+","+tempy+")translate("+40 + ",0)"+"scale(-1,1)translate(-"+tempx+",-"+tempy+")");
        }
        monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
        
    }
}

/*
function moveMonster(monster)
{
    var mx = parseFloat(monster.getAttribute("x"));
    var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animation.setAttributeNS(null, 'attributeName', 'x');
    animation.setAttributeNS(null, 'begin', Math.random()*3);
    animation.setAttributeNS(null, 'values', (mx-50)+";"+(mx+50)+";"+(mx-50));
    animation.setAttributeNS(null, 'dur', '3s');
    animation.setAttributeNS(null, 'repeatCount', 'indefinite');
    //animation.setAttributeNS(null, 'fill', 'freeze');
    monster.appendChild(animation);
    //animation.beginElement();
}*/

function moveMonster()
{
    var monsters = svgdoc.getElementById("monsters");
    for (var j = 0; j < monsters.childNodes.length; j++) {
        var monster = monsters.childNodes.item(j);
        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet
        var mx = parseFloat(monster.getAttribute("x"));
        var my = parseFloat(monster.getAttribute("y"));
        var mp = new Point(mx,my);
        var dir = monster.getAttribute("direction");
        var right = dir == "left"? false : true;
        if(collidePlatformVersion2(new Point(mx + (0.5*right?1:-1),my),MONSTER_SIZE)
           || collideScreen(new Point(mx + (0.5*right?1:-1),my),MONSTER_SIZE))
        {
            monster.setAttribute("direction",dir == "left"? "right" : "left");
            right = !right;
        }
        
        mx = mx + 0.5 * (right? 1 : -1);
        //mx += 0.5;
        monster.setAttribute("x", mx);
        if(monster.getAttribute("direction") == "left")
        {
            if(zoom != 2.0)
            {
                monster.setAttribute("transform", "translate("+mx+","+my+")translate("+40 + ",0)"+"scale(-1,1)translate(-"+mx+",-"+my+")");
            }
            else
            {
                //monster.setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")scale(-1,1)translate(-"+mx+",-"+my+")");
                monster.setAttribute("transform","translate(" + tx + ", " + ty + ")scale(2,2)"+"translate("+mx+","+my+")translate("+40 + ",0)"+"scale(-1,1)translate(-"+mx+",-"+my+")");
            }
        }
        else
        {
            if(zoom != 2.0)
            {
                monster.setAttribute("transform", "");
            }
            else
            {
                //monster.setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")translate(-"+mx+",-"+my+")");
                monster.setAttribute("transform","translate(" + tx + ", " + ty + ")scale(2,2)");
            }
            
        }
    }

}
/*
function moveMonster()
{
    for(var i = 0; i < monsterArray.length; i++)
    {
        var isOnPlatform = monsterArray[i].isOnPlatform();
        
        // Update player position
        var displacement = new Point();
        /*
        // Move left or right
        if ( monsterArray[i].motion == motionType.LEFT)
            displacement.x = -MOVE_DISPLACEMENT;
        if ( monsterArray[i].motion == motionType.RIGHT)
            displacement.x = MOVE_DISPLACEMENT;
        
        // Fall
        if (!isOnPlatform &&  monsterArray[i].verticalSpeed <= 0) {
            displacement.y = - monsterArray[i].verticalSpeed;
             monsterArray[i].verticalSpeed -= VERTICAL_DISPLACEMENT;
        }
        
        // Get the new position of the player
        var position = new Point();
        position.x =  monsterArray[i].position.x ;//+ displacement.x;
        position.y =  monsterArray[i].position.y + displacement.y;
        
        // Check collision with platforms and screen
        if(monsterArray[i].collidePlatform(position) ||monsterArray[i].collideScreen(position))
        {
            monsterArray[i].motion =  (monsterArray[i].motion == motionType.LEFT )?
            motionType.RIGHT : motionType.LEFT;
        }
        
        // Set the location back to the player object (before update the screen)
        monsterArray[i].position = position;
        
        monsterArray[i].node.setAttribute("transform", "translate(" + monsterArray[i].position.x + "," + monsterArray[i].position.y + ")");
    }
}*/


function addCandy(){
    for(var i = 0; i < numberOfCandy; i++)
    {
        var tempx;
        var tempy;
        do{
            tempx = 20 + Math.random()*560;
            tempy = 20 + Math.random()*520;
        }while(collidePlatform(new Point(tempx,tempy),CANDY_SIZE));
        var candy = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        svgdoc.getElementById("candys").appendChild(candy);
        candy.setAttribute("x", tempx);
        candy.setAttribute("y",tempy);
        candy.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#candy");
    }
}

function shootBullet() {
    // Disable shooting for a short period of time
    if(shootSound != null)
        shootSound.Play();
    canShoot = false;
	setTimeout("canShoot = true", SHOOT_INTERVAL);
	
    // Create the bullet by createing a use node
	var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	bulletDirection.push(flipped);
    if(!cheatMode)
    {
        svgdoc.getElementById("bulletLeft").firstChild.data = --bulletLeft;
    }
    // Calculate and set the position of the bullet
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2);

    // Set the href of the use node to the bullet defined in the defs node
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
}

function shootZoomedBullet() {
    // Disable shooting for a short period of time
    if(shootSound != null)
        shootSound.Play();
    canShoot = false;
	setTimeout("canShoot = true", SHOOT_INTERVAL);
	
    // Create the bullet by createing a use node
	var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	bulletDirection.push(flipped);
    if(!cheatMode)
    {
        svgdoc.getElementById("bulletLeft").firstChild.data = --bulletLeft;
    }
    // Calculate and set the position of the bullet
    var tempx,tempy;
    bullet.setAttribute("x", tempx = player.position.x+PLAYER_SIZE.w/2);
    bullet.setAttribute("y", tempy = player.position.y+PLAYER_SIZE.h/2);
    bullet.setAttribute("transform", "translate(40,40)"+bulletTransformString+"translate(-"+tempx+",-"+tempy+")");
    
    // Set the href of the use node to the bullet defined in the defs node
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    
    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
}

function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var bx = parseFloat(node.getAttribute("x"))+ BULLET_SPEED*(bulletDirection[i]? -1:1);
        node.setAttribute("x", bx);
		
        // If the bullet is not inside the screen delete it from the group
        if(bx > 600 || bx < 0)
        {
        	bullets.removeChild(node);
            bulletDirection.splice(i,1); //remove this bullet's direction information.
            i--;
        }
   }
}
function collisionDetection() {
    // Check whether the player collides with a monster    
    var monsters = svgdoc.getElementById("monsters");
    
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        
        // For each monster check if it overlaps with the player
        // if yes, stop the game
        var mx = parseFloat(monster.getAttribute("x"));
        var my = parseFloat(monster.getAttribute("y"));
        var mp = new Point(mx,my);
        if(!cheatMode && intersect(player.position,PLAYER_SIZE, mp, MONSTER_SIZE))
        {
            if(blood == 2 && canHurt)
            {
                if(document.getElementById("hurt")!=null)
                    document.getElementById("hurt").Play();
                canHurt = false;
                setTimeout("canHurt = true", 2000);
                var node = svgdoc.getElementById("player");
                node.style.setProperty("opacity", 0.5, null);
                blood--;
            }
            else if(blood == 1 && canHurt)
            {
                if(document.getElementById("hurt")!=null)
                    document.getElementById("hurt").Play();
                gameOver();
            }
        }
    }
    
    // Check whether the player collides with a candy
    var candys = svgdoc.getElementById("candys");
    
    for (var i = 0; i < candys.childNodes.length; i++) {
        var candy = candys.childNodes.item(i);
        
        // For each monster check if it overlaps with the player
        // if yes, stop the game
        var mx = parseFloat(candy.getAttribute("x"));
        var my = parseFloat(candy.getAttribute("y"));
        var cp = new Point(mx,my);
        if(intersect(player.position,PLAYER_SIZE, cp, CANDY_SIZE))
        {
            if(document.getElementById("pickUpCandy")!=null)
                document.getElementById("pickUpCandy").Play();
            candys.removeChild(candy);
            i--;
         	svgdoc.getElementById("score").firstChild.data = score += SCOREUNIT;
        }
    }

    
    
    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
		for (var j = 0; j < monsters.childNodes.length; j++) {
        	var monster = monsters.childNodes.item(j);
			// For each bullet check if it overlaps with any monster
			// if yes, remove both the monster and the bullet
			var bp = new Point(parseFloat(bullet.getAttribute("x")),parseFloat(bullet.getAttribute("y")));
			var mp = new Point(parseFloat(monster.getAttribute("x")),parseFloat(monster.getAttribute("y")));
			if(intersect(bp, BULLET_SIZE, mp, MONSTER_SIZE))
			{
				bullets.removeChild(bullet);
                bulletDirection.splice(i,1);
				monsters.removeChild(monster);
				j--;
				i--;
				svgdoc.getElementById("score").firstChild.data = score += SCOREUNIT;
				break;
			} 
		}       
    }
    // Check whether a bullet hits the platform
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var bp = new Point(parseFloat(bullet.getAttribute("x")),parseFloat(bullet.getAttribute("y")));
        if(collidePlatform(bp, BULLET_SIZE))
        {
            bullets.removeChild(bullet);
            bulletDirection.splice(i,1);
            i--;
        }
    }
    //check whether the player enter the exit
    collideStar();
}

function updateTimeLeft()
{
    svgdoc.getElementById("timeLeft").firstChild.data = --timeLeft;
    if(timeLeft <= 0)
    {
        alert("Timeout!");
        gameOver();
    }
}

function clearAllInterval()
{
    clearInterval(gameInterval);
    clearInterval(timeLeftTimer);
}

function gameOver()
{
    clearAllInterval();
    if(document.getElementById("gameOver")!=null)
        document.getElementById("gameOver").Play();
    var table = getHighScoreTable();
    var record = new ScoreRecord(currentName, score);
    if(!table)
    {
        table = new Array();
    }
    if(table.length == 0)
    {
        table.push(record);
    }
    else {
        for(var i = 0; i < table.length; i++)
        {
            if(parseFloat(table[i].score) < score)
            {
                table.splice(i,0,record);
                break;
            }
            else if(i + 1 >= table.length)
            {
                table.push(record);
                break;
            }
        }
    }
    setHighScoreTable(table);
    showHighScoreTable(table);
    table = null;

}

function collidePlatform(position,size0) {
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
        
        if (intersect(position, size0, pos, size)) {
               return true;
            }
        }
    return false;
}

function collidePlatformVersion2(position,size0) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (node.id == "movingPlatform2" || node.id == "movingPlatform1") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        
        if (intersect(position, size0, pos, size)) {
            return true;
        }
    }
    return false;
}

function collideScreen(position,size0) {
    if (position.x < 0) {return true;}
    if (position.x + size0.w > SCREEN_SIZE.w) {
        return true;
        
    }    if (position.y < 0) {
        return true;
    }
    if (position.y + size0.h > SCREEN_SIZE.h) {
        return true;
    }
    return false;
}


function flipLeftPlayer()
{
    flipped = true;
    var player = svgdoc.getElementById("bluefish");
    player.setAttribute("transform", "translate("+40 + ",0)"+"scale(-1,1)");

}

function flipRightPlayer()
{
    flipped = false;
    var player = svgdoc.getElementById("bluefish");
    player.setAttribute("transform","");
}

function enterNormalMode()
{
    alert(1);
}

function enterZoomMode()
{
    alert(2);
}

function addDisappearingPlatform()
{
    var platforms = svgdoc.getElementById("platforms");
    
    // Create a new line element
    var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    
    // Set the various attributes of the line
    newPlatform.setAttribute("x", 280);
    newPlatform.setAttribute("y", 100);
    newPlatform.setAttribute("width", 60);
    newPlatform.setAttribute("height", 20);
    newPlatform.setAttribute("type", "disappearing");
    newPlatform.style.setProperty("opacity", 1, null);
    //newPlatform.style.setProperty("stroke", "black", null);
    newPlatform.style.setProperty("fill", "url(#dpPattern)", null);
    
    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform);
    
    // Create a new line element
    var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    
    // Set the various attributes of the line
    newPlatform.setAttribute("x", 120);
    newPlatform.setAttribute("y", 300);
    newPlatform.setAttribute("width", 60);
    newPlatform.setAttribute("height", 20);
    newPlatform.setAttribute("type", "disappearing");
    newPlatform.style.setProperty("opacity", 1, null);
    //newPlatform.style.setProperty("stroke", "black", null);
    newPlatform.style.setProperty("fill", "url(#dpPattern)", null);
    
    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform);
    newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    
    // Set the various attributes of the line
    newPlatform.setAttribute("x", 120);
    newPlatform.setAttribute("y", 100);
    newPlatform.setAttribute("width", 60);
    newPlatform.setAttribute("height", 20);
    newPlatform.setAttribute("type", "disappearing");
    newPlatform.style.setProperty("opacity", 1, null);
    //newPlatform.style.setProperty("stroke", "black", null);
    newPlatform.style.setProperty("fill", "url(#dpPattern)", null);
    
    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform);
}

function movePlatform()
{
    var mplatform = svgdoc.getElementById("movingPlatform2");
    var my = parseFloat(mplatform.getAttribute("y"));
    /*if(movingPlatformCollideMonster(mplatform))
    {
        if(mplatform.getAttribute("direction") == "up")
        {
            mplatform.setAttribute("direction","down");
            my += 0.5;
        }
        else
        {
            mplatform.setAttribute("direction","up");
            my -= 0.5;
        }
    }
    else */if("down" == mplatform.getAttribute("direction") && my + 0.5 < 480)
    {
        my +=0.5;
    }
    else if("up" == mplatform.getAttribute("direction") && my - 0.5 > 380)
    {
        my -= 0.5;
    }
    else if(my + 0.5 >= 480)
    {
        mplatform.setAttribute("direction","up");
        my = 480;
    }
    else if(my - 0.5 <= 480)
    {
        mplatform.setAttribute("direction","down");
        my = 380;
    }
    mplatform.setAttribute("y",my);
    //horizontal moving platform
    mplatform = svgdoc.getElementById("movingPlatform1");
    var mx = parseFloat(mplatform.getAttribute("x"));
    if("right" == mplatform.getAttribute("direction") && mx + 0.5 < 320)
    {
        mx +=0.5;
    }
    else if("left" == mplatform.getAttribute("direction") && mx - 0.5 > 140)
    {
        mx -= 0.5;
    }
    else if(mx + 0.5 >= 320)
    {
        mplatform.setAttribute("direction","left");
        mx = 320;
    }
    else if(mx - 0.5 <= 140)
    {
        mplatform.setAttribute("direction","right");
        mx = 140;
    }
    mplatform.setAttribute("x",mx);
}

function movingPlatformCollideMonster(mplatform)
{
    var monsters = svgdoc.getElementById("monsters");
    for (var j = 0; j < monsters.childNodes.length; j++) {
        var monster = monsters.childNodes.item(j);
        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet
       var ttx = parseFloat(mplatform.getAttribute("x"));
       var tty = parseFloat(mplatform.getAttribute("y"));
       if(mplatform.getAttribute("direction") == "up")
           tty -= 0.5;
       else
           tty += 0.5;
        var p = new Point(ttx,tty);
        var msize = new Point(60,20);
        var mp = new Point(parseFloat(monster.getAttribute("x")),parseFloat(monster.getAttribute("y")));
        if(intersect(p, msize, mp, MONSTER_SIZE))
        {
            return true;
        }
    }
    return false;
}


function collideStar()
{
    var star = svgdoc.getElementById("star");
    var sx = parseFloat(star.getAttribute("x"));
    var sy = parseFloat(star.getAttribute("y"));
    var sp = new Point(sx,sy)
    if(intersect(player.position,PLAYER_SIZE,sp,STAR_SIZE))
    {
        var candys = svgdoc.getElementById("candys");
        if(candys.childNodes.length == 0 && !isLevelUped)
        {
            isLevelUped = true;
            if(document.getElementById("levelUp")!=null)
                document.getElementById("levelUp").Play();
            levelUpEffect1();
        }
    }
}

function reloadVariable(isGameOver)
{

    PLAYER_SIZE = new Size(40, 40);         // The size of the player
    SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
    PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player
    
    MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
    JUMP_SPEED = 15;                        // The speed of the player jumping
    VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
    
    GAME_INTERVAL = 25;                     // The time interval of running the game
    MONSTER_SIZE = new Size(40, 40); // The size of a monster
    CANDY_SIZE = new Size(40,40);
    //
    // Variables in the game
    //
    var node = svgdoc.getElementById("player");
    node.style.setProperty("opacity", 1, null);

    blood = 2;
    canHurt = true;

    SCOREUNIT = 1;
    timeLeft = 100;
    timeLeftTimer;
        
    //bullet variable
    BULLET_SIZE = new Size(10, 10); // The size of a bullet
    BULLET_SPEED = 10.0;            // The speed of a bullet
    //  = pixels it moves each game loop
    STAR_SIZE = new Size(40,40);
    
    SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
    canShoot = true;                // A flag indicating whether the player can shoot a bullet
    bulletLeft = 8;
    flipped = false;
    bulletDirection = new Array();
    isLevelUped = false;
    if(isGameOver)
    {
        gameInterval = null;                    // The interval
        score = 0;
        //currentName = null;
        LEVEL = 1;
        numberOfMonster = 6;
        numberOfCandy = 5;
        cheatMode = false;
    }

}

function startAgain(evt)
{
    var node = svgdoc.getElementById("highscoretable");
    node.style.setProperty("visibility", "hidden", null);
    var node = svgdoc.getElementById("player");
    node.style.setProperty("opacity", "1", null);
    cleanUpGroup("monsters");
    cleanUpGroup("candys");
    cleanUpGroup("highscoretext");
    svgdoc.getElementById("score").firstChild.data = 0;
    svgdoc.getElementById("level").firstChild.data = 1;
    svgdoc.getElementById("bulletLeft").firstChild.data = 8;
    svgdoc.getElementById("cheatMode").firstChild.data = "OFF";
    reloadVariable(true);
    load(evt);
}

function levelUp()
{
    //alert("Task Completed!");
    svgdoc.getElementById("score").firstChild.data = score += SCOREUNIT*(LEVEL*100+timeLeft);
    LEVEL++;
    svgdoc.getElementById("level").firstChild.data = LEVEL;
    svgdoc.getElementById("bulletLeft").firstChild.data = 8;
    clearAllInterval();
    cleanUpGroup("monsters");
    cleanUpGroup("candys");
    reloadVariable(false);
    if(GAME_INTERVAL > 10)
    {
        GAME_INTERVAL-=2;
    }
    numberOfMonster += 4;
    /*
    numberOfCandy = tempnC+3;
    score = tempScore;
    LEVEL = tempLevel;*/
    load(event);
}
var scale = 1;
function levelUpEffect1()
{
    scale += 1;
    if(zoom != 2.0)
    {
        svgdoc.getElementById("star").setAttribute("transform","translate(420,220)scale("+scale+")translate(-420,-220)");
    }
    else
    {
        svgdoc.getElementById("star").setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")translate(420,220)scale("+scale*0.5+")translate(-420,-220)");
    }
    if(scale < 20)
    {
        setTimeout("levelUpEffect1()",30);
    }
    else if(scale >= 20)
    {
        scale = 20;
        levelUpEffect2();
    }
}

function levelUpEffect2()
{
    scale-=1;
    if(zoom != 2.0)
    {
        svgdoc.getElementById("star").setAttribute("transform","translate(420,220)rotate("+scale*18+",0,0)scale("+scale+")translate(-420,-220)");
    }
    else
    {
        svgdoc.getElementById("star").setAttribute("transform", "translate(" + tx + ", " + ty + ")scale(" + zoom + "," + zoom + ")translate(420,220)rotate("+scale*18+",0,0)scale("+scale*0.5+")translate(-420,-220)");
    }
    if(scale > 1)
    {
        setTimeout("levelUpEffect2()",30);
    }
    else if(scale <= 1)
    {
        scale = 1;
        levelUp();
    }
}
