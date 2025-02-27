const board = new Board(40, 40, 80, 80, colors), player = new Player(true, board), enemy = new Player(false, board);

setTimeout(loadFunction, 0);

function loadFunction(){
	let loader = document.createElement("img");
	loader.src = "images/" + pictures.names[pictures.counter];
	document.getElementById("source").appendChild(loader);
	loader.onload = function(){
		pictures.counter = pictures.counter + 1;
		if (pictures.counter < pictures.names.length){
			setTimeout(loadFunction, 0);
			preloader();
		}
		else{
			setTimeout(draw, 0);
			document.body.removeChild(document.getElementById("source"));
		}
	}
}


function draw(){
	ctx.clearRect(0, 0, parseInt(getComputedStyle(canvas).width), parseInt(getComputedStyle(canvas).height));
	board.draw();
	player.draw();
	enemy.draw();
}


canvas.addEventListener("click", function(ev){
	const cursorCoords = {
							x: Math.floor((ev.clientX - parseInt(getComputedStyle(canvas).left) - 40)/80),
							y: Math.floor((ev.clientY - parseInt(getComputedStyle(canvas).top) - 40)/80)
	};
	console.log(cursorCoords);
	console.log(board);
	draw();
	if (cursorCoords.x < 8 && cursorCoords.x >= 0 && cursorCoords.y < 8 && cursorCoords.y >=0)
		if (!board.focus){
			if (board.tiles[cursorCoords.x][cursorCoords.y].status == "friend"){
				let currentFigure = board.tiles[cursorCoords.x][cursorCoords.y].figure;
				currentFigure.focus();
				currentFigure.detect();
			}
		} else {
			for (let i = 0; i < board.targets.length; ++i){
				if (board.targets[i].x == cursorCoords.x && board.targets[i].y == cursorCoords.y){
					board.focus.force({x: cursorCoords.x, y: cursorCoords.y});
					board.reverse();
					player.draw();
					enemy.draw();
					break;
				}
			}
			for (let i = 0; i < board.killTargets.length; ++i){
				if (board.killTargets[i].x == cursorCoords.x && board.killTargets[i].y == cursorCoords.y){
					destroyFigure(board.tiles[cursorCoords.x][cursorCoords.y].figure, player.collection, enemy.collection);
					board.focus.force({x: cursorCoords.x, y: cursorCoords.y});
					board.reverse();
					player.draw();
					enemy.draw();
					break;
				}
			}
			board.targets = [];
			board.killTargets = [];
			board.focus = null;
		}
});


function Player(isGreen, currentBoard){
	this.collection = [];

	for (let i = 0; i < 8; ++i)
		this.collection.push(new Pawn(80, 80, "images/" + (isGreen?"Green_pawn.svg":"Red_pawn.svg"), {x: i, y: isGreen?6:1}, board, !isGreen));

		this.collection.push(new Rook(80, 80, "images/" + (isGreen?"Green_rook.svg":"Red_rook.svg"), {x: 0, y: isGreen?7:0}, board, !isGreen));
		this.collection.push(new Rook(80, 80, "images/" + (isGreen?"Green_rook.svg":"Red_rook.svg"), {x: 7, y: isGreen?7:0}, board, !isGreen));

		this.collection.push(new Knight(80, 80, "images/" + (isGreen?"Green_knight.svg":"Red_knight.svg"), {x: 1, y: isGreen?7:0}, board, !isGreen));
		this.collection.push(new Knight(80, 80, "images/" + (isGreen?"Green_knight.svg":"Red_knight.svg"), {x: 6, y: isGreen?7:0}, board, !isGreen));

		this.collection.push(new Bishop(80, 80, "images/" + (isGreen?"Green_bishop.svg":"Red_bishop.svg"), {x: 2, y: isGreen?7:0}, board, !isGreen));
		this.collection.push(new Bishop(80, 80, "images/" + (isGreen?"Green_bishop.svg":"Red_bishop.svg"), {x: 5, y: isGreen?7:0}, board, !isGreen));

		this.collection.push(new Queen(80, 80, "images/" + (isGreen?"Green_queen.svg":"Red_queen.svg"), {x: 3, y: isGreen?7:0}, board, !isGreen));

		this.collection.push(new King(80, 80, "images/" + (isGreen?"Green_king.svg":"Red_king.svg"), {x: 4, y: isGreen?7:0}, board, !isGreen))

		this.draw = function(){
			for (let i = 0; i < this.collection.length; ++i)
				this.collection[i].draw();
	}
}
