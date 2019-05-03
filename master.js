window.requestAnimFrame = (function() {
	return (window.requestAnimationFrame 		||
		window.webkitRequestAnimationFrame 	||
		window.mozRequestAnimationFrame 	||
		window.oRequestAnimationFrame 		||
		window.msRequestAnimationFrame 		||
		function (callback) {
			return window.setTimeout(callback, 1000 / 60);
		});
})();
window.cancelRequestAnimFrame = (function() {
	return (window.cancelAnimationFrame 			||
		window.webkitCancelRequestAnimationFrame 	||
		window.mozCancelRequestAnimationFrame 		||
		window.oCancelRequestAnimationFrame 		||
		window.msCancelRequestAnimationFrame 		||
		clearTimeout);
})();

let	canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	height = 600,
 	width = 800,
	startBtn = {},
	restartBtn = {},
	mouse = {},
	viewfinder = {},
	viewNormal = new Image(),
	viewRed = new Image(),
	background = {},
	backgroundStart = new Image(),
	backgroundLevel01 = new Image(),
	shadow = {},
	shadowLevel01 = new Image(),
  // Player
	player = {},
	playerNormal = new Image(),
	playerShot = new Image(),
	playerLegs = new Image(),
	playerLegsMove1 = new Image(),
	playerLegsMove2 = new Image(),
	playerLegsMove3 = new Image(),
	playerLegsMove4 = new Image(),
	playerLegsMove5 = new Image(),
	playerLegsMove6 = new Image(),
	balls = [],
	ball = {},
	wall = [],
	furniture = [],
	up,
	down,
	left,
	right,
	shot = false,
	point = 0,
	life = 100,
	lvl = 0,
	particules = [],
	particule = {},
	particuleCount = 20,
	over = 0,
	sound = {},
	init;

canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", click, true);
canvas.addEventListener("mouseup", function() { if (lvl != 0) shot = false; }, true);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;

canvas.height = height;
canvas.width = width;

walls = [
	[{w: 1580, h: 14, x: 10, y: 10}, {w: 14, h: 1180, x: 10, y: 10},
	{w: 1580, h: 14, x: 10, y: 1176}, {w: 14, h: 1180, x: 1576, y: 10},
	{w: 128, h: 14, x: 24, y: 422}, {w: 226, h: 14, x: 314, y: 422},
	{w: 14, h: 412, x: 526, y: 24}, {w: 14, h: 612, x: 528, y: 564},
	{w: 128, h: 14, x: 24, y: 564}, {w: 226, h: 14, x: 314, y: 564},
	{w: 26, h: 26, x: 1150, y: 630}, {w: 14, h: 44, x: 1156, y: 1146}]
];
furnitures = [
	[{w: 268, h: 90, x: 32, y: 42}, {w: 34, h: 110, x: 24, y: 184},
	{w: 76, h: 32, x: 426, y: 30}, {w: 78, h: 160, x: 448, y: 262},
	{w: 200, h: 266, x: 174, y: 910}, {w: 82, h: 70, x: 66, y: 1096},
	{w: 82, h: 70, x: 400, y: 1096}, {w: 224, h: 390, x: 710, y: 660},//finish
	{w: 78, h: 38, x: 784, y: 622}, {w: 107, h: 37, x: 157, y: 288},
	{w: 20, h: 37, x: 335, y: 341}, {w: 10, h: 38, x: 345, y: 387},
	{w: 12, h: 38, x: 343, y: 432}, {w: 12, h: 38, x: 343, y: 474},
	{w: 12, h: 38, x: 466, y: 348}, {w: 16, h: 38, x: 466, y: 394},
	{w: 10, h: 38, x: 466, y: 439}, {w: 12, h: 38, x: 466, y: 481},
	{w: 37, h: 124, x: 563, y: 408}, {w: 55, h: 152, x: 733, y: 436},
	{w: 60, h: 64, x: 660, y: 523}, {w: 51, h: 48, x: 737, y: 386}]
];

