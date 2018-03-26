let game = {
    pole: [],
    snake: [],
    inc_eat: [],
    dec_eat: [],
    width: 20,
    height: 20,
    num_of_snake: 3,
    num_of_eat_inc: 2,
    num_of_eat_dec: 2,
    num_of_stone: 2,
    vector: { dx: 0, dy: 1 },
    colors: { 0: "white", 1: "green", 2: "red", 3: "gray", 9: "pink" },
    inc_speed: 0,
    current_interval: 1500,
    timerId: 0,
    pause: 0,
    username: "",
    scores: 0
}

game.over = function() {
    var myScores = "/savescores";
    $.post( myScores, {score: this.scores, name: this.username}, function( data ) {
        //alert( "Data Loaded: " + data );
        let mystr="";
        console.log('Очки = '+this.scores);
        //mystr += `<li>Ваши достижения:  ${data.score}</li>`;
        //document.getElementById('scores').innerHTML = mystr;
    });

}

game.myquery = function() {
/*    var flickerAPI = "/score";
    $.getJSON( flickerAPI, function(json) {
        let mystr="";
        for(let winners in json) {
            //console.log(winners + "=" + json[winners]);
            mystr += `<li>${winners} = ${json[winners]}</li>`;
        };
        document.getElementById('scores').innerHTML = mystr;
    })
*/
    var myScores = "/myscores";
    $.post( myScores, {name: this.username}, function( data ) {
        //alert( "Data Loaded: " + data );
        let mystr="";
        mystr += `<li>Ваши достижения:  ${data.score}</li>`;
        let myscore = data.score;
        this.scores = myscore;
        document.getElementById('scores').innerHTML = mystr;
    });
}

game.random_point = function() {
    let check = 0;
    let x1 = 0;
    let y1 = 0;
    while (check == 0) {
        x1 = Math.floor(Math.random() * this.width);
        y1 = Math.floor(Math.random() * this.height);
        let debug = "rx = " + x1 + ", ry = " + y1 + ", color = " + this.pole[x1][y1];
        console.log(debug);
        if ((this.pole[x1][y1] == 0) && (game.check_snake(x1,y1))) check = 1;
    }
    let res = { x: x1, y: y1 };
    return res;
}

game.clear_all = function() {
    for (x = 0; x < this.width; x++) {
        for (y = 0; y < this.height; y++) {
            document.getElementById('cell' + x + `-` + y).style.backgroundColor = this.colors[0];
        }
    }
}

game.clear_cell = function(x,y) {
    this.pole[x][y] = 0;
    document.getElementById('cell' + x + `-` + y).style.backgroundColor = this.colors[0];
}

game.init = function() {
    for (x = 0; x < this.width; x++) {
        this.pole[x] = [];
        for (y = 0; y < this.height; y++) {
            this.pole[x][y] = 0;
        }
    }

    let yn = Math.round(this.height / 2);
    for (n = 0; n < this.num_of_snake; n++) {
        let xn = this.num_of_snake - n;
        this.snake[n] = { x: xn, y: yn };
        this.pole[xn][yn] = 9;
    }

    for (n = 1; n <= this.num_of_eat_inc; n++) {
        point = this.random_point();
        this.pole[point['x']][point['y']] = 1;
    }

    for (n = 1; n <= this.num_of_eat_dec; n++) {
        point = this.random_point();
        this.pole[point['x']][point['y']] = 2;
    }

    for (n = 1; n <= this.num_of_stone; n++) {
        point = this.random_point();
        this.pole[point['x']][point['y']] = 3;
    }
    this.myquery();
};

game.check_snake = function(x,y) {
    let debug = "ix = " + x + ", iy = " + y;
    console.log(debug);
    let num_of_snake = this.snake.length;
    for (i=0; i<num_of_snake; i++) {
        let debug = "sx" + i + " = " + this.snake[i].x + ", sy" + i + " = " + this.snake[i].y;
        console.log(debug);
        if ((this.snake[i].x == x) && (this.snake[i].y == y)) {
            return 0;
        }
    }
    return 1;
}

