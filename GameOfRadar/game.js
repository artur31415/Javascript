
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

var Sprite = function(filename, is_pattern) {
  
    // Construct
    this.image = null;
    this.pattern = null;
    this.TO_RADIANS = Math.PI/180;
    
    
    if (filename != undefined && filename != "" && filename != null)
    {
        this.image = new Image();
        this.image.src = filename;
        //this.image.onload = function(e) {
            //window.window.alert(filename); 
        //}
        
        //if (is_pattern)
            //this.pattern = Context.context.createPattern(this.image, "repeat");
        //window.alert("Here1");
    }
    else
        window.alert("Unable to load sprite.");
    
    this.draw = function(x, y, w, h)
    {
        // Pattern?
        if (this.pattern)
        {
            //console.log("pattern!");
            Context.context.fillStyle = this.pattern;
            Context.context.fillRect(x, y, w, h);
        } 
        else 
        {
            // Image
            if (!w)
            {
               Context.context.drawImage(this.image, x, y, this.image.width, this.image.height);
            } 
            else 
            {
                // Stretched
                Context.context.drawImage(this.image, x, y, w, h);
  
            }            
        }
    };
    
    this.rotate = function(x, y, angle)
    {
        Context.context.save();
        
        Context.context.translate(x, y);
        Context.context.rotate(angle * this.TO_RADIANS);
        
        Context.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2));
        
        Context.context.restore();
    };
    
    this.DrawFillText = function(text, x, y, FONT, COLOR)
    {
        var LastFont = Context.context.font;
        if(FONT != null)
        {
            Context.context.font = FONT;
        }
        if(COLOR != null)
            Context.context.fillStyle = COLOR;
        else
            Context.context.fillStyle = "white";
        Context.context.fillText(text, x, y);
        
        Context.context.font = LastFont;
    };
    
    this.WrapText = function(text, x, y, maxWidth, lineHeight, FONT, COLOR) 
    {
        var cars = text.split("\n");
        var LastFont = Context.context.font;
        if(FONT != null)
        {
            Context.context.font = FONT;
        }
        if(COLOR != null)
            Context.context.fillStyle = COLOR;
        else
            Context.context.fillStyle = "white";
        

        for (var ii = 0; ii < cars.length; ++ii) 
        {
            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) 
            {
                var testLine = line + words[n] + " ";
                var metrics = Context.context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > maxWidth) 
                {
                    Context.context.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else 
                {
                    line = testLine;
                }
            }

            Context.context.fillText(line, x, y);
            y += lineHeight;
        }
        Context.context.font = LastFont;
        
        return cars.length - 1;
    };
    
        
    
};

Number.prototype.pad = function(size) 
{
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

//-------------------------------------------------------------------
var squareSize = 10;//30
var Y_MAX = 600;
var X_MAX = 1020;
var lineWidth = 2;


var X_CELL_LENGTH = 103;//35
var Y_CELL_LENGTH = 60;//21

var X_CELL_MAP_LENGTH = X_CELL_LENGTH * 3;
var Y_CELL_MAP_LENGTH = Y_CELL_LENGTH * 3;

var obstacleSize = 2;
var obstacleRayLen = 0;
var maxObstacleCount = 50;


var angle = 0;
var angleIncrement = 3;
var aperture = 30;
var leftOverAperture = 90;
var count = 0;
var countMax = 1;


var closerVisibleRange = 13;
var xLeftCloseVisibleRange = Math.floor((X_CELL_LENGTH / 2 - 2) / 2 - closerVisibleRange + 1);
var xRightCloseVisibleRange = Math.floor((X_CELL_LENGTH / 2 - 2) / 2 + closerVisibleRange);
var yTopCloseVisibleRange = Math.floor((Y_CELL_LENGTH / 2) + closerVisibleRange - 1);
var yBottomCloseVisibleRange = Math.floor((Y_CELL_LENGTH / 2) - closerVisibleRange);

///////////
var len = 200;
var xSonar = (3 * X_MAX / 4 + squareSize);//(3 * X_MAX / 4 + squareSize / 2);
var ySonar = Y_MAX / 2 - squareSize / 2;

var xRobot = (X_MAX / 4 - squareSize + 1);//(X_MAX / 4 - squareSize / 2 + 1);
var yRobot = Y_MAX / 2 - squareSize / 2;

var debugCounter = 0;
var debugBool = false;
//Game Mechanics Variables-------------------------------------------
var WorldCells = Array(X_CELL_MAP_LENGTH);
var EnviromentCells = Array(X_CELL_LENGTH);
var ObstaclesPosition = [];
var robotPosition = {x: Math.floor(X_CELL_MAP_LENGTH / 2), y: Math.floor(Y_CELL_MAP_LENGTH / 2)};
var Level = 0;
var MaxSteps = 200;
var StepsLeft = MaxSteps;
var hasEnd = false;
var EndProbability = 15;//%
var GameMessage = 0;
var GameMessageCounter = 0;
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

function isEndSpot(posX, posY)
{
    if(WorldCells[posX][posY] == 2)
        return true;
    else
        return false;
}
function isObstacleSpot(posX, posY)
{
    if(WorldCells[posX][posY] == 1)
        return true;
    else 
        return false;
}

function ClearCells()
{
    for(var x = 0; x < X_CELL_MAP_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_MAP_LENGTH; ++y)
        {
            WorldCells[x][y] = 0;
        }
    }
    
    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_LENGTH; ++y)
        {
            EnviromentCells[x][y] = 0;
        }
    }
}

