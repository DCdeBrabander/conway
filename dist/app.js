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
      this.elevation = 1;
      this.drawPriority = () => Math.floor(this.x + this.y + (this.z - this.elevation));
      this.toString = () => `${Math.floor(this.x)}_${Math.floor(this.y)}_${Math.floor(this.z)}`;
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

  // src/v2/CellEngine/Renderer.ts
  var Renderer = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.defaultDrawMode = "default" /* DEFAULT */;
      // Simple array of drawable assets ordered by drawOrderIndex (positive int)
      this.drawableAssets = {
        ["default" /* DEFAULT */]: [],
        ["isometric" /* ISOMETRIC */]: []
      };
      this.indexedAssets = {
        ["default" /* DEFAULT */]: /* @__PURE__ */ new Map(),
        ["isometric" /* ISOMETRIC */]: /* @__PURE__ */ new Map()
      };
      /* THE ACTUAL DRAWING OF GAME WORLD */
      this.draw = () => {
        this.clearCanvas();
        this.context.save();
        this.drawShapes(this.drawableAssets["default" /* DEFAULT */]);
        this.context.restore();
        this.context.save();
        this.context.translate(this.canvas.width / 2, 200);
        this.drawShapes(this.drawableAssets["isometric" /* ISOMETRIC */]);
        this.context.restore();
      };
      this.drawShapes = (shapeMap) => {
        for (const shape of shapeMap) {
          if (shape.visible) {
            shape.draw();
            shape.highlightColor = null;
          }
        }
      };
      /* DRAW CODE  */
      // Support Shape's that are collections of other shapes (level of cubes, grid of tiles, ...)
      this.addDrawable = (shape, mode = "default" /* DEFAULT */) => {
        if (shape.isCollection()) {
          shape.getShapeCollection().forEach((shape2) => this.addDrawable(shape2, mode));
          return;
        }
        this.drawableAssets[mode].push(shape);
        if (!this.indexedAssets[mode].get(shape.getFullPositionString())) {
          this.indexedAssets[mode].set(
            shape.getFullPositionString(),
            shape
          );
        }
      };
      this.findIndexedAsset = (key, drawMode) => {
        return this.indexedAssets[drawMode].get(key) ?? null;
      };
      this.getIndexedAssets = (drawMode) => this.indexedAssets[drawMode];
      this.getDrawables = (mode) => this.drawableAssets[mode] ?? [];
      this.sortShapesByDrawpriority = (inputA, inputB) => {
        if (inputA.getDrawPriority() == inputB.getDrawPriority()) {
          return -1;
        }
        return inputA.getDrawPriority() > inputB.getDrawPriority() ? 1 : -1;
      };
      // 3d (x,y,z,)
      // Default max results = 8 because of 8 'tiles' around center tile
      this.getAreaOfShapes = (shape, areaPointOffset = 2, maxResults = 30) => {
        const results = [];
        const area = {
          minX: shape.position.x - 1,
          maxX: shape.position.x + 2,
          minY: shape.position.y - 1,
          maxY: shape.position.y + 2,
          minZ: shape.position.z,
          maxZ: shape.position.z
          // maxZ: shape.position.z
        };
        areaLoop:
          for (let x = area.minX; x <= area.maxX; x++) {
            for (let y = area.minY; y <= area.maxY; y++) {
              for (let z = area.minZ; z <= area.maxZ; z++) {
                const otherShape = this.findIndexedAsset(
                  new Point3D(x, y, shape.position.z).toString(),
                  "isometric" /* ISOMETRIC */
                );
                if (otherShape && shape.className !== otherShape?.className) {
                  otherShape.highlightColor = new Color("#00FF00");
                  results.push(otherShape);
                }
                if (results.length >= 20) {
                  break areaLoop;
                }
              }
            }
          }
        return results;
      };
      /* CANVAS */
      this.clearCanvas = () => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.getCanvas = () => this.canvas;
      this.setCanvas = (canvas) => this.canvas = canvas;
      this.getCanvasSize = () => ({ width: this.canvas.width, height: this.canvas.height });
      this.setCanvasSize = (width, height) => {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.width = width;
        this.canvas.height = height;
        return this;
      };
      this.setCanvasBackground = (color) => {
        this.context.fillStyle = color.toString();
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      };
      this.getContext = () => this.context;
      this.canvas = canvas;
      this.context = this.canvas.getContext("2d");
    }
  };
  var Renderer_default = Renderer;

  // src/v2/CellEngine/CellEngine.ts
  var CellEngine = class {
    constructor(canvas, config) {
      this.config = config;
      this._stateCallables = /* @__PURE__ */ new Map();
      this.gameState = "Running" /* RUNNING */;
      this.elapsedFrameTime = 0;
      this._allowTick = false;
      this.activePlayers = [];
      /* GAME LOOP */
      this.loop = async () => {
        const timeToRun = await this.measureGameTime(() => {
          switch (this.getState()) {
            case "Running" /* RUNNING */:
              this.update();
              this.renderer.draw();
              this.onRunning();
              break;
            case "Paused" /* PAUSED */:
              this.onPaused();
              break;
            case "Singe tick" /* SINGLE_TICK */:
              this.onTick();
              break;
          }
          setTimeout(() => {
            requestAnimationFrame(this.loop);
          }, 1e3 / this.config?.fpsLimit);
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
        const sortedDefaultAssets = this.renderer.getDrawables("default" /* DEFAULT */).sort(this.renderer.sortShapesByDrawpriority);
        const sortedIsometricAssets = this.renderer.getDrawables("isometric" /* ISOMETRIC */).sort(this.renderer.sortShapesByDrawpriority);
        for (const player of this.activePlayers) {
          player.update();
        }
        for (const shape of sortedDefaultAssets) {
          if (shape.updatable) {
            shape.update();
          }
        }
        for (const shape of sortedIsometricAssets) {
          if (shape.updatable) {
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
      this.setConfig = (config) => this.config = config;
      this.getRenderer = () => this.renderer;
      this.getState = () => this.gameState;
      this.setState = (state) => this.gameState = state;
      this.on = (eventName, callable, bindElement) => {
        const eventElement = bindElement ?? this.renderer.getCanvas();
        if (!eventElement || !eventElement?.addEventListener) {
          console.warn("Cant add event-listener on: ", eventElement);
          return;
        }
        eventElement.addEventListener(eventName, (event) => callable.call(this, event), false);
      };
      this.off = (eventName, eventCallback = () => {
      }, bindElement) => {
        const eventElement = bindElement ?? this.renderer.getCanvas();
        if (!eventElement || !eventElement?.addEventListener) {
          console.warn("Cant add event-listener on: ", eventElement);
          return;
        }
        eventElement.removeEventListener(eventName, eventCallback);
      };
      this.addShape = (shape, drawMode) => {
        if (shape.isCollection()) {
          shape.getShapeCollection().forEach((shape2) => this.addShape(shape2, drawMode));
          return;
        }
        shape.bind(this);
        this.renderer.addDrawable(shape, drawMode);
      };
      this.addPlayer = (player, drawMode) => {
        this.activePlayers.push(player);
        this.addShape(player.asset, drawMode);
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
      // other
      this.getPointFromMouseEvent = (mouseEvent) => {
        const canvas = this.renderer.getCanvas();
        const { top, left } = canvas.getBoundingClientRect();
        return new Point_default(
          mouseEvent.clientX - left,
          mouseEvent.clientY - top
        );
      };
      this.renderer = new Renderer_default(canvas);
      this.renderer.defaultDrawMode = config?.drawMode ?? "default" /* DEFAULT */;
      this.loop();
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
        return boundingBoxA.minX <= boundingBoxB.maxX && boundingBoxA.maxX >= boundingBoxB.minX && boundingBoxA.minY <= boundingBoxB.maxY && boundingBoxA.maxY >= boundingBoxB.minY && boundingBoxA.minZ <= boundingBoxB.maxZ && boundingBoxA.maxZ >= boundingBoxB.minZ;
      };
    }
  };

  // src/v2/CellEngine/Player.ts
  var Player = class {
    constructor(asset, player = 1) {
      this.asset = asset;
      this.className = "Player_0";
      this.moveSpeed = 0.5;
      this.newPosition = new Point3D(0, 0, 0);
      this.currentDirection = null;
      this.updatable = false;
      this.bind = (instance) => {
        this.asset.engine = instance;
      };
      this.canMove = () => {
        console.log(
          this.asset.getFullPositionString()
          // this.asset.getRenderer()?.getIndexedAssets(DrawMode.ISOMETRIC).get(this.asset.getFullPositionString())
        );
        return true;
      };
      this.update = () => {
        let isColliding = false;
        if (this.updatable && this.currentDirection && !this.canMove()) {
          isColliding = true;
        }
        if (!isColliding) {
          this.updatePosition(this.newPosition);
        }
        this.updatable = false;
      };
      // updateNeighbours = () => this.asset.setNeighbours( this.asset.findNeighbours() ?? [] )
      this.updatePosition = (position) => this.asset.updatePosition(position);
      this.draw = () => this.asset.draw();
      this.onKeyDownHandler = (key) => {
        switch (key) {
          case "ArrowUp":
            this.currentDirection = "UP" /* UP */;
            this.newPosition = { ...this.asset.position, y: this.asset.position.y - this.moveSpeed };
            break;
          case "ArrowDown":
            this.currentDirection = "DOWN" /* DOWN */;
            this.newPosition = { ...this.asset.position, y: this.asset.position.y + this.moveSpeed };
            break;
          case "ArrowLeft":
            this.currentDirection = "LEFT" /* LEFT */;
            this.newPosition = { ...this.asset.position, x: this.asset.position.x - this.moveSpeed };
            break;
          case "ArrowRight":
            this.currentDirection = "RIGHT" /* RIGHT */;
            this.newPosition = { ...this.asset.position, x: this.asset.position.x + this.moveSpeed };
            break;
          default:
            this.currentDirection = null;
            return;
        }
        this.updatable = true;
      };
      this.className = "Player_" + player;
      this.asset = asset.show();
      this.asset.elevation = 2;
      this.asset.updateDimension(this.asset.dimension);
      this.asset.updatePosition(this.asset.position);
      this.newPosition = this.asset.position;
      this.asset.drawPriorityOffset = 5;
      this.asset.canCollide = true;
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

  // src/v2/CellEngine/Shape/BoundingBox.ts
  var BoundingBox = class {
    constructor(position, dimension) {
      this.position = position;
      this.dimension = dimension;
      this.intersects = (otherBox) => {
        return false;
      };
      const widthOffset = this.dimension.width / (game_default.TILE_SIZE * 2);
      const heightOffset = this.dimension.height / game_default.TILE_SIZE;
      this.minX = Math.floor(this.position.x), this.maxX = Math.floor(this.position.x + widthOffset), this.minY = Math.floor(this.position.y), this.maxY = Math.floor(this.position.y + heightOffset), this.minZ = Math.floor(this.position.z), this.maxZ = Math.floor(this.position.z);
    }
  };
  var BoundingBox_default = BoundingBox;

  // src/v2/CellEngine/Shape/Shape.ts
  var Shape = class {
    constructor(className) {
      this.engine = null;
      this.shapeCollection = [];
      this.neighbours = [];
      this.elevation = 0;
      this.position = new Point3D(0, 0, 0);
      this.dimension = { width: 0, height: 0, depth: 0 };
      this.boundingBox = new BoundingBox_default(this.position, this.dimension);
      this.canCollide = false;
      this.visible = true;
      this.drawable = true;
      this.updatable = false;
      this.drawPriorityOffset = 0;
      this.highlightColor = null;
      this.getRenderer = () => this.engine?.getRenderer();
      this.toString = () => this.className;
      this.getFullPositionString = () => this.getNormalizedByElevationPoint() + "_" + this.elevation;
      // offset position x/y with elevation
      this.getNormalizedByElevationPoint = () => new Point3D(
        this.position.x + this.elevation / 2,
        this.position.y + this.elevation / 2,
        this.position.z
      );
      this.outline = (color) => this;
      this.setNeighbours = (neighbours) => this.neighbours = neighbours;
      this.addNeighbours = (neighbour) => this.neighbours.push(neighbour);
      this.getCurrentNeighbours = () => this.neighbours;
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
      this.isCollidingWithShape = (otherShape) => {
        return CellEngine.intersect(this.boundingBox, otherShape.boundingBox);
      };
      this.isCollidingWithShapeFromPoint = (point, otherShape) => {
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
      this.bind = (engine) => {
        this.engine = engine;
      };
      this.className = className ?? this.constructor.name;
    }
  };
  var Shape_default = Shape;

  // src/v2/CellEngine/Shape/Isometric/Cube.ts
  var Cube = class extends Shape_default {
    constructor(position, size, color = new Color("#0000FF")) {
      super();
      this.size = size;
      this.color = color;
      this.outline = (color) => {
        const ctx = this.engine?.getRenderer().getContext();
        const strokeColor = color?.toString() ?? this.highlightColor?.toString() ?? new Color("#AAAAAA").toString();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
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
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-sizeX / 2, sizeY / 2 - zOffset);
        ctx.lineTo(0, sizeY - zOffset);
        ctx.lineTo(0, sizeY);
        ctx.lineTo(-sizeX / 2, sizeY / 2);
        ctx.closePath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sizeX / 2, sizeY / 2 - zOffset);
        ctx.lineTo(0, sizeY - zOffset);
        ctx.lineTo(0, sizeY);
        ctx.lineTo(sizeX / 2, sizeY / 2);
        ctx.closePath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
        return this;
      };
      this.draw = () => {
        const ctx = this.engine?.getRenderer().getContext();
        const strokeColor = this.highlightColor ? this.highlightColor.toString() : new Color("#AAAAAA").toString();
        const topColor = (this.highlightColor ?? this.color).toString();
        const leftColor = (this.highlightColor ?? this.color).getShade(20);
        const rightColor = (this.highlightColor ?? this.color).getShade(-20);
        const sizeX = this.dimension.width * 2;
        const sizeY = this.dimension.height;
        ctx.save();
        ctx.translate(
          (this.position.x - this.position.y) * sizeX / 2,
          (this.position.x + this.position.y) * sizeY / 2
        );
        let zOffset = this.dimension.depth;
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
      };
      this.dimension.width = size ? size : game_default.TILE_SIZE;
      this.dimension.height = size ? size : game_default.TILE_SIZE;
      this.dimension.depth = this.dimension.height * position.z;
      this.updatePosition(position);
      this.updateDimension(this.dimension);
    }
  };
  var Cube_default = Cube;

  // src/v2/Game/Map/level_1.ts
  var level_1 = [
    ["2", "1", "2"],
    ["1", "1", "1"]
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
            LevelCube.elevation = 1;
            LevelCube.className = "Level_" + LevelCube.className;
            this.shapeCollection.push(LevelCube);
          });
        });
      }
    }
  };
  var Level_default = Level;

  // src/v2/game.ts
  var DEFAULT_CONFIG = {
    tileSize: 20,
    fpsLimit: 60
  };
  var SomeGame = class _SomeGame extends CellEngine {
    constructor(canvasElement, instanceConfig = DEFAULT_CONFIG) {
      super(canvasElement);
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
      this.mouseTileSize = _SomeGame.TILE_SIZE / 2;
      this.mouseTile = new Cube_default(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide();
      this.player = null;
      this.level = new Level_default(0, 0);
      this.loadGame = () => {
        this.level = this.loadLevel(1);
        this.loadAssets();
        this.bindGeneralListeners();
        this.onResize(() => {
          this.getRenderer().setCanvasSize(
            window.innerWidth,
            window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
          );
        });
      };
      // Can be used later to dynamically parts of the world?
      this.loadLevel = (level) => {
        return new Level_default(level, _SomeGame.TILE_SIZE);
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
        this.mouseTile = new Cube_default(
          new Point3D(0, 0, 2),
          this.mouseTileSize,
          new Color("#0000FF")
        ).hide();
        this.player = new Player(
          new Cube_default(
            new Point3D(0, 0, 1),
            _SomeGame.TILE_SIZE,
            new Color("#FF0000")
          ),
          1
        );
        this.addShape(this.level, "isometric" /* ISOMETRIC */);
        this.addShape(this.mouseTile);
        this.addPlayer(this.player, "isometric" /* ISOMETRIC */);
      };
      this.onResize = (onResizeCallback) => {
        this.on("resize", onResizeCallback, window);
      };
      this.setConfig({ fpsLimit: this.instanceConfig.fpsLimit ?? 1 });
      this.getRenderer().setCanvasSize(
        window.innerWidth,
        window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
      );
      _SomeGame.TILE_SIZE = this.instanceConfig.tileSize ?? 50;
      this.loadGame();
      return this;
    }
    static {
      this.TILE_SIZE = 50;
    }
  };
  var game_default = SomeGame;

  // src/app.ts
  var Game;
  var CanvasElement;
  document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas");
    Game = new game_default(CanvasElement, { fpsLimit: 2, tileSize: 50 });
  });
})();