game.next_step = function() {
    let vector = this.vector;
    let debug = "";
    let head = this.snake[0];
    let last = 0;
    let chain = [];
    // Проверка не нажата ли пауза
    if (this.pause) return;
    // Проверка, что змейка не идет назад
    if (this.num_of_snake > 1) {
        neck = this.snake[1];
        debug = "hx=" + head['x'] + ", hy=" + head['y'] + ", nx=" + neck['x'] + ", ny=" + neck['y'] + ", dx=" + vector['dx'] + ", dy=" + vector['dy'];
        //console.log(debug);
        if ((head['x'] + vector['dx'] == neck['x']) && (head['y'] + vector['dy'] == neck['y'])) {
            this.scores += this.snake.length;
            this.over();
            alert("Вы проиграли1!");
            window.location = "index.html";
        }
    }

    let newx = head['x'] + vector['dx'];
    let newy = head['y'] + vector['dy'];
    if (newx >= this.width) newx = 0;
    if (newy >= this.height) newy = 0;
    if (newx < 0) newx = this.width - 1;
    if (newy < 0) newy = this.height - 1;
    debug = "newx=" + newx + ", newy=" + newy;
    console.log(debug);
    //alert("Новое положение головы");
    if (game.check_snake(newx,newy) == 0) {
        this.scores += this.snake.length;
        this.over();
        alert("Вы проиграли2!");
        window.location = "index.html";
    }
    else if (this.pole[newx][newy] == 3) {
        // Проверка, что змейка не врезалась в камень
        debug = "hx=" + head['x'] + ", hy=" + head['y'] + ", nx=" + neck['x'] + ", ny=" + neck['y'] + ", dx=" + vector['dx'] + ", dy=" + vector['dy'];
        this.scores += this.snake.length;
        this.over();
        alert("Вы проиграли2!");
        window.location = "index.html";
    } else if (this.pole[newx][newy] == 1) {
        // Змейка съела зеленую еду и увеличивается
        this.num_of_snake++;
        // надо добавить зеленую еду
        let new_green_eat = this.random_point();
        this.pole[new_green_eat.x][new_green_eat.y] = 1;
        document.getElementById('cell' + new_green_eat.x + `-` + new_green_eat.y).style.backgroundColor = this.colors[1];
        this.inc_speed++;
    } else if (this.pole[newx][newy] == 2) {
        // Змейка съела красную еду и уменьшается
        last = this.num_of_snake;
        // Если змейка состоит из 1 элемента, она уменьшается и пользователь проигрывает
        if (last == 1) {
            this.scores += this.snake.length;
            this.over();
            alert('Вы проиграли3!');
            window.location = "index.html";
        }
        chain = this.snake[last - 1];
        document.getElementById('cell' + chain['x'] + `-` + chain['y']).style.backgroundColor = this.colors[0];
        this.pole[chain.x][chain.y] = 0;
        chain = this.snake[last - 2];
        document.getElementById('cell' + chain['x'] + `-` + chain['y']).style.backgroundColor = this.colors[0];
        this.pole[chain.x][chain.y] = 0;
        this.num_of_snake--;
        this.snake.pop();
        this.snake.pop();
        let new_red_eat = this.random_point();
        this.pole[new_red_eat.x][new_red_eat.y] = 2;
        document.getElementById('cell' + new_red_eat.x + `-` + new_red_eat.y).style.backgroundColor = this.colors[2];
        this.inc_speed++;
    } else {
        // Змейка просто двигается
        last = this.num_of_snake;
        chain = this.snake[last - 1];
        document.getElementById('cell' + chain['x'] + `-` + chain['y']).style.backgroundColor = this.colors[0];
        this.pole[chain.x][chain.y] = 0;
        this.snake.pop();
    }

    // создадим новую голову массив змейки
    let new_head = { x: newx, y: newy };
    document.getElementById('cell' + newx + `-` + newy).style.backgroundColor = this.colors[9];
    this.snake.unshift(new_head);
    if (this.inc_speed>1) {
    	this.inc_speed = 0;
    	this.current_interval = Math.round(this.current_interval * 0.9);
    	clearInterval(this.timerId);
		this.timerId = setInterval(() => {
		    this.next_step();
		}, this.current_interval);
	}
};

