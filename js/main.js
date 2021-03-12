const baseUrl = 'http:/localhost:88';

var canvas = document.getElementById("canvas");  // 布置画布
var context = canvas.getContext("2d");
var canvasWidth, canvasHeight;  // 画布大小
var boxHeight, boxWidth;  // 棋盘大小
var paddingX, paddingY;   // 棋盘距离外框的距离
var ceilWidth, ceilHeight;  // 格子大小
var chessSize;   // 棋子大小
var chessFontSize;  // 棋子文字大小
var mark = new Array();   // 标记棋盘上该位置是否有棋子
var move = '';   // 上一步走子记录
var moves = new Array();  // 走子记录
var clickNewGame = null;
// 棋子对象
var redKing = new Chess("red", "帅", 0, 4);
	redGuard1 = new Chess("red", "士", 0, 3);
	redGuard2 = new Chess("red", "士", 0, 5);
	redBishop1 = new Chess("red", "相", 0, 2);
	redBishop2 = new Chess("red", "相", 0, 6);
	redKnight1 = new Chess("red", "马", 0, 1);
	redKnight2 = new Chess("red", "马", 0,7);
	redRook1 = new Chess("red", "车", 0, 0);
	redRook2 = new Chess("red", "车", 0, 8);
	redCannon1 = new Chess("red", "炮", 2, 1);
	redCannon2 = new Chess("red", "炮", 2, 7);
	redPawn1 = new Chess("red", "兵", 3, 0);
	redPawn2 = new Chess("red", "兵", 3, 2);
	redPawn3 = new Chess("red", "兵", 3, 4);
	redPawn4 = new Chess("red", "兵", 3, 6);
	redPawn5 = new Chess("red", "兵", 3, 8);
var blackKing = new Chess("black", "将", 9, 4);
	blackGuard1 = new Chess("black", "士", 9, 3);
	blackGuard2 = new Chess("black", "士", 9, 5);
	blackBishop1 = new Chess("black", "象", 9, 2);
	blackBishop2 = new Chess("black", "象", 9, 6);
	blackKnight1 = new Chess("black", "马", 9, 1);
	blackKnight2 = new Chess("black", "马", 9,7);
	blackRook1 = new Chess("black", "车", 9, 0);
	blackRook2 = new Chess("black", "车", 9, 8);
	blackCannon1 = new Chess("black", "炮", 7, 1);
	blackCannon2 = new Chess("black", "炮", 7, 7);
	blackPawn1 = new Chess("black", "卒", 6, 0);
	blackPawn2 = new Chess("black", "卒", 6, 2);
	blackPawn3 = new Chess("black", "卒", 6, 4);
	blackPawn4 = new Chess("black", "卒", 6, 6);
	blackPawn5 = new Chess("black", "卒", 6, 8);
var isClick = false;
var firstChess, firstChessX, firstChessY;
var turn = 0;  // 偶数表示轮到红棋落子，奇数表示轮到黑棋落子
var room;
var isOver = false;  // 为true时即游戏结束不能再移动棋子
var timer;
$(function(){
	responsive();     // 响应式设计
	checkerboard();    // 绘制棋盘
	init();
	$("#roomId").val("");
});