function SonarSensing()
{
    for(var i = 0; i <= len; ++i)
    {
        var cos = Math.cos(angle * Math.PI / 180);
        var sin = Math.sin(angle * Math.PI / 180);
        var xAdd = i * cos;
        var yAdd = i * sin;
        var xDemo = xRobot + xAdd;
        var yDemo = yRobot + yAdd;

        var p = Context.context.getImageData(xDemo, yDemo, 1, 1).data; 
        //var str = "len = " + i + "; color(" + xDemo + ", " + yDemo + ") = [" + p[0] + ", " + p[1] + ", " + p[2] + "]";
        //rgba(10, 150, 30, 1)
        if((p[0] == 0 && p[1] == 0 && p[2] == 240) || (p[0] == 10 && p[1] == 150 && p[2] == 30))
        {
            //console.log(str);

            var isOnTheArray = false;
            for(var k = 0; k < ObstaclesPosition.length; ++k)
            {
                if(ObstaclesPosition[k].x1 == xSonar + xAdd && ObstaclesPosition[k].y1 == ySonar + yAdd)
                {
                    isOnTheArray = true;
                    break;
                }
            }

            if(!isOnTheArray)
                ObstaclesPosition.push({x1:xSonar + xAdd, y1:ySonar + yAdd, x2: xSonar + xAdd + (obstacleRayLen + len - i) * cos, y2: ySonar + yAdd + (obstacleRayLen + len - i) * sin, ang: angle, isEnd: (p[0] == 10 && p[1] == 150 && p[2] == 30) || false});

            break;
        }
    }

    if(ObstaclesPosition.length > 0 && (angle - ObstaclesPosition[0].ang >= aperture + leftOverAperture))
        ObstaclesPosition.splice(0, 1);
    //console.log(ObstaclesPosition.length);

}

function ShowFog()
{
    var Sight = 1;
    Context.context.fillStyle = "rgba(120, 120, 120, 0.98)";//0.98
    
    //UP
    Context.context.fillRect(xLeftCloseVisibleRange * squareSize + 1, yBottomCloseVisibleRange * squareSize, (xRightCloseVisibleRange - xLeftCloseVisibleRange) * squareSize + 1, (closerVisibleRange - Sight) * squareSize + lineWidth);
    
    //BOTTOM
    Context.context.fillRect(xLeftCloseVisibleRange * squareSize + 1, (yBottomCloseVisibleRange + Math.floor((yTopCloseVisibleRange - yBottomCloseVisibleRange) / 2) + Sight) * squareSize, (xRightCloseVisibleRange - xLeftCloseVisibleRange) * squareSize + 1, (closerVisibleRange - Sight) * squareSize + lineWidth);
    
    //Context.context.fillStyle = "rgba(240, 100, 255, 0.98)";
    //LEFT
    Context.context.fillRect(xLeftCloseVisibleRange * squareSize + 1, (yBottomCloseVisibleRange + closerVisibleRange - Sight) * squareSize + lineWidth, (closerVisibleRange - Sight) * squareSize + 1, (2 * (Sight) - 1) * squareSize - lineWidth);
    
    //Context.context.fillStyle = "rgba(10, 100, 255, 0.98)";
    //RIGHT
    Context.context.fillRect((xRightCloseVisibleRange - closerVisibleRange + Sight) * squareSize + 1, (yBottomCloseVisibleRange + closerVisibleRange - Sight) * squareSize + lineWidth, (closerVisibleRange - Sight) * squareSize + 1, (2 * (Sight) - 1) * squareSize - lineWidth);
}

