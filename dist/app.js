"use strict";
(() => {
  // src/v2/CellEngine/Color.ts
  var Color = class {
    constructor(color) {
      this.color = color;
      this.toString = () => this.color.toString();
      this.getShade = (magnitude) => {
        if (this.toString().length < 6) {
          console.warn("Cannot use Color.getShade() with this color format.");
          return this.color;
        }
        const cleanColorString = this.toString().replace(`#`, ``);
        if (cleanColorString.length === 6) {
          const decimalColor = parseInt(cleanColorString, 16);
          let r = (decimalColor >> 16) + magnitude;
          r > 255 && (r = 255);
          r < 0 && (r = 0);
          let g = (decimalColor & 255) + magnitude;
          g > 255 && (g = 255);
          g < 0 && (g = 0);
          let b = (decimalColor >> 8 & 255) + magnitude;
          b > 255 && (b = 255);
          b < 0 && (b = 0);
          return `#${(g | b << 8 | r << 16).toString(16)}`;
        }
        return cleanColorString;
      };
    }
  };

  // src/v2/CellEngine/Point.ts
  var Point3D = class {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.drawPriority = () => Math.floor(this.x + this.y + this.z);
      this.toString = () => `[${Math.floor(this.x)}, ${Math.floor(this.y)}, ${Math.floor(this.z)}]`;
    }
  };
  var Point = class _Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.toString = () => `[${this.x}, ${this.y}]`;
      // Standard isometric (2:1 ratio) projection
      // Basically any 'isometric' implementation can be put here 
      // IF toCartesion is opposite
      this.toIsometric = () => {
        return _Point.convertToIsometric(this.x, this.y);
      };
      // 2D screenspace
      this.toCartesian = () => {
        return _Point.convertToCartesian(this.x, this.y);
      };
    }
    static {
      this.convertToIsometric = (x, y) => {
        return new _Point(
          (2 * y + x) / 2,
          (2 * y - x) / 2
        );
      };
    }
    static {
      this.convertToCartesian = (x, y) => {
        return new _Point(
          x - y,
          (x + y) / 2
        );
      };
    }
  };
  var Point_default = Point;

  // src/v2/CellEngine/Math.ts
  var CellMath = class {
    static {
      this.toNearestBase = 5;
    }
    static {
      this.setNearestRounding = (newNearestBase) => this.toNearestBase = newNearestBase;
    }
    static {
      this.roundToNearest = (number, nearest = this.toNearestBase) => {
        return Math.floor(number / nearest) * nearest;
      };
    }
  };

  // src/v2/CellEngine/Shape/BoundingBox.ts
  var BoundingBox = class {
    constructor(position, dimension) {
      this.position = position;
      this.dimension = dimension;
      this.minX = Math.floor(this.position.x), this.maxX = Math.floor(this.position.x + this.dimension.width), this.minY = Math.floor(this.position.y), this.maxY = Math.floor(this.position.y + this.dimension.height), this.minZ = Math.floor(this.position.z), this.maxZ = Math.floor(this.position.z + this.dimension.depth);
    }
  };
  var BoundingBox_default = BoundingBox;

  // src/v2/CellEngine/CellEngine.ts
  var MAX_FPS = 60;
  var CellEngine = class _CellEngine {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.config = config;
      this.gameState = "Running" /* RUNNING */;
      this.drawMode = "default" /* DEFAULT */;
      this.elapsedFrameTime = 0;
      this._stateCallables = /* @__PURE__ */ new Map();
      this._fps = MAX_FPS;
      this._allowTick = false;
      /**
       * faster ordering => drawlist:
       * drawOrderIndex (x + y + z) => assetIndex (drawOrderIndex + assetName)
       * 
       * 
       * assetList
       * assetIndex => asset (shape)
       */
      // Simple array of drawable assets ordered by drawOrderIndex (positive int)
      this.drawableAssets = {
        ["default" /* DEFAULT */]: [],
        ["isometric" /* ISOMETRIC */]: []
      };
      this.indexedAssets = {
        ["default" /* DEFAULT */]: /* @__PURE__ */ new Map(),
        ["isometric" /* ISOMETRIC */]: /* @__PURE__ */ new Map()
      };
      this.getContext = () => _CellEngine.context2d;
      this.getState = () => this.gameState;
      this.setState = (state) => this.gameState = state;
      /* GAME LOOP */
      this.loop = async () => {
        const timeToRun = await this.measureGameTime(() => {
          switch (this.getState()) {
            case "Running" /* RUNNING */:
              this.update();
              this.onRunning();
              break;
            case "Paused" /* PAUSED */:
              this.onPaused();
              break;
            case "Singe tick" /* SINGLE_TICK */:
              this.onTick();
              break;
          }
          this.draw();
          setTimeout(() => {
            requestAnimationFrame(this.loop);
          }, 1e3 / this.fps);
        });
        this.elapsedFrameTime = timeToRun;
      };
      this.pause = (toggle = false) => {
        if (toggle) {
          this.setState(
            this.getState() == "Running" /* RUNNING */ ? "Paused" /* PAUSED */ : "Running" /* RUNNING */
          );
        } else {
          this.setState("Paused" /* PAUSED */);
        }
      };
      this.update = () => {
        this.drawableAssets["isometric" /* ISOMETRIC */] = this.drawableAssets["isometric" /* ISOMETRIC */].sort(this.sortShapesByDrawpriority);
        this.drawableAssets["default" /* DEFAULT */] = this.drawableAssets["default" /* DEFAULT */].sort(this.sortShapesByDrawpriority);
        for (const shape of this.drawableAssets["default" /* DEFAULT */]) {
          if (shape.updatable && shape.visible) {
            shape.update();
          }
        }
        for (const shape of this.drawableAssets["isometric" /* ISOMETRIC */]) {
          if (shape.updatable && shape.visible) {
            shape.update();
          }
        }
      };
      this.runOnState = (state, func) => this._stateCallables.has(state) ? this._stateCallables.get(state)?.push(func) : this._stateCallables.set(state, [func]);
      this.onRunning = () => {
        this._stateCallables.get("Running" /* RUNNING */)?.forEach(
          (callableFunction) => callableFunction.call(this)
        );
      };
      this.onPaused = () => {
        this._stateCallables.get("Paused" /* PAUSED */)?.forEach(
          (callableFunction) => callableFunction.call(this)
        );
      };
      this.onTick = () => {
        if (this.allowTick) {
          this._stateCallables.get("Singe tick" /* SINGLE_TICK */)?.forEach((callableFunction) => callableFunction.call(this));
          this.allowTick = false;
        }
      };
      this.on = (eventName, callable, bindElement) => {
        const eventElement = bindElement ?? this.canvas;
        if (!eventElement || !eventElement?.addEventListener) {
          console.warn("Cant add event-listener on: ", eventElement);
          return;
        }
        eventElement.addEventListener(eventName, (event) => callable.call(this, event), false);
      };
      this.off = (eventName, eventCallback = () => {
      }, bindElement) => {
        const eventElement = bindElement ?? this.canvas;
        if (!eventElement || !eventElement?.addEventListener) {
          console.warn("Cant add event-listener on: ", eventElement);
          return;
        }
        eventElement.removeEventListener(eventName, eventCallback);
      };
      /* THE ACTUAL DRAWING OF GAME WORLD */
      this.draw = () => {
        this.clearCanvas();
        this.getContext().save();
        this.drawShapes(this.drawableAssets["default" /* DEFAULT */]);
        this.getContext().restore();
        this.getContext().save();
        this.getContext().translate(this.canvas.width / 2, 200);
        this.drawShapes(this.drawableAssets["isometric" /* ISOMETRIC */]);
        this.getContext().restore();
      };
      this.drawShapes = (shapeMap) => {
        for (const shape of shapeMap) {
          if (shape.visible) {
            shape.draw();
          }
        }
      };
      /* DRAW CODE  */
      // Support Shape's that are collections of other shapes (level of cubes, grid of tiles, ...)
      this.addShape = (shape, mode = "default" /* DEFAULT */) => {
        if (shape.isCollection()) {
          shape.getShapeCollection().forEach((shape2) => this.addShape(shape2, mode));
          return;
        }
        shape.bind(this);
        this.drawableAssets[mode].push(shape);
        this.indexedAssets[mode].set(
          shape.toString(),
          shape
        );
      };
      // 2d only?
      this.getPlainOfShapes = () => {
      };
      // 3d (x,y,z,)
      this.getAreaOfShapes = (shape, areaPointOffset = 2, maxResults = 5) => {
        const results = [];
        const area = new BoundingBox_default(
          shape.position,
          { width: areaPointOffset, height: areaPointOffset, depth: areaPointOffset }
        );
        areaLoop:
          for (let x = area.minX; x <= area.maxX; x++) {
            for (let y = area.minY; y <= area.maxY; y++) {
              for (let z = area.minZ; z <= area.maxZ; z++) {
                const otherShape = this.indexedAssets["isometric" /* ISOMETRIC */].get(new Point3D(x, y, z).toString());
                if (otherShape) {
                  otherShape.highlightColor = new Color("#00FF00");
                  results.push(otherShape);
                }
                if (results.length >= maxResults) {
                  break areaLoop;
                }
              }
            }
          }
        return results;
      };
      this.sortShapesByDrawpriority = (inputA, inputB) => {
        if (inputA.getDrawPriority() == inputB.getDrawPriority()) {
          return -1;
        }
        return inputA.getDrawPriority() > inputB.getDrawPriority() ? 1 : -1;
      };
      this.getWindowoffset = () => {
        return {
          offsetX: this.canvas.width / 2,
          offsetY: 0
          //this.canvas.height / 2
        };
      };
      /* FRAME TIME */
      this._getPerformanceTime = (diff = 0) => performance.timeOrigin + performance.now() - (diff > 0 ? diff : 0);
      this.getCurrentFrameTime = () => this._getPerformanceTime();
      this.getLastFrameTime = () => this.elapsedFrameTime;
      this.measureGameTime = async (callable) => {
        const startFrameTime = this._getPerformanceTime();
        await callable.call(this);
        return this._getPerformanceTime(startFrameTime);
      };
      /** GAME STATE MANAGEMENT */
      this.isRunning = () => this.getState() == "Running" /* RUNNING */;
      this.isPaused = () => this.getState() == "Paused" /* PAUSED */;
      /* CANVAS */
      this.clearCanvas = () => _CellEngine.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.getCanvas = () => this.canvas;
      this.getCanvasSize = () => ({ width: this.canvas.width, height: this.canvas.height });
      this.setCanvasBackground = (color) => {
        _CellEngine.context2d.fillStyle = color.toString();
        _CellEngine.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
      };
      this.setCanvasSize = (width, height) => {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.width = width;
        this.canvas.height = height;
        return this;
      };
      // other
      this.getPointFromMouseEvent = (mouseEvent) => {
        const canvas = this.getCanvas();
        const { top, left } = canvas.getBoundingClientRect();
        return new Point_default(
          mouseEvent.clientX - left,
          mouseEvent.clientY - top
        );
      };
      _CellEngine.context2d = canvas.getContext("2d");
      this.drawMode = config?.drawMode ?? this.drawMode;
      this.fps = config?.fpsLimit ?? 60;
      this.loop();
    }
    get fps() {
      return this._fps;
    }
    set fps(value) {
      if (value > MAX_FPS) {
        console.info("Maximum FPS is: " + MAX_FPS);
        this._fps = MAX_FPS;
      } else {
        this._fps = value;
      }
    }
    get allowTick() {
      return this._allowTick;
    }
    set allowTick(value) {
      this._allowTick = value;
    }
    // Easing
    static easeInOutSine(x) {
      return -(Math.cos(Math.PI * x) - 1) / 2;
    }
    static {
      this.intersect = (boundingBoxA, boundingBoxB) => {
        return boundingBoxA.minX <= boundingBoxB.maxX && boundingBoxA.maxX >= boundingBoxB.minX && (boundingBoxA.minY <= boundingBoxB.maxY && boundingBoxA.maxY >= boundingBoxB.minY) && (boundingBoxA.minZ <= boundingBoxB.maxZ && boundingBoxA.maxZ >= boundingBoxB.minZ);
      };
    }
  };

  // src/v2/CellEngine/Shape/Shape.ts
  var Shape = class {
    constructor(className) {
      this.engineInstance = null;
      this.shapeCollection = [];
      this.neighbours = [];
      this.position = new Point3D(0, 0, 0);
      this.dimension = { width: 0, height: 0, depth: 0 };
      this.boundingBox = new BoundingBox_default(this.position, this.dimension);
      this.canCollide = false;
      this.visible = true;
      this.drawable = true;
      this.updatable = false;
      this.drawPriorityOffset = 0;
      this.highlightColor = null;
      this.setNeighbours = (neighbours) => {
        this.neighbours = neighbours;
      };
      this.addNeighbours = (neighbour) => {
        this.neighbours.push(neighbour);
      };
      this.getCurrentNeighbours = () => {
        return this.neighbours;
      };
      // TODO its not area in pixels but Point3d's / positions
      this.findNeighbours = (positionOffset = 1, maxResults = 10) => {
        return this.engineInstance?.getAreaOfShapes(this, positionOffset, maxResults);
      };
      this.toString = () => this.position.toString();
      // + "_" + this.className
      this.updateDimension = (newDimension) => {
        this.dimension = newDimension;
        this.boundingBox = new BoundingBox_default(this.position, newDimension);
        this.updatable = true;
        return this;
      };
      this.updatePosition = (newPosition) => {
        const { x, y, z } = newPosition;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.boundingBox = new BoundingBox_default(newPosition, this.dimension);
        this.updatable = true;
        return this;
      };
      this.isCollidingWith = (otherShape) => {
        return CellEngine.intersect(this.boundingBox, otherShape.boundingBox);
      };
      this.isPointCollidingWith = (point, otherShape) => {
        return CellEngine.intersect(new BoundingBox_default(point, this.dimension), otherShape.boundingBox);
      };
      this.getPosition = () => this.position;
      this.getDrawPriority = () => this.position.drawPriority() + this.drawPriorityOffset;
      this.getShapeCollection = () => this.shapeCollection;
      this.isCollection = () => false;
      this.getAssetIndex = () => this.position.drawPriority() + "_" + this.className;
      this.draw = () => {
      };
      this.update = () => {
      };
      this.needDraw = () => this.drawable;
      this.needUpdate = () => this.updatable;
      this.show = () => {
        this.visible = true;
        return this;
      };
      this.hide = () => {
        this.visible = false;
        return this;
      };
      this.bind = (engineInstance) => {
        this.engineInstance = engineInstance;
      };
      this.className = className ?? this.constructor.name;
    }
  };
  var Shape_default = Shape;

  // src/v2/CellEngine/Player.ts
  var Player = class extends Shape_default {
    constructor(asset, player = 1) {
      super("Player_" + player);
      this.asset = asset;
      this.moveSpeed = 1;
      this.nextPosition = new Point3D(0, 0, 0);
      this.update = () => {
        this.findNeighbours()?.forEach((neighbourShape) => {
          if (this.isPointCollidingWith(this.nextPosition, neighbourShape)) {
            console.log("YES");
          }
        });
        this.updatePosition(this.nextPosition);
        this.asset.updatePosition(this.nextPosition);
        this.updatable = false;
      };
      this.draw = () => this.asset.draw();
      this.onKeyDownHandler = (key) => {
        switch (key) {
          case "ArrowUp":
            this.nextPosition = { ...this.position, y: this.position.y - this.moveSpeed };
            break;
          case "ArrowDown":
            this.nextPosition = { ...this.position, y: this.position.y + this.moveSpeed };
            break;
          case "ArrowLeft":
            this.nextPosition = { ...this.position, x: this.position.x - this.moveSpeed };
            break;
          case "ArrowRight":
            this.nextPosition = { ...this.position, x: this.position.x + this.moveSpeed };
            break;
          default:
            break;
        }
        this.updatable = true;
      };
      this.drawPriorityOffset = 3;
      this.position = asset.position;
      this.dimension = asset.dimension;
      this.asset = asset.show();
      this.canCollide = true;
      this.bindKeyListener();
    }
    bindKeyListener() {
      window.addEventListener("keydown", (event) => {
        if (!event.key || event.key.length < 1) {
          console.log("Cant process onkeydown listener?");
          return;
        }
        this.onKeyDownHandler(event.key);
      }, false);
    }
  };

  // src/v2/CellEngine/Shape/Cube.ts
  var Cube = class extends Shape_default {
    constructor(position, size, color = new Color("#F00")) {
      super();
      this.size = size;
      this.color = color;
      this.draw = (context) => {
        const topColor = this.color.toString();
        const leftColor = this.color.getShade(20);
        const rightColor = this.color.getShade(-20);
        const strokeColor = this.highlightColor ? this.highlightColor.toString() : new Color("#AAAAAA").toString();
        const ctx = context ?? CellEngine.context2d;
        const sizeX = this.dimension.width;
        const sizeY = this.dimension.height;
        ctx.save();
        ctx.translate(
          (this.position.x - this.position.y) * sizeX / 2,
          (this.position.x + this.position.y) * sizeY / 2
        );
        let zOffset = this.position.z * sizeY;
        ctx.beginPath();
        ctx.moveTo(0, -zOffset);
        ctx.lineTo(sizeX / 2, sizeY / 2 - zOffset);
        ctx.lineTo(0, sizeY - zOffset);
        ctx.lineTo(-sizeX / 2, sizeY / 2 - zOffset);
        ctx.closePath();
        ctx.fillStyle = topColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-sizeX / 2, sizeY / 2 - zOffset);
        ctx.lineTo(0, sizeY - zOffset);
        ctx.lineTo(0, sizeY);
        ctx.lineTo(-sizeX / 2, sizeY / 2);
        ctx.closePath();
        ctx.fillStyle = leftColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sizeX / 2, sizeY / 2 - zOffset);
        ctx.lineTo(0, sizeY - zOffset);
        ctx.lineTo(0, sizeY);
        ctx.lineTo(sizeX / 2, sizeY / 2);
        ctx.closePath();
        ctx.fillStyle = rightColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        this.highlightColor = null;
      };
      this.position = position;
      this.dimension.width = size * 2;
      this.dimension.height = size;
    }
  };
  var Cube_default = Cube;

  // src/v2/Game/Map/level_1.ts
  var level_1 = [
    ["4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4"],
    ["4", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "4"],
    ["4", "3", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "3", "4"],
    ["4", "3", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "3", "3", "4"]
    // ["4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4",],
  ];
  var level_1_default = level_1;

  // src/v2/Game/Level.ts
  var Level = class extends Shape_default {
    constructor(level, tileSize) {
      super("Level");
      this.level = level;
      this.tileSize = tileSize;
      this.isCollection = () => true;
      this.getShapeCollection = () => this.shapeCollection;
      this.getAssetColor = (input) => {
        switch (input) {
          case "1":
            return new Color("#222222");
          case "2":
            return new Color("#444444");
          case "3":
            return new Color("#666666");
          case "4":
            return new Color("#888888");
          default:
            return new Color("#FFFFFF");
        }
      };
      if (this.level == 1) {
        level_1_default.forEach((row, index_y) => {
          row.forEach((assetIdentifier, index_x) => {
            const LevelCube = new Cube_default(
              new Point3D(index_x, index_y, Number(assetIdentifier)),
              this.tileSize,
              this.getAssetColor(assetIdentifier)
            );
            LevelCube.className = "Level_" + LevelCube.className;
            this.shapeCollection.push(LevelCube);
          });
        });
      }
    }
  };
  var Level_default = Level;

  // src/v2/game.ts
  var SomeGame = class extends CellEngine {
    constructor(canvasElement, instanceConfig = {
      tileSize: 20,
      fpsLimit: 60
    }) {
      super(canvasElement, { fpsLimit: 5 });
      this.instanceConfig = instanceConfig;
      this.theme = {
        grid: {
          strokeStyle: new Color("#888")
        },
        cell: {
          alive: new Color("#FFF"),
          example: new Color("#AAA")
        },
        background: new Color("#222")
      };
      // we want 'true 2:1' ratio for our isometric shiz 
      this.tileSize = 50;
      // private tileWidth = this.tileSize * 2
      // private tileHeight = this.tileSize
      this.mouseTileSize = this.tileSize / 2;
      // private worldOffsetX: number = 0
      // private worldOffsetY: number = 0
      this.mouseTile = new Cube_default(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide();
      this.player = null;
      this.level = new Level_default(0, 0);
      this.loadGame = () => {
        this.mouseTile = new Cube_default(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide();
        this.player = new Player(
          new Cube_default(
            new Point3D(10, 10, 2),
            this.tileSize,
            new Color("#FF0000")
          )
        );
        this.level = this.loadLevel(1);
        this.loadAssets();
        this.bindGeneralListeners();
        this.onResize(() => {
          this.setCanvasSize(
            window.innerWidth,
            window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
          );
        });
      };
      // Can be used later to dynamically parts of the world?
      this.loadLevel = (level) => {
        return new Level_default(1, this.tileSize);
      };
      this.bindGeneralListeners = () => {
        this.on("mousemove", (event) => {
          const x = Math.floor(event.clientY / this.mouseTileSize + event.clientX / (this.mouseTileSize * 2));
          const y = Math.floor(-event.clientX / (this.mouseTileSize * 2) + event.clientY / this.mouseTileSize);
          this.mouseTile.updatePosition(new Point3D(x, y, 0));
          this.mouseTile.show();
        });
        this.on("mouseleave", (event) => {
          this.mouseTile.hide();
        });
      };
      this.loadAssets = () => {
        this.addShape(this.player, "isometric" /* ISOMETRIC */);
        this.addShape(this.level, "isometric" /* ISOMETRIC */);
        this.addShape(this.mouseTile);
      };
      this.onResize = (onResizeCallback) => {
        this.on("resize", onResizeCallback, window);
      };
      this.setCanvasSize(
        window.innerWidth,
        window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
      );
      this.loadGame();
      return this;
    }
  };
  var game_default = SomeGame;

  // src/app.ts
  var Game;
  var CanvasElement;
  document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas");
    Game = new game_default(CanvasElement, { fpsLimit: 20, tileSize: 20 });
  });
})();
