window.requestAnimFrame = (function() {
	return (window.requestAnimationFrame 		||
		window.webkitRequestAnimationFrame 	||
		window.mozRequestAnimationFrame 	||
		window.oRequestAnimationFrame 		||
		window.msRequestAnimationFrame 		||
		function (callback) {
			return window.setTimeout(callback, 1000 / Fps);
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
	
	StartBtn = {},
	RestartBtn = {},
	mouse = {},
	
	Background = {},
	BackgroundStart = new Image(),
	BackgroundLevel01 = new Image(),
	
	Player = {},
	PlayerNormal = new Image(),
	PlayerShot = new Image(),
	
	Point = 0,
	Life = 100,
	Level = 0,
	Fps = 60,
	Ball = {},
	Blood = {},
	BloodCount = 20,
	Over = 0,
	sound = {},
	Init;

canvas.addEventListener("mousemove", TrackPosition, true);
canvas.addEventListener("mousedown", BtnClick, true);
window.onkeydown = KeyDown;

canvas.height = H;
canvas.width = W;

Mouse = {x: 0, y: 0};

ball = {x: 0, y: 0};

PlayerNormal.src = "img/Player.png";
PlayerShot.src = "img/PlayerShot.png";
Player = {
	w: 55, h: 46, x: (W / 2 - 46), y: (H / 2 - 55), a: 0,
	draw: function(type) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.a);
		if (type == "normal") ctx.drawImage(PlayerNormal, -(this.w / 2), -(this.h / 2));
		if (type == "shot") {
			ctx.drawImage(PlayerShot, -(this.w / 2), 0);	
		}
		ctx.restore();
	}
};

BackgroundStart.src = "img/BackgroundMain.png";
BackgroundLevel01.src = "img/BackgroundLevel01.png";
Background = {
	w: 800, h:600, x: 0, y: 0,
	draw: function() {
		ctx.save();
		if (Over == 1) ctx.drawImage(BackgroundStart, this.x, this.y);
		else ctx.drawImage(BackgroundLevel01, this.x, this.y);
		ctx.restore();
	}
};

StartBtn = {
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
RestartBtn = {
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

function Draw() {
	Background.draw();
	Player.draw("normal");
	Update();
};

function TrackPosition (event) {
	Mouse.x = event.pageX;
	Mouse.y = event.pageY;
};

function Update() {
	if (Mouse.x && Mouse.y) {
		Player.a = Math.atan2(Mouse.y - Player.y, Mouse.x - Player.x);
	}
	console.log("update");
	if (Life == 0) GamOver();
	UpdateLife();	
};
function UpdateScore() {
	ctx.save();
	ctx.fillStyle = "#fff";
	ctx.font = "20px 'btn',arial,sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + Point, 20, 20 );
	ctx.restore();
};
function UpdateLife() {
	let color;
	if (Life <= 25) color = "#DC143C";
	if ((Life <= 50) && (Life > 25)) color = "#FFD700";
	else color = "#008000";
	ctx.save();
	ctx.strokeStyle = "#ffffff";
	ctx.fillStyle = color;
	ctx.lineWidth = "2";
	ctx.strokeRect(670, 555, 102, 17);
	ctx.fillRect(671, 556, Life, 15);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(650, 554, 19, 19);
	ctx.fillStyle = "#DC143C";
	ctx.fillRect(656, 556, 7, 15);
	ctx.fillRect(652, 560, 15, 7);
	ctx.restore();
};

function StartScreen() {
	StartBtn.draw();
};
StartScreen();

function BtnClick(event) {
	let mx = event.pageX, my = event.pageY;
	if ((mx >= StartBtn.x && mx <= StartBtn.x + StartBtn.w) && (my >= StartBtn.y && my <= StartBtn.y + StartBtn.h)) {
		AnimLoop();
		StartBtn = {};
		Level = 1;
	}
	if (Over == 1) {
		if ((mx >= RestartBtn.x && mx <= RestartBtn.x + RestartBtn.w) && (my >= RestartBtn.y && my <= RestartBtn.y + RestartBtn.h)) {
			AnimLoop();
			Over = 0;
			Level = 1;
			Point = 0;
			Life = 100;
		}
	}
};
function AnimLoop() {
	Init = requestAnimFrame(AnimLoop);
	Draw();
};
function GameOver() {
	ctx.save();
	ctx.font = "20px 'over',arial,sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseligne = "middle";
	ctx.fillStyle = "#fff";
	ctx.fillText("Game Over - You scored "+Point+" points !", (W / 2), (H / 2 + 25));
	ctx.restore();
	cancelRequestAnimFrame(Init);
	Over = 1;
	RestartBtn.draw();
};

KEY_DOWN	= 40;
KEY_UP		= 38;
KEY_LEFT	= 37;
KEY_RIGHT	= 39;

function CheckEvent(event) {
	if (window.event) return window.event;
	else return event;
};
function KeyDown(event) {
	let WinObject = CheckEvent(event);
	if (!(Level == 0)) {
		if (WinObject.keyCode == KEY_RIGHT) Player.x += 4;
		if (WinObject.keyCode == KEY_LEFT) Player.x -= 4;
		if (WinObject.keyCode == KEY_UP) Player.y -= 4;
		if (WinObject.keyCode == KEY_DOWN) Player.y += 4;
	}
};
