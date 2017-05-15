/*************************************************************************************************************************
    DEVELOPED BY:   ARTUR FERREIRA MOREIRA
    DATE:           MAY, 14 OF 2017
    EMAIL:          artur31415926@gmail.com
    WEBPAGE:        http://daedalusstone.com/
    INSTAGRAM:      https://www.instagram.com/artur31415/
    GOOGLEPLAY:     https://play.google.com/store/apps/developer?id=Synapse
    YOUTUBE:        https://www.youtube.com/channel/UC6blOB30re0J-Oiksqaob1g/videos
    GITHUB:         https://github.com/artur31415
    TWITTER:        https://twitter.com/artur31415
    LINKEDIN:       https://www.linkedin.com/in/artur31415
**************************************************************************************************************************/

var Context = {
    canvas : null,
    context : null,
    font: "50px Georgia",
    create: function(canvas_tag_id) {
        this.canvas = document.getElementById(canvas_tag_id);
        this.context = this.canvas.getContext('2d');
        this.context.font = this.font;
        return this.context;
    }
};
//-------------------------------------------------------------------
var squareSize = 10;//30
var Y_MAX = 600;
var X_MAX = 1020;
var lineWidth = 2;
var X_CELL_LENGTH = 103;//35
var Y_CELL_LENGTH = 61;//21

//Game Mechanics Variables-------------------------------------------
var WorldCells = Array(X_CELL_LENGTH);
///////////////////////////////////////////////////////////////////////////////////////////////
function RandomNumber(begin, end)
{
    return Math.floor((Math.random() * end) + begin);
}

function SetCell(posX, posY)
{
    WorldCells[posX][posY] = 1;
}

function UnsetCell(posX, posY)
{
    WorldCells[posX][posY] = 0;
}

function ClearCells()
{
    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_LENGTH; ++y)
        {
            WorldCells[x][y] = 0;
        }
    }
}

function showWorld()
{
    Context.context.fillStyle = "#F0F0F0";
    Context.context.fillRect(0, 0, 1020, 600);


    Context.context.beginPath();
    Context.context.fillStyle = "#000000";
    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        Context.context.moveTo(x * squareSize + 1, 0);
        Context.context.lineTo(x * squareSize + 1, Y_MAX);
    }

    for(var y = 0; y < Y_CELL_LENGTH; ++y)
    {
        Context.context.moveTo(0, y * squareSize + 1);
        Context.context.lineTo(X_MAX + 2, y * squareSize + 1);
    }
    Context.context.stroke();


    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_LENGTH; ++y)
        {
            if(WorldCells[x][y] == 1)
            {
                Context.context.fillStyle = "#F00000";
                Context.context.fillRect(x * squareSize + lineWidth, y * squareSize + lineWidth, squareSize - lineWidth, squareSize - lineWidth);
            }
        }
    }
}

function GameOfLife()
{
    for(var x = 0; x < X_CELL_LENGTH - 1; ++x)
    {
        for(var y = 0; y < Y_CELL_LENGTH - 1; ++y)
        {
            //console.log("x = " + x + "; y = " + y);
            var aliveNeighbors = 0;
            for(var _x = x - 1; _x <= x + 1; ++_x)
            {
                for(var _y = y - 1; _y <= y + 1; ++_y)
                {
                    //console.log("_x = " + _x + "; _y = " + _y);
                    if((_x > 0 && _x < X_CELL_LENGTH - 1) && (_y > 0 && _y < Y_CELL_LENGTH - 1) && !(_x == x && _y == y) && WorldCells[_x][_y] == 1)//LIVE CELL
                    {
                        ++aliveNeighbors;
                    }
                    if((_x >= 0 && _x < X_CELL_LENGTH) && (_y >= 0 && _y < Y_CELL_LENGTH) && !(_x == x && _y == y))
                    {
                        //console.log("WorldCells[" + _x + "][" + _y + "] = " + WorldCells[_x][_y]);
                    }
                }
            }
            //console.log("aliveNeighbors = " + aliveNeighbors);
            //console.log("============================");

            if(WorldCells[x][y] == 1)//LIVE CELL
            {
                if(aliveNeighbors < 2 || aliveNeighbors > 3)
                    WorldCells[x][y] = 0;//DIES
            }
            else//DEAD CELL
            {
                if(aliveNeighbors == 3)
                    WorldCells[x][y] = 1;//BORNS
            }
        }
    }
}

$(document).ready(function() {

    // Initialize Canvas
    Context.create("canvas");

    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        WorldCells[x] = Array(Y_CELL_LENGTH);
    }
    ClearCells();
    showWorld();


    var count = RandomNumber(0, X_CELL_LENGTH * Y_CELL_LENGTH / 10);
    for(var m = 0; m < count; ++m)
    {
        while(true)
        {
            var i = RandomNumber(0, X_CELL_LENGTH - 1);
            var j = RandomNumber(0, Y_CELL_LENGTH - 1);

            if(WorldCells[i][j] == 0)
            {
                SetCell(i, j);
                break;
            }
        }
    }

    setInterval(function() {
        //context.fillStyle = “rgb(0, 162, 232)”;


        showWorld();
        GameOfLife();

    }, 50);

});
