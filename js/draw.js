// Draw the game
function draw() {
    // Counting up the frame
    frame += 0.1;
    //console.log("draw!");
    drawBackground();
    drawLevel();
    taxi.draw();

    //Only for debugging
    ctx.fillText("Debugging:", 10, 20);
    ctx.fillText("velocity Y = " + taxi.vy, 10, 40);
    //ctx.fillText("Lost game: " + gameLost, 10, 60);
    ctx.fillText("Lost game: " + collisionText, 10, 60);
}

function drawBackground() {
        //ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, cwidth, cheight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
    }

// Draw the level depending on the level description file
function drawLevel() {
    var strings = levelDataRaw;
    var levelRows = strings.split("\r\n");

    for (y = 0; y < levelYMax; y++) {
        for (x = 0; x < levelXMax; x++) {

            switch(levelRows[y][x]){

                //Basic Level elements
                case ".": //Nothing
                    break;

                // Platform
                case "#":
                    ctx.fillStyle = "#AAAAAA";
                    ctx.fillRect(x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Left edge of platform
                case "<":
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * 5, blocks20x10.height / 10 * 1, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;
                
                // Right edge of platform
                case ">":
                    var indexx = 10, indexy = 1;
                    ctx.drawImage(blocks20x10, blocks20x10.width / 20 * indexx, blocks20x10.height / 10 * indexy, blocks20x10.width / 20, blocks20x10.height / 10,
                                        x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Level frame
                case "R":
                    ctx.drawImage(edge, 0, 0, edge.width, edge.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // "Hindernis fest"                           
                case "X": 
                    ctx.drawImage(obstacle, 0, 0, obstacle.width, obstacle.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // "Hindernis beweglich" moving between first and second X
                case "Y": 
                    
                    break;

                // First passenger spawning position
                case "1":
                    ctx.drawImage(guest, 0, 0, guest.width, guest.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Second passenger spawning position
                case "2":
                    ctx.drawImage(guest, 0, 0, guest.width, guest.height, x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Third passenger spawning position
                case "3":
                    ctx.drawImage(guest2, Math.floor(frame % 2) * guest2.width / 2, 0, guest2.width / 2, guest2.height,
			                             x * blockSizeX, y * blockSizeY, blockSizeX, blockSizeY);
                    break;

                // Position for level exit
                case "E":

                    break;

                // Reserved symbols for our group: G, H, I, J, K, L, M

                // TODO FÜR SPÄTER!!!!!!
                // Unterscheidung zwischen Groß- und Kleinschreibung

            }//switch
        }//for x
    }//for y

}