function ShowWorld()
{
    //CLEAR WORLD
    Context.context.fillStyle = "#FFFFFF";
    Context.context.fillRect(0, 0, X_MAX, Y_MAX);
    
    //SHOW SONAR DISC
    Context.context.beginPath();
    Context.context.fillStyle = "rgba(0, 100, 0, 1)";
    Context.context.arc(xSonar, ySonar, len + len / 16, 0, 2 * Math.PI);
    Context.context.fill();
    
    Context.context.lineWidth = 10;
    Context.context.strokeStyle = '#000000';
      
    Context.context.stroke();
    
    
    //SHOW SOME TEXT
    Context.context.fillStyle = "rgba(240, 100, 0, 1)";
    Context.context.font = "30px Arial";
    Context.context.fillText("World", (xLeftCloseVisibleRange + 8) * squareSize, (yBottomCloseVisibleRange - 1) * squareSize);
    Context.context.fillText("Sonar", xSonar - 4 * squareSize, ySonar - 230);
    
    Context.context.fillStyle = "rgba(0, 0, 0, 1)";
    Context.context.fillText("Level", 10, 25);
    Context.context.fillText(Level, 235, 25);
    Context.context.fillText("Steps Left", 10, 55);
    
    if(StepsLeft <= (MaxSteps + MaxSteps * 0.3 * Level) * 0.3)
        Context.context.fillStyle = "rgba(255, 0, 0, 1)";
    
    Context.context.fillText(StepsLeft.pad(3), 200, 55);
    
    //GAME MESSAGES
    Context.context.fillStyle = "rgba(255, 0, 0, 1)";
    if(GameMessage == 1)
    {
        Context.context.fillText("YOU DIED ON A COLLISION!", 350, 25);
    }
    else if(GameMessage == 2)
    {
        Context.context.fillText("YOU PASSED TO THE NEXT LEVEL!", 350, 25);
    }
    else if(GameMessage == 3)
    {
        Context.context.fillText("YOU DIED OUT OF STEPS!", 350, 25);
    }
    
    //Press w, a, s and d to move the robot
    Context.context.fillStyle = "rgba(0, 0, 0, 1)";
    Context.context.font = "20px Arial";
    Context.context.fillText("Press W, A, S and D to move the robot", 10, 550);
    Context.context.fillText("GREEN = Obstacle", xSonar + 50, 530);
    Context.context.fillText("RED = Goal", xSonar + 50, 550);
    
    if(GameMessage != 0)
    {
        ++GameMessageCounter;
        if(GameMessageCounter >= 200)
        {
            GameMessageCounter = 0;
            GameMessage = 0;
        }
    }
    
    //////////DRAW SONAR OBSTACLES HERE
    Context.context.lineWidth = 3;
    for(var k = 0; k < ObstaclesPosition.length; ++k)
    {
        //Context.context.fillStyle = "rgba(0, 200, 0, 1)";//"#10A010";
        //Context.context.fillRect(ObstaclesPosition[k].x1, ObstaclesPosition[k].y1, obstacleSize, obstacleSize);
    
        Context.context.beginPath();
        
        if(ObstaclesPosition[k].isEnd)
            Context.context.strokeStyle = "rgba(150, 20, 0, " + ((k + 0.2) / ObstaclesPosition.length) + ")";//"#10A010";
        else
            Context.context.strokeStyle = "rgba(0, 200, 0, " + ((k + 0.2) / ObstaclesPosition.length) + ")";//"#10A010";
        //else
        //    Context.context.fillStyle = "#000000";
        
        Context.context.moveTo(ObstaclesPosition[k].x1, ObstaclesPosition[k].y1);
        Context.context.lineTo(ObstaclesPosition[k].x2, ObstaclesPosition[k].y2);//Y_MAX
        
        Context.context.stroke();
    }
    Context.context.lineWidth = 1;
    
    ////////////////////////////////////////////////////////////
    
    //for(var x = 0; x < X_CELL_LENGTH / 2 - 2; ++x)
    
    
    
    for(var x = xLeftCloseVisibleRange; x <= xRightCloseVisibleRange; ++x)
    {
        Context.context.beginPath();
        Context.context.strokeStyle = "#000000";
        
        Context.context.moveTo(x * squareSize + 1, yBottomCloseVisibleRange * squareSize);
        Context.context.lineTo(x * squareSize + 1, yTopCloseVisibleRange * squareSize);//Y_MAX
        
        //Context.context.moveTo(x * squareSize + 1, 0);
        //Context.context.lineTo(x * squareSize + 1, squareSize * (Y_CELL_LENGTH - 1));//Y_MAX
        
        Context.context.stroke();
    }
    
    /*
    for(var x = X_CELL_LENGTH / 2 + 1.5; x < X_CELL_LENGTH; ++x)
    {
        Context.context.beginPath();
        Context.context.strokeStyle = "#000000";
        
        Context.context.moveTo(x * squareSize + 1, 0);
        Context.context.lineTo(x * squareSize + 1, squareSize * (Y_CELL_LENGTH - 1));//Y_MAX
        
        Context.context.stroke();
    }
    */
    
    //for(var y = 0; y < Y_CELL_LENGTH; ++y)
    for(var y = yBottomCloseVisibleRange; y <= yTopCloseVisibleRange; ++y)
    {
        Context.context.beginPath();
        
        Context.context.strokeStyle = "#000000";
        
        Context.context.moveTo(xLeftCloseVisibleRange * squareSize + 1, y * squareSize + 1);
        Context.context.lineTo(xRightCloseVisibleRange * squareSize + 1, y * squareSize + 1);
        //Context.context.moveTo(0, y * squareSize + 1);
        //Context.context.lineTo((X_MAX / 2 + 2 * (1 - squareSize)), y * squareSize + 1);
        
        Context.context.stroke();
        
        ////////////////////////////
        
        /*
        Context.context.beginPath();
        
        Context.context.moveTo((X_MAX / 2 + 2 * (1 + squareSize)), y * squareSize + 1);
        Context.context.lineTo((X_MAX + 2), y * squareSize + 1);
        
        Context.context.stroke();
        */
    }
    
    for(var a = 0; a < 360; a += 45)
    {
        var endX = (len + len / 16) * Math.cos(a * Math.PI / 180);
        var endY = (len + len / 16) * Math.sin(a * Math.PI / 180);
        
        Context.context.beginPath();
        
        Context.context.strokeStyle = "#000000";
        
        Context.context.moveTo(xSonar, ySonar);
        Context.context.lineTo(xSonar + endX, ySonar + endY);
        
        Context.context.stroke();
    }
    
    for(var line = 0; line < (len + len / 16); line += (len + len / 16) / 5)
    {
        Context.context.beginPath();
        
        Context.context.strokeStyle = "#000000";
        
        Context.context.arc(xSonar, ySonar, line, 0, 2 * Math.PI);
        
        Context.context.stroke();
    }
    
    
    //DRAW WORLD OBSTACLES
    var ViewWidth = Math.floor((xRightCloseVisibleRange - xLeftCloseVisibleRange) / 2);
    var ViewHeight = Math.floor((yTopCloseVisibleRange - yBottomCloseVisibleRange) / 2);
    var ViewRec = {x1: -1, y1: 0, x2: 0, y2: 0};
    
    
    
    for(var x = 0; x < X_CELL_MAP_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_MAP_LENGTH; ++y)
        {
            
            //if(((x >= robotPosition.x - (X_CELL_LENGTH / 2 - 3) / 2) && (x <= robotPosition.x + (X_CELL_LENGTH / 2 - 3) / 2)) && ((y >= robotPosition.y - (Y_CELL_LENGTH - 1) / 2) && (y <= robotPosition.y + (Y_CELL_LENGTH - 1) / 2)))
            if(((x >= robotPosition.x - ViewWidth) && (x <= robotPosition.x + ViewWidth)) && ((y >= robotPosition.y - ViewHeight) && (y <= robotPosition.y + ViewHeight)))
            {
                var _x = x - (robotPosition.x - ViewWidth) + xLeftCloseVisibleRange;
                var _y = y - (robotPosition.y - ViewHeight) + yBottomCloseVisibleRange;
                //console.log("_x = " + _x + "; _y = " + _y);
                var val = WorldCells[x][y];
                if(val == 1)
                {
                    Context.context.fillStyle = "#0000F0";  
                    Context.context.fillRect((_x) * squareSize + lineWidth, (_y) * squareSize + lineWidth, squareSize - lineWidth, squareSize - lineWidth);
                }
                else if(val == 2)
                {
                    Context.context.fillStyle = "rgba(10, 150, 30, 1)";  
                    Context.context.fillRect((_x) * squareSize + lineWidth, (_y) * squareSize + lineWidth, squareSize - lineWidth, squareSize - lineWidth);
                }
                
                
                
                if(ViewRec.x1 == -1)
                {
                    ViewRec.x1 = _x * squareSize + lineWidth;
                    ViewRec.y1 = _y * squareSize + lineWidth;
                }
                else
                {
                    ViewRec.x2 = (_x + 1) * squareSize + lineWidth;
                    ViewRec.y2 = (_y + 1) * squareSize + lineWidth;
                }
            }
        }
    }
    
    /*
    Context.context.beginPath();
        
    Context.context.strokeStyle = "#000000";

    Context.context.moveTo(ViewRec.x1, ViewRec.y1);
    Context.context.lineTo(ViewRec.x2, ViewRec.y1);
    Context.context.lineTo(ViewRec.x2, ViewRec.y2);
    Context.context.lineTo(ViewRec.x1, ViewRec.y2);
    Context.context.lineTo(ViewRec.x1, ViewRec.y1);

    Context.context.stroke();
    */
    /*
    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        for(var y = 0; y < Y_CELL_LENGTH - 1; ++y)
        {
            if((x + robotPosition.x >= 0 && x + robotPosition.x <= (30)) && (y + robotPosition.y >= 0 && y + robotPosition.y <= Y_CELL_LENGTH) && WorldCells[x + robotPosition.x][y + robotPosition.y] == 1)
            {
                Context.context.fillStyle = "#0000F0";
                Context.context.fillRect((x) * squareSize + lineWidth, (y) * squareSize + lineWidth, squareSize - lineWidth, squareSize - lineWidth);
                if(!debugBool && robotPosition.x < -20)
                {
                    //console.log("x = " + x + "; y = " + y + "; Rx = " + robotPosition.x + "; Ry = " + robotPosition.y);
                }
            }
        }
    }
    if(robotPosition.x < -20)
        debugBool = true;
    */
    //DRAW ROBOT
    Context.context.fillStyle = "#F00000";
    Context.context.fillRect((X_CELL_LENGTH / 4 - 1.8) * squareSize + lineWidth, (Y_CELL_LENGTH / 2 - 1) * squareSize + lineWidth, squareSize - lineWidth, squareSize - lineWidth);
    
}


