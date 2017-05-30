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
	H = 600,
	W = 800,
	startBtn = {},
	restartBtn = {},
	mouse = {},
	viewfinder = {},
	viewNormal = new Image(),
	viewRed = new Image(),
	background = {},
	backgroundStart = new Image(),
	backgroundLevel01 = new Image(),
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

canvas.height = H;
canvas.width = W;

wall = [
	[{w: 790, h: 7, x: 5, y: 5}, {w: 7, h: 590, x: 5, y: 5},
	{w: 790, h: 7, x: 5, y: 588}, {w: 7, h: 590, x: 788, y: 5},
	{w: 64, h: 7, x: 12, y: 211}, {w: 113, h: 7, x: 157, y: 211},
	{w: 7, h: 206, x: 263, y: 12}, {w: 7, h: 306, x: 264, y: 282},
	{w: 64, h: 7, x: 12, y: 282}, {w: 113, h: 7, x: 157, y: 282},
	{w: 13, h: 13, x: 575, y: 315}, {w: 7, h: 14, x: 578, y: 573}]
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

playerNormal.src = "img/Player.png";
playerShot.src = "img/PlayerShot.png";
player = {
	w: 55, h: 46, x: (W / 2 - 46), y: (H / 2 - 55), a: 0,
	draw: function() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.a);
		if (shot == false) ctx.drawImage(playerNormal, -(this.w / 2), -(this.h / 2));
		else if (shot == true) ctx.drawImage(playerShot, -(this.w / 2), -(this.h / 2));
		ctx.restore();
	}
};

backgroundStart.src = "img/BackgroundMain.png";
backgroundLevel01.src = "img/BackgroundLevel01.png";
background = {
	w: 800, h:600, x: 0, y: 0,
	draw: function() {
		ctx.save();
		if (over == 1) ctx.drawImage(backgroundStart, this.x, this.y);
		else ctx.drawImage(backgroundLevel01, this.x, this.y);
		ctx.restore();
	}
};

viewNormal.src = "img/Viewfinder.png";
viewRed.src = "img/ViewfinderRed.png";
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
	w:  100, h: 40, x: (W / 2 - 50), y: (H / 2 - 25),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseligne = "middle";
		ctx.fillStyle = "#fff";
		ctx.fillText("Start", (W / 2), (H / 2));
		ctx.restore();
	}
};
restartBtn = {
	w: 100, h: 50, x: (W / 2 - 50), y: (H / 2 - 50),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "#fff";
		ctx.fillText("Restart", (W / 2), (H / 2 - 25));
		ctx.restore();
	}
};

function resetCollide() {
	up = false;
	down = false;
	left = false;
	right = false;
};
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
	ball.draw();
	player.draw();
	viewfinder.draw();
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
	for (let i = 0; balls[i]; i++) {
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
	}
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
	startBtn.draw();
} startScreen();

function click(event) {
	let mx = event.pageX, my = event.pageY;
	if (lvl != 0) {
		balls.push({x: player.x, y: player.y, a: player.a});
		shot = true;
	}
	if ((mx >= startBtn.x && mx <= startBtn.x + startBtn.w) && (my >= startBtn.y && my <= startBtn.y + startBtn.h)) {
		animLoop();
		startBtn = {};
		lvl = 1;
		canvas.style.cursor = "none";
	}
	if (over == 1) {
		if ((mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) && (my >= restartBtn.y && my <= restartBtn.y + restartBtn.h)) {
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
	resetCollide();
	collide(player, wall);
	collide(player, furniture);
	if (lvl != 0) {
		if ((key == KEY_RIGHT || key == KEY_D) && (right != true)) player.x += 6;
		if ((key == KEY_LEFT || key == KEY_Q) && (left != true)) player.x -= 6;
		if ((key == KEY_UP || key == KEY_Z) && (up != true)) player.y -= 6;
		if ((key == KEY_DOWN || key == KEY_S) && (down != true)) player.y += 6;
	}
};