game.mytable = function() {
    document.write("<div class='mypole'>");
    document.write("<table>");
    let color = "green";
    for (i = 0; i < this.width; i++) {
        document.write("<tr>");
        for (j = 0; j < this.height; j++) {
            color = this.colors[this.pole[i][j]];
            document.write(`<td id='cell${i}-${j}' bgcolor="${color}"></td>`);
        };
        document.write("</tr>");
    };
    document.write("</table>");
    document.write("</div>");
    document.write("<div class='legend'>");
    document.write("<ul>");
    document.write(`<li><div id='empty_cell' class='mycell' style="background: ${this.colors[0]}"></div> - пустая клетка поля</li>`);
    document.write(`<li><div id='inc_eat' class='mycell' style="background: ${this.colors[1]}"></div> - еда, от которой змея увеличивается</li>`);
    document.write(`<li><div id='dec_eat' class='mycell' style="background: ${this.colors[2]}"></div> - еда, от которой змея уменьшается</li>`);
    document.write(`<li><div id='stone_cell' class='mycell' style="background: ${this.colors[3]}"></div> - непреодолимое препятствие, врезавшись в которое змея умирает (проигрыш)</li>`);
    document.write(`<li><div id='mysnake' class='mycell' style="background: ${this.colors[9]}"></div> - наша ЗМЕЙКА</li>`);
    document.write("</ul>");
    document.write("<ul id='scores'>");
    document.write("</ul>");
    document.write("</div>");
    for (n = 0; n < this.num_of_snake; n++) {
        chain = this.snake[n];
        document.getElementById('cell' + chain['x'] + `-` + chain['y']).style.backgroundColor = this.colors[9];
    }
    //document.write(`<div id='debug'>Отладка</div>`);
};

game.run = function() {
	game.init();
	game.mytable();
	document.addEventListener("keydown", function(event) {
	    if (event.key === 'ArrowUp') {
	        game.vector['dy'] = 0;
	        game.vector['dx'] = -1;
	        //console.log(verh);
	    } else if (event.key === 'ArrowDown') {
	        game.vector['dy'] = 0;
	        game.vector['dx'] = 1;
	        //console.log(verh);
	    } else if (event.key === 'ArrowLeft') {
	        game.vector['dy'] = -1;
	        game.vector['dx'] = 0;
	        //console.log(verh);
	    } else if (event.key === 'ArrowRight') {
	        game.vector['dy'] = 1;
	        game.vector['dx'] = 0;
	        //console.log(verh);
	    } else if (event.key === 'p') {
            game.pause = 1 - game.pause;
        }
	});

    var empty_cell = document.getElementById('empty_cell');
    empty_cell.onmousedown = function(e) { // 1. отследить нажатие
        alert("Это поле пустое, его нельзя переносить!")
    }
    var mysnake = document.getElementById('mysnake');
    mysnake.onmousedown = function(e) { // 1. отследить нажатие
        alert("Это поле змейки, так его перенести нельзя!")
    }
    var inc_eat = document.getElementById('inc_eat');
    let newcell = "";
    inc_eat.onmousedown = function(e) { // 1. отследить нажатие

      // подготовить к перемещению
      // 2. разместить на том же месте, но в абсолютных координатах
      let mycolor = inc_eat.style.backgroundColor;
      document.write(`<div id='newcell' class='mycell' style="position: 'absolute'; background: ${mycolor}"></div>`);
      newcell = document.getElementById('newcell');
      //ball.style.position = 'absolute';
      moveAt(e);
      // переместим в body, чтобы мяч был точно не внутри position:relative
      document.body.appendChild(newcell);

      newcell.style.zIndex = 1000; // показывать мяч над другими элементами

      // передвинуть мяч под координаты курсора
      // и сдвинуть на половину ширины/высоты для центрирования
      function moveAt(e) {
        newcell.style.left = e.pageX - newcell.offsetWidth / 2 + 'px';
        newcell.style.top = e.pageY - newcell.offsetHeight / 2 + 'px';
      }

      // 3, перемещать по экрану
      document.onmousemove = function(e) {
        moveAt(e);
      }

      // 4. отследить окончание переноса
      newcell.onmouseup = function() {
        document.onmousemove = null;
        newcell.onmouseup = null;
      }
    }

	game.timerId = setInterval(function() {
	    game.next_step();
	}, game.current_interval);
}
let title = "Введите имя пользователя:";
let defname = "user";
result = prompt(title, defname);
game.username = result;
game.run();
