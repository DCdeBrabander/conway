"use strict";(()=>{var E=class{constructor(e,t,r){this.x=0;this.y=0;this.size=0;this.example=!1;this.alive=!0;this.aliveNeighbours=0;this.setAliveNeighbours=e=>this.aliveNeighbours=e;this.x=e,this.y=t,this.alive=r}},w=E;var K=[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],b=K;var q=[[0,1,0,1,0,0],[1,0,0,0,0,0],[0,1,0,0,1,0],[0,0,0,1,1,1]],L=q;var W=[[1,1,1]],T=W;var Z=[[1]],x=Z;var Y=[[1,1,0,0],[0,1,0,0],[0,1,0,1],[0,0,1,1]],N=Y;var j=[[0,1,0],[0,0,1],[1,1,1]],_=j;var V=[[1,0,0],[1,1,1],[1,0,1],[0,0,1]],y=V;var J=[[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0]],G=J;var h=(o=>(o.CELL="Cell",o.BLINKER="Blinker",o.GLIDER="Glider",o.PULSAR="Pulsar",o.EATER="Eater",o.SWITCH_ENGINE="SwitchEngine",o.GLIDER_GUN="GliderGun",o.HERSCHEL="Herschel",o))(h||{}),M=n=>{switch(n){case"Cell":return x;case"Blinker":return T;case"Glider":return _;case"Pulsar":return G;case"Eater":return N;case"SwitchEngine":return L;case"GliderGun":return b;case"Herschel":return y;default:return console.warn("unsupported pattern requested: "+n),[]}};var d=(r=>(r[r.PAUSED=0]="PAUSED",r[r.RUNNING=1]="RUNNING",r[r.SINGLE_TICK=2]="SINGLE_TICK",r))(d||{}),C=class{constructor(e,t=10,r=10){this.canvasElement=e;this._cellSize=t;this._fps=r;this.MAX_FPS=60;this.MAX_CELL_SIZE=100;this.realFrameTime=0;this._allowTick=!0;this.theme={grid:"#888",cell:{alive:"#FFF",example:"#AAA"},background:"#222"};this.grid=[];this.previewCells=[];this.currentState=0;this.currentPreviewPattern="Cell";this.heightOffset=0;this.init=()=>(this.setGameState(0),this.setCanvasSize(window.innerWidth,window.innerHeight),window.addEventListener("resize",this.onResize,!1),this.grid=this._getNewGrid(),this.gameLoop(),this);this.gameLoop=()=>{let e=performance.timeOrigin+performance.now();switch(this.currentState){case 1:this.run();break;case 0:this.paused();break;case 2:this.tick();break}this.realFrameTime=performance.timeOrigin+performance.now()-e,setTimeout(()=>{requestAnimationFrame(this.gameLoop)},1e3/this.fps)};this.tick=()=>{this.draw(),this._allowTick&&(this.run(),this._allowTick=!1)};this.paused=()=>{this.draw()};this.run=()=>{this.update(),this.draw()};this.draw=()=>{this._clear(),this._drawPreviewCells(),this._drawLivingCells(),this._drawGrid()};this.update=()=>{let e=this._getNewGrid();this.grid.forEach((t,r)=>{t.forEach((s,a)=>{s.setAliveNeighbours(this.countAliveNeighboursForCell(s)),e[r][a].alive=this.isCellStillAlive(s)})}),this.grid=e};this._clear=()=>{this.canvasContext.fillStyle=this.theme.background,this.canvasContext.clearRect(0,0,this.canvasElement.width,this.canvasElement.height),this.canvasContext.fillRect(0,0,this.canvasElement.width,this.canvasElement.height)};this._drawGrid=()=>{this.canvasContext.strokeStyle=this.theme.grid,this.grid.forEach(e=>{e.forEach((t,r)=>{this.canvasContext.strokeRect(t.x,t.y,this.cellSize,this.cellSize)})})};this._drawPreviewCells=()=>{this.previewCells.forEach(e=>{e.forEach(t=>this.drawCell(t))})};this._drawLivingCells=()=>{this.grid.forEach(e=>{e.forEach(t=>this.drawCell(t))})};this.drawCell=e=>{if(e.alive)this.canvasContext.fillStyle=this.theme.cell.alive;else if(e.example)this.canvasContext.fillStyle=this.theme.cell.example;else return;this.canvasContext.fillRect(e.x,e.y,this.cellSize,this.cellSize)};this.onResize=()=>{clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(()=>{this.setCanvasSize(window.innerWidth,window.innerHeight),this.init(),console.info("canvas resized and reinitialized")},100)};this._getNewGrid=()=>{let e=[];for(let t=0;t<=this.canvasElement?.width;t+=this.cellSize){e[t]=[];for(let r=0;r<=this.canvasElement?.height;r+=this.cellSize)e[t][r]=new w(t,r,!1)}return e};this._getCellAt=(e,t)=>this.grid[e][t];this._overflowPosition=(e,t)=>{let r={x:e,y:t},{width:s,height:a}=this.canvasElement;return e<0?r.x=s-this.cellSize:e>=s&&(r.x=0),t<0?r.y=a-this.cellSize:t>=a&&(r.y=0),r};this.getRealFrameTime=()=>this.realFrameTime;this.getSupportedPatterns=()=>Object.keys(h);this.getCurrentPreviewPattern=()=>this.currentPreviewPattern;this.setCurrentPreviewPattern=e=>(this.currentPreviewPattern=e,this);this.setHeightOffset=e=>(this.heightOffset=e,this);this.setCanvasSize=(e,t)=>{let r=this.roundToNearest(e),s=this.roundToNearest(t-this.heightOffset);return this.canvasElement.style.width=r+"px",this.canvasElement.style.height=s+"px",this.canvasElement.width=r,this.canvasElement.height=s,this};this.setGameState=e=>(this.currentState=e,this);this.isCellStillAlive=e=>{let t=e.alive;return e.aliveNeighbours=this.countAliveNeighboursForCell(e),e.alive?e.aliveNeighbours===2||e.aliveNeighbours===3?t=!0:t=!1:e.aliveNeighbours===3&&(t=!0),t};this.toggleCellAtCoordinate=(e,t)=>{let r=this.roundToNearest(e),s=this.roundToNearest(t),a=this._getCellAt(r,s);return this._getCellAt(r,s)?(a.alive=!a.alive,this):this};this.countAliveNeighboursForCell=e=>{let t=0,r=this.cellSize,{x:s,y:a}=e,l=[this._overflowPosition(s-r,a-r),this._overflowPosition(s,a-r),this._overflowPosition(s+r,a-r),this._overflowPosition(s-r,a),this._overflowPosition(s+r,a),this._overflowPosition(s-r,a+r),this._overflowPosition(s,a+r),this._overflowPosition(s+r,a+r)];for(let c of l)this._getCellAt(c.x,c.y).alive&&t++;return t};this.roundToNearest=(e,t=this.cellSize)=>Math.floor(e/t)*t;this.showPattern=(e,t,r,s=!1)=>{let a=M(e),l=[];s?(this.previewCells=this._getNewGrid(),l=this.previewCells):l=this.grid;let c=Math.floor(a[0].length/2),o=Math.floor(a.length/2);a.forEach((B,D)=>{B.forEach((O,X)=>{let u=this.roundToNearest((X-c)*this.cellSize+t),m=this.roundToNearest((D-o)*this.cellSize+r);if(typeof l[u][m]>"u"||!l[u][m]||!O)return;let P=new w(u,m,!s);P.example=s,l[u][m]=P})})};this.showPatternPreview=(e,t,r)=>this.showPattern(e,t,r,!0);this.resetPatternPreview=()=>this.previewCells=this._getNewGrid();return this.canvasElement=e,this.canvasContext=this.canvasElement.getContext("2d"),this.resizeTimeout=setTimeout(()=>{}),this}get fps(){return this._fps}set fps(e){e>this.MAX_FPS?(console.info("Maximum FPS reached: "+this.MAX_FPS),this._fps=this.MAX_FPS):this._fps=e}get cellSize(){return this._cellSize}set cellSize(e){e>this.MAX_CELL_SIZE?(console.info("Maximum Cell Size reached: "+this.MAX_CELL_SIZE),this._cellSize=this.MAX_CELL_SIZE):this._cellSize=e}get allowTick(){return this._allowTick}set allowTick(e){this._allowTick=e}},H=C;var z,p,S,I,v,f,k,R=()=>{f=document.getElementById("control-play"),k=document.getElementById("control-tick"),z=document.querySelector("#state span"),p=document.getElementById("help"),S=document.querySelector("#fps #target span"),I=document.querySelector("#fps #actual span"),v=document.querySelector("#patterns select"),v.addEventListener("change",()=>{let n=v.value,e=h[n]??"Cell";i.setCurrentPreviewPattern(e)}),Q(),$(),ee(),te(),F(),g()},Q=()=>{k.onclick=()=>{i.allowTick=!0,i.setGameState(2)},f.onclick=()=>{i.currentState==1?i.setGameState(0):i.setGameState(1),g()}},$=()=>{i.canvasElement.addEventListener("mousedown",n=>{let{x:e,y:t}=A(n,i.canvasElement);i.showPattern(i.getCurrentPreviewPattern(),e,t)},!1),i.canvasElement.addEventListener("mousemove",n=>{let{x:e,y:t}=A(n,i.canvasElement);i.showPatternPreview(i.getCurrentPreviewPattern(),e,t)},!1),i.canvasElement.addEventListener("mouseleave",n=>{i.resetPatternPreview()},!1)},ee=()=>{window.addEventListener("keyup",n=>{switch(n.key.toLowerCase()){case"p":i.setGameState(0);break;case"h":p.open?p.close():p.showModal();break;case" ":i.setGameState(i.currentState==1?0:1);break;default:break}g()},!1)},te=()=>i.getSupportedPatterns().forEach((n,e)=>{let t=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();v.add(new Option(t,n,e==0))}),F=()=>{I.innerHTML=i.currentState==1?Math.floor(1e3/i.getRealFrameTime()).toString():"0",setTimeout(F,250)},g=()=>{let n=Object.keys(d)[Object.values(d).indexOf(i.currentState)];document.title="Conway's Game of Life - "+n,z.innerHTML=n,i.currentState==1?(f.innerText="|| Pause",S.innerHTML=i.fps.toString()):(f.innerText="> Play",S.innerHTML="0")},A=(n,e)=>({x:n.clientX-e.offsetLeft,y:n.clientY-e.offsetTop});var i,U,re=()=>{U=document.getElementById("conway-canvas");let n=15,e=20;i=new H(U,n,e).setHeightOffset(document.querySelector("#info")?.clientHeight??0).init(),R()};document.addEventListener("DOMContentLoaded",()=>re());})();
