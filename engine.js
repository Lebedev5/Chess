const canvas = document.getElementById("canvas") || document.getElementsByTagName("canvas")[0],
	  ctx = (canvas && canvas.getContext("2d"))?canvas.getContext("2d"):null,
	  colors = ["#DEB887", "#8B4513"],
      pictures = {
	  			names: [
	  					"Green_bishop.svg",
	  					"Red_bishop.svg",
	  					"Green_king.svg",
	  					"Red_king.svg",
	  					"Green_knight.svg",
	  					"Red_knight.svg",
	  					"Green_pawn.svg",
	  					"Red_pawn.svg",
	  					"Green_queen.svg",
	  					"Red_queen.svg",
	  					"Green_rook.svg",
	  					"Red_rook.svg"
	  			],
	  			counter: 0
	  };

if (ctx){
	canvas.setAttribute("width", parseInt(getComputedStyle(canvas).width));
	canvas.setAttribute("height", parseInt(getComputedStyle(canvas).height));
	/*объект, который хранит данные ширины высоты и координаты объекта*/
	function Tile(x, y, width, height, color){
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 80;
		this.height = height || 80;
		this.status = "empty";
		this.figure = null;
		this.draw = function(){
			ctx.beginPath();
			ctx.fillStyle = color || "white";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	
	function Board(left, top, width, height, colors){
		this.tiles = [];
		this.colors = (colors && Array.isArray(colors))?colors:["white", "black"];
		this.targets = [];
		this.killTargets = [];
		this.focus = null;
		for (let i = 0; i < 8; ++i){
			this.tiles.push([]);
			for (let j = 0; j < 8; ++j){
				this.tiles[i].push(new Tile(i * width + left, j * height + top, width, height, this.colors[(i + j) % 2]))
			}
		}
		this.draw = function(){
			for (let i = 0; i < 8; ++i)
				for (let j = 0; j < 8; ++j)
					this.tiles[i][j].draw();
		}
	}

	function Figure(width, height, source, coords, board, isEnemy){
		this.coords = coords;
		this.width = width || 80;
		this.height = height || 80;
		this.image = new Image();
		this.image.src = source;
		this.tile = board.tiles[this.coords.x][this.coords.y];
		if (isEnemy)
			this.status = "enemy";
		else
			this.status = "friend";
		this.tile.status = this.status;
		this.tile.figure = this;
		this.draw = function(isAnimate){
			ctx.drawImage(this.image, this.tile.x, this.tile.y, this.width, this.height);
		}
		this.focus = function(){
			ctx.beginPath();
			ctx.lineWidth = 3;
			board.focus = this;
			ctx.strokeStyle = "blue";
			board.targets = [];
			ctx.strokeRect(board.tiles[this.coords.x][this.coords.y].x, 
						   board.tiles[this.coords.x][this.coords.y].y, 
						   board.tiles[this.coords.x][this.coords.y].width, 
						   board.tiles[this.coords.x][this.coords.y].height);
			
		}
		this.force = function(coords){
			this.tile.status = "empty";
			this.tile.figure = null;
			this.coords = coords;
			this.tile = board.tiles[coords.x][coords.y];
			this.tile.status = this.status;
			this.tile.figure = this;
			draw();
			this.draw();
		}

		this.destroy = function(coords){
			this.force(coords);
		}
	}

	function Pawn(width, height, source, coords, board){
		Figure.call(this, width, height, source, coords, board);
		this.detect = function(){
			ctx.strokeStyle = "green";
			ctx.fillStyle = "rgba(50, 200, 50, 0.4)"
			ctx.lineWidth = 3;
			if (this.coords.y == 6)
				if (board.tiles[this.coords.x][4].status == "empty" && board.tiles[this.coords.x][5].status == "empty"){
					ctx.fillRect(board.tiles[this.coords.x][4].x, 
								   board.tiles[this.coords.x][4].y, 
								   board.tiles[this.coords.x][4].width, 
								   board.tiles[this.coords.x][4].height);
					board.targets.push({x: this.coords.x, y: 4});
				}
			if (this.coords.y - 1 >= 0)
				if (board.tiles[this.coords.x][this.coords.y - 1].status == "empty"){
						ctx.fillRect(board.tiles[this.coords.x][this.coords.y - 1].x, 
									   board.tiles[this.coords.x][this.coords.y - 1].y, 
									   board.tiles[this.coords.x][this.coords.y - 1].width, 
									   board.tiles[this.coords.x][this.coords.y - 1].height);
						board.targets.push({x: this.coords.x, y: this.coords.y - 1});
					}
			if (this.coords.y - 1 >= 0){
				if (this.coords.x - 1 >= 0)
					if (board.tiles[this.coords.x - 1][this.coords.y - 1].status == "enemy"){
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)"
						ctx.fillRect(board.tiles[this.coords.x - 1][this.coords.y - 1].x, 
									   board.tiles[this.coords.x - 1][this.coords.y - 1].y, 
									   board.tiles[this.coords.x - 1][this.coords.y - 1].width, 
									   board.tiles[this.coords.x - 1][this.coords.y - 1].height);
						board.killTargets.push({x: this.coords.x - 1, y: this.coords.y - 1});
					}
				if (this.coords.x + 1 < 8)
					if (board.tiles[this.coords.x + 1][this.coords.y - 1].status == "enemy"){
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)"
						ctx.fillRect(board.tiles[this.coords.x + 1][this.coords.y - 1].x, 
									   board.tiles[this.coords.x + 1][this.coords.y - 1].y, 
									   board.tiles[this.coords.x + 1][this.coords.y - 1].width, 
									   board.tiles[this.coords.x + 1][this.coords.y - 1].height);
						board.killTargets.push({x: this.coords.x + 1, y: this.coords.y - 1});
					}
			}
		}
	}

	function Rook(width, height, source, coords, board){
		Figure.call(this, width, height, source, coords, board);
		this.detect = function(){
			if (this.coords.y > 0){
				for (let i = this.coords.y - 1; i >= 0; --i){
					if (board.tiles[this.coords.x][i].status != "friend"){
						let status = board.tiles[this.coords.x][i].status;
						ctx.fillStyle = (status == "empty") ? "rgba(50, 200, 50, 0.4)" : "rgba(200, 50, 50, 0.4)";
						ctx.fillRect(board.tiles[this.coords.x][i].x, 
									   board.tiles[this.coords.x][i].y, 
									   board.tiles[this.coords.x][i].width, 
									   board.tiles[this.coords.x][i].height);
						if (board.tiles[this.coords.x][i].status == "empty"){
							board.targets.push({x: this.coords.x, y: i})
						} else {
							board.killTargets.push({x: this.coords.x, y: i});
							break;
						}
					} else {
						break;
					}
				}
			}
			if (this.coords.y < 8){
				for (let i = this.coords.y + 1; i < 8; ++i){
					if (board.tiles[this.coords.x][i].status != "friend"){
						let status = board.tiles[this.coords.x][i].status;
						ctx.fillStyle = (status == "empty") ? "rgba(50, 200, 50, 0.4)" : "rgba(200, 50, 50, 0.4)";
						ctx.fillRect(board.tiles[this.coords.x][i].x, 
									   board.tiles[this.coords.x][i].y, 
									   board.tiles[this.coords.x][i].width, 
									   board.tiles[this.coords.x][i].height);
						if (board.tiles[this.coords.x][i].status == "empty"){
							board.targets.push({x: this.coords.x, y: i})
						} else {
							board.killTargets.push({x: this.coords.x, y: i});
							break;
						}
					} else {
						break;
					}
				}
			}
			if (this.coords.x < 8){
				for (let i = this.coords.x + 1; i < 8; ++i){
					if (board.tiles[i][this.coords.y].status != "friend"){
						let status = board.tiles[i][this.coords.y].status;
						ctx.fillStyle = (status == "empty") ? "rgba(50, 200, 50, 0.4)" : "rgba(200, 50, 50, 0.4)";
						ctx.fillRect(board.tiles[i][this.coords.y].x, 
									   board.tiles[i][this.coords.y].y, 
									   board.tiles[i][this.coords.y].width, 
									   board.tiles[i][this.coords.y].height);
						if (board.tiles[i][this.coords.y].status == "empty"){
							board.targets.push({x: i, y: this.coords.y})
						} else {
							board.killTargets.push({x: i, y: this.coords.y});
							break;
						}
					} else {
						break;
					}
				}
			}
			if (this.coords.x >= 0){
				for (let i = this.coords.x - 1; i >= 0; --i){
					if (board.tiles[i][this.coords.y].status != "friend"){
						let status = board.tiles[i][this.coords.y].status;
						ctx.fillStyle = (status == "empty") ? "rgba(50, 200, 50, 0.4)" : "rgba(200, 50, 50, 0.4)";
						ctx.fillRect(board.tiles[i][this.coords.y].x, 
									   board.tiles[i][this.coords.y].y, 
									   board.tiles[i][this.coords.y].width, 
									   board.tiles[i][this.coords.y].height);
						if (board.tiles[i][this.coords.y].status == "empty"){
							board.targets.push({x: i, y: this.coords.y})
						} else {
							board.killTargets.push({x: i, y: this.coords.y});
							break;
						}
					} else {
						break;
					}
				}
			}
		}
	}

	function Knight(width, height, source, coords, board){
		Figure.call(this, width, height, source, coords, board);
		this.detect = function(){
			if (this.coords.y - 2 >= 0){
				if (this.coords.x - 1 >= 0 && board.tiles[this.coords.x - 1][this.coords.y - 2].status != "friend"){
					if (board.tiles[this.coords.x - 1][this.coords.y - 2].status == "empty"){
							board.targets.push({x: this.coords.x - 1, y: this.coords.y - 2});
							ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
							board.killTargets.push({x: this.coords.x - 1, y: this.coords.y - 2});
							ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x - 1][this.coords.y - 2].x, 
									   board.tiles[this.coords.x - 1][this.coords.y - 2].y, 
									   board.tiles[this.coords.x - 1][this.coords.y - 2].width, 
									   board.tiles[this.coords.x - 1][this.coords.y - 2].height);
				}
				if (this.coords.x + 1 < 8 && board.tiles[this.coords.x + 1][this.coords.y - 2].status != "friend"){
					if (board.tiles[this.coords.x + 1][this.coords.y - 2].status == "empty"){
							board.targets.push({x: this.coords.x + 1, y: this.coords.y - 2});
							ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
							board.killTargets.push({x: this.coords.x + 1, y: this.coords.y - 2});
							ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x + 1][this.coords.y - 2].x, 
									   board.tiles[this.coords.x + 1][this.coords.y - 2].y, 
									   board.tiles[this.coords.x + 1][this.coords.y - 2].width, 
									   board.tiles[this.coords.x + 1][this.coords.y - 2].height);
				}
			}
			if (this.coords.y - 1 >= 0){
				if (this.coords.x - 2 >= 0 && board.tiles[this.coords.x - 2][this.coords.y - 1].status != "friend"){
					if (board.tiles[this.coords.x - 2][this.coords.y - 1].status == "empty"){
						board.targets.push({x: this.coords.x - 2, y: this.coords.y - 1});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x - 2, y: this.coords.y - 1});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x - 2][this.coords.y - 1].x, 
									   board.tiles[this.coords.x - 2][this.coords.y - 1].y, 
									   board.tiles[this.coords.x - 2][this.coords.y - 1].width, 
									   board.tiles[this.coords.x - 2][this.coords.y - 1].height);
				}
				if (this.coords.x + 2 < 8 && board.tiles[this.coords.x + 2][this.coords.y - 1].status != "friend"){
					if (board.tiles[this.coords.x + 2][this.coords.y - 1].status == "empty"){
						board.targets.push({x: this.coords.x + 2, y: this.coords.y - 1});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x + 2, y: this.coords.y - 1});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x + 2][this.coords.y - 1].x, 
									   board.tiles[this.coords.x + 2][this.coords.y - 1].y, 
									   board.tiles[this.coords.x + 2][this.coords.y - 1].width, 
									   board.tiles[this.coords.x + 2][this.coords.y - 1].height);
				}
			}
			if (this.coords.y + 2 < 8){
				if (this.coords.x - 1 >= 0 && board.tiles[this.coords.x - 1][this.coords.y + 2].status != "friend"){
					if (board.tiles[this.coords.x - 1][this.coords.y + 2].status == "empty"){
						board.targets.push({x: this.coords.x - 1, y: this.coords.y + 2});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x - 1, y: this.coords.y + 2});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x - 1][this.coords.y + 2].x, 
									   board.tiles[this.coords.x - 1][this.coords.y + 2].y, 
									   board.tiles[this.coords.x - 1][this.coords.y + 2].width, 
									   board.tiles[this.coords.x - 1][this.coords.y + 2].height);
				}
				if (this.coords.x + 1 < 8 && board.tiles[this.coords.x + 1][this.coords.y + 2].status != "friend"){
					if (board.tiles[this.coords.x + 1][this.coords.y + 2].status == "empty"){
						board.targets.push({x: this.coords.x + 1, y: this.coords.y + 2});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x + 1, y: this.coords.y + 2});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x + 1][this.coords.y + 2].x, 
									   board.tiles[this.coords.x + 1][this.coords.y + 2].y, 
									   board.tiles[this.coords.x + 1][this.coords.y + 2].width, 
									   board.tiles[this.coords.x + 1][this.coords.y + 2].height);
				}
			}
			if (this.coords.y + 1 < 8){
				if (this.coords.x - 2 >= 0 && board.tiles[this.coords.x - 2][this.coords.y + 1].status != "friend"){
					if (board.tiles[this.coords.x - 2][this.coords.y + 1].status == "empty"){
						board.targets.push({x: this.coords.x - 2, y: this.coords.y + 1});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x - 2, y: this.coords.y + 1});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x - 2][this.coords.y + 1].x, 
									   board.tiles[this.coords.x - 2][this.coords.y + 1].y, 
									   board.tiles[this.coords.x - 2][this.coords.y + 1].width, 
									   board.tiles[this.coords.x - 2][this.coords.y + 1].height);
				}
				if (this.coords.x + 2 < 8 && board.tiles[this.coords.x + 2][this.coords.y + 1].status != "friend"){
					if (board.tiles[this.coords.x + 2][this.coords.y + 1].status == "empty"){
						board.targets.push({x: this.coords.x + 2, y: this.coords.y + 1});
						ctx.fillStyle = "rgba(50, 200, 50, 0.4)";
					} else {
						board.killTargets.push({x: this.coords.x + 2, y: this.coords.y + 1});
						ctx.fillStyle = "rgba(200, 50, 50, 0.4)";
					}
					ctx.fillRect(board.tiles[this.coords.x + 2][this.coords.y + 1].x, 
									   board.tiles[this.coords.x + 2][this.coords.y + 1].y, 
									   board.tiles[this.coords.x + 2][this.coords.y + 1].width, 
									   board.tiles[this.coords.x + 2][this.coords.y + 1].height);
				}
			}
		}
	};

	function Bishop(width, height, source, coords, board){
		Figure.call(this, width, height, source, coords, board);
		this.detect = function(){
			for (let i = this.coords.x - 1, j = this.coords.y - 1; j >= 0 && i >= 0; --i, --j){
				if (board.tiles[i][j].status != "friend"){
					ctx.fillStyle = board.tiles[i][j].status == "empty" ? "rgba(50, 200, 50, 0.4)":"rgba(200, 50, 50, 0.4)";

					ctx.fillRect(board.tiles[i][j].x, 
								 board.tiles[i][j].y, 
								 board.tiles[i][j].width, 
								 board.tiles[i][j].height);

					if (board.tiles[i][j].status == "empty"){
						board.targets.push({x: i, y: j})
					} else {
						board.killTargets.push({x: i, y: j});
						break;
					}

				} else {
					break;
				}
			}
			for (let i = this.coords.x + 1, j = this.coords.y - 1; j >= 0 && i < 8; ++i, --j){
				if (board.tiles[i][j].status != "friend"){
					ctx.fillStyle = board.tiles[i][j].status == "empty" ? "rgba(50, 200, 50, 0.4)":"rgba(200, 50, 50, 0.4)";

					ctx.fillRect(board.tiles[i][j].x, 
								 board.tiles[i][j].y, 
								 board.tiles[i][j].width, 
								 board.tiles[i][j].height);

					if (board.tiles[i][j].status == "empty"){
						board.targets.push({x: i, y: j})
					} else {
						board.killTargets.push({x: i, y: j});
						break;
					}

				} else {
					break;
				}
			}
			for (let i = this.coords.x + 1, j = this.coords.y + 1; j < 8 && i < 8; ++i, ++j){
				if (board.tiles[i][j].status != "friend"){
					ctx.fillStyle = board.tiles[i][j].status == "empty" ? "rgba(50, 200, 50, 0.4)":"rgba(200, 50, 50, 0.4)";

					ctx.fillRect(board.tiles[i][j].x, 
								 board.tiles[i][j].y, 
								 board.tiles[i][j].width, 
								 board.tiles[i][j].height);

					if (board.tiles[i][j].status == "empty"){
						board.targets.push({x: i, y: j})
					} else {
						board.killTargets.push({x: i, y: j});
						break;
					}

				} else {
					break;
				}
			}
			for (let i = this.coords.x - 1, j = this.coords.y + 1; j < 8 && i >= 0; --i, ++j){
				if (board.tiles[i][j].status != "friend"){
					ctx.fillStyle = board.tiles[i][j].status == "empty" ? "rgba(50, 200, 50, 0.4)":"rgba(200, 50, 50, 0.4)";

					ctx.fillRect(board.tiles[i][j].x, 
								 board.tiles[i][j].y, 
								 board.tiles[i][j].width, 
								 board.tiles[i][j].height);

					if (board.tiles[i][j].status == "empty"){
						board.targets.push({x: i, y: j})
					} else {
						board.killTargets.push({x: i, y: j});
						break;
					}

				} else {
					break;
				}
			}
		}
	}
	

	function Queen(width, height, source, coords, board){
		Figure.call(this, width, height, source, coords, board);
		this.detect = function(){
			(new Rook(null, null, null, {x: this.coords.x, y: this.coords.y}, board, false)).detect.call(this);
			(new Bishop(null, null, null, {x: this.coords.x, y: this.coords.y}, board, false)).detect.call(this);
		}
	}
	function preloader(){
		ctx.clearRect(0, 0, parseInt(getComputedStyle(canvas).width), parseInt(getComputedStyle(canvas).height));
		ctx.font = "48px serif";
		ctx.fillText("loading" + ((pictures.counter % 3 == 2)?"..":(pictures.counter % 3 == 1)?".":"..."), 260, 330);
		ctx.strokeRect(150, 360, pictures.names.length * 35, 50);

		for (let i = 0; i < pictures.names.length; ++i){
			ctx.beginPath();
			ctx.fillStyle = "antiquewhite";
			if (i < pictures.counter)
				ctx.fillRect(150 + i * 35, 360, 35, 50);
		}

		ctx.font = "25px sans";
		ctx.fillStyle = "black";
		ctx.fillText(pictures.names[pictures.counter].slice(0, pictures.names[pictures.counter].indexOf('.')), 280, 395);
	}
} else {
	document.writeln("<h1>sorry...</h1>");
}