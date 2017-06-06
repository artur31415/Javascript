
//objsect used to handle the canvas
var Context = {
    canvas : null,
    context : null,
    font: "50px Georgia",
    create: function(canvas_tag_id)
    {
        this.canvas = document.getElementById(canvas_tag_id);
        this.context = this.canvas.getContext('2d');
        this.context.font = this.font;
        return this.context;
    }
};
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------

//constants used to draw the world
var Y_MAX = 600;
var X_MAX = 1020;

var dotSize = 3;
//-------------------------------------------------------------------------
var VoronoiPoints = [];
var regionColors;
///////////////////////////////////////////////////////////////////////////////////////////////
//map function
function map(x, x0, x1, y0, y1)
{
  return (y0 + (x - x0) * ((y1 - y0) / (x1 - x0)));
}

function RandomNumber(begin, end)
{
    return Math.floor((Math.random() * end) + begin);
}

//draw the world
function showWorld()
{
  Context.context.fillStyle = "#F0F0F0";
  Context.context.fillRect(0, 0, X_MAX, Y_MAX);

}

function DoVoronoiMath()
{
  for(var i = 0; i < X_MAX; ++i)
  {
    for(var j = 0; j < Y_MAX; ++j)
    {
      var smallerD = -1;
      var smallerIndex = 0;

      for(var index = 0; index < VoronoiPoints.length; ++index)
      {
        //here you can change to cartesian distance if you want
        var _d = ManhatamDistance({x: i, y: j}, VoronoiPoints[index]);
        if(smallerD == -1 || _d < smallerD)
        {
          smallerD = _d;
          smallerIndex = index;
        }
      }

      Context.context.fillStyle = "rgba(" + regionColors[smallerIndex].r + ", " + regionColors[smallerIndex].g + ", " + regionColors[smallerIndex].b + ", 0.5)";
      Context.context.fillRect(i, j, dotSize, dotSize);
    }
  }

  for(var i = 0; i < VoronoiPoints.length; ++i)
  {
    Context.context.fillStyle = "#fff";
    Context.context.fillRect(VoronoiPoints[i].x, VoronoiPoints[i].y, dotSize * 2, dotSize * 2);
  }
}

//cartesian distance
function CartesianDistance(PosA, PosB)
{
	return Math.sqrt((PosA.x - PosB.x) * (PosA.x - PosB.x) + (PosA.y - PosB.y) * (PosA.y - PosB.y));
}

//manhatam distance
function ManhatamDistance(PosA, PosB)
{
	return (Math.abs(PosA.x - PosB.x) + Math.abs(PosA.y - PosB.y));
}

function EqualsTol(D1, D2, Tol)
{
  if(Math.abs(D1 - D2) <= Tol)
    return true;
  else {
    return false;
  }
}

$(document).ready(function()
{
    //Init the canvas
    Context.create("canvas");

    X_MAX = Context.canvas.width;
    Y_MAX = Context.canvas.height;

    var rnd = RandomNumber(50, 100);
    for(var j = 0; j < rnd; ++j)
    {
      var _x = RandomNumber(0, X_MAX);
      var _y = RandomNumber(0, Y_MAX);
      VoronoiPoints.push({x: _x, y: _y});
    }

    regionColors = Array(VoronoiPoints.length);
    for(var i = 0; i < regionColors.length; ++i)
    {
      regionColors[i] = {r: RandomNumber(0, 255), g: RandomNumber(0, 255), b: RandomNumber(0, 255)};
    }

    showWorld();
    DoVoronoiMath();

    $('div[id=main_text]').html("Number of Voronoi Regions = " + VoronoiPoints.length);

    //console.log("Number of Voronoi Regions = " + VoronoiPoints.length);
});
