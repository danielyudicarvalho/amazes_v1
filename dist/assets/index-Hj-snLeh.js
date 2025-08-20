import{P as Z}from"./phaser-0RJB29YE.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();class cc{constructor(){this.listeners=new Map}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}once(e,t){const n=r=>{this.off(e,n),t(r)};this.on(e,n)}off(e,t){const n=this.listeners.get(e);if(n){const r=n.indexOf(t);r>-1&&n.splice(r,1)}}emit(e,t){const n=this.listeners.get(e);n&&[...n].forEach(o=>{try{o(t)}catch(a){const c=a instanceof Error?a:new Error(String(a));if(this.errorHandler)try{this.errorHandler(c,e,t)}catch(h){console.error(`Error in event error handler for ${e}:`,h),console.error("Original error:",c)}else console.error(`Error in event listener for ${e}:`,c)}})}setErrorHandler(e){this.errorHandler=e}removeErrorHandler(){this.errorHandler=void 0}removeAllListeners(e){e?this.listeners.delete(e):this.listeners.clear()}listenerCount(e){var t;return((t=this.listeners.get(e))==null?void 0:t.length)??0}eventNames(){return Array.from(this.listeners.keys()).filter(e=>this.listenerCount(e)>0)}hasListeners(e){return this.listenerCount(e)>0}}const jr=class jr{static createInitialState(e,t){const n=Date.now(),r={position:{x:0,y:0},inventory:[],stats:{totalMoves:0,orbsCollected:0,timeElapsed:0,powerupsUsed:0,hintsUsed:0},activePowerups:[]},o=e.config.objectives.map(a=>({id:a.id,type:a.type,target:a.target,current:0,completed:!1,description:a.description,required:a.required}));return{levelId:e.id,levelConfig:e,status:"initializing",startTime:n,currentTime:n,pausedTime:0,player:r,maze:[],orbs:[],powerups:[],objectives:o,score:0,moves:0,hintsUsed:0,version:this.STATE_VERSION,seed:t}}static cloneState(e){return this.deepClone(e)}static deepClone(e){if(e===null||typeof e!="object")return e;if(e instanceof Date)return new Date(e.getTime());if(e instanceof Array)return e.map(t=>this.deepClone(t));if(typeof e=="object"){const t={};for(const n in e)e.hasOwnProperty(n)&&(t[n]=this.deepClone(e[n]));return t}return e}static updateState(e,t){const n=this.cloneState(e);return this.deepMerge(n,t)}static deepMerge(e,t){const n={...e};for(const r in t)if(t.hasOwnProperty(r)){const o=t[r],a=e[r];o!==void 0&&(this.isObject(o)&&this.isObject(a)?n[r]=this.deepMerge(a,o):n[r]=o)}return n}static isObject(e){return e&&typeof e=="object"&&!Array.isArray(e)&&!(e instanceof Date)}static updatePlayerPosition(e,t){return this.updateState(e,{player:{position:t,stats:{totalMoves:e.player.stats.totalMoves+1}},moves:e.moves+1,currentTime:Date.now()})}static updatePlayerStats(e,t){return this.updateState(e,{player:{stats:{...e.player.stats,...t}}})}static collectOrb(e,t){const n=e.orbs.findIndex(a=>a.id===t);if(n===-1||e.orbs[n].collected)return e;const r=e.orbs[n],o=[...e.orbs];return o[n]={...r,collected:!0,collectedAt:Date.now()},this.updateState(e,{orbs:o,score:e.score+r.value,player:{stats:{orbsCollected:e.player.stats.orbsCollected+1}}})}static updateObjectiveProgress(e,t,n){const r=e.objectives.findIndex(h=>h.id===t);if(r===-1)return e;const o=e.objectives[r],a=[...e.objectives],c=n>=o.target;return a[r]={...o,current:n,completed:c,completedAt:c&&!o.completed?Date.now():o.completedAt},this.updateState(e,{objectives:a})}static updateGameStatus(e,t){const n=Date.now(),r={status:t,currentTime:n};if(t==="playing"&&e.status==="paused"){const o=n-e.currentTime;r.pausedTime=e.pausedTime+o}else if(t==="completed"||t==="failed"){const o=n-e.startTime-e.pausedTime;r.player={stats:{timeElapsed:o}},t==="completed"&&(r.result=this.calculateGameResult(e,o))}return this.updateState(e,r)}static calculateGameResult(e,t){const n=e.objectives.filter(c=>c.completed).length,o=e.objectives.filter(c=>c.required).every(c=>c.completed);let a=0;if(o){a=1;const c=e.levelConfig.progression.starThresholds;for(const h of c.sort((d,m)=>m.stars-d.stars)){let d=!0;if(h.requirements.time&&t>h.requirements.time*1e3&&(d=!1),h.requirements.moves&&e.moves>h.requirements.moves&&(d=!1),h.requirements.orbsCollected&&e.player.stats.orbsCollected<h.requirements.orbsCollected&&(d=!1),d){a=Math.max(a,h.stars);break}}}return{completed:o,score:e.score,stars:a,completionTime:t,totalMoves:e.moves,orbsCollected:e.player.stats.orbsCollected,objectivesCompleted:n,constraintsViolated:0}}static validateState(e){return this.validateStateDetailed(e).valid}static validateStateDetailed(e){const t=[],n=[];try{return!e||typeof e!="object"?(t.push({field:"state",message:"State must be a valid object",code:"INVALID_STATE_TYPE"}),{valid:!1,errors:t,warnings:n}):(this.validateRequiredFields(e,t),this.validatePlayer(e.player,e.maze,t,n),this.validateMaze(e.maze,t,n),this.validateOrbs(e.orbs,e.maze,t,n),this.validatePowerups(e.powerups,e.maze,t,n),this.validateObjectives(e.objectives,e,t,n),this.validateGameMetrics(e,t,n),this.validateTiming(e,t,n),this.validateCrossReferences(e,t,n),{valid:t.length===0,errors:t,warnings:n})}catch(r){return t.push({field:"validation",message:`Validation failed with error: ${r.message}`,code:"VALIDATION_ERROR"}),{valid:!1,errors:t,warnings:n}}}static validateRequiredFields(e,t){const n=["levelId","levelConfig","status","startTime","currentTime","player","maze","orbs","objectives","score","moves"];for(const r of n)(!(r in e)||e[r]===null||e[r]===void 0)&&t.push({field:r,message:`Required field '${r}' is missing or null`,code:"MISSING_REQUIRED_FIELD"});(typeof e.levelId!="string"||e.levelId.length===0)&&t.push({field:"levelId",message:"Level ID must be a non-empty string",code:"INVALID_LEVEL_ID"}),["initializing","playing","paused","completed","failed"].includes(e.status)||t.push({field:"status",message:"Invalid game status",code:"INVALID_STATUS"})}static validatePlayer(e,t,n,r){var o;if(!e){n.push({field:"player",message:"Player object is required",code:"MISSING_PLAYER"});return}if(!this.isValidPosition(e.position))n.push({field:"player.position",message:"Player position is invalid",code:"INVALID_PLAYER_POSITION"});else if(t.length>0){const a=t.length,c=((o=t[0])==null?void 0:o.length)||0;(e.position.x<0||e.position.x>=c||e.position.y<0||e.position.y>=a)&&n.push({field:"player.position",message:`Player position (${e.position.x}, ${e.position.y}) is outside maze bounds (${c}x${a})`,code:"PLAYER_OUT_OF_BOUNDS"})}if(Array.isArray(e.inventory)?e.inventory.forEach((a,c)=>{(!a.id||typeof a.id!="string")&&n.push({field:`player.inventory[${c}].id`,message:"Inventory item must have a valid ID",code:"INVALID_INVENTORY_ITEM"}),(typeof a.quantity!="number"||a.quantity<0)&&n.push({field:`player.inventory[${c}].quantity`,message:"Inventory item quantity must be a non-negative number",code:"INVALID_INVENTORY_QUANTITY"})}):n.push({field:"player.inventory",message:"Player inventory must be an array",code:"INVALID_INVENTORY"}),!e.stats)n.push({field:"player.stats",message:"Player stats are required",code:"MISSING_PLAYER_STATS"});else{const a=e.stats;(typeof a.totalMoves!="number"||a.totalMoves<0)&&n.push({field:"player.stats.totalMoves",message:"Total moves must be a non-negative number",code:"INVALID_TOTAL_MOVES"}),(typeof a.orbsCollected!="number"||a.orbsCollected<0)&&n.push({field:"player.stats.orbsCollected",message:"Orbs collected must be a non-negative number",code:"INVALID_ORBS_COLLECTED"}),(typeof a.timeElapsed!="number"||a.timeElapsed<0)&&n.push({field:"player.stats.timeElapsed",message:"Time elapsed must be a non-negative number",code:"INVALID_TIME_ELAPSED"})}}static validateMaze(e,t,n){var o;if(!Array.isArray(e)){t.push({field:"maze",message:"Maze must be an array",code:"INVALID_MAZE_TYPE"});return}if(e.length===0){t.push({field:"maze",message:"Maze cannot be empty",code:"EMPTY_MAZE"});return}const r=((o=e[0])==null?void 0:o.length)||0;if(r===0){t.push({field:"maze[0]",message:"Maze rows cannot be empty",code:"EMPTY_MAZE_ROW"});return}e.forEach((a,c)=>{if(!Array.isArray(a)){t.push({field:`maze[${c}]`,message:"Maze row must be an array",code:"INVALID_MAZE_ROW"});return}a.length!==r&&t.push({field:`maze[${c}]`,message:`Maze row ${c} has width ${a.length}, expected ${r}`,code:"INCONSISTENT_MAZE_WIDTH"}),a.forEach((h,d)=>{if(!h||typeof h!="object"){t.push({field:`maze[${c}][${d}]`,message:"Maze cell must be an object",code:"INVALID_MAZE_CELL"});return}(typeof h.walls!="number"||h.walls<0||h.walls>15)&&t.push({field:`maze[${c}][${d}].walls`,message:"Cell walls must be a number between 0 and 15",code:"INVALID_CELL_WALLS"}),["floor","wall","special"].includes(h.type)||t.push({field:`maze[${c}][${d}].type`,message:"Cell type must be floor, wall, or special",code:"INVALID_CELL_TYPE"})})})}static validateOrbs(e,t,n,r){if(!Array.isArray(e)){n.push({field:"orbs",message:"Orbs must be an array",code:"INVALID_ORBS_TYPE"});return}const o=new Set;e.forEach((a,c)=>{var h;if(!a||typeof a!="object"){n.push({field:`orbs[${c}]`,message:"Orb must be an object",code:"INVALID_ORB"});return}if(!a.id||typeof a.id!="string"?n.push({field:`orbs[${c}].id`,message:"Orb must have a valid ID",code:"INVALID_ORB_ID"}):o.has(a.id)?n.push({field:`orbs[${c}].id`,message:`Duplicate orb ID: ${a.id}`,code:"DUPLICATE_ORB_ID"}):o.add(a.id),!this.isValidPosition(a.position))n.push({field:`orbs[${c}].position`,message:"Orb position is invalid",code:"INVALID_ORB_POSITION"});else if(t.length>0){const d=t.length,m=((h=t[0])==null?void 0:h.length)||0;(a.position.x<0||a.position.x>=m||a.position.y<0||a.position.y>=d)&&n.push({field:`orbs[${c}].position`,message:`Orb position (${a.position.x}, ${a.position.y}) is outside maze bounds`,code:"ORB_OUT_OF_BOUNDS"})}(typeof a.value!="number"||a.value<0)&&n.push({field:`orbs[${c}].value`,message:"Orb value must be a non-negative number",code:"INVALID_ORB_VALUE"}),typeof a.collected!="boolean"&&n.push({field:`orbs[${c}].collected`,message:"Orb collected status must be a boolean",code:"INVALID_ORB_COLLECTED"})})}static validatePowerups(e,t,n,r){if(!Array.isArray(e)){n.push({field:"powerups",message:"Powerups must be an array",code:"INVALID_POWERUPS_TYPE"});return}const o=new Set;e.forEach((a,c)=>{if(!a||typeof a!="object"){n.push({field:`powerups[${c}]`,message:"Powerup must be an object",code:"INVALID_POWERUP"});return}!a.id||typeof a.id!="string"?n.push({field:`powerups[${c}].id`,message:"Powerup must have a valid ID",code:"INVALID_POWERUP_ID"}):o.has(a.id)?n.push({field:`powerups[${c}].id`,message:`Duplicate powerup ID: ${a.id}`,code:"DUPLICATE_POWERUP_ID"}):o.add(a.id),this.isValidPosition(a.position)||n.push({field:`powerups[${c}].position`,message:"Powerup position is invalid",code:"INVALID_POWERUP_POSITION"}),(!a.type||typeof a.type!="string")&&n.push({field:`powerups[${c}].type`,message:"Powerup must have a valid type",code:"INVALID_POWERUP_TYPE"})})}static validateObjectives(e,t,n,r){if(!Array.isArray(e)){n.push({field:"objectives",message:"Objectives must be an array",code:"INVALID_OBJECTIVES_TYPE"});return}const o=new Set;let a=!1;e.forEach((c,h)=>{if(!c||typeof c!="object"){n.push({field:`objectives[${h}]`,message:"Objective must be an object",code:"INVALID_OBJECTIVE"});return}!c.id||typeof c.id!="string"?n.push({field:`objectives[${h}].id`,message:"Objective must have a valid ID",code:"INVALID_OBJECTIVE_ID"}):o.has(c.id)?n.push({field:`objectives[${h}].id`,message:`Duplicate objective ID: ${c.id}`,code:"DUPLICATE_OBJECTIVE_ID"}):o.add(c.id),(typeof c.current!="number"||c.current<0)&&n.push({field:`objectives[${h}].current`,message:"Objective current progress must be a non-negative number",code:"INVALID_OBJECTIVE_CURRENT"}),(typeof c.target!="number"||c.target<0)&&n.push({field:`objectives[${h}].target`,message:"Objective target must be a non-negative number",code:"INVALID_OBJECTIVE_TARGET"}),c.current>c.target&&!["time_limit","move_limit"].includes(c.type)&&r.push({field:`objectives[${h}].current`,message:`Objective current (${c.current}) exceeds target (${c.target})`,code:"OBJECTIVE_EXCEEDS_TARGET"}),typeof c.completed!="boolean"&&n.push({field:`objectives[${h}].completed`,message:"Objective completed status must be a boolean",code:"INVALID_OBJECTIVE_COMPLETED"}),c.required&&(a=!0)}),!a&&e.length>0&&r.push({field:"objectives",message:"No required objectives found",code:"NO_REQUIRED_OBJECTIVES"})}static validateGameMetrics(e,t,n){var r;(typeof e.score!="number"||e.score<0)&&t.push({field:"score",message:"Score must be a non-negative number",code:"INVALID_SCORE"}),(typeof e.moves!="number"||e.moves<0)&&t.push({field:"moves",message:"Moves must be a non-negative number",code:"INVALID_MOVES"}),(typeof e.hintsUsed!="number"||e.hintsUsed<0)&&t.push({field:"hintsUsed",message:"Hints used must be a non-negative number",code:"INVALID_HINTS_USED"}),(r=e.player)!=null&&r.stats&&e.moves!==e.player.stats.totalMoves&&n.push({field:"moves",message:`Game moves (${e.moves}) doesn't match player stats (${e.player.stats.totalMoves})`,code:"MOVES_MISMATCH"})}static validateTiming(e,t,n){(typeof e.startTime!="number"||e.startTime<=0)&&t.push({field:"startTime",message:"Start time must be a positive number",code:"INVALID_START_TIME"}),(typeof e.currentTime!="number"||e.currentTime<0)&&t.push({field:"currentTime",message:"Current time must be a non-negative number",code:"INVALID_CURRENT_TIME"}),e.startTime>0&&e.currentTime>0&&e.currentTime<e.startTime&&t.push({field:"currentTime",message:"Current time cannot be before start time",code:"CURRENT_TIME_BEFORE_START"}),(typeof e.pausedTime!="number"||e.pausedTime<0)&&t.push({field:"pausedTime",message:"Paused time must be a non-negative number",code:"INVALID_PAUSED_TIME"});const r=Date.now();e.startTime>r+864e5&&n.push({field:"startTime",message:"Start time is far in the future",code:"FUTURE_START_TIME"})}static validateCrossReferences(e,t,n){var a;const r=e.orbs.filter(c=>c.collected).length;(a=e.player)!=null&&a.stats&&r!==e.player.stats.orbsCollected&&n.push({field:"player.stats.orbsCollected",message:`Player stats show ${e.player.stats.orbsCollected} orbs collected, but ${r} orbs are marked as collected`,code:"ORBS_COLLECTED_MISMATCH"}),e.objectives.filter(c=>c.completed).forEach((c,h)=>{c.current<c.target&&!["time_limit","move_limit"].includes(c.type)&&n.push({field:`objectives[${h}]`,message:`Objective marked as completed but current (${c.current}) < target (${c.target})`,code:"COMPLETED_OBJECTIVE_INCONSISTENT"})})}static isValidPosition(e){return e&&typeof e.x=="number"&&typeof e.y=="number"&&e.x>=0&&e.y>=0&&Number.isInteger(e.x)&&Number.isInteger(e.y)}static toJSON(e){try{return JSON.stringify(e,this.serializationReplacer,0)}catch(t){throw new Error(`Failed to serialize game state: ${t.message}`)}}static fromJSON(e){try{const t=JSON.parse(e,this.serializationReviver),n=this.migrateState(t);if(!this.validateState(n))throw new Error("Invalid game state structure");return n}catch(t){throw new Error(`Failed to deserialize game state: ${t.message}`)}}static serializationReplacer(e,t){return t instanceof Date?{__type:"Date",__value:t.toISOString()}:t instanceof Map?{__type:"Map",__value:Array.from(t.entries())}:t instanceof Set?{__type:"Set",__value:Array.from(t)}:t instanceof RegExp?{__type:"RegExp",__value:t.toString()}:t===void 0?{__type:"undefined"}:t}static serializationReviver(e,t){if(t&&typeof t=="object"&&t.__type)switch(t.__type){case"Date":return new Date(t.__value);case"Map":return new Map(t.__value);case"Set":return new Set(t.__value);case"RegExp":const n=t.__value.match(/^\/(.*)\/([gimuy]*)$/);return n?new RegExp(n[1],n[2]):new RegExp(t.__value);case"undefined":return;default:return t}return t}static toCompressedJSON(e){const t={v:e.version,lid:e.levelId,st:e.status,stt:e.startTime,ct:e.currentTime,pt:e.pausedTime,p:{pos:e.player.position,inv:e.player.inventory,stats:e.player.stats,ap:e.player.activePowerups},m:e.maze,o:e.orbs,pu:e.powerups,obj:e.objectives,sc:e.score,mv:e.moves,h:e.hintsUsed,r:e.result,s:e.seed};return this.toJSON(t)}static fromCompressedJSON(e,t){try{const n=JSON.parse(e,this.serializationReviver),r={version:n.v||this.STATE_VERSION,levelId:n.lid,levelConfig:t,status:n.st,startTime:n.stt,currentTime:n.ct,pausedTime:n.pt||0,player:{position:n.p.pos,inventory:n.p.inv||[],stats:n.p.stats,activePowerups:n.p.ap||[]},maze:n.m,orbs:n.o||[],powerups:n.pu||[],objectives:n.obj||[],score:n.sc||0,moves:n.mv||0,hintsUsed:n.h||0,result:n.r,seed:n.s};if(!this.validateState(r))throw new Error("Invalid compressed game state structure");return r}catch(n){throw new Error(`Failed to deserialize compressed game state: ${n.message}`)}}static migrateState(e){return(!e.version||e.version<this.STATE_VERSION)&&(e.version=this.STATE_VERSION),e}};jr.STATE_VERSION=1;let Te=jr;function jo(s,e){const{width:t,height:n,algorithm:r="prim",startPosition:o}=s;dc(s);const a=Gi(t,n,o,e),c=o||{x:Math.floor(e()*t),y:Math.floor(e()*n)};return{maze:a,metadata:{width:t,height:n,algorithm:r,startPosition:c,totalCells:t*n,connectedCells:fc(a)}}}function uc(s,e,t){return jo({width:s,height:e},t).maze}function Gi(s,e,t,n){const r=hc(s,e),o=new Set,a=[],c=(t==null?void 0:t.x)??Math.floor(n()*s),h=(t==null?void 0:t.y)??Math.floor(n()*e);for(o.add(Ke(c,h)),qi(c,h,s,e,a,o);a.length>0;){const d=Math.floor(n()*a.length),m=a[d];a.splice(d,1);const{x:y,y:A,nx:S,ny:R,dir:O,backDir:D}=m,$=Ke(S,R);o.has($)||(r[A][y]|=O,r[R][S]|=D,o.add($),qi(S,R,s,e,a,o))}return r}function hc(s,e){return Array.from({length:e},()=>Array(s).fill(0))}function Ke(s,e){return`${s},${e}`}function qi(s,e,t,n,r,o){const a=fr();for(const{dx:c,dy:h,dir:d,backDir:m}of a){const y=s+c,A=e+h;ze(y,A,t,n)&&!o.has(Ke(y,A))&&r.push({x:s,y:e,nx:y,ny:A,dir:d,backDir:m})}}function fr(){return[{dx:1,dy:0,dir:1,backDir:4},{dx:0,dy:1,dir:2,backDir:8},{dx:-1,dy:0,dir:4,backDir:1},{dx:0,dy:-1,dir:8,backDir:2}]}function ze(s,e,t,n){return s>=0&&e>=0&&s<t&&e<n}function dc(s){const{width:e,height:t,startPosition:n}=s;if(e<=0||t<=0)throw new Error("Maze dimensions must be positive");if(!Number.isInteger(e)||!Number.isInteger(t))throw new Error("Maze dimensions must be integers");if(n&&!ze(n.x,n.y,e,t))throw new Error("Start position is outside maze bounds")}function fc(s){let e=0;for(let t=0;t<s.length;t++)for(let n=0;n<s[0].length;n++)s[t][n]>0&&e++;return e}function Hi(s,e,t,n){const r=s.length,o=r>0?s[0].length:0,a={isValid:!0,isSolvable:!1,errors:[],pathLength:0,complexity:0,reachableCells:0};if(!pc(s,a)||!gc(e,t,o,r,a)||!yc(s,a))return a;const c=vc(s,e,t);return c.path.length>0?(a.isSolvable=!0,a.pathLength=c.path.length-1,a.complexity=_c(s,c.path)):(a.isValid=!1,a.errors.push("No path exists from start to goal")),a.reachableCells=Ec(s,e),n&&(n.minPathLength&&a.pathLength<n.minPathLength&&(a.isValid=!1,a.errors.push(`Path length ${a.pathLength} is below minimum ${n.minPathLength}`)),n.minComplexity&&a.complexity<n.minComplexity&&(a.isValid=!1,a.errors.push(`Complexity ${a.complexity} is below minimum ${n.minComplexity}`)),n.minReachableCells&&a.reachableCells<n.minReachableCells&&(a.isValid=!1,a.errors.push(`Reachable cells ${a.reachableCells} is below minimum ${n.minReachableCells}`))),a}function mc(s,e,t){const n=zo(s,e),r=[];for(const o of t){const a=Ke(o.x,o.y);n.has(a)||r.push(o)}return{allAccessible:r.length===0,inaccessibleOrbs:r,totalOrbs:t.length,accessibleOrbs:t.length-r.length}}function zo(s,e){const t=s.length,n=t>0?s[0].length:0,r=new Set,o=[e];for(r.add(Ke(e.x,e.y));o.length>0;){const a=o.shift(),c=s[a.y][a.x],h=fr();for(const{dx:d,dy:m,dir:y}of h)if(c&y){const A=a.x+d,S=a.y+m,R=Ke(A,S);ze(A,S,n,t)&&!r.has(R)&&(r.add(R),o.push({x:A,y:S}))}}return r}function pc(s,e){if(s.length===0)return e.isValid=!1,e.errors.push("Maze is empty"),!1;const t=s[0].length;if(t===0)return e.isValid=!1,e.errors.push("Maze has zero width"),!1;for(let n=0;n<s.length;n++){if(s[n].length!==t)return e.isValid=!1,e.errors.push(`Row ${n} has inconsistent width`),!1;for(let r=0;r<t;r++){const o=s[n][r];if(o<0||o>15)return e.isValid=!1,e.errors.push(`Invalid cell value ${o} at (${r}, ${n})`),!1}}return!0}function gc(s,e,t,n,r){return ze(s.x,s.y,t,n)?ze(e.x,e.y,t,n)?!0:(r.isValid=!1,r.errors.push(`Goal position (${e.x}, ${e.y}) is outside maze bounds`),!1):(r.isValid=!1,r.errors.push(`Start position (${s.x}, ${s.y}) is outside maze bounds`),!1)}function yc(s,e){const t=s.length,n=s[0].length;for(let r=0;r<t;r++)for(let o=0;o<n;o++){const a=s[r][o];if(o<n-1&&a&1&&!(s[r][o+1]&4))return e.isValid=!1,e.errors.push(`Asymmetric East connection at (${o}, ${r})`),!1;if(r<t-1&&a&2&&!(s[r+1][o]&8))return e.isValid=!1,e.errors.push(`Asymmetric South connection at (${o}, ${r})`),!1;if(o>0&&a&4&&!(s[r][o-1]&1))return e.isValid=!1,e.errors.push(`Asymmetric West connection at (${o}, ${r})`),!1;if(r>0&&a&8&&!(s[r-1][o]&2))return e.isValid=!1,e.errors.push(`Asymmetric North connection at (${o}, ${r})`),!1}return!0}function vc(s,e,t){const n=s.length,r=n>0?s[0].length:0;if(!ze(e.x,e.y,r,n)||!ze(t.x,t.y,r,n))return{path:[],distance:-1};const o=new Set,a=[{pos:e,path:[e]}];for(o.add(Ke(e.x,e.y));a.length>0;){const{pos:c,path:h}=a.shift();if(c.x===t.x&&c.y===t.y)return{path:h,distance:h.length-1};const d=s[c.y][c.x],m=fr();for(const{dx:y,dy:A,dir:S}of m)if(d&S){const R=c.x+y,O=c.y+A,D=Ke(R,O);ze(R,O,r,n)&&!o.has(D)&&(o.add(D),a.push({pos:{x:R,y:O},path:[...h,{x:R,y:O}]}))}}return{path:[],distance:-1}}function _c(s,e){if(e.length<2)return 0;let t=0,n=0;for(let r=1;r<e.length;r++){const o=e[r-1],a=e[r],c=a.x-o.x,h=a.y-o.y;let d=0;c===1?d=0:h===1?d=1:c===-1?d=2:h===-1&&(d=3),r>1&&d!==n&&t++,n=d}return t}function Ec(s,e){return zo(s,e).size}class Go{constructor(e){this.state=e}next(){let e=this.state+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}nextInt(e,t){if(e>=t)throw new Error("min must be less than max");return Math.floor(this.next()*(t-e))+e}nextFloat(e,t){if(e>=t)throw new Error("min must be less than max");return this.next()*(t-e)+e}shuffle(e){for(let t=e.length-1;t>0;t--){const n=this.nextInt(0,t+1);[e[t],e[n]]=[e[n],e[t]]}return e}getState(){return this.state}reset(e){this.state=e}}function wc(s=new Date){const e=s.getFullYear(),t=(s.getMonth()+1).toString().padStart(2,"0"),n=s.getDate().toString().padStart(2,"0");return+`${e}${t}${n}`}class Tc{constructor(){this.gameState=null,this.currentLevelDefinition=null,this.pausedAt=null,this.totalPausedTime=0,this.eventEmitter=new cc,this.eventEmitter.setErrorHandler((e,t,n)=>{this.emit("error",{error:e,context:`Event listener error for ${t}`,recoverable:!0,timestamp:Date.now()})})}initializeLevel(e,t){try{const n=t??e.generation.seed??Date.now(),r=new Go(n);this.gameState=Te.createInitialState(e,n),this.currentLevelDefinition=e,this.pausedAt=null,this.totalPausedTime=0;const o=Date.now();try{if(e.generation.type==="procedural")this.generateProceduralMaze(e,r);else if(e.generation.type==="handcrafted")this.loadHandcraftedMaze(e);else throw new Error(`Unsupported level generation type: ${e.generation.type}`)}catch(c){this.emit("debug",{level:"warn",message:`Maze generation failed, attempting fallback: ${c.message}`,data:{originalError:c,levelId:e.id},timestamp:Date.now()}),this.generateFallbackMaze(e,r)}const a=Date.now()-o;this.emit("level.generated",{levelId:e.id,seed:n,generationTime:a,mazeSize:e.config.boardSize,orbCount:this.gameState.orbs.length,timestamp:Date.now()}),this.emit("game.initialized",{state:this.gameState,levelDefinition:e,timestamp:Date.now()}),this.emit("debug",{level:"info",message:`Level initialized: ${e.id}`,data:{seed:n,levelId:e.id,generationTime:a,mazeSize:e.config.boardSize,orbCount:this.gameState.orbs.length},timestamp:Date.now()})}catch(n){throw this.emit("error",{error:n instanceof Error?n:new Error(String(n)),context:"Level initialization",recoverable:!1,timestamp:Date.now()}),n}}startGame(){if(!this.gameState||!this.currentLevelDefinition)throw new Error("Game not initialized");const e=Date.now(),t=this.gameState;this.gameState=Te.updateGameStatus(this.gameState,"playing"),this.emit("game.started",{timestamp:e,levelId:this.currentLevelDefinition.id,seed:this.gameState.seed}),this.emitStateChanged(t,this.gameState,"Game started")}pauseGame(){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="playing")return;const e=Date.now(),t=this.gameState,n=e-this.gameState.startTime-this.totalPausedTime;this.gameState=Te.updateGameStatus(this.gameState,"paused"),this.pausedAt=e,this.emit("game.paused",{timestamp:e,duration:n}),this.emitStateChanged(t,this.gameState,"Game paused")}resumeGame(){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="paused"||!this.pausedAt)return;const e=Date.now(),t=this.gameState,n=e-this.pausedAt;this.totalPausedTime+=n,this.gameState=Te.updateGameStatus(this.gameState,"playing"),this.pausedAt=null,this.emit("game.resumed",{timestamp:e,pausedDuration:n}),this.emitStateChanged(t,this.gameState,"Game resumed")}resetGame(){if(!this.currentLevelDefinition)throw new Error("No level to reset");const e=Date.now(),t=this.currentLevelDefinition.id;this.initializeLevel(this.currentLevelDefinition),this.emit("game.reset",{timestamp:e,levelId:t,reason:"user_request"})}movePlayer(e){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="playing")return{success:!1,newPosition:this.gameState.player.position,reason:"Game not in playing state",moveCount:this.gameState.moves};const t=this.gameState.player.position,n=this.calculateNewPosition(t,e),r=Date.now();if(this.emit("player.move.attempted",{from:t,attemptedTo:n,direction:this.directionToCardinal(e),blocked:!1,timestamp:r}),!this.isValidMove(t,n))return this.emit("player.move.attempted",{from:t,attemptedTo:n,direction:this.directionToCardinal(e),blocked:!0,reason:"Invalid move",timestamp:r}),{success:!1,newPosition:t,reason:"Invalid move",moveCount:this.gameState.moves};const a=this.gameState;this.gameState=Te.updatePlayerPosition(this.gameState,n);const c={success:!0,newPosition:n,moveCount:this.gameState.moves};return this.emit("player.moved",{from:t,to:n,valid:!0,moveCount:this.gameState.moves,timestamp:r}),this.emitStateChanged(a,this.gameState,"Player moved"),this.checkAutomaticOrbCollection(n),this.updateObjectives(),this.checkGameCompletion(),c}collectOrb(e){if(!this.gameState)throw new Error("Game not initialized");const t=this.gameState.orbs.find(d=>d.id===e);if(!t)return{success:!1,orbId:e,scoreGained:0,reason:"Orb not found",totalScore:this.gameState.score};if(t.collected)return{success:!1,orbId:e,scoreGained:0,reason:"Orb already collected",totalScore:this.gameState.score};if(this.gameState.player.position.x!==t.position.x||this.gameState.player.position.y!==t.position.y)return{success:!1,orbId:e,scoreGained:0,reason:"Player not at orb position",totalScore:this.gameState.score};const n=Date.now(),r=this.gameState,o=this.gameState.score;this.gameState=Te.collectOrb(this.gameState,e);const a=this.gameState.score-o,c=this.gameState.orbs.filter(d=>!d.collected).length;this.updateObjectives();const h={success:!0,orbId:e,scoreGained:a,totalScore:this.gameState.score};return this.emit("orb.collected",{orbId:e,position:t.position,score:a,totalScore:this.gameState.score,orbsRemaining:c,timestamp:n}),a>0&&this.emit("score.changed",{previousScore:o,newScore:this.gameState.score,change:a,reason:"orb_collected",timestamp:n}),this.emitStateChanged(r,this.gameState,"Orb collected"),this.checkGameCompletion(),h}getGameState(){if(!this.gameState)throw new Error("Game not initialized");return this.gameState}isGameComplete(){return this.gameState?this.gameState.objectives.filter(e=>e.required).every(e=>e.completed):!1}getScore(){var e;return((e=this.gameState)==null?void 0:e.score)??0}getCurrentTime(){if(!this.gameState)return 0;const e=Date.now(),t=e-this.gameState.startTime,n=this.pausedAt?e-this.pausedAt:0;return t-this.totalPausedTime-n}on(e,t){this.eventEmitter.on(e,t)}off(e,t){this.eventEmitter.off(e,t)}once(e,t){this.eventEmitter.once(e,t)}emit(e,t){this.eventEmitter.emit(e,t)}emitStateChanged(e,t,n){const r=this.calculateStateChanges(e,t);this.emit("state.changed",{state:t,changes:r,timestamp:Date.now()}),this.emit("debug",{level:"debug",message:`State changed: ${n}`,data:{changeCount:r.length,changes:r},timestamp:Date.now()})}calculateStateChanges(e,t){const n=[],r=Date.now();e.status!==t.status&&n.push({property:"status",oldValue:e.status,newValue:t.status,timestamp:r}),e.score!==t.score&&n.push({property:"score",oldValue:e.score,newValue:t.score,timestamp:r}),e.moves!==t.moves&&n.push({property:"moves",oldValue:e.moves,newValue:t.moves,timestamp:r}),(e.player.position.x!==t.player.position.x||e.player.position.y!==t.player.position.y)&&n.push({property:"player.position",oldValue:e.player.position,newValue:t.player.position,timestamp:r});for(let o=0;o<Math.max(e.orbs.length,t.orbs.length);o++){const a=e.orbs[o],c=t.orbs[o];a&&c&&a.collected!==c.collected&&n.push({property:`orbs[${o}].collected`,oldValue:a.collected,newValue:c.collected,timestamp:r})}return n}calculateNewPosition(e,t){switch(t){case"up":return{x:e.x,y:e.y-1};case"down":return{x:e.x,y:e.y+1};case"left":return{x:e.x-1,y:e.y};case"right":return{x:e.x+1,y:e.y};default:return e}}directionToCardinal(e){switch(e){case"up":return"north";case"down":return"south";case"left":return"west";case"right":return"east";default:return"north"}}checkAutomaticOrbCollection(e){if(!this.gameState)return;const t=this.gameState.orbs.filter(n=>n.position.x===e.x&&n.position.y===e.y&&!n.collected);for(const n of t)this.collectOrb(n.id)}updateObjectives(){if(!this.gameState)return;const e=this.gameState;let t=!1;for(const n of this.gameState.objectives){if(n.completed)continue;let r=n.current;switch(n.type){case"collect_orbs":r=this.gameState.player.stats.orbsCollected;break;case"reach_goal":r=this.isPlayerAtGoal()?1:0;break;case"collect_all_orbs":const a=this.gameState.orbs.length;r=this.gameState.orbs.filter(d=>d.collected).length===a?1:0;break;case"time_limit":const h=this.getCurrentTime();r=Math.max(0,n.target-Math.floor(h/1e3));break;case"move_limit":r=Math.max(0,n.target-this.gameState.moves);break;default:continue}r!==n.current&&(this.gameState=Te.updateObjectiveProgress(this.gameState,n.id,r),t=!0,this.emit("objective.progress",{objectiveId:n.id,previousProgress:n.current,newProgress:r,target:n.target,completed:r>=n.target,timestamp:Date.now()}),r>=n.target&&n.current<n.target&&this.emit("objective.completed",{objectiveId:n.id,completionTime:this.getCurrentTime(),timestamp:Date.now()}))}t&&this.emitStateChanged(e,this.gameState,"Objectives updated")}checkGameCompletion(){if(!this.gameState)return;if(this.gameState.objectives.filter(n=>n.required).every(n=>n.completed)&&this.gameState.status==="playing"){const n=Date.now(),r=this.getCurrentTime(),o=this.gameState;this.gameState=Te.updateGameStatus(this.gameState,"completed");const a=this.calculateGameResult(r);this.emit("game.completed",{result:a,timestamp:n,duration:r}),this.emitStateChanged(o,this.gameState,"Game completed")}}calculateGameResult(e){if(!this.gameState)throw new Error("Game not initialized");const t=this.gameState.objectives.filter(a=>a.completed).length,r=this.gameState.objectives.filter(a=>a.required).every(a=>a.completed);let o=0;if(r){o=1;const a=this.gameState.levelConfig.progression.starThresholds;for(const c of a.sort((h,d)=>d.stars-h.stars)){let h=!0;if(c.requirements.time&&e>c.requirements.time*1e3&&(h=!1),c.requirements.moves&&this.gameState.moves>c.requirements.moves&&(h=!1),c.requirements.orbsCollected&&this.gameState.player.stats.orbsCollected<c.requirements.orbsCollected&&(h=!1),h){o=Math.max(o,c.stars);break}}}return{completed:r,score:this.gameState.score,stars:o,completionTime:e,totalMoves:this.gameState.moves,orbsCollected:this.gameState.player.stats.orbsCollected,objectivesCompleted:t,constraintsViolated:0}}generateProceduralMaze(e,t){if(!this.gameState)throw new Error("Game state not initialized");const{width:n,height:r}=e.config.boardSize;e.generation.parameters;const a=uc(n,r,()=>t.next()).map((h,d)=>h.map((m,y)=>({walls:m,type:y===0&&d===0||y===n-1&&d===r-1?"special":"floor",properties:{isStart:y===0&&d===0,isGoal:y===n-1&&d===r-1,isVisited:!1}}))),c=this.generateOrbs(e,t,a);this.gameState=Te.updateState(this.gameState,{maze:a,orbs:c,player:{position:{x:0,y:0}}})}loadHandcraftedMaze(e){if(!this.gameState)throw new Error("Game state not initialized");const t=e.generation.layout;if(!t)throw new Error("Handcrafted level missing layout data");const n=t.cells.map(o=>o.map(a=>({walls:a.walls,type:a.type==="start"||a.type==="goal"?"special":a.type,properties:{isStart:a.type==="start",isGoal:a.type==="goal",isVisited:!1,...a.properties}}))),r=t.orbPositions.map((o,a)=>({id:o.id||`orb_${a}`,position:{x:o.x,y:o.y},collected:!1,value:o.value}));this.gameState=Te.updateState(this.gameState,{maze:n,orbs:r,player:{position:t.startPosition}})}generateOrbs(e,t,n){const r=e.generation.parameters;if(!r)return[];const o=[],{width:a,height:c}=e.config.boardSize,h=r.orbCount||3,d=[];for(let S=0;S<c;S++)for(let R=0;R<a;R++){const O=n[S][R];!O.properties.isStart&&!O.properties.isGoal&&d.push({x:R,y:S})}const m=t.shuffle([...d]),y=r.orbPlacement||"random";let A=[];switch(y){case"random":A=m.slice(0,Math.min(h,m.length));break;case"corners":const S=m.filter(R=>(R.x===0||R.x===a-1)&&(R.y===0||R.y===c-1));A=[...S.slice(0,Math.min(h,S.length)),...m.filter(R=>!S.includes(R)).slice(0,Math.max(0,h-S.length))];break;case"strategic":case"path":default:A=m.slice(0,Math.min(h,m.length));break}return A.forEach((S,R)=>{o.push({id:`orb_${R}`,position:S,collected:!1,value:100})}),o}isPlayerAtGoal(){var n;if(!this.gameState||!this.currentLevelDefinition)return!1;const e=this.gameState.player.position,t=(n=this.gameState.maze[e.y])==null?void 0:n[e.x];return(t==null?void 0:t.properties.isGoal)===!0}generateFallbackMaze(e,t){if(!this.gameState)throw new Error("Game state not initialized");const{width:n,height:r}=e.config.boardSize,o=[];for(let h=0;h<r;h++){const d=[];for(let m=0;m<n;m++){let y=0;m<n-1&&(y|=1),h<r-1&&(y|=2),m>0&&(y|=4),h>0&&(y|=8),d.push({walls:y,type:m===0&&h===0||m===n-1&&h===r-1?"special":"floor",properties:{isStart:m===0&&h===0,isGoal:m===n-1&&h===r-1,isVisited:!1}})}o.push(d)}const a=[],c=Math.min(2,Math.floor(n*r/4));for(let h=0;h<c;h++){let d,m;do d=Math.floor(t.next()*n),m=Math.floor(t.next()*r);while(d===0&&m===0||d===n-1&&m===r-1);a.push({id:`fallback_orb_${h}`,position:{x:d,y:m},collected:!1,value:100})}this.gameState=Te.updateState(this.gameState,{maze:o,orbs:a,player:{position:{x:0,y:0}}}),this.emit("debug",{level:"info",message:"Fallback maze generated successfully",data:{mazeSize:{width:n,height:r},orbCount:a.length},timestamp:Date.now()})}isValidMove(e,t){var h;if(!this.gameState||t.x<0||t.y<0||this.gameState.maze.length===0)return!1;const n=this.gameState.maze.length,r=((h=this.gameState.maze[0])==null?void 0:h.length)??0;if(t.x>=r||t.y>=n)return!1;const o=t.x-e.x,a=t.y-e.y;if(Math.abs(o)+Math.abs(a)!==1)return!1;const c=this.gameState.maze[e.y][e.x];return!(o===1&&!(c.walls&1)||o===-1&&!(c.walls&4)||a===1&&!(c.walls&2)||a===-1&&!(c.walls&8))}}const Ic="modulepreload",Ac=function(s){return"/"+s},Ki={},Pe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(h=>{if(h=Ac(h),h in Ki)return;Ki[h]=!0;const d=h.endsWith(".css"),m=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${m}`))return;const y=document.createElement("link");if(y.rel=d?"stylesheet":Ic,d||(y.as="script"),y.crossOrigin="",y.href=h,c&&y.setAttribute("nonce",c),document.head.appendChild(y),d)return new Promise((A,S)=>{y.addEventListener("load",A),y.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(a){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=a,window.dispatchEvent(c),!c.defaultPrevented)throw a}return r.then(a=>{for(const c of a||[])c.status==="rejected"&&o(c.reason);return e().catch(o)})},bc=(s,e,t)=>{const n=s[e];return n?typeof n=="function"?n():Promise.resolve(n):new Promise((r,o)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(o.bind(null,new Error("Unknown variable dynamic import: "+e+(e.split("/").length!==t?". Note that variables only represent file names one level deep.":""))))})},rs=class rs{static isLevelDefinition(e){return this.validate(e).valid}static isLevelMetadata(e){return this.validateMetadata(e).valid}static isLevelGeneration(e){return this.validateGeneration(e).valid}static isLevelConfig(e){return this.validateConfig(e).valid}static isLevelProgression(e){return this.validateProgression(e).valid}static validate(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"root",message:"Level definition must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const r=["id","version","metadata","generation","config","progression"];for(const o of r)o in e||t.push({field:o,message:`Required field '${o}' is missing`,severity:"error",code:"MISSING_FIELD"});if(typeof e.version!="number"?t.push({field:"version",message:"Version must be a number",severity:"error",code:"INVALID_TYPE"}):this.SUPPORTED_VERSIONS.includes(e.version)||n.push({field:"version",message:`Version ${e.version} may not be fully supported`,severity:"warning",code:"UNSUPPORTED_VERSION"}),typeof e.id!="string"||!e.id.trim()?t.push({field:"id",message:"ID must be a non-empty string",severity:"error",code:"INVALID_ID"}):/^[a-zA-Z0-9_-]+$/.test(e.id)||t.push({field:"id",message:"ID must contain only alphanumeric characters, underscores, and hyphens",severity:"error",code:"INVALID_ID_FORMAT"}),e.metadata){const o=this.validateMetadata(e.metadata);t.push(...o.errors),n.push(...o.warnings)}if(e.generation){const o=this.validateGeneration(e.generation);t.push(...o.errors),n.push(...o.warnings)}if(e.config){const o=this.validateConfig(e.config);t.push(...o.errors),n.push(...o.warnings)}if(e.progression){const o=this.validateProgression(e.progression);t.push(...o.errors),n.push(...o.warnings)}return{valid:t.length===0,errors:t,warnings:n}}static validateMetadata(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"metadata",message:"Metadata must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const r=["name","difficulty","estimatedTime","tags"];for(const a of r)a in e||t.push({field:`metadata.${a}`,message:`Required field '${a}' is missing`,severity:"error",code:"MISSING_FIELD"});(typeof e.name!="string"||!e.name.trim())&&t.push({field:"metadata.name",message:"Name must be a non-empty string",severity:"error",code:"INVALID_NAME"});const o=["easy","medium","hard","expert"];return o.includes(e.difficulty)||t.push({field:"metadata.difficulty",message:`Difficulty must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_DIFFICULTY"}),(typeof e.estimatedTime!="number"||e.estimatedTime<=0)&&t.push({field:"metadata.estimatedTime",message:"Estimated time must be a positive number",severity:"error",code:"INVALID_TIME"}),Array.isArray(e.tags)?e.tags.forEach((a,c)=>{typeof a!="string"&&t.push({field:`metadata.tags[${c}]`,message:"Each tag must be a string",severity:"error",code:"INVALID_TAG"})}):t.push({field:"metadata.tags",message:"Tags must be an array",severity:"error",code:"INVALID_TAGS"}),{valid:t.length===0,errors:t,warnings:n}}static validateGeneration(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"generation",message:"Generation must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const r=["procedural","handcrafted"];if(r.includes(e.type)||t.push({field:"generation.type",message:`Generation type must be one of: ${r.join(", ")}`,severity:"error",code:"INVALID_GENERATION_TYPE"}),e.type==="procedural"&&(typeof e.seed!="number"&&n.push({field:"generation.seed",message:"Procedural generation should include a seed for deterministic results",severity:"warning",code:"MISSING_SEED"}),e.parameters)){const o=this.validateProceduralParameters(e.parameters);t.push(...o.errors),n.push(...o.warnings)}if(e.type==="handcrafted")if(!e.layout)t.push({field:"generation.layout",message:"Handcrafted generation must include layout data",severity:"error",code:"MISSING_LAYOUT"});else{const o=this.validateHandcraftedLayout(e.layout);t.push(...o.errors),n.push(...o.warnings)}return{valid:t.length===0,errors:t,warnings:n}}static validateProceduralParameters(e){const t=[],n=[],r=["recursive_backtrack","kruskal","prim","wilson"];r.includes(e.algorithm)||t.push({field:"generation.parameters.algorithm",message:`Algorithm must be one of: ${r.join(", ")}`,severity:"error",code:"INVALID_ALGORITHM"});const o=[{name:"complexity",min:0,max:1},{name:"branchingFactor",min:0,max:1},{name:"deadEndRatio",min:0,max:1}];for(const c of o){const h=e[c.name];(typeof h!="number"||h<c.min||h>c.max)&&t.push({field:`generation.parameters.${c.name}`,message:`${c.name} must be a number between ${c.min} and ${c.max}`,severity:"error",code:"INVALID_PARAMETER_RANGE"})}(typeof e.orbCount!="number"||e.orbCount<0)&&t.push({field:"generation.parameters.orbCount",message:"Orb count must be a non-negative number",severity:"error",code:"INVALID_ORB_COUNT"});const a=["random","strategic","path","corners"];return a.includes(e.orbPlacement)||t.push({field:"generation.parameters.orbPlacement",message:`Orb placement must be one of: ${a.join(", ")}`,severity:"error",code:"INVALID_ORB_PLACEMENT"}),{valid:t.length===0,errors:t,warnings:n}}static validateHandcraftedLayout(e){const t=[],n=[],r=["cells","startPosition","goalPosition","orbPositions"];for(const o of r)o in e||t.push({field:`generation.layout.${o}`,message:`Required field '${o}' is missing`,severity:"error",code:"MISSING_FIELD"});return e.startPosition&&!this.isValidPosition(e.startPosition)&&t.push({field:"generation.layout.startPosition",message:"Start position must have valid x and y coordinates",severity:"error",code:"INVALID_POSITION"}),e.goalPosition&&!this.isValidPosition(e.goalPosition)&&t.push({field:"generation.layout.goalPosition",message:"Goal position must have valid x and y coordinates",severity:"error",code:"INVALID_POSITION"}),Array.isArray(e.orbPositions)&&e.orbPositions.forEach((o,a)=>{(!this.isValidPosition(o)||typeof o.value!="number")&&t.push({field:`generation.layout.orbPositions[${a}]`,message:"Orb position must have valid x, y coordinates and numeric value",severity:"error",code:"INVALID_ORB_POSITION"})}),{valid:t.length===0,errors:t,warnings:n}}static validateConfig(e){const t=[],n=[];return!e||typeof e!="object"?(t.push({field:"config",message:"Config must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n}):((!e.boardSize||!this.isValidSize(e.boardSize))&&t.push({field:"config.boardSize",message:"Board size must have valid width and height",severity:"error",code:"INVALID_BOARD_SIZE"}),Array.isArray(e.objectives)?e.objectives.forEach((r,o)=>{const a=this.validateObjective(r,o);t.push(...a.errors),n.push(...a.warnings)}):t.push({field:"config.objectives",message:"Objectives must be an array",severity:"error",code:"INVALID_OBJECTIVES"}),Array.isArray(e.constraints)?e.constraints.forEach((r,o)=>{const a=this.validateConstraint(r,o);t.push(...a.errors),n.push(...a.warnings)}):t.push({field:"config.constraints",message:"Constraints must be an array",severity:"error",code:"INVALID_CONSTRAINTS"}),{valid:t.length===0,errors:t,warnings:n})}static validateProgression(e){const t=[],n=[];return!e||typeof e!="object"?(t.push({field:"progression",message:"Progression must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n}):(Array.isArray(e.starThresholds)?e.starThresholds.length===0&&n.push({field:"progression.starThresholds",message:"No star thresholds defined",severity:"warning",code:"EMPTY_STAR_THRESHOLDS"}):t.push({field:"progression.starThresholds",message:"Star thresholds must be an array",severity:"error",code:"INVALID_STAR_THRESHOLDS"}),Array.isArray(e.rewards)||t.push({field:"progression.rewards",message:"Rewards must be an array",severity:"error",code:"INVALID_REWARDS"}),Array.isArray(e.unlocks)||t.push({field:"progression.unlocks",message:"Unlocks must be an array",severity:"error",code:"INVALID_UNLOCKS"}),{valid:t.length===0,errors:t,warnings:n})}static isValidPosition(e){return e&&typeof e=="object"&&typeof e.x=="number"&&typeof e.y=="number"&&e.x>=0&&e.y>=0}static isValidSize(e){return e&&typeof e=="object"&&typeof e.width=="number"&&typeof e.height=="number"&&e.width>0&&e.height>0}static validateObjective(e,t){const n=[],r=[],o=["collect_orbs","collect_all_orbs","reach_goal","time_limit","move_limit","collect_sequence","avoid_traps"];return o.includes(e.type)||n.push({field:`config.objectives[${t}].type`,message:`Objective type must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_OBJECTIVE_TYPE"}),(typeof e.target!="number"||e.target<0)&&n.push({field:`config.objectives[${t}].target`,message:"Objective target must be a non-negative number",severity:"error",code:"INVALID_OBJECTIVE_TARGET"}),{valid:n.length===0,errors:n,warnings:r}}static validateConstraint(e,t){const n=[],r=[],o=["time_limit","move_limit","no_backtrack","no_diagonal","limited_vision","one_way_paths"];return o.includes(e.type)||n.push({field:`config.constraints[${t}].type`,message:`Constraint type must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_CONSTRAINT_TYPE"}),(typeof e.value!="number"||e.value<0)&&n.push({field:`config.constraints[${t}].value`,message:"Constraint value must be a non-negative number",severity:"error",code:"INVALID_CONSTRAINT_VALUE"}),{valid:n.length===0,errors:n,warnings:r}}};rs.CURRENT_VERSION=1,rs.SUPPORTED_VERSIONS=[1];let Xs=rs;const zr=class zr{static migrate(e,t,n=this.CURRENT_VERSION){if(t===n)return e;let r={...e};return t<1&&n>=1&&(r=this.migrateToV1(r)),r.version=n,r}static getCurrentVersion(){return this.CURRENT_VERSION}static isVersionSupported(e){return e<=this.CURRENT_VERSION&&e>=1}static migrateToV1(e){return e.metadata||(e.metadata={name:e.name||`Level ${e.id}`,difficulty:e.difficulty||"medium",estimatedTime:e.estimatedTime||300,tags:e.tags||[]}),e.generation||(e.generation={type:"procedural",seed:Math.floor(Math.random()*1e6),parameters:{algorithm:"recursive_backtrack",complexity:.5,branchingFactor:.3,deadEndRatio:.1,orbCount:3,orbPlacement:"random"}}),e.config||(e.config={boardSize:{width:10,height:10},objectives:[{id:"reach_goal",type:"reach_goal",target:1,description:"Reach the goal",required:!0,priority:1}],constraints:[],powerups:[]}),e.progression||(e.progression={starThresholds:[{stars:1,requirements:{}},{stars:2,requirements:{time:300}},{stars:3,requirements:{time:180}}],rewards:[],unlocks:[]}),e}};zr.CURRENT_VERSION=1;let Yt=zr;class qo{constructor(e=100){this.levelCache=new Map,this.cacheStats={size:0,hitRate:0,totalRequests:0,totalHits:0,totalMisses:0},this.embeddedLevels=new Map,this.maxCacheSize=e,this.initializeEmbeddedLevels()}async loadLevel(e,t){return(await this.loadLevelWithResult(e,t)).level}async loadLevelWithResult(e,t){const n=performance.now();this.cacheStats.totalRequests++;const r={validateSchema:!0,migrateVersion:!0,includeMetadata:!0,cacheable:!0,...t};if(r.cacheable){const o=this.getCachedLevelEntry(e);if(o)return this.cacheStats.totalHits++,this.updateCacheStats(),o.lastAccessed=Date.now(),o.accessCount++,{level:o.level,loadTime:performance.now()-n,fromCache:!0,migrated:o.migrated,validationResult:r.validateSchema?this.validateLevel(o.level):void 0}}this.cacheStats.totalMisses++;try{const o=await this.loadLevelData(e);let a=o,c=!1,h;if(r.migrateVersion&&o.version!==Yt.getCurrentVersion()&&(a=Yt.migrate(o,o.version||1,Yt.getCurrentVersion()),c=!0),r.validateSchema&&(h=this.validateLevel(a),!h.valid))throw new Error(`Level validation failed for ${e}: ${h.errors.map(d=>d.message).join(", ")}`);return r.cacheable&&this.cacheLevel(e,a,c),this.updateCacheStats(),{level:a,loadTime:performance.now()-n,fromCache:!1,migrated:c,validationResult:h}}catch(o){throw this.updateCacheStats(),new Error(`Failed to load level ${e}: ${o instanceof Error?o.message:"Unknown error"}`)}}async loadLevels(e,t){const n=e.map(r=>this.loadLevel(r,t));return Promise.all(n)}getCachedLevel(e){const t=this.getCachedLevelEntry(e);return t?t.level:null}async preloadLevels(e,t){for(let r=0;r<e.length;r+=5){const o=e.slice(r,r+5);await Promise.all(o.map(a=>this.loadLevel(a,t)))}}clearCache(){this.levelCache.clear(),this.cacheStats={size:0,hitRate:0,totalRequests:0,totalHits:0,totalMisses:0}}getCacheStats(){return{size:this.cacheStats.size,hitRate:this.cacheStats.hitRate,totalRequests:this.cacheStats.totalRequests}}validateLevel(e){return Xs.validate(e)}async listAvailableLevels(){const e=Array.from(this.embeddedLevels.keys()),t=Array.from(this.levelCache.keys()),n=["level-001-tutorial","level-002-simple-path","level-003-branching-paths","level-004-time-pressure","level-005-puzzle-chamber","level-006-maze-runner","level-007-symmetry-challenge","level-008-trap-maze","level-009-speed-demon","level-010-master-challenge"],r=[];for(const a of n)try{await this.loadLevelData(a),r.push(a)}catch(c){console.warn(`Level ${a} not available:`,c)}const o=new Set([...e,...t,...r]);return Array.from(o).sort()}getCachedLevelEntry(e){return this.levelCache.get(e)||null}cacheLevel(e,t,n){this.levelCache.size>=this.maxCacheSize&&this.evictLeastRecentlyUsed();const r={level:t,loadTime:Date.now(),lastAccessed:Date.now(),accessCount:1,migrated:n};this.levelCache.set(e,r),this.cacheStats.size=this.levelCache.size}evictLeastRecentlyUsed(){let e=null,t=Date.now();for(const[n,r]of this.levelCache.entries())r.lastAccessed<t&&(t=r.lastAccessed,e=n);e&&this.levelCache.delete(e)}updateCacheStats(){this.cacheStats.size=this.levelCache.size,this.cacheStats.totalRequests>0&&(this.cacheStats.hitRate=this.cacheStats.totalHits/this.cacheStats.totalRequests)}async loadLevelData(e){try{const n=await bc(Object.assign({"../data/levels/level-001-tutorial.json":()=>Pe(()=>import("./level-001-tutorial-sGR1CIEv.js"),[]),"../data/levels/level-002-simple-path.json":()=>Pe(()=>import("./level-002-simple-path-DvcO82a_.js"),[]),"../data/levels/level-003-branching-paths.json":()=>Pe(()=>import("./level-003-branching-paths-CFtalBFM.js"),[]),"../data/levels/level-004-time-pressure.json":()=>Pe(()=>import("./level-004-time-pressure-CtakREVA.js"),[]),"../data/levels/level-005-puzzle-chamber.json":()=>Pe(()=>import("./level-005-puzzle-chamber-Ddt5qlnL.js"),[]),"../data/levels/level-006-maze-runner.json":()=>Pe(()=>import("./level-006-maze-runner-BBgG5vUY.js"),[]),"../data/levels/level-007-symmetry-challenge.json":()=>Pe(()=>import("./level-007-symmetry-challenge-B2tVyWaX.js"),[]),"../data/levels/level-008-trap-maze.json":()=>Pe(()=>import("./level-008-trap-maze-DhA8KXtE.js"),[]),"../data/levels/level-009-speed-demon.json":()=>Pe(()=>import("./level-009-speed-demon-Dbwz1Bda.js"),[]),"../data/levels/level-010-master-challenge.json":()=>Pe(()=>import("./level-010-master-challenge-D4U1f3MU.js"),[])}),`../data/levels/${e}.json`,4);return n.default||n}catch(n){console.warn(`Failed to import ${e}:`,n)}try{const n=await fetch(`/src/data/levels/${e}.json`);if(n.ok)return await n.json()}catch(n){console.warn(`Failed to fetch ${e}:`,n)}const t=this.embeddedLevels.get(e);if(t)return console.warn(`Using embedded metadata for ${e}, full level data not available`),t;throw new Error(`Level data not found for ID: ${e}`)}async generateLevel(e,t){const n=performance.now(),r=t??e.generation.seed??Date.now(),o=new Go(r);try{let a;if(e.generation.type==="procedural")a=await this.generateProceduralLevel(e,o,r);else if(e.generation.type==="handcrafted")a=await this.generateHandcraftedLevel(e,r);else{const h=new Error(`Unsupported generation type: ${e.generation.type}`);throw h.code="UNSUPPORTED_TYPE",h.levelId=e.id,h}a.metadata.generationTime=performance.now()-n;const c=this.validateGeneratedLevel(a);if(!c.valid)try{a=await this.generateFallbackLevel(e,o,r),a.metadata.generationTime=performance.now()-n}catch(h){const d=new Error(`Level generation and fallback failed: ${c.errors.map(m=>m.message).join(", ")}`);throw d.code="GENERATION_FAILED",d.levelId=e.id,d.details={validationErrors:c.errors,fallbackError:h},d}return a}catch(a){if(a instanceof Error&&"code"in a)throw a;const c=new Error(`Level generation failed: ${a instanceof Error?a.message:"Unknown error"}`);throw c.code="GENERATION_FAILED",c.levelId=e.id,c.details={originalError:a},c}}validateGeneratedLevel(e){var h,d;const t=[],n=[];if(!e.maze||e.maze.length===0)return t.push({message:"Generated maze is empty",severity:"error",code:"EMPTY_MAZE"}),{valid:!1,errors:t,warnings:n};const{width:r,height:o}=e.definition.config.boardSize;(e.maze.length!==o||((h=e.maze[0])==null?void 0:h.length)!==r)&&t.push({message:`Maze dimensions ${(d=e.maze[0])==null?void 0:d.length}x${e.maze.length} don't match config ${r}x${o}`,severity:"error",code:"DIMENSION_MISMATCH"}),this.isPositionInBounds(e.startPosition,r,o)||t.push({message:"Start position is outside maze bounds",severity:"error",code:"INVALID_START_POSITION"}),this.isPositionInBounds(e.goalPosition,r,o)||t.push({message:"Goal position is outside maze bounds",severity:"error",code:"INVALID_GOAL_POSITION"});for(let m=0;m<e.orbPositions.length;m++){const y=e.orbPositions[m];this.isPositionInBounds(y,r,o)||t.push({message:`Orb position (${y.x}, ${y.y}) is outside maze bounds`,severity:"error",code:"INVALID_ORB_POSITION"})}e.metadata.solvable||t.push({message:"Generated maze is not solvable",severity:"error",code:"UNSOLVABLE_MAZE"});const a=this.getMinPathLengthRequirement(e.definition);a&&e.metadata.pathLength<a&&n.push({message:`Path length ${e.metadata.pathLength} is below recommended minimum ${a}`,severity:"warning",code:"SHORT_PATH"});const c=mc(e.maze.map(m=>m.map(y=>y.walls)),e.startPosition,e.orbPositions);return c.allAccessible||t.push({message:`${c.inaccessibleOrbs.length} orbs are not accessible from start position`,severity:"error",code:"INACCESSIBLE_ORBS"}),{valid:t.length===0,errors:t,warnings:n}}async generateProceduralLevel(e,t,n){const r=e.generation.parameters;if(!r)throw new Error("Procedural generation requires parameters");const{width:o,height:a}=e.config.boardSize,c={width:o,height:a,algorithm:this.mapAlgorithm(r.algorithm),startPosition:{x:0,y:0}},d=jo(c,()=>t.next()).maze.map((O,D)=>O.map(($,U)=>({walls:$,type:this.determineCellType(U,D,o,a),properties:{isStart:U===0&&D===0,isGoal:U===o-1&&D===a-1,isVisited:!1}}))),m={x:0,y:0},y={x:o-1,y:a-1},A=this.generateOrbPositions(r,d,m,y,t),S=[],R=Hi(d.map(O=>O.map(D=>D.walls)),m,y,this.getMazeValidationOptions(r));return{definition:e,maze:d,startPosition:m,goalPosition:y,orbPositions:A,powerupPositions:S,metadata:{seed:n,generationTime:0,algorithm:r.algorithm,solvable:R.isSolvable,pathLength:R.pathLength,complexity:R.complexity}}}async generateHandcraftedLevel(e,t){var d;const n=e.generation.layout;if(!n)throw new Error("Handcrafted generation requires layout data");const r=n.cells.map(m=>m.map(y=>({walls:y.walls,type:y.type==="start"||y.type==="goal"?"special":y.type,properties:{isStart:y.type==="start",isGoal:y.type==="goal",isVisited:!1,...y.properties}}))),o=n.orbPositions.map((m,y)=>({x:m.x,y:m.y,value:m.value,id:m.id||`orb_${y}`})),a=((d=n.powerupPositions)==null?void 0:d.map((m,y)=>({x:m.x,y:m.y,type:m.type,id:m.id||`powerup_${y}`})))||[],c=Hi(r.map(m=>m.map(y=>y.walls)),n.startPosition,n.goalPosition);return{definition:e,maze:r,startPosition:{...n.startPosition},goalPosition:{...n.goalPosition},orbPositions:o,powerupPositions:a,metadata:{seed:t,generationTime:0,solvable:c.isSolvable,pathLength:c.pathLength,complexity:c.complexity}}}async generateFallbackLevel(e,t,n){const{width:r,height:o}=e.config.boardSize,a=[];for(let y=0;y<o;y++){const A=[];for(let S=0;S<r;S++){let R=0;S<r-1&&(R|=1),y<o-1&&(R|=2),S>0&&(R|=4),y>0&&(R|=8),A.push({walls:R,type:this.determineCellType(S,y,r,o),properties:{isStart:S===0&&y===0,isGoal:S===r-1&&y===o-1,isVisited:!1}})}a.push(A)}const c={x:0,y:0},h={x:r-1,y:o-1},d=Math.min(2,Math.floor(r*o/8)),m=[];for(let y=0;y<d;y++){let A,S;do A=Math.floor(t.next()*r),S=Math.floor(t.next()*o);while(A===0&&S===0||A===r-1&&S===o-1);m.push({x:A,y:S,value:100,id:`fallback_orb_${y}`})}return{definition:e,maze:a,startPosition:c,goalPosition:h,orbPositions:m,powerupPositions:[],metadata:{seed:n,generationTime:0,algorithm:"fallback",solvable:!0,pathLength:Math.abs(h.x-c.x)+Math.abs(h.y-c.y),complexity:0}}}generateOrbPositions(e,t,n,r,o){var R;const a=[],c=t.length,h=((R=t[0])==null?void 0:R.length)||0,d=e.orbCount||3,m=[];for(let O=0;O<c;O++)for(let D=0;D<h;D++)D===n.x&&O===n.y||D===r.x&&O===r.y||m.push({x:D,y:O});const y=o.shuffle([...m]);let A=[];switch(e.orbPlacement||"random"){case"random":A=y.slice(0,Math.min(d,y.length));break;case"corners":const O=y.filter(D=>(D.x===0||D.x===h-1)&&(D.y===0||D.y===c-1));A=[...O.slice(0,Math.min(d,O.length)),...y.filter(D=>!O.includes(D)).slice(0,Math.max(0,d-O.length))];break;case"strategic":case"path":default:A=y.slice(0,Math.min(d,y.length));break}return A.forEach((O,D)=>{a.push({x:O.x,y:O.y,value:100,id:`orb_${D}`})}),a}mapAlgorithm(e){switch(e){case"prim":case"kruskal":return"prim";case"recursive_backtrack":case"wilson":return"recursive-backtrack";default:return"prim"}}determineCellType(e,t,n,r){return e===0&&t===0||e===n-1&&t===r-1?"special":"floor"}getMazeValidationOptions(e){return{minPathLength:e.minPathLength,minComplexity:Math.floor(e.complexity*10),minReachableCells:Math.floor((e.branchingFactor||.3)*20)}}getMinPathLengthRequirement(e){const t=e.generation.parameters;return t==null?void 0:t.minPathLength}isPositionInBounds(e,t,n){return e.x>=0&&e.y>=0&&e.x<t&&e.y<n}initializeEmbeddedLevels(){[{id:"level-001-tutorial",name:"Tutorial",difficulty:"easy"},{id:"level-002-simple-path",name:"Simple Path",difficulty:"easy"},{id:"level-003-branching-paths",name:"Branching Paths",difficulty:"easy"},{id:"level-004-time-pressure",name:"Time Pressure",difficulty:"medium"},{id:"level-005-puzzle-chamber",name:"Puzzle Chamber",difficulty:"medium"},{id:"level-006-maze-runner",name:"Maze Runner",difficulty:"medium"},{id:"level-007-symmetry-challenge",name:"Symmetry Challenge",difficulty:"hard"},{id:"level-008-trap-maze",name:"Trap Maze",difficulty:"hard"},{id:"level-009-speed-demon",name:"Speed Demon",difficulty:"expert"},{id:"level-010-master-challenge",name:"Master Challenge",difficulty:"expert"}].forEach(t=>{this.embeddedLevels.set(t.id,{id:t.id,name:t.name,difficulty:t.difficulty})})}}var Wi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ho=function(s){const e=[];let t=0;for(let n=0;n<s.length;n++){let r=s.charCodeAt(n);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&n+1<s.length&&(s.charCodeAt(n+1)&64512)===56320?(r=65536+((r&1023)<<10)+(s.charCodeAt(++n)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},Sc=function(s){const e=[];let t=0,n=0;for(;t<s.length;){const r=s[t++];if(r<128)e[n++]=String.fromCharCode(r);else if(r>191&&r<224){const o=s[t++];e[n++]=String.fromCharCode((r&31)<<6|o&63)}else if(r>239&&r<365){const o=s[t++],a=s[t++],c=s[t++],h=((r&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(h>>10)),e[n++]=String.fromCharCode(56320+(h&1023))}else{const o=s[t++],a=s[t++];e[n++]=String.fromCharCode((r&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Ko={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(s,e){if(!Array.isArray(s))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let r=0;r<s.length;r+=3){const o=s[r],a=r+1<s.length,c=a?s[r+1]:0,h=r+2<s.length,d=h?s[r+2]:0,m=o>>2,y=(o&3)<<4|c>>4;let A=(c&15)<<2|d>>6,S=d&63;h||(S=64,a||(A=64)),n.push(t[m],t[y],t[A],t[S])}return n.join("")},encodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(s):this.encodeByteArray(Ho(s),e)},decodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(s):Sc(this.decodeStringToByteArray(s,e))},decodeStringToByteArray(s,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let r=0;r<s.length;){const o=t[s.charAt(r++)],c=r<s.length?t[s.charAt(r)]:0;++r;const d=r<s.length?t[s.charAt(r)]:64;++r;const y=r<s.length?t[s.charAt(r)]:64;if(++r,o==null||c==null||d==null||y==null)throw new Rc;const A=o<<2|c>>4;if(n.push(A),d!==64){const S=c<<4&240|d>>2;if(n.push(S),y!==64){const R=d<<6&192|y;n.push(R)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let s=0;s<this.ENCODED_VALS.length;s++)this.byteToCharMap_[s]=this.ENCODED_VALS.charAt(s),this.charToByteMap_[this.byteToCharMap_[s]]=s,this.byteToCharMapWebSafe_[s]=this.ENCODED_VALS_WEBSAFE.charAt(s),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[s]]=s,s>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(s)]=s,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(s)]=s)}}};class Rc extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Pc=function(s){const e=Ho(s);return Ko.encodeByteArray(e,!0)},zn=function(s){return Pc(s).replace(/\./g,"")},Cc=function(s){try{return Ko.decodeString(s,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vc(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dc=()=>Vc().__FIREBASE_DEFAULTS__,Oc=()=>{if(typeof process>"u"||typeof Wi>"u")return;const s=Wi.__FIREBASE_DEFAULTS__;if(s)return JSON.parse(s)},Lc=()=>{if(typeof document>"u")return;let s;try{s=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=s&&Cc(s[1]);return e&&JSON.parse(e)},mr=()=>{try{return Dc()||Oc()||Lc()}catch(s){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${s}`);return}},Nc=s=>{var e,t;return(t=(e=mr())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[s]},Mc=s=>{const e=Nc(s);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},Wo=()=>{var s;return(s=mr())===null||s===void 0?void 0:s.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xc(s,e){if(s.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",r=s.iat||0,o=s.sub||s.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},s);return[zn(JSON.stringify(t)),zn(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fc(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Bc(){var s;const e=(s=mr())===null||s===void 0?void 0:s.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Qo(){const s=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof s=="object"&&s.id!==void 0}function $c(){return!Bc()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function pr(){try{return typeof indexedDB=="object"}catch{return!1}}function gr(){return new Promise((s,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(n);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(n),s(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var o;e(((o=r.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}function Yo(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uc="FirebaseError";class Je extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Uc,Object.setPrototypeOf(this,Je.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,is.prototype.create)}}class is{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,o=this.errors[e],a=o?jc(o,n):"Error",c=`${this.serviceName}: ${a} (${r}).`;return new Je(r,c,n)}}function jc(s,e){return s.replace(zc,(t,n)=>{const r=e[n];return r!=null?String(r):`<${n}?>`})}const zc=/\{\$([^}]+)}/g;function Gn(s,e){if(s===e)return!0;const t=Object.keys(s),n=Object.keys(e);for(const r of t){if(!n.includes(r))return!1;const o=s[r],a=e[r];if(Qi(o)&&Qi(a)){if(!Gn(o,a))return!1}else if(o!==a)return!1}for(const r of n)if(!t.includes(r))return!1;return!0}function Qi(s){return s!==null&&typeof s=="object"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gc=1e3,qc=2,Hc=4*60*60*1e3,Kc=.5;function Yi(s,e=Gc,t=qc){const n=e*Math.pow(t,s),r=Math.round(Kc*n*(Math.random()-.5)*2);return Math.min(Hc,n+r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ut(s){return s&&s._delegate?s._delegate:s}class xe{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wc{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new kc;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&n.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(o){if(r)return null;throw o}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Yc(e))try{this.getOrInitializeService({instanceIdentifier:rt})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:r});n.resolve(o)}catch{}}}}clearInstance(e=rt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rt){return this.instances.has(e)}getOptions(e=rt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[o,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);n===c&&a.resolve(r)}return r}onInit(e,t){var n;const r=this.normalizeInstanceIdentifier(t),o=(n=this.onInitCallbacks.get(r))!==null&&n!==void 0?n:new Set;o.add(e),this.onInitCallbacks.set(r,o);const a=this.instances.get(r);return a&&e(a,r),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const r of n)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Qc(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=rt){return this.component?this.component.multipleInstances?e:rt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Qc(s){return s===rt?void 0:s}function Yc(s){return s.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xc{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Wc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var F;(function(s){s[s.DEBUG=0]="DEBUG",s[s.VERBOSE=1]="VERBOSE",s[s.INFO=2]="INFO",s[s.WARN=3]="WARN",s[s.ERROR=4]="ERROR",s[s.SILENT=5]="SILENT"})(F||(F={}));const Jc={debug:F.DEBUG,verbose:F.VERBOSE,info:F.INFO,warn:F.WARN,error:F.ERROR,silent:F.SILENT},Zc=F.INFO,eu={[F.DEBUG]:"log",[F.VERBOSE]:"log",[F.INFO]:"info",[F.WARN]:"warn",[F.ERROR]:"error"},tu=(s,e,...t)=>{if(e<s.logLevel)return;const n=new Date().toISOString(),r=eu[e];if(r)console[r](`[${n}]  ${s.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class yr{constructor(e){this.name=e,this._logLevel=Zc,this._logHandler=tu,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in F))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Jc[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,F.DEBUG,...e),this._logHandler(this,F.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,F.VERBOSE,...e),this._logHandler(this,F.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,F.INFO,...e),this._logHandler(this,F.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,F.WARN,...e),this._logHandler(this,F.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,F.ERROR,...e),this._logHandler(this,F.ERROR,...e)}}const nu=(s,e)=>e.some(t=>s instanceof t);let Xi,Ji;function su(){return Xi||(Xi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ru(){return Ji||(Ji=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Xo=new WeakMap,Js=new WeakMap,Jo=new WeakMap,Us=new WeakMap,vr=new WeakMap;function iu(s){const e=new Promise((t,n)=>{const r=()=>{s.removeEventListener("success",o),s.removeEventListener("error",a)},o=()=>{t(Ge(s.result)),r()},a=()=>{n(s.error),r()};s.addEventListener("success",o),s.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Xo.set(t,s)}).catch(()=>{}),vr.set(e,s),e}function ou(s){if(Js.has(s))return;const e=new Promise((t,n)=>{const r=()=>{s.removeEventListener("complete",o),s.removeEventListener("error",a),s.removeEventListener("abort",a)},o=()=>{t(),r()},a=()=>{n(s.error||new DOMException("AbortError","AbortError")),r()};s.addEventListener("complete",o),s.addEventListener("error",a),s.addEventListener("abort",a)});Js.set(s,e)}let Zs={get(s,e,t){if(s instanceof IDBTransaction){if(e==="done")return Js.get(s);if(e==="objectStoreNames")return s.objectStoreNames||Jo.get(s);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Ge(s[e])},set(s,e,t){return s[e]=t,!0},has(s,e){return s instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in s}};function au(s){Zs=s(Zs)}function lu(s){return s===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=s.call(js(this),e,...t);return Jo.set(n,e.sort?e.sort():[e]),Ge(n)}:ru().includes(s)?function(...e){return s.apply(js(this),e),Ge(Xo.get(this))}:function(...e){return Ge(s.apply(js(this),e))}}function cu(s){return typeof s=="function"?lu(s):(s instanceof IDBTransaction&&ou(s),nu(s,su())?new Proxy(s,Zs):s)}function Ge(s){if(s instanceof IDBRequest)return iu(s);if(Us.has(s))return Us.get(s);const e=cu(s);return e!==s&&(Us.set(s,e),vr.set(e,s)),e}const js=s=>vr.get(s);function Zo(s,e,{blocked:t,upgrade:n,blocking:r,terminated:o}={}){const a=indexedDB.open(s,e),c=Ge(a);return n&&a.addEventListener("upgradeneeded",h=>{n(Ge(a.result),h.oldVersion,h.newVersion,Ge(a.transaction),h)}),t&&a.addEventListener("blocked",h=>t(h.oldVersion,h.newVersion,h)),c.then(h=>{o&&h.addEventListener("close",()=>o()),r&&h.addEventListener("versionchange",d=>r(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const uu=["get","getKey","getAll","getAllKeys","count"],hu=["put","add","delete","clear"],zs=new Map;function Zi(s,e){if(!(s instanceof IDBDatabase&&!(e in s)&&typeof e=="string"))return;if(zs.get(e))return zs.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,r=hu.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(r||uu.includes(t)))return;const o=async function(a,...c){const h=this.transaction(a,r?"readwrite":"readonly");let d=h.store;return n&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),r&&h.done]))[0]};return zs.set(e,o),o}au(s=>({...s,get:(e,t,n)=>Zi(e,t)||s.get(e,t,n),has:(e,t)=>!!Zi(e,t)||s.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class du{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(fu(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function fu(s){const e=s.getComponent();return(e==null?void 0:e.type)==="VERSION"}const er="@firebase/app",eo="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fe=new yr("@firebase/app"),mu="@firebase/app-compat",pu="@firebase/analytics-compat",gu="@firebase/analytics",yu="@firebase/app-check-compat",vu="@firebase/app-check",_u="@firebase/auth",Eu="@firebase/auth-compat",wu="@firebase/database",Tu="@firebase/data-connect",Iu="@firebase/database-compat",Au="@firebase/functions",bu="@firebase/functions-compat",Su="@firebase/installations",Ru="@firebase/installations-compat",Pu="@firebase/messaging",Cu="@firebase/messaging-compat",Vu="@firebase/performance",Du="@firebase/performance-compat",Ou="@firebase/remote-config",Lu="@firebase/remote-config-compat",Nu="@firebase/storage",Mu="@firebase/storage-compat",ku="@firebase/firestore",xu="@firebase/vertexai-preview",Fu="@firebase/firestore-compat",Bu="firebase",$u="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tr="[DEFAULT]",Uu={[er]:"fire-core",[mu]:"fire-core-compat",[gu]:"fire-analytics",[pu]:"fire-analytics-compat",[vu]:"fire-app-check",[yu]:"fire-app-check-compat",[_u]:"fire-auth",[Eu]:"fire-auth-compat",[wu]:"fire-rtdb",[Tu]:"fire-data-connect",[Iu]:"fire-rtdb-compat",[Au]:"fire-fn",[bu]:"fire-fn-compat",[Su]:"fire-iid",[Ru]:"fire-iid-compat",[Pu]:"fire-fcm",[Cu]:"fire-fcm-compat",[Vu]:"fire-perf",[Du]:"fire-perf-compat",[Ou]:"fire-rc",[Lu]:"fire-rc-compat",[Nu]:"fire-gcs",[Mu]:"fire-gcs-compat",[ku]:"fire-fst",[Fu]:"fire-fst-compat",[xu]:"fire-vertex","fire-js":"fire-js",[Bu]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qn=new Map,ju=new Map,nr=new Map;function to(s,e){try{s.container.addComponent(e)}catch(t){Fe.debug(`Component ${e.name} failed to register with FirebaseApp ${s.name}`,t)}}function We(s){const e=s.name;if(nr.has(e))return Fe.debug(`There were multiple attempts to register component ${e}.`),!1;nr.set(e,s);for(const t of qn.values())to(t,s);for(const t of ju.values())to(t,s);return!0}function hn(s,e){const t=s.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),s.container.getProvider(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zu={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},qe=new is("app","Firebase",zu);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new xe("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw qe.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qu=$u;function ea(s,e={}){let t=s;typeof e!="object"&&(e={name:e});const n=Object.assign({name:tr,automaticDataCollectionEnabled:!1},e),r=n.name;if(typeof r!="string"||!r)throw qe.create("bad-app-name",{appName:String(r)});if(t||(t=Wo()),!t)throw qe.create("no-options");const o=qn.get(r);if(o){if(Gn(t,o.options)&&Gn(n,o.config))return o;throw qe.create("duplicate-app",{appName:r})}const a=new Xc(r);for(const h of nr.values())a.addComponent(h);const c=new Gu(t,n,a);return qn.set(r,c),c}function ta(s=tr){const e=qn.get(s);if(!e&&s===tr&&Wo())return ea();if(!e)throw qe.create("no-app",{appName:s});return e}function Ce(s,e,t){var n;let r=(n=Uu[s])!==null&&n!==void 0?n:s;t&&(r+=`-${t}`);const o=r.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const c=[`Unable to register library "${r}" with version "${e}":`];o&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),o&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Fe.warn(c.join(" "));return}We(new xe(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hu="firebase-heartbeat-database",Ku=1,nn="firebase-heartbeat-store";let Gs=null;function na(){return Gs||(Gs=Zo(Hu,Ku,{upgrade:(s,e)=>{switch(e){case 0:try{s.createObjectStore(nn)}catch(t){console.warn(t)}}}}).catch(s=>{throw qe.create("idb-open",{originalErrorMessage:s.message})})),Gs}async function Wu(s){try{const t=(await na()).transaction(nn),n=await t.objectStore(nn).get(sa(s));return await t.done,n}catch(e){if(e instanceof Je)Fe.warn(e.message);else{const t=qe.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Fe.warn(t.message)}}}async function no(s,e){try{const n=(await na()).transaction(nn,"readwrite");await n.objectStore(nn).put(e,sa(s)),await n.done}catch(t){if(t instanceof Je)Fe.warn(t.message);else{const n=qe.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Fe.warn(n.message)}}}function sa(s){return`${s.name}!${s.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qu=1024,Yu=30*24*60*60*1e3;class Xu{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Zu(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=so();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o)?void 0:(this._heartbeatsCache.heartbeats.push({date:o,agent:r}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=Yu}),this._storage.overwrite(this._heartbeatsCache))}catch(n){Fe.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=so(),{heartbeatsToSend:n,unsentEntries:r}=Ju(this._heartbeatsCache.heartbeats),o=zn(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return Fe.warn(t),""}}}function so(){return new Date().toISOString().substring(0,10)}function Ju(s,e=Qu){const t=[];let n=s.slice();for(const r of s){const o=t.find(a=>a.agent===r.agent);if(o){if(o.dates.push(r.date),ro(t)>e){o.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),ro(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class Zu{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return pr()?gr().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Wu(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return no(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return no(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function ro(s){return zn(JSON.stringify({version:2,heartbeats:s})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eh(s){We(new xe("platform-logger",e=>new du(e),"PRIVATE")),We(new xe("heartbeat",e=>new Xu(e),"PRIVATE")),Ce(er,eo,s),Ce(er,eo,"esm2017"),Ce("fire-js","")}eh("");var io=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ra;(function(){var s;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,p){function v(){}v.prototype=p.prototype,w.D=p.prototype,w.prototype=new v,w.prototype.constructor=w,w.C=function(_,E,I){for(var g=Array(arguments.length-2),Oe=2;Oe<arguments.length;Oe++)g[Oe-2]=arguments[Oe];return p.prototype[E].apply(_,g)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(n,t),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(w,p,v){v||(v=0);var _=Array(16);if(typeof p=="string")for(var E=0;16>E;++E)_[E]=p.charCodeAt(v++)|p.charCodeAt(v++)<<8|p.charCodeAt(v++)<<16|p.charCodeAt(v++)<<24;else for(E=0;16>E;++E)_[E]=p[v++]|p[v++]<<8|p[v++]<<16|p[v++]<<24;p=w.g[0],v=w.g[1],E=w.g[2];var I=w.g[3],g=p+(I^v&(E^I))+_[0]+3614090360&4294967295;p=v+(g<<7&4294967295|g>>>25),g=I+(E^p&(v^E))+_[1]+3905402710&4294967295,I=p+(g<<12&4294967295|g>>>20),g=E+(v^I&(p^v))+_[2]+606105819&4294967295,E=I+(g<<17&4294967295|g>>>15),g=v+(p^E&(I^p))+_[3]+3250441966&4294967295,v=E+(g<<22&4294967295|g>>>10),g=p+(I^v&(E^I))+_[4]+4118548399&4294967295,p=v+(g<<7&4294967295|g>>>25),g=I+(E^p&(v^E))+_[5]+1200080426&4294967295,I=p+(g<<12&4294967295|g>>>20),g=E+(v^I&(p^v))+_[6]+2821735955&4294967295,E=I+(g<<17&4294967295|g>>>15),g=v+(p^E&(I^p))+_[7]+4249261313&4294967295,v=E+(g<<22&4294967295|g>>>10),g=p+(I^v&(E^I))+_[8]+1770035416&4294967295,p=v+(g<<7&4294967295|g>>>25),g=I+(E^p&(v^E))+_[9]+2336552879&4294967295,I=p+(g<<12&4294967295|g>>>20),g=E+(v^I&(p^v))+_[10]+4294925233&4294967295,E=I+(g<<17&4294967295|g>>>15),g=v+(p^E&(I^p))+_[11]+2304563134&4294967295,v=E+(g<<22&4294967295|g>>>10),g=p+(I^v&(E^I))+_[12]+1804603682&4294967295,p=v+(g<<7&4294967295|g>>>25),g=I+(E^p&(v^E))+_[13]+4254626195&4294967295,I=p+(g<<12&4294967295|g>>>20),g=E+(v^I&(p^v))+_[14]+2792965006&4294967295,E=I+(g<<17&4294967295|g>>>15),g=v+(p^E&(I^p))+_[15]+1236535329&4294967295,v=E+(g<<22&4294967295|g>>>10),g=p+(E^I&(v^E))+_[1]+4129170786&4294967295,p=v+(g<<5&4294967295|g>>>27),g=I+(v^E&(p^v))+_[6]+3225465664&4294967295,I=p+(g<<9&4294967295|g>>>23),g=E+(p^v&(I^p))+_[11]+643717713&4294967295,E=I+(g<<14&4294967295|g>>>18),g=v+(I^p&(E^I))+_[0]+3921069994&4294967295,v=E+(g<<20&4294967295|g>>>12),g=p+(E^I&(v^E))+_[5]+3593408605&4294967295,p=v+(g<<5&4294967295|g>>>27),g=I+(v^E&(p^v))+_[10]+38016083&4294967295,I=p+(g<<9&4294967295|g>>>23),g=E+(p^v&(I^p))+_[15]+3634488961&4294967295,E=I+(g<<14&4294967295|g>>>18),g=v+(I^p&(E^I))+_[4]+3889429448&4294967295,v=E+(g<<20&4294967295|g>>>12),g=p+(E^I&(v^E))+_[9]+568446438&4294967295,p=v+(g<<5&4294967295|g>>>27),g=I+(v^E&(p^v))+_[14]+3275163606&4294967295,I=p+(g<<9&4294967295|g>>>23),g=E+(p^v&(I^p))+_[3]+4107603335&4294967295,E=I+(g<<14&4294967295|g>>>18),g=v+(I^p&(E^I))+_[8]+1163531501&4294967295,v=E+(g<<20&4294967295|g>>>12),g=p+(E^I&(v^E))+_[13]+2850285829&4294967295,p=v+(g<<5&4294967295|g>>>27),g=I+(v^E&(p^v))+_[2]+4243563512&4294967295,I=p+(g<<9&4294967295|g>>>23),g=E+(p^v&(I^p))+_[7]+1735328473&4294967295,E=I+(g<<14&4294967295|g>>>18),g=v+(I^p&(E^I))+_[12]+2368359562&4294967295,v=E+(g<<20&4294967295|g>>>12),g=p+(v^E^I)+_[5]+4294588738&4294967295,p=v+(g<<4&4294967295|g>>>28),g=I+(p^v^E)+_[8]+2272392833&4294967295,I=p+(g<<11&4294967295|g>>>21),g=E+(I^p^v)+_[11]+1839030562&4294967295,E=I+(g<<16&4294967295|g>>>16),g=v+(E^I^p)+_[14]+4259657740&4294967295,v=E+(g<<23&4294967295|g>>>9),g=p+(v^E^I)+_[1]+2763975236&4294967295,p=v+(g<<4&4294967295|g>>>28),g=I+(p^v^E)+_[4]+1272893353&4294967295,I=p+(g<<11&4294967295|g>>>21),g=E+(I^p^v)+_[7]+4139469664&4294967295,E=I+(g<<16&4294967295|g>>>16),g=v+(E^I^p)+_[10]+3200236656&4294967295,v=E+(g<<23&4294967295|g>>>9),g=p+(v^E^I)+_[13]+681279174&4294967295,p=v+(g<<4&4294967295|g>>>28),g=I+(p^v^E)+_[0]+3936430074&4294967295,I=p+(g<<11&4294967295|g>>>21),g=E+(I^p^v)+_[3]+3572445317&4294967295,E=I+(g<<16&4294967295|g>>>16),g=v+(E^I^p)+_[6]+76029189&4294967295,v=E+(g<<23&4294967295|g>>>9),g=p+(v^E^I)+_[9]+3654602809&4294967295,p=v+(g<<4&4294967295|g>>>28),g=I+(p^v^E)+_[12]+3873151461&4294967295,I=p+(g<<11&4294967295|g>>>21),g=E+(I^p^v)+_[15]+530742520&4294967295,E=I+(g<<16&4294967295|g>>>16),g=v+(E^I^p)+_[2]+3299628645&4294967295,v=E+(g<<23&4294967295|g>>>9),g=p+(E^(v|~I))+_[0]+4096336452&4294967295,p=v+(g<<6&4294967295|g>>>26),g=I+(v^(p|~E))+_[7]+1126891415&4294967295,I=p+(g<<10&4294967295|g>>>22),g=E+(p^(I|~v))+_[14]+2878612391&4294967295,E=I+(g<<15&4294967295|g>>>17),g=v+(I^(E|~p))+_[5]+4237533241&4294967295,v=E+(g<<21&4294967295|g>>>11),g=p+(E^(v|~I))+_[12]+1700485571&4294967295,p=v+(g<<6&4294967295|g>>>26),g=I+(v^(p|~E))+_[3]+2399980690&4294967295,I=p+(g<<10&4294967295|g>>>22),g=E+(p^(I|~v))+_[10]+4293915773&4294967295,E=I+(g<<15&4294967295|g>>>17),g=v+(I^(E|~p))+_[1]+2240044497&4294967295,v=E+(g<<21&4294967295|g>>>11),g=p+(E^(v|~I))+_[8]+1873313359&4294967295,p=v+(g<<6&4294967295|g>>>26),g=I+(v^(p|~E))+_[15]+4264355552&4294967295,I=p+(g<<10&4294967295|g>>>22),g=E+(p^(I|~v))+_[6]+2734768916&4294967295,E=I+(g<<15&4294967295|g>>>17),g=v+(I^(E|~p))+_[13]+1309151649&4294967295,v=E+(g<<21&4294967295|g>>>11),g=p+(E^(v|~I))+_[4]+4149444226&4294967295,p=v+(g<<6&4294967295|g>>>26),g=I+(v^(p|~E))+_[11]+3174756917&4294967295,I=p+(g<<10&4294967295|g>>>22),g=E+(p^(I|~v))+_[2]+718787259&4294967295,E=I+(g<<15&4294967295|g>>>17),g=v+(I^(E|~p))+_[9]+3951481745&4294967295,w.g[0]=w.g[0]+p&4294967295,w.g[1]=w.g[1]+(E+(g<<21&4294967295|g>>>11))&4294967295,w.g[2]=w.g[2]+E&4294967295,w.g[3]=w.g[3]+I&4294967295}n.prototype.u=function(w,p){p===void 0&&(p=w.length);for(var v=p-this.blockSize,_=this.B,E=this.h,I=0;I<p;){if(E==0)for(;I<=v;)r(this,w,I),I+=this.blockSize;if(typeof w=="string"){for(;I<p;)if(_[E++]=w.charCodeAt(I++),E==this.blockSize){r(this,_),E=0;break}}else for(;I<p;)if(_[E++]=w[I++],E==this.blockSize){r(this,_),E=0;break}}this.h=E,this.o+=p},n.prototype.v=function(){var w=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);w[0]=128;for(var p=1;p<w.length-8;++p)w[p]=0;var v=8*this.o;for(p=w.length-8;p<w.length;++p)w[p]=v&255,v/=256;for(this.u(w),w=Array(16),p=v=0;4>p;++p)for(var _=0;32>_;_+=8)w[v++]=this.g[p]>>>_&255;return w};function o(w,p){var v=c;return Object.prototype.hasOwnProperty.call(v,w)?v[w]:v[w]=p(w)}function a(w,p){this.h=p;for(var v=[],_=!0,E=w.length-1;0<=E;E--){var I=w[E]|0;_&&I==p||(v[E]=I,_=!1)}this.g=v}var c={};function h(w){return-128<=w&&128>w?o(w,function(p){return new a([p|0],0>p?-1:0)}):new a([w|0],0>w?-1:0)}function d(w){if(isNaN(w)||!isFinite(w))return y;if(0>w)return D(d(-w));for(var p=[],v=1,_=0;w>=v;_++)p[_]=w/v|0,v*=4294967296;return new a(p,0)}function m(w,p){if(w.length==0)throw Error("number format error: empty string");if(p=p||10,2>p||36<p)throw Error("radix out of range: "+p);if(w.charAt(0)=="-")return D(m(w.substring(1),p));if(0<=w.indexOf("-"))throw Error('number format error: interior "-" character');for(var v=d(Math.pow(p,8)),_=y,E=0;E<w.length;E+=8){var I=Math.min(8,w.length-E),g=parseInt(w.substring(E,E+I),p);8>I?(I=d(Math.pow(p,I)),_=_.j(I).add(d(g))):(_=_.j(v),_=_.add(d(g)))}return _}var y=h(0),A=h(1),S=h(16777216);s=a.prototype,s.m=function(){if(O(this))return-D(this).m();for(var w=0,p=1,v=0;v<this.g.length;v++){var _=this.i(v);w+=(0<=_?_:4294967296+_)*p,p*=4294967296}return w},s.toString=function(w){if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(R(this))return"0";if(O(this))return"-"+D(this).toString(w);for(var p=d(Math.pow(w,6)),v=this,_="";;){var E=ae(v,p).g;v=$(v,E.j(p));var I=((0<v.g.length?v.g[0]:v.h)>>>0).toString(w);if(v=E,R(v))return I+_;for(;6>I.length;)I="0"+I;_=I+_}},s.i=function(w){return 0>w?0:w<this.g.length?this.g[w]:this.h};function R(w){if(w.h!=0)return!1;for(var p=0;p<w.g.length;p++)if(w.g[p]!=0)return!1;return!0}function O(w){return w.h==-1}s.l=function(w){return w=$(this,w),O(w)?-1:R(w)?0:1};function D(w){for(var p=w.g.length,v=[],_=0;_<p;_++)v[_]=~w.g[_];return new a(v,~w.h).add(A)}s.abs=function(){return O(this)?D(this):this},s.add=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0,E=0;E<=p;E++){var I=_+(this.i(E)&65535)+(w.i(E)&65535),g=(I>>>16)+(this.i(E)>>>16)+(w.i(E)>>>16);_=g>>>16,I&=65535,g&=65535,v[E]=g<<16|I}return new a(v,v[v.length-1]&-2147483648?-1:0)};function $(w,p){return w.add(D(p))}s.j=function(w){if(R(this)||R(w))return y;if(O(this))return O(w)?D(this).j(D(w)):D(D(this).j(w));if(O(w))return D(this.j(D(w)));if(0>this.l(S)&&0>w.l(S))return d(this.m()*w.m());for(var p=this.g.length+w.g.length,v=[],_=0;_<2*p;_++)v[_]=0;for(_=0;_<this.g.length;_++)for(var E=0;E<w.g.length;E++){var I=this.i(_)>>>16,g=this.i(_)&65535,Oe=w.i(E)>>>16,Vt=w.i(E)&65535;v[2*_+2*E]+=g*Vt,U(v,2*_+2*E),v[2*_+2*E+1]+=I*Vt,U(v,2*_+2*E+1),v[2*_+2*E+1]+=g*Oe,U(v,2*_+2*E+1),v[2*_+2*E+2]+=I*Oe,U(v,2*_+2*E+2)}for(_=0;_<p;_++)v[_]=v[2*_+1]<<16|v[2*_];for(_=p;_<2*p;_++)v[_]=0;return new a(v,0)};function U(w,p){for(;(w[p]&65535)!=w[p];)w[p+1]+=w[p]>>>16,w[p]&=65535,p++}function Q(w,p){this.g=w,this.h=p}function ae(w,p){if(R(p))throw Error("division by zero");if(R(w))return new Q(y,y);if(O(w))return p=ae(D(w),p),new Q(D(p.g),D(p.h));if(O(p))return p=ae(w,D(p)),new Q(D(p.g),p.h);if(30<w.g.length){if(O(w)||O(p))throw Error("slowDivide_ only works with positive integers.");for(var v=A,_=p;0>=_.l(w);)v=Ze(v),_=Ze(_);var E=ve(v,1),I=ve(_,1);for(_=ve(_,2),v=ve(v,2);!R(_);){var g=I.add(_);0>=g.l(w)&&(E=E.add(v),I=g),_=ve(_,1),v=ve(v,1)}return p=$(w,E.j(p)),new Q(E,p)}for(E=y;0<=w.l(p);){for(v=Math.max(1,Math.floor(w.m()/p.m())),_=Math.ceil(Math.log(v)/Math.LN2),_=48>=_?1:Math.pow(2,_-48),I=d(v),g=I.j(p);O(g)||0<g.l(w);)v-=_,I=d(v),g=I.j(p);R(I)&&(I=A),E=E.add(I),w=$(w,g)}return new Q(E,w)}s.A=function(w){return ae(this,w).h},s.and=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)&w.i(_);return new a(v,this.h&w.h)},s.or=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)|w.i(_);return new a(v,this.h|w.h)},s.xor=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)^w.i(_);return new a(v,this.h^w.h)};function Ze(w){for(var p=w.g.length+1,v=[],_=0;_<p;_++)v[_]=w.i(_)<<1|w.i(_-1)>>>31;return new a(v,w.h)}function ve(w,p){var v=p>>5;p%=32;for(var _=w.g.length-v,E=[],I=0;I<_;I++)E[I]=0<p?w.i(I+v)>>>p|w.i(I+v+1)<<32-p:w.i(I+v);return new a(E,w.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=m,ra=a}).apply(typeof io<"u"?io:typeof self<"u"?self:typeof window<"u"?window:{});var Mn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ia,Qt,oa,$n,sr,aa,la,ca;(function(){var s,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,l,u){return i==Array.prototype||i==Object.prototype||(i[l]=u.value),i};function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof Mn=="object"&&Mn];for(var l=0;l<i.length;++l){var u=i[l];if(u&&u.Math==Math)return u}throw Error("Cannot find global object")}var n=t(this);function r(i,l){if(l)e:{var u=n;i=i.split(".");for(var f=0;f<i.length-1;f++){var T=i[f];if(!(T in u))break e;u=u[T]}i=i[i.length-1],f=u[i],l=l(f),l!=f&&l!=null&&e(u,i,{configurable:!0,writable:!0,value:l})}}function o(i,l){i instanceof String&&(i+="");var u=0,f=!1,T={next:function(){if(!f&&u<i.length){var b=u++;return{value:l(b,i[b]),done:!1}}return f=!0,{done:!0,value:void 0}}};return T[Symbol.iterator]=function(){return T},T}r("Array.prototype.values",function(i){return i||function(){return o(this,function(l,u){return u})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function h(i){var l=typeof i;return l=l!="object"?l:i?Array.isArray(i)?"array":l:"null",l=="array"||l=="object"&&typeof i.length=="number"}function d(i){var l=typeof i;return l=="object"&&i!=null||l=="function"}function m(i,l,u){return i.call.apply(i.bind,arguments)}function y(i,l,u){if(!i)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var T=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(T,f),i.apply(l,T)}}return function(){return i.apply(l,arguments)}}function A(i,l,u){return A=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?m:y,A.apply(null,arguments)}function S(i,l){var u=Array.prototype.slice.call(arguments,1);return function(){var f=u.slice();return f.push.apply(f,arguments),i.apply(this,f)}}function R(i,l){function u(){}u.prototype=l.prototype,i.aa=l.prototype,i.prototype=new u,i.prototype.constructor=i,i.Qb=function(f,T,b){for(var V=Array(arguments.length-2),j=2;j<arguments.length;j++)V[j-2]=arguments[j];return l.prototype[T].apply(f,V)}}function O(i){const l=i.length;if(0<l){const u=Array(l);for(let f=0;f<l;f++)u[f]=i[f];return u}return[]}function D(i,l){for(let u=1;u<arguments.length;u++){const f=arguments[u];if(h(f)){const T=i.length||0,b=f.length||0;i.length=T+b;for(let V=0;V<b;V++)i[T+V]=f[V]}else i.push(f)}}class ${constructor(l,u){this.i=l,this.j=u,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function U(i){return/^[\s\xa0]*$/.test(i)}function Q(){var i=c.navigator;return i&&(i=i.userAgent)?i:""}function ae(i){return ae[" "](i),i}ae[" "]=function(){};var Ze=Q().indexOf("Gecko")!=-1&&!(Q().toLowerCase().indexOf("webkit")!=-1&&Q().indexOf("Edge")==-1)&&!(Q().indexOf("Trident")!=-1||Q().indexOf("MSIE")!=-1)&&Q().indexOf("Edge")==-1;function ve(i,l,u){for(const f in i)l.call(u,i[f],f,i)}function w(i,l){for(const u in i)l.call(void 0,i[u],u,i)}function p(i){const l={};for(const u in i)l[u]=i[u];return l}const v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function _(i,l){let u,f;for(let T=1;T<arguments.length;T++){f=arguments[T];for(u in f)i[u]=f[u];for(let b=0;b<v.length;b++)u=v[b],Object.prototype.hasOwnProperty.call(f,u)&&(i[u]=f[u])}}function E(i){var l=1;i=i.split(":");const u=[];for(;0<l&&i.length;)u.push(i.shift()),l--;return i.length&&u.push(i.join(":")),u}function I(i){c.setTimeout(()=>{throw i},0)}function g(){var i=ys;let l=null;return i.g&&(l=i.g,i.g=i.g.next,i.g||(i.h=null),l.next=null),l}class Oe{constructor(){this.h=this.g=null}add(l,u){const f=Vt.get();f.set(l,u),this.h?this.h.next=f:this.g=f,this.h=f}}var Vt=new $(()=>new Pl,i=>i.reset());class Pl{constructor(){this.next=this.g=this.h=null}set(l,u){this.h=l,this.g=u,this.next=null}reset(){this.next=this.g=this.h=null}}let Dt,Ot=!1,ys=new Oe,Gr=()=>{const i=c.Promise.resolve(void 0);Dt=()=>{i.then(Cl)}};var Cl=()=>{for(var i;i=g();){try{i.h.call(i.g)}catch(u){I(u)}var l=Vt;l.j(i),100>l.h&&(l.h++,i.next=l.g,l.g=i)}Ot=!1};function Be(){this.s=this.s,this.C=this.C}Be.prototype.s=!1,Be.prototype.ma=function(){this.s||(this.s=!0,this.N())},Be.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function le(i,l){this.type=i,this.g=this.target=l,this.defaultPrevented=!1}le.prototype.h=function(){this.defaultPrevented=!0};var Vl=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var i=!1,l=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const u=()=>{};c.addEventListener("test",u,l),c.removeEventListener("test",u,l)}catch{}return i}();function Lt(i,l){if(le.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var u=this.type=i.type,f=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=l,l=i.relatedTarget){if(Ze){e:{try{ae(l.nodeName);var T=!0;break e}catch{}T=!1}T||(l=null)}}else u=="mouseover"?l=i.fromElement:u=="mouseout"&&(l=i.toElement);this.relatedTarget=l,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Dl[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&Lt.aa.h.call(this)}}R(Lt,le);var Dl={2:"touch",3:"pen",4:"mouse"};Lt.prototype.h=function(){Lt.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var gn="closure_listenable_"+(1e6*Math.random()|0),Ol=0;function Ll(i,l,u,f,T){this.listener=i,this.proxy=null,this.src=l,this.type=u,this.capture=!!f,this.ha=T,this.key=++Ol,this.da=this.fa=!1}function yn(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function vn(i){this.src=i,this.g={},this.h=0}vn.prototype.add=function(i,l,u,f,T){var b=i.toString();i=this.g[b],i||(i=this.g[b]=[],this.h++);var V=_s(i,l,f,T);return-1<V?(l=i[V],u||(l.fa=!1)):(l=new Ll(l,this.src,b,!!f,T),l.fa=u,i.push(l)),l};function vs(i,l){var u=l.type;if(u in i.g){var f=i.g[u],T=Array.prototype.indexOf.call(f,l,void 0),b;(b=0<=T)&&Array.prototype.splice.call(f,T,1),b&&(yn(l),i.g[u].length==0&&(delete i.g[u],i.h--))}}function _s(i,l,u,f){for(var T=0;T<i.length;++T){var b=i[T];if(!b.da&&b.listener==l&&b.capture==!!u&&b.ha==f)return T}return-1}var Es="closure_lm_"+(1e6*Math.random()|0),ws={};function qr(i,l,u,f,T){if(Array.isArray(l)){for(var b=0;b<l.length;b++)qr(i,l[b],u,f,T);return null}return u=Wr(u),i&&i[gn]?i.K(l,u,d(f)?!!f.capture:!1,T):Nl(i,l,u,!1,f,T)}function Nl(i,l,u,f,T,b){if(!l)throw Error("Invalid event type");var V=d(T)?!!T.capture:!!T,j=Is(i);if(j||(i[Es]=j=new vn(i)),u=j.add(l,u,f,V,b),u.proxy)return u;if(f=Ml(),u.proxy=f,f.src=i,f.listener=u,i.addEventListener)Vl||(T=V),T===void 0&&(T=!1),i.addEventListener(l.toString(),f,T);else if(i.attachEvent)i.attachEvent(Kr(l.toString()),f);else if(i.addListener&&i.removeListener)i.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return u}function Ml(){function i(u){return l.call(i.src,i.listener,u)}const l=kl;return i}function Hr(i,l,u,f,T){if(Array.isArray(l))for(var b=0;b<l.length;b++)Hr(i,l[b],u,f,T);else f=d(f)?!!f.capture:!!f,u=Wr(u),i&&i[gn]?(i=i.i,l=String(l).toString(),l in i.g&&(b=i.g[l],u=_s(b,u,f,T),-1<u&&(yn(b[u]),Array.prototype.splice.call(b,u,1),b.length==0&&(delete i.g[l],i.h--)))):i&&(i=Is(i))&&(l=i.g[l.toString()],i=-1,l&&(i=_s(l,u,f,T)),(u=-1<i?l[i]:null)&&Ts(u))}function Ts(i){if(typeof i!="number"&&i&&!i.da){var l=i.src;if(l&&l[gn])vs(l.i,i);else{var u=i.type,f=i.proxy;l.removeEventListener?l.removeEventListener(u,f,i.capture):l.detachEvent?l.detachEvent(Kr(u),f):l.addListener&&l.removeListener&&l.removeListener(f),(u=Is(l))?(vs(u,i),u.h==0&&(u.src=null,l[Es]=null)):yn(i)}}}function Kr(i){return i in ws?ws[i]:ws[i]="on"+i}function kl(i,l){if(i.da)i=!0;else{l=new Lt(l,this);var u=i.listener,f=i.ha||i.src;i.fa&&Ts(i),i=u.call(f,l)}return i}function Is(i){return i=i[Es],i instanceof vn?i:null}var As="__closure_events_fn_"+(1e9*Math.random()>>>0);function Wr(i){return typeof i=="function"?i:(i[As]||(i[As]=function(l){return i.handleEvent(l)}),i[As])}function ce(){Be.call(this),this.i=new vn(this),this.M=this,this.F=null}R(ce,Be),ce.prototype[gn]=!0,ce.prototype.removeEventListener=function(i,l,u,f){Hr(this,i,l,u,f)};function ge(i,l){var u,f=i.F;if(f)for(u=[];f;f=f.F)u.push(f);if(i=i.M,f=l.type||l,typeof l=="string")l=new le(l,i);else if(l instanceof le)l.target=l.target||i;else{var T=l;l=new le(f,i),_(l,T)}if(T=!0,u)for(var b=u.length-1;0<=b;b--){var V=l.g=u[b];T=_n(V,f,!0,l)&&T}if(V=l.g=i,T=_n(V,f,!0,l)&&T,T=_n(V,f,!1,l)&&T,u)for(b=0;b<u.length;b++)V=l.g=u[b],T=_n(V,f,!1,l)&&T}ce.prototype.N=function(){if(ce.aa.N.call(this),this.i){var i=this.i,l;for(l in i.g){for(var u=i.g[l],f=0;f<u.length;f++)yn(u[f]);delete i.g[l],i.h--}}this.F=null},ce.prototype.K=function(i,l,u,f){return this.i.add(String(i),l,!1,u,f)},ce.prototype.L=function(i,l,u,f){return this.i.add(String(i),l,!0,u,f)};function _n(i,l,u,f){if(l=i.i.g[String(l)],!l)return!0;l=l.concat();for(var T=!0,b=0;b<l.length;++b){var V=l[b];if(V&&!V.da&&V.capture==u){var j=V.listener,se=V.ha||V.src;V.fa&&vs(i.i,V),T=j.call(se,f)!==!1&&T}}return T&&!f.defaultPrevented}function Qr(i,l,u){if(typeof i=="function")u&&(i=A(i,u));else if(i&&typeof i.handleEvent=="function")i=A(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(i,l||0)}function Yr(i){i.g=Qr(()=>{i.g=null,i.i&&(i.i=!1,Yr(i))},i.l);const l=i.h;i.h=null,i.m.apply(null,l)}class xl extends Be{constructor(l,u){super(),this.m=l,this.l=u,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Yr(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Nt(i){Be.call(this),this.h=i,this.g={}}R(Nt,Be);var Xr=[];function Jr(i){ve(i.g,function(l,u){this.g.hasOwnProperty(u)&&Ts(l)},i),i.g={}}Nt.prototype.N=function(){Nt.aa.N.call(this),Jr(this)},Nt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var bs=c.JSON.stringify,Fl=c.JSON.parse,Bl=class{stringify(i){return c.JSON.stringify(i,void 0)}parse(i){return c.JSON.parse(i,void 0)}};function Ss(){}Ss.prototype.h=null;function Zr(i){return i.h||(i.h=i.i())}function ei(){}var Mt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Rs(){le.call(this,"d")}R(Rs,le);function Ps(){le.call(this,"c")}R(Ps,le);var et={},ti=null;function En(){return ti=ti||new ce}et.La="serverreachability";function ni(i){le.call(this,et.La,i)}R(ni,le);function kt(i){const l=En();ge(l,new ni(l))}et.STAT_EVENT="statevent";function si(i,l){le.call(this,et.STAT_EVENT,i),this.stat=l}R(si,le);function ye(i){const l=En();ge(l,new si(l,i))}et.Ma="timingevent";function ri(i,l){le.call(this,et.Ma,i),this.size=l}R(ri,le);function xt(i,l){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){i()},l)}function Ft(){this.g=!0}Ft.prototype.xa=function(){this.g=!1};function $l(i,l,u,f,T,b){i.info(function(){if(i.g)if(b)for(var V="",j=b.split("&"),se=0;se<j.length;se++){var B=j[se].split("=");if(1<B.length){var ue=B[0];B=B[1];var he=ue.split("_");V=2<=he.length&&he[1]=="type"?V+(ue+"="+B+"&"):V+(ue+"=redacted&")}}else V=null;else V=b;return"XMLHTTP REQ ("+f+") [attempt "+T+"]: "+l+`
`+u+`
`+V})}function Ul(i,l,u,f,T,b,V){i.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+T+"]: "+l+`
`+u+`
`+b+" "+V})}function yt(i,l,u,f){i.info(function(){return"XMLHTTP TEXT ("+l+"): "+zl(i,u)+(f?" "+f:"")})}function jl(i,l){i.info(function(){return"TIMEOUT: "+l})}Ft.prototype.info=function(){};function zl(i,l){if(!i.g)return l;if(!l)return null;try{var u=JSON.parse(l);if(u){for(i=0;i<u.length;i++)if(Array.isArray(u[i])){var f=u[i];if(!(2>f.length)){var T=f[1];if(Array.isArray(T)&&!(1>T.length)){var b=T[0];if(b!="noop"&&b!="stop"&&b!="close")for(var V=1;V<T.length;V++)T[V]=""}}}}return bs(u)}catch{return l}}var wn={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ii={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Cs;function Tn(){}R(Tn,Ss),Tn.prototype.g=function(){return new XMLHttpRequest},Tn.prototype.i=function(){return{}},Cs=new Tn;function $e(i,l,u,f){this.j=i,this.i=l,this.l=u,this.R=f||1,this.U=new Nt(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new oi}function oi(){this.i=null,this.g="",this.h=!1}var ai={},Vs={};function Ds(i,l,u){i.L=1,i.v=Sn(Le(l)),i.m=u,i.P=!0,li(i,null)}function li(i,l){i.F=Date.now(),In(i),i.A=Le(i.v);var u=i.A,f=i.R;Array.isArray(f)||(f=[String(f)]),Ti(u.i,"t",f),i.C=0,u=i.j.J,i.h=new oi,i.g=$i(i.j,u?l:null,!i.m),0<i.O&&(i.M=new xl(A(i.Y,i,i.g),i.O)),l=i.U,u=i.g,f=i.ca;var T="readystatechange";Array.isArray(T)||(T&&(Xr[0]=T.toString()),T=Xr);for(var b=0;b<T.length;b++){var V=qr(u,T[b],f||l.handleEvent,!1,l.h||l);if(!V)break;l.g[V.key]=V}l=i.H?p(i.H):{},i.m?(i.u||(i.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,l)):(i.u="GET",i.g.ea(i.A,i.u,null,l)),kt(),$l(i.i,i.u,i.A,i.l,i.R,i.m)}$e.prototype.ca=function(i){i=i.target;const l=this.M;l&&Ne(i)==3?l.j():this.Y(i)},$e.prototype.Y=function(i){try{if(i==this.g)e:{const he=Ne(this.g);var l=this.g.Ba();const Et=this.g.Z();if(!(3>he)&&(he!=3||this.g&&(this.h.h||this.g.oa()||Ci(this.g)))){this.J||he!=4||l==7||(l==8||0>=Et?kt(3):kt(2)),Os(this);var u=this.g.Z();this.X=u;t:if(ci(this)){var f=Ci(this.g);i="";var T=f.length,b=Ne(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){tt(this),Bt(this);var V="";break t}this.h.i=new c.TextDecoder}for(l=0;l<T;l++)this.h.h=!0,i+=this.h.i.decode(f[l],{stream:!(b&&l==T-1)});f.length=0,this.h.g+=i,this.C=0,V=this.h.g}else V=this.g.oa();if(this.o=u==200,Ul(this.i,this.u,this.A,this.l,this.R,he,u),this.o){if(this.T&&!this.K){t:{if(this.g){var j,se=this.g;if((j=se.g?se.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!U(j)){var B=j;break t}}B=null}if(u=B)yt(this.i,this.l,u,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ls(this,u);else{this.o=!1,this.s=3,ye(12),tt(this),Bt(this);break e}}if(this.P){u=!0;let Ae;for(;!this.J&&this.C<V.length;)if(Ae=Gl(this,V),Ae==Vs){he==4&&(this.s=4,ye(14),u=!1),yt(this.i,this.l,null,"[Incomplete Response]");break}else if(Ae==ai){this.s=4,ye(15),yt(this.i,this.l,V,"[Invalid Chunk]"),u=!1;break}else yt(this.i,this.l,Ae,null),Ls(this,Ae);if(ci(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),he!=4||V.length!=0||this.h.h||(this.s=1,ye(16),u=!1),this.o=this.o&&u,!u)yt(this.i,this.l,V,"[Invalid Chunked Response]"),tt(this),Bt(this);else if(0<V.length&&!this.W){this.W=!0;var ue=this.j;ue.g==this&&ue.ba&&!ue.M&&(ue.j.info("Great, no buffering proxy detected. Bytes received: "+V.length),Bs(ue),ue.M=!0,ye(11))}}else yt(this.i,this.l,V,null),Ls(this,V);he==4&&tt(this),this.o&&!this.J&&(he==4?ki(this.j,this):(this.o=!1,In(this)))}else ac(this.g),u==400&&0<V.indexOf("Unknown SID")?(this.s=3,ye(12)):(this.s=0,ye(13)),tt(this),Bt(this)}}}catch{}finally{}};function ci(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function Gl(i,l){var u=i.C,f=l.indexOf(`
`,u);return f==-1?Vs:(u=Number(l.substring(u,f)),isNaN(u)?ai:(f+=1,f+u>l.length?Vs:(l=l.slice(f,f+u),i.C=f+u,l)))}$e.prototype.cancel=function(){this.J=!0,tt(this)};function In(i){i.S=Date.now()+i.I,ui(i,i.I)}function ui(i,l){if(i.B!=null)throw Error("WatchDog timer not null");i.B=xt(A(i.ba,i),l)}function Os(i){i.B&&(c.clearTimeout(i.B),i.B=null)}$e.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(jl(this.i,this.A),this.L!=2&&(kt(),ye(17)),tt(this),this.s=2,Bt(this)):ui(this,this.S-i)};function Bt(i){i.j.G==0||i.J||ki(i.j,i)}function tt(i){Os(i);var l=i.M;l&&typeof l.ma=="function"&&l.ma(),i.M=null,Jr(i.U),i.g&&(l=i.g,i.g=null,l.abort(),l.ma())}function Ls(i,l){try{var u=i.j;if(u.G!=0&&(u.g==i||Ns(u.h,i))){if(!i.K&&Ns(u.h,i)&&u.G==3){try{var f=u.Da.g.parse(l)}catch{f=null}if(Array.isArray(f)&&f.length==3){var T=f;if(T[0]==0){e:if(!u.u){if(u.g)if(u.g.F+3e3<i.F)On(u),Vn(u);else break e;Fs(u),ye(18)}}else u.za=T[1],0<u.za-u.T&&37500>T[2]&&u.F&&u.v==0&&!u.C&&(u.C=xt(A(u.Za,u),6e3));if(1>=fi(u.h)&&u.ca){try{u.ca()}catch{}u.ca=void 0}}else st(u,11)}else if((i.K||u.g==i)&&On(u),!U(l))for(T=u.Da.g.parse(l),l=0;l<T.length;l++){let B=T[l];if(u.T=B[0],B=B[1],u.G==2)if(B[0]=="c"){u.K=B[1],u.ia=B[2];const ue=B[3];ue!=null&&(u.la=ue,u.j.info("VER="+u.la));const he=B[4];he!=null&&(u.Aa=he,u.j.info("SVER="+u.Aa));const Et=B[5];Et!=null&&typeof Et=="number"&&0<Et&&(f=1.5*Et,u.L=f,u.j.info("backChannelRequestTimeoutMs_="+f)),f=u;const Ae=i.g;if(Ae){const Nn=Ae.g?Ae.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Nn){var b=f.h;b.g||Nn.indexOf("spdy")==-1&&Nn.indexOf("quic")==-1&&Nn.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Ms(b,b.h),b.h=null))}if(f.D){const $s=Ae.g?Ae.g.getResponseHeader("X-HTTP-Session-Id"):null;$s&&(f.ya=$s,q(f.I,f.D,$s))}}u.G=3,u.l&&u.l.ua(),u.ba&&(u.R=Date.now()-i.F,u.j.info("Handshake RTT: "+u.R+"ms")),f=u;var V=i;if(f.qa=Bi(f,f.J?f.ia:null,f.W),V.K){mi(f.h,V);var j=V,se=f.L;se&&(j.I=se),j.B&&(Os(j),In(j)),f.g=V}else Ni(f);0<u.i.length&&Dn(u)}else B[0]!="stop"&&B[0]!="close"||st(u,7);else u.G==3&&(B[0]=="stop"||B[0]=="close"?B[0]=="stop"?st(u,7):xs(u):B[0]!="noop"&&u.l&&u.l.ta(B),u.v=0)}}kt(4)}catch{}}var ql=class{constructor(i,l){this.g=i,this.map=l}};function hi(i){this.l=i||10,c.PerformanceNavigationTiming?(i=c.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function di(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function fi(i){return i.h?1:i.g?i.g.size:0}function Ns(i,l){return i.h?i.h==l:i.g?i.g.has(l):!1}function Ms(i,l){i.g?i.g.add(l):i.h=l}function mi(i,l){i.h&&i.h==l?i.h=null:i.g&&i.g.has(l)&&i.g.delete(l)}hi.prototype.cancel=function(){if(this.i=pi(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function pi(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let l=i.i;for(const u of i.g.values())l=l.concat(u.D);return l}return O(i.i)}function Hl(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(h(i)){for(var l=[],u=i.length,f=0;f<u;f++)l.push(i[f]);return l}l=[],u=0;for(f in i)l[u++]=i[f];return l}function Kl(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(h(i)||typeof i=="string"){var l=[];i=i.length;for(var u=0;u<i;u++)l.push(u);return l}l=[],u=0;for(const f in i)l[u++]=f;return l}}}function gi(i,l){if(i.forEach&&typeof i.forEach=="function")i.forEach(l,void 0);else if(h(i)||typeof i=="string")Array.prototype.forEach.call(i,l,void 0);else for(var u=Kl(i),f=Hl(i),T=f.length,b=0;b<T;b++)l.call(void 0,f[b],u&&u[b],i)}var yi=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Wl(i,l){if(i){i=i.split("&");for(var u=0;u<i.length;u++){var f=i[u].indexOf("="),T=null;if(0<=f){var b=i[u].substring(0,f);T=i[u].substring(f+1)}else b=i[u];l(b,T?decodeURIComponent(T.replace(/\+/g," ")):"")}}}function nt(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof nt){this.h=i.h,An(this,i.j),this.o=i.o,this.g=i.g,bn(this,i.s),this.l=i.l;var l=i.i,u=new jt;u.i=l.i,l.g&&(u.g=new Map(l.g),u.h=l.h),vi(this,u),this.m=i.m}else i&&(l=String(i).match(yi))?(this.h=!1,An(this,l[1]||"",!0),this.o=$t(l[2]||""),this.g=$t(l[3]||"",!0),bn(this,l[4]),this.l=$t(l[5]||"",!0),vi(this,l[6]||"",!0),this.m=$t(l[7]||"")):(this.h=!1,this.i=new jt(null,this.h))}nt.prototype.toString=function(){var i=[],l=this.j;l&&i.push(Ut(l,_i,!0),":");var u=this.g;return(u||l=="file")&&(i.push("//"),(l=this.o)&&i.push(Ut(l,_i,!0),"@"),i.push(encodeURIComponent(String(u)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u=this.s,u!=null&&i.push(":",String(u))),(u=this.l)&&(this.g&&u.charAt(0)!="/"&&i.push("/"),i.push(Ut(u,u.charAt(0)=="/"?Xl:Yl,!0))),(u=this.i.toString())&&i.push("?",u),(u=this.m)&&i.push("#",Ut(u,Zl)),i.join("")};function Le(i){return new nt(i)}function An(i,l,u){i.j=u?$t(l,!0):l,i.j&&(i.j=i.j.replace(/:$/,""))}function bn(i,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);i.s=l}else i.s=null}function vi(i,l,u){l instanceof jt?(i.i=l,ec(i.i,i.h)):(u||(l=Ut(l,Jl)),i.i=new jt(l,i.h))}function q(i,l,u){i.i.set(l,u)}function Sn(i){return q(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function $t(i,l){return i?l?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Ut(i,l,u){return typeof i=="string"?(i=encodeURI(i).replace(l,Ql),u&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function Ql(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var _i=/[#\/\?@]/g,Yl=/[#\?:]/g,Xl=/[#\?]/g,Jl=/[#\?@]/g,Zl=/#/g;function jt(i,l){this.h=this.g=null,this.i=i||null,this.j=!!l}function Ue(i){i.g||(i.g=new Map,i.h=0,i.i&&Wl(i.i,function(l,u){i.add(decodeURIComponent(l.replace(/\+/g," ")),u)}))}s=jt.prototype,s.add=function(i,l){Ue(this),this.i=null,i=vt(this,i);var u=this.g.get(i);return u||this.g.set(i,u=[]),u.push(l),this.h+=1,this};function Ei(i,l){Ue(i),l=vt(i,l),i.g.has(l)&&(i.i=null,i.h-=i.g.get(l).length,i.g.delete(l))}function wi(i,l){return Ue(i),l=vt(i,l),i.g.has(l)}s.forEach=function(i,l){Ue(this),this.g.forEach(function(u,f){u.forEach(function(T){i.call(l,T,f,this)},this)},this)},s.na=function(){Ue(this);const i=Array.from(this.g.values()),l=Array.from(this.g.keys()),u=[];for(let f=0;f<l.length;f++){const T=i[f];for(let b=0;b<T.length;b++)u.push(l[f])}return u},s.V=function(i){Ue(this);let l=[];if(typeof i=="string")wi(this,i)&&(l=l.concat(this.g.get(vt(this,i))));else{i=Array.from(this.g.values());for(let u=0;u<i.length;u++)l=l.concat(i[u])}return l},s.set=function(i,l){return Ue(this),this.i=null,i=vt(this,i),wi(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[l]),this.h+=1,this},s.get=function(i,l){return i?(i=this.V(i),0<i.length?String(i[0]):l):l};function Ti(i,l,u){Ei(i,l),0<u.length&&(i.i=null,i.g.set(vt(i,l),O(u)),i.h+=u.length)}s.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],l=Array.from(this.g.keys());for(var u=0;u<l.length;u++){var f=l[u];const b=encodeURIComponent(String(f)),V=this.V(f);for(f=0;f<V.length;f++){var T=b;V[f]!==""&&(T+="="+encodeURIComponent(String(V[f]))),i.push(T)}}return this.i=i.join("&")};function vt(i,l){return l=String(l),i.j&&(l=l.toLowerCase()),l}function ec(i,l){l&&!i.j&&(Ue(i),i.i=null,i.g.forEach(function(u,f){var T=f.toLowerCase();f!=T&&(Ei(this,f),Ti(this,T,u))},i)),i.j=l}function tc(i,l){const u=new Ft;if(c.Image){const f=new Image;f.onload=S(je,u,"TestLoadImage: loaded",!0,l,f),f.onerror=S(je,u,"TestLoadImage: error",!1,l,f),f.onabort=S(je,u,"TestLoadImage: abort",!1,l,f),f.ontimeout=S(je,u,"TestLoadImage: timeout",!1,l,f),c.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=i}else l(!1)}function nc(i,l){const u=new Ft,f=new AbortController,T=setTimeout(()=>{f.abort(),je(u,"TestPingServer: timeout",!1,l)},1e4);fetch(i,{signal:f.signal}).then(b=>{clearTimeout(T),b.ok?je(u,"TestPingServer: ok",!0,l):je(u,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(T),je(u,"TestPingServer: error",!1,l)})}function je(i,l,u,f,T){try{T&&(T.onload=null,T.onerror=null,T.onabort=null,T.ontimeout=null),f(u)}catch{}}function sc(){this.g=new Bl}function rc(i,l,u){const f=u||"";try{gi(i,function(T,b){let V=T;d(T)&&(V=bs(T)),l.push(f+b+"="+encodeURIComponent(V))})}catch(T){throw l.push(f+"type="+encodeURIComponent("_badmap")),T}}function Rn(i){this.l=i.Ub||null,this.j=i.eb||!1}R(Rn,Ss),Rn.prototype.g=function(){return new Pn(this.l,this.j)},Rn.prototype.i=function(i){return function(){return i}}({});function Pn(i,l){ce.call(this),this.D=i,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}R(Pn,ce),s=Pn.prototype,s.open=function(i,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=l,this.readyState=1,Gt(this)},s.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(l.body=i),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},s.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,zt(this)),this.readyState=0},s.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Gt(this)),this.g&&(this.readyState=3,Gt(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Ii(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function Ii(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}s.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var l=i.value?i.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!i.done}))&&(this.response=this.responseText+=l)}i.done?zt(this):Gt(this),this.readyState==3&&Ii(this)}},s.Ra=function(i){this.g&&(this.response=this.responseText=i,zt(this))},s.Qa=function(i){this.g&&(this.response=i,zt(this))},s.ga=function(){this.g&&zt(this)};function zt(i){i.readyState=4,i.l=null,i.j=null,i.v=null,Gt(i)}s.setRequestHeader=function(i,l){this.u.append(i,l)},s.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},s.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],l=this.h.entries();for(var u=l.next();!u.done;)u=u.value,i.push(u[0]+": "+u[1]),u=l.next();return i.join(`\r
`)};function Gt(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(Pn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function Ai(i){let l="";return ve(i,function(u,f){l+=f,l+=":",l+=u,l+=`\r
`}),l}function ks(i,l,u){e:{for(f in u){var f=!1;break e}f=!0}f||(u=Ai(u),typeof i=="string"?u!=null&&encodeURIComponent(String(u)):q(i,l,u))}function K(i){ce.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}R(K,ce);var ic=/^https?$/i,oc=["POST","PUT"];s=K.prototype,s.Ha=function(i){this.J=i},s.ea=function(i,l,u,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);l=l?l.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Cs.g(),this.v=this.o?Zr(this.o):Zr(Cs),this.g.onreadystatechange=A(this.Ea,this);try{this.B=!0,this.g.open(l,String(i),!0),this.B=!1}catch(b){bi(this,b);return}if(i=u||"",u=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var T in f)u.set(T,f[T]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const b of f.keys())u.set(b,f.get(b));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(u.keys()).find(b=>b.toLowerCase()=="content-type"),T=c.FormData&&i instanceof c.FormData,!(0<=Array.prototype.indexOf.call(oc,l,void 0))||f||T||u.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,V]of u)this.g.setRequestHeader(b,V);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Pi(this),this.u=!0,this.g.send(i),this.u=!1}catch(b){bi(this,b)}};function bi(i,l){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=l,i.m=5,Si(i),Cn(i)}function Si(i){i.A||(i.A=!0,ge(i,"complete"),ge(i,"error"))}s.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,ge(this,"complete"),ge(this,"abort"),Cn(this))},s.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Cn(this,!0)),K.aa.N.call(this)},s.Ea=function(){this.s||(this.B||this.u||this.j?Ri(this):this.bb())},s.bb=function(){Ri(this)};function Ri(i){if(i.h&&typeof a<"u"&&(!i.v[1]||Ne(i)!=4||i.Z()!=2)){if(i.u&&Ne(i)==4)Qr(i.Ea,0,i);else if(ge(i,"readystatechange"),Ne(i)==4){i.h=!1;try{const V=i.Z();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var u;if(!(u=l)){var f;if(f=V===0){var T=String(i.D).match(yi)[1]||null;!T&&c.self&&c.self.location&&(T=c.self.location.protocol.slice(0,-1)),f=!ic.test(T?T.toLowerCase():"")}u=f}if(u)ge(i,"complete"),ge(i,"success");else{i.m=6;try{var b=2<Ne(i)?i.g.statusText:""}catch{b=""}i.l=b+" ["+i.Z()+"]",Si(i)}}finally{Cn(i)}}}}function Cn(i,l){if(i.g){Pi(i);const u=i.g,f=i.v[0]?()=>{}:null;i.g=null,i.v=null,l||ge(i,"ready");try{u.onreadystatechange=f}catch{}}}function Pi(i){i.I&&(c.clearTimeout(i.I),i.I=null)}s.isActive=function(){return!!this.g};function Ne(i){return i.g?i.g.readyState:0}s.Z=function(){try{return 2<Ne(this)?this.g.status:-1}catch{return-1}},s.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},s.Oa=function(i){if(this.g){var l=this.g.responseText;return i&&l.indexOf(i)==0&&(l=l.substring(i.length)),Fl(l)}};function Ci(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function ac(i){const l={};i=(i.g&&2<=Ne(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<i.length;f++){if(U(i[f]))continue;var u=E(i[f]);const T=u[0];if(u=u[1],typeof u!="string")continue;u=u.trim();const b=l[T]||[];l[T]=b,b.push(u)}w(l,function(f){return f.join(", ")})}s.Ba=function(){return this.m},s.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function qt(i,l,u){return u&&u.internalChannelParams&&u.internalChannelParams[i]||l}function Vi(i){this.Aa=0,this.i=[],this.j=new Ft,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=qt("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=qt("baseRetryDelayMs",5e3,i),this.cb=qt("retryDelaySeedMs",1e4,i),this.Wa=qt("forwardChannelMaxRetries",2,i),this.wa=qt("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new hi(i&&i.concurrentRequestLimit),this.Da=new sc,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}s=Vi.prototype,s.la=8,s.G=1,s.connect=function(i,l,u,f){ye(0),this.W=i,this.H=l||{},u&&f!==void 0&&(this.H.OSID=u,this.H.OAID=f),this.F=this.X,this.I=Bi(this,null,this.W),Dn(this)};function xs(i){if(Di(i),i.G==3){var l=i.U++,u=Le(i.I);if(q(u,"SID",i.K),q(u,"RID",l),q(u,"TYPE","terminate"),Ht(i,u),l=new $e(i,i.j,l),l.L=2,l.v=Sn(Le(u)),u=!1,c.navigator&&c.navigator.sendBeacon)try{u=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!u&&c.Image&&(new Image().src=l.v,u=!0),u||(l.g=$i(l.j,null),l.g.ea(l.v)),l.F=Date.now(),In(l)}Fi(i)}function Vn(i){i.g&&(Bs(i),i.g.cancel(),i.g=null)}function Di(i){Vn(i),i.u&&(c.clearTimeout(i.u),i.u=null),On(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&c.clearTimeout(i.s),i.s=null)}function Dn(i){if(!di(i.h)&&!i.s){i.s=!0;var l=i.Ga;Dt||Gr(),Ot||(Dt(),Ot=!0),ys.add(l,i),i.B=0}}function lc(i,l){return fi(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=l.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=xt(A(i.Ga,i,l),xi(i,i.B)),i.B++,!0)}s.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const T=new $e(this,this.j,i);let b=this.o;if(this.S&&(b?(b=p(b),_(b,this.S)):b=this.S),this.m!==null||this.O||(T.H=b,b=null),this.P)e:{for(var l=0,u=0;u<this.i.length;u++){t:{var f=this.i[u];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(l+=f,4096<l){l=u;break e}if(l===4096||u===this.i.length-1){l=u+1;break e}}l=1e3}else l=1e3;l=Li(this,T,l),u=Le(this.I),q(u,"RID",i),q(u,"CVER",22),this.D&&q(u,"X-HTTP-Session-Id",this.D),Ht(this,u),b&&(this.O?l="headers="+encodeURIComponent(String(Ai(b)))+"&"+l:this.m&&ks(u,this.m,b)),Ms(this.h,T),this.Ua&&q(u,"TYPE","init"),this.P?(q(u,"$req",l),q(u,"SID","null"),T.T=!0,Ds(T,u,null)):Ds(T,u,l),this.G=2}}else this.G==3&&(i?Oi(this,i):this.i.length==0||di(this.h)||Oi(this))};function Oi(i,l){var u;l?u=l.l:u=i.U++;const f=Le(i.I);q(f,"SID",i.K),q(f,"RID",u),q(f,"AID",i.T),Ht(i,f),i.m&&i.o&&ks(f,i.m,i.o),u=new $e(i,i.j,u,i.B+1),i.m===null&&(u.H=i.o),l&&(i.i=l.D.concat(i.i)),l=Li(i,u,1e3),u.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),Ms(i.h,u),Ds(u,f,l)}function Ht(i,l){i.H&&ve(i.H,function(u,f){q(l,f,u)}),i.l&&gi({},function(u,f){q(l,f,u)})}function Li(i,l,u){u=Math.min(i.i.length,u);var f=i.l?A(i.l.Na,i.l,i):null;e:{var T=i.i;let b=-1;for(;;){const V=["count="+u];b==-1?0<u?(b=T[0].g,V.push("ofs="+b)):b=0:V.push("ofs="+b);let j=!0;for(let se=0;se<u;se++){let B=T[se].g;const ue=T[se].map;if(B-=b,0>B)b=Math.max(0,T[se].g-100),j=!1;else try{rc(ue,V,"req"+B+"_")}catch{f&&f(ue)}}if(j){f=V.join("&");break e}}}return i=i.i.splice(0,u),l.D=i,f}function Ni(i){if(!i.g&&!i.u){i.Y=1;var l=i.Fa;Dt||Gr(),Ot||(Dt(),Ot=!0),ys.add(l,i),i.v=0}}function Fs(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=xt(A(i.Fa,i),xi(i,i.v)),i.v++,!0)}s.Fa=function(){if(this.u=null,Mi(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=xt(A(this.ab,this),i)}},s.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ye(10),Vn(this),Mi(this))};function Bs(i){i.A!=null&&(c.clearTimeout(i.A),i.A=null)}function Mi(i){i.g=new $e(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var l=Le(i.qa);q(l,"RID","rpc"),q(l,"SID",i.K),q(l,"AID",i.T),q(l,"CI",i.F?"0":"1"),!i.F&&i.ja&&q(l,"TO",i.ja),q(l,"TYPE","xmlhttp"),Ht(i,l),i.m&&i.o&&ks(l,i.m,i.o),i.L&&(i.g.I=i.L);var u=i.g;i=i.ia,u.L=1,u.v=Sn(Le(l)),u.m=null,u.P=!0,li(u,i)}s.Za=function(){this.C!=null&&(this.C=null,Vn(this),Fs(this),ye(19))};function On(i){i.C!=null&&(c.clearTimeout(i.C),i.C=null)}function ki(i,l){var u=null;if(i.g==l){On(i),Bs(i),i.g=null;var f=2}else if(Ns(i.h,l))u=l.D,mi(i.h,l),f=1;else return;if(i.G!=0){if(l.o)if(f==1){u=l.m?l.m.length:0,l=Date.now()-l.F;var T=i.B;f=En(),ge(f,new ri(f,u)),Dn(i)}else Ni(i);else if(T=l.s,T==3||T==0&&0<l.X||!(f==1&&lc(i,l)||f==2&&Fs(i)))switch(u&&0<u.length&&(l=i.h,l.i=l.i.concat(u)),T){case 1:st(i,5);break;case 4:st(i,10);break;case 3:st(i,6);break;default:st(i,2)}}}function xi(i,l){let u=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(u*=2),u*l}function st(i,l){if(i.j.info("Error code "+l),l==2){var u=A(i.fb,i),f=i.Xa;const T=!f;f=new nt(f||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||An(f,"https"),Sn(f),T?tc(f.toString(),u):nc(f.toString(),u)}else ye(2);i.G=0,i.l&&i.l.sa(l),Fi(i),Di(i)}s.fb=function(i){i?(this.j.info("Successfully pinged google.com"),ye(2)):(this.j.info("Failed to ping google.com"),ye(1))};function Fi(i){if(i.G=0,i.ka=[],i.l){const l=pi(i.h);(l.length!=0||i.i.length!=0)&&(D(i.ka,l),D(i.ka,i.i),i.h.i.length=0,O(i.i),i.i.length=0),i.l.ra()}}function Bi(i,l,u){var f=u instanceof nt?Le(u):new nt(u);if(f.g!="")l&&(f.g=l+"."+f.g),bn(f,f.s);else{var T=c.location;f=T.protocol,l=l?l+"."+T.hostname:T.hostname,T=+T.port;var b=new nt(null);f&&An(b,f),l&&(b.g=l),T&&bn(b,T),u&&(b.l=u),f=b}return u=i.D,l=i.ya,u&&l&&q(f,u,l),q(f,"VER",i.la),Ht(i,f),f}function $i(i,l,u){if(l&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=i.Ca&&!i.pa?new K(new Rn({eb:u})):new K(i.pa),l.Ha(i.J),l}s.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ui(){}s=Ui.prototype,s.ua=function(){},s.ta=function(){},s.sa=function(){},s.ra=function(){},s.isActive=function(){return!0},s.Na=function(){};function Ln(){}Ln.prototype.g=function(i,l){return new we(i,l)};function we(i,l){ce.call(this),this.g=new Vi(l),this.l=i,this.h=l&&l.messageUrlParams||null,i=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(i?i["X-WebChannel-Content-Type"]=l.messageContentType:i={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(i?i["X-WebChannel-Client-Profile"]=l.va:i={"X-WebChannel-Client-Profile":l.va}),this.g.S=i,(i=l&&l.Sb)&&!U(i)&&(this.g.m=i),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!U(l)&&(this.g.D=l,i=this.h,i!==null&&l in i&&(i=this.h,l in i&&delete i[l])),this.j=new _t(this)}R(we,ce),we.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},we.prototype.close=function(){xs(this.g)},we.prototype.o=function(i){var l=this.g;if(typeof i=="string"){var u={};u.__data__=i,i=u}else this.u&&(u={},u.__data__=bs(i),i=u);l.i.push(new ql(l.Ya++,i)),l.G==3&&Dn(l)},we.prototype.N=function(){this.g.l=null,delete this.j,xs(this.g),delete this.g,we.aa.N.call(this)};function ji(i){Rs.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var l=i.__sm__;if(l){e:{for(const u in l){i=u;break e}i=void 0}(this.i=i)&&(i=this.i,l=l!==null&&i in l?l[i]:void 0),this.data=l}else this.data=i}R(ji,Rs);function zi(){Ps.call(this),this.status=1}R(zi,Ps);function _t(i){this.g=i}R(_t,Ui),_t.prototype.ua=function(){ge(this.g,"a")},_t.prototype.ta=function(i){ge(this.g,new ji(i))},_t.prototype.sa=function(i){ge(this.g,new zi)},_t.prototype.ra=function(){ge(this.g,"b")},Ln.prototype.createWebChannel=Ln.prototype.g,we.prototype.send=we.prototype.o,we.prototype.open=we.prototype.m,we.prototype.close=we.prototype.close,ca=function(){return new Ln},la=function(){return En()},aa=et,sr={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},wn.NO_ERROR=0,wn.TIMEOUT=8,wn.HTTP_ERROR=6,$n=wn,ii.COMPLETE="complete",oa=ii,ei.EventType=Mt,Mt.OPEN="a",Mt.CLOSE="b",Mt.ERROR="c",Mt.MESSAGE="d",ce.prototype.listen=ce.prototype.K,Qt=ei,K.prototype.listenOnce=K.prototype.L,K.prototype.getLastError=K.prototype.Ka,K.prototype.getLastErrorCode=K.prototype.Ba,K.prototype.getStatus=K.prototype.Z,K.prototype.getResponseJson=K.prototype.Oa,K.prototype.getResponseText=K.prototype.oa,K.prototype.send=K.prototype.ea,K.prototype.setWithCredentials=K.prototype.Ha,ia=K}).apply(typeof Mn<"u"?Mn:typeof self<"u"?self:typeof window<"u"?window:{});const oo="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}fe.UNAUTHENTICATED=new fe(null),fe.GOOGLE_CREDENTIALS=new fe("google-credentials-uid"),fe.FIRST_PARTY=new fe("first-party-uid"),fe.MOCK_USER=new fe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Pt="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ht=new yr("@firebase/firestore");function Kt(){return ht.logLevel}function L(s,...e){if(ht.logLevel<=F.DEBUG){const t=e.map(_r);ht.debug(`Firestore (${Pt}): ${s}`,...t)}}function dt(s,...e){if(ht.logLevel<=F.ERROR){const t=e.map(_r);ht.error(`Firestore (${Pt}): ${s}`,...t)}}function Hn(s,...e){if(ht.logLevel<=F.WARN){const t=e.map(_r);ht.warn(`Firestore (${Pt}): ${s}`,...t)}}function _r(s){if(typeof s=="string")return s;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(s)}catch{return s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(s="Unexpected state"){const e=`FIRESTORE (${Pt}) INTERNAL ASSERTION FAILED: `+s;throw dt(e),new Error(e)}function Y(s,e){s||k()}function G(s,e){return s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends Je{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class th{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(fe.UNAUTHENTICATED))}shutdown(){}}class nh{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class sh{constructor(e){this.t=e,this.currentUser=fe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Y(this.o===void 0);let n=this.i;const r=h=>this.i!==n?(n=this.i,t(h)):Promise.resolve();let o=new lt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new lt,e.enqueueRetryable(()=>r(this.currentUser))};const a=()=>{const h=o;e.enqueueRetryable(async()=>{await h.promise,await r(this.currentUser)})},c=h=>{L("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(h=>c(h)),setTimeout(()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?c(h):(L("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new lt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(n=>this.i!==e?(L("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(Y(typeof n.accessToken=="string"),new ua(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Y(e===null||typeof e=="string"),new fe(e)}}class rh{constructor(e,t,n){this.l=e,this.h=t,this.P=n,this.type="FirstParty",this.user=fe.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class ih{constructor(e,t,n){this.l=e,this.h=t,this.P=n}getToken(){return Promise.resolve(new rh(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(fe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class oh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ah{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Y(this.o===void 0);const n=o=>{o.error!=null&&L("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.R;return this.R=o.token,L("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>n(o))};const r=o=>{L("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>r(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?r(o):L("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Y(typeof t.token=="string"),this.R=t.token,new oh(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lh(s){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(s);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<s;n++)t[n]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ha{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let n="";for(;n.length<20;){const r=lh(40);for(let o=0;o<r.length;++o)n.length<20&&r[o]<t&&(n+=e.charAt(r[o]%e.length))}return n}}function z(s,e){return s<e?-1:s>e?1:0}function It(s,e,t){return s.length===e.length&&s.every((n,r)=>t(n,e[r]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return ne.fromMillis(Date.now())}static fromDate(e){return ne.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor(1e6*(e-1e3*t));return new ne(t,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?z(this.nanoseconds,e.nanoseconds):z(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{constructor(e){this.timestamp=e}static fromTimestamp(e){return new H(e)}static min(){return new H(new ne(0,0))}static max(){return new H(new ne(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e,t,n){t===void 0?t=0:t>e.length&&k(),n===void 0?n=e.length-t:n>e.length-t&&k(),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return sn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof sn?e.forEach(n=>{t.push(n)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const o=e.get(r),a=t.get(r);if(o<a)return-1;if(o>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class W extends sn{construct(e,t,n){return new W(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new N(C.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(r=>r.length>0))}return new W(t)}static emptyPath(){return new W([])}}const ch=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class oe extends sn{construct(e,t,n){return new oe(e,t,n)}static isValidIdentifier(e){return ch.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),oe.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new oe(["__name__"])}static fromServerFormat(e){const t=[];let n="",r=0;const o=()=>{if(n.length===0)throw new N(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let a=!1;for(;r<e.length;){const c=e[r];if(c==="\\"){if(r+1===e.length)throw new N(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const h=e[r+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new N(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=h,r+=2}else c==="`"?(a=!a,r++):c!=="."||a?(n+=c,r++):(o(),r++)}if(o(),a)throw new N(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new oe(t)}static emptyPath(){return new oe([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(e){this.path=e}static fromPath(e){return new M(W.fromString(e))}static fromName(e){return new M(W.fromString(e).popFirst(5))}static empty(){return new M(W.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&W.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return W.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new M(new W(e.slice()))}}function uh(s,e){const t=s.toTimestamp().seconds,n=s.toTimestamp().nanoseconds+1,r=H.fromTimestamp(n===1e9?new ne(t+1,0):new ne(t,n));return new Qe(r,M.empty(),e)}function hh(s){return new Qe(s.readTime,s.key,-1)}class Qe{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Qe(H.min(),M.empty(),-1)}static max(){return new Qe(H.max(),M.empty(),-1)}}function dh(s,e){let t=s.readTime.compareTo(e.readTime);return t!==0?t:(t=M.comparator(s.documentKey,e.documentKey),t!==0?t:z(s.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class mh{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function da(s){if(s.code!==C.FAILED_PRECONDITION||s.message!==fh)throw s;L("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&k(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P((n,r)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(n,r)},this.catchCallback=o=>{this.wrapFailure(t,o).next(n,r)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):P.reject(t)}static resolve(e){return new P((t,n)=>{t(e)})}static reject(e){return new P((t,n)=>{n(e)})}static waitFor(e){return new P((t,n)=>{let r=0,o=0,a=!1;e.forEach(c=>{++r,c.next(()=>{++o,a&&o===r&&t()},h=>n(h))}),a=!0,o===r&&t()})}static or(e){let t=P.resolve(!1);for(const n of e)t=t.next(r=>r?P.resolve(r):n());return t}static forEach(e,t){const n=[];return e.forEach((r,o)=>{n.push(t.call(this,r,o))}),this.waitFor(n)}static mapArray(e,t){return new P((n,r)=>{const o=e.length,a=new Array(o);let c=0;for(let h=0;h<o;h++){const d=h;t(e[d]).next(m=>{a[d]=m,++c,c===o&&n(a)},m=>r(m))}})}static doWhile(e,t){return new P((n,r)=>{const o=()=>{e()===!0?t().next(()=>{o()},r):n()};o()})}}function ph(s){const e=s.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function os(s){return s.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ie(n),this.se=n=>t.writeSequenceNumber(n))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}fa.oe=-1;function Er(s){return s==null}function Kn(s){return s===0&&1/s==-1/0}function gh(s){return typeof s=="number"&&Number.isInteger(s)&&!Kn(s)&&s<=Number.MAX_SAFE_INTEGER&&s>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ao(s){let e=0;for(const t in s)Object.prototype.hasOwnProperty.call(s,t)&&e++;return e}function dn(s,e){for(const t in s)Object.prototype.hasOwnProperty.call(s,t)&&e(t,s[t])}function ma(s){for(const e in s)if(Object.prototype.hasOwnProperty.call(s,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e,t){this.comparator=e,this.root=t||re.EMPTY}insert(e,t){return new Ee(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,re.BLACK,null,null))}remove(e){return new Ee(this.comparator,this.root.remove(e,this.comparator).copy(null,null,re.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return t+n.left.size;r<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new kn(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new kn(this.root,e,this.comparator,!1)}getReverseIterator(){return new kn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new kn(this.root,e,this.comparator,!0)}}class kn{constructor(e,t,n,r){this.isReverse=r,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?n(e.key,t):1,t&&r&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class re{constructor(e,t,n,r,o){this.key=e,this.value=t,this.color=n??re.RED,this.left=r??re.EMPTY,this.right=o??re.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,r,o){return new re(e??this.key,t??this.value,n??this.color,r??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const o=n(e,r.key);return r=o<0?r.copy(null,null,null,r.left.insert(e,t,n),null):o===0?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return re.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),t(e,r.key)===0){if(r.right.isEmpty())return re.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,re.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,re.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw k();const e=this.left.check();if(e!==this.right.check())throw k();return e+(this.isRed()?0:1)}}re.EMPTY=null,re.RED=!0,re.BLACK=!1;re.EMPTY=new class{constructor(){this.size=0}get key(){throw k()}get value(){throw k()}get color(){throw k()}get left(){throw k()}get right(){throw k()}copy(e,t,n,r,o){return this}insert(e,t,n){return new re(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{constructor(e){this.comparator=e,this.data=new Ee(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new lo(this.data.getIterator())}getIteratorFrom(e){return new lo(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(n=>{t=t.add(n)}),t}isEqual(e){if(!(e instanceof pe)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const r=t.getNext().key,o=n.getNext().key;if(this.comparator(r,o)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new pe(this.comparator);return t.data=e,t}}class lo{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Re{constructor(e){this.fields=e,e.sort(oe.comparator)}static empty(){return new Re([])}unionWith(e){let t=new pe(oe.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Re(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return It(this.fields,e.fields,(t,n)=>t.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(r){try{return atob(r)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new yh("Invalid base64 string: "+o):o}}(e);return new Ve(t)}static fromUint8Array(e){const t=function(r){let o="";for(let a=0;a<r.length;++a)o+=String.fromCharCode(r[a]);return o}(e);return new Ve(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const n=new Uint8Array(t.length);for(let r=0;r<t.length;r++)n[r]=t.charCodeAt(r);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return z(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ve.EMPTY_BYTE_STRING=new Ve("");const vh=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ft(s){if(Y(!!s),typeof s=="string"){let e=0;const t=vh.exec(s);if(Y(!!t),t[1]){let r=t[1];r=(r+"000000000").substr(0,9),e=Number(r)}const n=new Date(s);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ie(s.seconds),nanos:ie(s.nanos)}}function ie(s){return typeof s=="number"?s:typeof s=="string"?Number(s):0}function rn(s){return typeof s=="string"?Ve.fromBase64String(s):Ve.fromUint8Array(s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(s){var e,t;return((t=(((e=s==null?void 0:s.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function pa(s){const e=s.mapValue.fields.__previous_value__;return wr(e)?pa(e):e}function Wn(s){const e=ft(s.mapValue.fields.__local_write_time__.timestampValue);return new ne(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h{constructor(e,t,n,r,o,a,c,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=r,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=h,this.useFetchStreams=d}}class Qn{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Qn("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Qn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xn={mapValue:{}};function At(s){return"nullValue"in s?0:"booleanValue"in s?1:"integerValue"in s||"doubleValue"in s?2:"timestampValue"in s?3:"stringValue"in s?5:"bytesValue"in s?6:"referenceValue"in s?7:"geoPointValue"in s?8:"arrayValue"in s?9:"mapValue"in s?wr(s)?4:wh(s)?9007199254740991:Eh(s)?10:11:k()}function De(s,e){if(s===e)return!0;const t=At(s);if(t!==At(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return s.booleanValue===e.booleanValue;case 4:return Wn(s).isEqual(Wn(e));case 3:return function(r,o){if(typeof r.timestampValue=="string"&&typeof o.timestampValue=="string"&&r.timestampValue.length===o.timestampValue.length)return r.timestampValue===o.timestampValue;const a=ft(r.timestampValue),c=ft(o.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(s,e);case 5:return s.stringValue===e.stringValue;case 6:return function(r,o){return rn(r.bytesValue).isEqual(rn(o.bytesValue))}(s,e);case 7:return s.referenceValue===e.referenceValue;case 8:return function(r,o){return ie(r.geoPointValue.latitude)===ie(o.geoPointValue.latitude)&&ie(r.geoPointValue.longitude)===ie(o.geoPointValue.longitude)}(s,e);case 2:return function(r,o){if("integerValue"in r&&"integerValue"in o)return ie(r.integerValue)===ie(o.integerValue);if("doubleValue"in r&&"doubleValue"in o){const a=ie(r.doubleValue),c=ie(o.doubleValue);return a===c?Kn(a)===Kn(c):isNaN(a)&&isNaN(c)}return!1}(s,e);case 9:return It(s.arrayValue.values||[],e.arrayValue.values||[],De);case 10:case 11:return function(r,o){const a=r.mapValue.fields||{},c=o.mapValue.fields||{};if(ao(a)!==ao(c))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(c[h]===void 0||!De(a[h],c[h])))return!1;return!0}(s,e);default:return k()}}function on(s,e){return(s.values||[]).find(t=>De(t,e))!==void 0}function bt(s,e){if(s===e)return 0;const t=At(s),n=At(e);if(t!==n)return z(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return z(s.booleanValue,e.booleanValue);case 2:return function(o,a){const c=ie(o.integerValue||o.doubleValue),h=ie(a.integerValue||a.doubleValue);return c<h?-1:c>h?1:c===h?0:isNaN(c)?isNaN(h)?0:-1:1}(s,e);case 3:return co(s.timestampValue,e.timestampValue);case 4:return co(Wn(s),Wn(e));case 5:return z(s.stringValue,e.stringValue);case 6:return function(o,a){const c=rn(o),h=rn(a);return c.compareTo(h)}(s.bytesValue,e.bytesValue);case 7:return function(o,a){const c=o.split("/"),h=a.split("/");for(let d=0;d<c.length&&d<h.length;d++){const m=z(c[d],h[d]);if(m!==0)return m}return z(c.length,h.length)}(s.referenceValue,e.referenceValue);case 8:return function(o,a){const c=z(ie(o.latitude),ie(a.latitude));return c!==0?c:z(ie(o.longitude),ie(a.longitude))}(s.geoPointValue,e.geoPointValue);case 9:return uo(s.arrayValue,e.arrayValue);case 10:return function(o,a){var c,h,d,m;const y=o.fields||{},A=a.fields||{},S=(c=y.value)===null||c===void 0?void 0:c.arrayValue,R=(h=A.value)===null||h===void 0?void 0:h.arrayValue,O=z(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((m=R==null?void 0:R.values)===null||m===void 0?void 0:m.length)||0);return O!==0?O:uo(S,R)}(s.mapValue,e.mapValue);case 11:return function(o,a){if(o===xn.mapValue&&a===xn.mapValue)return 0;if(o===xn.mapValue)return 1;if(a===xn.mapValue)return-1;const c=o.fields||{},h=Object.keys(c),d=a.fields||{},m=Object.keys(d);h.sort(),m.sort();for(let y=0;y<h.length&&y<m.length;++y){const A=z(h[y],m[y]);if(A!==0)return A;const S=bt(c[h[y]],d[m[y]]);if(S!==0)return S}return z(h.length,m.length)}(s.mapValue,e.mapValue);default:throw k()}}function co(s,e){if(typeof s=="string"&&typeof e=="string"&&s.length===e.length)return z(s,e);const t=ft(s),n=ft(e),r=z(t.seconds,n.seconds);return r!==0?r:z(t.nanos,n.nanos)}function uo(s,e){const t=s.values||[],n=e.values||[];for(let r=0;r<t.length&&r<n.length;++r){const o=bt(t[r],n[r]);if(o)return o}return z(t.length,n.length)}function St(s){return rr(s)}function rr(s){return"nullValue"in s?"null":"booleanValue"in s?""+s.booleanValue:"integerValue"in s?""+s.integerValue:"doubleValue"in s?""+s.doubleValue:"timestampValue"in s?function(t){const n=ft(t);return`time(${n.seconds},${n.nanos})`}(s.timestampValue):"stringValue"in s?s.stringValue:"bytesValue"in s?function(t){return rn(t).toBase64()}(s.bytesValue):"referenceValue"in s?function(t){return M.fromName(t).toString()}(s.referenceValue):"geoPointValue"in s?function(t){return`geo(${t.latitude},${t.longitude})`}(s.geoPointValue):"arrayValue"in s?function(t){let n="[",r=!0;for(const o of t.values||[])r?r=!1:n+=",",n+=rr(o);return n+"]"}(s.arrayValue):"mapValue"in s?function(t){const n=Object.keys(t.fields||{}).sort();let r="{",o=!0;for(const a of n)o?o=!1:r+=",",r+=`${a}:${rr(t.fields[a])}`;return r+"}"}(s.mapValue):k()}function ir(s){return!!s&&"integerValue"in s}function Tr(s){return!!s&&"arrayValue"in s}function Un(s){return!!s&&"mapValue"in s}function Eh(s){var e,t;return((t=(((e=s==null?void 0:s.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Xt(s){if(s.geoPointValue)return{geoPointValue:Object.assign({},s.geoPointValue)};if(s.timestampValue&&typeof s.timestampValue=="object")return{timestampValue:Object.assign({},s.timestampValue)};if(s.mapValue){const e={mapValue:{fields:{}}};return dn(s.mapValue.fields,(t,n)=>e.mapValue.fields[t]=Xt(n)),e}if(s.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(s.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Xt(s.arrayValue.values[t]);return e}return Object.assign({},s)}function wh(s){return(((s.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e){this.value=e}static empty(){return new Se({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!Un(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Xt(t)}setAll(e){let t=oe.emptyPath(),n={},r=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const h=this.getFieldsMap(t);this.applyChanges(h,n,r),n={},r=[],t=c.popLast()}a?n[c.lastSegment()]=Xt(a):r.push(c.lastSegment())});const o=this.getFieldsMap(t);this.applyChanges(o,n,r)}delete(e){const t=this.field(e.popLast());Un(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return De(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=t.mapValue.fields[e.get(n)];Un(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,n){dn(t,(r,o)=>e[r]=o);for(const r of n)delete e[r]}clone(){return new Se(Xt(this.value))}}function ga(s){const e=[];return dn(s.fields,(t,n)=>{const r=new oe([t]);if(Un(n)){const o=ga(n.mapValue).fields;if(o.length===0)e.push(r);else for(const a of o)e.push(r.child(a))}else e.push(r)}),new Re(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e,t,n,r,o,a,c){this.key=e,this.documentType=t,this.version=n,this.readTime=r,this.createTime=o,this.data=a,this.documentState=c}static newInvalidDocument(e){return new be(e,0,H.min(),H.min(),H.min(),Se.empty(),0)}static newFoundDocument(e,t,n,r){return new be(e,1,t,H.min(),n,r,0)}static newNoDocument(e,t){return new be(e,2,t,H.min(),H.min(),Se.empty(),0)}static newUnknownDocument(e,t){return new be(e,3,t,H.min(),H.min(),Se.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(H.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Se.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Se.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=H.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof be&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new be(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(e,t){this.position=e,this.inclusive=t}}function ho(s,e,t){let n=0;for(let r=0;r<s.position.length;r++){const o=e[r],a=s.position[r];if(o.field.isKeyField()?n=M.comparator(M.fromName(a.referenceValue),t.key):n=bt(a,t.data.field(o.field)),o.dir==="desc"&&(n*=-1),n!==0)break}return n}function fo(s,e){if(s===null)return e===null;if(e===null||s.inclusive!==e.inclusive||s.position.length!==e.position.length)return!1;for(let t=0;t<s.position.length;t++)if(!De(s.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(e,t="asc"){this.field=e,this.dir=t}}function Th(s,e){return s.dir===e.dir&&s.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{}class te extends ya{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new Ah(e,t,n):t==="array-contains"?new Rh(e,n):t==="in"?new Ph(e,n):t==="not-in"?new Ch(e,n):t==="array-contains-any"?new Vh(e,n):new te(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new bh(e,n):new Sh(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(bt(t,this.value)):t!==null&&At(this.value)===At(t)&&this.matchesComparison(bt(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return k()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Ye extends ya{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Ye(e,t)}matches(e){return va(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function va(s){return s.op==="and"}function _a(s){return Ih(s)&&va(s)}function Ih(s){for(const e of s.filters)if(e instanceof Ye)return!1;return!0}function or(s){if(s instanceof te)return s.field.canonicalString()+s.op.toString()+St(s.value);if(_a(s))return s.filters.map(e=>or(e)).join(",");{const e=s.filters.map(t=>or(t)).join(",");return`${s.op}(${e})`}}function Ea(s,e){return s instanceof te?function(n,r){return r instanceof te&&n.op===r.op&&n.field.isEqual(r.field)&&De(n.value,r.value)}(s,e):s instanceof Ye?function(n,r){return r instanceof Ye&&n.op===r.op&&n.filters.length===r.filters.length?n.filters.reduce((o,a,c)=>o&&Ea(a,r.filters[c]),!0):!1}(s,e):void k()}function wa(s){return s instanceof te?function(t){return`${t.field.canonicalString()} ${t.op} ${St(t.value)}`}(s):s instanceof Ye?function(t){return t.op.toString()+" {"+t.getFilters().map(wa).join(" ,")+"}"}(s):"Filter"}class Ah extends te{constructor(e,t,n){super(e,t,n),this.key=M.fromName(n.referenceValue)}matches(e){const t=M.comparator(e.key,this.key);return this.matchesComparison(t)}}class bh extends te{constructor(e,t){super(e,"in",t),this.keys=Ta("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Sh extends te{constructor(e,t){super(e,"not-in",t),this.keys=Ta("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Ta(s,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(n=>M.fromName(n.referenceValue))}class Rh extends te{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Tr(t)&&on(t.arrayValue,this.value)}}class Ph extends te{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&on(this.value.arrayValue,t)}}class Ch extends te{constructor(e,t){super(e,"not-in",t)}matches(e){if(on(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!on(this.value.arrayValue,t)}}class Vh extends te{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Tr(t)||!t.arrayValue.values)&&t.arrayValue.values.some(n=>on(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dh{constructor(e,t=null,n=[],r=[],o=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=r,this.limit=o,this.startAt=a,this.endAt=c,this.ue=null}}function mo(s,e=null,t=[],n=[],r=null,o=null,a=null){return new Dh(s,e,t,n,r,o,a)}function Ir(s){const e=G(s);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(n=>or(n)).join(","),t+="|ob:",t+=e.orderBy.map(n=>function(o){return o.field.canonicalString()+o.dir}(n)).join(","),Er(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(n=>St(n)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(n=>St(n)).join(",")),e.ue=t}return e.ue}function Ar(s,e){if(s.limit!==e.limit||s.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<s.orderBy.length;t++)if(!Th(s.orderBy[t],e.orderBy[t]))return!1;if(s.filters.length!==e.filters.length)return!1;for(let t=0;t<s.filters.length;t++)if(!Ea(s.filters[t],e.filters[t]))return!1;return s.collectionGroup===e.collectionGroup&&!!s.path.isEqual(e.path)&&!!fo(s.startAt,e.startAt)&&fo(s.endAt,e.endAt)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(e,t=null,n=[],r=[],o=null,a="F",c=null,h=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=r,this.limit=o,this.limitType=a,this.startAt=c,this.endAt=h,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Oh(s,e,t,n,r,o,a,c){return new as(s,e,t,n,r,o,a,c)}function Lh(s){return new as(s)}function po(s){return s.filters.length===0&&s.limit===null&&s.startAt==null&&s.endAt==null&&(s.explicitOrderBy.length===0||s.explicitOrderBy.length===1&&s.explicitOrderBy[0].field.isKeyField())}function Nh(s){return s.collectionGroup!==null}function Jt(s){const e=G(s);if(e.ce===null){e.ce=[];const t=new Set;for(const o of e.explicitOrderBy)e.ce.push(o),t.add(o.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new pe(oe.comparator);return a.filters.forEach(h=>{h.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(e).forEach(o=>{t.has(o.canonicalString())||o.isKeyField()||e.ce.push(new Xn(o,n))}),t.has(oe.keyField().canonicalString())||e.ce.push(new Xn(oe.keyField(),n))}return e.ce}function ct(s){const e=G(s);return e.le||(e.le=Mh(e,Jt(s))),e.le}function Mh(s,e){if(s.limitType==="F")return mo(s.path,s.collectionGroup,e,s.filters,s.limit,s.startAt,s.endAt);{e=e.map(r=>{const o=r.dir==="desc"?"asc":"desc";return new Xn(r.field,o)});const t=s.endAt?new Yn(s.endAt.position,s.endAt.inclusive):null,n=s.startAt?new Yn(s.startAt.position,s.startAt.inclusive):null;return mo(s.path,s.collectionGroup,e,s.filters,s.limit,t,n)}}function ar(s,e,t){return new as(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),e,t,s.startAt,s.endAt)}function Ia(s,e){return Ar(ct(s),ct(e))&&s.limitType===e.limitType}function Aa(s){return`${Ir(ct(s))}|lt:${s.limitType}`}function Wt(s){return`Query(target=${function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map(r=>wa(r)).join(", ")}]`),Er(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map(r=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(r)).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map(r=>St(r)).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map(r=>St(r)).join(",")),`Target(${n})`}(ct(s))}; limitType=${s.limitType})`}function br(s,e){return e.isFoundDocument()&&function(n,r){const o=r.key.path;return n.collectionGroup!==null?r.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(o):M.isDocumentKey(n.path)?n.path.isEqual(o):n.path.isImmediateParentOf(o)}(s,e)&&function(n,r){for(const o of Jt(n))if(!o.field.isKeyField()&&r.data.field(o.field)===null)return!1;return!0}(s,e)&&function(n,r){for(const o of n.filters)if(!o.matches(r))return!1;return!0}(s,e)&&function(n,r){return!(n.startAt&&!function(a,c,h){const d=ho(a,c,h);return a.inclusive?d<=0:d<0}(n.startAt,Jt(n),r)||n.endAt&&!function(a,c,h){const d=ho(a,c,h);return a.inclusive?d>=0:d>0}(n.endAt,Jt(n),r))}(s,e)}function kh(s){return(e,t)=>{let n=!1;for(const r of Jt(s)){const o=xh(r,e,t);if(o!==0)return o;n=n||r.field.isKeyField()}return 0}}function xh(s,e,t){const n=s.field.isKeyField()?M.comparator(e.key,t.key):function(o,a,c){const h=a.data.field(o),d=c.data.field(o);return h!==null&&d!==null?bt(h,d):k()}(s.field,e,t);switch(s.dir){case"asc":return n;case"desc":return-1*n;default:return k()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[r,o]of n)if(this.equalsFn(r,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let o=0;o<r.length;o++)if(this.equalsFn(r[o][0],e))return void(r[o]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return n.length===1?delete this.inner[t]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){dn(this.inner,(t,n)=>{for(const[r,o]of n)e(r,o)})}isEmpty(){return ma(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fh=new Ee(M.comparator);function Jn(){return Fh}const ba=new Ee(M.comparator);function Fn(...s){let e=ba;for(const t of s)e=e.insert(t.key,t);return e}function Sa(s){let e=ba;return s.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function it(){return Zt()}function Ra(){return Zt()}function Zt(){return new Ct(s=>s.toString(),(s,e)=>s.isEqual(e))}const Bh=new Ee(M.comparator),$h=new pe(M.comparator);function me(...s){let e=$h;for(const t of s)e=e.add(t);return e}const Uh=new pe(z);function jh(){return Uh}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sr(s,e){if(s.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Kn(e)?"-0":e}}function Pa(s){return{integerValue:""+s}}function zh(s,e){return gh(e)?Pa(e):Sr(s,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(){this._=void 0}}function Gh(s,e,t){return s instanceof an?function(r,o){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return o&&wr(o)&&(o=pa(o)),o&&(a.fields.__previous_value__=o),{mapValue:a}}(t,e):s instanceof ln?Va(s,e):s instanceof cn?Da(s,e):function(r,o){const a=Ca(r,o),c=go(a)+go(r.Pe);return ir(a)&&ir(r.Pe)?Pa(c):Sr(r.serializer,c)}(s,e)}function qh(s,e,t){return s instanceof ln?Va(s,e):s instanceof cn?Da(s,e):t}function Ca(s,e){return s instanceof Zn?function(n){return ir(n)||function(o){return!!o&&"doubleValue"in o}(n)}(e)?e:{integerValue:0}:null}class an extends ls{}class ln extends ls{constructor(e){super(),this.elements=e}}function Va(s,e){const t=Oa(e);for(const n of s.elements)t.some(r=>De(r,n))||t.push(n);return{arrayValue:{values:t}}}class cn extends ls{constructor(e){super(),this.elements=e}}function Da(s,e){let t=Oa(e);for(const n of s.elements)t=t.filter(r=>!De(r,n));return{arrayValue:{values:t}}}class Zn extends ls{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function go(s){return ie(s.integerValue||s.doubleValue)}function Oa(s){return Tr(s)&&s.arrayValue.values?s.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hh{constructor(e,t){this.field=e,this.transform=t}}function Kh(s,e){return s.field.isEqual(e.field)&&function(n,r){return n instanceof ln&&r instanceof ln||n instanceof cn&&r instanceof cn?It(n.elements,r.elements,De):n instanceof Zn&&r instanceof Zn?De(n.Pe,r.Pe):n instanceof an&&r instanceof an}(s.transform,e.transform)}class Wh{constructor(e,t){this.version=e,this.transformResults=t}}class Me{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Me}static exists(e){return new Me(void 0,e)}static updateTime(e){return new Me(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function jn(s,e){return s.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(s.updateTime):s.exists===void 0||s.exists===e.isFoundDocument()}class cs{}function La(s,e){if(!s.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return s.isNoDocument()?new Ma(s.key,Me.none()):new fn(s.key,s.data,Me.none());{const t=s.data,n=Se.empty();let r=new pe(oe.comparator);for(let o of e.fields)if(!r.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?n.delete(o):n.set(o,a),r=r.add(o)}return new gt(s.key,n,new Re(r.toArray()),Me.none())}}function Qh(s,e,t){s instanceof fn?function(r,o,a){const c=r.value.clone(),h=vo(r.fieldTransforms,o,a.transformResults);c.setAll(h),o.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(s,e,t):s instanceof gt?function(r,o,a){if(!jn(r.precondition,o))return void o.convertToUnknownDocument(a.version);const c=vo(r.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Na(r)),h.setAll(c),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()}(s,e,t):function(r,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function en(s,e,t,n){return s instanceof fn?function(o,a,c,h){if(!jn(o.precondition,a))return c;const d=o.value.clone(),m=_o(o.fieldTransforms,h,a);return d.setAll(m),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(s,e,t,n):s instanceof gt?function(o,a,c,h){if(!jn(o.precondition,a))return c;const d=_o(o.fieldTransforms,h,a),m=a.data;return m.setAll(Na(o)),m.setAll(d),a.convertToFoundDocument(a.version,m).setHasLocalMutations(),c===null?null:c.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(y=>y.field))}(s,e,t,n):function(o,a,c){return jn(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(s,e,t)}function Yh(s,e){let t=null;for(const n of s.fieldTransforms){const r=e.data.field(n.field),o=Ca(n.transform,r||null);o!=null&&(t===null&&(t=Se.empty()),t.set(n.field,o))}return t||null}function yo(s,e){return s.type===e.type&&!!s.key.isEqual(e.key)&&!!s.precondition.isEqual(e.precondition)&&!!function(n,r){return n===void 0&&r===void 0||!(!n||!r)&&It(n,r,(o,a)=>Kh(o,a))}(s.fieldTransforms,e.fieldTransforms)&&(s.type===0?s.value.isEqual(e.value):s.type!==1||s.data.isEqual(e.data)&&s.fieldMask.isEqual(e.fieldMask))}class fn extends cs{constructor(e,t,n,r=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class gt extends cs{constructor(e,t,n,r,o=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=r,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Na(s){const e=new Map;return s.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const n=s.data.field(t);e.set(t,n)}}),e}function vo(s,e,t){const n=new Map;Y(s.length===t.length);for(let r=0;r<t.length;r++){const o=s[r],a=o.transform,c=e.data.field(o.field);n.set(o.field,qh(a,c,t[r]))}return n}function _o(s,e,t){const n=new Map;for(const r of s){const o=r.transform,a=t.data.field(r.field);n.set(r.field,Gh(o,a,e))}return n}class Ma extends cs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Xh extends cs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jh{constructor(e,t,n,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const o=this.mutations[r];o.key.isEqual(e.key)&&Qh(o,e,n[r])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=en(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=en(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Ra();return this.mutations.forEach(r=>{const o=e.get(r.key),a=o.overlayedDocument;let c=this.applyToLocalView(a,o.mutatedFields);c=t.has(r.key)?null:c;const h=La(a,c);h!==null&&n.set(r.key,h),a.isValidDocument()||a.convertToNoDocument(H.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),me())}isEqual(e){return this.batchId===e.batchId&&It(this.mutations,e.mutations,(t,n)=>yo(t,n))&&It(this.baseMutations,e.baseMutations,(t,n)=>yo(t,n))}}class Rr{constructor(e,t,n,r){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=r}static from(e,t,n){Y(e.mutations.length===n.length);let r=function(){return Bh}();const o=e.mutations;for(let a=0;a<o.length;a++)r=r.insert(o[a].key,n[a].version);return new Rr(e,t,n,r)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zh{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var J,x;function ed(s){switch(s){default:return k();case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0}}function td(s){if(s===void 0)return dt("GRPC error has no .code"),C.UNKNOWN;switch(s){case J.OK:return C.OK;case J.CANCELLED:return C.CANCELLED;case J.UNKNOWN:return C.UNKNOWN;case J.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case J.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case J.INTERNAL:return C.INTERNAL;case J.UNAVAILABLE:return C.UNAVAILABLE;case J.UNAUTHENTICATED:return C.UNAUTHENTICATED;case J.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case J.NOT_FOUND:return C.NOT_FOUND;case J.ALREADY_EXISTS:return C.ALREADY_EXISTS;case J.PERMISSION_DENIED:return C.PERMISSION_DENIED;case J.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case J.ABORTED:return C.ABORTED;case J.OUT_OF_RANGE:return C.OUT_OF_RANGE;case J.UNIMPLEMENTED:return C.UNIMPLEMENTED;case J.DATA_LOSS:return C.DATA_LOSS;default:return k()}}(x=J||(J={}))[x.OK=0]="OK",x[x.CANCELLED=1]="CANCELLED",x[x.UNKNOWN=2]="UNKNOWN",x[x.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",x[x.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",x[x.NOT_FOUND=5]="NOT_FOUND",x[x.ALREADY_EXISTS=6]="ALREADY_EXISTS",x[x.PERMISSION_DENIED=7]="PERMISSION_DENIED",x[x.UNAUTHENTICATED=16]="UNAUTHENTICATED",x[x.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",x[x.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",x[x.ABORTED=10]="ABORTED",x[x.OUT_OF_RANGE=11]="OUT_OF_RANGE",x[x.UNIMPLEMENTED=12]="UNIMPLEMENTED",x[x.INTERNAL=13]="INTERNAL",x[x.UNAVAILABLE=14]="UNAVAILABLE",x[x.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ra([4294967295,4294967295],0);class nd{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function lr(s,e){return s.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function sd(s,e){return s.useProto3Json?e.toBase64():e.toUint8Array()}function rd(s,e){return lr(s,e.toTimestamp())}function Tt(s){return Y(!!s),H.fromTimestamp(function(t){const n=ft(t);return new ne(n.seconds,n.nanos)}(s))}function ka(s,e){return cr(s,e).canonicalString()}function cr(s,e){const t=function(r){return new W(["projects",r.projectId,"databases",r.database])}(s).child("documents");return e===void 0?t:t.child(e)}function id(s){const e=W.fromString(s);return Y(fd(e)),e}function ur(s,e){return ka(s.databaseId,e.path)}function od(s){const e=id(s);return e.length===4?W.emptyPath():ld(e)}function ad(s){return new W(["projects",s.databaseId.projectId,"databases",s.databaseId.database]).canonicalString()}function ld(s){return Y(s.length>4&&s.get(4)==="documents"),s.popFirst(5)}function Eo(s,e,t){return{name:ur(s,e),fields:t.value.mapValue.fields}}function cd(s,e){let t;if(e instanceof fn)t={update:Eo(s,e.key,e.value)};else if(e instanceof Ma)t={delete:ur(s,e.key)};else if(e instanceof gt)t={update:Eo(s,e.key,e.data),updateMask:dd(e.fieldMask)};else{if(!(e instanceof Xh))return k();t={verify:ur(s,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(n=>function(o,a){const c=a.transform;if(c instanceof an)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof ln)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof cn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Zn)return{fieldPath:a.field.canonicalString(),increment:c.Pe};throw k()}(0,n))),e.precondition.isNone||(t.currentDocument=function(r,o){return o.updateTime!==void 0?{updateTime:rd(r,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:k()}(s,e.precondition)),t}function ud(s,e){return s&&s.length>0?(Y(e!==void 0),s.map(t=>function(r,o){let a=r.updateTime?Tt(r.updateTime):Tt(o);return a.isEqual(H.min())&&(a=Tt(o)),new Wh(a,r.transformResults||[])}(t,e))):[]}function hd(s){let e=od(s.parent);const t=s.structuredQuery,n=t.from?t.from.length:0;let r=null;if(n>0){Y(n===1);const m=t.from[0];m.allDescendants?r=m.collectionId:e=e.child(m.collectionId)}let o=[];t.where&&(o=function(y){const A=xa(y);return A instanceof Ye&&_a(A)?A.getFilters():[A]}(t.where));let a=[];t.orderBy&&(a=function(y){return y.map(A=>function(R){return new Xn(wt(R.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(A))}(t.orderBy));let c=null;t.limit&&(c=function(y){let A;return A=typeof y=="object"?y.value:y,Er(A)?null:A}(t.limit));let h=null;t.startAt&&(h=function(y){const A=!!y.before,S=y.values||[];return new Yn(S,A)}(t.startAt));let d=null;return t.endAt&&(d=function(y){const A=!y.before,S=y.values||[];return new Yn(S,A)}(t.endAt)),Oh(e,r,a,o,c,"F",h,d)}function xa(s){return s.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=wt(t.unaryFilter.field);return te.create(n,"==",{doubleValue:NaN});case"IS_NULL":const r=wt(t.unaryFilter.field);return te.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=wt(t.unaryFilter.field);return te.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=wt(t.unaryFilter.field);return te.create(a,"!=",{nullValue:"NULL_VALUE"});default:return k()}}(s):s.fieldFilter!==void 0?function(t){return te.create(wt(t.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return k()}}(t.fieldFilter.op),t.fieldFilter.value)}(s):s.compositeFilter!==void 0?function(t){return Ye.create(t.compositeFilter.filters.map(n=>xa(n)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return k()}}(t.compositeFilter.op))}(s):k()}function wt(s){return oe.fromServerFormat(s.fieldPath)}function dd(s){const e=[];return s.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function fd(s){return s.length>=4&&s.get(0)==="projects"&&s.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class md{constructor(e){this.ct=e}}function pd(s){const e=hd({parent:s.parent,structuredQuery:s.structuredQuery});return s.limitType==="LAST"?ar(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gd{constructor(){this.un=new yd}addToCollectionParentIndex(e,t){return this.un.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(Qe.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(Qe.min())}updateCollectionGroup(e,t,n){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class yd{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t]||new pe(W.comparator),o=!r.has(n);return this.index[t]=r.add(n),o}has(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t];return r&&r.has(n)}getEntries(e){return(this.index[e]||new pe(W.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Rt(0)}static kn(){return new Rt(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vd{constructor(){this.changes=new Ct(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,be.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?P.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _d{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ed{constructor(e,t,n,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(r=>(n=r,this.remoteDocumentCache.getEntry(e,t))).next(r=>(n!==null&&en(n.mutation,r,Re.empty(),ne.now()),r))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.getLocalViewOfDocuments(e,n,me()).next(()=>n))}getLocalViewOfDocuments(e,t,n=me()){const r=it();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,n).next(o=>{let a=Fn();return o.forEach((c,h)=>{a=a.insert(c,h.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const n=it();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,me()))}populateOverlays(e,t,n){const r=[];return n.forEach(o=>{t.has(o)||r.push(o)}),this.documentOverlayCache.getOverlays(e,r).next(o=>{o.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,n,r){let o=Jn();const a=Zt(),c=function(){return Zt()}();return t.forEach((h,d)=>{const m=n.get(d.key);r.has(d.key)&&(m===void 0||m.mutation instanceof gt)?o=o.insert(d.key,d):m!==void 0?(a.set(d.key,m.mutation.getFieldMask()),en(m.mutation,d,m.mutation.getFieldMask(),ne.now())):a.set(d.key,Re.empty())}),this.recalculateAndSaveOverlays(e,o).next(h=>(h.forEach((d,m)=>a.set(d,m)),t.forEach((d,m)=>{var y;return c.set(d,new _d(m,(y=a.get(d))!==null&&y!==void 0?y:null))}),c))}recalculateAndSaveOverlays(e,t){const n=Zt();let r=new Ee((a,c)=>a-c),o=me();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(h=>{const d=t.get(h);if(d===null)return;let m=n.get(h)||Re.empty();m=c.applyToLocalView(d,m),n.set(h,m);const y=(r.get(c.batchId)||me()).add(h);r=r.insert(c.batchId,y)})}).next(()=>{const a=[],c=r.getReverseIterator();for(;c.hasNext();){const h=c.getNext(),d=h.key,m=h.value,y=Ra();m.forEach(A=>{if(!o.has(A)){const S=La(t.get(A),n.get(A));S!==null&&y.set(A,S),o=o.add(A)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,y))}return P.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,t,n,r){return function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Nh(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,r):this.getDocumentsMatchingCollectionQuery(e,t,n,r)}getNextDocuments(e,t,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,r).next(o=>{const a=r-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,r-o.size):P.resolve(it());let c=-1,h=o;return a.next(d=>P.forEach(d,(m,y)=>(c<y.largestBatchId&&(c=y.largestBatchId),o.get(m)?P.resolve():this.remoteDocumentCache.getEntry(e,m).next(A=>{h=h.insert(m,A)}))).next(()=>this.populateOverlays(e,d,o)).next(()=>this.computeViews(e,h,d,me())).next(m=>({batchId:c,changes:Sa(m)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new M(t)).next(n=>{let r=Fn();return n.isFoundDocument()&&(r=r.insert(n.key,n)),r})}getDocumentsMatchingCollectionGroupQuery(e,t,n,r){const o=t.collectionGroup;let a=Fn();return this.indexManager.getCollectionParents(e,o).next(c=>P.forEach(c,h=>{const d=function(y,A){return new as(A,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)}(t,h.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,n,r).next(m=>{m.forEach((y,A)=>{a=a.insert(y,A)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,n,r){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,o,r))).next(a=>{o.forEach((h,d)=>{const m=d.getKey();a.get(m)===null&&(a=a.insert(m,be.newInvalidDocument(m)))});let c=Fn();return a.forEach((h,d)=>{const m=o.get(h);m!==void 0&&en(m.mutation,d,Re.empty(),ne.now()),br(t,d)&&(c=c.insert(h,d))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wd{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return P.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(r){return{id:r.id,version:r.version,createTime:Tt(r.createTime)}}(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(r){return{name:r.name,query:pd(r.bundledQuery),readTime:Tt(r.readTime)}}(t)),P.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Td{constructor(){this.overlays=new Ee(M.comparator),this.Ir=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const n=it();return P.forEach(t,r=>this.getOverlay(e,r).next(o=>{o!==null&&n.set(r,o)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((r,o)=>{this.ht(e,t,o)}),P.resolve()}removeOverlaysForBatchId(e,t,n){const r=this.Ir.get(n);return r!==void 0&&(r.forEach(o=>this.overlays=this.overlays.remove(o)),this.Ir.delete(n)),P.resolve()}getOverlaysForCollection(e,t,n){const r=it(),o=t.length+1,a=new M(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const h=c.getNext().value,d=h.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>n&&r.set(h.getKey(),h)}return P.resolve(r)}getOverlaysForCollectionGroup(e,t,n,r){let o=new Ee((d,m)=>d-m);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>n){let m=o.get(d.largestBatchId);m===null&&(m=it(),o=o.insert(d.largestBatchId,m)),m.set(d.getKey(),d)}}const c=it(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach((d,m)=>c.set(d,m)),!(c.size()>=r)););return P.resolve(c)}ht(e,t,n){const r=this.overlays.get(n.key);if(r!==null){const a=this.Ir.get(r.largestBatchId).delete(n.key);this.Ir.set(r.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new Zh(t,n));let o=this.Ir.get(t);o===void 0&&(o=me(),this.Ir.set(t,o)),this.Ir.set(t,o.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Id{constructor(){this.sessionToken=Ve.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pr{constructor(){this.Tr=new pe(ee.Er),this.dr=new pe(ee.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const n=new ee(e,t);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(e,t){e.forEach(n=>this.addReference(n,t))}removeReference(e,t){this.Vr(new ee(e,t))}mr(e,t){e.forEach(n=>this.removeReference(n,t))}gr(e){const t=new M(new W([])),n=new ee(t,e),r=new ee(t,e+1),o=[];return this.dr.forEachInRange([n,r],a=>{this.Vr(a),o.push(a.key)}),o}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new M(new W([])),n=new ee(t,e),r=new ee(t,e+1);let o=me();return this.dr.forEachInRange([n,r],a=>{o=o.add(a.key)}),o}containsKey(e){const t=new ee(e,0),n=this.Tr.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class ee{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return M.comparator(e.key,t.key)||z(e.wr,t.wr)}static Ar(e,t){return z(e.wr,t.wr)||M.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ad{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new pe(ee.Er)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,r){const o=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Jh(o,t,n,r);this.mutationQueue.push(a);for(const c of r)this.br=this.br.add(new ee(c.key,o)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return P.resolve(a)}lookupMutationBatch(e,t){return P.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=this.vr(n),o=r<0?0:r;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new ee(t,0),r=new ee(t,Number.POSITIVE_INFINITY),o=[];return this.br.forEachInRange([n,r],a=>{const c=this.Dr(a.wr);o.push(c)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new pe(z);return t.forEach(r=>{const o=new ee(r,0),a=new ee(r,Number.POSITIVE_INFINITY);this.br.forEachInRange([o,a],c=>{n=n.add(c.wr)})}),P.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1;let o=n;M.isDocumentKey(o)||(o=o.child(""));const a=new ee(new M(o),0);let c=new pe(z);return this.br.forEachWhile(h=>{const d=h.key.path;return!!n.isPrefixOf(d)&&(d.length===r&&(c=c.add(h.wr)),!0)},a),P.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(n=>{const r=this.Dr(n);r!==null&&t.push(r)}),t}removeMutationBatch(e,t){Y(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return P.forEach(t.mutations,r=>{const o=new ee(r.key,t.batchId);return n=n.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.br=n})}On(e){}containsKey(e,t){const n=new ee(t,0),r=this.br.firstAfterOrEqual(n);return P.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bd{constructor(e){this.Mr=e,this.docs=function(){return new Ee(M.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,r=this.docs.get(n),o=r?r.size:0,a=this.Mr(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return P.resolve(n?n.document.mutableCopy():be.newInvalidDocument(t))}getEntries(e,t){let n=Jn();return t.forEach(r=>{const o=this.docs.get(r);n=n.insert(r,o?o.document.mutableCopy():be.newInvalidDocument(r))}),P.resolve(n)}getDocumentsMatchingQuery(e,t,n,r){let o=Jn();const a=t.path,c=new M(a.child("")),h=this.docs.getIteratorFrom(c);for(;h.hasNext();){const{key:d,value:{document:m}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||dh(hh(m),n)<=0||(r.has(m.key)||br(t,m))&&(o=o.insert(m.key,m.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(e,t,n,r){k()}Or(e,t){return P.forEach(this.docs,n=>t(n))}newChangeBuffer(e){return new Sd(this)}getSize(e){return P.resolve(this.size)}}class Sd extends vd{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?t.push(this.cr.addEntry(e,r)):this.cr.removeEntry(n)}),P.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rd{constructor(e){this.persistence=e,this.Nr=new Ct(t=>Ir(t),Ar),this.lastRemoteSnapshotVersion=H.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Pr,this.targetCount=0,this.kr=Rt.Bn()}forEachTarget(e,t){return this.Nr.forEach((n,r)=>t(r)),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.Lr&&(this.Lr=t),P.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new Rt(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.Kn(t),P.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,n){let r=0;const o=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&n.get(c.targetId)===null&&(this.Nr.delete(a),o.push(this.removeMatchingKeysForTargetId(e,c.targetId)),r++)}),P.waitFor(o).next(()=>r)}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const n=this.Nr.get(t)||null;return P.resolve(n)}addMatchingKeys(e,t,n){return this.Br.Rr(t,n),P.resolve()}removeMatchingKeys(e,t,n){this.Br.mr(t,n);const r=this.persistence.referenceDelegate,o=[];return r&&t.forEach(a=>{o.push(r.markPotentiallyOrphaned(e,a))}),P.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),P.resolve()}getMatchingKeysForTargetId(e,t){const n=this.Br.yr(t);return P.resolve(n)}containsKey(e,t){return P.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pd{constructor(e,t){this.qr={},this.overlays={},this.Qr=new fa(0),this.Kr=!1,this.Kr=!0,this.$r=new Id,this.referenceDelegate=e(this),this.Ur=new Rd(this),this.indexManager=new gd,this.remoteDocumentCache=function(r){return new bd(r)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new md(t),this.Gr=new wd(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Td,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.qr[e.toKey()];return n||(n=new Ad(t,this.referenceDelegate),this.qr[e.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,n){L("MemoryPersistence","Starting transaction:",e);const r=new Cd(this.Qr.next());return this.referenceDelegate.zr(),n(r).next(o=>this.referenceDelegate.jr(r).next(()=>o)).toPromise().then(o=>(r.raiseOnCommittedEvent(),o))}Hr(e,t){return P.or(Object.values(this.qr).map(n=>()=>n.containsKey(e,t)))}}class Cd extends mh{constructor(e){super(),this.currentSequenceNumber=e}}class Cr{constructor(e){this.persistence=e,this.Jr=new Pr,this.Yr=null}static Zr(e){return new Cr(e)}get Xr(){if(this.Yr)return this.Yr;throw k()}addReference(e,t,n){return this.Jr.addReference(n,t),this.Xr.delete(n.toString()),P.resolve()}removeReference(e,t,n){return this.Jr.removeReference(n,t),this.Xr.add(n.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),P.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(r=>this.Xr.add(r.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(r=>{r.forEach(o=>this.Xr.add(o.toString()))}).next(()=>n.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.Xr,n=>{const r=M.fromPath(n);return this.ei(e,r).next(o=>{o||t.removeEntry(r,H.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(n=>{n?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return P.or([()=>P.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vr{constructor(e,t,n,r){this.targetId=e,this.fromCache=t,this.$i=n,this.Ui=r}static Wi(e,t){let n=me(),r=me();for(const o of t.docChanges)switch(o.type){case 0:n=n.add(o.doc.key);break;case 1:r=r.add(o.doc.key)}return new Vr(e,t.fromCache,n,r)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vd{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dd{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return $c()?8:ph(Fc())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,n,r){const o={result:null};return this.Yi(e,t).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.Zi(e,t,r,n).next(a=>{o.result=a})}).next(()=>{if(o.result)return;const a=new Vd;return this.Xi(e,t,a).next(c=>{if(o.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>o.result)}es(e,t,n,r){return n.documentReadCount<this.ji?(Kt()<=F.DEBUG&&L("QueryEngine","SDK will not create cache indexes for query:",Wt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),P.resolve()):(Kt()<=F.DEBUG&&L("QueryEngine","Query:",Wt(t),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.Hi*r?(Kt()<=F.DEBUG&&L("QueryEngine","The SDK decides to create cache indexes for query:",Wt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ct(t))):P.resolve())}Yi(e,t){if(po(t))return P.resolve(null);let n=ct(t);return this.indexManager.getIndexType(e,n).next(r=>r===0?null:(t.limit!==null&&r===1&&(t=ar(t,null,"F"),n=ct(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(o=>{const a=me(...o);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,n).next(h=>{const d=this.ts(t,c);return this.ns(t,d,a,h.readTime)?this.Yi(e,ar(t,null,"F")):this.rs(e,d,t,h)}))})))}Zi(e,t,n,r){return po(t)||r.isEqual(H.min())?P.resolve(null):this.Ji.getDocuments(e,n).next(o=>{const a=this.ts(t,o);return this.ns(t,a,n,r)?P.resolve(null):(Kt()<=F.DEBUG&&L("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Wt(t)),this.rs(e,a,t,uh(r,-1)).next(c=>c))})}ts(e,t){let n=new pe(kh(e));return t.forEach((r,o)=>{br(e,o)&&(n=n.add(o))}),n}ns(e,t,n,r){if(e.limit===null)return!1;if(n.size!==t.size)return!0;const o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(r)>0)}Xi(e,t,n){return Kt()<=F.DEBUG&&L("QueryEngine","Using full collection scan to execute query:",Wt(t)),this.Ji.getDocumentsMatchingQuery(e,t,Qe.min(),n)}rs(e,t,n,r){return this.Ji.getDocumentsMatchingQuery(e,n,r).next(o=>(t.forEach(a=>{o=o.insert(a.key,a)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Od{constructor(e,t,n,r){this.persistence=e,this.ss=t,this.serializer=r,this.os=new Ee(z),this._s=new Ct(o=>Ir(o),Ar),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(n)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Ed(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function Ld(s,e,t,n){return new Od(s,e,t,n)}async function Fa(s,e){const t=G(s);return await t.persistence.runTransaction("Handle user change","readonly",n=>{let r;return t.mutationQueue.getAllMutationBatches(n).next(o=>(r=o,t.ls(e),t.mutationQueue.getAllMutationBatches(n))).next(o=>{const a=[],c=[];let h=me();for(const d of r){a.push(d.batchId);for(const m of d.mutations)h=h.add(m.key)}for(const d of o){c.push(d.batchId);for(const m of d.mutations)h=h.add(m.key)}return t.localDocuments.getDocuments(n,h).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:c}))})})}function Nd(s,e){const t=G(s);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const r=e.batch.keys(),o=t.cs.newChangeBuffer({trackRemovals:!0});return function(c,h,d,m){const y=d.batch,A=y.keys();let S=P.resolve();return A.forEach(R=>{S=S.next(()=>m.getEntry(h,R)).next(O=>{const D=d.docVersions.get(R);Y(D!==null),O.version.compareTo(D)<0&&(y.applyToRemoteDocument(O,d),O.isValidDocument()&&(O.setReadTime(d.commitVersion),m.addEntry(O)))})}),S.next(()=>c.mutationQueue.removeMutationBatch(h,y))}(t,n,e,o).next(()=>o.apply(n)).next(()=>t.mutationQueue.performConsistencyCheck(n)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(n,r,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(c){let h=me();for(let d=0;d<c.mutationResults.length;++d)c.mutationResults[d].transformResults.length>0&&(h=h.add(c.batch.mutations[d].key));return h}(e))).next(()=>t.localDocuments.getDocuments(n,r))})}function Md(s){const e=G(s);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function kd(s,e){const t=G(s);return t.persistence.runTransaction("Get next mutation batch","readonly",n=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e)))}class wo{constructor(){this.activeTargetIds=jh()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class xd{constructor(){this.so=new wo,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,n){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new wo,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fd{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){L("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){L("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bn=null;function qs(){return Bn===null?Bn=function(){return 268435456+Math.round(2147483648*Math.random())}():Bn++,"0x"+Bn.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bd={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $d{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const de="WebChannelConnection";class Ud extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const n=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+t.host,this.vo=`projects/${r}/databases/${o}`,this.Co=this.databaseId.database==="(default)"?`project_id=${r}`:`project_id=${r}&database_id=${o}`}get Fo(){return!1}Mo(t,n,r,o,a){const c=qs(),h=this.xo(t,n.toUriEncodedString());L("RestConnection",`Sending RPC '${t}' ${c}:`,h,r);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,o,a),this.No(t,h,d,r).then(m=>(L("RestConnection",`Received RPC '${t}' ${c}: `,m),m),m=>{throw Hn("RestConnection",`RPC '${t}' ${c} failed with error: `,m,"url: ",h,"request:",r),m})}Lo(t,n,r,o,a,c){return this.Mo(t,n,r,o,a)}Oo(t,n,r){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Pt}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((o,a)=>t[a]=o),r&&r.headers.forEach((o,a)=>t[a]=o)}xo(t,n){const r=Bd[t];return`${this.Do}/v1/${n}:${r}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,n,r){const o=qs();return new Promise((a,c)=>{const h=new ia;h.setWithCredentials(!0),h.listenOnce(oa.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case $n.NO_ERROR:const m=h.getResponseJson();L(de,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),a(m);break;case $n.TIMEOUT:L(de,`RPC '${e}' ${o} timed out`),c(new N(C.DEADLINE_EXCEEDED,"Request time out"));break;case $n.HTTP_ERROR:const y=h.getStatus();if(L(de,`RPC '${e}' ${o} failed with status:`,y,"response text:",h.getResponseText()),y>0){let A=h.getResponseJson();Array.isArray(A)&&(A=A[0]);const S=A==null?void 0:A.error;if(S&&S.status&&S.message){const R=function(D){const $=D.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf($)>=0?$:C.UNKNOWN}(S.status);c(new N(R,S.message))}else c(new N(C.UNKNOWN,"Server responded with status "+h.getStatus()))}else c(new N(C.UNAVAILABLE,"Connection failed."));break;default:k()}}finally{L(de,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(r);L(de,`RPC '${e}' ${o} sending request:`,r),h.send(t,"POST",d,n,15)})}Bo(e,t,n){const r=qs(),o=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=ca(),c=la(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.Oo(h.initMessageHeaders,t,n),h.encodeInitMessageHeaders=!0;const m=o.join("");L(de,`Creating RPC '${e}' stream ${r}: ${m}`,h);const y=a.createWebChannel(m,h);let A=!1,S=!1;const R=new $d({Io:D=>{S?L(de,`Not sending because RPC '${e}' stream ${r} is closed:`,D):(A||(L(de,`Opening RPC '${e}' stream ${r} transport.`),y.open(),A=!0),L(de,`RPC '${e}' stream ${r} sending:`,D),y.send(D))},To:()=>y.close()}),O=(D,$,U)=>{D.listen($,Q=>{try{U(Q)}catch(ae){setTimeout(()=>{throw ae},0)}})};return O(y,Qt.EventType.OPEN,()=>{S||(L(de,`RPC '${e}' stream ${r} transport opened.`),R.yo())}),O(y,Qt.EventType.CLOSE,()=>{S||(S=!0,L(de,`RPC '${e}' stream ${r} transport closed`),R.So())}),O(y,Qt.EventType.ERROR,D=>{S||(S=!0,Hn(de,`RPC '${e}' stream ${r} transport errored:`,D),R.So(new N(C.UNAVAILABLE,"The operation could not be completed")))}),O(y,Qt.EventType.MESSAGE,D=>{var $;if(!S){const U=D.data[0];Y(!!U);const Q=U,ae=Q.error||(($=Q[0])===null||$===void 0?void 0:$.error);if(ae){L(de,`RPC '${e}' stream ${r} received error:`,ae);const Ze=ae.status;let ve=function(v){const _=J[v];if(_!==void 0)return td(_)}(Ze),w=ae.message;ve===void 0&&(ve=C.INTERNAL,w="Unknown error status: "+Ze+" with message "+ae.message),S=!0,R.So(new N(ve,w)),y.close()}else L(de,`RPC '${e}' stream ${r} received:`,U),R.bo(U)}}),O(c,aa.STAT_EVENT,D=>{D.stat===sr.PROXY?L(de,`RPC '${e}' stream ${r} detected buffering proxy`):D.stat===sr.NOPROXY&&L(de,`RPC '${e}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{R.wo()},0),R}}function Hs(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function us(s){return new nd(s,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{constructor(e,t,n=1e3,r=1.5,o=6e4){this.ui=e,this.timerId=t,this.ko=n,this.qo=r,this.Qo=o,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),r=Math.max(0,t-n);r>0&&L("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,r,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jd{constructor(e,t,n,r,o,a,c,h){this.ui=e,this.Ho=n,this.Jo=r,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=h,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Ba(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===C.RESOURCE_EXHAUSTED?(dt(t.toString()),dt("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,r])=>{this.Yo===t&&this.P_(n,r)},n=>{e(()=>{const r=new N(C.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(r)})})}P_(e,t){const n=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(r=>{n(()=>this.I_(r))}),this.stream.onMessage(r=>{n(()=>++this.e_==1?this.E_(r):this.onNext(r))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return L("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(L("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class zd extends jd{constructor(e,t,n,r,o,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,r,a),this.serializer=o}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return Y(!!e.streamToken),this.lastStreamToken=e.streamToken,Y(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Y(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=ud(e.writeResults,e.commitTime),n=Tt(e.commitTime);return this.listener.g_(n,t)}p_(){const e={};e.database=ad(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(n=>cd(this.serializer,n))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gd extends class{}{constructor(e,t,n,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=r,this.y_=!1}w_(){if(this.y_)throw new N(C.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,n,r){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Mo(e,cr(t,n),r,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(C.UNKNOWN,o.toString())})}Lo(e,t,n,r,o){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,cr(t,n),r,a,c,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new N(C.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class qd{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(dt(t),this.D_=!1):L("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hd{constructor(e,t,n,r,o){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=o,this.k_._o(a=>{n.enqueueAndForget(async()=>{pn(this)&&(L("RemoteStore","Restarting streams for network reachability change."),await async function(h){const d=G(h);d.L_.add(4),await mn(d),d.q_.set("Unknown"),d.L_.delete(4),await hs(d)}(this))})}),this.q_=new qd(n,r)}}async function hs(s){if(pn(s))for(const e of s.B_)await e(!0)}async function mn(s){for(const e of s.B_)await e(!1)}function pn(s){return G(s).L_.size===0}async function $a(s,e,t){if(!os(e))throw e;s.L_.add(1),await mn(s),s.q_.set("Offline"),t||(t=()=>Md(s.localStore)),s.asyncQueue.enqueueRetryable(async()=>{L("RemoteStore","Retrying IndexedDB access"),await t(),s.L_.delete(1),await hs(s)})}function Ua(s,e){return e().catch(t=>$a(s,t,e))}async function ds(s){const e=G(s),t=Xe(e);let n=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;Kd(e);)try{const r=await kd(e.localStore,n);if(r===null){e.O_.length===0&&t.o_();break}n=r.batchId,Wd(e,r)}catch(r){await $a(e,r)}ja(e)&&za(e)}function Kd(s){return pn(s)&&s.O_.length<10}function Wd(s,e){s.O_.push(e);const t=Xe(s);t.r_()&&t.V_&&t.m_(e.mutations)}function ja(s){return pn(s)&&!Xe(s).n_()&&s.O_.length>0}function za(s){Xe(s).start()}async function Qd(s){Xe(s).p_()}async function Yd(s){const e=Xe(s);for(const t of s.O_)e.m_(t.mutations)}async function Xd(s,e,t){const n=s.O_.shift(),r=Rr.from(n,e,t);await Ua(s,()=>s.remoteSyncer.applySuccessfulWrite(r)),await ds(s)}async function Jd(s,e){e&&Xe(s).V_&&await async function(n,r){if(function(a){return ed(a)&&a!==C.ABORTED}(r.code)){const o=n.O_.shift();Xe(n).s_(),await Ua(n,()=>n.remoteSyncer.rejectFailedWrite(o.batchId,r)),await ds(n)}}(s,e),ja(s)&&za(s)}async function Io(s,e){const t=G(s);t.asyncQueue.verifyOperationInProgress(),L("RemoteStore","RemoteStore received new credentials");const n=pn(t);t.L_.add(3),await mn(t),n&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await hs(t)}async function Zd(s,e){const t=G(s);e?(t.L_.delete(2),await hs(t)):e||(t.L_.add(2),await mn(t),t.q_.set("Unknown"))}function Xe(s){return s.U_||(s.U_=function(t,n,r){const o=G(t);return o.w_(),new zd(n,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,r)}(s.datastore,s.asyncQueue,{Eo:()=>Promise.resolve(),Ro:Qd.bind(null,s),mo:Jd.bind(null,s),f_:Yd.bind(null,s),g_:Xd.bind(null,s)}),s.B_.push(async e=>{e?(s.U_.s_(),await ds(s)):(await s.U_.stop(),s.O_.length>0&&(L("RemoteStore",`Stopping write stream with ${s.O_.length} pending writes`),s.O_=[]))})),s.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dr{constructor(e,t,n,r,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=r,this.removalCallback=o,this.deferred=new lt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,r,o){const a=Date.now()+n,c=new Dr(e,t,a,r,o);return c.start(n),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Ga(s,e){if(dt("AsyncQueue",`${e}: ${s}`),os(s))return new N(C.UNAVAILABLE,`${e}: ${s}`);throw s}class ef{constructor(){this.queries=Ao(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,n){const r=G(t),o=r.queries;r.queries=Ao(),o.forEach((a,c)=>{for(const h of c.j_)h.onError(n)})})(this,new N(C.ABORTED,"Firestore shutting down"))}}function Ao(){return new Ct(s=>Aa(s),Ia)}function tf(s){s.Y_.forEach(e=>{e.next()})}var bo,So;(So=bo||(bo={})).ea="default",So.Cache="cache";class nf{constructor(e,t,n,r,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=r,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Ct(c=>Aa(c),Ia),this.Ma=new Map,this.xa=new Set,this.Oa=new Ee(M.comparator),this.Na=new Map,this.La=new Pr,this.Ba={},this.ka=new Map,this.qa=Rt.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function sf(s,e,t){const n=lf(s);try{const r=await function(a,c){const h=G(a),d=ne.now(),m=c.reduce((S,R)=>S.add(R.key),me());let y,A;return h.persistence.runTransaction("Locally write mutations","readwrite",S=>{let R=Jn(),O=me();return h.cs.getEntries(S,m).next(D=>{R=D,R.forEach(($,U)=>{U.isValidDocument()||(O=O.add($))})}).next(()=>h.localDocuments.getOverlayedDocuments(S,R)).next(D=>{y=D;const $=[];for(const U of c){const Q=Yh(U,y.get(U.key).overlayedDocument);Q!=null&&$.push(new gt(U.key,Q,ga(Q.value.mapValue),Me.exists(!0)))}return h.mutationQueue.addMutationBatch(S,d,$,c)}).next(D=>{A=D;const $=D.applyToLocalDocumentSet(y,O);return h.documentOverlayCache.saveOverlays(S,D.batchId,$)})}).then(()=>({batchId:A.batchId,changes:Sa(y)}))}(n.localStore,e);n.sharedClientState.addPendingMutation(r.batchId),function(a,c,h){let d=a.Ba[a.currentUser.toKey()];d||(d=new Ee(z)),d=d.insert(c,h),a.Ba[a.currentUser.toKey()]=d}(n,r.batchId,t),await fs(n,r.changes),await ds(n.remoteStore)}catch(r){const o=Ga(r,"Failed to persist write");t.reject(o)}}function Ro(s,e,t){const n=G(s);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const r=[];n.Fa.forEach((o,a)=>{const c=a.view.Z_(e);c.snapshot&&r.push(c.snapshot)}),function(a,c){const h=G(a);h.onlineState=c;let d=!1;h.queries.forEach((m,y)=>{for(const A of y.j_)A.Z_(c)&&(d=!0)}),d&&tf(h)}(n.eventManager,e),r.length&&n.Ca.d_(r),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function rf(s,e){const t=G(s),n=e.batch.batchId;try{const r=await Nd(t.localStore,e);Ha(t,n,null),qa(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await fs(t,r)}catch(r){await da(r)}}async function of(s,e,t){const n=G(s);try{const r=await function(a,c){const h=G(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let m;return h.mutationQueue.lookupMutationBatch(d,c).next(y=>(Y(y!==null),m=y.keys(),h.mutationQueue.removeMutationBatch(d,y))).next(()=>h.mutationQueue.performConsistencyCheck(d)).next(()=>h.documentOverlayCache.removeOverlaysForBatchId(d,m,c)).next(()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,m)).next(()=>h.localDocuments.getDocuments(d,m))})}(n.localStore,e);Ha(n,e,t),qa(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await fs(n,r)}catch(r){await da(r)}}function qa(s,e){(s.ka.get(e)||[]).forEach(t=>{t.resolve()}),s.ka.delete(e)}function Ha(s,e,t){const n=G(s);let r=n.Ba[n.currentUser.toKey()];if(r){const o=r.get(e);o&&(t?o.reject(t):o.resolve(),r=r.remove(e)),n.Ba[n.currentUser.toKey()]=r}}async function fs(s,e,t){const n=G(s),r=[],o=[],a=[];n.Fa.isEmpty()||(n.Fa.forEach((c,h)=>{a.push(n.Ka(h,e,t).then(d=>{var m;if((d||t)&&n.isPrimaryClient){const y=d?!d.fromCache:(m=void 0)===null||m===void 0?void 0:m.current;n.sharedClientState.updateQueryState(h.targetId,y?"current":"not-current")}if(d){r.push(d);const y=Vr.Wi(h.targetId,d);o.push(y)}}))}),await Promise.all(a),n.Ca.d_(r),await async function(h,d){const m=G(h);try{await m.persistence.runTransaction("notifyLocalViewChanges","readwrite",y=>P.forEach(d,A=>P.forEach(A.$i,S=>m.persistence.referenceDelegate.addReference(y,A.targetId,S)).next(()=>P.forEach(A.Ui,S=>m.persistence.referenceDelegate.removeReference(y,A.targetId,S)))))}catch(y){if(!os(y))throw y;L("LocalStore","Failed to update sequence numbers: "+y)}for(const y of d){const A=y.targetId;if(!y.fromCache){const S=m.os.get(A),R=S.snapshotVersion,O=S.withLastLimboFreeSnapshotVersion(R);m.os=m.os.insert(A,O)}}}(n.localStore,o))}async function af(s,e){const t=G(s);if(!t.currentUser.isEqual(e)){L("SyncEngine","User change. New user:",e.toKey());const n=await Fa(t.localStore,e);t.currentUser=e,function(o,a){o.ka.forEach(c=>{c.forEach(h=>{h.reject(new N(C.CANCELLED,a))})}),o.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await fs(t,n.hs)}}function lf(s){const e=G(s);return e.remoteStore.remoteSyncer.applySuccessfulWrite=rf.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=of.bind(null,e),e}class es{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=us(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return Ld(this.persistence,new Dd,e.initialUser,this.serializer)}Ga(e){return new Pd(Cr.Zr,this.serializer)}Wa(e){return new xd}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}es.provider={build:()=>new es};class hr{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ro(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=af.bind(null,this.syncEngine),await Zd(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new ef}()}createDatastore(e){const t=us(e.databaseInfo.databaseId),n=function(o){return new Ud(o)}(e.databaseInfo);return function(o,a,c,h){return new Gd(o,a,c,h)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(n,r,o,a,c){return new Hd(n,r,o,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Ro(this.syncEngine,t,0),function(){return To.D()?new To:new Fd}())}createSyncEngine(e,t){return function(r,o,a,c,h,d,m){const y=new nf(r,o,a,c,h,d);return m&&(y.Qa=!0),y}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(r){const o=G(r);L("RemoteStore","RemoteStore shutting down."),o.L_.add(5),await mn(o),o.k_.shutdown(),o.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}hr.provider={build:()=>new hr};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cf{constructor(e,t,n,r,o){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=r,this.user=fe.UNAUTHENTICATED,this.clientId=ha.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(n,async a=>{L("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(L("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new lt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Ga(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function Ks(s,e){s.asyncQueue.verifyOperationInProgress(),L("FirestoreClient","Initializing OfflineComponentProvider");const t=s.configuration;await e.initialize(t);let n=t.initialUser;s.setCredentialChangeListener(async r=>{n.isEqual(r)||(await Fa(e.localStore,r),n=r)}),e.persistence.setDatabaseDeletedListener(()=>s.terminate()),s._offlineComponents=e}async function Po(s,e){s.asyncQueue.verifyOperationInProgress();const t=await uf(s);L("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,s.configuration),s.setCredentialChangeListener(n=>Io(e.remoteStore,n)),s.setAppCheckTokenChangeListener((n,r)=>Io(e.remoteStore,r)),s._onlineComponents=e}async function uf(s){if(!s._offlineComponents)if(s._uninitializedComponentsProvider){L("FirestoreClient","Using user provided OfflineComponentProvider");try{await Ks(s,s._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(r){return r.name==="FirebaseError"?r.code===C.FAILED_PRECONDITION||r.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(t))throw t;Hn("Error using user provided cache. Falling back to memory cache: "+t),await Ks(s,new es)}}else L("FirestoreClient","Using default OfflineComponentProvider"),await Ks(s,new es);return s._offlineComponents}async function hf(s){return s._onlineComponents||(s._uninitializedComponentsProvider?(L("FirestoreClient","Using user provided OnlineComponentProvider"),await Po(s,s._uninitializedComponentsProvider._online)):(L("FirestoreClient","Using default OnlineComponentProvider"),await Po(s,new hr))),s._onlineComponents}function df(s){return hf(s).then(e=>e.syncEngine)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ka(s){const e={};return s.timeoutSeconds!==void 0&&(e.timeoutSeconds=s.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Co=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wa(s,e,t){if(!t)throw new N(C.INVALID_ARGUMENT,`Function ${s}() cannot be called with an empty ${e}.`)}function ff(s,e,t,n){if(e===!0&&n===!0)throw new N(C.INVALID_ARGUMENT,`${s} and ${t} cannot be used together.`)}function Vo(s){if(!M.isDocumentKey(s))throw new N(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${s} has ${s.length}.`)}function Do(s){if(M.isDocumentKey(s))throw new N(C.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${s} has ${s.length}.`)}function Or(s){if(s===void 0)return"undefined";if(s===null)return"null";if(typeof s=="string")return s.length>20&&(s=`${s.substring(0,20)}...`),JSON.stringify(s);if(typeof s=="number"||typeof s=="boolean")return""+s;if(typeof s=="object"){if(s instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(s);return e?`a custom ${e} object`:"an object"}}return typeof s=="function"?"a function":k()}function Qa(s,e){if("_delegate"in s&&(s=s._delegate),!(s instanceof e)){if(e.name===s.constructor.name)throw new N(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Or(s);throw new N(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oo{constructor(e){var t,n;if(e.host===void 0){if(e.ssl!==void 0)throw new N(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new N(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}ff("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ka((n=e.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,r){return n.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ms{constructor(e,t,n,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Oo({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new N(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Oo(e),e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new th;switch(n.type){case"firstParty":return new ih(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new N(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const n=Co.get(t);n&&(L("ComponentProvider","Removing Datastore"),Co.delete(t),n.terminate())}(this),Promise.resolve()}}function mf(s,e,t,n={}){var r;const o=(s=Qa(s,ms))._getSettings(),a=`${e}:${t}`;if(o.host!=="firestore.googleapis.com"&&o.host!==a&&Hn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),s._setSettings(Object.assign(Object.assign({},o),{host:a,ssl:!1})),n.mockUserToken){let c,h;if(typeof n.mockUserToken=="string")c=n.mockUserToken,h=fe.MOCK_USER;else{c=xc(n.mockUserToken,(r=s._app)===null||r===void 0?void 0:r.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new N(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");h=new fe(d)}s._authCredentials=new nh(new ua(c,h))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lr{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Lr(this.firestore,e,this._query)}}class ke{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new He(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ke(this.firestore,e,this._key)}}class He extends Lr{constructor(e,t,n){super(e,t,Lh(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ke(this.firestore,null,new M(e))}withConverter(e){return new He(this.firestore,e,this._path)}}function pf(s,e,...t){if(s=ut(s),Wa("collection","path",e),s instanceof ms){const n=W.fromString(e,...t);return Do(n),new He(s,null,n)}{if(!(s instanceof ke||s instanceof He))throw new N(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child(W.fromString(e,...t));return Do(n),new He(s.firestore,null,n)}}function gf(s,e,...t){if(s=ut(s),arguments.length===1&&(e=ha.newId()),Wa("doc","path",e),s instanceof ms){const n=W.fromString(e,...t);return Vo(n),new ke(s,null,new M(n))}{if(!(s instanceof ke||s instanceof He))throw new N(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child(W.fromString(e,...t));return Vo(n),new ke(s.firestore,s instanceof He?s.converter:null,new M(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lo{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Ba(this,"async_queue_retry"),this.Vu=()=>{const n=Hs();n&&L("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=e;const t=Hs();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Hs();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new lt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!os(e))throw e;L("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(n=>{this.Eu=n,this.du=!1;const r=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(n);throw dt("INTERNAL UNHANDLED ERROR: ",r),n}).then(n=>(this.du=!1,n))));return this.mu=t,t}enqueueAfterDelay(e,t,n){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const r=Dr.createAndSchedule(this,e,t,n,o=>this.yu(o));return this.Tu.push(r),r}fu(){this.Eu&&k()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,n)=>t.targetTimeMs-n.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class Ya extends ms{constructor(e,t,n,r){super(e,t,n,r),this.type="firestore",this._queue=new Lo,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Lo(e),this._firestoreClient=void 0,await e}}}function yf(s,e){const t=typeof s=="object"?s:ta(),n=typeof s=="string"?s:"(default)",r=hn(t,"firestore").getImmediate({identifier:n});if(!r._initialized){const o=Mc("firestore");o&&mf(r,...o)}return r}function vf(s){if(s._terminated)throw new N(C.FAILED_PRECONDITION,"The client has already been terminated.");return s._firestoreClient||_f(s),s._firestoreClient}function _f(s){var e,t,n;const r=s._freezeSettings(),o=function(c,h,d,m){return new _h(c,h,d,m.host,m.ssl,m.experimentalForceLongPolling,m.experimentalAutoDetectLongPolling,Ka(m.experimentalLongPollingOptions),m.useFetchStreams)}(s._databaseId,((e=s._app)===null||e===void 0?void 0:e.options.appId)||"",s._persistenceKey,r);s._componentsProvider||!((t=r.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((n=r.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(s._componentsProvider={_offline:r.localCache._offlineComponentProvider,_online:r.localCache._onlineComponentProvider}),s._firestoreClient=new cf(s._authCredentials,s._appCheckCredentials,s._queue,o,s._componentsProvider&&function(c){const h=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(h),_online:h}}(s._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e){this._byteString=e}static fromBase64String(e){try{return new un(Ve.fromBase64String(e))}catch(t){throw new N(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new un(Ve.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new N(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new oe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nr{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new N(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new N(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return z(this._lat,e._lat)||z(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Za{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,r){if(n.length!==r.length)return!1;for(let o=0;o<n.length;++o)if(n[o]!==r[o])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ef=/^__.*__$/;class wf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new gt(e,this.data,this.fieldMask,t,this.fieldTransforms):new fn(e,this.data,t,this.fieldTransforms)}}function el(s){switch(s){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw k()}}class Mr{constructor(e,t,n,r,o,a){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=r,o===void 0&&this.vu(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Mr(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),r=this.Fu({path:n,xu:!1});return r.Ou(e),r}Nu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),r=this.Fu({path:n,xu:!1});return r.vu(),r}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ts(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(el(this.Cu)&&Ef.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Tf{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||us(e)}Qu(e,t,n,r=!1){return new Mr({Cu:e,methodName:t,qu:n,path:oe.emptyPath(),xu:!1,ku:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function If(s){const e=s._freezeSettings(),t=us(s._databaseId);return new Tf(s._databaseId,!!e.ignoreUndefinedProperties,t)}function Af(s,e,t,n,r,o={}){const a=s.Qu(o.merge||o.mergeFields?2:0,e,t,r);rl("Data must be an object, but it was:",a,n);const c=nl(n,a);let h,d;if(o.merge)h=new Re(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){const m=[];for(const y of o.mergeFields){const A=bf(e,y,t);if(!a.contains(A))throw new N(C.INVALID_ARGUMENT,`Field '${A}' is specified in your field mask but missing from your input data.`);Pf(m,A)||m.push(A)}h=new Re(m),d=a.fieldTransforms.filter(y=>h.covers(y.field))}else h=null,d=a.fieldTransforms;return new wf(new Se(c),h,d)}class kr extends Nr{_toFieldTransform(e){return new Hh(e.path,new an)}isEqual(e){return e instanceof kr}}function tl(s,e){if(sl(s=ut(s)))return rl("Unsupported field value:",e,s),nl(s,e);if(s instanceof Nr)return function(n,r){if(!el(r.Cu))throw r.Bu(`${n._methodName}() can only be used with update() and set()`);if(!r.path)throw r.Bu(`${n._methodName}() is not currently supported inside arrays`);const o=n._toFieldTransform(r);o&&r.fieldTransforms.push(o)}(s,e),null;if(s===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),s instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(n,r){const o=[];let a=0;for(const c of n){let h=tl(c,r.Lu(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}}(s,e)}return function(n,r){if((n=ut(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return zh(r.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const o=ne.fromDate(n);return{timestampValue:lr(r.serializer,o)}}if(n instanceof ne){const o=new ne(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:lr(r.serializer,o)}}if(n instanceof Ja)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof un)return{bytesValue:sd(r.serializer,n._byteString)};if(n instanceof ke){const o=r.databaseId,a=n.firestore._databaseId;if(!a.isEqual(o))throw r.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:ka(n.firestore._databaseId||r.databaseId,n._key.path)}}if(n instanceof Za)return function(a,c){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(h=>{if(typeof h!="number")throw c.Bu("VectorValues must only contain numeric values.");return Sr(c.serializer,h)})}}}}}}(n,r);throw r.Bu(`Unsupported field value: ${Or(n)}`)}(s,e)}function nl(s,e){const t={};return ma(s)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):dn(s,(n,r)=>{const o=tl(r,e.Mu(n));o!=null&&(t[n]=o)}),{mapValue:{fields:t}}}function sl(s){return!(typeof s!="object"||s===null||s instanceof Array||s instanceof Date||s instanceof ne||s instanceof Ja||s instanceof un||s instanceof ke||s instanceof Nr||s instanceof Za)}function rl(s,e,t){if(!sl(t)||!function(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}(t)){const n=Or(t);throw n==="an object"?e.Bu(s+" a custom object"):e.Bu(s+" "+n)}}function bf(s,e,t){if((e=ut(e))instanceof Xa)return e._internalPath;if(typeof e=="string")return Rf(s,e);throw ts("Field path arguments must be of type string or ",s,!1,void 0,t)}const Sf=new RegExp("[~\\*/\\[\\]]");function Rf(s,e,t){if(e.search(Sf)>=0)throw ts(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,s,!1,void 0,t);try{return new Xa(...e.split("."))._internalPath}catch{throw ts(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,s,!1,void 0,t)}}function ts(s,e,t,n,r){const o=n&&!n.isEmpty(),a=r!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${n}`),a&&(h+=` in document ${r}`),h+=")"),new N(C.INVALID_ARGUMENT,c+s+h)}function Pf(s,e){return s.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cf(s,e,t){let n;return n=s?s.toFirestore(e):e,n}function Vf(s,e){const t=Qa(s.firestore,Ya),n=gf(s),r=Cf(s.converter,e);return Df(t,[Af(If(s.firestore),"addDoc",n._key,r,s.converter!==null,{}).toMutation(n._key,Me.exists(!1))]).then(()=>n)}function Df(s,e){return function(n,r){const o=new lt;return n.asyncQueue.enqueueAndForget(async()=>sf(await df(n),r,o)),o.promise}(vf(s),e)}function Of(){return new kr("serverTimestamp")}(function(e,t=!0){(function(r){Pt=r})(qu),We(new xe("firestore",(n,{instanceIdentifier:r,options:o})=>{const a=n.getProvider("app").getImmediate(),c=new Ya(new sh(n.getProvider("auth-internal")),new ah(n.getProvider("app-check-internal")),function(d,m){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new N(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Qn(d.options.projectId,m)}(a,r),a);return o=Object.assign({useFetchStreams:t},o),c._setSettings(o),c},"PUBLIC").setMultipleInstances(!0)),Ce(oo,"4.7.3",e),Ce(oo,"4.7.3","esm2017")})();var Lf="firebase",Nf="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ce(Lf,Nf,"app");const il="@firebase/installations",xr="0.6.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ol=1e4,al=`w:${xr}`,ll="FIS_v2",Mf="https://firebaseinstallations.googleapis.com/v1",kf=60*60*1e3,xf="installations",Ff="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bf={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},mt=new is(xf,Ff,Bf);function cl(s){return s instanceof Je&&s.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ul({projectId:s}){return`${Mf}/projects/${s}/installations`}function hl(s){return{token:s.token,requestStatus:2,expiresIn:Uf(s.expiresIn),creationTime:Date.now()}}async function dl(s,e){const n=(await e.json()).error;return mt.create("request-failed",{requestName:s,serverCode:n.code,serverMessage:n.message,serverStatus:n.status})}function fl({apiKey:s}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":s})}function $f(s,{refreshToken:e}){const t=fl(s);return t.append("Authorization",jf(e)),t}async function ml(s){const e=await s();return e.status>=500&&e.status<600?s():e}function Uf(s){return Number(s.replace("s","000"))}function jf(s){return`${ll} ${s}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zf({appConfig:s,heartbeatServiceProvider:e},{fid:t}){const n=ul(s),r=fl(s),o=e.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&r.append("x-firebase-client",d)}const a={fid:t,authVersion:ll,appId:s.appId,sdkVersion:al},c={method:"POST",headers:r,body:JSON.stringify(a)},h=await ml(()=>fetch(n,c));if(h.ok){const d=await h.json();return{fid:d.fid||t,registrationStatus:2,refreshToken:d.refreshToken,authToken:hl(d.authToken)}}else throw await dl("Create Installation",h)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pl(s){return new Promise(e=>{setTimeout(e,s)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gf(s){return btoa(String.fromCharCode(...s)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qf=/^[cdef][\w-]{21}$/,dr="";function Hf(){try{const s=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(s),s[0]=112+s[0]%16;const t=Kf(s);return qf.test(t)?t:dr}catch{return dr}}function Kf(s){return Gf(s).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ps(s){return`${s.appName}!${s.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gl=new Map;function yl(s,e){const t=ps(s);vl(t,e),Wf(t,e)}function vl(s,e){const t=gl.get(s);if(t)for(const n of t)n(e)}function Wf(s,e){const t=Qf();t&&t.postMessage({key:s,fid:e}),Yf()}let ot=null;function Qf(){return!ot&&"BroadcastChannel"in self&&(ot=new BroadcastChannel("[Firebase] FID Change"),ot.onmessage=s=>{vl(s.data.key,s.data.fid)}),ot}function Yf(){gl.size===0&&ot&&(ot.close(),ot=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xf="firebase-installations-database",Jf=1,pt="firebase-installations-store";let Ws=null;function Fr(){return Ws||(Ws=Zo(Xf,Jf,{upgrade:(s,e)=>{switch(e){case 0:s.createObjectStore(pt)}}})),Ws}async function ns(s,e){const t=ps(s),r=(await Fr()).transaction(pt,"readwrite"),o=r.objectStore(pt),a=await o.get(t);return await o.put(e,t),await r.done,(!a||a.fid!==e.fid)&&yl(s,e.fid),e}async function _l(s){const e=ps(s),n=(await Fr()).transaction(pt,"readwrite");await n.objectStore(pt).delete(e),await n.done}async function gs(s,e){const t=ps(s),r=(await Fr()).transaction(pt,"readwrite"),o=r.objectStore(pt),a=await o.get(t),c=e(a);return c===void 0?await o.delete(t):await o.put(c,t),await r.done,c&&(!a||a.fid!==c.fid)&&yl(s,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Br(s){let e;const t=await gs(s.appConfig,n=>{const r=Zf(n),o=em(s,r);return e=o.registrationPromise,o.installationEntry});return t.fid===dr?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function Zf(s){const e=s||{fid:Hf(),registrationStatus:0};return El(e)}function em(s,e){if(e.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(mt.create("app-offline"));return{installationEntry:e,registrationPromise:r}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},n=tm(s,t);return{installationEntry:t,registrationPromise:n}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:nm(s)}:{installationEntry:e}}async function tm(s,e){try{const t=await zf(s,e);return ns(s.appConfig,t)}catch(t){throw cl(t)&&t.customData.serverCode===409?await _l(s.appConfig):await ns(s.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function nm(s){let e=await No(s.appConfig);for(;e.registrationStatus===1;)await pl(100),e=await No(s.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:n}=await Br(s);return n||t}return e}function No(s){return gs(s,e=>{if(!e)throw mt.create("installation-not-found");return El(e)})}function El(s){return sm(s)?{fid:s.fid,registrationStatus:0}:s}function sm(s){return s.registrationStatus===1&&s.registrationTime+ol<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rm({appConfig:s,heartbeatServiceProvider:e},t){const n=im(s,t),r=$f(s,t),o=e.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&r.append("x-firebase-client",d)}const a={installation:{sdkVersion:al,appId:s.appId}},c={method:"POST",headers:r,body:JSON.stringify(a)},h=await ml(()=>fetch(n,c));if(h.ok){const d=await h.json();return hl(d)}else throw await dl("Generate Auth Token",h)}function im(s,{fid:e}){return`${ul(s)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $r(s,e=!1){let t;const n=await gs(s.appConfig,o=>{if(!wl(o))throw mt.create("not-registered");const a=o.authToken;if(!e&&lm(a))return o;if(a.requestStatus===1)return t=om(s,e),o;{if(!navigator.onLine)throw mt.create("app-offline");const c=um(o);return t=am(s,c),c}});return t?await t:n.authToken}async function om(s,e){let t=await Mo(s.appConfig);for(;t.authToken.requestStatus===1;)await pl(100),t=await Mo(s.appConfig);const n=t.authToken;return n.requestStatus===0?$r(s,e):n}function Mo(s){return gs(s,e=>{if(!wl(e))throw mt.create("not-registered");const t=e.authToken;return hm(t)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function am(s,e){try{const t=await rm(s,e),n=Object.assign(Object.assign({},e),{authToken:t});return await ns(s.appConfig,n),t}catch(t){if(cl(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await _l(s.appConfig);else{const n=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await ns(s.appConfig,n)}throw t}}function wl(s){return s!==void 0&&s.registrationStatus===2}function lm(s){return s.requestStatus===2&&!cm(s)}function cm(s){const e=Date.now();return e<s.creationTime||s.creationTime+s.expiresIn<e+kf}function um(s){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},s),{authToken:e})}function hm(s){return s.requestStatus===1&&s.requestTime+ol<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dm(s){const e=s,{installationEntry:t,registrationPromise:n}=await Br(e);return n?n.catch(console.error):$r(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fm(s,e=!1){const t=s;return await mm(t),(await $r(t,e)).token}async function mm(s){const{registrationPromise:e}=await Br(s);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pm(s){if(!s||!s.options)throw Qs("App Configuration");if(!s.name)throw Qs("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!s.options[t])throw Qs(t);return{appName:s.name,projectId:s.options.projectId,apiKey:s.options.apiKey,appId:s.options.appId}}function Qs(s){return mt.create("missing-app-config-values",{valueName:s})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tl="installations",gm="installations-internal",ym=s=>{const e=s.getProvider("app").getImmediate(),t=pm(e),n=hn(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:n,_delete:()=>Promise.resolve()}},vm=s=>{const e=s.getProvider("app").getImmediate(),t=hn(e,Tl).getImmediate();return{getId:()=>dm(t),getToken:r=>fm(t,r)}};function _m(){We(new xe(Tl,ym,"PUBLIC")),We(new xe(gm,vm,"PRIVATE"))}_m();Ce(il,xr);Ce(il,xr,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ss="analytics",Em="firebase_id",wm="origin",Tm=60*1e3,Im="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",Ur="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _e=new yr("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Am={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},Ie=new is("analytics","Analytics",Am);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bm(s){if(!s.startsWith(Ur)){const e=Ie.create("invalid-gtag-resource",{gtagURL:s});return _e.warn(e.message),""}return s}function Il(s){return Promise.all(s.map(e=>e.catch(t=>t)))}function Sm(s,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(s,e)),t}function Rm(s,e){const t=Sm("firebase-js-sdk-policy",{createScriptURL:bm}),n=document.createElement("script"),r=`${Ur}?l=${s}&id=${e}`;n.src=t?t==null?void 0:t.createScriptURL(r):r,n.async=!0,document.head.appendChild(n)}function Pm(s){let e=[];return Array.isArray(window[s])?e=window[s]:window[s]=e,e}async function Cm(s,e,t,n,r,o){const a=n[r];try{if(a)await e[a];else{const h=(await Il(t)).find(d=>d.measurementId===r);h&&await e[h.appId]}}catch(c){_e.error(c)}s("config",r,o)}async function Vm(s,e,t,n,r){try{let o=[];if(r&&r.send_to){let a=r.send_to;Array.isArray(a)||(a=[a]);const c=await Il(t);for(const h of a){const d=c.find(y=>y.measurementId===h),m=d&&e[d.appId];if(m)o.push(m);else{o=[];break}}}o.length===0&&(o=Object.values(e)),await Promise.all(o),s("event",n,r||{})}catch(o){_e.error(o)}}function Dm(s,e,t,n){async function r(o,...a){try{if(o==="event"){const[c,h]=a;await Vm(s,e,t,c,h)}else if(o==="config"){const[c,h]=a;await Cm(s,e,t,n,c,h)}else if(o==="consent"){const[c,h]=a;s("consent",c,h)}else if(o==="get"){const[c,h,d]=a;s("get",c,h,d)}else if(o==="set"){const[c]=a;s("set",c)}else s(o,...a)}catch(c){_e.error(c)}}return r}function Om(s,e,t,n,r){let o=function(...a){window[n].push(arguments)};return window[r]&&typeof window[r]=="function"&&(o=window[r]),window[r]=Dm(o,s,e,t),{gtagCore:o,wrappedGtag:window[r]}}function Lm(s){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(Ur)&&t.src.includes(s))return t;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nm=30,Mm=1e3;class km{constructor(e={},t=Mm){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Al=new km;function xm(s){return new Headers({Accept:"application/json","x-goog-api-key":s})}async function Fm(s){var e;const{appId:t,apiKey:n}=s,r={method:"GET",headers:xm(n)},o=Im.replace("{app-id}",t),a=await fetch(o,r);if(a.status!==200&&a.status!==304){let c="";try{const h=await a.json();!((e=h.error)===null||e===void 0)&&e.message&&(c=h.error.message)}catch{}throw Ie.create("config-fetch-failed",{httpStatus:a.status,responseMessage:c})}return a.json()}async function Bm(s,e=Al,t){const{appId:n,apiKey:r,measurementId:o}=s.options;if(!n)throw Ie.create("no-app-id");if(!r){if(o)return{measurementId:o,appId:n};throw Ie.create("no-api-key")}const a=e.getThrottleMetadata(n)||{backoffCount:0,throttleEndTimeMillis:Date.now()},c=new jm;return setTimeout(async()=>{c.abort()},Tm),bl({appId:n,apiKey:r,measurementId:o},a,c,e)}async function bl(s,{throttleEndTimeMillis:e,backoffCount:t},n,r=Al){var o;const{appId:a,measurementId:c}=s;try{await $m(n,e)}catch(h){if(c)return _e.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${h==null?void 0:h.message}]`),{appId:a,measurementId:c};throw h}try{const h=await Fm(s);return r.deleteThrottleMetadata(a),h}catch(h){const d=h;if(!Um(d)){if(r.deleteThrottleMetadata(a),c)return _e.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${d==null?void 0:d.message}]`),{appId:a,measurementId:c};throw h}const m=Number((o=d==null?void 0:d.customData)===null||o===void 0?void 0:o.httpStatus)===503?Yi(t,r.intervalMillis,Nm):Yi(t,r.intervalMillis),y={throttleEndTimeMillis:Date.now()+m,backoffCount:t+1};return r.setThrottleMetadata(a,y),_e.debug(`Calling attemptFetch again in ${m} millis`),bl(s,y,n,r)}}function $m(s,e){return new Promise((t,n)=>{const r=Math.max(e-Date.now(),0),o=setTimeout(t,r);s.addEventListener(()=>{clearTimeout(o),n(Ie.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function Um(s){if(!(s instanceof Je)||!s.customData)return!1;const e=Number(s.customData.httpStatus);return e===429||e===500||e===503||e===504}class jm{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function zm(s,e,t,n,r){if(r&&r.global){s("event",t,n);return}else{const o=await e,a=Object.assign(Object.assign({},n),{send_to:o});s("event",t,a)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gm(){if(pr())try{await gr()}catch(s){return _e.warn(Ie.create("indexeddb-unavailable",{errorInfo:s==null?void 0:s.toString()}).message),!1}else return _e.warn(Ie.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function qm(s,e,t,n,r,o,a){var c;const h=Bm(s);h.then(S=>{t[S.measurementId]=S.appId,s.options.measurementId&&S.measurementId!==s.options.measurementId&&_e.warn(`The measurement ID in the local Firebase config (${s.options.measurementId}) does not match the measurement ID fetched from the server (${S.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(S=>_e.error(S)),e.push(h);const d=Gm().then(S=>{if(S)return n.getId()}),[m,y]=await Promise.all([h,d]);Lm(o)||Rm(o,m.measurementId),r("js",new Date);const A=(c=a==null?void 0:a.config)!==null&&c!==void 0?c:{};return A[wm]="firebase",A.update=!0,y!=null&&(A[Em]=y),r("config",m.measurementId,A),m.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hm{constructor(e){this.app=e}_delete(){return delete tn[this.app.options.appId],Promise.resolve()}}let tn={},ko=[];const xo={};let Ys="dataLayer",Km="gtag",Fo,Sl,Bo=!1;function Wm(){const s=[];if(Qo()&&s.push("This is a browser extension environment."),Yo()||s.push("Cookies are not available."),s.length>0){const e=s.map((n,r)=>`(${r+1}) ${n}`).join(" "),t=Ie.create("invalid-analytics-context",{errorInfo:e});_e.warn(t.message)}}function Qm(s,e,t){Wm();const n=s.options.appId;if(!n)throw Ie.create("no-app-id");if(!s.options.apiKey)if(s.options.measurementId)_e.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${s.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw Ie.create("no-api-key");if(tn[n]!=null)throw Ie.create("already-exists",{id:n});if(!Bo){Pm(Ys);const{wrappedGtag:o,gtagCore:a}=Om(tn,ko,xo,Ys,Km);Sl=o,Fo=a,Bo=!0}return tn[n]=qm(s,ko,xo,e,Fo,Ys,t),new Hm(s)}function Ym(s=ta()){s=ut(s);const e=hn(s,ss);return e.isInitialized()?e.getImmediate():Xm(s)}function Xm(s,e={}){const t=hn(s,ss);if(t.isInitialized()){const r=t.getImmediate();if(Gn(e,t.getOptions()))return r;throw Ie.create("already-initialized")}return t.initialize({options:e})}async function Jm(){if(Qo()||!Yo()||!pr())return!1;try{return await gr()}catch{return!1}}function Zm(s,e,t,n){s=ut(s),zm(Sl,tn[s.app.options.appId],e,t,n).catch(r=>_e.error(r))}const $o="@firebase/analytics",Uo="0.10.8";function ep(){We(new xe(ss,(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),r=e.getProvider("installations-internal").getImmediate();return Qm(n,r,t)},"PUBLIC")),We(new xe("analytics-internal",s,"PRIVATE")),Ce($o,Uo),Ce($o,Uo,"esm2017");function s(e){try{const t=e.getProvider(ss).getImmediate();return{logEvent:(n,r,o)=>Zm(t,n,r,o)}}catch(t){throw Ie.create("interop-component-reg-failed",{reason:t})}}}ep();let Rl;function tp(){const e=ea({apiKey:"AIzaSyC2oOMCF6T2qjW6vsuiwKp7u4eA1QG9V1U",authDomain:"amazesv1.firebaseapp.com",projectId:"amazesv1",storageBucket:"amazesv1.firebasestorage.app",messagingSenderId:"5056362888",appId:"1:5056362888:web:edf69d4b49937651a0623d",measurementId:"G-PLNRBMVC30"});Rl=yf(e),Jm().then(t=>{t&&Ym(e)})}function np(){return Rl}const sp="daily_times";async function rp(s){const e=np(),t=wc();await Vf(pf(e,sp),{day:t,timeMs:s,createdAt:Of()})}class at{constructor(){this.STORAGE_KEY="labyrinth_leap_progress",this.CURRENT_VERSION=2,this.progress=this.loadProgress(),this.migrateProgressIfNeeded()}static getInstance(){return at.instance||(at.instance=new at),at.instance}getCurrentLevel(){return this.progress.currentLevel}getHighestLevel(){return this.progress.highestLevel}isLevelUnlocked(e){if(typeof e=="number")return e<=this.progress.highestLevel;if(this.progress.unlockedLevels.has(e))return!0;const t=this.extractNumericLevel(e);return t!==null?t<=this.progress.highestLevel:!1}unlockLevel(e){this.progress.unlockedLevels.add(e),this.saveProgress()}unlockLevels(e){e.forEach(t=>this.progress.unlockedLevels.add(t)),this.saveProgress()}completeLevel(e,t,n,r,o,a){if(typeof e=="number"){this.completeLevelLegacy(e,t,n,r);return}this.completeLevelV2(e,t,n,r,o,a)}completeLevelLegacy(e,t,n,r){const o=this.progress.levelStats.get(e)||{completed:!1,bestTime:1/0,stars:0,attempts:0,lastPlayed:new Date};if(o.completed=!0,o.attempts++,o.lastPlayed=new Date,t<o.bestTime&&(o.bestTime=t),n>o.stars){const a=n-o.stars;o.stars=n,this.progress.totalStars+=a}this.progress.totalCoins+=r,this.progress.levelStats.set(e,o),e>=this.progress.highestLevel&&(this.progress.highestLevel=e+1),this.saveProgress()}completeLevelV2(e,t,n,r,o,a){const c=this.progress.levelStatsV2.get(e)||{levelId:e,completed:!1,bestTime:1/0,stars:0,attempts:0,lastPlayed:new Date,firstCompleted:void 0,objectives:new Map},h=c.completed;if(c.completed=!0,c.attempts++,c.lastPlayed=new Date,h||(c.firstCompleted=new Date),t<c.bestTime&&(c.bestTime=t),n>c.stars){const m=n-c.stars;c.stars=n,this.progress.totalStars+=m}o&&(c.objectives=new Map(o)),this.progress.totalCoins+=r,this.progress.levelStatsV2.set(e,c),a&&a.forEach(m=>this.progress.unlockedLevels.add(m));const d=this.extractNumericLevel(e);d!==null&&d>=this.progress.highestLevel&&(this.progress.highestLevel=d+1),this.saveProgress()}getLevelStats(e){return typeof e=="number"?this.progress.levelStats.get(e):this.progress.levelStatsV2.get(e)}getObjectiveProgress(e,t){const n=this.progress.levelStatsV2.get(e);return n==null?void 0:n.objectives.get(t)}getCompletedLevels(){const e=Array.from(this.progress.levelStats.entries()).filter(([n,r])=>r.completed).map(([n,r])=>n),t=Array.from(this.progress.levelStatsV2.entries()).filter(([n,r])=>r.completed).map(([n,r])=>n);return{legacy:e,v2:t}}extractNumericLevel(e){const t=e.match(/(\d+)/);return t?parseInt(t[1],10):null}loadProgress(){try{const e=localStorage.getItem(this.STORAGE_KEY);if(e){const t=JSON.parse(e),n=new Map;t.levelStats&&t.levelStats.forEach(([o,a])=>{const c={...a,lastPlayed:a.lastPlayed?new Date(a.lastPlayed):new Date};n.set(o,c)});const r=new Map;return t.levelStatsV2&&t.levelStatsV2.forEach(([o,a])=>{const c={...a,lastPlayed:new Date(a.lastPlayed),firstCompleted:a.firstCompleted?new Date(a.firstCompleted):void 0,objectives:new Map(a.objectives||[])};c.objectives.forEach(h=>{h.completedAt&&(h.completedAt=new Date(h.completedAt))}),r.set(o,c)}),{currentLevel:t.currentLevel||1,highestLevel:t.highestLevel||1,totalStars:t.totalStars||0,totalCoins:t.totalCoins||0,levelStats:n,levelStatsV2:r,unlockedLevels:new Set(t.unlockedLevels||[]),version:t.version||1}}}catch(e){console.warn("Failed to load progress:",e)}return{currentLevel:1,highestLevel:1,totalStars:0,totalCoins:0,levelStats:new Map,levelStatsV2:new Map,unlockedLevels:new Set(["level-001-tutorial"]),version:this.CURRENT_VERSION}}saveProgress(){try{const e=Array.from(this.progress.levelStatsV2.entries()).map(([n,r])=>[n,{...r,objectives:Array.from(r.objectives.entries())}]),t={...this.progress,levelStats:Array.from(this.progress.levelStats.entries()),levelStatsV2:e,unlockedLevels:Array.from(this.progress.unlockedLevels),version:this.CURRENT_VERSION};localStorage.setItem(this.STORAGE_KEY,JSON.stringify(t))}catch(e){console.warn("Failed to save progress:",e)}}migrateProgressIfNeeded(){this.progress.version<this.CURRENT_VERSION&&(console.log(`Migrating progress from version ${this.progress.version} to ${this.CURRENT_VERSION}`),this.progress.version<2&&this.migrateToV2(),this.progress.version=this.CURRENT_VERSION,this.saveProgress())}migrateToV2(){this.progress.levelStatsV2||(this.progress.levelStatsV2=new Map),this.progress.unlockedLevels||(this.progress.unlockedLevels=new Set),this.progress.levelStats.forEach((e,t)=>{const n=`level-${t.toString().padStart(3,"0")}-migrated`;if(!this.progress.levelStatsV2.has(n)){const r={levelId:n,completed:e.completed,bestTime:e.bestTime,stars:e.stars,attempts:e.attempts,lastPlayed:e.lastPlayed,objectives:new Map};this.progress.levelStatsV2.set(n,r),e.completed&&this.progress.unlockedLevels.add(n)}}),this.progress.unlockedLevels.add("level-001-tutorial"),console.log(`Migrated ${this.progress.levelStats.size} legacy levels to new format`)}getPlayStats(){const e=Array.from(this.progress.levelStats.values()).filter(n=>n.completed).length,t=Array.from(this.progress.levelStatsV2.values()).filter(n=>n.completed).length;return{totalLevelsCompleted:e+t,legacyLevelsCompleted:e,v2LevelsCompleted:t,averageAttempts:this.getAverageAttempts(),totalPlayTime:this.getTotalPlayTime(),streakDays:this.getStreakDays(),unlockedLevelsCount:this.progress.unlockedLevels.size}}getAverageAttempts(){const e=Array.from(this.progress.levelStats.values()).filter(o=>o.completed),t=Array.from(this.progress.levelStatsV2.values()).filter(o=>o.completed),n=[...e,...t];return n.length===0?0:n.reduce((o,a)=>o+a.attempts,0)/n.length}getTotalPlayTime(){const e=Array.from(this.progress.levelStats.values()).filter(n=>n.completed).reduce((n,r)=>n+r.bestTime,0),t=Array.from(this.progress.levelStatsV2.values()).filter(n=>n.completed).reduce((n,r)=>n+r.bestTime,0);return e+t}getStreakDays(){const e=new Date;let t=0;for(let n=0;n<30;n++){const r=new Date(e);r.setDate(e.getDate()-n);const o=Array.from(this.progress.levelStats.values()).some(c=>new Date(c.lastPlayed).toDateString()===r.toDateString()),a=Array.from(this.progress.levelStatsV2.values()).some(c=>new Date(c.lastPlayed).toDateString()===r.toDateString());if(o||a)t++;else if(n>0)break}return t}getUnlockedLevels(){return Array.from(this.progress.unlockedLevels)}resetProgress(){this.progress={currentLevel:1,highestLevel:1,totalStars:0,totalCoins:0,levelStats:new Map,levelStatsV2:new Map,unlockedLevels:new Set(["level-001-tutorial"]),version:this.CURRENT_VERSION},this.saveProgress()}exportProgress(){return JSON.stringify({...this.progress,levelStats:Array.from(this.progress.levelStats.entries()),levelStatsV2:Array.from(this.progress.levelStatsV2.entries()).map(([e,t])=>[e,{...t,objectives:Array.from(t.objectives.entries())}]),unlockedLevels:Array.from(this.progress.unlockedLevels)},null,2)}importProgress(e){try{const t=JSON.parse(e);if(!t||typeof t!="object")throw new Error("Invalid progress data format");const n={currentLevel:t.currentLevel||1,highestLevel:t.highestLevel||1,totalStars:t.totalStars||0,totalCoins:t.totalCoins||0,levelStats:new Map(t.levelStats||[]),levelStatsV2:new Map,unlockedLevels:new Set(t.unlockedLevels||["level-001-tutorial"]),version:t.version||this.CURRENT_VERSION};return t.levelStatsV2&&t.levelStatsV2.forEach(([r,o])=>{const a={...o,lastPlayed:new Date(o.lastPlayed),firstCompleted:o.firstCompleted?new Date(o.firstCompleted):void 0,objectives:new Map(o.objectives||[])};n.levelStatsV2.set(r,a)}),this.progress=n,this.saveProgress(),!0}catch(t){return console.error("Failed to import progress:",t),!1}}}const X=24;class ip extends Z.Scene{constructor(){super("Game"),this.gameState=null,this.arrowButtons={},this.currentLevel=1,this.orbs=[]}create(){this.cameras.main.setBackgroundColor("#F5E6D3"),this.gameCore=new Tc,this.levelService=new qo,this.progressManager=at.getInstance(),this.subscribeToGameEvents();const e=this.registry.get("selectedLevel")||this.progressManager.getCurrentLevel();this.currentLevel=e,this.initLevel()}async initLevel(){try{this.children.removeAll(),this.orbs=[],this.input.off("pointerdown"),this.input.off("pointermove");const e=await this.levelService.loadLevel(this.currentLevel.toString());this.gameCore.initializeLevel(e),this.gameState=this.gameCore.getGameState(),this.createUI(),this.renderGameState(),this.createArrowButtons(),this.updateArrowButtons(),this.setupInputHandlers(),this.gameCore.startGame()}catch(e){console.error("Failed to initialize level:",e)}}subscribeToGameEvents(){this.gameCore.on("game.initialized",e=>{this.gameState=e.state,console.log("Game initialized for level:",e.levelDefinition.id)}),this.gameCore.on("game.started",e=>{console.log("Game started at:",new Date(e.timestamp))}),this.gameCore.on("game.paused",e=>{console.log("Game paused after:",e.duration,"ms")}),this.gameCore.on("game.resumed",e=>{console.log("Game resumed after pause of:",e.pausedDuration,"ms")}),this.gameCore.on("game.completed",e=>{this.showCompletionUI(e.result)}),this.gameCore.on("game.failed",e=>{console.log("Game failed:",e.reason)}),this.gameCore.on("player.moved",e=>{this.animatePlayerMovement(e.from,e.to),this.updateArrowButtons()}),this.gameCore.on("player.move.attempted",e=>{e.blocked&&this.showMoveBlockedFeedback(e.direction,e.reason)}),this.gameCore.on("orb.collected",e=>{this.animateOrbCollection(e.orbId,e.position),this.updateHintText(),this.showScorePopup(e.position,e.score)}),this.gameCore.on("orb.collection.attempted",e=>{e.success||console.log("Orb collection failed:",e.reason)}),this.gameCore.on("objective.progress",e=>{console.log(`Objective ${e.objectiveId} progress: ${e.newProgress}/${e.target}`),e.completed&&this.showObjectiveCompletedFeedback(e.objectiveId)}),this.gameCore.on("objective.completed",e=>{console.log("Objective completed:",e.objectiveId)}),this.gameCore.on("score.changed",e=>{console.log(`Score changed: ${e.previousScore} -> ${e.newScore} (${e.change>0?"+":""}${e.change})`)}),this.gameCore.on("level.loaded",e=>{console.log("Level loaded:",e.levelId,e.result.success?"successfully":"with errors")}),this.gameCore.on("level.generated",e=>{console.log(`Level generated in ${e.generationTime}ms:`,{levelId:e.levelId,seed:e.seed,mazeSize:e.mazeSize,orbCount:e.orbCount})}),this.gameCore.on("state.changed",e=>{this.gameState=e.state,this.updateUI();const t=e.changes.filter(n=>["status","score","player.position"].includes(n.property));t.length>0&&console.log("Significant state changes:",t)}),this.gameCore.on("state.validated",e=>{e.valid||console.warn("State validation failed:",e.errors),e.warnings.length>0&&console.warn("State validation warnings:",e.warnings)}),this.gameCore.on("error",e=>{console.error("Game error:",e.error.message,e.context),this.showErrorFeedback(e.error.message,e.recoverable)}),this.gameCore.on("debug",e=>{e.level==="error"?console.error("[Game Debug]",e.message,e.data):e.level==="warn"?console.warn("[Game Debug]",e.message,e.data):e.level==="info"?console.info("[Game Debug]",e.message,e.data):console.log("[Game Debug]",e.message,e.data)})}createUI(){if(!this.gameState)return;this.titleText=this.add.text(this.scale.width/2,50,"Labyrinth Leap",{fontFamily:"Arial, sans-serif",fontSize:"36px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5),this.subtitleText=this.add.text(this.scale.width/2,80,"Collect all the orbs and find your way to the goal!",{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#8B7355"}).setOrigin(.5);const e=120;this.add.circle(this.scale.width/2-60,e,12,13789470).setStrokeStyle(2,9127187),this.levelText=this.add.text(this.scale.width/2-60,e,this.currentLevel.toString(),{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#FFFFFF",fontStyle:"bold"}).setOrigin(.5);for(let t=0;t<3;t++){const n=t<this.currentLevel-1?8368233:13882323;this.add.circle(this.scale.width/2-20+t*20,e,6,n)}this.timerText=this.add.text(this.scale.width/2+60,e,"00:00",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#D2691E",fontStyle:"bold"}).setOrigin(.5),this.hintText=this.add.text(this.scale.width/2,150,"Collect all the orbs to unlock the goal!",{fontFamily:"Arial, sans-serif",fontSize:"12px",color:"#8B7355",backgroundColor:"#F0E68C",padding:{x:8,y:4}}).setOrigin(.5),this.spaceHintText=this.add.text(this.scale.width/2,this.scale.height-40,"Use arrow buttons or tap to move.",{fontFamily:"Arial, sans-serif",fontSize:"12px",color:"#8B7355"}).setOrigin(.5)}update(e,t){if(!this.gameState||this.gameState.status!=="playing")return;const n=this.gameCore.getCurrentTime(),r=Math.floor(n/6e4),o=Math.floor(n%6e4/1e3);this.timerText.setText(`${r.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`)}renderGameState(){this.gameState&&(this.drawMaze(),this.createPlayer(),this.createOrbs())}updateUI(){this.gameState&&this.updateHintText()}cx(e){if(!this.gameState)return 0;const t=this.gameState.maze[0].length*X;return(this.scale.width-t)/2+e*X+X/2}cy(e){return 200+e*X+X/2}drawMaze(){if(!this.gameState)return;const e=this.gameState.maze,t=e[0].length,n=e.length,r=t*X,o=n*X,a=(this.scale.width-r)/2,c=200;this.add.rectangle(a+r/2,c+o/2,r+20,o+20,8368233).setStrokeStyle(4,7048794),this.mazeGraphics=this.add.graphics(),this.mazeGraphics.fillStyle(16115411);for(let h=0;h<n;h++)for(let d=0;d<t;d++){const m=e[h][d],y=a+d*X,A=c+h*X;this.mazeGraphics.fillRect(y+2,A+2,X-4,X-4),m.walls&1&&this.mazeGraphics.fillRect(y+X-2,A+2,4,X-4),m.walls&2&&this.mazeGraphics.fillRect(y+2,A+X-2,X-4,4),m.walls&4&&this.mazeGraphics.fillRect(y-2,A+2,4,X-4),m.walls&8&&this.mazeGraphics.fillRect(y+2,A-2,X-4,4)}}createPlayer(){if(!this.gameState)return;const e=this.gameState.player.position;this.player=this.add.circle(this.cx(e.x),this.cy(e.y),8,4286945).setStrokeStyle(2,1981066)}createOrbs(){if(!this.gameState)return;this.orbs.forEach(t=>t.destroy()),this.orbs=[];const e=[16739179,5164484,16770669,9822675,15961e3];this.gameState.orbs.forEach((t,n)=>{if(!t.collected){const r=e[n%e.length],o=this.add.circle(this.cx(t.position.x),this.cy(t.position.y),6,r).setStrokeStyle(2,9127187);o.setData("orbId",t.id),this.orbs.push(o)}})}createArrowButtons(){const e=this.scale.width/2,t=this.scale.height-100,n=40,r=60,o={fillStyle:16115411,lineStyle:{width:2,color:13808780}};this.arrowButtons.up=this.add.graphics(o),this.arrowButtons.up.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.up.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.up.fillStyle(9139029),this.arrowButtons.up.fillTriangle(0,-8,-6,6,6,6),this.arrowButtons.up.setPosition(e,t-r),this.arrowButtons.up.setInteractive(new Z.Geom.Rectangle(-n/2,-n/2,n,n),Z.Geom.Rectangle.Contains),this.arrowButtons.up.on("pointerup",()=>this.handleButtonMove("up")),this.arrowButtons.down=this.add.graphics(o),this.arrowButtons.down.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.down.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.down.fillStyle(9139029),this.arrowButtons.down.fillTriangle(0,8,-6,-6,6,-6),this.arrowButtons.down.setPosition(e,t+r),this.arrowButtons.down.setInteractive(new Z.Geom.Rectangle(-n/2,-n/2,n,n),Z.Geom.Rectangle.Contains),this.arrowButtons.down.on("pointerup",()=>this.handleButtonMove("down")),this.arrowButtons.left=this.add.graphics(o),this.arrowButtons.left.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.left.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.left.fillStyle(9139029),this.arrowButtons.left.fillTriangle(-8,0,6,-6,6,6),this.arrowButtons.left.setPosition(e-r,t),this.arrowButtons.left.setInteractive(new Z.Geom.Rectangle(-n/2,-n/2,n,n),Z.Geom.Rectangle.Contains),this.arrowButtons.left.on("pointerup",()=>this.handleButtonMove("left")),this.arrowButtons.right=this.add.graphics(o),this.arrowButtons.right.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.right.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.right.fillStyle(9139029),this.arrowButtons.right.fillTriangle(8,0,-6,-6,-6,6),this.arrowButtons.right.setPosition(e+r,t),this.arrowButtons.right.setInteractive(new Z.Geom.Rectangle(-n/2,-n/2,n,n),Z.Geom.Rectangle.Contains),this.arrowButtons.right.on("pointerup",()=>this.handleButtonMove("right"));const a=this.add.graphics(o);a.fillRoundedRect(-n/2,-n/2,n,n,8),a.strokeRoundedRect(-n/2,-n/2,n,n,8),a.fillStyle(13789470),a.fillCircle(0,0,6),a.setPosition(e,t),a.setInteractive(new Z.Geom.Rectangle(-n/2,-n/2,n,n),Z.Geom.Rectangle.Contains),a.on("pointerup",()=>this.dropOrb())}dropOrb(){console.log("Drop orb at current position")}setupInputHandlers(){this.input.on("pointerdown",e=>this.handlePointerInput(e.worldX,e.worldY)),this.input.on("pointermove",e=>{e.isDown&&this.handlePointerInput(e.worldX,e.worldY)}),this.setupKeyboardInput()}setupKeyboardInput(){var a,c,h,d,m,y,A,S,R,O,D,$,U;const e=(a=this.input.keyboard)==null?void 0:a.createCursorKeys(),t=(c=this.input.keyboard)==null?void 0:c.addKeys("W,S,A,D");e&&((h=e.up)==null||h.on("down",()=>this.handlePlayerMove("up")),(d=e.down)==null||d.on("down",()=>this.handlePlayerMove("down")),(m=e.left)==null||m.on("down",()=>this.handlePlayerMove("left")),(y=e.right)==null||y.on("down",()=>this.handlePlayerMove("right"))),t&&((A=t.W)==null||A.on("down",()=>this.handlePlayerMove("up")),(S=t.S)==null||S.on("down",()=>this.handlePlayerMove("down")),(R=t.A)==null||R.on("down",()=>this.handlePlayerMove("left")),(O=t.D)==null||O.on("down",()=>this.handlePlayerMove("right")));const n=(D=this.input.keyboard)==null?void 0:D.addKey(Z.Input.Keyboard.KeyCodes.SPACE),r=($=this.input.keyboard)==null?void 0:$.addKey(Z.Input.Keyboard.KeyCodes.ESC);n==null||n.on("down",()=>this.handlePauseToggle()),r==null||r.on("down",()=>this.handlePauseToggle());const o=(U=this.input.keyboard)==null?void 0:U.addKey(Z.Input.Keyboard.KeyCodes.R);o==null||o.on("down",()=>this.handleReset())}handlePauseToggle(){if(!(!this.gameCore||!this.gameState))try{this.gameState.status==="playing"?(this.gameCore.pauseGame(),console.log("Game paused")):this.gameState.status==="paused"&&(this.gameCore.resumeGame(),console.log("Game resumed"))}catch(e){console.error("Error toggling pause:",e),this.showErrorFeedback("Failed to pause/resume game",!0)}}handleReset(){if(this.gameCore)try{this.gameCore.resetGame(),console.log("Game reset")}catch(e){console.error("Error resetting game:",e),this.showErrorFeedback("Failed to reset game",!0)}}handleButtonMove(e){const t=e==="up"?"up":e==="down"?"down":e==="left"?"left":"right",n=this.arrowButtons[t];n&&this.tweens.add({targets:n,scaleX:.9,scaleY:.9,duration:100,yoyo:!0,ease:"Power2"}),this.handlePlayerMove(e)}handlePlayerMove(e){if(!this.gameCore||!this.gameState){console.warn("Cannot move player: game not initialized");return}if(this.gameState.status!=="playing"){console.log("Move ignored: game not in playing state");return}try{const t=this.gameCore.movePlayer(e);t.success?console.log(`Player moved ${e} to position (${t.newPosition.x}, ${t.newPosition.y})`):(this.showMoveBlockedFeedback(this.directionToCardinal(e),t.reason),console.log("Move failed:",t.reason))}catch(t){console.error("Error during player move:",t),this.showErrorFeedback("Failed to move player",!0)}}directionToCardinal(e){switch(e){case"up":return"north";case"down":return"south";case"left":return"west";case"right":return"east";default:return"unknown"}}handlePointerInput(e,t){if(!this.gameState){console.warn("Cannot handle pointer input: game state not available");return}if(this.gameState.status!=="playing"){console.log("Pointer input ignored: game not in playing state");return}try{const n=this.gameState.maze;if(!n||n.length===0||!n[0]){console.error("Invalid maze data");return}const r=n[0].length,o=n.length,a=r*X,c=(this.scale.width-a)/2,h=200,d=Math.floor((e-c)/X),m=Math.floor((t-h)/X);if(d<0||m<0||d>=r||m>=o){console.log("Pointer input outside maze bounds");return}const y=this.gameState.player.position,A=d-y.x,S=m-y.y;if(Math.abs(A)+Math.abs(S)!==1){console.log("Pointer input not adjacent to player");return}let R;if(A===1)R="right";else if(A===-1)R="left";else if(S===1)R="down";else if(S===-1)R="up";else{console.error("Invalid direction calculation");return}this.handlePlayerMove(R)}catch(n){console.error("Error handling pointer input:",n),this.showErrorFeedback("Input handling error",!0)}}updateArrowButtons(){if(!this.gameState)return;const e=this.gameState.player.position,t=this.gameState.maze[e.y][e.x];this.arrowButtons.up.setAlpha(t.walls&8?1:.4),this.arrowButtons.down.setAlpha(t.walls&2?1:.4),this.arrowButtons.left.setAlpha(t.walls&4?1:.4),this.arrowButtons.right.setAlpha(t.walls&1?1:.4)}animatePlayerMovement(e,t){this.player&&this.tweens.add({targets:this.player,x:this.cx(t.x),y:this.cy(t.y),duration:150})}animateOrbCollection(e,t){const n=this.orbs.findIndex(r=>r.getData("orbId")===e);if(n>=0){const r=this.orbs[n];this.tweens.add({targets:r,scaleX:0,scaleY:0,alpha:0,duration:200,onComplete:()=>{r.destroy()}}),this.orbs.splice(n,1)}}updateHintText(){if(!this.gameState||!this.hintText)return;const e=this.gameState.orbs.filter(n=>n.collected).length,t=this.gameState.orbs.length;e>=t?(this.hintText.setText("All orbs collected! Find the goal!"),this.hintText.setStyle({backgroundColor:"#90EE90"})):(this.hintText.setText(`Collect all orbs to unlock the goal! (${e}/${t})`),this.hintText.setStyle({backgroundColor:"#F0E68C"}))}showCompletionUI(e){const t=this.gameCore.getCurrentTime();this.add.text(this.scale.width/2,this.scale.height/2-20,`Level ${this.currentLevel} Complete!`,{fontFamily:"Arial, sans-serif",fontSize:"20px",color:"#7FB069",backgroundColor:"#F5E6D3",padding:{x:15,y:8}}).setOrigin(.5);const n=Math.floor(t/6e4),r=Math.floor(t%6e4/1e3);this.add.text(this.scale.width/2,this.scale.height/2+10,`Time: ${n.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}`,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#8B7355",backgroundColor:"#F5E6D3",padding:{x:15,y:8}}).setOrigin(.5),rp(t).catch(()=>{}),this.time.delayedCall(2e3,()=>{this.currentLevel++,this.initLevel()})}showMoveBlockedFeedback(e,t){this.player&&this.tweens.add({targets:this.player,x:this.player.x+(e==="east"?5:e==="west"?-5:0),y:this.player.y+(e==="south"?5:e==="north"?-5:0),duration:100,yoyo:!0,ease:"Power2"})}showScorePopup(e,t){const n=this.add.text(this.cx(e.x),this.cy(e.y),`+${t}`,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#FFD700",fontStyle:"bold"}).setOrigin(.5);this.tweens.add({targets:n,y:n.y-30,alpha:0,duration:1e3,ease:"Power2",onComplete:()=>n.destroy()})}showObjectiveCompletedFeedback(e){const t=this.add.text(this.scale.width/2,180,"Objective Complete!",{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#7FB069",backgroundColor:"#F5E6D3",padding:{x:10,y:5}}).setOrigin(.5);this.time.delayedCall(2e3,()=>{this.tweens.add({targets:t,alpha:0,duration:500,onComplete:()=>t.destroy()})})}showErrorFeedback(e,t){const n=t?"#FFA500":"#FF0000",r=this.add.text(this.scale.width/2,this.scale.height-80,t?"Warning: "+e:"Error: "+e,{fontFamily:"Arial, sans-serif",fontSize:"12px",color:n,backgroundColor:"#F5E6D3",padding:{x:8,y:4},wordWrap:{width:this.scale.width-40}}).setOrigin(.5);this.time.delayedCall(5e3,()=>{r&&r.active&&this.tweens.add({targets:r,alpha:0,duration:500,onComplete:()=>r.destroy()})})}destroy(){this.gameCore&&console.log("GameScene destroyed, cleaning up event listeners"),super.destroy()}}class op extends Z.Scene{constructor(){super("Boot")}preload(){}create(){this.scene.start("LevelSelect")}}class ap extends Z.Scene{constructor(){super("LevelSelect"),this.currentPage=0,this.LEVELS_PER_PAGE=20,this.availableLevels=[],this.levelMetadata=new Map}async create(){this.progressManager=at.getInstance(),this.levelService=new qo,this.cameras.main.setBackgroundColor("#F5E6D3"),this.showLoading();try{await this.loadAvailableLevels(),this.hideLoading(),this.createUI(),this.createLevelGrid()}catch(e){this.hideLoading(),this.showError(`Failed to load levels: ${e instanceof Error?e.message:"Unknown error"}`)}}async loadAvailableLevels(){try{console.log("🔍 Loading available levels..."),this.availableLevels=await this.levelService.listAvailableLevels(),console.log(`✅ Found ${this.availableLevels.length} levels:`,this.availableLevels),await this.preloadLevelMetadata(),console.log("✅ Level metadata preloaded")}catch(e){throw console.error("❌ Failed to load available levels:",e),e}}async preloadLevelMetadata(){const e=this.currentPage*this.LEVELS_PER_PAGE,t=Math.min(e+this.LEVELS_PER_PAGE,this.availableLevels.length),n=this.availableLevels.slice(e,t);try{(await this.levelService.loadLevels(n,{validateSchema:!1,includeMetadata:!0})).forEach(o=>{this.levelMetadata.set(o.id,o)})}catch(r){console.warn("Failed to preload some level metadata:",r)}}showLoading(){this.loadingText=this.add.text(this.scale.width/2,this.scale.height/2,"Loading levels...",{fontFamily:"Arial, sans-serif",fontSize:"24px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5)}hideLoading(){this.loadingText&&(this.loadingText.destroy(),this.loadingText=void 0)}showError(e){this.errorText=this.add.text(this.scale.width/2,this.scale.height/2,e,{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FF6B6B",fontStyle:"bold",wordWrap:{width:this.scale.width-100}}).setOrigin(.5),this.add.text(this.scale.width/2,this.scale.height/2+60,"Tap to retry",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.scene.restart())}createUI(){this.add.text(this.scale.width/2,50,"Select Level",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5);const e=this.progressManager.getPlayStats(),t=this.progressManager.getTotalStars();this.add.text(this.scale.width/2,90,`Levels: ${this.availableLevels.length} | Stars: ${t} | Coins: ${e.totalCoins||1}`,{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#8B7355"}).setOrigin(.5),this.currentPage>0&&this.add.text(50,this.scale.height/2,"◀",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.previousPage());const n=Math.floor(this.availableLevels.length/this.LEVELS_PER_PAGE);this.currentPage<n&&this.add.text(this.scale.width-50,this.scale.height/2,"▶",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.nextPage())}createLevelGrid(){const e=this.currentPage*this.LEVELS_PER_PAGE,t=Math.min(e+this.LEVELS_PER_PAGE,this.availableLevels.length),n=this.availableLevels.slice(e,t),r=5,o=60,a=70,c=(this.scale.width-(r-1)*a)/2,h=150;n.forEach((d,m)=>{const y=m%r,A=Math.floor(m/r),S=c+y*a,R=h+A*a;this.createLevelButton(d,S,R,o)})}createLevelButton(e,t,n,r){const o=this.progressManager.isLevelUnlocked(e),a=this.progressManager.getLevelStats(e),c=this.levelMetadata.get(e);let h=o?a!=null&&a.completed?8368233:16115411:13882323;if(c&&o){const y={easy:8368233,medium:16032353,hard:15167313,expert:10309341};h=a!=null&&a.completed?y[c.metadata.difficulty]:16115411}const d=this.add.circle(t,n,r/2,h).setStrokeStyle(3,o?7048794:11119017),m=this.getLevelDisplayText(e,c);if(this.add.text(t,n-8,m,{fontFamily:"Arial, sans-serif",fontSize:"12px",color:o?"#FFFFFF":"#808080",fontStyle:"bold"}).setOrigin(.5),c&&o&&this.add.text(t,n+8,c.metadata.difficulty.charAt(0).toUpperCase(),{fontFamily:"Arial, sans-serif",fontSize:"10px",color:o?"#FFFFFF":"#808080"}).setOrigin(.5),a!=null&&a.completed&&a.stars>0)for(let y=0;y<a.stars;y++)this.add.text(t-15+y*15,n+20,"★",{fontFamily:"Arial, sans-serif",fontSize:"10px",color:"#FFD700"}).setOrigin(.5);o&&d.setInteractive({useHandCursor:!0}).on("pointerup",()=>this.selectLevel(e)).on("pointerover",()=>this.showLevelTooltip(e,t,n)).on("pointerout",()=>this.hideLevelTooltip())}getLevelDisplayText(e,t){if(t!=null&&t.metadata.name)return t.metadata.name.length>8?t.metadata.name.substring(0,6)+"...":t.metadata.name;const n=e.match(/(\d+)/);return n?n[1]:e.length>6?e.substring(0,6):e}showLevelTooltip(e,t,n){const r=this.levelMetadata.get(e);if(!r)return;const o=`${r.metadata.name}
${r.metadata.difficulty} • ${r.metadata.estimatedTime}s`,a=this.add.rectangle(t,n-80,120,40,0,.8).setStrokeStyle(1,16777215),c=this.add.text(t,n-80,o,{fontFamily:"Arial, sans-serif",fontSize:"10px",color:"#FFFFFF",align:"center"}).setOrigin(.5);a.setData("isTooltip",!0),c.setData("isTooltip",!0)}hideLevelTooltip(){this.children.list.forEach(e=>{e.getData("isTooltip")&&e.destroy()})}async selectLevel(e){try{const t=await this.levelService.loadLevel(e);this.registry.set("selectedLevelId",e),this.registry.set("selectedLevelDefinition",t),this.scene.start("Game")}catch(t){console.error("Failed to load level:",t),this.showError(`Failed to load level: ${t instanceof Error?t.message:"Unknown error"}`)}}async previousPage(){this.currentPage>0&&(this.currentPage--,await this.refreshPage())}async nextPage(){const e=Math.floor(this.availableLevels.length/this.LEVELS_PER_PAGE);this.currentPage<e&&(this.currentPage++,await this.refreshPage())}async refreshPage(){this.children.removeAll(),this.showLoading();try{await this.preloadLevelMetadata(),this.hideLoading(),this.createUI(),this.createLevelGrid()}catch(e){this.hideLoading(),this.showError(`Failed to load page: ${e instanceof Error?e.message:"Unknown error"}`)}}}tp();const lp=360,cp=640,up={type:Z.AUTO,parent:"app",backgroundColor:"#0f0f12",scale:{mode:Z.Scale.FIT,autoCenter:Z.Scale.CENTER_BOTH,width:lp,height:cp},physics:{default:"arcade",arcade:{gravity:{y:0},debug:!1}},scene:[op,ap,ip]};new Z.Game(up);