// 实时监听鼠标点击
window.onmousedown = function(event) {
	var toLeft = event.clientX - canvas.offsetLeft - paddingX;
	var toTop = event.clientY - canvas.offsetTop - paddingY;
	var chessY = Math.round(toLeft / ceilWidth);    // 所点击位置的行列
	var chessX = Math.round(toTop / ceilHeight);
	// 点击范围需要在棋盘中
	if (!(chessY >= 0 && chessY <= 8 && chessX >= 0 && chessX <= 9 && isOver !== true)) {
		return;
	}
	if (!clientInfo) {
		showDialog('请先进入房间再开始游戏');
		return;
	}
	if (clientInfo.group === 2) {
		showDialog('你是观众，不能下棋');
		return;
	}
	if (turn % 2 !== clientInfo.group && mark[chessX][chessY] !== 0) {
		showDialog('轮到对方下棋了');
		return;
	}
	if (isClick === false && mark[chessX][chessY] !== 0) {    // 第一次点击 && 点击到了棋子
		if ((mark[chessX][chessY].group === "black" && clientInfo.group === 0) ||
			(mark[chessX][chessY].group === "red" && clientInfo.group === 1)) {
			showDialog("不能控制对方的棋子");
		}
		else {
			firstChess = Object.assign(mark[chessX][chessY]);    // 记录点击的棋子
			firstChessX = chessX;
			firstChessY = chessY;
			isClick = true;        // 标记已有第一次点击
			drawChess(mark[chessX][chessY], true);
		}
	}
	else if(isClick === true) {    	// 第二次点击
		if(mark[chessX][chessY].group === firstChess.group){  // 第二次点击，点击到己方的棋子则无效
			isClick = false;
			showDialog("该位置已经有己方棋子存在了,请重新选择要移动的棋子");
			drawChess(firstChess, false);
			return;
		}
		// 第二次点击，点击到空位或对方棋子了
		if(isConformRule(firstChess, firstChess.x, firstChess.y, chessX, chessY)){
			turn++;
			move = getNotion(firstChess, firstChess.x, firstChess.y, chessX, chessY);
			sentChatMessage(move);

			if (mark[chessX][chessY].name === "将" || mark[chessX][chessY].name === "帅") {
				isOver = true;
			}

			mark[chessX][chessY] = Object.assign(firstChess);  // 将棋子移动到第二次点击的位置
			mark[chessX][chessY].x = chessX;
			mark[chessX][chessY].y = chessY;
			mark[firstChessX][firstChessY] = 0;  // 清除第一次点击的棋子的所在位置, 在init函数中mark数组已经是指向棋子对象的引用了！
			isClick = false;
			if($("#roomId").val().trim() !== '') {  // 如果没有填写房间号则是单人模式，不需用到服务器
				// 通知服务器更新，
				callServer();
			}
			playAudio();  // 播放下棋音效
		}
		else {
			isClick = false;
			showDialog("棋子移动不符合规则,请重新选择要移动的棋子");
			drawChess(firstChess, false);
		}
	}
}

// 播放下棋的音效
function playAudio(){
	var audio = document.getElementById("audio");
	audio.play();
}

// 实时监听浏览器宽高变化
$(window).resize(function() {
	responsive();
	checkerboard();
	changeChess();
});

// 棋子的构造函数
function Chess(group, name, x, y) {
	this.group = group;
	this.name= name;
	this.x = x;
	this.y = y;
}

// 响应式设计
function responsive() {
	// 获取浏览器可使用的宽高
	var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	// 通过获取浏览器宽高中的较小值来设置棋盘大小
	var minLength = Math.min(browserWidth, browserHeight) * 0.9;
	canvas.height = Math.ceil(minLength);
	canvas.width = Math.ceil(minLength / 9 * 8);
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	ceilWidth = canvasWidth / 9;
	ceilHeight = canvasHeight / 10;
	paddingX =  ceilWidth / 2;
	paddingY =  ceilHeight / 2;
	boxWidth = canvasWidth - paddingX * 2;
	boxHeight = canvasHeight - paddingY * 2 ;
	chessSize = Math.ceil(ceilWidth * 0.4);
	chessFontSize = Math.ceil(chessSize * 0.7);
	$(".box").width(canvasWidth).height(canvasHeight);
}