playerNormal.src = "sprite/Player.png";
playerShot.src = "sprite/PlayerShot.png";
playerLegs.src = "sprite/PlayerLegs.png";
playerLegsMove1.src = "sprite/PlayerLegsMove1.png";
playerLegsMove2.src = "sprite/PlayerLegsMove2.png";
playerLegsMove3.src = "sprite/PlayerLegsMove3.png";
playerLegsMove4.src = "sprite/PlayerLegsMove4.png";
playerLegsMove5.src = "sprite/PlayerLegsMove5.png";
playerLegsMove6.src = "sprite/PlayerLegsMove6.png";
player = {
	w: 110, h: 92, x: (width / 2), y: (height / 2),
	top: {a: 0, img: playerNormal},
	bottom: {a: 0, img: playerLegs},
	move: false, shot: false,
	direction: {up: false, down: false, left: false, right: false},
	collision: {up: false, down: false, left: false, right: false},
	draw: function() {
		//bottom
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.bottom.a);
		ctx.drawImage(player.bottom.img, -(this.w / 2), -(this.h / 2));
		ctx.restore();
		//Top
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.top.a);
		ctx.drawImage(player.top.img, -(this.w / 2), -(this.h / 2));
		ctx.restore();
	}
};

backgroundStart.src = "sprite/BackgroundMain2.png";
backgroundLevel01.src = "sprite/BackgroundLevel01.png";
background = {
	lvl: [
		{w: 800, h: 600, x: 0, y: 0, img: backgroundStart},
		{w: 1600, h: 1200, x: 0, y: 0, img: backgroundLevel01}
	],
	draw: function() {
		ctx.save();
		ctx.drawImage(this.lvl[lvl].img, this.lvl[lvl].x, this.lvl[lvl].y);
		ctx.restore();
	}
};

shadowLevel01.src = "sprite/ShadowLevel01.png";
shadow = {
	lvl: [
		{w: 1600, h: 1200, x: 0, y: 0, img: shadowLevel01}
	],
	draw: function() {
		ctx.save();
		if (lvl != 0) ctx.drawImage(this.lvl[lvl - 1].img, this.lvl[lvl - 1].x, this.lvl[lvl - 1].y);
		ctx.restore();
	}
};

viewNormal.src = "sprite/Viewfinder.png";
viewRed.src = "sprite/ViewfinderRed.png";
viewfinder = {
	w: 21, h: 21, x: 0, y: 0,
	draw: function() {
		ctx.save();
		ctx.drawImage(viewNormal, this.x - 10, this.y - 10);
		ctx.restore();
	}
};

particule = {
	x: 0, y: 0,
	draw: function() {
		for(let i = 0; particules[i]; i++) {
			ctx.save();
			ctx.fillStyle = "#fbdd8d";
			if (particules[i].a > 0) ctx.arc(particules[i].x, particules[i].y, particules[i].a, 0, Math.PI * 2, false);
			ctx.restore();
			particules[i].x = particules[i].vx;
			particules[i].y = particules[i].vy;
			particules[i].a = Math.max(particules[i].a - 0.05, 0.0);
		}
	}
};

ball = {
	w: 10, h: 2, draw: function() {
		for (let i = 0; balls[i]; i++) {
			ctx.save();
			if (collide(balls[i], wall) == false) {
				ctx.translate(balls[i].x, balls[i].y);
				ctx.rotate(balls[i].a);
				ctx.fillStyle = "#fbdd8d";
				ctx.fillRect(player.w / 2, 16, this.w, this.h);
			}
			ctx.restore();
		}
	}
};

startBtn = {
	w:  100, h: 40, x: (width / 2 - 50), y: (height / 2 - 25),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseligne = "middle";
		ctx.fillStyle = "#fff";
		ctx.fillText("Start", (width / 2), (height / 2));
		ctx.restore();
	}
};
restartBtn = {
	w: 100, h: 50, x: (width / 2 - 50), y: (height / 2 - 50),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "#fff";
		ctx.fillText("Restart", (width / 2), (height / 2 - 25));
		ctx.restore();
	}
};

