const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const BB = canvas.getBoundingClientRect();
const offsetX = BB.left;
const offsetY = BB.top;

canvas.width = 1000;
canvas.height = 600;

const blk = document.querySelectorAll(".blk");
//Attaching event listener on shape
for (let i = 0; i < blk.length; i++) {
  blk[i].addEventListener("click", handleInventoryClick);
}

let selected = false;
let shape;

function handleInventoryClick(event) {
  const selectedNode = document.getElementById("selected");

  if (selectedNode === event.target) {
    event.target.setAttribute("id", "null");
    selected = false;
    document.body.style.cursor = "default";
  } else {
    if (selectedNode) selectedNode.setAttribute("id", "null");
    event.target.setAttribute("id", "selected");
    selected = true;
    document.body.style.cursor = "crosshair";
  }
  shape = event.target.value.toLowerCase();
  console.log("TCL: selected, shape", selected, shape);
}

window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);

//maintaining each shape configuration
const shapeBox = {
  drawing: false,
  circle: {
    x: 0,
    y: 0,
    radius: 0,
    color: "#010101",
    shape: "circle",
    dragging: false
  },
  square: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: "#010101",
    shape: "square",
    dragging: false
  },
  line: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    shape: "line",
    dragging: false,
    color: "#010101"
  }
};

//maintaining mouse start and end position
const mouseStart = {
  x: null,
  y: null
};

const mouseEnd = {
  x: null,
  y: null
};

const shapes = [];

let startX
let startY

function handleMouseDown(e) {
  mouseStart.x = parseInt(e.clientX - offsetX);
  mouseStart.y = parseInt(e.clientY - offsetY);

  startX = mouseStart.x
  startY = mouseStart.y

  //handling dynamic drawing logic
  if (
    selected &&
    mouseStart.x >= 0 &&
    mouseStart.x <= canvas.width &&
    mouseStart.y >= 0 &&
    mouseStart.y <= canvas.height
  ) {
    switch (shape) {
      case "circle": {
        shapeBox.drawing = true;
        shapeBox.circle.x = mouseStart.x;
        shapeBox.circle.y = mouseStart.y;
        break;
      }

      case "square": {
        shapeBox.drawing = true;
        shapeBox.square.x = mouseStart.x;
        shapeBox.square.y = mouseStart.y;
        break;
      }

      case "line": {
        shapeBox.drawing = true;
        shapeBox.line.x1 = mouseStart.x;
        shapeBox.line.y1 = mouseStart.y;
        break;
      }
    }
  } else {
    //Identify whether mouse position is inside shape and handling drag an drop 
    shapes.forEach(s => {
      if (
        s.shape === "circle" &&
        mouseStart.x > s.x - s.radius &&
        mouseStart.x < s.x + s.radius &&
        mouseStart.y > s.y - s.radius &&
        mouseStart.y < s.y + s.radius
      ) {
        s.dragging = true;
      } else if (
        s.shape === "square" &&
        mouseStart.x >= s.x &&
        mouseStart.x <= s.x + s.width &&
        mouseStart.y >= s.y &&
        mouseStart.y <= s.y + s.height
      ) {
        s.dragging = true;
      } else if (s.shape === "line" && mouseStart.x >= s.x1 &&  mouseStart.x <= s.x2 && mouseStart.y >= s.y1 -5  &&  mouseStart.y <= s.y2 + 5) {
        s.dragging = true;
        console.log('found line')
      }

    });
  }
}

function handleMouseMove(e) {
  mouseEnd.x = parseInt(e.clientX - offsetX);
  mouseEnd.y = parseInt(e.clientY - offsetY);

  //handling dynamic drawing logic
  if (selected && shapeBox.drawing) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawObject();

    switch (shape) {
      case "circle": {
        shapeBox.circle.radius = Math.abs(mouseStart.x - mouseEnd.x);
        drawCircle(
          shapeBox.circle.x,
          shapeBox.circle.y,
          shapeBox.circle.radius,
          shapeBox.circle.color
        );
        break;
      }

      case "square": {
        const width = Math.abs(mouseStart.x - mouseEnd.x);
        shapeBox.square.width = width;
        shapeBox.square.height = width;
        drawRect(
          shapeBox.square.x,
          shapeBox.square.y,
          shapeBox.square.width,
          shapeBox.square.height,
          shapeBox.square.color
        );
        break;
      }

      case "line": {
        shapeBox.line.x2 = mouseEnd.x;
        shapeBox.line.y2 = mouseEnd.y;
        context.beginPath();
        context.moveTo(shapeBox.line.x1, shapeBox.line.y1);
        context.lineTo(shapeBox.line.x2, shapeBox.line.y2);
        context.strokeStyle = shapeBox.line.color;
        context.stroke();
        break;
      }
    }
  }

  //handling drag n drop
  shapes.forEach(s => {
    if (s.dragging && s.shape === "circle") {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      s.x = mouseEnd.x;
      s.y = mouseEnd.y;
      drawObject();
    } else if (s.dragging && s.shape === "square") {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      s.x = mouseEnd.x;
      s.y = mouseEnd.y;
      drawObject();
    }
    else if (s.dragging && s.shape === "line") {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let dx = mouseEnd.x - startX;
      // console.log("TCL: handleMouseMove -> dx", dx)
      let dy = mouseEnd.y - startY;
      s.x1 = s.x1 + dx
      s.x2 = s.x2 + dx
      s.y1 = s.y1 + dy
      s.y2 = s.y2 + dy

      startX = mouseEnd.x
      startY = mouseEnd.y
      drawObject();
    }
  });
}

function handleMouseUp(e) {
  if (selected && shapeBox.drawing) {
    switch (shape) {
      case "circle": {
        const newShape = { ...shapeBox.circle };
        shapes.push(newShape);
        break;
      }

      case "square": {
        const newShape = { ...shapeBox.square };
        shapes.push(newShape);
        break;
      }

      case "line": {
        const newShape = { ...shapeBox.line };
        shapes.push(newShape);
        break;
      }
    }
    shapeBox.drawing = false;
  }

  shapes.forEach(s => {
    s.dragging = false;
  });
}

function drawLine(x1, y1, x2, y2, color) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = color;
  context.stroke();
}

function drawRect(x, y, width, height, color) {
  context.beginPath();
  context.rect(x, y, width, height);
  context.closePath();
  context.strokeStyle = color;
  context.stroke();
}

function drawCircle(x, y, radius, color) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.strokeStyle = color;
  context.stroke();
}

function drawObject() {
  shapes.forEach(s => {
    if (s.shape === "circle") {
      drawCircle(s.x, s.y, s.radius, s.color);
    } else if (s.shape === "square") {
      drawRect(s.x, s.y, s.width, s.height, s.color);
    } else if (s.shape === "line") {
      drawLine(s.x1, s.y1, s.x2, s.y2, s.color);
    }
  });
}