function doKeyDown(e)
{
    //console.log(e.keyCode);
    //W - 119; A - 97; S - 115; D - 100;
    var xInc = 0;
    var yInc = 0;
    
    if(e.keyCode == 119 || e.keyCode == 115 || e.keyCode == 97 || e.keyCode == 100)
        --StepsLeft;
    
    if(e.keyCode == 119)
        yInc = -1;
    else if(e.keyCode == 115)
        yInc = 1;
    
    if(e.keyCode == 97)
        xInc = -1;
    else if(e.keyCode == 100)
        xInc = 1;
    
    if(isObstacleSpot(robotPosition.x + xInc, robotPosition.y + yInc))
    {
        //alert("You died!");
        //console.log("COLLISION!");
        GameMessage = 1;
        //Reload Game
        if(Level > 0)
            --Level;
        StepsLeft = MaxSteps + MaxSteps * 0.3 * Level;
        ResetGame();
    }
    
    if(StepsLeft == 1)
    {
        //alert("You died!");
        //console.log("OUT OF STEPS!");
        GameMessage = 3;
        //Reload Game
        if(Level - 2 > 0)
            Level -= 2;
        else
            Level = 0;
        StepsLeft = MaxSteps + MaxSteps * 0.3 * Level;
        ResetGame();
    }
    
    if(isEndSpot(robotPosition.x + xInc, robotPosition.y + yInc))
    {
        GameMessage = 2;
        //console.log("END ACHIEVED!");
        ++Level;
        StepsLeft = MaxSteps + MaxSteps * 0.3 * Level;
        ResetGame();
    }
    
    robotPosition.y += yInc;
    robotPosition.x += xInc;
    console.log("robotPosition = {" + robotPosition.x + ", " + robotPosition.y + "}")
}