function collide(a, b) {
	let index, tmp;
	let aX, aY, aW, aH, bX, bY, bW, bH;
	if (a == player) {
		tmp = 10;
		aX = a.x - (a.w / 2);
		aY = a.y - (a.h / 2);
	}
	else {
		tmp = 10;
		aX = a.x + (player.w / 2);
		aY = a.y + 16;
	}
	aW = a.w;
	aH = a.h;
	if ((b == walls) || (b == furniture)) index = lvl - 1;
	for (let i = 0; walls[0][i]; i++) {
		bX = walls[0][i].x;
		bY = walls[0][i].y;
		bW = walls[0][i].w;
		bH = walls[0][i].h;
		if ((aX >= bX) && (aX <= (bX + bW)) || (((aX + aW) >= bX) && (aX <= bX))) {
			if ((aY >= (bY + (bH - tmp))) && (aY <= (bY + bH))) a.collision.up = true;
			if (((aY + aH) >= bY) && ((aY + aH) <= (bY + tmp))) a.collision.down = true;
		}
		if ((aY >= bY) && (aY <= (bY + bH)) || (((aY + aH) >= bY) && (aY <= bY))) {
			if ((aX >= (bX + (bW - tmp))) && (aX <= (bX + bW))) a.collision.left = true;
			if (((aX + aW) >= bX) && ((aX + aW) <= (bX + tmp))) a.collision.right = true;
		}
	}
};
function resetCollide(a) {
	a.collision.right = false;
	a.collision.left = false;
	a.collision.up = false;
	a.collision.down = false;
};
function wallDraw() {
	ctx.save();
	ctx.fillStyle = "blue";
	for (let i = 0; walls[0][i]; i++) ctx.fillRect(walls[0][i].x, walls[0][i].y, walls[0][i].w, walls[0][i].h);
	ctx.restore();
};
function furnitureDraw() {
	ctx.save();
	ctx.fillStyle = "red";
	for (let i = 0; furnitures[0][i]; i++) ctx.fillRect(furnitures[0][i].x, furnitures[0][i].y, furnitures[0][i].w, furnitures[0][i].h);
	ctx.restore();
};

function draw() {
	background.draw();
	player.draw();
	shadow.draw();
	ball.draw();
	viewfinder.draw();
	wallDraw();
	furnitureDraw();
	update();
};

function trackPosition (event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
};

function update() {
	if (mouse.x && mouse.y) {
		player.top.a = Math.atan2(mouse.y - player.y, mouse.x - player.x);
		viewfinder.x = mouse.x;
		viewfinder.y = mouse.y;
	}
	collide(player, walls);
	if (player.direction.right && !player.collision.right) {
		if ((background.lvl[lvl].x + background.lvl[lvl].w == width)
		|| (player.x != width / 2)) player.x += 4;
		else {
			background.lvl[lvl].x -= 4;
			shadow.lvl[lvl - 1].x -= 4;
			for (let i = 0; walls[0][i]; i++) walls[0][i].x -=4;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].x -=4;
			for (let i = 0; balls[i]; i++) balls[i].x -=4;
		}
	}
	if (player.direction.left && !player.collision.left) {
		if ((background.lvl[lvl].x == 0) || (player.x != width / 2)) player.x -= 4;
		else {
			background.lvl[lvl].x += 4;
			shadow.lvl[lvl - 1].x += 4;
			for (let i = 0; walls[0][i]; i++) walls[0][i].x +=4;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].x +=4;
			for (let i = 0; balls[i]; i++) balls[i].x +=4;
		}
	}
	if (player.direction.up && !player.collision.up) {
		if ((background.lvl[lvl].y == 0) || (player.y != height / 2)) player.y -= 4;
		else {
			background.lvl[lvl].y += 4;
			shadow.lvl[lvl - 1].y += 4;
			for (let i = 0; walls[0][i]; i++) walls[0][i].y +=4;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].y +=4;
			for (let i = 0; balls[i]; i++) balls[i].y +=4;
		}
	}
	if (player.direction.down && !player.collision.down) {
		if ((background.lvl[lvl].y + background.lvl[lvl].h == height)
		|| (player.y != height / 2)) player.y += 4;
		else {
			background.lvl[lvl].y -= 4;
			shadow.lvl[lvl - 1].y -= 4;
			for (let i = 0; walls[0][i]; i++) walls[0][i].y -=4;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].y -=4;
			for (let i = 0; balls[i]; i++) balls[i].y -=4;
		}
	}
	resetCollide(player);
	/*for (let i = 0; balls[i]; i++) {
		let vx, vy;
		vx = Math.sin(balls[i].a) * 5;
		vy = Math.cos(balls[i].a) * 5;
		if (collide(balls[i], wall) == false) {
			balls[i].x += vy;
			balls[i].y += vx;
		} else {
			if (up == true);
			if (down == true);
			if (left == true);
			if (right == true);
			balls.splice(i, 1);
			resetCollide();
		}
	}*/
	if (life == 0) GamOver();
	updateLife();
};
function updateScore() {
	ctx.save();
	ctx.fillStyle = "#fff";
	ctx.font = "20px 'btn',arial,sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + point, 20, 20 );
	ctx.restore();
};
function updateLife() {
	let color;
	if (life <= 25) color = "#DC143C";
	else if ((life <= 50) && (life > 25)) color = "#FFD700";
	else color = "#008000";
	ctx.save();
	ctx.strokeStyle = "#ffffff";
	ctx.fillStyle = color;
	ctx.lineWidth = "2";
	ctx.strokeRect(670, 555, 102, 17);
	ctx.fillRect(671, 556, life, 15);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(650, 554, 19, 19);
	ctx.fillStyle = "#DC143C";
	ctx.fillRect(656, 556, 7, 15);
	ctx.fillRect(652, 560, 15, 7);
	ctx.restore();
};

