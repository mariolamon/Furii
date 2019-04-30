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
	player = {},
	playerNormal = new Image(),
	playerShot = new Image(),
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

wall = [
	[{w: 1580, h: 14, x: 10, y: 10}, {w: 14, h: 1180, x: 10, y: 10},
	{w: 1580, h: 14, x: 10, y: 1176}, {w: 14, h: 1180, x: 1576, y: 10},
	{w: 128, h: 14, x: 24, y: 422}, {w: 226, h: 14, x: 314, y: 422},
	{w: 14, h: 412, x: 526, y: 24}, {w: 14, h: 612, x: 528, y: 564},
	{w: 128, h: 14, x: 24, y: 564}, {w: 226, h: 14, x: 314, y: 564},
	{w: 26, h: 26, x: 1150, y: 630}, {w: 14, h: 14, x: 1156, y: 1146}]
];
furniture = [
	[{w: 133, h: 45, x: 16, y: 21}, {w: 12, h: 54, x: 12, y: 92},
	{w: 37, h: 16, x: 213, y: 15}, {w: 39, h: 80, x: 224, y: 131},
	{w: 100, h: 133, x: 87, y: 455}, {w: 39, h: 35, x: 33, y: 548},
	{w: 39, h: 35, x: 200, y: 547}, {w: 136, h: 169, x: 355, y: 330},
	{w: 38, h: 19, x: 391, y: 311}, {w: 107, h: 37, x: 157, y: 288},
	{w: 20, h: 37, x: 335, y: 341}, {w: 10, h: 38, x: 345, y: 387},
	{w: 12, h: 38, x: 343, y: 432}, {w: 12, h: 38, x: 343, y: 474},
	{w: 12, h: 38, x: 466, y: 348}, {w: 16, h: 38, x: 466, y: 394},
	{w: 10, h: 38, x: 466, y: 439}, {w: 12, h: 38, x: 466, y: 481},
	{w: 37, h: 124, x: 563, y: 408}, {w: 55, h: 152, x: 733, y: 436},
	{w: 60, h: 64, x: 660, y: 523}, {w: 51, h: 48, x: 737, y: 386}]
];

playerNormal.src = "sprite/Player.png";
playerShot.src = "sprite/PlayerShot.png";
player = {
	w: 110, h: 92, x: (width / 2 - 55), y: (height / 2 - 46), a: 0,
	up: false, down: false, left: false, right: false,
	draw: function() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.a);
		if (shot == false) ctx.drawImage(playerNormal, -(this.w / 2), -(this.h / 2));
		else if (shot == true) ctx.drawImage(playerShot, -(this.w / 2), -(this.h / 2));
		ctx.restore();
	}
};

backgroundStart.src = "sprite/BackgroundMain1.png";
backgroundLevel01.src = "sprite/BackgroundLevel01.png";
background = {
	lvl: [
		{w: 800, h: 600, x: 0, y: 0, img: backgroundStart},
		{w: 1600, h: 1200, x: 0, y: 0, img: backgroundLevel01}
	],
	draw: function() {
		ctx.save();
		if (over == 1) ctx.drawImage(this.lvl[0].img, this.lvl[0].x, this.lvl[0].y);
		else ctx.drawImage(this.lvl[1].img, this.lvl[1].x, this.lvl[1].y);
		ctx.restore();
	}
};