// 初始化mark数组
function init() {
	for(var i=0; i<=9; i++){
		mark[i] = new Array();
		for(var j=0; j<=8; j++){
			mark[i][j] = 0;
		}
	}
	redKing = new Chess("red", "帅", 0, 4);
	redGuard1 = new Chess("red", "士", 0, 3);
	redGuard2 = new Chess("red", "士", 0, 5);
	redBishop1 = new Chess("red", "相", 0, 2);
	redBishop2 = new Chess("red", "相", 0, 6);
	redKnight1 = new Chess("red", "马", 0, 1);
	redKnight2 = new Chess("red", "马", 0,7);
	redRook1 = new Chess("red", "车", 0, 0);
	redRook2 = new Chess("red", "车", 0, 8);
	redCannon1 = new Chess("red", "炮", 2, 1);
	redCannon2 = new Chess("red", "炮", 2, 7);
	redPawn1 = new Chess("red", "兵", 3, 0);
	redPawn2 = new Chess("red", "兵", 3, 2);
	redPawn3 = new Chess("red", "兵", 3, 4);
	redPawn4 = new Chess("red", "兵", 3, 6);
	redPawn5 = new Chess("red", "兵", 3, 8);
	blackKing = new Chess("black", "将", 9, 4);
	blackGuard1 = new Chess("black", "士", 9, 3);
	blackGuard2 = new Chess("black", "士", 9, 5);
	blackBishop1 = new Chess("black", "象", 9, 2);
	blackBishop2 = new Chess("black", "象", 9, 6);
	blackKnight1 = new Chess("black", "马", 9, 1);
	blackKnight2 = new Chess("black", "马", 9,7);
	blackRook1 = new Chess("black", "车", 9, 0);
	blackRook2 = new Chess("black", "车", 9, 8);
	blackCannon1 = new Chess("black", "炮", 7, 1);
	blackCannon2 = new Chess("black", "炮", 7, 7);
	blackPawn1 = new Chess("black", "卒", 6, 0);
	blackPawn2 = new Chess("black", "卒", 6, 2);
	blackPawn3 = new Chess("black", "卒", 6, 4);
	blackPawn4 = new Chess("black", "卒", 6, 6);
	blackPawn5 = new Chess("black", "卒", 6, 8);
	mark[0][0] = redRook1;
	mark[0][1] = redKnight1;
	mark[0][2] = redBishop1;
	mark[0][3] = redGuard1;
	mark[0][4] = redKing;
	mark[0][5] = redGuard2;
	mark[0][6] = redBishop2;
	mark[0][7] = redKnight2;
	mark[0][8] = redRook2;
	mark[2][1] = redCannon1;
	mark[2][7] = redCannon2;
	mark[3][0] = redPawn1;
	mark[3][2] = redPawn2;
	mark[3][4] = redPawn3;
	mark[3][6] = redPawn4;
	mark[3][8] = redPawn5;
	mark[9][0] = blackRook1;
	mark[9][1] = blackKnight1;
	mark[9][2] = blackBishop1;
	mark[9][3] = blackGuard1;
	mark[9][4] = blackKing;
	mark[9][5] = blackGuard2;
	mark[9][6] = blackBishop2;
	mark[9][7] = blackKnight2;
	mark[9][8] = blackRook2;
	mark[7][1] = blackCannon1;
	mark[7][7] = blackCannon2;
	mark[6][0] = blackPawn1;
	mark[6][2] = blackPawn2;
	mark[6][4] = blackPawn3;
	mark[6][6] = blackPawn4;
	mark[6][8] = blackPawn5;
	turn = 0;
	isOver = false;
    clickNewGame = null;
    moves = new Array();
	changeChess();
}

// 根据标记数组绘制棋子
function changeChess() {
	context = canvas.getContext("2d");  // 需要重新布置画布才能及时显示棋子，画在canvas上的东西不会凭空产生消失
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	checkerboard();
	 for(var i=0; i<=9; i++){
		for(var j=0; j<=8; j++){
			drawChess(mark[i][j]);
		}
	}
	gameOver();
}

// 进入房间
$("#btn").click(function(){
	const val = $("#roomId").val();
	if(val.trim() === "") {
		showDialog('若要进入联机模式则房间号不能为空');
		return;
	}
	if (!/^[\d]+$/.test(val)) {
		showDialog('房间号只能为数字');
		return;
	}
	if (val === room) {
		showDialog('你已经在 ' + room + ' 房间了');
		return;
	}
	if (val !== room) {
		closeWs();
		init();
	}
	room = val;
	// 进入房间后建立websocket
	establishWS();
});

// 重新开始
$("#new").click(function() {
	if (clientInfo && clientInfo.group === 2) {
		showDialog('你是观众，不能重新开始游戏');
	} else if (clientInfo && clientInfo.group !== 2)
		init();
		clickNewGame = clientInfo.group;
		callServer();
		clickNewGame = null;
});

function gameOver() {
	if(!isOver) {
		return;
	}
	var redFail = true;
	for(var i=0; i<=2; i++) {
		for(var j=3; j<=5; j++) {
			if(mark[i][j] !== 0 && mark[i][j].name === "帅"){
				redFail = false;
			}
		}
	}
	alert(`${redFail ? '黑棋' : '红棋'}胜!\n双方共行了${turn}步棋。`);
}

$('#textarea').on('keydown', function(e) {
	if (e.keyCode === 13) {
		if (!clientInfo) {
			showDialog('进入房间后才能发送消息哦');
			return;
		}
		if (e.target.value.trim() === '') {
			showDialog('不能发送空消息');
			return;
		}
		sentChatMessage(e.target.value);
	}
})

$('#textarea').on('keyup', function(e) {
	if (e.keyCode === 13) {
		$('#textarea').val('');
	}
})

// 显示聊天室信息
function showChatMessage(message) {
	const messageArr = message.split('/\end\n/');
	const $fragment = $(document.createDocumentFragment());
	messageArr.forEach(function(val) {
		const {identity, text, date} = JSON.parse(val);
		const str = `${identity}: ${text}`.replace(/</g, "%3C").replace(/>/g, "%3E"); // 转义 < 和 >，防止xss攻击
		$fragment.append(`<div class="font-box" data-identity=${identity}><p>${str}</p><p class="message-date">—${date}</p></div>`);
	})
	$('#messageBox').empty();
	$('#messageBox').append($fragment);
}
