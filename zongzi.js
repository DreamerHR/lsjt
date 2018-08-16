(function () {
	var w = 375;
	var h = 600;
	var ctx;
	var tid = null;
	var time = 30;
	var gameOver = false;
	var fps = 1000 / 30;
	var jsq = 0;
	var score = 0; // 分数
	var person_speed = 5;
	var zz_speed = 10;
	var ps = 5;
	var zs = 10;
	var zzCont = 1;
	var zzArr = [];
	var bombArr = [];
	var throwzz = [40,45,50,55,60]; // 5*8 5*9 5*10 5*11 5*12
	var throwbomb = [5,6];
	var audioTracks= [ // 8 tracks is more than enough 
	     new Audio(), new Audio(), new Audio(), new Audio(), 
	     new Audio(), new Audio(), new Audio(), new Audio() 
	];
	var person;
	var personUrl = 'images/person2.png';
	var background = new Background('images/bg.png',0,0,w,h);
	var zongzi = new Zongzi('images/zongzi.png',0,10,40,40);
	var bomb = new Bomb('images/bomb.png',0,10,40,40);
	var cart = new Cart('images/cart.png', 0, h - 60 , 80, 60, 0, 0);
	var gang = new Gang('images/gang.png', -200, 100, w * 2, 30)
	person = new Person(personUrl,0,30,80,80);
	var sound;
	
	window.onload = function () {
		sound = new Sound();
		sound.oBgm.play();
		var canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		ctx = canvas.getContext('2d');
		document.onkeydown = keyDown;
		document.onkeyup = keyUp;
		canvas.onmousedown = mouseDown
		document.body.appendChild(canvas);
		tid = setInterval(drawAll, fps);
		tid2 = setInterval(function () {
			if (time <= 0) {
				time = 0;
				gameOver = true;
				gameover();
			}
			time--;
		}, 1000);
	}
	// 按键事件 车移动
	function keyDown (evt) {
		evt = evt || window.evt;
		var currentKey = evt.keyCode || evt.charCode;
		if (currentKey == 37) {
			cart.vx = -10; // 给车的速度
		} else if (currentKey == 39) {
			cart.vx = 10; // 给车的速度
		} else {}
	}
	function keyUp (evt) {
		cart.vx = 0; // 给车的速度
	}
	// 点击事件
	function mouseDown (evt) {
		var that = this;
		evt = evt || window.evt;
		var x = evt.layerX;
		var y = evt.layerY;
		var disx = x - cart.X;
		var disy = y - cart.Y;
		if (x >= cart.X && x <= cart.X + cart.width && y >= cart.Y && y <= cart.Y + cart.height) {
			that.onmousemove = function (evt) {
				var x2 = evt.layerX;
				var dis = x2 - disx;
				cart.X = dis;
				if (dis <= 0) {
					cart.X = 0;
				}
				if (dis >= w - cart.width) {
					cart.X = w - cart.width;
				}
			}
		}
		document.onmouseup = function (evt) {
			that.onmousemove = null;
		}
	}
	// 画出整个画布
	function drawAll () {
		ctx.clearRect(0,0,w,h);
		background.drawBg();
		scorechange();
		gang.drawGang();
		atime();
		
		cart.drawCart();
		person.drawPerson();
		
		for (var i = 0;i < zzArr.length;i++) {
			zzArr[i].drawZz();
		}
		for (var i = 0;i < bombArr.length;i++) {
			bombArr[i].drawBomb();
		}
		move();
	}
	// 结束
	
	// 动作
	function move () {
		zzCont++;
		var j = random(0,6);
		var k = random(0,2);
		// 车动
		cart.X += cart.vx;
		if (cart.X <= 0) {
			cart.X = 0;
		}
		if (cart.X >= w - cart.width) {
			cart.X = w - cart.width;
		}
		// 人动
		if (personUrl == 'images/person2.png') {
			person.X += person_speed;
			if (person.X >= w - person.width) {
				personUrl = 'images/person1.png';
				person = new Person(personUrl,person.X,person.Y,80,80);
			}
			if (person.X % throwzz[j] == 0) {
				var zongzi = new Zongzi('images/zongzi.png',person.X,110,30,30);
				zzArr.push(zongzi);
			}
		} else {
			person.X -= person_speed;
			if (person.X <= 0) {
				personUrl = 'images/person2.png';
				person = new Person(personUrl,person.X,person.Y,80,80);
			}
			if (person.X % throwzz[j] == 0) {
				var zongzi = new Zongzi('images/zongzi.png',person.X,110,30,30);
				zzArr.push(zongzi);
			}
			
		}
		if (zzCont % 100 == 0) {
			var bomb = new Bomb('images/bomb.png',person.X,110,30,30);
			bombArr.push(bomb);
		}
		// 碰撞
		for (var i = 0;i < zzArr.length;i++) {
			zzArr[i].Y += zz_speed;
			// 碰撞底部
			if (zzArr[i].Y + zzArr[i].height >= h) {
				zzArr.splice(i,1);
				playSound(sound.athrows);
			}
			// 碰撞车
			if (zzArr[i].Y + zzArr[i].height >= cart.Y && zzArr[i].X + zzArr[i].width >= cart.X && zzArr[i].X + zzArr[i].width <= cart.X + cart.width) {
				score++; // 得分
				if (score % 10 == 0) {
					
				}
				zzArr.splice(i,1);
			}
		}
		for (var m = 0;m < bombArr.length;m++) {
			bombArr[m].Y += zz_speed;
			
			// 像素碰撞 1-2ms内完成判断
			var crash = isCrash(bombArr[m],cart);
			if (crash.judeg) {
				if(pxHit(bombArr[m],cart,crash)) {
					playSound(sound.bombs);
					gameover();
				}
			}
			// 碰撞底部
			if (bombArr[m].Y + bombArr[m].height >= h) {
				bombArr.splice(m,1);
				playSound(sound.athrows);
			}
		}
	}
	// 很多粽子
	function drawMany (n) {
		for (var i = 0;i < n;i ++) {
			var x = random(0, w - 30);
			var zongzi = new Zongzi('images/zongzi.png',x,0,30,30);
			var obj = {};
			obj = zongzi;
			zongzi.drawZz();
			zzArr.push(obj);
		}
 	}
	// 背景
	function Background (src,x,y,width,height) {
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		var bgImg = new Image();
		bgImg.src = src;
		this.aImg = bgImg;
		this.drawBg = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 粽子
	function Zongzi (src,x,y,width,height) {
		this.name = 'zongzi';
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		var zzImg = new Image();
		zzImg.src = src;
		this.aImg = zzImg;
		this.drawZz = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 车
	function Cart (src,x,y,width,height,vx,vy) {
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		this.vx = vx;
		this.vy = vy;
		var cartImg = new Image();
		cartImg.src = src;
		this.aImg = cartImg;
		this.drawCart = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 人
	function Person (src,x,y,width,height) {
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		var personImg = new Image();
		personImg.src = src;
		this.aImg = personImg;
		this.drawPerson = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 杠
	function Gang (src,x,y,width,height) {
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		var gangImg = new Image();
		gangImg.src = src;
		this.aImg = gangImg;
		this.drawGang = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 地雷
	function Bomb (src,x,y,width,height) {
		this.name = 'bomb';
		this.X = x;
		this.Y = y;
		this.width = width;
		this.height = height;
		var bombImg = new Image();
		bombImg.src = src;
		this.aImg = bombImg;
		this.drawBomb = function () {
			ctx.drawImage(this.aImg, this.X, this.Y, this.width, this.height)
		}
	}
	// 声音
	function Sound () {
		this.bombs = document.getElementById('bomb_sound');
		this.menus = document.getElementById('menu_sound');
		this.overs = document.getElementById('over_sound');
		this.splatters = document.getElementById('splatter_sound');
		this.starts = document.getElementById('start_sound');
		this.athrows = document.getElementById('throw_sound');
		this.oBgm = document.getElementById('bgm_sound');
	}
	function playSound (sound) { // 声音在执行中 那么新建一个声音, 如果声音未在执行中 则执行
		var track, index;
		if (!soundIsPlaying(sound)) { 
           sound.play();
        }
        else { 
           for (index=0; index < audioTracks.length; ++index) { 
              track = audioTracks[index]; 
            
              if (!soundIsPlaying(track)) { 
                 track.src = sound.currentSrc;
                 track.load();
                 track.volume = sound.volume; 
                 track.play();
                 break; 
              } 
           } 
        }              
	}
	function playSound2 (sound) { // 声音在执行中 那么新建一个声音, 如果声音未在执行中 则执行
		var track, index;
		if (!soundIsPlaying(sound)) { 
           sound.play();
        }
        else { 
           for (index=0; index < audioTracks.length; ++index) { 
              track = audioTracks[index]; 
            
              if (!soundIsPlaying(track)) { 
                 track.src = sound.currentSrc;
	             track.load();
	             track.volume = sound.volume;
	             track.loop = 'loop';
	             track.play();
	             break; 
              } 
           } 
        } 
              
	}
	function soundIsPlaying (sound) { 
	    return !sound.ended && sound.currentTime > 0; 
	}
	// 分数
	function scorechange () {
		// 设置文字颜色
		ctx.fillStyle = '#ffffff';
		// 设置字体大小
		ctx.font = '18px 黑体';
		// 画文字
		// context.fillText(文字内容,x,y)
		ctx.fillText('分数:'+ score,5,25);
	}
	// 倒计时
	function atime () {
		// 设置文字颜色
		ctx.fillStyle = '#ffffff';
		// 设置字体大小
		ctx.font = '18px 黑体';
		// 画文字
		// context.fillText(文字内容,x,y)
		ctx.fillText('时间:'+ time,w - 100,25);
	}
	// 游戏结束
	function gameover () {
		clearInterval(tid);
		clearInterval(tid2);
		ctx.clearRect(0,0,w,h);
		background.drawBg();
		// 设置文字颜色
		ctx.fillStyle = '#000000';
		// 设置字体大小
		ctx.font = '20px 黑体';
		// 画文字
		ctx.fillText('游戏结束,得分:'+score,100,200);
	}
	// 随机数
	function random (from, to) {
		return Math.floor(Math.random() * (to - from) + from);
	}
	// 碰撞检测
	function isCrash(rect1,rect2){
        var nMinx = Math.max(rect1.X,rect2.X); //右一
        var nMiny = Math.max(rect1.Y,rect2.Y); //左一
        var nMaxx = Math.min(rect1.X + rect1.width, rect2.X + rect2.width); //右二
        var nMaxy = Math.min(rect1.Y + rect1.height, rect2.Y + rect2.height); //左二
        var nrect = new Tcrash(nMinx,nMiny,(nMaxx - nMinx),(nMaxy - nMiny));
        if(nMaxx > nMinx && nMaxy > nMiny){
            return {
                judeg: true,
                res: nrect
            };
        }else{
            return {
                judeg: false
            }
        }
    }
	// 像素级
	function pxHit (rect1,rect2,crash) {
		ctx.clearRect(0,0,w,h);
		ctx.drawImage(rect1.aImg, rect1.X, rect1.Y, rect1.width, rect1.height);
        var imgData1 = ctx.getImageData(crash.res.x,crash.res.y,crash.res.w,crash.res.h);
        
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(rect2.aImg, rect2.X, rect2.Y, rect2.width, rect2.height);
        var imgData2 = ctx.getImageData(crash.res.x,crash.res.y,crash.res.w,crash.res.h);
        
        ctx.drawImage(rect1.aImg, rect1.X, rect1.Y, rect1.width, rect1.height);
        for(var i = 0;i < imgData1.data.length;i+=4){
            if(imgData1.data[i+3] > 0 && imgData2.data[i+3] > 0){
                return true;
                break;
            }
        }
        return false;
	}
	// 碰撞区域
	function Tcrash(x,y,w,h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
})();