function startScreen() {
	background.draw();
	startBtn.draw();
} startScreen();

function click(event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
	if (lvl != 0) {
		balls.push({x: player.x, y: player.y, a: player.a});
		shot = true;
	}
	if ((mouse.x >= startBtn.x && mouse.x <= startBtn.x + startBtn.w)
	&& (mouse.y >= startBtn.y && mouse.y <= startBtn.y + startBtn.h)) {
		animLoop();
		startBtn = {};
		lvl = 1;
		canvas.style.cursor = "none";
	}
	if (over == 1) {
		if ((mouse.x >= restartBtn.x && mouse.x <= restartBtn.x + restartBtn.w)
		&& (mouse.y >= restartBtn.y && mouse.y <= restartBtn.y + restartBtn.h)) {
			animLoop();
			over = 0;
			lvl = 1;
			point = 0;
			life = 100;
		}
	}
};

function animLoop() {
	init = requestAnimFrame(animLoop);
	draw();
};

function gameOver() {
	ctx.save();
	ctx.font = "20px 'over',arial,sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseligne = "middle";
	ctx.fillStyle = "#fff";
	ctx.fillText("Game Over - You scored " + point + " points !", (W / 2), (H / 2 + 25));
	ctx.restore();
	cancelRequestAnimFrame(init);
	over = 1;
	restartBtn.draw();
};

KEY_DOWN	= 40;
KEY_UP		= 38;
KEY_LEFT	= 37;
KEY_RIGHT	= 39;
KEY_Z		= 90;
KEY_S		= 83;
KEY_Q		= 81;
KEY_D		= 68;

function CheckEvent(event) {
	if (window.event) return window.event;
	else return event;
};
function KeyDown(event) {
	let WinObject = CheckEvent(event);
	let key = WinObject.keyCode;
	if (lvl != 0) {
		if (key == KEY_RIGHT || key == KEY_D) player.direction.right = true;
		if (key == KEY_LEFT || key == KEY_Q) player.direction.left = true;
		if (key == KEY_UP || key == KEY_Z) player.direction.up = true;
		if (key == KEY_DOWN || key == KEY_S) player.direction.down = true;
	}
};
function KeyUp(event) {
	let WinObject = CheckEvent(event);
	let key = WinObject.keyCode;
	if (lvl != 0) {
		if (key == KEY_RIGHT || key == KEY_D) player.direction.right = false;
		if (key == KEY_LEFT || key == KEY_Q) player.direction.left = false;
		if (key == KEY_UP || key == KEY_Z) player.direction.up = false;
		if (key == KEY_DOWN || key == KEY_S) player.direction.down = false;
	}
};
