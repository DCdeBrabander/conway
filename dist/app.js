"use strict";(()=>{var h=class{constructor(e,t,i){this.x=0;this.y=0;this.size=0;this.example=!1;this.alive=!0;this.aliveNeighbours=0;this.setAliveNeighbours=e=>this.aliveNeighbours=e;this.x=e,this.y=t,this.alive=i}},c=h;var l=(t=>(t[t.PAUSED=0]="PAUSED",t[t.RUNNING=1]="RUNNING",t))(l||{}),u=class{constructor(e,t=10,i=3){this.theme={grid:"#AAA",cell:{alive:"#FFF",example:"#AAA"},background:"#444"};this.grid=[];this.previewCells=[];this.currentState=0;this.heightOffset=document.querySelector("#info")?.clientHeight??0;this.init=()=>{this.setGameState(0),this.setCanvasSize(window.innerWidth,window.innerHeight),window.addEventListener("resize",this.onResize,!1),this.grid=this.getNewGrid(),requestAnimationFrame(this.draw)};this.draw=()=>{this.clear(),this.currentState==1&&this.update(),this.drawPreviewCells(),this.drawLivingCells(),this.drawGrid(),setTimeout(()=>{requestAnimationFrame(this.draw)},1e3/this.fps)};this.update=()=>{let e=this.getNewGrid();this.grid.forEach((t,i)=>{t.forEach((s,n)=>{s.setAliveNeighbours(this.countAliveNeighboursForCell(s)),e[i][n].alive=this.isCellAlive(s)})}),this.grid=e};this.clear=()=>{this.canvasContext.fillStyle=this.theme.background,this.canvasContext.clearRect(0,0,this.canvasElement.width,this.canvasElement.height),this.canvasContext.fillRect(0,0,this.canvasElement.width,this.canvasElement.height)};this.onResize=()=>{clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(()=>{this.setCanvasSize(window.innerWidth,window.innerHeight),this.init(),console.info("canvas resized and reinitialized")},100)};this.getNewGrid=()=>{let e=[];for(let t=0;t<=this.canvasElement?.width;t+=this.resolution){e[t]=[];for(let i=0;i<=this.canvasElement?.height;i+=this.resolution)e[t][i]=new c(t,i,!1)}return e};this.drawGrid=()=>{this.canvasContext.strokeStyle=this.theme.grid,this.grid.forEach(e=>{e.forEach((t,i)=>{this.canvasContext.strokeRect(t.x,t.y,this.resolution,this.resolution)})})};this.drawPreviewCells=()=>this.previewCells.forEach(e=>e.forEach((t,i)=>this.drawCell(t)));this.drawLivingCells=()=>this.grid.forEach(e=>e.forEach((t,i)=>this.drawCell(t)));this.drawCell=e=>{if(e.alive)this.canvasContext.fillStyle=this.theme.cell.alive;else if(e.example)this.canvasContext.fillStyle=this.theme.cell.example;else return;this.canvasContext.fillRect(e.x,e.y,this.resolution,this.resolution)};this.getCellAt=(e,t)=>this.grid[e][t];this.overflowPosition=(e,t)=>{let i={x:e,y:t},{width:s,height:n}=this.canvasElement;return e<0?i.x=s-this.resolution:e>=s&&(i.x=0),t<0?i.y=n-this.resolution:t>=n&&(i.y=0),i};this.showPreviewCell=(e,t)=>{this.previewCells=this.getNewGrid();let i=this.previewCells[this.roundToNearest(e)][this.roundToNearest(t)];i.example=!0};this.setCanvasSize=(e,t)=>{let i=this.roundToNearest(e),s=this.roundToNearest(t-this.heightOffset);this.canvasElement.style.width=i+"px",this.canvasElement.style.height=s+"px",this.canvasElement.width=i,this.canvasElement.height=s};this.setGameState=e=>this.currentState=e;this.isCellAlive=e=>{let t=e.alive;return e.aliveNeighbours=this.countAliveNeighboursForCell(e),e.alive?e.aliveNeighbours===2||e.aliveNeighbours===3?t=!0:t=!1:e.aliveNeighbours===3&&(t=!0),t};this.toggleCellAtCoordinate=(e,t)=>{let i=this.roundToNearest(e),s=this.roundToNearest(t),n=this.getCellAt(i,s);this.getCellAt(i,s)&&(n.alive=!n.alive)};this.countAliveNeighboursForCell=e=>{let t=0,i=this.resolution,{x:s,y:n}=e,m=[this.overflowPosition(s-i,n-i),this.overflowPosition(s,n-i),this.overflowPosition(s+i,n-i),this.overflowPosition(s-i,n),this.overflowPosition(s+i,n),this.overflowPosition(s-i,n+i),this.overflowPosition(s,n+i),this.overflowPosition(s+i,n+i)];for(let v of m)this.getCellAt(v.x,v.y).alive&&t++;return t};this.roundToNearest=(e,t=this.resolution)=>Math.floor(e/t)*t;this.canvasElement=e,this.canvasContext=this.canvasElement.getContext("2d"),this.resizeTimeout=setTimeout(()=>{}),this.resolution=t,this.fps=i,this.init()}},d=u;var f=document.getElementById("state"),C=20,w=5,o=document.getElementById("conway-canvas"),a=new d(o,C,w);o.addEventListener("mousedown",r=>{let e=r.clientX-o.offsetLeft,t=r.clientY-o.offsetTop;a.toggleCellAtCoordinate(e,t)},!1);window.addEventListener("keyup",r=>{switch(r.key.toLowerCase()){case"p":a.setGameState(0);break;case" ":a.setGameState(a.currentState==1?0:1);break;default:break}let t=Object.keys(l)[Object.values(l).indexOf(a.currentState)];document.title="Conway's Game of Life - "+t,f.innerHTML=t},!1);o.addEventListener("mousemove",r=>{a.showPreviewCell(r.clientX-o.offsetLeft,r.clientY-o.offsetTop)},!1);})();