function ResetGame()
{
    ClearCells();
    
    var SortableMax = (X_CELL_MAP_LENGTH) * (Y_CELL_MAP_LENGTH) * 0.05;
    var count = RandomNumber(150, 150 + SortableMax);
    console.log("Total = " + ((X_CELL_MAP_LENGTH) * (Y_CELL_MAP_LENGTH)) + "; Max = " + SortableMax + "; RandomMax = " + count);
    for(var m = 0; m < count; ++m)
    {
        while(true)
        {
            var i = RandomNumber(0, X_CELL_MAP_LENGTH - 1);
            var j = RandomNumber(0, Y_CELL_MAP_LENGTH - 1);

            if(WorldCells[i][j] == 0)
            {
                //if(!hasEnd && RandomNumber(0, 100) < EndProbability)
                if(!hasEnd && (i >= robotPosition.x - 10 && i <= robotPosition.x + 10) && (j >= robotPosition.y - 30 && j <= robotPosition.y + 30))
                {    
                    WorldCells[i][j] = 2;
                    hasEnd = true;
                }
                else
                    WorldCells[i][j] = 1;
                break;
            }
        }
    }
}

$(document).ready(function() {
        
    window.addEventListener( "keypress", doKeyDown, false );
    
    Context.create("canvas");
    
    for(var x = 0; x < X_CELL_MAP_LENGTH; ++x)
    {
        WorldCells[x] = Array(Y_CELL_MAP_LENGTH);
    }
    for(var x = 0; x < X_CELL_LENGTH; ++x)
    {
        EnviromentCells[x] = Array(Y_CELL_LENGTH);
    }
    
    ResetGame();
    ShowWorld();
    
    
    setInterval(function() {
        //context.fillStyle = “rgb(0, 162, 232)”;
        

        ShowWorld();
        
        ++count;
        if(count >= countMax)
        {
            count = 0;
            angle += angleIncrement;
            //if(angle == 360)
            //    angle = 0;
        }
        
        SonarSensing();
        ShowFog();
        /*
        if(angle == 0 && debugCounter == 0)
        {
            ++debugCounter;
            for(var i = 0; i <= len; ++i)
            {
                var xDemo = xRobot + i * Math.cos(angle * Math.PI / 180);
                var yDemo = yRobot + i * Math.sin(angle * Math.PI / 180);

                var p = Context.context.getImageData(xDemo, yDemo, 1, 1).data; 
                var str = "len = " + i + "; color(" + xDemo + ", " + yDemo + ") = [" + p[0] + ", " + p[1] + ", " + p[2] + "]";
                console.log(str);
            }
        }
        */
        
        
        
        //////////////////////////////////////////////////////////////////////////////////////
        
        Context.context.beginPath();
            
        Context.context.moveTo(xRobot, yRobot);
        Context.context.lineTo(xRobot + (len / 8) * Math.cos(angle * Math.PI / 180), yRobot + (len / 8) * Math.sin(angle * Math.PI / 180));
        //Context.context.lineTo(_x + len * Math.cos((angle + aperture) * Math.PI / 180), _y + len * Math.sin((angle + aperture) * Math.PI / 180));
        
        Context.context.stroke();
        
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////   SONAR   ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        Context.context.beginPath();
        Context.context.fillStyle = "rgba(0, 200, 150, 0.3)";
        //var grd = Context.context.createLinearGradient(0, 0, 170, 0);
        //grd.addColorStop(0,"black");
        //grd.addColorStop(1,"white");

        //Context.context.fillStyle=grd;
            
        Context.context.moveTo(xSonar, ySonar);
        Context.context.lineTo(xSonar + len * Math.cos((angle - aperture) * Math.PI / 180), ySonar + len * Math.sin((angle - aperture) * Math.PI / 180));
        Context.context.arc(xSonar, ySonar, len, (angle - aperture) * Math.PI / 180, (angle) * Math.PI / 180);
        //Context.context.lineTo(_x + len * Math.cos((angle + aperture) * Math.PI / 180), _y + len * Math.sin((angle + aperture) * Math.PI / 180));
        Context.context.lineTo(xSonar, ySonar);

        Context.context.fill();
        //Context.context.stroke();
        
        ///////
        
        Context.context.beginPath();
        Context.context.fillStyle = "rgba(0, 200, 150, 0.1)";
            
        Context.context.moveTo(xSonar, ySonar);
        Context.context.lineTo(xSonar + len * Math.cos((angle - leftOverAperture - aperture) * Math.PI / 180), ySonar + len * Math.sin((angle - leftOverAperture - aperture) * Math.PI / 180));
        Context.context.arc(xSonar, ySonar, len, (angle - leftOverAperture - aperture) * Math.PI / 180, (angle - aperture) * Math.PI / 180);
        //Context.context.lineTo(_x + len * Math.cos((angle - 60) * Math.PI / 180), _y + len * Math.sin((angle - 60) * Math.PI / 180));
        Context.context.lineTo(xSonar, ySonar);

        Context.context.fill();
        //Context.context.stroke();
        
    }, 1);
    
});