shadowLevel01.src = "sprite/ShadowLevel01.png";
shadow = {
	lvl: [
		{},
		{w: 1600, h: 1200, x: 0, y: 0, img: shadowLevel01},
	],
	draw: function() {
		ctx.save();
		ctx.drawImage(this.lvl[1].img, this.lvl[1].x, this.lvl[1].y);
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

function scrolling () {
}
function collide(elementA, elementB) {
	let index, t;
	let aX, aY, aW, aH, bX, bY, bW, bH;
	if (elementA == player) {
		t = 6;
		aX = elementA.x - (elementA.w / 2);
		aY = elementA.y - (elementA.h / 2);
	}
	else {
		t = 10;
		aX = elementA.x + (player.w / 2);
		aY = elementA.y + 16;
	}
	aW = elementA.w;
	aH = elementA.h;
	if ((elementB == wall) || (elementB == furniture)) index = lvl - 1;
	for (let i = 0; elementB[index][i]; i++) {
		bX = elementB[index][i].x;
		bY = elementB[index][i].y;
		bW = elementB[index][i].w;
		bH = elementB[index][i].h;
		if ((aX >= bX) && (aX <= (bX + bW)) || (((aX + aW) >= bX) && (aX <= bX))) {
			if ((aY >= (bY + (bH - t))) && (aY <= (bY + bH))) up = true;
			if (((aY + aH) >= bY) && ((aY + aH) <= (bY + t))) down = true;
		}
		if ((aY >= bY) && (aY <= (bY + bH)) || (((aY + aH) >= bY) && (aY <= bY))) {
			if ((aX >= (bX + (bW - t))) && (aX <= (bX + bW))) left = true;
			if (((aX + aW) >= bX) && ((aX + aW) <= (bX + t))) right = true;
		}
	}
	if (up == true || down == true || left == true || right == true) return true;
	else return false;
};
function wallDraw() {
	ctx.save();
	ctx.fillStyle = "red";
	for (let i = 0; wall[0][i]; i++) ctx.fillRect(wall[0][i].x, wall[0][i].y, wall[0][i].w, wall[0][i].h);
	ctx.restore();
};

function draw() {
	background.draw();
	player.draw();
	shadow.draw();
	ball.draw();
	viewfinder.draw();
	wallDraw();
	update();
};

function trackPosition (event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
};

function update() {
	if (mouse.x && mouse.y) {
		player.a = Math.atan2(mouse.y - player.y, mouse.x - player.x);
		viewfinder.x = mouse.x;
		viewfinder.y = mouse.y;
	}
	if (player.right) {
		background.lvl[1].x -= 4;
		shadow.lvl[1].x -= 4;
		for (let i = 0; wall[0][i]; i++) wall[0][i].x -=4;
		for (let i = 0; balls[i]; i++) balls[i].x -=4;
	}
	if (player.left) {
		background.lvl[1].x += 4;
		shadow.lvl[1].x += 4;
		for (let i = 0; wall[0][i]; i++) wall[0][i].x +=4;
		for (let i = 0; balls[i]; i++) balls[i].x +=4;
	}
	if (player.up) {
		background.lvl[1].y += 4;
		shadow.lvl[1].y += 4;
		for (let i = 0; wall[0][i]; i++) wall[0][i].y +=4;
		for (let i = 0; balls[i]; i++) balls[i].y +=4;
	}
	if (player.down) {
		background.lvl[1].y -= 4;
		shadow.lvl[1].y -= 4;
		for (let i = 0; wall[0][i]; i++) wall[0][i].y -=4;
		for (let i = 0; balls[i]; i++) balls[i].y -=4;
	}
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
	console.log(balls);
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
		if (key == KEY_RIGHT || key == KEY_D) player.right = true;
		if (key == KEY_LEFT || key == KEY_Q) player.left = true;
		if (key == KEY_UP || key == KEY_Z) player.up = true;
		if (key == KEY_DOWN || key == KEY_S) player.down = true;
	}
};
function KeyUp(event) {
	let WinObject = CheckEvent(event);
	let key = WinObject.keyCode;
	if (lvl != 0) {
		if (key == KEY_RIGHT || key == KEY_D) player.right = false;
		if (key == KEY_LEFT || key == KEY_Q) player.left = false;
		if (key == KEY_UP || key == KEY_Z) player.up = false;
		if (key == KEY_DOWN || key == KEY_S) player.down = false;
	}
};
