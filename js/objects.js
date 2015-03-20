var game;
var taxi, platforms, obstacles, guests, frames, staticSatellites, googleCars, drones, transmitter;

function initObjects() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");
	
	game = {
		w: $("#canvas").width(),	levelXMax: 32,	blockSize: 25,
		h: $("#canvas").height(),	levelYMax: 24, 
		
		frame: 0,
		FPS: 60,
		
		levelNumber: 1,	targetPlatform: 0,
		roundNumber: 1, state: "running",
		
		drawBackground: function(){
			ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, game.w, game.h);
		},
		
		reset: function(){
			taxi.x = taxi.xStart;	taxi.state = "free";	taxi.vx = 0;
			taxi.y = taxi.yStart;	taxi.passengers = 0;	taxi.vy = 0;
			
			for (i=0; i < guests.length; i++){
				for(j=0; j < guests[i].length; j++){
					guests[i][j].x = guests[i][j].xStart;
					guests[i][j].y = guests[i][j].yStart;
					guests[i][j].state = "free";
				}
			}
			this.roundNumber = 1; this.targetPlatform = 0;
		},
		
		beginGameLoop: function() {
		// Begin the game loop
			var gameInterval = setInterval(function() {
				if(game.state == "running") {//		hier darf nicht this verwendet werden gehört das hier rein GORDON!!??!?!?!?
				update();
			}
			draw();
			}, 1000/game.FPS);
		}
	}

    var verticalDronesFinished = new Array();
    for (X = 0; X < game.levelXMax; X++){
        verticalDronesFinished[X] = new Array();
        for(Y = 0; Y < game.levelYMax; Y++){
            verticalDronesFinished[X][Y] = false;
        }
    }

    for (y = 0; y < game.levelYMax; y++) {
        for (x = 0; x < game.levelXMax; x++) {

            switch(levelRows[y][x]){
            /*********************************Initialization platforms*********************************/
                case "<":
				case "#": //Platform
					var tempPlatform = {xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, hasBegin: false, hasEnd: false};

                    tempPlatform.xStart = x * game.blockSize; tempPlatform.xEnd = x * game.blockSize + game.blockSize;
                    tempPlatform.yStart = y * game.blockSize; tempPlatform.yEnd = y * game.blockSize + game.blockSize;
					//check if platform has a begin-edge
					if(levelRows[y][x] == "<"){
						tempPlatform.hasBegin = true;
					}
                    //check end of platform and is end-edge exists 
                    var count = -1;
                    while(levelRows[y][x] == "#" || levelRows[y][x] == ">" || levelRows[y][x] == "<") {
                        x++;
                        count++;
						if(levelRows[y][x] == ">"){
							tempPlatform.hasEnd = true;
						}
                    }
					x--;
                    tempPlatform.xEnd += count * game.blockSize;

                    //add tempPlatform to platforms
                    platforms.push({
						id: platforms.length + 1,
                        xStart: tempPlatform.xStart, xEnd: tempPlatform.xEnd,
                        yStart: tempPlatform.yStart, yEnd: tempPlatform.yEnd,
						hasBegin: tempPlatform.hasBegin, hasEnd: tempPlatform.hasEnd,
						
						draw: function(){
							var boxes = (this.xEnd - this.xStart)/25;
							for(j=0; j < boxes; j++){
								if(j == 0 && this.hasBegin){
									ctx.drawImage(platform_left, 0, 0, platform_left.width, platform_left.height,
                                        this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
								}else if(j == boxes-1 && this.hasEnd){
									ctx.drawImage(platform_right, 0, 0, platform_right.width, platform_right.height,
                                        this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
								}else{
									ctx.drawImage(platform_mid, 0, 0, platform_mid.width, platform_mid.height, 
										this.xStart + (j * game.blockSize), this.yStart, game.blockSize, game.blockSize);
								}
							}
						}
                    });
                    break;

                case "R": //frame
                    frames.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						draw: function(){
							ctx.drawImage(edge, 0, 0, edge.width, edge.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
						}});
                    break;

                /*********************************Extended Level elements******************************/
                case "X":  //static obstacle
                    staticSatellites.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
						draw: function(){
							ctx.drawImage(satelliteImage, 0, 0, satelliteImage.width, satelliteImage.height, this.xStart, this.yStart, game.blockSize, game.blockSize);
						}});
                    break;

                case "M":  //static obstacle
                    transmitter.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,

                        draw: function(){
                            //ctx.drawImage(transmitterRadioImage, 0, 0, transmitterRadioImage.width, transmitterRadioImage.height, this.xStart + game.blockSize / 8, this.yStart - game.blockSize / 2.5, game.blockSize, game.blockSize);
                            ctx.drawImage(transmitterImage, 0, 0, transmitterImage.width, transmitterImage.height, this.xStart, this.yStart, game.blockSize, game.blockSize);

                        }});
                    break;

					/*********************************Dynamic Level elements*******************************/
                // Taxi and guests
                // Diese Elemente mussen an sich dynamisch gezeichnet werden - hier nur für Demozwecke zeichnen

                //Vertical flying drone
                case "K":
                    if(verticalDronesFinished[x][y] == false) {
                        drones.push({
                            xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                            yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                            moveStart: y * game.blockSize, moveEnd: y * game.blockSize,
                            direction: "down",

                            update: function (){
                                if(this.direction == "down") {
                                    if(this.yEnd <= this.moveEnd) {
                                        this.yStart += 1; this.yEnd += 1;
                                    }
                                    else{
                                        this.direction = "up";
                                    }
                                }
                                if(this.direction == "up"){
                                    if(this.yStart >= this.moveStart) {
                                        this.yStart -= 1; this.yEnd -= 1;
                                    }
                                    else{
                                        this.direction = "down";
                                        //this.update();
                                    }
                                }
                            },

                            draw: function() {
                                ctx.drawImage(droneImage, Math.floor(game.frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                        });

                        var count = 0;
                        var oldY = y;
                        y++;
                        while(levelRows[y][x] != "K") {
                            y++;
                            count++;
                        }

                        verticalDronesFinished[x][y] = true;

                        y = oldY;
                        drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    }

                    break;

                //Horizontal flying drone
                case "L":
                    drones.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
                        direction: "right",

                        update: function (){
                            if(this.direction == "right") {
                                if(this.xEnd <= this.moveEnd) {
                                    this.xStart += 1; this.xEnd += 1;
                                }
                                else{
                                    this.direction = "left";
                                }
                            }
                            if(this.direction == "left"){
                                if(this.xStart >= this.moveStart) {
                                    this.xStart -= 1; this.xEnd -= 1;
                                }
                                else{
                                    this.direction = "right";
                                    //this.update();
                                }
                            }
                        },

                        draw: function() {
                            ctx.drawImage(droneImage, Math.floor(game.frame % 16) *  droneImage.width / 16, 0, droneImage.width / 16, droneImage.height,
                                          this.xStart, this.yStart, game.blockSize, game.blockSize);
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "L") {
                        x++;
                        count++;
                    }

                    drones[drones.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;

                case "Y":
                    googleCars.push({
                        xStart: x * game.blockSize, xEnd: x * game.blockSize + game.blockSize,
                        yStart: y * game.blockSize, yEnd: y * game.blockSize + game.blockSize,
                        moveStart: x * game.blockSize, moveEnd: x * game.blockSize,
                        direction: "right",

                        update: function (){
                            if(this.direction == "right") {
                                if(this.xEnd <= this.moveEnd) {
                                    this.xStart += 1; this.xEnd += 1;
                                }
                                else{
                                    this.direction = "left";
                                }
                            }
                            if(this.direction == "left"){
                                if(this.xStart >= this.moveStart) {
                                    this.xStart -= 1; this.xEnd -= 1;
                                }
                                else{
                                    this.direction = "right";
                                    //this.update();
                                }
                            }
                        },

                        draw: function() {
                            if(this.direction == "right"){
                                ctx.drawImage(googleCarImage, Math.floor(game.frame % 4) *  googleCarImage.width / 4, 0, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                            else{
                                ctx.drawImage(googleCarImage, Math.floor(game.frame % 4) *  googleCarImage.width / 4, googleCarImage.height / 2, googleCarImage.width / 4, googleCarImage.height / 2,
                                              this.xStart, this.yStart, game.blockSize, game.blockSize);
                            }
                        }
                    });

                    var count = 1;
                    x++;
                    while(levelRows[y][x] != "Y") {
                        x++;
                        count++;
                    }

                    googleCars[googleCars.length-1].moveEnd += count * game.blockSize + game.blockSize;
                    break;

                case "T":
                    taxi = {
						x: x * game.blockSize,	xStart: x * game.blockSize,
						y: y * game.blockSize,	yStart: y * game.blockSize,

						
						// corners of taxi hitbox
						ru: { x: x * game.blockSize + game.blockSize, y: y * game.blockSize }, // -> right upper corner
						rd: { x: x * game.blockSize + game.blockSize, y: y * game.blockSize + game.blockSize }, // -> right down corner
						lu: { x: x * game.blockSize, y: y * game.blockSize }, // -> left up corner
						ld: { x: x * game.blockSize, y: y * game.blockSize + game.blockSize }, // -> left down corner
						
						//velocity towards x (vx) and y (vy)
						vx: 0,
						vy: 0,
						
						drawState: "up",	passengers: 0,		collisionBottom: false,
						state: "free",		currPlatform:  0,
						
						update: function() {
							if(this.collisionBottom == false) {
								this.vy -= 3;	
							}
							
							this.drawState = "up";

							if(keydown.up) {
								this.vy += 10;
								this.collisionBottom = false;
								this.drawState = "up";
								this.currPlatform = 0;
							}
							if(keydown.down && this.collisionBottom == false) {
								this.vy -= 10;
							}
							if (keydown.left) {
								this.vx -= 7;
								this.drawState = "left";
							}
							if (keydown.right) {
								this.vx += 7;
								this.drawState = "right";
							}
							if(keydown.space) {
								// Zeit die Kufen auszufahren!!!
								console.log(platforms.length);
							}
						
							if(this.collisionBottom == true) {
								if(this.vx < -5) {
									this.vx += 5;
								}
								else {
									if(this.vx > 5) {
										this.vx -= 5;
									}
									else {
										this.vx = 0;
									}
								}
							}
							
							this.x += this.vx/200;
							this.y -= this.vy / 200;
							
							//                                                                     lu = left-up                     ru = right-up
							//Update of this corner position:                                       //---------------+---------------
								this.ru.x = this.x + game.blockSize; this.ru.y = this.y;                //         ___ /^^[___              
								this.rd.x = this.x + game.blockSize; this.rd.y = this.y + game.blockSize;   //        /|^+----+   |#___________//
								this.lu.x = this.x; this.lu.y = this.y;                             //      ( -+ |____|   _______-----+/
								this.ld.x = this.x; this.ld.y = this.y + game.blockSize;                //       ==_________--'            \
																									//          ~_|___|__
							// 															           ld = left-down                   rd = right-down
							
							for (var i = 0; i < platforms.length; i++) {

							/*Prüfung Landung*/
								if(checkOnPlatform(platforms[i].xStart, platforms[i].xEnd,
									platforms[i].yStart, platforms[i].yEnd,
									this.ld.x, this.rd.x, this.ld.y, this.rd.y)){
										this.currPlatform = platforms[i].id;
										break;
								}else{
									this.currPlatform = 0;
									this.collisionBottom = false;
								}
							}
							
							//update taxi attributes according to guests
							this.passengers = 0;
							for (i = 0; i < guests[game.roundNumber-1].length; i++){
								if(guests[game.roundNumber-1][i].state == "onTaxi")
									this.passengers++;
								if(taxi.passengers == guests[game.roundNumber-1].length){
									this.state = "full";
								}else{
									this.state = "free";
								}
							}
						},
						
						collides: function(obstXstart, obstXend, obstYstart, obstYend){
							if (checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.lu.x, this.lu.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.ld.x, this.ld.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.ru.x, this.ru.y)||
								checkCollision(obstXstart, obstXend, obstYstart, obstYend, this.rd.x, this.rd.y)) {
								return true;
							}
							else {
								return false;
							}
						},
						
						//Heli going straight up
						draw: function(){
							switch(this.drawState){
								case "up":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, 0, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;

								case "left":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;
        
								case "right":
									ctx.drawImage(taxiImage, Math.floor(game.frame % 5) *  taxiImage.width / 5, 2 * taxiImage.height / 3, taxiImage.width / 5, taxiImage.height / 3,
										  this.x, this.y, taxiImage.width / 5 / 2, taxiImage.height / 3 / 2);
									break;
									
								case "broken":
									taxi.vx = 0;
									taxi.vy = 0;
									ctx.drawImage(brokenTaxiImage, Math.floor(game.frame % 8) * brokenTaxiImage.width / 8, Math.floor(game.frame / 8) * brokenTaxiImage.height / 6,
										  brokenTaxiImage.width / 8, brokenTaxiImage.height / 6, this.x - 42, this.y - 47, brokenTaxiImage.width / 8 / 2, brokenTaxiImage.height / 6 / 2);
									game.frame += 0.2;
									if(game.frame > 48) {
										gameOverMenu();
									}
									break;
							}
						},
						
						death: function(){
							this.drawState = "broken";
							game.frame = 0;
							game.state = "over";
						}
					};
					break;
				
				case "1":
                case "2":
				case "3":
					var value = levelRows[y][x] - 1;

					guests[value].push({
						type: levelRows[y][x], state: "free", 
						currPlatform : 0, targetPlatform: 0,	//muss irgendwann später definiert werden, da dies immer wieder geschieht
						xStart: x * game.blockSize, x: x * game.blockSize,
						yStart: y * game.blockSize, y: y * game.blockSize,
						enterTaxi: function(taxiX){
							if(taxiX-this.x <0){
								this.x -= 1;
							}else{
								this.x += 1;
							}
						},
						update: function(){
							for (var i = 0; i < platforms.length; i++) {
								/*Prüfung Landung*/
								if(checkOnPlatform(platforms[i].xStart, platforms[i].xEnd,
									platforms[i].yStart, platforms[i].yEnd,
									this.x, this.x +game.blockSize, this.y + game.blockSize, this.y + game.blockSize)){
										this.currPlatform = platforms[i].id;
								}
							}
						},
						
						draw: function(){
										if(this.state == "free" && (this.type == game.roundNumber)){
											ctx.drawImage(guest, 0, 0, guest.width, guest.height, this.x, this.y, game.blockSize, game.blockSize);
										}
						}		
					});

					break;
            }//switch
        }//for x
    }//for y
    //guests.changeShownGuests(1);
}