import{P as ee}from"./phaser-0RJB29YE.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class pc{constructor(){this.listeners=new Map}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}once(e,t){const n=i=>{this.off(e,n),t(i)};this.on(e,n)}off(e,t){const n=this.listeners.get(e);if(n){const i=n.indexOf(t);i>-1&&n.splice(i,1)}}emit(e,t){const n=this.listeners.get(e);n&&[...n].forEach(o=>{try{o(t)}catch(a){const l=a instanceof Error?a:new Error(String(a));if(this.errorHandler)try{this.errorHandler(l,e,t)}catch(h){console.error(`Error in event error handler for ${e}:`,h),console.error("Original error:",l)}else console.error(`Error in event listener for ${e}:`,l)}})}setErrorHandler(e){this.errorHandler=e}removeErrorHandler(){this.errorHandler=void 0}removeAllListeners(e){e?this.listeners.delete(e):this.listeners.clear()}listenerCount(e){var t;return((t=this.listeners.get(e))==null?void 0:t.length)??0}eventNames(){return Array.from(this.listeners.keys()).filter(e=>this.listenerCount(e)>0)}hasListeners(e){return this.listenerCount(e)>0}}const Qi=class Qi{static createInitialState(e,t){const n=Date.now(),i={position:{x:0,y:0},inventory:[],stats:{totalMoves:0,orbsCollected:0,timeElapsed:0,powerupsUsed:0,hintsUsed:0},activePowerups:[]},o=e.config.objectives.map(a=>({id:a.id,type:a.type,target:a.target,current:0,completed:!1,description:a.description,required:a.required}));return{levelId:e.id,levelConfig:e,status:"initializing",startTime:n,currentTime:n,pausedTime:0,player:i,maze:[],orbs:[],powerups:[],objectives:o,score:0,moves:0,hintsUsed:0,version:this.STATE_VERSION,seed:t}}static cloneState(e){return this.deepClone(e)}static deepClone(e){if(e===null||typeof e!="object")return e;if(e instanceof Date)return new Date(e.getTime());if(e instanceof Array)return e.map(t=>this.deepClone(t));if(typeof e=="object"){const t={};for(const n in e)e.hasOwnProperty(n)&&(t[n]=this.deepClone(e[n]));return t}return e}static updateState(e,t){const n=this.cloneState(e);return this.deepMerge(n,t)}static deepMerge(e,t){const n={...e};for(const i in t)if(t.hasOwnProperty(i)){const o=t[i],a=e[i];o!==void 0&&(this.isObject(o)&&this.isObject(a)?n[i]=this.deepMerge(a,o):n[i]=o)}return n}static isObject(e){return e&&typeof e=="object"&&!Array.isArray(e)&&!(e instanceof Date)}static updatePlayerPosition(e,t){return this.updateState(e,{player:{position:t,stats:{totalMoves:e.player.stats.totalMoves+1}},moves:e.moves+1,currentTime:Date.now()})}static updatePlayerStats(e,t){return this.updateState(e,{player:{stats:{...e.player.stats,...t}}})}static collectOrb(e,t){const n=e.orbs.findIndex(a=>a.id===t);if(n===-1||e.orbs[n].collected)return e;const i=e.orbs[n],o=[...e.orbs];return o[n]={...i,collected:!0,collectedAt:Date.now()},this.updateState(e,{orbs:o,score:e.score+i.value,player:{stats:{orbsCollected:e.player.stats.orbsCollected+1}}})}static updateObjectiveProgress(e,t,n){const i=e.objectives.findIndex(h=>h.id===t);if(i===-1)return e;const o=e.objectives[i],a=[...e.objectives],l=n>=o.target;return a[i]={...o,current:n,completed:l,completedAt:l&&!o.completed?Date.now():o.completedAt},this.updateState(e,{objectives:a})}static updateGameStatus(e,t){const n=Date.now(),i={status:t,currentTime:n};if(t==="playing"&&e.status==="paused"){const o=n-e.currentTime;i.pausedTime=e.pausedTime+o}else if(t==="completed"||t==="failed"){const o=n-e.startTime-e.pausedTime;i.player={stats:{timeElapsed:o}},t==="completed"&&(i.result=this.calculateGameResult(e,o))}return this.updateState(e,i)}static calculateGameResult(e,t){const n=e.objectives.filter(l=>l.completed).length,o=e.objectives.filter(l=>l.required).every(l=>l.completed);let a=0;if(o){a=1;const l=e.levelConfig.progression.starThresholds;for(const h of l.sort((d,m)=>m.stars-d.stars)){let d=!0;if(h.requirements.time&&t>h.requirements.time*1e3&&(d=!1),h.requirements.moves&&e.moves>h.requirements.moves&&(d=!1),h.requirements.orbsCollected&&e.player.stats.orbsCollected<h.requirements.orbsCollected&&(d=!1),d){a=Math.max(a,h.stars);break}}}return{completed:o,score:e.score,stars:a,completionTime:t,totalMoves:e.moves,orbsCollected:e.player.stats.orbsCollected,objectivesCompleted:n,constraintsViolated:0}}static validateState(e){return this.validateStateDetailed(e).valid}static validateStateDetailed(e){const t=[],n=[];try{return!e||typeof e!="object"?(t.push({field:"state",message:"State must be a valid object",code:"INVALID_STATE_TYPE"}),{valid:!1,errors:t,warnings:n}):(this.validateRequiredFields(e,t),this.validatePlayer(e.player,e.maze,t,n),this.validateMaze(e.maze,t,n),this.validateOrbs(e.orbs,e.maze,t,n),this.validatePowerups(e.powerups,e.maze,t,n),this.validateObjectives(e.objectives,e,t,n),this.validateGameMetrics(e,t,n),this.validateTiming(e,t,n),this.validateCrossReferences(e,t,n),{valid:t.length===0,errors:t,warnings:n})}catch(i){return t.push({field:"validation",message:`Validation failed with error: ${i.message}`,code:"VALIDATION_ERROR"}),{valid:!1,errors:t,warnings:n}}}static validateRequiredFields(e,t){const n=["levelId","levelConfig","status","startTime","currentTime","player","maze","orbs","objectives","score","moves"];for(const i of n)(!(i in e)||e[i]===null||e[i]===void 0)&&t.push({field:i,message:`Required field '${i}' is missing or null`,code:"MISSING_REQUIRED_FIELD"});(typeof e.levelId!="string"||e.levelId.length===0)&&t.push({field:"levelId",message:"Level ID must be a non-empty string",code:"INVALID_LEVEL_ID"}),["initializing","playing","paused","completed","failed"].includes(e.status)||t.push({field:"status",message:"Invalid game status",code:"INVALID_STATUS"})}static validatePlayer(e,t,n,i){var o;if(!e){n.push({field:"player",message:"Player object is required",code:"MISSING_PLAYER"});return}if(!this.isValidPosition(e.position))n.push({field:"player.position",message:"Player position is invalid",code:"INVALID_PLAYER_POSITION"});else if(t.length>0){const a=t.length,l=((o=t[0])==null?void 0:o.length)||0;(e.position.x<0||e.position.x>=l||e.position.y<0||e.position.y>=a)&&n.push({field:"player.position",message:`Player position (${e.position.x}, ${e.position.y}) is outside maze bounds (${l}x${a})`,code:"PLAYER_OUT_OF_BOUNDS"})}if(Array.isArray(e.inventory)?e.inventory.forEach((a,l)=>{(!a.id||typeof a.id!="string")&&n.push({field:`player.inventory[${l}].id`,message:"Inventory item must have a valid ID",code:"INVALID_INVENTORY_ITEM"}),(typeof a.quantity!="number"||a.quantity<0)&&n.push({field:`player.inventory[${l}].quantity`,message:"Inventory item quantity must be a non-negative number",code:"INVALID_INVENTORY_QUANTITY"})}):n.push({field:"player.inventory",message:"Player inventory must be an array",code:"INVALID_INVENTORY"}),!e.stats)n.push({field:"player.stats",message:"Player stats are required",code:"MISSING_PLAYER_STATS"});else{const a=e.stats;(typeof a.totalMoves!="number"||a.totalMoves<0)&&n.push({field:"player.stats.totalMoves",message:"Total moves must be a non-negative number",code:"INVALID_TOTAL_MOVES"}),(typeof a.orbsCollected!="number"||a.orbsCollected<0)&&n.push({field:"player.stats.orbsCollected",message:"Orbs collected must be a non-negative number",code:"INVALID_ORBS_COLLECTED"}),(typeof a.timeElapsed!="number"||a.timeElapsed<0)&&n.push({field:"player.stats.timeElapsed",message:"Time elapsed must be a non-negative number",code:"INVALID_TIME_ELAPSED"})}}static validateMaze(e,t,n){var o;if(!Array.isArray(e)){t.push({field:"maze",message:"Maze must be an array",code:"INVALID_MAZE_TYPE"});return}if(e.length===0){t.push({field:"maze",message:"Maze cannot be empty",code:"EMPTY_MAZE"});return}const i=((o=e[0])==null?void 0:o.length)||0;if(i===0){t.push({field:"maze[0]",message:"Maze rows cannot be empty",code:"EMPTY_MAZE_ROW"});return}e.forEach((a,l)=>{if(!Array.isArray(a)){t.push({field:`maze[${l}]`,message:"Maze row must be an array",code:"INVALID_MAZE_ROW"});return}a.length!==i&&t.push({field:`maze[${l}]`,message:`Maze row ${l} has width ${a.length}, expected ${i}`,code:"INCONSISTENT_MAZE_WIDTH"}),a.forEach((h,d)=>{if(!h||typeof h!="object"){t.push({field:`maze[${l}][${d}]`,message:"Maze cell must be an object",code:"INVALID_MAZE_CELL"});return}(typeof h.walls!="number"||h.walls<0||h.walls>15)&&t.push({field:`maze[${l}][${d}].walls`,message:"Cell walls must be a number between 0 and 15",code:"INVALID_CELL_WALLS"}),["floor","wall","special"].includes(h.type)||t.push({field:`maze[${l}][${d}].type`,message:"Cell type must be floor, wall, or special",code:"INVALID_CELL_TYPE"})})})}static validateOrbs(e,t,n,i){if(!Array.isArray(e)){n.push({field:"orbs",message:"Orbs must be an array",code:"INVALID_ORBS_TYPE"});return}const o=new Set;e.forEach((a,l)=>{var h;if(!a||typeof a!="object"){n.push({field:`orbs[${l}]`,message:"Orb must be an object",code:"INVALID_ORB"});return}if(!a.id||typeof a.id!="string"?n.push({field:`orbs[${l}].id`,message:"Orb must have a valid ID",code:"INVALID_ORB_ID"}):o.has(a.id)?n.push({field:`orbs[${l}].id`,message:`Duplicate orb ID: ${a.id}`,code:"DUPLICATE_ORB_ID"}):o.add(a.id),!this.isValidPosition(a.position))n.push({field:`orbs[${l}].position`,message:"Orb position is invalid",code:"INVALID_ORB_POSITION"});else if(t.length>0){const d=t.length,m=((h=t[0])==null?void 0:h.length)||0;(a.position.x<0||a.position.x>=m||a.position.y<0||a.position.y>=d)&&n.push({field:`orbs[${l}].position`,message:`Orb position (${a.position.x}, ${a.position.y}) is outside maze bounds`,code:"ORB_OUT_OF_BOUNDS"})}(typeof a.value!="number"||a.value<0)&&n.push({field:`orbs[${l}].value`,message:"Orb value must be a non-negative number",code:"INVALID_ORB_VALUE"}),typeof a.collected!="boolean"&&n.push({field:`orbs[${l}].collected`,message:"Orb collected status must be a boolean",code:"INVALID_ORB_COLLECTED"})})}static validatePowerups(e,t,n,i){if(!Array.isArray(e)){n.push({field:"powerups",message:"Powerups must be an array",code:"INVALID_POWERUPS_TYPE"});return}const o=new Set;e.forEach((a,l)=>{if(!a||typeof a!="object"){n.push({field:`powerups[${l}]`,message:"Powerup must be an object",code:"INVALID_POWERUP"});return}!a.id||typeof a.id!="string"?n.push({field:`powerups[${l}].id`,message:"Powerup must have a valid ID",code:"INVALID_POWERUP_ID"}):o.has(a.id)?n.push({field:`powerups[${l}].id`,message:`Duplicate powerup ID: ${a.id}`,code:"DUPLICATE_POWERUP_ID"}):o.add(a.id),this.isValidPosition(a.position)||n.push({field:`powerups[${l}].position`,message:"Powerup position is invalid",code:"INVALID_POWERUP_POSITION"}),(!a.type||typeof a.type!="string")&&n.push({field:`powerups[${l}].type`,message:"Powerup must have a valid type",code:"INVALID_POWERUP_TYPE"})})}static validateObjectives(e,t,n,i){if(!Array.isArray(e)){n.push({field:"objectives",message:"Objectives must be an array",code:"INVALID_OBJECTIVES_TYPE"});return}const o=new Set;let a=!1;e.forEach((l,h)=>{if(!l||typeof l!="object"){n.push({field:`objectives[${h}]`,message:"Objective must be an object",code:"INVALID_OBJECTIVE"});return}!l.id||typeof l.id!="string"?n.push({field:`objectives[${h}].id`,message:"Objective must have a valid ID",code:"INVALID_OBJECTIVE_ID"}):o.has(l.id)?n.push({field:`objectives[${h}].id`,message:`Duplicate objective ID: ${l.id}`,code:"DUPLICATE_OBJECTIVE_ID"}):o.add(l.id),(typeof l.current!="number"||l.current<0)&&n.push({field:`objectives[${h}].current`,message:"Objective current progress must be a non-negative number",code:"INVALID_OBJECTIVE_CURRENT"}),(typeof l.target!="number"||l.target<0)&&n.push({field:`objectives[${h}].target`,message:"Objective target must be a non-negative number",code:"INVALID_OBJECTIVE_TARGET"}),l.current>l.target&&!["time_limit","move_limit"].includes(l.type)&&i.push({field:`objectives[${h}].current`,message:`Objective current (${l.current}) exceeds target (${l.target})`,code:"OBJECTIVE_EXCEEDS_TARGET"}),typeof l.completed!="boolean"&&n.push({field:`objectives[${h}].completed`,message:"Objective completed status must be a boolean",code:"INVALID_OBJECTIVE_COMPLETED"}),l.required&&(a=!0)}),!a&&e.length>0&&i.push({field:"objectives",message:"No required objectives found",code:"NO_REQUIRED_OBJECTIVES"})}static validateGameMetrics(e,t,n){var i;(typeof e.score!="number"||e.score<0)&&t.push({field:"score",message:"Score must be a non-negative number",code:"INVALID_SCORE"}),(typeof e.moves!="number"||e.moves<0)&&t.push({field:"moves",message:"Moves must be a non-negative number",code:"INVALID_MOVES"}),(typeof e.hintsUsed!="number"||e.hintsUsed<0)&&t.push({field:"hintsUsed",message:"Hints used must be a non-negative number",code:"INVALID_HINTS_USED"}),(i=e.player)!=null&&i.stats&&e.moves!==e.player.stats.totalMoves&&n.push({field:"moves",message:`Game moves (${e.moves}) doesn't match player stats (${e.player.stats.totalMoves})`,code:"MOVES_MISMATCH"})}static validateTiming(e,t,n){(typeof e.startTime!="number"||e.startTime<=0)&&t.push({field:"startTime",message:"Start time must be a positive number",code:"INVALID_START_TIME"}),(typeof e.currentTime!="number"||e.currentTime<0)&&t.push({field:"currentTime",message:"Current time must be a non-negative number",code:"INVALID_CURRENT_TIME"}),e.startTime>0&&e.currentTime>0&&e.currentTime<e.startTime&&t.push({field:"currentTime",message:"Current time cannot be before start time",code:"CURRENT_TIME_BEFORE_START"}),(typeof e.pausedTime!="number"||e.pausedTime<0)&&t.push({field:"pausedTime",message:"Paused time must be a non-negative number",code:"INVALID_PAUSED_TIME"});const i=Date.now();e.startTime>i+864e5&&n.push({field:"startTime",message:"Start time is far in the future",code:"FUTURE_START_TIME"})}static validateCrossReferences(e,t,n){var a;const i=e.orbs.filter(l=>l.collected).length;(a=e.player)!=null&&a.stats&&i!==e.player.stats.orbsCollected&&n.push({field:"player.stats.orbsCollected",message:`Player stats show ${e.player.stats.orbsCollected} orbs collected, but ${i} orbs are marked as collected`,code:"ORBS_COLLECTED_MISMATCH"}),e.objectives.filter(l=>l.completed).forEach((l,h)=>{l.current<l.target&&!["time_limit","move_limit"].includes(l.type)&&n.push({field:`objectives[${h}]`,message:`Objective marked as completed but current (${l.current}) < target (${l.target})`,code:"COMPLETED_OBJECTIVE_INCONSISTENT"})})}static isValidPosition(e){return e&&typeof e.x=="number"&&typeof e.y=="number"&&e.x>=0&&e.y>=0&&Number.isInteger(e.x)&&Number.isInteger(e.y)}static toJSON(e){try{return JSON.stringify(e,this.serializationReplacer,0)}catch(t){throw new Error(`Failed to serialize game state: ${t.message}`)}}static fromJSON(e){try{const t=JSON.parse(e,this.serializationReviver),n=this.migrateState(t);if(!this.validateState(n))throw new Error("Invalid game state structure");return n}catch(t){throw new Error(`Failed to deserialize game state: ${t.message}`)}}static serializationReplacer(e,t){return t instanceof Date?{__type:"Date",__value:t.toISOString()}:t instanceof Map?{__type:"Map",__value:Array.from(t.entries())}:t instanceof Set?{__type:"Set",__value:Array.from(t)}:t instanceof RegExp?{__type:"RegExp",__value:t.toString()}:t===void 0?{__type:"undefined"}:t}static serializationReviver(e,t){if(t&&typeof t=="object"&&t.__type)switch(t.__type){case"Date":return new Date(t.__value);case"Map":return new Map(t.__value);case"Set":return new Set(t.__value);case"RegExp":const n=t.__value.match(/^\/(.*)\/([gimuy]*)$/);return n?new RegExp(n[1],n[2]):new RegExp(t.__value);case"undefined":return;default:return t}return t}static toCompressedJSON(e){const t={v:e.version,lid:e.levelId,st:e.status,stt:e.startTime,ct:e.currentTime,pt:e.pausedTime,p:{pos:e.player.position,inv:e.player.inventory,stats:e.player.stats,ap:e.player.activePowerups},m:e.maze,o:e.orbs,pu:e.powerups,obj:e.objectives,sc:e.score,mv:e.moves,h:e.hintsUsed,r:e.result,s:e.seed};return this.toJSON(t)}static fromCompressedJSON(e,t){try{const n=JSON.parse(e,this.serializationReviver),i={version:n.v||this.STATE_VERSION,levelId:n.lid,levelConfig:t,status:n.st,startTime:n.stt,currentTime:n.ct,pausedTime:n.pt||0,player:{position:n.p.pos,inventory:n.p.inv||[],stats:n.p.stats,activePowerups:n.p.ap||[]},maze:n.m,orbs:n.o||[],powerups:n.pu||[],objectives:n.obj||[],score:n.sc||0,moves:n.mv||0,hintsUsed:n.h||0,result:n.r,seed:n.s};if(!this.validateState(i))throw new Error("Invalid compressed game state structure");return i}catch(n){throw new Error(`Failed to deserialize compressed game state: ${n.message}`)}}static migrateState(e){return(!e.version||e.version<this.STATE_VERSION)&&(e.version=this.STATE_VERSION),e}};Qi.STATE_VERSION=1;let Ie=Qi;function Yo(s,e){const{width:t,height:n,algorithm:i="prim",startPosition:o}=s;yc(s);const a=Jr(t,n,o,e),l=o||{x:Math.floor(e()*t),y:Math.floor(e()*n)};return{maze:a,metadata:{width:t,height:n,algorithm:i,startPosition:l,totalCells:t*n,connectedCells:vc(a)}}}function Jr(s,e,t,n){const i=gc(s,e),o=new Set,a=[],l=(t==null?void 0:t.x)??Math.floor(n()*s),h=(t==null?void 0:t.y)??Math.floor(n()*e);for(o.add(We(l,h)),Zr(l,h,s,e,a,o);a.length>0;){const d=Math.floor(n()*a.length),m=a[d];a.splice(d,1);const{x:g,y:b,nx:S,ny:C,dir:L,backDir:D}=m,F=We(S,C);o.has(F)||(i[b][g]|=L,i[C][S]|=D,o.add(F),Zr(S,C,s,e,a,o))}return i}function gc(s,e){return Array.from({length:e},()=>Array(s).fill(0))}function We(s,e){return`${s},${e}`}function Zr(s,e,t,n,i,o){const a=Ei();for(const{dx:l,dy:h,dir:d,backDir:m}of a){const g=s+l,b=e+h;Ge(g,b,t,n)&&!o.has(We(g,b))&&i.push({x:s,y:e,nx:g,ny:b,dir:d,backDir:m})}}function Ei(){return[{dx:1,dy:0,dir:1,backDir:4},{dx:0,dy:1,dir:2,backDir:8},{dx:-1,dy:0,dir:4,backDir:1},{dx:0,dy:-1,dir:8,backDir:2}]}function Ge(s,e,t,n){return s>=0&&e>=0&&s<t&&e<n}function yc(s){const{width:e,height:t,startPosition:n}=s;if(e<=0||t<=0)throw new Error("Maze dimensions must be positive");if(!Number.isInteger(e)||!Number.isInteger(t))throw new Error("Maze dimensions must be integers");if(n&&!Ge(n.x,n.y,e,t))throw new Error("Start position is outside maze bounds")}function vc(s){let e=0;for(let t=0;t<s.length;t++)for(let n=0;n<s[0].length;n++)s[t][n]>0&&e++;return e}function ni(s,e,t,n){const i=s.length,o=i>0?s[0].length:0,a={isValid:!0,isSolvable:!1,errors:[],pathLength:0,complexity:0,reachableCells:0};if(!Ec(s,a)||!wc(e,t,o,i,a)||!Tc(s,a))return a;const l=Ic(s,e,t);return l.path.length>0?(a.isSolvable=!0,a.pathLength=l.path.length-1,a.complexity=bc(s,l.path)):(a.isValid=!1,a.errors.push("No path exists from start to goal")),a.reachableCells=Ac(s,e),n&&(n.minPathLength&&a.pathLength<n.minPathLength&&(a.isValid=!1,a.errors.push(`Path length ${a.pathLength} is below minimum ${n.minPathLength}`)),n.minComplexity&&a.complexity<n.minComplexity&&(a.isValid=!1,a.errors.push(`Complexity ${a.complexity} is below minimum ${n.minComplexity}`)),n.minReachableCells&&a.reachableCells<n.minReachableCells&&(a.isValid=!1,a.errors.push(`Reachable cells ${a.reachableCells} is below minimum ${n.minReachableCells}`))),a}function _c(s,e,t){const n=wi(s,e),i=[];for(const o of t){const a=We(o.x,o.y);n.has(a)||i.push(o)}return{allAccessible:i.length===0,inaccessibleOrbs:i,totalOrbs:t.length,accessibleOrbs:t.length-i.length}}function wi(s,e){const t=s.length,n=t>0?s[0].length:0,i=new Set,o=[e];for(i.add(We(e.x,e.y));o.length>0;){const a=o.shift(),l=s[a.y][a.x],h=Ei();for(const{dx:d,dy:m,dir:g}of h)if(l&g){const b=a.x+d,S=a.y+m,C=We(b,S);Ge(b,S,n,t)&&!i.has(C)&&(i.add(C),o.push({x:b,y:S}))}}return i}function Ec(s,e){if(s.length===0)return e.isValid=!1,e.errors.push("Maze is empty"),!1;const t=s[0].length;if(t===0)return e.isValid=!1,e.errors.push("Maze has zero width"),!1;for(let n=0;n<s.length;n++){if(s[n].length!==t)return e.isValid=!1,e.errors.push(`Row ${n} has inconsistent width`),!1;for(let i=0;i<t;i++){const o=s[n][i];if(o<0||o>15)return e.isValid=!1,e.errors.push(`Invalid cell value ${o} at (${i}, ${n})`),!1}}return!0}function wc(s,e,t,n,i){return Ge(s.x,s.y,t,n)?Ge(e.x,e.y,t,n)?!0:(i.isValid=!1,i.errors.push(`Goal position (${e.x}, ${e.y}) is outside maze bounds`),!1):(i.isValid=!1,i.errors.push(`Start position (${s.x}, ${s.y}) is outside maze bounds`),!1)}function Tc(s,e){const t=s.length,n=s[0].length;for(let i=0;i<t;i++)for(let o=0;o<n;o++){const a=s[i][o];if(o<n-1&&a&1&&!(s[i][o+1]&4))return e.isValid=!1,e.errors.push(`Asymmetric East connection at (${o}, ${i})`),!1;if(i<t-1&&a&2&&!(s[i+1][o]&8))return e.isValid=!1,e.errors.push(`Asymmetric South connection at (${o}, ${i})`),!1;if(o>0&&a&4&&!(s[i][o-1]&1))return e.isValid=!1,e.errors.push(`Asymmetric West connection at (${o}, ${i})`),!1;if(i>0&&a&8&&!(s[i-1][o]&2))return e.isValid=!1,e.errors.push(`Asymmetric North connection at (${o}, ${i})`),!1}return!0}function Ic(s,e,t){const n=s.length,i=n>0?s[0].length:0;if(!Ge(e.x,e.y,i,n)||!Ge(t.x,t.y,i,n))return{path:[],distance:-1};const o=new Set,a=[{pos:e,path:[e]}];for(o.add(We(e.x,e.y));a.length>0;){const{pos:l,path:h}=a.shift();if(l.x===t.x&&l.y===t.y)return{path:h,distance:h.length-1};const d=s[l.y][l.x],m=Ei();for(const{dx:g,dy:b,dir:S}of m)if(d&S){const C=l.x+g,L=l.y+b,D=We(C,L);Ge(C,L,i,n)&&!o.has(D)&&(o.add(D),a.push({pos:{x:C,y:L},path:[...h,{x:C,y:L}]}))}}return{path:[],distance:-1}}function bc(s,e){if(e.length<2)return 0;let t=0,n=0;for(let i=1;i<e.length;i++){const o=e[i-1],a=e[i],l=a.x-o.x,h=a.y-o.y;let d=0;l===1?d=0:h===1?d=1:l===-1?d=2:h===-1&&(d=3),i>1&&d!==n&&t++,n=d}return t}function Ac(s,e){return wi(s,e).size}class Qo{constructor(e){this.state=e}next(){let e=this.state+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}nextInt(e,t){if(e>=t)throw new Error("min must be less than max");return Math.floor(this.next()*(t-e))+e}nextFloat(e,t){if(e>=t)throw new Error("min must be less than max");return this.next()*(t-e)+e}shuffle(e){for(let t=e.length-1;t>0;t--){const n=this.nextInt(0,t+1);[e[t],e[n]]=[e[n],e[t]]}return e}getState(){return this.state}reset(e){this.state=e}}function Sc(s=new Date){const e=s.getFullYear(),t=(s.getMonth()+1).toString().padStart(2,"0"),n=s.getDate().toString().padStart(2,"0");return+`${e}${t}${n}`}class Cc{constructor(){this.gameState=null,this.currentLevelDefinition=null,this.pausedAt=null,this.totalPausedTime=0,this.eventEmitter=new pc,this.eventEmitter.setErrorHandler((e,t,n)=>{this.emit("error",{error:e,context:`Event listener error for ${t}`,recoverable:!0,timestamp:Date.now()})})}initializeLevel(e,t){try{const n=t??e.generation.seed??Date.now(),i=new Qo(n);this.gameState=Ie.createInitialState(e,n),this.currentLevelDefinition=e,this.pausedAt=null,this.totalPausedTime=0;const o=Date.now();try{if(e.generation.type==="procedural")this.generateProceduralMaze(e,i);else if(e.generation.type==="handcrafted")this.loadHandcraftedMaze(e);else throw new Error(`Unsupported level generation type: ${e.generation.type}`)}catch(l){this.emit("debug",{level:"warn",message:`Maze generation failed, attempting fallback: ${l.message}`,data:{originalError:l,levelId:e.id},timestamp:Date.now()}),this.generateFallbackMaze(e,i)}const a=Date.now()-o;this.emit("level.generated",{levelId:e.id,seed:n,generationTime:a,mazeSize:e.config.boardSize,orbCount:this.gameState.orbs.length,timestamp:Date.now()}),this.emit("game.initialized",{state:this.gameState,levelDefinition:e,timestamp:Date.now()}),this.emit("debug",{level:"info",message:`Level initialized: ${e.id}`,data:{seed:n,levelId:e.id,generationTime:a,mazeSize:e.config.boardSize,orbCount:this.gameState.orbs.length},timestamp:Date.now()})}catch(n){throw this.emit("error",{error:n instanceof Error?n:new Error(String(n)),context:"Level initialization",recoverable:!1,timestamp:Date.now()}),n}}startGame(){if(!this.gameState||!this.currentLevelDefinition)throw new Error("Game not initialized");const e=Date.now(),t=this.gameState;this.gameState=Ie.updateGameStatus(this.gameState,"playing"),this.emit("game.started",{timestamp:e,levelId:this.currentLevelDefinition.id,seed:this.gameState.seed}),this.emitStateChanged(t,this.gameState,"Game started")}pauseGame(){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="playing")return;const e=Date.now(),t=this.gameState,n=e-this.gameState.startTime-this.totalPausedTime;this.gameState=Ie.updateGameStatus(this.gameState,"paused"),this.pausedAt=e,this.emit("game.paused",{timestamp:e,duration:n}),this.emitStateChanged(t,this.gameState,"Game paused")}resumeGame(){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="paused"||!this.pausedAt)return;const e=Date.now(),t=this.gameState,n=e-this.pausedAt;this.totalPausedTime+=n,this.gameState=Ie.updateGameStatus(this.gameState,"playing"),this.pausedAt=null,this.emit("game.resumed",{timestamp:e,pausedDuration:n}),this.emitStateChanged(t,this.gameState,"Game resumed")}resetGame(){if(!this.currentLevelDefinition)throw new Error("No level to reset");const e=Date.now(),t=this.currentLevelDefinition.id;this.initializeLevel(this.currentLevelDefinition),this.emit("game.reset",{timestamp:e,levelId:t,reason:"user_request"})}movePlayer(e){if(!this.gameState)throw new Error("Game not initialized");if(this.gameState.status!=="playing")return{success:!1,newPosition:this.gameState.player.position,reason:"Game not in playing state",moveCount:this.gameState.moves};const t=this.gameState.player.position,n=this.calculateNewPosition(t,e),i=Date.now();if(this.emit("player.move.attempted",{from:t,attemptedTo:n,direction:this.directionToCardinal(e),blocked:!1,timestamp:i}),!this.isValidMove(t,n))return this.emit("player.move.attempted",{from:t,attemptedTo:n,direction:this.directionToCardinal(e),blocked:!0,reason:"Invalid move",timestamp:i}),{success:!1,newPosition:t,reason:"Invalid move",moveCount:this.gameState.moves};const a=this.gameState;this.gameState=Ie.updatePlayerPosition(this.gameState,n);const l={success:!0,newPosition:n,moveCount:this.gameState.moves};return this.emit("player.moved",{from:t,to:n,valid:!0,moveCount:this.gameState.moves,timestamp:i}),this.emitStateChanged(a,this.gameState,"Player moved"),this.checkAutomaticOrbCollection(n),this.updateObjectives(),this.checkGameCompletion(),l}collectOrb(e){if(!this.gameState)throw new Error("Game not initialized");const t=this.gameState.orbs.find(d=>d.id===e);if(!t)return{success:!1,orbId:e,scoreGained:0,reason:"Orb not found",totalScore:this.gameState.score};if(t.collected)return{success:!1,orbId:e,scoreGained:0,reason:"Orb already collected",totalScore:this.gameState.score};if(this.gameState.player.position.x!==t.position.x||this.gameState.player.position.y!==t.position.y)return{success:!1,orbId:e,scoreGained:0,reason:"Player not at orb position",totalScore:this.gameState.score};const n=Date.now(),i=this.gameState,o=this.gameState.score;this.gameState=Ie.collectOrb(this.gameState,e);const a=this.gameState.score-o,l=this.gameState.orbs.filter(d=>!d.collected).length;this.updateObjectives();const h={success:!0,orbId:e,scoreGained:a,totalScore:this.gameState.score};return this.emit("orb.collected",{orbId:e,position:t.position,score:a,totalScore:this.gameState.score,orbsRemaining:l,timestamp:n}),a>0&&this.emit("score.changed",{previousScore:o,newScore:this.gameState.score,change:a,reason:"orb_collected",timestamp:n}),this.emitStateChanged(i,this.gameState,"Orb collected"),this.checkGameCompletion(),h}getGameState(){if(!this.gameState)throw new Error("Game not initialized");return this.gameState}isGameComplete(){return this.gameState?this.gameState.objectives.filter(e=>e.required).every(e=>e.completed):!1}getScore(){var e;return((e=this.gameState)==null?void 0:e.score)??0}getCurrentTime(){if(!this.gameState)return 0;const e=Date.now(),t=e-this.gameState.startTime,n=this.pausedAt?e-this.pausedAt:0;return t-this.totalPausedTime-n}getCurrentLevelDefinition(){return this.currentLevelDefinition}on(e,t){this.eventEmitter.on(e,t)}off(e,t){this.eventEmitter.off(e,t)}once(e,t){this.eventEmitter.once(e,t)}emit(e,t){this.eventEmitter.emit(e,t)}emitStateChanged(e,t,n){const i=this.calculateStateChanges(e,t);this.emit("state.changed",{state:t,changes:i,timestamp:Date.now()}),this.emit("debug",{level:"debug",message:`State changed: ${n}`,data:{changeCount:i.length,changes:i},timestamp:Date.now()})}calculateStateChanges(e,t){const n=[],i=Date.now();e.status!==t.status&&n.push({property:"status",oldValue:e.status,newValue:t.status,timestamp:i}),e.score!==t.score&&n.push({property:"score",oldValue:e.score,newValue:t.score,timestamp:i}),e.moves!==t.moves&&n.push({property:"moves",oldValue:e.moves,newValue:t.moves,timestamp:i}),(e.player.position.x!==t.player.position.x||e.player.position.y!==t.player.position.y)&&n.push({property:"player.position",oldValue:e.player.position,newValue:t.player.position,timestamp:i});for(let o=0;o<Math.max(e.orbs.length,t.orbs.length);o++){const a=e.orbs[o],l=t.orbs[o];a&&l&&a.collected!==l.collected&&n.push({property:`orbs[${o}].collected`,oldValue:a.collected,newValue:l.collected,timestamp:i})}return n}calculateNewPosition(e,t){switch(t){case"up":return{x:e.x,y:e.y-1};case"down":return{x:e.x,y:e.y+1};case"left":return{x:e.x-1,y:e.y};case"right":return{x:e.x+1,y:e.y};default:return e}}directionToCardinal(e){switch(e){case"up":return"north";case"down":return"south";case"left":return"west";case"right":return"east";default:return"north"}}checkAutomaticOrbCollection(e){if(!this.gameState)return;const t=this.gameState.orbs.filter(n=>n.position.x===e.x&&n.position.y===e.y&&!n.collected);for(const n of t)this.collectOrb(n.id)}updateObjectives(){if(!this.gameState)return;const e=this.gameState;let t=!1;for(const n of this.gameState.objectives){if(n.completed)continue;let i=n.current;switch(n.type){case"collect_orbs":i=this.gameState.player.stats.orbsCollected;break;case"reach_goal":i=this.isPlayerAtGoal()?1:0;break;case"collect_all_orbs":const a=this.gameState.orbs.length;i=this.gameState.orbs.filter(d=>d.collected).length===a?1:0;break;case"time_limit":const h=this.getCurrentTime();i=Math.max(0,n.target-Math.floor(h/1e3));break;case"move_limit":i=Math.max(0,n.target-this.gameState.moves);break;default:continue}i!==n.current&&(this.gameState=Ie.updateObjectiveProgress(this.gameState,n.id,i),t=!0,this.emit("objective.progress",{objectiveId:n.id,previousProgress:n.current,newProgress:i,target:n.target,completed:i>=n.target,timestamp:Date.now()}),i>=n.target&&n.current<n.target&&this.emit("objective.completed",{objectiveId:n.id,completionTime:this.getCurrentTime(),timestamp:Date.now()}))}t&&this.emitStateChanged(e,this.gameState,"Objectives updated")}checkGameCompletion(){if(!this.gameState)return;if(this.gameState.objectives.filter(n=>n.required).every(n=>n.completed)&&this.gameState.status==="playing"){const n=Date.now(),i=this.getCurrentTime(),o=this.gameState;this.gameState=Ie.updateGameStatus(this.gameState,"completed");const a=this.calculateGameResult(i);this.emit("game.completed",{result:a,timestamp:n,duration:i}),this.emitStateChanged(o,this.gameState,"Game completed")}}calculateGameResult(e){if(!this.gameState)throw new Error("Game not initialized");const t=this.gameState.objectives.filter(a=>a.completed).length,i=this.gameState.objectives.filter(a=>a.required).every(a=>a.completed);let o=0;if(i){o=1;const a=this.gameState.levelConfig.progression.starThresholds;for(const l of a.sort((h,d)=>d.stars-h.stars)){let h=!0;if(l.requirements.time&&e>l.requirements.time*1e3&&(h=!1),l.requirements.moves&&this.gameState.moves>l.requirements.moves&&(h=!1),l.requirements.orbsCollected&&this.gameState.player.stats.orbsCollected<l.requirements.orbsCollected&&(h=!1),h){o=Math.max(o,l.stars);break}}}return{completed:i,score:this.gameState.score,stars:o,completionTime:e,totalMoves:this.gameState.moves,orbsCollected:this.gameState.player.stats.orbsCollected,objectivesCompleted:t,constraintsViolated:0}}generateProceduralMaze(e,t){if(!this.gameState)throw new Error("Game state not initialized");const{width:n,height:i}=e.config.boardSize,o=e.generation.parameters,a={width:n,height:i,algorithm:(o==null?void 0:o.algorithm)||"prim"},l=Yo(a,()=>t.next()),h={x:0,y:0},d={x:n-1,y:i-1},m=l.maze.map((S,C)=>S.map((L,D)=>({walls:L,type:D===h.x&&C===h.y?"start":D===d.x&&C===d.y?"goal":"floor",properties:{isStart:D===h.x&&C===h.y,isGoal:D===d.x&&C===d.y,isVisited:!1}})));if(!ni(l.maze,h,d).isSolvable)throw new Error("Generated maze is not solvable");const b=this.generateOrbsIntelligent(e,t,l.maze,h,d);this.gameState=Ie.updateState(this.gameState,{maze:m,orbs:b,player:{position:h}})}loadHandcraftedMaze(e){if(!this.gameState)throw new Error("Game state not initialized");const t=e.generation.layout;if(!t)throw new Error("Handcrafted level missing layout data");const n=t.cells.map(o=>o.map(a=>({walls:a.walls,type:a.type==="start"||a.type==="goal"?"special":a.type,properties:{isStart:a.type==="start",isGoal:a.type==="goal",isVisited:!1,...a.properties}}))),i=t.orbPositions.map((o,a)=>({id:o.id||`orb_${a}`,position:{x:o.x,y:o.y},collected:!1,value:o.value}));this.gameState=Ie.updateState(this.gameState,{maze:n,orbs:i,player:{position:t.startPosition}})}generateOrbsIntelligent(e,t,n,i,o){const a=e.generation.parameters;if(!a)return[];const l=[],{width:h,height:d}=e.config.boardSize,m=a.orbCount||2,g=wi(n,i),b=[];for(const L of g){const[D,F]=L.split(",").map(Number);(D!==i.x||F!==i.y)&&(D!==o.x||F!==o.y)&&b.push({x:D,y:F})}if(b.length===0)return[];const S=a.orbPlacement||"random";let C=[];if(S==="balanced")C=this.selectBalancedOrbPositions(b,i,o,m,t);else{const L=t.shuffle([...b]);C=L.slice(0,Math.min(m,L.length))}return C.forEach((L,D)=>{l.push({id:`orb_${D+1}`,position:L,collected:!1,value:10+D*5})}),l}selectBalancedOrbPositions(e,t,n,i,o){if(e.length===0)return[];const a=e.map(d=>({position:d,distanceFromStart:Math.abs(d.x-t.x)+Math.abs(d.y-t.y),distanceFromGoal:Math.abs(d.x-n.x)+Math.abs(d.y-n.y)}));a.sort((d,m)=>d.distanceFromStart-m.distanceFromStart);const l=[],h=a.length;for(let d=0;d<i&&d<h;d++){const m=Math.floor(h/i),g=d*m,b=Math.min(g+m,h);if(g<h){const S=g+Math.floor(o.next()*(b-g));l.push(a[S].position)}}return l}generateOrbs(e,t,n){const i=e.generation.parameters;if(!i)return[];const o=[],{width:a,height:l}=e.config.boardSize,h=i.orbCount||3,d=[];for(let S=0;S<l;S++)for(let C=0;C<a;C++){const L=n[S][C];!L.properties.isStart&&!L.properties.isGoal&&d.push({x:C,y:S})}const m=t.shuffle([...d]),g=i.orbPlacement||"random";let b=[];switch(g){case"random":b=m.slice(0,Math.min(h,m.length));break;case"corners":const S=m.filter(C=>(C.x===0||C.x===a-1)&&(C.y===0||C.y===l-1));b=[...S.slice(0,Math.min(h,S.length)),...m.filter(C=>!S.includes(C)).slice(0,Math.max(0,h-S.length))];break;case"strategic":case"path":default:b=m.slice(0,Math.min(h,m.length));break}return b.forEach((S,C)=>{o.push({id:`orb_${C}`,position:S,collected:!1,value:100})}),o}isPlayerAtGoal(){var n;if(!this.gameState||!this.currentLevelDefinition)return!1;const e=this.gameState.player.position,t=(n=this.gameState.maze[e.y])==null?void 0:n[e.x];return(t==null?void 0:t.properties.isGoal)===!0}generateFallbackMaze(e,t){if(!this.gameState)throw new Error("Game state not initialized");const{width:n,height:i}=e.config.boardSize,o=[];for(let h=0;h<i;h++){const d=[];for(let m=0;m<n;m++){let g=0;m<n-1&&(g|=1),h<i-1&&(g|=2),m>0&&(g|=4),h>0&&(g|=8),d.push({walls:g,type:m===0&&h===0||m===n-1&&h===i-1?"special":"floor",properties:{isStart:m===0&&h===0,isGoal:m===n-1&&h===i-1,isVisited:!1}})}o.push(d)}const a=[],l=Math.min(2,Math.floor(n*i/4));for(let h=0;h<l;h++){let d,m;do d=Math.floor(t.next()*n),m=Math.floor(t.next()*i);while(d===0&&m===0||d===n-1&&m===i-1);a.push({id:`fallback_orb_${h}`,position:{x:d,y:m},collected:!1,value:100})}this.gameState=Ie.updateState(this.gameState,{maze:o,orbs:a,player:{position:{x:0,y:0}}}),this.emit("debug",{level:"info",message:"Fallback maze generated successfully",data:{mazeSize:{width:n,height:i},orbCount:a.length},timestamp:Date.now()})}isValidMove(e,t){var h;if(!this.gameState||t.x<0||t.y<0||this.gameState.maze.length===0)return!1;const n=this.gameState.maze.length,i=((h=this.gameState.maze[0])==null?void 0:h.length)??0;if(t.x>=i||t.y>=n)return!1;const o=t.x-e.x,a=t.y-e.y;if(Math.abs(o)+Math.abs(a)!==1)return!1;const l=this.gameState.maze[e.y][e.x];return!(o===1&&!(l.walls&1)||o===-1&&!(l.walls&4)||a===1&&!(l.walls&2)||a===-1&&!(l.walls&8))}}const Pc="modulepreload",Rc=function(s){return"/"+s},eo={},Re=function(e,t,n){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),l=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));i=Promise.allSettled(t.map(h=>{if(h=Rc(h),h in eo)return;eo[h]=!0;const d=h.endsWith(".css"),m=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${h}"]${m}`))return;const g=document.createElement("link");if(g.rel=d?"stylesheet":Pc,d||(g.as="script"),g.crossOrigin="",g.href=h,l&&g.setAttribute("nonce",l),document.head.appendChild(g),d)return new Promise((b,S)=>{g.addEventListener("load",b),g.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return i.then(a=>{for(const l of a||[])l.status==="rejected"&&o(l.reason);return e().catch(o)})},Dc=(s,e,t)=>{const n=s[e];return n?typeof n=="function"?n():Promise.resolve(n):new Promise((i,o)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(o.bind(null,new Error("Unknown variable dynamic import: "+e+(e.split("/").length!==t?". Note that variables only represent file names one level deep.":""))))})},ls=class ls{static isLevelDefinition(e){return this.validate(e).valid}static isLevelMetadata(e){return this.validateMetadata(e).valid}static isLevelGeneration(e){return this.validateGeneration(e).valid}static isLevelConfig(e){return this.validateConfig(e).valid}static isLevelProgression(e){return this.validateProgression(e).valid}static validate(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"root",message:"Level definition must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const i=["id","version","metadata","generation","config","progression"];for(const o of i)o in e||t.push({field:o,message:`Required field '${o}' is missing`,severity:"error",code:"MISSING_FIELD"});if(typeof e.version!="number"?t.push({field:"version",message:"Version must be a number",severity:"error",code:"INVALID_TYPE"}):this.SUPPORTED_VERSIONS.includes(e.version)||n.push({field:"version",message:`Version ${e.version} may not be fully supported`,severity:"warning",code:"UNSUPPORTED_VERSION"}),typeof e.id!="string"||!e.id.trim()?t.push({field:"id",message:"ID must be a non-empty string",severity:"error",code:"INVALID_ID"}):/^[a-zA-Z0-9_-]+$/.test(e.id)||t.push({field:"id",message:"ID must contain only alphanumeric characters, underscores, and hyphens",severity:"error",code:"INVALID_ID_FORMAT"}),e.metadata){const o=this.validateMetadata(e.metadata);t.push(...o.errors),n.push(...o.warnings)}if(e.generation){const o=this.validateGeneration(e.generation);t.push(...o.errors),n.push(...o.warnings)}if(e.config){const o=this.validateConfig(e.config);t.push(...o.errors),n.push(...o.warnings)}if(e.progression){const o=this.validateProgression(e.progression);t.push(...o.errors),n.push(...o.warnings)}return{valid:t.length===0,errors:t,warnings:n}}static validateMetadata(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"metadata",message:"Metadata must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const i=["name","difficulty","estimatedTime","tags"];for(const a of i)a in e||t.push({field:`metadata.${a}`,message:`Required field '${a}' is missing`,severity:"error",code:"MISSING_FIELD"});(typeof e.name!="string"||!e.name.trim())&&t.push({field:"metadata.name",message:"Name must be a non-empty string",severity:"error",code:"INVALID_NAME"});const o=["easy","medium","hard","expert"];return o.includes(e.difficulty)||t.push({field:"metadata.difficulty",message:`Difficulty must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_DIFFICULTY"}),(typeof e.estimatedTime!="number"||e.estimatedTime<=0)&&t.push({field:"metadata.estimatedTime",message:"Estimated time must be a positive number",severity:"error",code:"INVALID_TIME"}),Array.isArray(e.tags)?e.tags.forEach((a,l)=>{typeof a!="string"&&t.push({field:`metadata.tags[${l}]`,message:"Each tag must be a string",severity:"error",code:"INVALID_TAG"})}):t.push({field:"metadata.tags",message:"Tags must be an array",severity:"error",code:"INVALID_TAGS"}),{valid:t.length===0,errors:t,warnings:n}}static validateGeneration(e){const t=[],n=[];if(!e||typeof e!="object")return t.push({field:"generation",message:"Generation must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n};const i=["procedural","handcrafted"];if(i.includes(e.type)||t.push({field:"generation.type",message:`Generation type must be one of: ${i.join(", ")}`,severity:"error",code:"INVALID_GENERATION_TYPE"}),e.type==="procedural"&&(typeof e.seed!="number"&&n.push({field:"generation.seed",message:"Procedural generation should include a seed for deterministic results",severity:"warning",code:"MISSING_SEED"}),e.parameters)){const o=this.validateProceduralParameters(e.parameters);t.push(...o.errors),n.push(...o.warnings)}if(e.type==="handcrafted")if(!e.layout)t.push({field:"generation.layout",message:"Handcrafted generation must include layout data",severity:"error",code:"MISSING_LAYOUT"});else{const o=this.validateHandcraftedLayout(e.layout);t.push(...o.errors),n.push(...o.warnings)}return{valid:t.length===0,errors:t,warnings:n}}static validateProceduralParameters(e){const t=[],n=[],i=["recursive_backtrack","kruskal","prim","wilson"];i.includes(e.algorithm)||t.push({field:"generation.parameters.algorithm",message:`Algorithm must be one of: ${i.join(", ")}`,severity:"error",code:"INVALID_ALGORITHM"});const o=[{name:"complexity",min:0,max:1},{name:"branchingFactor",min:0,max:1},{name:"deadEndRatio",min:0,max:1}];for(const l of o){const h=e[l.name];(typeof h!="number"||h<l.min||h>l.max)&&t.push({field:`generation.parameters.${l.name}`,message:`${l.name} must be a number between ${l.min} and ${l.max}`,severity:"error",code:"INVALID_PARAMETER_RANGE"})}(typeof e.orbCount!="number"||e.orbCount<0)&&t.push({field:"generation.parameters.orbCount",message:"Orb count must be a non-negative number",severity:"error",code:"INVALID_ORB_COUNT"});const a=["random","strategic","path","corners"];return a.includes(e.orbPlacement)||t.push({field:"generation.parameters.orbPlacement",message:`Orb placement must be one of: ${a.join(", ")}`,severity:"error",code:"INVALID_ORB_PLACEMENT"}),{valid:t.length===0,errors:t,warnings:n}}static validateHandcraftedLayout(e){const t=[],n=[],i=["cells","startPosition","goalPosition","orbPositions"];for(const o of i)o in e||t.push({field:`generation.layout.${o}`,message:`Required field '${o}' is missing`,severity:"error",code:"MISSING_FIELD"});return e.startPosition&&!this.isValidPosition(e.startPosition)&&t.push({field:"generation.layout.startPosition",message:"Start position must have valid x and y coordinates",severity:"error",code:"INVALID_POSITION"}),e.goalPosition&&!this.isValidPosition(e.goalPosition)&&t.push({field:"generation.layout.goalPosition",message:"Goal position must have valid x and y coordinates",severity:"error",code:"INVALID_POSITION"}),Array.isArray(e.orbPositions)&&e.orbPositions.forEach((o,a)=>{(!this.isValidPosition(o)||typeof o.value!="number")&&t.push({field:`generation.layout.orbPositions[${a}]`,message:"Orb position must have valid x, y coordinates and numeric value",severity:"error",code:"INVALID_ORB_POSITION"})}),{valid:t.length===0,errors:t,warnings:n}}static validateConfig(e){const t=[],n=[];return!e||typeof e!="object"?(t.push({field:"config",message:"Config must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n}):((!e.boardSize||!this.isValidSize(e.boardSize))&&t.push({field:"config.boardSize",message:"Board size must have valid width and height",severity:"error",code:"INVALID_BOARD_SIZE"}),Array.isArray(e.objectives)?e.objectives.forEach((i,o)=>{const a=this.validateObjective(i,o);t.push(...a.errors),n.push(...a.warnings)}):t.push({field:"config.objectives",message:"Objectives must be an array",severity:"error",code:"INVALID_OBJECTIVES"}),Array.isArray(e.constraints)?e.constraints.forEach((i,o)=>{const a=this.validateConstraint(i,o);t.push(...a.errors),n.push(...a.warnings)}):t.push({field:"config.constraints",message:"Constraints must be an array",severity:"error",code:"INVALID_CONSTRAINTS"}),{valid:t.length===0,errors:t,warnings:n})}static validateProgression(e){const t=[],n=[];return!e||typeof e!="object"?(t.push({field:"progression",message:"Progression must be an object",severity:"error",code:"INVALID_TYPE"}),{valid:!1,errors:t,warnings:n}):(Array.isArray(e.starThresholds)?e.starThresholds.length===0&&n.push({field:"progression.starThresholds",message:"No star thresholds defined",severity:"warning",code:"EMPTY_STAR_THRESHOLDS"}):t.push({field:"progression.starThresholds",message:"Star thresholds must be an array",severity:"error",code:"INVALID_STAR_THRESHOLDS"}),Array.isArray(e.rewards)||t.push({field:"progression.rewards",message:"Rewards must be an array",severity:"error",code:"INVALID_REWARDS"}),Array.isArray(e.unlocks)||t.push({field:"progression.unlocks",message:"Unlocks must be an array",severity:"error",code:"INVALID_UNLOCKS"}),{valid:t.length===0,errors:t,warnings:n})}static isValidPosition(e){return e&&typeof e=="object"&&typeof e.x=="number"&&typeof e.y=="number"&&e.x>=0&&e.y>=0}static isValidSize(e){return e&&typeof e=="object"&&typeof e.width=="number"&&typeof e.height=="number"&&e.width>0&&e.height>0}static validateObjective(e,t){const n=[],i=[],o=["collect_orbs","collect_all_orbs","reach_goal","time_limit","move_limit","collect_sequence","avoid_traps"];return o.includes(e.type)||n.push({field:`config.objectives[${t}].type`,message:`Objective type must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_OBJECTIVE_TYPE"}),(typeof e.target!="number"||e.target<0)&&n.push({field:`config.objectives[${t}].target`,message:"Objective target must be a non-negative number",severity:"error",code:"INVALID_OBJECTIVE_TARGET"}),{valid:n.length===0,errors:n,warnings:i}}static validateConstraint(e,t){const n=[],i=[],o=["time_limit","move_limit","no_backtrack","no_diagonal","limited_vision","one_way_paths"];return o.includes(e.type)||n.push({field:`config.constraints[${t}].type`,message:`Constraint type must be one of: ${o.join(", ")}`,severity:"error",code:"INVALID_CONSTRAINT_TYPE"}),(typeof e.value!="number"||e.value<0)&&n.push({field:`config.constraints[${t}].value`,message:"Constraint value must be a non-negative number",severity:"error",code:"INVALID_CONSTRAINT_VALUE"}),{valid:n.length===0,errors:n,warnings:i}}};ls.CURRENT_VERSION=1,ls.SUPPORTED_VERSIONS=[1];let si=ls;const Xi=class Xi{static migrate(e,t,n=this.CURRENT_VERSION){if(t===n)return e;let i={...e};return t<1&&n>=1&&(i=this.migrateToV1(i)),i.version=n,i}static getCurrentVersion(){return this.CURRENT_VERSION}static isVersionSupported(e){return e<=this.CURRENT_VERSION&&e>=1}static migrateToV1(e){return e.metadata||(e.metadata={name:e.name||`Level ${e.id}`,difficulty:e.difficulty||"medium",estimatedTime:e.estimatedTime||300,tags:e.tags||[]}),e.generation||(e.generation={type:"procedural",seed:Math.floor(Math.random()*1e6),parameters:{algorithm:"recursive_backtrack",complexity:.5,branchingFactor:.3,deadEndRatio:.1,orbCount:3,orbPlacement:"random"}}),e.config||(e.config={boardSize:{width:10,height:10},objectives:[{id:"reach_goal",type:"reach_goal",target:1,description:"Reach the goal",required:!0,priority:1}],constraints:[],powerups:[]}),e.progression||(e.progression={starThresholds:[{stars:1,requirements:{}},{stars:2,requirements:{time:300}},{stars:3,requirements:{time:180}}],rewards:[],unlocks:[]}),e}};Xi.CURRENT_VERSION=1;let Zt=Xi;class Xo{constructor(e=100){this.levelCache=new Map,this.cacheStats={size:0,hitRate:0,totalRequests:0,totalHits:0,totalMisses:0},this.embeddedLevels=new Map,this.maxCacheSize=e,this.initializeEmbeddedLevels()}async loadLevel(e,t){return(await this.loadLevelWithResult(e,t)).level}async loadLevelWithResult(e,t){const n=performance.now();this.cacheStats.totalRequests++;const i={validateSchema:!0,migrateVersion:!0,includeMetadata:!0,cacheable:!0,...t};if(i.cacheable){const o=this.getCachedLevelEntry(e);if(o)return this.cacheStats.totalHits++,this.updateCacheStats(),o.lastAccessed=Date.now(),o.accessCount++,{level:o.level,loadTime:performance.now()-n,fromCache:!0,migrated:o.migrated,validationResult:i.validateSchema?this.validateLevel(o.level):void 0}}this.cacheStats.totalMisses++;try{const o=await this.loadLevelData(e);let a=o,l=!1,h;if(i.migrateVersion&&o.version!==Zt.getCurrentVersion()&&(a=Zt.migrate(o,o.version||1,Zt.getCurrentVersion()),l=!0),i.validateSchema&&(h=this.validateLevel(a),!h.valid))throw new Error(`Level validation failed for ${e}: ${h.errors.map(d=>d.message).join(", ")}`);return i.cacheable&&this.cacheLevel(e,a,l),this.updateCacheStats(),{level:a,loadTime:performance.now()-n,fromCache:!1,migrated:l,validationResult:h}}catch(o){throw this.updateCacheStats(),new Error(`Failed to load level ${e}: ${o instanceof Error?o.message:"Unknown error"}`)}}async loadLevels(e,t){const n=e.map(i=>this.loadLevel(i,t));return Promise.all(n)}getCachedLevel(e){const t=this.getCachedLevelEntry(e);return t?t.level:null}async preloadLevels(e,t){for(let i=0;i<e.length;i+=5){const o=e.slice(i,i+5);await Promise.all(o.map(a=>this.loadLevel(a,t)))}}clearCache(){this.levelCache.clear(),this.cacheStats={size:0,hitRate:0,totalRequests:0,totalHits:0,totalMisses:0}}getCacheStats(){return{size:this.cacheStats.size,hitRate:this.cacheStats.hitRate,totalRequests:this.cacheStats.totalRequests}}validateLevel(e){return si.validate(e)}async listAvailableLevels(){const e=Array.from(this.embeddedLevels.keys()),t=Array.from(this.levelCache.keys()),n=["level-001-tutorial","level-002-simple-path","level-003-branching-paths","level-004-time-pressure","level-005-puzzle-chamber","level-006-maze-runner","level-007-symmetry-challenge","level-008-trap-maze","level-009-speed-demon","level-010-master-challenge"],i=[];for(const a of n)try{await this.loadLevelData(a),i.push(a)}catch(l){console.warn(`Level ${a} not available:`,l)}const o=new Set([...e,...t,...i]);return Array.from(o).sort()}getCachedLevelEntry(e){return this.levelCache.get(e)||null}cacheLevel(e,t,n){this.levelCache.size>=this.maxCacheSize&&this.evictLeastRecentlyUsed();const i={level:t,loadTime:Date.now(),lastAccessed:Date.now(),accessCount:1,migrated:n};this.levelCache.set(e,i),this.cacheStats.size=this.levelCache.size}evictLeastRecentlyUsed(){let e=null,t=Date.now();for(const[n,i]of this.levelCache.entries())i.lastAccessed<t&&(t=i.lastAccessed,e=n);e&&this.levelCache.delete(e)}updateCacheStats(){this.cacheStats.size=this.levelCache.size,this.cacheStats.totalRequests>0&&(this.cacheStats.hitRate=this.cacheStats.totalHits/this.cacheStats.totalRequests)}async loadLevelData(e){try{const n=await Dc(Object.assign({"../data/levels/level-001-tutorial.json":()=>Re(()=>import("./level-001-tutorial-Ce3P_qlB.js"),[]),"../data/levels/level-002-simple-path.json":()=>Re(()=>import("./level-002-simple-path-RkmzWUcy.js"),[]),"../data/levels/level-003-branching-paths.json":()=>Re(()=>import("./level-003-branching-paths-CNaGAgB9.js"),[]),"../data/levels/level-004-time-pressure.json":()=>Re(()=>import("./level-004-time-pressure-BDX9a_KL.js"),[]),"../data/levels/level-005-puzzle-chamber.json":()=>Re(()=>import("./level-005-puzzle-chamber-C9q7Kty3.js"),[]),"../data/levels/level-006-maze-runner.json":()=>Re(()=>import("./level-006-maze-runner-BBgG5vUY.js"),[]),"../data/levels/level-007-symmetry-challenge.json":()=>Re(()=>import("./level-007-symmetry-challenge-B2tVyWaX.js"),[]),"../data/levels/level-008-trap-maze.json":()=>Re(()=>import("./level-008-trap-maze-BZOE-uzr.js"),[]),"../data/levels/level-009-speed-demon.json":()=>Re(()=>import("./level-009-speed-demon-Dmj__R6_.js"),[]),"../data/levels/level-010-master-challenge.json":()=>Re(()=>import("./level-010-master-challenge-D0KqP2VY.js"),[])}),`../data/levels/${e}.json`,4);return n.default||n}catch(n){console.warn(`Failed to import ${e}:`,n)}try{const n=await fetch(`/src/data/levels/${e}.json`);if(n.ok)return await n.json()}catch(n){console.warn(`Failed to fetch ${e}:`,n)}const t=this.embeddedLevels.get(e);if(t)return console.warn(`Using embedded metadata for ${e}, full level data not available`),t;throw new Error(`Level data not found for ID: ${e}`)}async generateLevel(e,t){const n=performance.now(),i=t??e.generation.seed??Date.now(),o=new Qo(i);try{let a;if(e.generation.type==="procedural")a=await this.generateProceduralLevel(e,o,i);else if(e.generation.type==="handcrafted")a=await this.generateHandcraftedLevel(e,i);else{const h=new Error(`Unsupported generation type: ${e.generation.type}`);throw h.code="UNSUPPORTED_TYPE",h.levelId=e.id,h}a.metadata.generationTime=performance.now()-n;const l=this.validateGeneratedLevel(a);if(!l.valid)try{a=await this.generateFallbackLevel(e,o,i),a.metadata.generationTime=performance.now()-n}catch(h){const d=new Error(`Level generation and fallback failed: ${l.errors.map(m=>m.message).join(", ")}`);throw d.code="GENERATION_FAILED",d.levelId=e.id,d.details={validationErrors:l.errors,fallbackError:h},d}return a}catch(a){if(a instanceof Error&&"code"in a)throw a;const l=new Error(`Level generation failed: ${a instanceof Error?a.message:"Unknown error"}`);throw l.code="GENERATION_FAILED",l.levelId=e.id,l.details={originalError:a},l}}validateGeneratedLevel(e){var h,d;const t=[],n=[];if(!e.maze||e.maze.length===0)return t.push({message:"Generated maze is empty",severity:"error",code:"EMPTY_MAZE"}),{valid:!1,errors:t,warnings:n};const{width:i,height:o}=e.definition.config.boardSize;(e.maze.length!==o||((h=e.maze[0])==null?void 0:h.length)!==i)&&t.push({message:`Maze dimensions ${(d=e.maze[0])==null?void 0:d.length}x${e.maze.length} don't match config ${i}x${o}`,severity:"error",code:"DIMENSION_MISMATCH"}),this.isPositionInBounds(e.startPosition,i,o)||t.push({message:"Start position is outside maze bounds",severity:"error",code:"INVALID_START_POSITION"}),this.isPositionInBounds(e.goalPosition,i,o)||t.push({message:"Goal position is outside maze bounds",severity:"error",code:"INVALID_GOAL_POSITION"});for(let m=0;m<e.orbPositions.length;m++){const g=e.orbPositions[m];this.isPositionInBounds(g,i,o)||t.push({message:`Orb position (${g.x}, ${g.y}) is outside maze bounds`,severity:"error",code:"INVALID_ORB_POSITION"})}e.metadata.solvable||t.push({message:"Generated maze is not solvable",severity:"error",code:"UNSOLVABLE_MAZE"});const a=this.getMinPathLengthRequirement(e.definition);a&&e.metadata.pathLength<a&&n.push({message:`Path length ${e.metadata.pathLength} is below recommended minimum ${a}`,severity:"warning",code:"SHORT_PATH"});const l=_c(e.maze.map(m=>m.map(g=>g.walls)),e.startPosition,e.orbPositions);return l.allAccessible||t.push({message:`${l.inaccessibleOrbs.length} orbs are not accessible from start position`,severity:"error",code:"INACCESSIBLE_ORBS"}),{valid:t.length===0,errors:t,warnings:n}}async generateProceduralLevel(e,t,n){const i=e.generation.parameters;if(!i)throw new Error("Procedural generation requires parameters");const{width:o,height:a}=e.config.boardSize,l={width:o,height:a,algorithm:this.mapAlgorithm(i.algorithm),startPosition:{x:0,y:0}},d=Yo(l,()=>t.next()).maze.map((L,D)=>L.map((F,j)=>({walls:F,type:this.determineCellType(j,D,o,a),properties:{isStart:j===0&&D===0,isGoal:j===o-1&&D===a-1,isVisited:!1}}))),m={x:0,y:0},g={x:o-1,y:a-1},b=this.generateOrbPositions(i,d,m,g,t),S=[],C=ni(d.map(L=>L.map(D=>D.walls)),m,g,this.getMazeValidationOptions(i));return{definition:e,maze:d,startPosition:m,goalPosition:g,orbPositions:b,powerupPositions:S,metadata:{seed:n,generationTime:0,algorithm:i.algorithm,solvable:C.isSolvable,pathLength:C.pathLength,complexity:C.complexity}}}async generateHandcraftedLevel(e,t){var d;const n=e.generation.layout;if(!n)throw new Error("Handcrafted generation requires layout data");const i=n.cells.map(m=>m.map(g=>({walls:g.walls,type:g.type==="start"||g.type==="goal"?"special":g.type,properties:{isStart:g.type==="start",isGoal:g.type==="goal",isVisited:!1,...g.properties}}))),o=n.orbPositions.map((m,g)=>({x:m.x,y:m.y,value:m.value,id:m.id||`orb_${g}`})),a=((d=n.powerupPositions)==null?void 0:d.map((m,g)=>({x:m.x,y:m.y,type:m.type,id:m.id||`powerup_${g}`})))||[],l=ni(i.map(m=>m.map(g=>g.walls)),n.startPosition,n.goalPosition);return{definition:e,maze:i,startPosition:{...n.startPosition},goalPosition:{...n.goalPosition},orbPositions:o,powerupPositions:a,metadata:{seed:t,generationTime:0,solvable:l.isSolvable,pathLength:l.pathLength,complexity:l.complexity}}}async generateFallbackLevel(e,t,n){const{width:i,height:o}=e.config.boardSize,a=[];for(let g=0;g<o;g++){const b=[];for(let S=0;S<i;S++){let C=0;S<i-1&&(C|=1),g<o-1&&(C|=2),S>0&&(C|=4),g>0&&(C|=8),b.push({walls:C,type:this.determineCellType(S,g,i,o),properties:{isStart:S===0&&g===0,isGoal:S===i-1&&g===o-1,isVisited:!1}})}a.push(b)}const l={x:0,y:0},h={x:i-1,y:o-1},d=Math.min(2,Math.floor(i*o/8)),m=[];for(let g=0;g<d;g++){let b,S;do b=Math.floor(t.next()*i),S=Math.floor(t.next()*o);while(b===0&&S===0||b===i-1&&S===o-1);m.push({x:b,y:S,value:100,id:`fallback_orb_${g}`})}return{definition:e,maze:a,startPosition:l,goalPosition:h,orbPositions:m,powerupPositions:[],metadata:{seed:n,generationTime:0,algorithm:"fallback",solvable:!0,pathLength:Math.abs(h.x-l.x)+Math.abs(h.y-l.y),complexity:0}}}generateOrbPositions(e,t,n,i,o){var C;const a=[],l=t.length,h=((C=t[0])==null?void 0:C.length)||0,d=e.orbCount||3,m=[];for(let L=0;L<l;L++)for(let D=0;D<h;D++)D===n.x&&L===n.y||D===i.x&&L===i.y||m.push({x:D,y:L});const g=o.shuffle([...m]);let b=[];switch(e.orbPlacement||"random"){case"random":b=g.slice(0,Math.min(d,g.length));break;case"corners":const L=g.filter(D=>(D.x===0||D.x===h-1)&&(D.y===0||D.y===l-1));b=[...L.slice(0,Math.min(d,L.length)),...g.filter(D=>!L.includes(D)).slice(0,Math.max(0,d-L.length))];break;case"strategic":case"path":default:b=g.slice(0,Math.min(d,g.length));break}return b.forEach((L,D)=>{a.push({x:L.x,y:L.y,value:100,id:`orb_${D}`})}),a}mapAlgorithm(e){switch(e){case"prim":case"kruskal":return"prim";case"recursive_backtrack":case"wilson":return"recursive-backtrack";default:return"prim"}}determineCellType(e,t,n,i){return e===0&&t===0||e===n-1&&t===i-1?"special":"floor"}getMazeValidationOptions(e){return{minPathLength:e.minPathLength,minComplexity:Math.floor(e.complexity*10),minReachableCells:Math.floor((e.branchingFactor||.3)*20)}}getMinPathLengthRequirement(e){const t=e.generation.parameters;return t==null?void 0:t.minPathLength}isPositionInBounds(e,t,n){return e.x>=0&&e.y>=0&&e.x<t&&e.y<n}initializeEmbeddedLevels(){[{id:"level-001-tutorial",name:"Tutorial",difficulty:"easy"},{id:"level-002-simple-path",name:"Simple Path",difficulty:"easy"},{id:"level-003-branching-paths",name:"Branching Paths",difficulty:"easy"},{id:"level-004-time-pressure",name:"Time Pressure",difficulty:"medium"},{id:"level-005-puzzle-chamber",name:"Puzzle Chamber",difficulty:"medium"},{id:"level-006-maze-runner",name:"Maze Runner",difficulty:"medium"},{id:"level-007-symmetry-challenge",name:"Symmetry Challenge",difficulty:"hard"},{id:"level-008-trap-maze",name:"Trap Maze",difficulty:"hard"},{id:"level-009-speed-demon",name:"Speed Demon",difficulty:"expert"},{id:"level-010-master-challenge",name:"Master Challenge",difficulty:"expert"}].forEach(t=>{this.embeddedLevels.set(t.id,{id:t.id,name:t.name,difficulty:t.difficulty})})}}var to={};/**
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
 */const Jo=function(s){const e=[];let t=0;for(let n=0;n<s.length;n++){let i=s.charCodeAt(n);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&n+1<s.length&&(s.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(s.charCodeAt(++n)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Vc=function(s){const e=[];let t=0,n=0;for(;t<s.length;){const i=s[t++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const o=s[t++];e[n++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){const o=s[t++],a=s[t++],l=s[t++],h=((i&7)<<18|(o&63)<<12|(a&63)<<6|l&63)-65536;e[n++]=String.fromCharCode(55296+(h>>10)),e[n++]=String.fromCharCode(56320+(h&1023))}else{const o=s[t++],a=s[t++];e[n++]=String.fromCharCode((i&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Zo={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(s,e){if(!Array.isArray(s))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<s.length;i+=3){const o=s[i],a=i+1<s.length,l=a?s[i+1]:0,h=i+2<s.length,d=h?s[i+2]:0,m=o>>2,g=(o&3)<<4|l>>4;let b=(l&15)<<2|d>>6,S=d&63;h||(S=64,a||(b=64)),n.push(t[m],t[g],t[b],t[S])}return n.join("")},encodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(s):this.encodeByteArray(Jo(s),e)},decodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(s):Vc(this.decodeStringToByteArray(s,e))},decodeStringToByteArray(s,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<s.length;){const o=t[s.charAt(i++)],l=i<s.length?t[s.charAt(i)]:0;++i;const d=i<s.length?t[s.charAt(i)]:64;++i;const g=i<s.length?t[s.charAt(i)]:64;if(++i,o==null||l==null||d==null||g==null)throw new Lc;const b=o<<2|l>>4;if(n.push(b),d!==64){const S=l<<4&240|d>>2;if(n.push(S),g!==64){const C=d<<6&192|g;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let s=0;s<this.ENCODED_VALS.length;s++)this.byteToCharMap_[s]=this.ENCODED_VALS.charAt(s),this.charToByteMap_[this.byteToCharMap_[s]]=s,this.byteToCharMapWebSafe_[s]=this.ENCODED_VALS_WEBSAFE.charAt(s),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[s]]=s,s>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(s)]=s,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(s)]=s)}}};class Lc extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Oc=function(s){const e=Jo(s);return Zo.encodeByteArray(e,!0)},Kn=function(s){return Oc(s).replace(/\./g,"")},xc=function(s){try{return Zo.decodeString(s,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Nc(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const kc=()=>Nc().__FIREBASE_DEFAULTS__,Mc=()=>{if(typeof process>"u"||typeof to>"u")return;const s=to.__FIREBASE_DEFAULTS__;if(s)return JSON.parse(s)},Fc=()=>{if(typeof document>"u")return;let s;try{s=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=s&&xc(s[1]);return e&&JSON.parse(e)},Ti=()=>{try{return kc()||Mc()||Fc()}catch(s){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${s}`);return}},$c=s=>{var e,t;return(t=(e=Ti())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[s]},Bc=s=>{const e=$c(s);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},ea=()=>{var s;return(s=Ti())===null||s===void 0?void 0:s.config};/**
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
 */class Uc{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
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
 */function jc(s,e){if(s.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",i=s.iat||0,o=s.sub||s.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:i,exp:i+3600,auth_time:i,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},s);return[Kn(JSON.stringify(t)),Kn(JSON.stringify(a)),""].join(".")}/**
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
 */function zc(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Gc(){var s;const e=(s=Ti())===null||s===void 0?void 0:s.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function ta(){const s=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof s=="object"&&s.id!==void 0}function qc(){return!Gc()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Ii(){try{return typeof indexedDB=="object"}catch{return!1}}function bi(){return new Promise((s,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(n),s(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var o;e(((o=i.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}function na(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
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
 */const Hc="FirebaseError";class Ze extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Hc,Object.setPrototypeOf(this,Ze.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,cs.prototype.create)}}class cs{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},i=`${this.service}/${e}`,o=this.errors[e],a=o?Kc(o,n):"Error",l=`${this.serviceName}: ${a} (${i}).`;return new Ze(i,l,n)}}function Kc(s,e){return s.replace(Wc,(t,n)=>{const i=e[n];return i!=null?String(i):`<${n}?>`})}const Wc=/\{\$([^}]+)}/g;function Wn(s,e){if(s===e)return!0;const t=Object.keys(s),n=Object.keys(e);for(const i of t){if(!n.includes(i))return!1;const o=s[i],a=e[i];if(no(o)&&no(a)){if(!Wn(o,a))return!1}else if(o!==a)return!1}for(const i of n)if(!t.includes(i))return!1;return!0}function no(s){return s!==null&&typeof s=="object"}/**
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
 */const Yc=1e3,Qc=2,Xc=4*60*60*1e3,Jc=.5;function so(s,e=Yc,t=Qc){const n=e*Math.pow(t,s),i=Math.round(Jc*n*(Math.random()-.5)*2);return Math.min(Xc,n+i)}/**
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
 */function ht(s){return s&&s._delegate?s._delegate:s}class Fe{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class Zc{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new Uc;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(o){if(i)return null;throw o}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(tu(e))try{this.getOrInitializeService({instanceIdentifier:rt})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:i});n.resolve(o)}catch{}}}}clearInstance(e=rt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rt){return this.instances.has(e)}getOptions(e=rt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[o,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(o);n===l&&a.resolve(i)}return i}onInit(e,t){var n;const i=this.normalizeInstanceIdentifier(t),o=(n=this.onInitCallbacks.get(i))!==null&&n!==void 0?n:new Set;o.add(e),this.onInitCallbacks.set(i,o);const a=this.instances.get(i);return a&&e(a,i),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const i of n)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:eu(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=rt){return this.component?this.component.multipleInstances?e:rt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function eu(s){return s===rt?void 0:s}function tu(s){return s.instantiationMode==="EAGER"}/**
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
 */class nu{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Zc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var B;(function(s){s[s.DEBUG=0]="DEBUG",s[s.VERBOSE=1]="VERBOSE",s[s.INFO=2]="INFO",s[s.WARN=3]="WARN",s[s.ERROR=4]="ERROR",s[s.SILENT=5]="SILENT"})(B||(B={}));const su={debug:B.DEBUG,verbose:B.VERBOSE,info:B.INFO,warn:B.WARN,error:B.ERROR,silent:B.SILENT},iu=B.INFO,ru={[B.DEBUG]:"log",[B.VERBOSE]:"log",[B.INFO]:"info",[B.WARN]:"warn",[B.ERROR]:"error"},ou=(s,e,...t)=>{if(e<s.logLevel)return;const n=new Date().toISOString(),i=ru[e];if(i)console[i](`[${n}]  ${s.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ai{constructor(e){this.name=e,this._logLevel=iu,this._logHandler=ou,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in B))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?su[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,B.DEBUG,...e),this._logHandler(this,B.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,B.VERBOSE,...e),this._logHandler(this,B.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,B.INFO,...e),this._logHandler(this,B.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,B.WARN,...e),this._logHandler(this,B.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,B.ERROR,...e),this._logHandler(this,B.ERROR,...e)}}const au=(s,e)=>e.some(t=>s instanceof t);let io,ro;function lu(){return io||(io=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cu(){return ro||(ro=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const sa=new WeakMap,ii=new WeakMap,ia=new WeakMap,qs=new WeakMap,Si=new WeakMap;function uu(s){const e=new Promise((t,n)=>{const i=()=>{s.removeEventListener("success",o),s.removeEventListener("error",a)},o=()=>{t(qe(s.result)),i()},a=()=>{n(s.error),i()};s.addEventListener("success",o),s.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&sa.set(t,s)}).catch(()=>{}),Si.set(e,s),e}function hu(s){if(ii.has(s))return;const e=new Promise((t,n)=>{const i=()=>{s.removeEventListener("complete",o),s.removeEventListener("error",a),s.removeEventListener("abort",a)},o=()=>{t(),i()},a=()=>{n(s.error||new DOMException("AbortError","AbortError")),i()};s.addEventListener("complete",o),s.addEventListener("error",a),s.addEventListener("abort",a)});ii.set(s,e)}let ri={get(s,e,t){if(s instanceof IDBTransaction){if(e==="done")return ii.get(s);if(e==="objectStoreNames")return s.objectStoreNames||ia.get(s);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return qe(s[e])},set(s,e,t){return s[e]=t,!0},has(s,e){return s instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in s}};function du(s){ri=s(ri)}function fu(s){return s===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=s.call(Hs(this),e,...t);return ia.set(n,e.sort?e.sort():[e]),qe(n)}:cu().includes(s)?function(...e){return s.apply(Hs(this),e),qe(sa.get(this))}:function(...e){return qe(s.apply(Hs(this),e))}}function mu(s){return typeof s=="function"?fu(s):(s instanceof IDBTransaction&&hu(s),au(s,lu())?new Proxy(s,ri):s)}function qe(s){if(s instanceof IDBRequest)return uu(s);if(qs.has(s))return qs.get(s);const e=mu(s);return e!==s&&(qs.set(s,e),Si.set(e,s)),e}const Hs=s=>Si.get(s);function ra(s,e,{blocked:t,upgrade:n,blocking:i,terminated:o}={}){const a=indexedDB.open(s,e),l=qe(a);return n&&a.addEventListener("upgradeneeded",h=>{n(qe(a.result),h.oldVersion,h.newVersion,qe(a.transaction),h)}),t&&a.addEventListener("blocked",h=>t(h.oldVersion,h.newVersion,h)),l.then(h=>{o&&h.addEventListener("close",()=>o()),i&&h.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const pu=["get","getKey","getAll","getAllKeys","count"],gu=["put","add","delete","clear"],Ks=new Map;function oo(s,e){if(!(s instanceof IDBDatabase&&!(e in s)&&typeof e=="string"))return;if(Ks.get(e))return Ks.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,i=gu.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(i||pu.includes(t)))return;const o=async function(a,...l){const h=this.transaction(a,i?"readwrite":"readonly");let d=h.store;return n&&(d=d.index(l.shift())),(await Promise.all([d[t](...l),i&&h.done]))[0]};return Ks.set(e,o),o}du(s=>({...s,get:(e,t,n)=>oo(e,t)||s.get(e,t,n),has:(e,t)=>!!oo(e,t)||s.has(e,t)}));/**
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
 */class yu{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(vu(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function vu(s){const e=s.getComponent();return(e==null?void 0:e.type)==="VERSION"}const oi="@firebase/app",ao="0.10.13";/**
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
 */const $e=new Ai("@firebase/app"),_u="@firebase/app-compat",Eu="@firebase/analytics-compat",wu="@firebase/analytics",Tu="@firebase/app-check-compat",Iu="@firebase/app-check",bu="@firebase/auth",Au="@firebase/auth-compat",Su="@firebase/database",Cu="@firebase/data-connect",Pu="@firebase/database-compat",Ru="@firebase/functions",Du="@firebase/functions-compat",Vu="@firebase/installations",Lu="@firebase/installations-compat",Ou="@firebase/messaging",xu="@firebase/messaging-compat",Nu="@firebase/performance",ku="@firebase/performance-compat",Mu="@firebase/remote-config",Fu="@firebase/remote-config-compat",$u="@firebase/storage",Bu="@firebase/storage-compat",Uu="@firebase/firestore",ju="@firebase/vertexai-preview",zu="@firebase/firestore-compat",Gu="firebase",qu="10.14.1";/**
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
 */const ai="[DEFAULT]",Hu={[oi]:"fire-core",[_u]:"fire-core-compat",[wu]:"fire-analytics",[Eu]:"fire-analytics-compat",[Iu]:"fire-app-check",[Tu]:"fire-app-check-compat",[bu]:"fire-auth",[Au]:"fire-auth-compat",[Su]:"fire-rtdb",[Cu]:"fire-data-connect",[Pu]:"fire-rtdb-compat",[Ru]:"fire-fn",[Du]:"fire-fn-compat",[Vu]:"fire-iid",[Lu]:"fire-iid-compat",[Ou]:"fire-fcm",[xu]:"fire-fcm-compat",[Nu]:"fire-perf",[ku]:"fire-perf-compat",[Mu]:"fire-rc",[Fu]:"fire-rc-compat",[$u]:"fire-gcs",[Bu]:"fire-gcs-compat",[Uu]:"fire-fst",[zu]:"fire-fst-compat",[ju]:"fire-vertex","fire-js":"fire-js",[Gu]:"fire-js-all"};/**
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
 */const Yn=new Map,Ku=new Map,li=new Map;function lo(s,e){try{s.container.addComponent(e)}catch(t){$e.debug(`Component ${e.name} failed to register with FirebaseApp ${s.name}`,t)}}function Ye(s){const e=s.name;if(li.has(e))return $e.debug(`There were multiple attempts to register component ${e}.`),!1;li.set(e,s);for(const t of Yn.values())lo(t,s);for(const t of Ku.values())lo(t,s);return!0}function pn(s,e){const t=s.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),s.container.getProvider(e)}/**
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
 */const Wu={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},He=new cs("app","Firebase",Wu);/**
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
 */class Yu{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Fe("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw He.create("app-deleted",{appName:this._name})}}/**
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
 */const Qu=qu;function oa(s,e={}){let t=s;typeof e!="object"&&(e={name:e});const n=Object.assign({name:ai,automaticDataCollectionEnabled:!1},e),i=n.name;if(typeof i!="string"||!i)throw He.create("bad-app-name",{appName:String(i)});if(t||(t=ea()),!t)throw He.create("no-options");const o=Yn.get(i);if(o){if(Wn(t,o.options)&&Wn(n,o.config))return o;throw He.create("duplicate-app",{appName:i})}const a=new nu(i);for(const h of li.values())a.addComponent(h);const l=new Yu(t,n,a);return Yn.set(i,l),l}function aa(s=ai){const e=Yn.get(s);if(!e&&s===ai&&ea())return oa();if(!e)throw He.create("no-app",{appName:s});return e}function De(s,e,t){var n;let i=(n=Hu[s])!==null&&n!==void 0?n:s;t&&(i+=`-${t}`);const o=i.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const l=[`Unable to register library "${i}" with version "${e}":`];o&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),o&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),$e.warn(l.join(" "));return}Ye(new Fe(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const Xu="firebase-heartbeat-database",Ju=1,an="firebase-heartbeat-store";let Ws=null;function la(){return Ws||(Ws=ra(Xu,Ju,{upgrade:(s,e)=>{switch(e){case 0:try{s.createObjectStore(an)}catch(t){console.warn(t)}}}}).catch(s=>{throw He.create("idb-open",{originalErrorMessage:s.message})})),Ws}async function Zu(s){try{const t=(await la()).transaction(an),n=await t.objectStore(an).get(ca(s));return await t.done,n}catch(e){if(e instanceof Ze)$e.warn(e.message);else{const t=He.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});$e.warn(t.message)}}}async function co(s,e){try{const n=(await la()).transaction(an,"readwrite");await n.objectStore(an).put(e,ca(s)),await n.done}catch(t){if(t instanceof Ze)$e.warn(t.message);else{const n=He.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});$e.warn(n.message)}}}function ca(s){return`${s.name}!${s.options.appId}`}/**
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
 */const eh=1024,th=30*24*60*60*1e3;class nh{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ih(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=uo();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o)?void 0:(this._heartbeatsCache.heartbeats.push({date:o,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=th}),this._storage.overwrite(this._heartbeatsCache))}catch(n){$e.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=uo(),{heartbeatsToSend:n,unsentEntries:i}=sh(this._heartbeatsCache.heartbeats),o=Kn(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return $e.warn(t),""}}}function uo(){return new Date().toISOString().substring(0,10)}function sh(s,e=eh){const t=[];let n=s.slice();for(const i of s){const o=t.find(a=>a.agent===i.agent);if(o){if(o.dates.push(i.date),ho(t)>e){o.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),ho(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class ih{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ii()?bi().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Zu(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return co(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return co(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function ho(s){return Kn(JSON.stringify({version:2,heartbeats:s})).length}/**
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
 */function rh(s){Ye(new Fe("platform-logger",e=>new yu(e),"PRIVATE")),Ye(new Fe("heartbeat",e=>new nh(e),"PRIVATE")),De(oi,ao,s),De(oi,ao,"esm2017"),De("fire-js","")}rh("");var fo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ua;(function(){var s;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,p){function v(){}v.prototype=p.prototype,w.D=p.prototype,w.prototype=new v,w.prototype.constructor=w,w.C=function(_,E,I){for(var y=Array(arguments.length-2),Oe=2;Oe<arguments.length;Oe++)y[Oe-2]=arguments[Oe];return p.prototype[E].apply(_,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(n,t),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(w,p,v){v||(v=0);var _=Array(16);if(typeof p=="string")for(var E=0;16>E;++E)_[E]=p.charCodeAt(v++)|p.charCodeAt(v++)<<8|p.charCodeAt(v++)<<16|p.charCodeAt(v++)<<24;else for(E=0;16>E;++E)_[E]=p[v++]|p[v++]<<8|p[v++]<<16|p[v++]<<24;p=w.g[0],v=w.g[1],E=w.g[2];var I=w.g[3],y=p+(I^v&(E^I))+_[0]+3614090360&4294967295;p=v+(y<<7&4294967295|y>>>25),y=I+(E^p&(v^E))+_[1]+3905402710&4294967295,I=p+(y<<12&4294967295|y>>>20),y=E+(v^I&(p^v))+_[2]+606105819&4294967295,E=I+(y<<17&4294967295|y>>>15),y=v+(p^E&(I^p))+_[3]+3250441966&4294967295,v=E+(y<<22&4294967295|y>>>10),y=p+(I^v&(E^I))+_[4]+4118548399&4294967295,p=v+(y<<7&4294967295|y>>>25),y=I+(E^p&(v^E))+_[5]+1200080426&4294967295,I=p+(y<<12&4294967295|y>>>20),y=E+(v^I&(p^v))+_[6]+2821735955&4294967295,E=I+(y<<17&4294967295|y>>>15),y=v+(p^E&(I^p))+_[7]+4249261313&4294967295,v=E+(y<<22&4294967295|y>>>10),y=p+(I^v&(E^I))+_[8]+1770035416&4294967295,p=v+(y<<7&4294967295|y>>>25),y=I+(E^p&(v^E))+_[9]+2336552879&4294967295,I=p+(y<<12&4294967295|y>>>20),y=E+(v^I&(p^v))+_[10]+4294925233&4294967295,E=I+(y<<17&4294967295|y>>>15),y=v+(p^E&(I^p))+_[11]+2304563134&4294967295,v=E+(y<<22&4294967295|y>>>10),y=p+(I^v&(E^I))+_[12]+1804603682&4294967295,p=v+(y<<7&4294967295|y>>>25),y=I+(E^p&(v^E))+_[13]+4254626195&4294967295,I=p+(y<<12&4294967295|y>>>20),y=E+(v^I&(p^v))+_[14]+2792965006&4294967295,E=I+(y<<17&4294967295|y>>>15),y=v+(p^E&(I^p))+_[15]+1236535329&4294967295,v=E+(y<<22&4294967295|y>>>10),y=p+(E^I&(v^E))+_[1]+4129170786&4294967295,p=v+(y<<5&4294967295|y>>>27),y=I+(v^E&(p^v))+_[6]+3225465664&4294967295,I=p+(y<<9&4294967295|y>>>23),y=E+(p^v&(I^p))+_[11]+643717713&4294967295,E=I+(y<<14&4294967295|y>>>18),y=v+(I^p&(E^I))+_[0]+3921069994&4294967295,v=E+(y<<20&4294967295|y>>>12),y=p+(E^I&(v^E))+_[5]+3593408605&4294967295,p=v+(y<<5&4294967295|y>>>27),y=I+(v^E&(p^v))+_[10]+38016083&4294967295,I=p+(y<<9&4294967295|y>>>23),y=E+(p^v&(I^p))+_[15]+3634488961&4294967295,E=I+(y<<14&4294967295|y>>>18),y=v+(I^p&(E^I))+_[4]+3889429448&4294967295,v=E+(y<<20&4294967295|y>>>12),y=p+(E^I&(v^E))+_[9]+568446438&4294967295,p=v+(y<<5&4294967295|y>>>27),y=I+(v^E&(p^v))+_[14]+3275163606&4294967295,I=p+(y<<9&4294967295|y>>>23),y=E+(p^v&(I^p))+_[3]+4107603335&4294967295,E=I+(y<<14&4294967295|y>>>18),y=v+(I^p&(E^I))+_[8]+1163531501&4294967295,v=E+(y<<20&4294967295|y>>>12),y=p+(E^I&(v^E))+_[13]+2850285829&4294967295,p=v+(y<<5&4294967295|y>>>27),y=I+(v^E&(p^v))+_[2]+4243563512&4294967295,I=p+(y<<9&4294967295|y>>>23),y=E+(p^v&(I^p))+_[7]+1735328473&4294967295,E=I+(y<<14&4294967295|y>>>18),y=v+(I^p&(E^I))+_[12]+2368359562&4294967295,v=E+(y<<20&4294967295|y>>>12),y=p+(v^E^I)+_[5]+4294588738&4294967295,p=v+(y<<4&4294967295|y>>>28),y=I+(p^v^E)+_[8]+2272392833&4294967295,I=p+(y<<11&4294967295|y>>>21),y=E+(I^p^v)+_[11]+1839030562&4294967295,E=I+(y<<16&4294967295|y>>>16),y=v+(E^I^p)+_[14]+4259657740&4294967295,v=E+(y<<23&4294967295|y>>>9),y=p+(v^E^I)+_[1]+2763975236&4294967295,p=v+(y<<4&4294967295|y>>>28),y=I+(p^v^E)+_[4]+1272893353&4294967295,I=p+(y<<11&4294967295|y>>>21),y=E+(I^p^v)+_[7]+4139469664&4294967295,E=I+(y<<16&4294967295|y>>>16),y=v+(E^I^p)+_[10]+3200236656&4294967295,v=E+(y<<23&4294967295|y>>>9),y=p+(v^E^I)+_[13]+681279174&4294967295,p=v+(y<<4&4294967295|y>>>28),y=I+(p^v^E)+_[0]+3936430074&4294967295,I=p+(y<<11&4294967295|y>>>21),y=E+(I^p^v)+_[3]+3572445317&4294967295,E=I+(y<<16&4294967295|y>>>16),y=v+(E^I^p)+_[6]+76029189&4294967295,v=E+(y<<23&4294967295|y>>>9),y=p+(v^E^I)+_[9]+3654602809&4294967295,p=v+(y<<4&4294967295|y>>>28),y=I+(p^v^E)+_[12]+3873151461&4294967295,I=p+(y<<11&4294967295|y>>>21),y=E+(I^p^v)+_[15]+530742520&4294967295,E=I+(y<<16&4294967295|y>>>16),y=v+(E^I^p)+_[2]+3299628645&4294967295,v=E+(y<<23&4294967295|y>>>9),y=p+(E^(v|~I))+_[0]+4096336452&4294967295,p=v+(y<<6&4294967295|y>>>26),y=I+(v^(p|~E))+_[7]+1126891415&4294967295,I=p+(y<<10&4294967295|y>>>22),y=E+(p^(I|~v))+_[14]+2878612391&4294967295,E=I+(y<<15&4294967295|y>>>17),y=v+(I^(E|~p))+_[5]+4237533241&4294967295,v=E+(y<<21&4294967295|y>>>11),y=p+(E^(v|~I))+_[12]+1700485571&4294967295,p=v+(y<<6&4294967295|y>>>26),y=I+(v^(p|~E))+_[3]+2399980690&4294967295,I=p+(y<<10&4294967295|y>>>22),y=E+(p^(I|~v))+_[10]+4293915773&4294967295,E=I+(y<<15&4294967295|y>>>17),y=v+(I^(E|~p))+_[1]+2240044497&4294967295,v=E+(y<<21&4294967295|y>>>11),y=p+(E^(v|~I))+_[8]+1873313359&4294967295,p=v+(y<<6&4294967295|y>>>26),y=I+(v^(p|~E))+_[15]+4264355552&4294967295,I=p+(y<<10&4294967295|y>>>22),y=E+(p^(I|~v))+_[6]+2734768916&4294967295,E=I+(y<<15&4294967295|y>>>17),y=v+(I^(E|~p))+_[13]+1309151649&4294967295,v=E+(y<<21&4294967295|y>>>11),y=p+(E^(v|~I))+_[4]+4149444226&4294967295,p=v+(y<<6&4294967295|y>>>26),y=I+(v^(p|~E))+_[11]+3174756917&4294967295,I=p+(y<<10&4294967295|y>>>22),y=E+(p^(I|~v))+_[2]+718787259&4294967295,E=I+(y<<15&4294967295|y>>>17),y=v+(I^(E|~p))+_[9]+3951481745&4294967295,w.g[0]=w.g[0]+p&4294967295,w.g[1]=w.g[1]+(E+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+E&4294967295,w.g[3]=w.g[3]+I&4294967295}n.prototype.u=function(w,p){p===void 0&&(p=w.length);for(var v=p-this.blockSize,_=this.B,E=this.h,I=0;I<p;){if(E==0)for(;I<=v;)i(this,w,I),I+=this.blockSize;if(typeof w=="string"){for(;I<p;)if(_[E++]=w.charCodeAt(I++),E==this.blockSize){i(this,_),E=0;break}}else for(;I<p;)if(_[E++]=w[I++],E==this.blockSize){i(this,_),E=0;break}}this.h=E,this.o+=p},n.prototype.v=function(){var w=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);w[0]=128;for(var p=1;p<w.length-8;++p)w[p]=0;var v=8*this.o;for(p=w.length-8;p<w.length;++p)w[p]=v&255,v/=256;for(this.u(w),w=Array(16),p=v=0;4>p;++p)for(var _=0;32>_;_+=8)w[v++]=this.g[p]>>>_&255;return w};function o(w,p){var v=l;return Object.prototype.hasOwnProperty.call(v,w)?v[w]:v[w]=p(w)}function a(w,p){this.h=p;for(var v=[],_=!0,E=w.length-1;0<=E;E--){var I=w[E]|0;_&&I==p||(v[E]=I,_=!1)}this.g=v}var l={};function h(w){return-128<=w&&128>w?o(w,function(p){return new a([p|0],0>p?-1:0)}):new a([w|0],0>w?-1:0)}function d(w){if(isNaN(w)||!isFinite(w))return g;if(0>w)return D(d(-w));for(var p=[],v=1,_=0;w>=v;_++)p[_]=w/v|0,v*=4294967296;return new a(p,0)}function m(w,p){if(w.length==0)throw Error("number format error: empty string");if(p=p||10,2>p||36<p)throw Error("radix out of range: "+p);if(w.charAt(0)=="-")return D(m(w.substring(1),p));if(0<=w.indexOf("-"))throw Error('number format error: interior "-" character');for(var v=d(Math.pow(p,8)),_=g,E=0;E<w.length;E+=8){var I=Math.min(8,w.length-E),y=parseInt(w.substring(E,E+I),p);8>I?(I=d(Math.pow(p,I)),_=_.j(I).add(d(y))):(_=_.j(v),_=_.add(d(y)))}return _}var g=h(0),b=h(1),S=h(16777216);s=a.prototype,s.m=function(){if(L(this))return-D(this).m();for(var w=0,p=1,v=0;v<this.g.length;v++){var _=this.i(v);w+=(0<=_?_:4294967296+_)*p,p*=4294967296}return w},s.toString=function(w){if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(C(this))return"0";if(L(this))return"-"+D(this).toString(w);for(var p=d(Math.pow(w,6)),v=this,_="";;){var E=le(v,p).g;v=F(v,E.j(p));var I=((0<v.g.length?v.g[0]:v.h)>>>0).toString(w);if(v=E,C(v))return I+_;for(;6>I.length;)I="0"+I;_=I+_}},s.i=function(w){return 0>w?0:w<this.g.length?this.g[w]:this.h};function C(w){if(w.h!=0)return!1;for(var p=0;p<w.g.length;p++)if(w.g[p]!=0)return!1;return!0}function L(w){return w.h==-1}s.l=function(w){return w=F(this,w),L(w)?-1:C(w)?0:1};function D(w){for(var p=w.g.length,v=[],_=0;_<p;_++)v[_]=~w.g[_];return new a(v,~w.h).add(b)}s.abs=function(){return L(this)?D(this):this},s.add=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0,E=0;E<=p;E++){var I=_+(this.i(E)&65535)+(w.i(E)&65535),y=(I>>>16)+(this.i(E)>>>16)+(w.i(E)>>>16);_=y>>>16,I&=65535,y&=65535,v[E]=y<<16|I}return new a(v,v[v.length-1]&-2147483648?-1:0)};function F(w,p){return w.add(D(p))}s.j=function(w){if(C(this)||C(w))return g;if(L(this))return L(w)?D(this).j(D(w)):D(D(this).j(w));if(L(w))return D(this.j(D(w)));if(0>this.l(S)&&0>w.l(S))return d(this.m()*w.m());for(var p=this.g.length+w.g.length,v=[],_=0;_<2*p;_++)v[_]=0;for(_=0;_<this.g.length;_++)for(var E=0;E<w.g.length;E++){var I=this.i(_)>>>16,y=this.i(_)&65535,Oe=w.i(E)>>>16,Ot=w.i(E)&65535;v[2*_+2*E]+=y*Ot,j(v,2*_+2*E),v[2*_+2*E+1]+=I*Ot,j(v,2*_+2*E+1),v[2*_+2*E+1]+=y*Oe,j(v,2*_+2*E+1),v[2*_+2*E+2]+=I*Oe,j(v,2*_+2*E+2)}for(_=0;_<p;_++)v[_]=v[2*_+1]<<16|v[2*_];for(_=p;_<2*p;_++)v[_]=0;return new a(v,0)};function j(w,p){for(;(w[p]&65535)!=w[p];)w[p+1]+=w[p]>>>16,w[p]&=65535,p++}function Q(w,p){this.g=w,this.h=p}function le(w,p){if(C(p))throw Error("division by zero");if(C(w))return new Q(g,g);if(L(w))return p=le(D(w),p),new Q(D(p.g),D(p.h));if(L(p))return p=le(w,D(p)),new Q(D(p.g),p.h);if(30<w.g.length){if(L(w)||L(p))throw Error("slowDivide_ only works with positive integers.");for(var v=b,_=p;0>=_.l(w);)v=et(v),_=et(_);var E=_e(v,1),I=_e(_,1);for(_=_e(_,2),v=_e(v,2);!C(_);){var y=I.add(_);0>=y.l(w)&&(E=E.add(v),I=y),_=_e(_,1),v=_e(v,1)}return p=F(w,E.j(p)),new Q(E,p)}for(E=g;0<=w.l(p);){for(v=Math.max(1,Math.floor(w.m()/p.m())),_=Math.ceil(Math.log(v)/Math.LN2),_=48>=_?1:Math.pow(2,_-48),I=d(v),y=I.j(p);L(y)||0<y.l(w);)v-=_,I=d(v),y=I.j(p);C(I)&&(I=b),E=E.add(I),w=F(w,y)}return new Q(E,w)}s.A=function(w){return le(this,w).h},s.and=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)&w.i(_);return new a(v,this.h&w.h)},s.or=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)|w.i(_);return new a(v,this.h|w.h)},s.xor=function(w){for(var p=Math.max(this.g.length,w.g.length),v=[],_=0;_<p;_++)v[_]=this.i(_)^w.i(_);return new a(v,this.h^w.h)};function et(w){for(var p=w.g.length+1,v=[],_=0;_<p;_++)v[_]=w.i(_)<<1|w.i(_-1)>>>31;return new a(v,w.h)}function _e(w,p){var v=p>>5;p%=32;for(var _=w.g.length-v,E=[],I=0;I<_;I++)E[I]=0<p?w.i(I+v)>>>p|w.i(I+v+1)<<32-p:w.i(I+v);return new a(E,w.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=m,ua=a}).apply(typeof fo<"u"?fo:typeof self<"u"?self:typeof window<"u"?window:{});var $n=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ha,Jt,da,Gn,ci,fa,ma,pa;(function(){var s,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(r,c,u){return r==Array.prototype||r==Object.prototype||(r[c]=u.value),r};function t(r){r=[typeof globalThis=="object"&&globalThis,r,typeof window=="object"&&window,typeof self=="object"&&self,typeof $n=="object"&&$n];for(var c=0;c<r.length;++c){var u=r[c];if(u&&u.Math==Math)return u}throw Error("Cannot find global object")}var n=t(this);function i(r,c){if(c)e:{var u=n;r=r.split(".");for(var f=0;f<r.length-1;f++){var T=r[f];if(!(T in u))break e;u=u[T]}r=r[r.length-1],f=u[r],c=c(f),c!=f&&c!=null&&e(u,r,{configurable:!0,writable:!0,value:c})}}function o(r,c){r instanceof String&&(r+="");var u=0,f=!1,T={next:function(){if(!f&&u<r.length){var A=u++;return{value:c(A,r[A]),done:!1}}return f=!0,{done:!0,value:void 0}}};return T[Symbol.iterator]=function(){return T},T}i("Array.prototype.values",function(r){return r||function(){return o(this,function(c,u){return u})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function h(r){var c=typeof r;return c=c!="object"?c:r?Array.isArray(r)?"array":c:"null",c=="array"||c=="object"&&typeof r.length=="number"}function d(r){var c=typeof r;return c=="object"&&r!=null||c=="function"}function m(r,c,u){return r.call.apply(r.bind,arguments)}function g(r,c,u){if(!r)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var T=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(T,f),r.apply(c,T)}}return function(){return r.apply(c,arguments)}}function b(r,c,u){return b=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?m:g,b.apply(null,arguments)}function S(r,c){var u=Array.prototype.slice.call(arguments,1);return function(){var f=u.slice();return f.push.apply(f,arguments),r.apply(this,f)}}function C(r,c){function u(){}u.prototype=c.prototype,r.aa=c.prototype,r.prototype=new u,r.prototype.constructor=r,r.Qb=function(f,T,A){for(var V=Array(arguments.length-2),z=2;z<arguments.length;z++)V[z-2]=arguments[z];return c.prototype[T].apply(f,V)}}function L(r){const c=r.length;if(0<c){const u=Array(c);for(let f=0;f<c;f++)u[f]=r[f];return u}return[]}function D(r,c){for(let u=1;u<arguments.length;u++){const f=arguments[u];if(h(f)){const T=r.length||0,A=f.length||0;r.length=T+A;for(let V=0;V<A;V++)r[T+V]=f[V]}else r.push(f)}}class F{constructor(c,u){this.i=c,this.j=u,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function j(r){return/^[\s\xa0]*$/.test(r)}function Q(){var r=l.navigator;return r&&(r=r.userAgent)?r:""}function le(r){return le[" "](r),r}le[" "]=function(){};var et=Q().indexOf("Gecko")!=-1&&!(Q().toLowerCase().indexOf("webkit")!=-1&&Q().indexOf("Edge")==-1)&&!(Q().indexOf("Trident")!=-1||Q().indexOf("MSIE")!=-1)&&Q().indexOf("Edge")==-1;function _e(r,c,u){for(const f in r)c.call(u,r[f],f,r)}function w(r,c){for(const u in r)c.call(void 0,r[u],u,r)}function p(r){const c={};for(const u in r)c[u]=r[u];return c}const v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function _(r,c){let u,f;for(let T=1;T<arguments.length;T++){f=arguments[T];for(u in f)r[u]=f[u];for(let A=0;A<v.length;A++)u=v[A],Object.prototype.hasOwnProperty.call(f,u)&&(r[u]=f[u])}}function E(r){var c=1;r=r.split(":");const u=[];for(;0<c&&r.length;)u.push(r.shift()),c--;return r.length&&u.push(r.join(":")),u}function I(r){l.setTimeout(()=>{throw r},0)}function y(){var r=ws;let c=null;return r.g&&(c=r.g,r.g=r.g.next,r.g||(r.h=null),c.next=null),c}class Oe{constructor(){this.h=this.g=null}add(c,u){const f=Ot.get();f.set(c,u),this.h?this.h.next=f:this.g=f,this.h=f}}var Ot=new F(()=>new xl,r=>r.reset());class xl{constructor(){this.next=this.g=this.h=null}set(c,u){this.h=c,this.g=u,this.next=null}reset(){this.next=this.g=this.h=null}}let xt,Nt=!1,ws=new Oe,Ji=()=>{const r=l.Promise.resolve(void 0);xt=()=>{r.then(Nl)}};var Nl=()=>{for(var r;r=y();){try{r.h.call(r.g)}catch(u){I(u)}var c=Ot;c.j(r),100>c.h&&(c.h++,r.next=c.g,c.g=r)}Nt=!1};function Be(){this.s=this.s,this.C=this.C}Be.prototype.s=!1,Be.prototype.ma=function(){this.s||(this.s=!0,this.N())},Be.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ce(r,c){this.type=r,this.g=this.target=c,this.defaultPrevented=!1}ce.prototype.h=function(){this.defaultPrevented=!0};var kl=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var r=!1,c=Object.defineProperty({},"passive",{get:function(){r=!0}});try{const u=()=>{};l.addEventListener("test",u,c),l.removeEventListener("test",u,c)}catch{}return r}();function kt(r,c){if(ce.call(this,r?r.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,r){var u=this.type=r.type,f=r.changedTouches&&r.changedTouches.length?r.changedTouches[0]:null;if(this.target=r.target||r.srcElement,this.g=c,c=r.relatedTarget){if(et){e:{try{le(c.nodeName);var T=!0;break e}catch{}T=!1}T||(c=null)}}else u=="mouseover"?c=r.fromElement:u=="mouseout"&&(c=r.toElement);this.relatedTarget=c,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=r.clientX!==void 0?r.clientX:r.pageX,this.clientY=r.clientY!==void 0?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0),this.button=r.button,this.key=r.key||"",this.ctrlKey=r.ctrlKey,this.altKey=r.altKey,this.shiftKey=r.shiftKey,this.metaKey=r.metaKey,this.pointerId=r.pointerId||0,this.pointerType=typeof r.pointerType=="string"?r.pointerType:Ml[r.pointerType]||"",this.state=r.state,this.i=r,r.defaultPrevented&&kt.aa.h.call(this)}}C(kt,ce);var Ml={2:"touch",3:"pen",4:"mouse"};kt.prototype.h=function(){kt.aa.h.call(this);var r=this.i;r.preventDefault?r.preventDefault():r.returnValue=!1};var En="closure_listenable_"+(1e6*Math.random()|0),Fl=0;function $l(r,c,u,f,T){this.listener=r,this.proxy=null,this.src=c,this.type=u,this.capture=!!f,this.ha=T,this.key=++Fl,this.da=this.fa=!1}function wn(r){r.da=!0,r.listener=null,r.proxy=null,r.src=null,r.ha=null}function Tn(r){this.src=r,this.g={},this.h=0}Tn.prototype.add=function(r,c,u,f,T){var A=r.toString();r=this.g[A],r||(r=this.g[A]=[],this.h++);var V=Is(r,c,f,T);return-1<V?(c=r[V],u||(c.fa=!1)):(c=new $l(c,this.src,A,!!f,T),c.fa=u,r.push(c)),c};function Ts(r,c){var u=c.type;if(u in r.g){var f=r.g[u],T=Array.prototype.indexOf.call(f,c,void 0),A;(A=0<=T)&&Array.prototype.splice.call(f,T,1),A&&(wn(c),r.g[u].length==0&&(delete r.g[u],r.h--))}}function Is(r,c,u,f){for(var T=0;T<r.length;++T){var A=r[T];if(!A.da&&A.listener==c&&A.capture==!!u&&A.ha==f)return T}return-1}var bs="closure_lm_"+(1e6*Math.random()|0),As={};function Zi(r,c,u,f,T){if(Array.isArray(c)){for(var A=0;A<c.length;A++)Zi(r,c[A],u,f,T);return null}return u=nr(u),r&&r[En]?r.K(c,u,d(f)?!!f.capture:!1,T):Bl(r,c,u,!1,f,T)}function Bl(r,c,u,f,T,A){if(!c)throw Error("Invalid event type");var V=d(T)?!!T.capture:!!T,z=Cs(r);if(z||(r[bs]=z=new Tn(r)),u=z.add(c,u,f,V,A),u.proxy)return u;if(f=Ul(),u.proxy=f,f.src=r,f.listener=u,r.addEventListener)kl||(T=V),T===void 0&&(T=!1),r.addEventListener(c.toString(),f,T);else if(r.attachEvent)r.attachEvent(tr(c.toString()),f);else if(r.addListener&&r.removeListener)r.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return u}function Ul(){function r(u){return c.call(r.src,r.listener,u)}const c=jl;return r}function er(r,c,u,f,T){if(Array.isArray(c))for(var A=0;A<c.length;A++)er(r,c[A],u,f,T);else f=d(f)?!!f.capture:!!f,u=nr(u),r&&r[En]?(r=r.i,c=String(c).toString(),c in r.g&&(A=r.g[c],u=Is(A,u,f,T),-1<u&&(wn(A[u]),Array.prototype.splice.call(A,u,1),A.length==0&&(delete r.g[c],r.h--)))):r&&(r=Cs(r))&&(c=r.g[c.toString()],r=-1,c&&(r=Is(c,u,f,T)),(u=-1<r?c[r]:null)&&Ss(u))}function Ss(r){if(typeof r!="number"&&r&&!r.da){var c=r.src;if(c&&c[En])Ts(c.i,r);else{var u=r.type,f=r.proxy;c.removeEventListener?c.removeEventListener(u,f,r.capture):c.detachEvent?c.detachEvent(tr(u),f):c.addListener&&c.removeListener&&c.removeListener(f),(u=Cs(c))?(Ts(u,r),u.h==0&&(u.src=null,c[bs]=null)):wn(r)}}}function tr(r){return r in As?As[r]:As[r]="on"+r}function jl(r,c){if(r.da)r=!0;else{c=new kt(c,this);var u=r.listener,f=r.ha||r.src;r.fa&&Ss(r),r=u.call(f,c)}return r}function Cs(r){return r=r[bs],r instanceof Tn?r:null}var Ps="__closure_events_fn_"+(1e9*Math.random()>>>0);function nr(r){return typeof r=="function"?r:(r[Ps]||(r[Ps]=function(c){return r.handleEvent(c)}),r[Ps])}function ue(){Be.call(this),this.i=new Tn(this),this.M=this,this.F=null}C(ue,Be),ue.prototype[En]=!0,ue.prototype.removeEventListener=function(r,c,u,f){er(this,r,c,u,f)};function ye(r,c){var u,f=r.F;if(f)for(u=[];f;f=f.F)u.push(f);if(r=r.M,f=c.type||c,typeof c=="string")c=new ce(c,r);else if(c instanceof ce)c.target=c.target||r;else{var T=c;c=new ce(f,r),_(c,T)}if(T=!0,u)for(var A=u.length-1;0<=A;A--){var V=c.g=u[A];T=In(V,f,!0,c)&&T}if(V=c.g=r,T=In(V,f,!0,c)&&T,T=In(V,f,!1,c)&&T,u)for(A=0;A<u.length;A++)V=c.g=u[A],T=In(V,f,!1,c)&&T}ue.prototype.N=function(){if(ue.aa.N.call(this),this.i){var r=this.i,c;for(c in r.g){for(var u=r.g[c],f=0;f<u.length;f++)wn(u[f]);delete r.g[c],r.h--}}this.F=null},ue.prototype.K=function(r,c,u,f){return this.i.add(String(r),c,!1,u,f)},ue.prototype.L=function(r,c,u,f){return this.i.add(String(r),c,!0,u,f)};function In(r,c,u,f){if(c=r.i.g[String(c)],!c)return!0;c=c.concat();for(var T=!0,A=0;A<c.length;++A){var V=c[A];if(V&&!V.da&&V.capture==u){var z=V.listener,ie=V.ha||V.src;V.fa&&Ts(r.i,V),T=z.call(ie,f)!==!1&&T}}return T&&!f.defaultPrevented}function sr(r,c,u){if(typeof r=="function")u&&(r=b(r,u));else if(r&&typeof r.handleEvent=="function")r=b(r.handleEvent,r);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:l.setTimeout(r,c||0)}function ir(r){r.g=sr(()=>{r.g=null,r.i&&(r.i=!1,ir(r))},r.l);const c=r.h;r.h=null,r.m.apply(null,c)}class zl extends Be{constructor(c,u){super(),this.m=c,this.l=u,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:ir(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Mt(r){Be.call(this),this.h=r,this.g={}}C(Mt,Be);var rr=[];function or(r){_e(r.g,function(c,u){this.g.hasOwnProperty(u)&&Ss(c)},r),r.g={}}Mt.prototype.N=function(){Mt.aa.N.call(this),or(this)},Mt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Rs=l.JSON.stringify,Gl=l.JSON.parse,ql=class{stringify(r){return l.JSON.stringify(r,void 0)}parse(r){return l.JSON.parse(r,void 0)}};function Ds(){}Ds.prototype.h=null;function ar(r){return r.h||(r.h=r.i())}function lr(){}var Ft={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Vs(){ce.call(this,"d")}C(Vs,ce);function Ls(){ce.call(this,"c")}C(Ls,ce);var tt={},cr=null;function bn(){return cr=cr||new ue}tt.La="serverreachability";function ur(r){ce.call(this,tt.La,r)}C(ur,ce);function $t(r){const c=bn();ye(c,new ur(c))}tt.STAT_EVENT="statevent";function hr(r,c){ce.call(this,tt.STAT_EVENT,r),this.stat=c}C(hr,ce);function ve(r){const c=bn();ye(c,new hr(c,r))}tt.Ma="timingevent";function dr(r,c){ce.call(this,tt.Ma,r),this.size=c}C(dr,ce);function Bt(r,c){if(typeof r!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){r()},c)}function Ut(){this.g=!0}Ut.prototype.xa=function(){this.g=!1};function Hl(r,c,u,f,T,A){r.info(function(){if(r.g)if(A)for(var V="",z=A.split("&"),ie=0;ie<z.length;ie++){var U=z[ie].split("=");if(1<U.length){var he=U[0];U=U[1];var de=he.split("_");V=2<=de.length&&de[1]=="type"?V+(he+"="+U+"&"):V+(he+"=redacted&")}}else V=null;else V=A;return"XMLHTTP REQ ("+f+") [attempt "+T+"]: "+c+`
`+u+`
`+V})}function Kl(r,c,u,f,T,A,V){r.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+T+"]: "+c+`
`+u+`
`+A+" "+V})}function vt(r,c,u,f){r.info(function(){return"XMLHTTP TEXT ("+c+"): "+Yl(r,u)+(f?" "+f:"")})}function Wl(r,c){r.info(function(){return"TIMEOUT: "+c})}Ut.prototype.info=function(){};function Yl(r,c){if(!r.g)return c;if(!c)return null;try{var u=JSON.parse(c);if(u){for(r=0;r<u.length;r++)if(Array.isArray(u[r])){var f=u[r];if(!(2>f.length)){var T=f[1];if(Array.isArray(T)&&!(1>T.length)){var A=T[0];if(A!="noop"&&A!="stop"&&A!="close")for(var V=1;V<T.length;V++)T[V]=""}}}}return Rs(u)}catch{return c}}var An={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},fr={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Os;function Sn(){}C(Sn,Ds),Sn.prototype.g=function(){return new XMLHttpRequest},Sn.prototype.i=function(){return{}},Os=new Sn;function Ue(r,c,u,f){this.j=r,this.i=c,this.l=u,this.R=f||1,this.U=new Mt(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new mr}function mr(){this.i=null,this.g="",this.h=!1}var pr={},xs={};function Ns(r,c,u){r.L=1,r.v=Dn(xe(c)),r.m=u,r.P=!0,gr(r,null)}function gr(r,c){r.F=Date.now(),Cn(r),r.A=xe(r.v);var u=r.A,f=r.R;Array.isArray(f)||(f=[String(f)]),Dr(u.i,"t",f),r.C=0,u=r.j.J,r.h=new mr,r.g=Wr(r.j,u?c:null,!r.m),0<r.O&&(r.M=new zl(b(r.Y,r,r.g),r.O)),c=r.U,u=r.g,f=r.ca;var T="readystatechange";Array.isArray(T)||(T&&(rr[0]=T.toString()),T=rr);for(var A=0;A<T.length;A++){var V=Zi(u,T[A],f||c.handleEvent,!1,c.h||c);if(!V)break;c.g[V.key]=V}c=r.H?p(r.H):{},r.m?(r.u||(r.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",r.g.ea(r.A,r.u,r.m,c)):(r.u="GET",r.g.ea(r.A,r.u,null,c)),$t(),Hl(r.i,r.u,r.A,r.l,r.R,r.m)}Ue.prototype.ca=function(r){r=r.target;const c=this.M;c&&Ne(r)==3?c.j():this.Y(r)},Ue.prototype.Y=function(r){try{if(r==this.g)e:{const de=Ne(this.g);var c=this.g.Ba();const wt=this.g.Z();if(!(3>de)&&(de!=3||this.g&&(this.h.h||this.g.oa()||Mr(this.g)))){this.J||de!=4||c==7||(c==8||0>=wt?$t(3):$t(2)),ks(this);var u=this.g.Z();this.X=u;t:if(yr(this)){var f=Mr(this.g);r="";var T=f.length,A=Ne(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){nt(this),jt(this);var V="";break t}this.h.i=new l.TextDecoder}for(c=0;c<T;c++)this.h.h=!0,r+=this.h.i.decode(f[c],{stream:!(A&&c==T-1)});f.length=0,this.h.g+=r,this.C=0,V=this.h.g}else V=this.g.oa();if(this.o=u==200,Kl(this.i,this.u,this.A,this.l,this.R,de,u),this.o){if(this.T&&!this.K){t:{if(this.g){var z,ie=this.g;if((z=ie.g?ie.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!j(z)){var U=z;break t}}U=null}if(u=U)vt(this.i,this.l,u,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ms(this,u);else{this.o=!1,this.s=3,ve(12),nt(this),jt(this);break e}}if(this.P){u=!0;let Ae;for(;!this.J&&this.C<V.length;)if(Ae=Ql(this,V),Ae==xs){de==4&&(this.s=4,ve(14),u=!1),vt(this.i,this.l,null,"[Incomplete Response]");break}else if(Ae==pr){this.s=4,ve(15),vt(this.i,this.l,V,"[Invalid Chunk]"),u=!1;break}else vt(this.i,this.l,Ae,null),Ms(this,Ae);if(yr(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),de!=4||V.length!=0||this.h.h||(this.s=1,ve(16),u=!1),this.o=this.o&&u,!u)vt(this.i,this.l,V,"[Invalid Chunked Response]"),nt(this),jt(this);else if(0<V.length&&!this.W){this.W=!0;var he=this.j;he.g==this&&he.ba&&!he.M&&(he.j.info("Great, no buffering proxy detected. Bytes received: "+V.length),zs(he),he.M=!0,ve(11))}}else vt(this.i,this.l,V,null),Ms(this,V);de==4&&nt(this),this.o&&!this.J&&(de==4?Gr(this.j,this):(this.o=!1,Cn(this)))}else fc(this.g),u==400&&0<V.indexOf("Unknown SID")?(this.s=3,ve(12)):(this.s=0,ve(13)),nt(this),jt(this)}}}catch{}finally{}};function yr(r){return r.g?r.u=="GET"&&r.L!=2&&r.j.Ca:!1}function Ql(r,c){var u=r.C,f=c.indexOf(`
`,u);return f==-1?xs:(u=Number(c.substring(u,f)),isNaN(u)?pr:(f+=1,f+u>c.length?xs:(c=c.slice(f,f+u),r.C=f+u,c)))}Ue.prototype.cancel=function(){this.J=!0,nt(this)};function Cn(r){r.S=Date.now()+r.I,vr(r,r.I)}function vr(r,c){if(r.B!=null)throw Error("WatchDog timer not null");r.B=Bt(b(r.ba,r),c)}function ks(r){r.B&&(l.clearTimeout(r.B),r.B=null)}Ue.prototype.ba=function(){this.B=null;const r=Date.now();0<=r-this.S?(Wl(this.i,this.A),this.L!=2&&($t(),ve(17)),nt(this),this.s=2,jt(this)):vr(this,this.S-r)};function jt(r){r.j.G==0||r.J||Gr(r.j,r)}function nt(r){ks(r);var c=r.M;c&&typeof c.ma=="function"&&c.ma(),r.M=null,or(r.U),r.g&&(c=r.g,r.g=null,c.abort(),c.ma())}function Ms(r,c){try{var u=r.j;if(u.G!=0&&(u.g==r||Fs(u.h,r))){if(!r.K&&Fs(u.h,r)&&u.G==3){try{var f=u.Da.g.parse(c)}catch{f=null}if(Array.isArray(f)&&f.length==3){var T=f;if(T[0]==0){e:if(!u.u){if(u.g)if(u.g.F+3e3<r.F)kn(u),xn(u);else break e;js(u),ve(18)}}else u.za=T[1],0<u.za-u.T&&37500>T[2]&&u.F&&u.v==0&&!u.C&&(u.C=Bt(b(u.Za,u),6e3));if(1>=wr(u.h)&&u.ca){try{u.ca()}catch{}u.ca=void 0}}else it(u,11)}else if((r.K||u.g==r)&&kn(u),!j(c))for(T=u.Da.g.parse(c),c=0;c<T.length;c++){let U=T[c];if(u.T=U[0],U=U[1],u.G==2)if(U[0]=="c"){u.K=U[1],u.ia=U[2];const he=U[3];he!=null&&(u.la=he,u.j.info("VER="+u.la));const de=U[4];de!=null&&(u.Aa=de,u.j.info("SVER="+u.Aa));const wt=U[5];wt!=null&&typeof wt=="number"&&0<wt&&(f=1.5*wt,u.L=f,u.j.info("backChannelRequestTimeoutMs_="+f)),f=u;const Ae=r.g;if(Ae){const Fn=Ae.g?Ae.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Fn){var A=f.h;A.g||Fn.indexOf("spdy")==-1&&Fn.indexOf("quic")==-1&&Fn.indexOf("h2")==-1||(A.j=A.l,A.g=new Set,A.h&&($s(A,A.h),A.h=null))}if(f.D){const Gs=Ae.g?Ae.g.getResponseHeader("X-HTTP-Session-Id"):null;Gs&&(f.ya=Gs,H(f.I,f.D,Gs))}}u.G=3,u.l&&u.l.ua(),u.ba&&(u.R=Date.now()-r.F,u.j.info("Handshake RTT: "+u.R+"ms")),f=u;var V=r;if(f.qa=Kr(f,f.J?f.ia:null,f.W),V.K){Tr(f.h,V);var z=V,ie=f.L;ie&&(z.I=ie),z.B&&(ks(z),Cn(z)),f.g=V}else jr(f);0<u.i.length&&Nn(u)}else U[0]!="stop"&&U[0]!="close"||it(u,7);else u.G==3&&(U[0]=="stop"||U[0]=="close"?U[0]=="stop"?it(u,7):Us(u):U[0]!="noop"&&u.l&&u.l.ta(U),u.v=0)}}$t(4)}catch{}}var Xl=class{constructor(r,c){this.g=r,this.map=c}};function _r(r){this.l=r||10,l.PerformanceNavigationTiming?(r=l.performance.getEntriesByType("navigation"),r=0<r.length&&(r[0].nextHopProtocol=="hq"||r[0].nextHopProtocol=="h2")):r=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=r?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Er(r){return r.h?!0:r.g?r.g.size>=r.j:!1}function wr(r){return r.h?1:r.g?r.g.size:0}function Fs(r,c){return r.h?r.h==c:r.g?r.g.has(c):!1}function $s(r,c){r.g?r.g.add(c):r.h=c}function Tr(r,c){r.h&&r.h==c?r.h=null:r.g&&r.g.has(c)&&r.g.delete(c)}_r.prototype.cancel=function(){if(this.i=Ir(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const r of this.g.values())r.cancel();this.g.clear()}};function Ir(r){if(r.h!=null)return r.i.concat(r.h.D);if(r.g!=null&&r.g.size!==0){let c=r.i;for(const u of r.g.values())c=c.concat(u.D);return c}return L(r.i)}function Jl(r){if(r.V&&typeof r.V=="function")return r.V();if(typeof Map<"u"&&r instanceof Map||typeof Set<"u"&&r instanceof Set)return Array.from(r.values());if(typeof r=="string")return r.split("");if(h(r)){for(var c=[],u=r.length,f=0;f<u;f++)c.push(r[f]);return c}c=[],u=0;for(f in r)c[u++]=r[f];return c}function Zl(r){if(r.na&&typeof r.na=="function")return r.na();if(!r.V||typeof r.V!="function"){if(typeof Map<"u"&&r instanceof Map)return Array.from(r.keys());if(!(typeof Set<"u"&&r instanceof Set)){if(h(r)||typeof r=="string"){var c=[];r=r.length;for(var u=0;u<r;u++)c.push(u);return c}c=[],u=0;for(const f in r)c[u++]=f;return c}}}function br(r,c){if(r.forEach&&typeof r.forEach=="function")r.forEach(c,void 0);else if(h(r)||typeof r=="string")Array.prototype.forEach.call(r,c,void 0);else for(var u=Zl(r),f=Jl(r),T=f.length,A=0;A<T;A++)c.call(void 0,f[A],u&&u[A],r)}var Ar=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function ec(r,c){if(r){r=r.split("&");for(var u=0;u<r.length;u++){var f=r[u].indexOf("="),T=null;if(0<=f){var A=r[u].substring(0,f);T=r[u].substring(f+1)}else A=r[u];c(A,T?decodeURIComponent(T.replace(/\+/g," ")):"")}}}function st(r){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,r instanceof st){this.h=r.h,Pn(this,r.j),this.o=r.o,this.g=r.g,Rn(this,r.s),this.l=r.l;var c=r.i,u=new qt;u.i=c.i,c.g&&(u.g=new Map(c.g),u.h=c.h),Sr(this,u),this.m=r.m}else r&&(c=String(r).match(Ar))?(this.h=!1,Pn(this,c[1]||"",!0),this.o=zt(c[2]||""),this.g=zt(c[3]||"",!0),Rn(this,c[4]),this.l=zt(c[5]||"",!0),Sr(this,c[6]||"",!0),this.m=zt(c[7]||"")):(this.h=!1,this.i=new qt(null,this.h))}st.prototype.toString=function(){var r=[],c=this.j;c&&r.push(Gt(c,Cr,!0),":");var u=this.g;return(u||c=="file")&&(r.push("//"),(c=this.o)&&r.push(Gt(c,Cr,!0),"@"),r.push(encodeURIComponent(String(u)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u=this.s,u!=null&&r.push(":",String(u))),(u=this.l)&&(this.g&&u.charAt(0)!="/"&&r.push("/"),r.push(Gt(u,u.charAt(0)=="/"?sc:nc,!0))),(u=this.i.toString())&&r.push("?",u),(u=this.m)&&r.push("#",Gt(u,rc)),r.join("")};function xe(r){return new st(r)}function Pn(r,c,u){r.j=u?zt(c,!0):c,r.j&&(r.j=r.j.replace(/:$/,""))}function Rn(r,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);r.s=c}else r.s=null}function Sr(r,c,u){c instanceof qt?(r.i=c,oc(r.i,r.h)):(u||(c=Gt(c,ic)),r.i=new qt(c,r.h))}function H(r,c,u){r.i.set(c,u)}function Dn(r){return H(r,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),r}function zt(r,c){return r?c?decodeURI(r.replace(/%25/g,"%2525")):decodeURIComponent(r):""}function Gt(r,c,u){return typeof r=="string"?(r=encodeURI(r).replace(c,tc),u&&(r=r.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),r):null}function tc(r){return r=r.charCodeAt(0),"%"+(r>>4&15).toString(16)+(r&15).toString(16)}var Cr=/[#\/\?@]/g,nc=/[#\?:]/g,sc=/[#\?]/g,ic=/[#\?@]/g,rc=/#/g;function qt(r,c){this.h=this.g=null,this.i=r||null,this.j=!!c}function je(r){r.g||(r.g=new Map,r.h=0,r.i&&ec(r.i,function(c,u){r.add(decodeURIComponent(c.replace(/\+/g," ")),u)}))}s=qt.prototype,s.add=function(r,c){je(this),this.i=null,r=_t(this,r);var u=this.g.get(r);return u||this.g.set(r,u=[]),u.push(c),this.h+=1,this};function Pr(r,c){je(r),c=_t(r,c),r.g.has(c)&&(r.i=null,r.h-=r.g.get(c).length,r.g.delete(c))}function Rr(r,c){return je(r),c=_t(r,c),r.g.has(c)}s.forEach=function(r,c){je(this),this.g.forEach(function(u,f){u.forEach(function(T){r.call(c,T,f,this)},this)},this)},s.na=function(){je(this);const r=Array.from(this.g.values()),c=Array.from(this.g.keys()),u=[];for(let f=0;f<c.length;f++){const T=r[f];for(let A=0;A<T.length;A++)u.push(c[f])}return u},s.V=function(r){je(this);let c=[];if(typeof r=="string")Rr(this,r)&&(c=c.concat(this.g.get(_t(this,r))));else{r=Array.from(this.g.values());for(let u=0;u<r.length;u++)c=c.concat(r[u])}return c},s.set=function(r,c){return je(this),this.i=null,r=_t(this,r),Rr(this,r)&&(this.h-=this.g.get(r).length),this.g.set(r,[c]),this.h+=1,this},s.get=function(r,c){return r?(r=this.V(r),0<r.length?String(r[0]):c):c};function Dr(r,c,u){Pr(r,c),0<u.length&&(r.i=null,r.g.set(_t(r,c),L(u)),r.h+=u.length)}s.toString=function(){if(this.i)return this.i;if(!this.g)return"";const r=[],c=Array.from(this.g.keys());for(var u=0;u<c.length;u++){var f=c[u];const A=encodeURIComponent(String(f)),V=this.V(f);for(f=0;f<V.length;f++){var T=A;V[f]!==""&&(T+="="+encodeURIComponent(String(V[f]))),r.push(T)}}return this.i=r.join("&")};function _t(r,c){return c=String(c),r.j&&(c=c.toLowerCase()),c}function oc(r,c){c&&!r.j&&(je(r),r.i=null,r.g.forEach(function(u,f){var T=f.toLowerCase();f!=T&&(Pr(this,f),Dr(this,T,u))},r)),r.j=c}function ac(r,c){const u=new Ut;if(l.Image){const f=new Image;f.onload=S(ze,u,"TestLoadImage: loaded",!0,c,f),f.onerror=S(ze,u,"TestLoadImage: error",!1,c,f),f.onabort=S(ze,u,"TestLoadImage: abort",!1,c,f),f.ontimeout=S(ze,u,"TestLoadImage: timeout",!1,c,f),l.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=r}else c(!1)}function lc(r,c){const u=new Ut,f=new AbortController,T=setTimeout(()=>{f.abort(),ze(u,"TestPingServer: timeout",!1,c)},1e4);fetch(r,{signal:f.signal}).then(A=>{clearTimeout(T),A.ok?ze(u,"TestPingServer: ok",!0,c):ze(u,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(T),ze(u,"TestPingServer: error",!1,c)})}function ze(r,c,u,f,T){try{T&&(T.onload=null,T.onerror=null,T.onabort=null,T.ontimeout=null),f(u)}catch{}}function cc(){this.g=new ql}function uc(r,c,u){const f=u||"";try{br(r,function(T,A){let V=T;d(T)&&(V=Rs(T)),c.push(f+A+"="+encodeURIComponent(V))})}catch(T){throw c.push(f+"type="+encodeURIComponent("_badmap")),T}}function Vn(r){this.l=r.Ub||null,this.j=r.eb||!1}C(Vn,Ds),Vn.prototype.g=function(){return new Ln(this.l,this.j)},Vn.prototype.i=function(r){return function(){return r}}({});function Ln(r,c){ue.call(this),this.D=r,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(Ln,ue),s=Ln.prototype,s.open=function(r,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=r,this.A=c,this.readyState=1,Kt(this)},s.send=function(r){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};r&&(c.body=r),(this.D||l).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},s.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Ht(this)),this.readyState=0},s.Sa=function(r){if(this.g&&(this.l=r,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=r.headers,this.readyState=2,Kt(this)),this.g&&(this.readyState=3,Kt(this),this.g)))if(this.responseType==="arraybuffer")r.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in r){if(this.j=r.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Vr(this)}else r.text().then(this.Ra.bind(this),this.ga.bind(this))};function Vr(r){r.j.read().then(r.Pa.bind(r)).catch(r.ga.bind(r))}s.Pa=function(r){if(this.g){if(this.o&&r.value)this.response.push(r.value);else if(!this.o){var c=r.value?r.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!r.done}))&&(this.response=this.responseText+=c)}r.done?Ht(this):Kt(this),this.readyState==3&&Vr(this)}},s.Ra=function(r){this.g&&(this.response=this.responseText=r,Ht(this))},s.Qa=function(r){this.g&&(this.response=r,Ht(this))},s.ga=function(){this.g&&Ht(this)};function Ht(r){r.readyState=4,r.l=null,r.j=null,r.v=null,Kt(r)}s.setRequestHeader=function(r,c){this.u.append(r,c)},s.getResponseHeader=function(r){return this.h&&this.h.get(r.toLowerCase())||""},s.getAllResponseHeaders=function(){if(!this.h)return"";const r=[],c=this.h.entries();for(var u=c.next();!u.done;)u=u.value,r.push(u[0]+": "+u[1]),u=c.next();return r.join(`\r
`)};function Kt(r){r.onreadystatechange&&r.onreadystatechange.call(r)}Object.defineProperty(Ln.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(r){this.m=r?"include":"same-origin"}});function Lr(r){let c="";return _e(r,function(u,f){c+=f,c+=":",c+=u,c+=`\r
`}),c}function Bs(r,c,u){e:{for(f in u){var f=!1;break e}f=!0}f||(u=Lr(u),typeof r=="string"?u!=null&&encodeURIComponent(String(u)):H(r,c,u))}function W(r){ue.call(this),this.headers=new Map,this.o=r||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(W,ue);var hc=/^https?$/i,dc=["POST","PUT"];s=W.prototype,s.Ha=function(r){this.J=r},s.ea=function(r,c,u,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+r);c=c?c.toUpperCase():"GET",this.D=r,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Os.g(),this.v=this.o?ar(this.o):ar(Os),this.g.onreadystatechange=b(this.Ea,this);try{this.B=!0,this.g.open(c,String(r),!0),this.B=!1}catch(A){Or(this,A);return}if(r=u||"",u=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var T in f)u.set(T,f[T]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const A of f.keys())u.set(A,f.get(A));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(u.keys()).find(A=>A.toLowerCase()=="content-type"),T=l.FormData&&r instanceof l.FormData,!(0<=Array.prototype.indexOf.call(dc,c,void 0))||f||T||u.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[A,V]of u)this.g.setRequestHeader(A,V);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{kr(this),this.u=!0,this.g.send(r),this.u=!1}catch(A){Or(this,A)}};function Or(r,c){r.h=!1,r.g&&(r.j=!0,r.g.abort(),r.j=!1),r.l=c,r.m=5,xr(r),On(r)}function xr(r){r.A||(r.A=!0,ye(r,"complete"),ye(r,"error"))}s.abort=function(r){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=r||7,ye(this,"complete"),ye(this,"abort"),On(this))},s.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),On(this,!0)),W.aa.N.call(this)},s.Ea=function(){this.s||(this.B||this.u||this.j?Nr(this):this.bb())},s.bb=function(){Nr(this)};function Nr(r){if(r.h&&typeof a<"u"&&(!r.v[1]||Ne(r)!=4||r.Z()!=2)){if(r.u&&Ne(r)==4)sr(r.Ea,0,r);else if(ye(r,"readystatechange"),Ne(r)==4){r.h=!1;try{const V=r.Z();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var u;if(!(u=c)){var f;if(f=V===0){var T=String(r.D).match(Ar)[1]||null;!T&&l.self&&l.self.location&&(T=l.self.location.protocol.slice(0,-1)),f=!hc.test(T?T.toLowerCase():"")}u=f}if(u)ye(r,"complete"),ye(r,"success");else{r.m=6;try{var A=2<Ne(r)?r.g.statusText:""}catch{A=""}r.l=A+" ["+r.Z()+"]",xr(r)}}finally{On(r)}}}}function On(r,c){if(r.g){kr(r);const u=r.g,f=r.v[0]?()=>{}:null;r.g=null,r.v=null,c||ye(r,"ready");try{u.onreadystatechange=f}catch{}}}function kr(r){r.I&&(l.clearTimeout(r.I),r.I=null)}s.isActive=function(){return!!this.g};function Ne(r){return r.g?r.g.readyState:0}s.Z=function(){try{return 2<Ne(this)?this.g.status:-1}catch{return-1}},s.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},s.Oa=function(r){if(this.g){var c=this.g.responseText;return r&&c.indexOf(r)==0&&(c=c.substring(r.length)),Gl(c)}};function Mr(r){try{if(!r.g)return null;if("response"in r.g)return r.g.response;switch(r.H){case"":case"text":return r.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in r.g)return r.g.mozResponseArrayBuffer}return null}catch{return null}}function fc(r){const c={};r=(r.g&&2<=Ne(r)&&r.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<r.length;f++){if(j(r[f]))continue;var u=E(r[f]);const T=u[0];if(u=u[1],typeof u!="string")continue;u=u.trim();const A=c[T]||[];c[T]=A,A.push(u)}w(c,function(f){return f.join(", ")})}s.Ba=function(){return this.m},s.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Wt(r,c,u){return u&&u.internalChannelParams&&u.internalChannelParams[r]||c}function Fr(r){this.Aa=0,this.i=[],this.j=new Ut,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Wt("failFast",!1,r),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Wt("baseRetryDelayMs",5e3,r),this.cb=Wt("retryDelaySeedMs",1e4,r),this.Wa=Wt("forwardChannelMaxRetries",2,r),this.wa=Wt("forwardChannelRequestTimeoutMs",2e4,r),this.pa=r&&r.xmlHttpFactory||void 0,this.Xa=r&&r.Tb||void 0,this.Ca=r&&r.useFetchStreams||!1,this.L=void 0,this.J=r&&r.supportsCrossDomainXhr||!1,this.K="",this.h=new _r(r&&r.concurrentRequestLimit),this.Da=new cc,this.P=r&&r.fastHandshake||!1,this.O=r&&r.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=r&&r.Rb||!1,r&&r.xa&&this.j.xa(),r&&r.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&r&&r.detectBufferingProxy||!1,this.ja=void 0,r&&r.longPollingTimeout&&0<r.longPollingTimeout&&(this.ja=r.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}s=Fr.prototype,s.la=8,s.G=1,s.connect=function(r,c,u,f){ve(0),this.W=r,this.H=c||{},u&&f!==void 0&&(this.H.OSID=u,this.H.OAID=f),this.F=this.X,this.I=Kr(this,null,this.W),Nn(this)};function Us(r){if($r(r),r.G==3){var c=r.U++,u=xe(r.I);if(H(u,"SID",r.K),H(u,"RID",c),H(u,"TYPE","terminate"),Yt(r,u),c=new Ue(r,r.j,c),c.L=2,c.v=Dn(xe(u)),u=!1,l.navigator&&l.navigator.sendBeacon)try{u=l.navigator.sendBeacon(c.v.toString(),"")}catch{}!u&&l.Image&&(new Image().src=c.v,u=!0),u||(c.g=Wr(c.j,null),c.g.ea(c.v)),c.F=Date.now(),Cn(c)}Hr(r)}function xn(r){r.g&&(zs(r),r.g.cancel(),r.g=null)}function $r(r){xn(r),r.u&&(l.clearTimeout(r.u),r.u=null),kn(r),r.h.cancel(),r.s&&(typeof r.s=="number"&&l.clearTimeout(r.s),r.s=null)}function Nn(r){if(!Er(r.h)&&!r.s){r.s=!0;var c=r.Ga;xt||Ji(),Nt||(xt(),Nt=!0),ws.add(c,r),r.B=0}}function mc(r,c){return wr(r.h)>=r.h.j-(r.s?1:0)?!1:r.s?(r.i=c.D.concat(r.i),!0):r.G==1||r.G==2||r.B>=(r.Va?0:r.Wa)?!1:(r.s=Bt(b(r.Ga,r,c),qr(r,r.B)),r.B++,!0)}s.Ga=function(r){if(this.s)if(this.s=null,this.G==1){if(!r){this.U=Math.floor(1e5*Math.random()),r=this.U++;const T=new Ue(this,this.j,r);let A=this.o;if(this.S&&(A?(A=p(A),_(A,this.S)):A=this.S),this.m!==null||this.O||(T.H=A,A=null),this.P)e:{for(var c=0,u=0;u<this.i.length;u++){t:{var f=this.i[u];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(c+=f,4096<c){c=u;break e}if(c===4096||u===this.i.length-1){c=u+1;break e}}c=1e3}else c=1e3;c=Ur(this,T,c),u=xe(this.I),H(u,"RID",r),H(u,"CVER",22),this.D&&H(u,"X-HTTP-Session-Id",this.D),Yt(this,u),A&&(this.O?c="headers="+encodeURIComponent(String(Lr(A)))+"&"+c:this.m&&Bs(u,this.m,A)),$s(this.h,T),this.Ua&&H(u,"TYPE","init"),this.P?(H(u,"$req",c),H(u,"SID","null"),T.T=!0,Ns(T,u,null)):Ns(T,u,c),this.G=2}}else this.G==3&&(r?Br(this,r):this.i.length==0||Er(this.h)||Br(this))};function Br(r,c){var u;c?u=c.l:u=r.U++;const f=xe(r.I);H(f,"SID",r.K),H(f,"RID",u),H(f,"AID",r.T),Yt(r,f),r.m&&r.o&&Bs(f,r.m,r.o),u=new Ue(r,r.j,u,r.B+1),r.m===null&&(u.H=r.o),c&&(r.i=c.D.concat(r.i)),c=Ur(r,u,1e3),u.I=Math.round(.5*r.wa)+Math.round(.5*r.wa*Math.random()),$s(r.h,u),Ns(u,f,c)}function Yt(r,c){r.H&&_e(r.H,function(u,f){H(c,f,u)}),r.l&&br({},function(u,f){H(c,f,u)})}function Ur(r,c,u){u=Math.min(r.i.length,u);var f=r.l?b(r.l.Na,r.l,r):null;e:{var T=r.i;let A=-1;for(;;){const V=["count="+u];A==-1?0<u?(A=T[0].g,V.push("ofs="+A)):A=0:V.push("ofs="+A);let z=!0;for(let ie=0;ie<u;ie++){let U=T[ie].g;const he=T[ie].map;if(U-=A,0>U)A=Math.max(0,T[ie].g-100),z=!1;else try{uc(he,V,"req"+U+"_")}catch{f&&f(he)}}if(z){f=V.join("&");break e}}}return r=r.i.splice(0,u),c.D=r,f}function jr(r){if(!r.g&&!r.u){r.Y=1;var c=r.Fa;xt||Ji(),Nt||(xt(),Nt=!0),ws.add(c,r),r.v=0}}function js(r){return r.g||r.u||3<=r.v?!1:(r.Y++,r.u=Bt(b(r.Fa,r),qr(r,r.v)),r.v++,!0)}s.Fa=function(){if(this.u=null,zr(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var r=2*this.R;this.j.info("BP detection timer enabled: "+r),this.A=Bt(b(this.ab,this),r)}},s.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ve(10),xn(this),zr(this))};function zs(r){r.A!=null&&(l.clearTimeout(r.A),r.A=null)}function zr(r){r.g=new Ue(r,r.j,"rpc",r.Y),r.m===null&&(r.g.H=r.o),r.g.O=0;var c=xe(r.qa);H(c,"RID","rpc"),H(c,"SID",r.K),H(c,"AID",r.T),H(c,"CI",r.F?"0":"1"),!r.F&&r.ja&&H(c,"TO",r.ja),H(c,"TYPE","xmlhttp"),Yt(r,c),r.m&&r.o&&Bs(c,r.m,r.o),r.L&&(r.g.I=r.L);var u=r.g;r=r.ia,u.L=1,u.v=Dn(xe(c)),u.m=null,u.P=!0,gr(u,r)}s.Za=function(){this.C!=null&&(this.C=null,xn(this),js(this),ve(19))};function kn(r){r.C!=null&&(l.clearTimeout(r.C),r.C=null)}function Gr(r,c){var u=null;if(r.g==c){kn(r),zs(r),r.g=null;var f=2}else if(Fs(r.h,c))u=c.D,Tr(r.h,c),f=1;else return;if(r.G!=0){if(c.o)if(f==1){u=c.m?c.m.length:0,c=Date.now()-c.F;var T=r.B;f=bn(),ye(f,new dr(f,u)),Nn(r)}else jr(r);else if(T=c.s,T==3||T==0&&0<c.X||!(f==1&&mc(r,c)||f==2&&js(r)))switch(u&&0<u.length&&(c=r.h,c.i=c.i.concat(u)),T){case 1:it(r,5);break;case 4:it(r,10);break;case 3:it(r,6);break;default:it(r,2)}}}function qr(r,c){let u=r.Ta+Math.floor(Math.random()*r.cb);return r.isActive()||(u*=2),u*c}function it(r,c){if(r.j.info("Error code "+c),c==2){var u=b(r.fb,r),f=r.Xa;const T=!f;f=new st(f||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Pn(f,"https"),Dn(f),T?ac(f.toString(),u):lc(f.toString(),u)}else ve(2);r.G=0,r.l&&r.l.sa(c),Hr(r),$r(r)}s.fb=function(r){r?(this.j.info("Successfully pinged google.com"),ve(2)):(this.j.info("Failed to ping google.com"),ve(1))};function Hr(r){if(r.G=0,r.ka=[],r.l){const c=Ir(r.h);(c.length!=0||r.i.length!=0)&&(D(r.ka,c),D(r.ka,r.i),r.h.i.length=0,L(r.i),r.i.length=0),r.l.ra()}}function Kr(r,c,u){var f=u instanceof st?xe(u):new st(u);if(f.g!="")c&&(f.g=c+"."+f.g),Rn(f,f.s);else{var T=l.location;f=T.protocol,c=c?c+"."+T.hostname:T.hostname,T=+T.port;var A=new st(null);f&&Pn(A,f),c&&(A.g=c),T&&Rn(A,T),u&&(A.l=u),f=A}return u=r.D,c=r.ya,u&&c&&H(f,u,c),H(f,"VER",r.la),Yt(r,f),f}function Wr(r,c,u){if(c&&!r.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=r.Ca&&!r.pa?new W(new Vn({eb:u})):new W(r.pa),c.Ha(r.J),c}s.isActive=function(){return!!this.l&&this.l.isActive(this)};function Yr(){}s=Yr.prototype,s.ua=function(){},s.ta=function(){},s.sa=function(){},s.ra=function(){},s.isActive=function(){return!0},s.Na=function(){};function Mn(){}Mn.prototype.g=function(r,c){return new Te(r,c)};function Te(r,c){ue.call(this),this.g=new Fr(c),this.l=r,this.h=c&&c.messageUrlParams||null,r=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(r?r["X-Client-Protocol"]="webchannel":r={"X-Client-Protocol":"webchannel"}),this.g.o=r,r=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(r?r["X-WebChannel-Content-Type"]=c.messageContentType:r={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(r?r["X-WebChannel-Client-Profile"]=c.va:r={"X-WebChannel-Client-Profile":c.va}),this.g.S=r,(r=c&&c.Sb)&&!j(r)&&(this.g.m=r),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!j(c)&&(this.g.D=c,r=this.h,r!==null&&c in r&&(r=this.h,c in r&&delete r[c])),this.j=new Et(this)}C(Te,ue),Te.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Te.prototype.close=function(){Us(this.g)},Te.prototype.o=function(r){var c=this.g;if(typeof r=="string"){var u={};u.__data__=r,r=u}else this.u&&(u={},u.__data__=Rs(r),r=u);c.i.push(new Xl(c.Ya++,r)),c.G==3&&Nn(c)},Te.prototype.N=function(){this.g.l=null,delete this.j,Us(this.g),delete this.g,Te.aa.N.call(this)};function Qr(r){Vs.call(this),r.__headers__&&(this.headers=r.__headers__,this.statusCode=r.__status__,delete r.__headers__,delete r.__status__);var c=r.__sm__;if(c){e:{for(const u in c){r=u;break e}r=void 0}(this.i=r)&&(r=this.i,c=c!==null&&r in c?c[r]:void 0),this.data=c}else this.data=r}C(Qr,Vs);function Xr(){Ls.call(this),this.status=1}C(Xr,Ls);function Et(r){this.g=r}C(Et,Yr),Et.prototype.ua=function(){ye(this.g,"a")},Et.prototype.ta=function(r){ye(this.g,new Qr(r))},Et.prototype.sa=function(r){ye(this.g,new Xr)},Et.prototype.ra=function(){ye(this.g,"b")},Mn.prototype.createWebChannel=Mn.prototype.g,Te.prototype.send=Te.prototype.o,Te.prototype.open=Te.prototype.m,Te.prototype.close=Te.prototype.close,pa=function(){return new Mn},ma=function(){return bn()},fa=tt,ci={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},An.NO_ERROR=0,An.TIMEOUT=8,An.HTTP_ERROR=6,Gn=An,fr.COMPLETE="complete",da=fr,lr.EventType=Ft,Ft.OPEN="a",Ft.CLOSE="b",Ft.ERROR="c",Ft.MESSAGE="d",ue.prototype.listen=ue.prototype.K,Jt=lr,W.prototype.listenOnce=W.prototype.L,W.prototype.getLastError=W.prototype.Ka,W.prototype.getLastErrorCode=W.prototype.Ba,W.prototype.getStatus=W.prototype.Z,W.prototype.getResponseJson=W.prototype.Oa,W.prototype.getResponseText=W.prototype.oa,W.prototype.send=W.prototype.ea,W.prototype.setWithCredentials=W.prototype.Ha,ha=W}).apply(typeof $n<"u"?$n:typeof self<"u"?self:typeof window<"u"?window:{});const mo="@firebase/firestore";/**
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
 */class me{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}me.UNAUTHENTICATED=new me(null),me.GOOGLE_CREDENTIALS=new me("google-credentials-uid"),me.FIRST_PARTY=new me("first-party-uid"),me.MOCK_USER=new me("mock-user");/**
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
 */let Vt="10.14.0";/**
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
 */const dt=new Ai("@firebase/firestore");function Qt(){return dt.logLevel}function x(s,...e){if(dt.logLevel<=B.DEBUG){const t=e.map(Ci);dt.debug(`Firestore (${Vt}): ${s}`,...t)}}function ft(s,...e){if(dt.logLevel<=B.ERROR){const t=e.map(Ci);dt.error(`Firestore (${Vt}): ${s}`,...t)}}function Qn(s,...e){if(dt.logLevel<=B.WARN){const t=e.map(Ci);dt.warn(`Firestore (${Vt}): ${s}`,...t)}}function Ci(s){if(typeof s=="string")return s;try{/**
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
 */function M(s="Unexpected state"){const e=`FIRESTORE (${Vt}) INTERNAL ASSERTION FAILED: `+s;throw ft(e),new Error(e)}function X(s,e){s||M()}function q(s,e){return s}/**
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
 */const R={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends Ze{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class ct{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
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
 */class ga{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class oh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(me.UNAUTHENTICATED))}shutdown(){}}class ah{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class lh{constructor(e){this.t=e,this.currentUser=me.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){X(this.o===void 0);let n=this.i;const i=h=>this.i!==n?(n=this.i,t(h)):Promise.resolve();let o=new ct;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new ct,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const h=o;e.enqueueRetryable(async()=>{await h.promise,await i(this.currentUser)})},l=h=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(h=>l(h)),setTimeout(()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?l(h):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new ct)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(n=>this.i!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(X(typeof n.accessToken=="string"),new ga(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return X(e===null||typeof e=="string"),new me(e)}}class ch{constructor(e,t,n){this.l=e,this.h=t,this.P=n,this.type="FirstParty",this.user=me.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class uh{constructor(e,t,n){this.l=e,this.h=t,this.P=n}getToken(){return Promise.resolve(new ch(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(me.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class hh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class dh{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){X(this.o===void 0);const n=o=>{o.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.R;return this.R=o.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>n(o))};const i=o=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>i(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?i(o):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(X(typeof t.token=="string"),this.R=t.token,new hh(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function fh(s){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(s);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<s;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class ya{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let n="";for(;n.length<20;){const i=fh(40);for(let o=0;o<i.length;++o)n.length<20&&i[o]<t&&(n+=e.charAt(i[o]%e.length))}return n}}function G(s,e){return s<e?-1:s>e?1:0}function St(s,e,t){return s.length===e.length&&s.every((n,i)=>t(n,e[i]))}/**
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
 */class se{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new N(R.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new N(R.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new N(R.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new N(R.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor(1e6*(e-1e3*t));return new se(t,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?G(this.nanoseconds,e.nanoseconds):G(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class K{constructor(e){this.timestamp=e}static fromTimestamp(e){return new K(e)}static min(){return new K(new se(0,0))}static max(){return new K(new se(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class ln{constructor(e,t,n){t===void 0?t=0:t>e.length&&M(),n===void 0?n=e.length-t:n>e.length-t&&M(),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return ln.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ln?e.forEach(n=>{t.push(n)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let i=0;i<n;i++){const o=e.get(i),a=t.get(i);if(o<a)return-1;if(o>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class Y extends ln{construct(e,t,n){return new Y(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new N(R.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(i=>i.length>0))}return new Y(t)}static emptyPath(){return new Y([])}}const mh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ae extends ln{construct(e,t,n){return new ae(e,t,n)}static isValidIdentifier(e){return mh.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ae.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ae(["__name__"])}static fromServerFormat(e){const t=[];let n="",i=0;const o=()=>{if(n.length===0)throw new N(R.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let a=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new N(R.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const h=e[i+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new N(R.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=h,i+=2}else l==="`"?(a=!a,i++):l!=="."||a?(n+=l,i++):(o(),i++)}if(o(),a)throw new N(R.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ae(t)}static emptyPath(){return new ae([])}}/**
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
 */class k{constructor(e){this.path=e}static fromPath(e){return new k(Y.fromString(e))}static fromName(e){return new k(Y.fromString(e).popFirst(5))}static empty(){return new k(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Y.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new k(new Y(e.slice()))}}function ph(s,e){const t=s.toTimestamp().seconds,n=s.toTimestamp().nanoseconds+1,i=K.fromTimestamp(n===1e9?new se(t+1,0):new se(t,n));return new Qe(i,k.empty(),e)}function gh(s){return new Qe(s.readTime,s.key,-1)}class Qe{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Qe(K.min(),k.empty(),-1)}static max(){return new Qe(K.max(),k.empty(),-1)}}function yh(s,e){let t=s.readTime.compareTo(e.readTime);return t!==0?t:(t=k.comparator(s.documentKey,e.documentKey),t!==0?t:G(s.largestBatchId,e.largestBatchId))}/**
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
 */const vh="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class _h{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function va(s){if(s.code!==R.FAILED_PRECONDITION||s.message!==vh)throw s;x("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&M(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P((n,i)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(n,i)},this.catchCallback=o=>{this.wrapFailure(t,o).next(n,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):P.reject(t)}static resolve(e){return new P((t,n)=>{t(e)})}static reject(e){return new P((t,n)=>{n(e)})}static waitFor(e){return new P((t,n)=>{let i=0,o=0,a=!1;e.forEach(l=>{++i,l.next(()=>{++o,a&&o===i&&t()},h=>n(h))}),a=!0,o===i&&t()})}static or(e){let t=P.resolve(!1);for(const n of e)t=t.next(i=>i?P.resolve(i):n());return t}static forEach(e,t){const n=[];return e.forEach((i,o)=>{n.push(t.call(this,i,o))}),this.waitFor(n)}static mapArray(e,t){return new P((n,i)=>{const o=e.length,a=new Array(o);let l=0;for(let h=0;h<o;h++){const d=h;t(e[d]).next(m=>{a[d]=m,++l,l===o&&n(a)},m=>i(m))}})}static doWhile(e,t){return new P((n,i)=>{const o=()=>{e()===!0?t().next(()=>{o()},i):n()};o()})}}function Eh(s){const e=s.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function us(s){return s.name==="IndexedDbTransactionError"}/**
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
 */class _a{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ie(n),this.se=n=>t.writeSequenceNumber(n))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}_a.oe=-1;function Pi(s){return s==null}function Xn(s){return s===0&&1/s==-1/0}function wh(s){return typeof s=="number"&&Number.isInteger(s)&&!Xn(s)&&s<=Number.MAX_SAFE_INTEGER&&s>=Number.MIN_SAFE_INTEGER}/**
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
 */function po(s){let e=0;for(const t in s)Object.prototype.hasOwnProperty.call(s,t)&&e++;return e}function gn(s,e){for(const t in s)Object.prototype.hasOwnProperty.call(s,t)&&e(t,s[t])}function Ea(s){for(const e in s)if(Object.prototype.hasOwnProperty.call(s,e))return!1;return!0}/**
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
 */class we{constructor(e,t){this.comparator=e,this.root=t||re.EMPTY}insert(e,t){return new we(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,re.BLACK,null,null))}remove(e){return new we(this.comparator,this.root.remove(e,this.comparator).copy(null,null,re.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const i=this.comparator(e,n.key);if(i===0)return t+n.left.size;i<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Bn(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Bn(this.root,e,this.comparator,!1)}getReverseIterator(){return new Bn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Bn(this.root,e,this.comparator,!0)}}class Bn{constructor(e,t,n,i){this.isReverse=i,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?n(e.key,t):1,t&&i&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class re{constructor(e,t,n,i,o){this.key=e,this.value=t,this.color=n??re.RED,this.left=i??re.EMPTY,this.right=o??re.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,i,o){return new re(e??this.key,t??this.value,n??this.color,i??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let i=this;const o=n(e,i.key);return i=o<0?i.copy(null,null,null,i.left.insert(e,t,n),null):o===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,n)),i.fixUp()}removeMin(){if(this.left.isEmpty())return re.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return re.EMPTY;n=i.right.min(),i=i.copy(n.key,n.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,re.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,re.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw M();const e=this.left.check();if(e!==this.right.check())throw M();return e+(this.isRed()?0:1)}}re.EMPTY=null,re.RED=!0,re.BLACK=!1;re.EMPTY=new class{constructor(){this.size=0}get key(){throw M()}get value(){throw M()}get color(){throw M()}get left(){throw M()}get right(){throw M()}copy(e,t,n,i,o){return this}insert(e,t,n){return new re(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class ge{constructor(e){this.comparator=e,this.data=new we(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const i=n.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new go(this.data.getIterator())}getIteratorFrom(e){return new go(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(n=>{t=t.add(n)}),t}isEqual(e){if(!(e instanceof ge)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,o=n.getNext().key;if(this.comparator(i,o)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ge(this.comparator);return t.data=e,t}}class go{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Pe{constructor(e){this.fields=e,e.sort(ae.comparator)}static empty(){return new Pe([])}unionWith(e){let t=new ge(ae.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Pe(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return St(this.fields,e.fields,(t,n)=>t.isEqual(n))}}/**
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
 */class Th extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Ve{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new Th("Invalid base64 string: "+o):o}}(e);return new Ve(t)}static fromUint8Array(e){const t=function(i){let o="";for(let a=0;a<i.length;++a)o+=String.fromCharCode(i[a]);return o}(e);return new Ve(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const n=new Uint8Array(t.length);for(let i=0;i<t.length;i++)n[i]=t.charCodeAt(i);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return G(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ve.EMPTY_BYTE_STRING=new Ve("");const Ih=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function mt(s){if(X(!!s),typeof s=="string"){let e=0;const t=Ih.exec(s);if(X(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const n=new Date(s);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:oe(s.seconds),nanos:oe(s.nanos)}}function oe(s){return typeof s=="number"?s:typeof s=="string"?Number(s):0}function cn(s){return typeof s=="string"?Ve.fromBase64String(s):Ve.fromUint8Array(s)}/**
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
 */function Ri(s){var e,t;return((t=(((e=s==null?void 0:s.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function wa(s){const e=s.mapValue.fields.__previous_value__;return Ri(e)?wa(e):e}function Jn(s){const e=mt(s.mapValue.fields.__local_write_time__.timestampValue);return new se(e.seconds,e.nanos)}/**
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
 */class bh{constructor(e,t,n,i,o,a,l,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=i,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=h,this.useFetchStreams=d}}class Zn{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Zn("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Zn&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const Un={mapValue:{}};function Ct(s){return"nullValue"in s?0:"booleanValue"in s?1:"integerValue"in s||"doubleValue"in s?2:"timestampValue"in s?3:"stringValue"in s?5:"bytesValue"in s?6:"referenceValue"in s?7:"geoPointValue"in s?8:"arrayValue"in s?9:"mapValue"in s?Ri(s)?4:Sh(s)?9007199254740991:Ah(s)?10:11:M()}function Le(s,e){if(s===e)return!0;const t=Ct(s);if(t!==Ct(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return s.booleanValue===e.booleanValue;case 4:return Jn(s).isEqual(Jn(e));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const a=mt(i.timestampValue),l=mt(o.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(s,e);case 5:return s.stringValue===e.stringValue;case 6:return function(i,o){return cn(i.bytesValue).isEqual(cn(o.bytesValue))}(s,e);case 7:return s.referenceValue===e.referenceValue;case 8:return function(i,o){return oe(i.geoPointValue.latitude)===oe(o.geoPointValue.latitude)&&oe(i.geoPointValue.longitude)===oe(o.geoPointValue.longitude)}(s,e);case 2:return function(i,o){if("integerValue"in i&&"integerValue"in o)return oe(i.integerValue)===oe(o.integerValue);if("doubleValue"in i&&"doubleValue"in o){const a=oe(i.doubleValue),l=oe(o.doubleValue);return a===l?Xn(a)===Xn(l):isNaN(a)&&isNaN(l)}return!1}(s,e);case 9:return St(s.arrayValue.values||[],e.arrayValue.values||[],Le);case 10:case 11:return function(i,o){const a=i.mapValue.fields||{},l=o.mapValue.fields||{};if(po(a)!==po(l))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(l[h]===void 0||!Le(a[h],l[h])))return!1;return!0}(s,e);default:return M()}}function un(s,e){return(s.values||[]).find(t=>Le(t,e))!==void 0}function Pt(s,e){if(s===e)return 0;const t=Ct(s),n=Ct(e);if(t!==n)return G(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return G(s.booleanValue,e.booleanValue);case 2:return function(o,a){const l=oe(o.integerValue||o.doubleValue),h=oe(a.integerValue||a.doubleValue);return l<h?-1:l>h?1:l===h?0:isNaN(l)?isNaN(h)?0:-1:1}(s,e);case 3:return yo(s.timestampValue,e.timestampValue);case 4:return yo(Jn(s),Jn(e));case 5:return G(s.stringValue,e.stringValue);case 6:return function(o,a){const l=cn(o),h=cn(a);return l.compareTo(h)}(s.bytesValue,e.bytesValue);case 7:return function(o,a){const l=o.split("/"),h=a.split("/");for(let d=0;d<l.length&&d<h.length;d++){const m=G(l[d],h[d]);if(m!==0)return m}return G(l.length,h.length)}(s.referenceValue,e.referenceValue);case 8:return function(o,a){const l=G(oe(o.latitude),oe(a.latitude));return l!==0?l:G(oe(o.longitude),oe(a.longitude))}(s.geoPointValue,e.geoPointValue);case 9:return vo(s.arrayValue,e.arrayValue);case 10:return function(o,a){var l,h,d,m;const g=o.fields||{},b=a.fields||{},S=(l=g.value)===null||l===void 0?void 0:l.arrayValue,C=(h=b.value)===null||h===void 0?void 0:h.arrayValue,L=G(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((m=C==null?void 0:C.values)===null||m===void 0?void 0:m.length)||0);return L!==0?L:vo(S,C)}(s.mapValue,e.mapValue);case 11:return function(o,a){if(o===Un.mapValue&&a===Un.mapValue)return 0;if(o===Un.mapValue)return 1;if(a===Un.mapValue)return-1;const l=o.fields||{},h=Object.keys(l),d=a.fields||{},m=Object.keys(d);h.sort(),m.sort();for(let g=0;g<h.length&&g<m.length;++g){const b=G(h[g],m[g]);if(b!==0)return b;const S=Pt(l[h[g]],d[m[g]]);if(S!==0)return S}return G(h.length,m.length)}(s.mapValue,e.mapValue);default:throw M()}}function yo(s,e){if(typeof s=="string"&&typeof e=="string"&&s.length===e.length)return G(s,e);const t=mt(s),n=mt(e),i=G(t.seconds,n.seconds);return i!==0?i:G(t.nanos,n.nanos)}function vo(s,e){const t=s.values||[],n=e.values||[];for(let i=0;i<t.length&&i<n.length;++i){const o=Pt(t[i],n[i]);if(o)return o}return G(t.length,n.length)}function Rt(s){return ui(s)}function ui(s){return"nullValue"in s?"null":"booleanValue"in s?""+s.booleanValue:"integerValue"in s?""+s.integerValue:"doubleValue"in s?""+s.doubleValue:"timestampValue"in s?function(t){const n=mt(t);return`time(${n.seconds},${n.nanos})`}(s.timestampValue):"stringValue"in s?s.stringValue:"bytesValue"in s?function(t){return cn(t).toBase64()}(s.bytesValue):"referenceValue"in s?function(t){return k.fromName(t).toString()}(s.referenceValue):"geoPointValue"in s?function(t){return`geo(${t.latitude},${t.longitude})`}(s.geoPointValue):"arrayValue"in s?function(t){let n="[",i=!0;for(const o of t.values||[])i?i=!1:n+=",",n+=ui(o);return n+"]"}(s.arrayValue):"mapValue"in s?function(t){const n=Object.keys(t.fields||{}).sort();let i="{",o=!0;for(const a of n)o?o=!1:i+=",",i+=`${a}:${ui(t.fields[a])}`;return i+"}"}(s.mapValue):M()}function hi(s){return!!s&&"integerValue"in s}function Di(s){return!!s&&"arrayValue"in s}function qn(s){return!!s&&"mapValue"in s}function Ah(s){var e,t;return((t=(((e=s==null?void 0:s.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function en(s){if(s.geoPointValue)return{geoPointValue:Object.assign({},s.geoPointValue)};if(s.timestampValue&&typeof s.timestampValue=="object")return{timestampValue:Object.assign({},s.timestampValue)};if(s.mapValue){const e={mapValue:{fields:{}}};return gn(s.mapValue.fields,(t,n)=>e.mapValue.fields[t]=en(n)),e}if(s.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(s.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=en(s.arrayValue.values[t]);return e}return Object.assign({},s)}function Sh(s){return(((s.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class Ce{constructor(e){this.value=e}static empty(){return new Ce({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!qn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=en(t)}setAll(e){let t=ae.emptyPath(),n={},i=[];e.forEach((a,l)=>{if(!t.isImmediateParentOf(l)){const h=this.getFieldsMap(t);this.applyChanges(h,n,i),n={},i=[],t=l.popLast()}a?n[l.lastSegment()]=en(a):i.push(l.lastSegment())});const o=this.getFieldsMap(t);this.applyChanges(o,n,i)}delete(e){const t=this.field(e.popLast());qn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Le(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let i=t.mapValue.fields[e.get(n)];qn(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,n){gn(t,(i,o)=>e[i]=o);for(const i of n)delete e[i]}clone(){return new Ce(en(this.value))}}function Ta(s){const e=[];return gn(s.fields,(t,n)=>{const i=new ae([t]);if(qn(n)){const o=Ta(n.mapValue).fields;if(o.length===0)e.push(i);else for(const a of o)e.push(i.child(a))}else e.push(i)}),new Pe(e)}/**
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
 */class Se{constructor(e,t,n,i,o,a,l){this.key=e,this.documentType=t,this.version=n,this.readTime=i,this.createTime=o,this.data=a,this.documentState=l}static newInvalidDocument(e){return new Se(e,0,K.min(),K.min(),K.min(),Ce.empty(),0)}static newFoundDocument(e,t,n,i){return new Se(e,1,t,K.min(),n,i,0)}static newNoDocument(e,t){return new Se(e,2,t,K.min(),K.min(),Ce.empty(),0)}static newUnknownDocument(e,t){return new Se(e,3,t,K.min(),K.min(),Ce.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(K.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ce.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ce.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=K.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Se&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Se(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class es{constructor(e,t){this.position=e,this.inclusive=t}}function _o(s,e,t){let n=0;for(let i=0;i<s.position.length;i++){const o=e[i],a=s.position[i];if(o.field.isKeyField()?n=k.comparator(k.fromName(a.referenceValue),t.key):n=Pt(a,t.data.field(o.field)),o.dir==="desc"&&(n*=-1),n!==0)break}return n}function Eo(s,e){if(s===null)return e===null;if(e===null||s.inclusive!==e.inclusive||s.position.length!==e.position.length)return!1;for(let t=0;t<s.position.length;t++)if(!Le(s.position[t],e.position[t]))return!1;return!0}/**
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
 */class ts{constructor(e,t="asc"){this.field=e,this.dir=t}}function Ch(s,e){return s.dir===e.dir&&s.field.isEqual(e.field)}/**
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
 */class Ia{}class ne extends Ia{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new Rh(e,t,n):t==="array-contains"?new Lh(e,n):t==="in"?new Oh(e,n):t==="not-in"?new xh(e,n):t==="array-contains-any"?new Nh(e,n):new ne(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new Dh(e,n):new Vh(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Pt(t,this.value)):t!==null&&Ct(this.value)===Ct(t)&&this.matchesComparison(Pt(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return M()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Xe extends Ia{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Xe(e,t)}matches(e){return ba(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function ba(s){return s.op==="and"}function Aa(s){return Ph(s)&&ba(s)}function Ph(s){for(const e of s.filters)if(e instanceof Xe)return!1;return!0}function di(s){if(s instanceof ne)return s.field.canonicalString()+s.op.toString()+Rt(s.value);if(Aa(s))return s.filters.map(e=>di(e)).join(",");{const e=s.filters.map(t=>di(t)).join(",");return`${s.op}(${e})`}}function Sa(s,e){return s instanceof ne?function(n,i){return i instanceof ne&&n.op===i.op&&n.field.isEqual(i.field)&&Le(n.value,i.value)}(s,e):s instanceof Xe?function(n,i){return i instanceof Xe&&n.op===i.op&&n.filters.length===i.filters.length?n.filters.reduce((o,a,l)=>o&&Sa(a,i.filters[l]),!0):!1}(s,e):void M()}function Ca(s){return s instanceof ne?function(t){return`${t.field.canonicalString()} ${t.op} ${Rt(t.value)}`}(s):s instanceof Xe?function(t){return t.op.toString()+" {"+t.getFilters().map(Ca).join(" ,")+"}"}(s):"Filter"}class Rh extends ne{constructor(e,t,n){super(e,t,n),this.key=k.fromName(n.referenceValue)}matches(e){const t=k.comparator(e.key,this.key);return this.matchesComparison(t)}}class Dh extends ne{constructor(e,t){super(e,"in",t),this.keys=Pa("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Vh extends ne{constructor(e,t){super(e,"not-in",t),this.keys=Pa("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Pa(s,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(n=>k.fromName(n.referenceValue))}class Lh extends ne{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Di(t)&&un(t.arrayValue,this.value)}}class Oh extends ne{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&un(this.value.arrayValue,t)}}class xh extends ne{constructor(e,t){super(e,"not-in",t)}matches(e){if(un(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!un(this.value.arrayValue,t)}}class Nh extends ne{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Di(t)||!t.arrayValue.values)&&t.arrayValue.values.some(n=>un(this.value.arrayValue,n))}}/**
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
 */class kh{constructor(e,t=null,n=[],i=[],o=null,a=null,l=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=i,this.limit=o,this.startAt=a,this.endAt=l,this.ue=null}}function wo(s,e=null,t=[],n=[],i=null,o=null,a=null){return new kh(s,e,t,n,i,o,a)}function Vi(s){const e=q(s);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(n=>di(n)).join(","),t+="|ob:",t+=e.orderBy.map(n=>function(o){return o.field.canonicalString()+o.dir}(n)).join(","),Pi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(n=>Rt(n)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(n=>Rt(n)).join(",")),e.ue=t}return e.ue}function Li(s,e){if(s.limit!==e.limit||s.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<s.orderBy.length;t++)if(!Ch(s.orderBy[t],e.orderBy[t]))return!1;if(s.filters.length!==e.filters.length)return!1;for(let t=0;t<s.filters.length;t++)if(!Sa(s.filters[t],e.filters[t]))return!1;return s.collectionGroup===e.collectionGroup&&!!s.path.isEqual(e.path)&&!!Eo(s.startAt,e.startAt)&&Eo(s.endAt,e.endAt)}/**
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
 */class hs{constructor(e,t=null,n=[],i=[],o=null,a="F",l=null,h=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=i,this.limit=o,this.limitType=a,this.startAt=l,this.endAt=h,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Mh(s,e,t,n,i,o,a,l){return new hs(s,e,t,n,i,o,a,l)}function Fh(s){return new hs(s)}function To(s){return s.filters.length===0&&s.limit===null&&s.startAt==null&&s.endAt==null&&(s.explicitOrderBy.length===0||s.explicitOrderBy.length===1&&s.explicitOrderBy[0].field.isKeyField())}function $h(s){return s.collectionGroup!==null}function tn(s){const e=q(s);if(e.ce===null){e.ce=[];const t=new Set;for(const o of e.explicitOrderBy)e.ce.push(o),t.add(o.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new ge(ae.comparator);return a.filters.forEach(h=>{h.getFlattenedFilters().forEach(d=>{d.isInequality()&&(l=l.add(d.field))})}),l})(e).forEach(o=>{t.has(o.canonicalString())||o.isKeyField()||e.ce.push(new ts(o,n))}),t.has(ae.keyField().canonicalString())||e.ce.push(new ts(ae.keyField(),n))}return e.ce}function ut(s){const e=q(s);return e.le||(e.le=Bh(e,tn(s))),e.le}function Bh(s,e){if(s.limitType==="F")return wo(s.path,s.collectionGroup,e,s.filters,s.limit,s.startAt,s.endAt);{e=e.map(i=>{const o=i.dir==="desc"?"asc":"desc";return new ts(i.field,o)});const t=s.endAt?new es(s.endAt.position,s.endAt.inclusive):null,n=s.startAt?new es(s.startAt.position,s.startAt.inclusive):null;return wo(s.path,s.collectionGroup,e,s.filters,s.limit,t,n)}}function fi(s,e,t){return new hs(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),e,t,s.startAt,s.endAt)}function Ra(s,e){return Li(ut(s),ut(e))&&s.limitType===e.limitType}function Da(s){return`${Vi(ut(s))}|lt:${s.limitType}`}function Xt(s){return`Query(target=${function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map(i=>Ca(i)).join(", ")}]`),Pi(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map(i=>Rt(i)).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map(i=>Rt(i)).join(",")),`Target(${n})`}(ut(s))}; limitType=${s.limitType})`}function Oi(s,e){return e.isFoundDocument()&&function(n,i){const o=i.key.path;return n.collectionGroup!==null?i.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(o):k.isDocumentKey(n.path)?n.path.isEqual(o):n.path.isImmediateParentOf(o)}(s,e)&&function(n,i){for(const o of tn(n))if(!o.field.isKeyField()&&i.data.field(o.field)===null)return!1;return!0}(s,e)&&function(n,i){for(const o of n.filters)if(!o.matches(i))return!1;return!0}(s,e)&&function(n,i){return!(n.startAt&&!function(a,l,h){const d=_o(a,l,h);return a.inclusive?d<=0:d<0}(n.startAt,tn(n),i)||n.endAt&&!function(a,l,h){const d=_o(a,l,h);return a.inclusive?d>=0:d>0}(n.endAt,tn(n),i))}(s,e)}function Uh(s){return(e,t)=>{let n=!1;for(const i of tn(s)){const o=jh(i,e,t);if(o!==0)return o;n=n||i.field.isKeyField()}return 0}}function jh(s,e,t){const n=s.field.isKeyField()?k.comparator(e.key,t.key):function(o,a,l){const h=a.data.field(o),d=l.data.field(o);return h!==null&&d!==null?Pt(h,d):M()}(s.field,e,t);switch(s.dir){case"asc":return n;case"desc":return-1*n;default:return M()}}/**
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
 */class Lt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[i,o]of n)if(this.equalsFn(i,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),i=this.inner[n];if(i===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let o=0;o<i.length;o++)if(this.equalsFn(i[o][0],e))return void(i[o]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let i=0;i<n.length;i++)if(this.equalsFn(n[i][0],e))return n.length===1?delete this.inner[t]:n.splice(i,1),this.innerSize--,!0;return!1}forEach(e){gn(this.inner,(t,n)=>{for(const[i,o]of n)e(i,o)})}isEmpty(){return Ea(this.inner)}size(){return this.innerSize}}/**
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
 */const zh=new we(k.comparator);function ns(){return zh}const Va=new we(k.comparator);function jn(...s){let e=Va;for(const t of s)e=e.insert(t.key,t);return e}function La(s){let e=Va;return s.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function ot(){return nn()}function Oa(){return nn()}function nn(){return new Lt(s=>s.toString(),(s,e)=>s.isEqual(e))}const Gh=new we(k.comparator),qh=new ge(k.comparator);function pe(...s){let e=qh;for(const t of s)e=e.add(t);return e}const Hh=new ge(G);function Kh(){return Hh}/**
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
 */function xi(s,e){if(s.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Xn(e)?"-0":e}}function xa(s){return{integerValue:""+s}}function Wh(s,e){return wh(e)?xa(e):xi(s,e)}/**
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
 */class ds{constructor(){this._=void 0}}function Yh(s,e,t){return s instanceof hn?function(i,o){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return o&&Ri(o)&&(o=wa(o)),o&&(a.fields.__previous_value__=o),{mapValue:a}}(t,e):s instanceof dn?ka(s,e):s instanceof fn?Ma(s,e):function(i,o){const a=Na(i,o),l=Io(a)+Io(i.Pe);return hi(a)&&hi(i.Pe)?xa(l):xi(i.serializer,l)}(s,e)}function Qh(s,e,t){return s instanceof dn?ka(s,e):s instanceof fn?Ma(s,e):t}function Na(s,e){return s instanceof ss?function(n){return hi(n)||function(o){return!!o&&"doubleValue"in o}(n)}(e)?e:{integerValue:0}:null}class hn extends ds{}class dn extends ds{constructor(e){super(),this.elements=e}}function ka(s,e){const t=Fa(e);for(const n of s.elements)t.some(i=>Le(i,n))||t.push(n);return{arrayValue:{values:t}}}class fn extends ds{constructor(e){super(),this.elements=e}}function Ma(s,e){let t=Fa(e);for(const n of s.elements)t=t.filter(i=>!Le(i,n));return{arrayValue:{values:t}}}class ss extends ds{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Io(s){return oe(s.integerValue||s.doubleValue)}function Fa(s){return Di(s)&&s.arrayValue.values?s.arrayValue.values.slice():[]}/**
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
 */class Xh{constructor(e,t){this.field=e,this.transform=t}}function Jh(s,e){return s.field.isEqual(e.field)&&function(n,i){return n instanceof dn&&i instanceof dn||n instanceof fn&&i instanceof fn?St(n.elements,i.elements,Le):n instanceof ss&&i instanceof ss?Le(n.Pe,i.Pe):n instanceof hn&&i instanceof hn}(s.transform,e.transform)}class Zh{constructor(e,t){this.version=e,this.transformResults=t}}class ke{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new ke}static exists(e){return new ke(void 0,e)}static updateTime(e){return new ke(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Hn(s,e){return s.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(s.updateTime):s.exists===void 0||s.exists===e.isFoundDocument()}class fs{}function $a(s,e){if(!s.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return s.isNoDocument()?new Ua(s.key,ke.none()):new yn(s.key,s.data,ke.none());{const t=s.data,n=Ce.empty();let i=new ge(ae.comparator);for(let o of e.fields)if(!i.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?n.delete(o):n.set(o,a),i=i.add(o)}return new yt(s.key,n,new Pe(i.toArray()),ke.none())}}function ed(s,e,t){s instanceof yn?function(i,o,a){const l=i.value.clone(),h=Ao(i.fieldTransforms,o,a.transformResults);l.setAll(h),o.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(s,e,t):s instanceof yt?function(i,o,a){if(!Hn(i.precondition,o))return void o.convertToUnknownDocument(a.version);const l=Ao(i.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Ba(i)),h.setAll(l),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()}(s,e,t):function(i,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function sn(s,e,t,n){return s instanceof yn?function(o,a,l,h){if(!Hn(o.precondition,a))return l;const d=o.value.clone(),m=So(o.fieldTransforms,h,a);return d.setAll(m),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(s,e,t,n):s instanceof yt?function(o,a,l,h){if(!Hn(o.precondition,a))return l;const d=So(o.fieldTransforms,h,a),m=a.data;return m.setAll(Ba(o)),m.setAll(d),a.convertToFoundDocument(a.version,m).setHasLocalMutations(),l===null?null:l.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(g=>g.field))}(s,e,t,n):function(o,a,l){return Hn(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(s,e,t)}function td(s,e){let t=null;for(const n of s.fieldTransforms){const i=e.data.field(n.field),o=Na(n.transform,i||null);o!=null&&(t===null&&(t=Ce.empty()),t.set(n.field,o))}return t||null}function bo(s,e){return s.type===e.type&&!!s.key.isEqual(e.key)&&!!s.precondition.isEqual(e.precondition)&&!!function(n,i){return n===void 0&&i===void 0||!(!n||!i)&&St(n,i,(o,a)=>Jh(o,a))}(s.fieldTransforms,e.fieldTransforms)&&(s.type===0?s.value.isEqual(e.value):s.type!==1||s.data.isEqual(e.data)&&s.fieldMask.isEqual(e.fieldMask))}class yn extends fs{constructor(e,t,n,i=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class yt extends fs{constructor(e,t,n,i,o=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=i,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Ba(s){const e=new Map;return s.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const n=s.data.field(t);e.set(t,n)}}),e}function Ao(s,e,t){const n=new Map;X(s.length===t.length);for(let i=0;i<t.length;i++){const o=s[i],a=o.transform,l=e.data.field(o.field);n.set(o.field,Qh(a,l,t[i]))}return n}function So(s,e,t){const n=new Map;for(const i of s){const o=i.transform,a=t.data.field(i.field);n.set(i.field,Yh(o,a,e))}return n}class Ua extends fs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class nd extends fs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class sd{constructor(e,t,n,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=i}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const o=this.mutations[i];o.key.isEqual(e.key)&&ed(o,e,n[i])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=sn(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=sn(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Oa();return this.mutations.forEach(i=>{const o=e.get(i.key),a=o.overlayedDocument;let l=this.applyToLocalView(a,o.mutatedFields);l=t.has(i.key)?null:l;const h=$a(a,l);h!==null&&n.set(i.key,h),a.isValidDocument()||a.convertToNoDocument(K.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),pe())}isEqual(e){return this.batchId===e.batchId&&St(this.mutations,e.mutations,(t,n)=>bo(t,n))&&St(this.baseMutations,e.baseMutations,(t,n)=>bo(t,n))}}class Ni{constructor(e,t,n,i){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=i}static from(e,t,n){X(e.mutations.length===n.length);let i=function(){return Gh}();const o=e.mutations;for(let a=0;a<o.length;a++)i=i.insert(o[a].key,n[a].version);return new Ni(e,t,n,i)}}/**
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
 */class id{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */var Z,$;function rd(s){switch(s){default:return M();case R.CANCELLED:case R.UNKNOWN:case R.DEADLINE_EXCEEDED:case R.RESOURCE_EXHAUSTED:case R.INTERNAL:case R.UNAVAILABLE:case R.UNAUTHENTICATED:return!1;case R.INVALID_ARGUMENT:case R.NOT_FOUND:case R.ALREADY_EXISTS:case R.PERMISSION_DENIED:case R.FAILED_PRECONDITION:case R.ABORTED:case R.OUT_OF_RANGE:case R.UNIMPLEMENTED:case R.DATA_LOSS:return!0}}function od(s){if(s===void 0)return ft("GRPC error has no .code"),R.UNKNOWN;switch(s){case Z.OK:return R.OK;case Z.CANCELLED:return R.CANCELLED;case Z.UNKNOWN:return R.UNKNOWN;case Z.DEADLINE_EXCEEDED:return R.DEADLINE_EXCEEDED;case Z.RESOURCE_EXHAUSTED:return R.RESOURCE_EXHAUSTED;case Z.INTERNAL:return R.INTERNAL;case Z.UNAVAILABLE:return R.UNAVAILABLE;case Z.UNAUTHENTICATED:return R.UNAUTHENTICATED;case Z.INVALID_ARGUMENT:return R.INVALID_ARGUMENT;case Z.NOT_FOUND:return R.NOT_FOUND;case Z.ALREADY_EXISTS:return R.ALREADY_EXISTS;case Z.PERMISSION_DENIED:return R.PERMISSION_DENIED;case Z.FAILED_PRECONDITION:return R.FAILED_PRECONDITION;case Z.ABORTED:return R.ABORTED;case Z.OUT_OF_RANGE:return R.OUT_OF_RANGE;case Z.UNIMPLEMENTED:return R.UNIMPLEMENTED;case Z.DATA_LOSS:return R.DATA_LOSS;default:return M()}}($=Z||(Z={}))[$.OK=0]="OK",$[$.CANCELLED=1]="CANCELLED",$[$.UNKNOWN=2]="UNKNOWN",$[$.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",$[$.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",$[$.NOT_FOUND=5]="NOT_FOUND",$[$.ALREADY_EXISTS=6]="ALREADY_EXISTS",$[$.PERMISSION_DENIED=7]="PERMISSION_DENIED",$[$.UNAUTHENTICATED=16]="UNAUTHENTICATED",$[$.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",$[$.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",$[$.ABORTED=10]="ABORTED",$[$.OUT_OF_RANGE=11]="OUT_OF_RANGE",$[$.UNIMPLEMENTED=12]="UNIMPLEMENTED",$[$.INTERNAL=13]="INTERNAL",$[$.UNAVAILABLE=14]="UNAVAILABLE",$[$.DATA_LOSS=15]="DATA_LOSS";/**
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
 */new ua([4294967295,4294967295],0);class ad{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function mi(s,e){return s.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ld(s,e){return s.useProto3Json?e.toBase64():e.toUint8Array()}function cd(s,e){return mi(s,e.toTimestamp())}function At(s){return X(!!s),K.fromTimestamp(function(t){const n=mt(t);return new se(n.seconds,n.nanos)}(s))}function ja(s,e){return pi(s,e).canonicalString()}function pi(s,e){const t=function(i){return new Y(["projects",i.projectId,"databases",i.database])}(s).child("documents");return e===void 0?t:t.child(e)}function ud(s){const e=Y.fromString(s);return X(vd(e)),e}function gi(s,e){return ja(s.databaseId,e.path)}function hd(s){const e=ud(s);return e.length===4?Y.emptyPath():fd(e)}function dd(s){return new Y(["projects",s.databaseId.projectId,"databases",s.databaseId.database]).canonicalString()}function fd(s){return X(s.length>4&&s.get(4)==="documents"),s.popFirst(5)}function Co(s,e,t){return{name:gi(s,e),fields:t.value.mapValue.fields}}function md(s,e){let t;if(e instanceof yn)t={update:Co(s,e.key,e.value)};else if(e instanceof Ua)t={delete:gi(s,e.key)};else if(e instanceof yt)t={update:Co(s,e.key,e.data),updateMask:yd(e.fieldMask)};else{if(!(e instanceof nd))return M();t={verify:gi(s,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(n=>function(o,a){const l=a.transform;if(l instanceof hn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof dn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof fn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof ss)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw M()}(0,n))),e.precondition.isNone||(t.currentDocument=function(i,o){return o.updateTime!==void 0?{updateTime:cd(i,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:M()}(s,e.precondition)),t}function pd(s,e){return s&&s.length>0?(X(e!==void 0),s.map(t=>function(i,o){let a=i.updateTime?At(i.updateTime):At(o);return a.isEqual(K.min())&&(a=At(o)),new Zh(a,i.transformResults||[])}(t,e))):[]}function gd(s){let e=hd(s.parent);const t=s.structuredQuery,n=t.from?t.from.length:0;let i=null;if(n>0){X(n===1);const m=t.from[0];m.allDescendants?i=m.collectionId:e=e.child(m.collectionId)}let o=[];t.where&&(o=function(g){const b=za(g);return b instanceof Xe&&Aa(b)?b.getFilters():[b]}(t.where));let a=[];t.orderBy&&(a=function(g){return g.map(b=>function(C){return new ts(Tt(C.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(b))}(t.orderBy));let l=null;t.limit&&(l=function(g){let b;return b=typeof g=="object"?g.value:g,Pi(b)?null:b}(t.limit));let h=null;t.startAt&&(h=function(g){const b=!!g.before,S=g.values||[];return new es(S,b)}(t.startAt));let d=null;return t.endAt&&(d=function(g){const b=!g.before,S=g.values||[];return new es(S,b)}(t.endAt)),Mh(e,i,a,o,l,"F",h,d)}function za(s){return s.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=Tt(t.unaryFilter.field);return ne.create(n,"==",{doubleValue:NaN});case"IS_NULL":const i=Tt(t.unaryFilter.field);return ne.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=Tt(t.unaryFilter.field);return ne.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Tt(t.unaryFilter.field);return ne.create(a,"!=",{nullValue:"NULL_VALUE"});default:return M()}}(s):s.fieldFilter!==void 0?function(t){return ne.create(Tt(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return M()}}(t.fieldFilter.op),t.fieldFilter.value)}(s):s.compositeFilter!==void 0?function(t){return Xe.create(t.compositeFilter.filters.map(n=>za(n)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return M()}}(t.compositeFilter.op))}(s):M()}function Tt(s){return ae.fromServerFormat(s.fieldPath)}function yd(s){const e=[];return s.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function vd(s){return s.length>=4&&s.get(0)==="projects"&&s.get(2)==="databases"}/**
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
 */class _d{constructor(e){this.ct=e}}function Ed(s){const e=gd({parent:s.parent,structuredQuery:s.structuredQuery});return s.limitType==="LAST"?fi(e,e.limit,"L"):e}/**
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
 */class wd{constructor(){this.un=new Td}addToCollectionParentIndex(e,t){return this.un.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(Qe.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(Qe.min())}updateCollectionGroup(e,t,n){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class Td{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t]||new ge(Y.comparator),o=!i.has(n);return this.index[t]=i.add(n),o}has(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t];return i&&i.has(n)}getEntries(e){return(this.index[e]||new ge(Y.comparator)).toArray()}}/**
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
 */class Dt{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Dt(0)}static kn(){return new Dt(-1)}}/**
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
 */class Id{constructor(){this.changes=new Lt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Se.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?P.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class bd{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Ad{constructor(e,t,n,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=i}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(n=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(n!==null&&sn(n.mutation,i,Pe.empty(),se.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.getLocalViewOfDocuments(e,n,pe()).next(()=>n))}getLocalViewOfDocuments(e,t,n=pe()){const i=ot();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,n).next(o=>{let a=jn();return o.forEach((l,h)=>{a=a.insert(l,h.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const n=ot();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,pe()))}populateOverlays(e,t,n){const i=[];return n.forEach(o=>{t.has(o)||i.push(o)}),this.documentOverlayCache.getOverlays(e,i).next(o=>{o.forEach((a,l)=>{t.set(a,l)})})}computeViews(e,t,n,i){let o=ns();const a=nn(),l=function(){return nn()}();return t.forEach((h,d)=>{const m=n.get(d.key);i.has(d.key)&&(m===void 0||m.mutation instanceof yt)?o=o.insert(d.key,d):m!==void 0?(a.set(d.key,m.mutation.getFieldMask()),sn(m.mutation,d,m.mutation.getFieldMask(),se.now())):a.set(d.key,Pe.empty())}),this.recalculateAndSaveOverlays(e,o).next(h=>(h.forEach((d,m)=>a.set(d,m)),t.forEach((d,m)=>{var g;return l.set(d,new bd(m,(g=a.get(d))!==null&&g!==void 0?g:null))}),l))}recalculateAndSaveOverlays(e,t){const n=nn();let i=new we((a,l)=>a-l),o=pe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const l of a)l.keys().forEach(h=>{const d=t.get(h);if(d===null)return;let m=n.get(h)||Pe.empty();m=l.applyToLocalView(d,m),n.set(h,m);const g=(i.get(l.batchId)||pe()).add(h);i=i.insert(l.batchId,g)})}).next(()=>{const a=[],l=i.getReverseIterator();for(;l.hasNext();){const h=l.getNext(),d=h.key,m=h.value,g=Oa();m.forEach(b=>{if(!o.has(b)){const S=$a(t.get(b),n.get(b));S!==null&&g.set(b,S),o=o.add(b)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,g))}return P.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,t,n,i){return function(a){return k.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):$h(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,i):this.getDocumentsMatchingCollectionQuery(e,t,n,i)}getNextDocuments(e,t,n,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,i).next(o=>{const a=i-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,i-o.size):P.resolve(ot());let l=-1,h=o;return a.next(d=>P.forEach(d,(m,g)=>(l<g.largestBatchId&&(l=g.largestBatchId),o.get(m)?P.resolve():this.remoteDocumentCache.getEntry(e,m).next(b=>{h=h.insert(m,b)}))).next(()=>this.populateOverlays(e,d,o)).next(()=>this.computeViews(e,h,d,pe())).next(m=>({batchId:l,changes:La(m)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new k(t)).next(n=>{let i=jn();return n.isFoundDocument()&&(i=i.insert(n.key,n)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,n,i){const o=t.collectionGroup;let a=jn();return this.indexManager.getCollectionParents(e,o).next(l=>P.forEach(l,h=>{const d=function(g,b){return new hs(b,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)}(t,h.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,n,i).next(m=>{m.forEach((g,b)=>{a=a.insert(g,b)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,n,i){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,o,i))).next(a=>{o.forEach((h,d)=>{const m=d.getKey();a.get(m)===null&&(a=a.insert(m,Se.newInvalidDocument(m)))});let l=jn();return a.forEach((h,d)=>{const m=o.get(h);m!==void 0&&sn(m.mutation,d,Pe.empty(),se.now()),Oi(t,d)&&(l=l.insert(h,d))}),l})}}/**
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
 */class Sd{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return P.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:At(i.createTime)}}(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(i){return{name:i.name,query:Ed(i.bundledQuery),readTime:At(i.readTime)}}(t)),P.resolve()}}/**
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
 */class Cd{constructor(){this.overlays=new we(k.comparator),this.Ir=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const n=ot();return P.forEach(t,i=>this.getOverlay(e,i).next(o=>{o!==null&&n.set(i,o)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((i,o)=>{this.ht(e,t,o)}),P.resolve()}removeOverlaysForBatchId(e,t,n){const i=this.Ir.get(n);return i!==void 0&&(i.forEach(o=>this.overlays=this.overlays.remove(o)),this.Ir.delete(n)),P.resolve()}getOverlaysForCollection(e,t,n){const i=ot(),o=t.length+1,a=new k(t.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const h=l.getNext().value,d=h.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>n&&i.set(h.getKey(),h)}return P.resolve(i)}getOverlaysForCollectionGroup(e,t,n,i){let o=new we((d,m)=>d-m);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>n){let m=o.get(d.largestBatchId);m===null&&(m=ot(),o=o.insert(d.largestBatchId,m)),m.set(d.getKey(),d)}}const l=ot(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach((d,m)=>l.set(d,m)),!(l.size()>=i)););return P.resolve(l)}ht(e,t,n){const i=this.overlays.get(n.key);if(i!==null){const a=this.Ir.get(i.largestBatchId).delete(n.key);this.Ir.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new id(t,n));let o=this.Ir.get(t);o===void 0&&(o=pe(),this.Ir.set(t,o)),this.Ir.set(t,o.add(n.key))}}/**
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
 */class Pd{constructor(){this.sessionToken=Ve.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
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
 */class ki{constructor(){this.Tr=new ge(te.Er),this.dr=new ge(te.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const n=new te(e,t);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(e,t){e.forEach(n=>this.addReference(n,t))}removeReference(e,t){this.Vr(new te(e,t))}mr(e,t){e.forEach(n=>this.removeReference(n,t))}gr(e){const t=new k(new Y([])),n=new te(t,e),i=new te(t,e+1),o=[];return this.dr.forEachInRange([n,i],a=>{this.Vr(a),o.push(a.key)}),o}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new k(new Y([])),n=new te(t,e),i=new te(t,e+1);let o=pe();return this.dr.forEachInRange([n,i],a=>{o=o.add(a.key)}),o}containsKey(e){const t=new te(e,0),n=this.Tr.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class te{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return k.comparator(e.key,t.key)||G(e.wr,t.wr)}static Ar(e,t){return G(e.wr,t.wr)||k.comparator(e.key,t.key)}}/**
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
 */class Rd{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new ge(te.Er)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,i){const o=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new sd(o,t,n,i);this.mutationQueue.push(a);for(const l of i)this.br=this.br.add(new te(l.key,o)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return P.resolve(a)}lookupMutationBatch(e,t){return P.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,i=this.vr(n),o=i<0?0:i;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new te(t,0),i=new te(t,Number.POSITIVE_INFINITY),o=[];return this.br.forEachInRange([n,i],a=>{const l=this.Dr(a.wr);o.push(l)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new ge(G);return t.forEach(i=>{const o=new te(i,0),a=new te(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([o,a],l=>{n=n.add(l.wr)})}),P.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,i=n.length+1;let o=n;k.isDocumentKey(o)||(o=o.child(""));const a=new te(new k(o),0);let l=new ge(G);return this.br.forEachWhile(h=>{const d=h.key.path;return!!n.isPrefixOf(d)&&(d.length===i&&(l=l.add(h.wr)),!0)},a),P.resolve(this.Cr(l))}Cr(e){const t=[];return e.forEach(n=>{const i=this.Dr(n);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){X(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return P.forEach(t.mutations,i=>{const o=new te(i.key,t.batchId);return n=n.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=n})}On(e){}containsKey(e,t){const n=new te(t,0),i=this.br.firstAfterOrEqual(n);return P.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class Dd{constructor(e){this.Mr=e,this.docs=function(){return new we(k.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,i=this.docs.get(n),o=i?i.size:0,a=this.Mr(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return P.resolve(n?n.document.mutableCopy():Se.newInvalidDocument(t))}getEntries(e,t){let n=ns();return t.forEach(i=>{const o=this.docs.get(i);n=n.insert(i,o?o.document.mutableCopy():Se.newInvalidDocument(i))}),P.resolve(n)}getDocumentsMatchingQuery(e,t,n,i){let o=ns();const a=t.path,l=new k(a.child("")),h=this.docs.getIteratorFrom(l);for(;h.hasNext();){const{key:d,value:{document:m}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||yh(gh(m),n)<=0||(i.has(m.key)||Oi(t,m))&&(o=o.insert(m.key,m.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(e,t,n,i){M()}Or(e,t){return P.forEach(this.docs,n=>t(n))}newChangeBuffer(e){return new Vd(this)}getSize(e){return P.resolve(this.size)}}class Vd extends Id{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((n,i)=>{i.isValidDocument()?t.push(this.cr.addEntry(e,i)):this.cr.removeEntry(n)}),P.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class Ld{constructor(e){this.persistence=e,this.Nr=new Lt(t=>Vi(t),Li),this.lastRemoteSnapshotVersion=K.min(),this.highestTargetId=0,this.Lr=0,this.Br=new ki,this.targetCount=0,this.kr=Dt.Bn()}forEachTarget(e,t){return this.Nr.forEach((n,i)=>t(i)),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.Lr&&(this.Lr=t),P.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new Dt(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.Kn(t),P.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,n){let i=0;const o=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=t&&n.get(l.targetId)===null&&(this.Nr.delete(a),o.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),P.waitFor(o).next(()=>i)}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const n=this.Nr.get(t)||null;return P.resolve(n)}addMatchingKeys(e,t,n){return this.Br.Rr(t,n),P.resolve()}removeMatchingKeys(e,t,n){this.Br.mr(t,n);const i=this.persistence.referenceDelegate,o=[];return i&&t.forEach(a=>{o.push(i.markPotentiallyOrphaned(e,a))}),P.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),P.resolve()}getMatchingKeysForTargetId(e,t){const n=this.Br.yr(t);return P.resolve(n)}containsKey(e,t){return P.resolve(this.Br.containsKey(t))}}/**
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
 */class Od{constructor(e,t){this.qr={},this.overlays={},this.Qr=new _a(0),this.Kr=!1,this.Kr=!0,this.$r=new Pd,this.referenceDelegate=e(this),this.Ur=new Ld(this),this.indexManager=new wd,this.remoteDocumentCache=function(i){return new Dd(i)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new _d(t),this.Gr=new Sd(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Cd,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.qr[e.toKey()];return n||(n=new Rd(t,this.referenceDelegate),this.qr[e.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,n){x("MemoryPersistence","Starting transaction:",e);const i=new xd(this.Qr.next());return this.referenceDelegate.zr(),n(i).next(o=>this.referenceDelegate.jr(i).next(()=>o)).toPromise().then(o=>(i.raiseOnCommittedEvent(),o))}Hr(e,t){return P.or(Object.values(this.qr).map(n=>()=>n.containsKey(e,t)))}}class xd extends _h{constructor(e){super(),this.currentSequenceNumber=e}}class Mi{constructor(e){this.persistence=e,this.Jr=new ki,this.Yr=null}static Zr(e){return new Mi(e)}get Xr(){if(this.Yr)return this.Yr;throw M()}addReference(e,t,n){return this.Jr.addReference(n,t),this.Xr.delete(n.toString()),P.resolve()}removeReference(e,t,n){return this.Jr.removeReference(n,t),this.Xr.add(n.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),P.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(i=>this.Xr.add(i.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(o=>this.Xr.add(o.toString()))}).next(()=>n.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.Xr,n=>{const i=k.fromPath(n);return this.ei(e,i).next(o=>{o||t.removeEntry(i,K.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(n=>{n?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return P.or([()=>P.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class Fi{constructor(e,t,n,i){this.targetId=e,this.fromCache=t,this.$i=n,this.Ui=i}static Wi(e,t){let n=pe(),i=pe();for(const o of t.docChanges)switch(o.type){case 0:n=n.add(o.doc.key);break;case 1:i=i.add(o.doc.key)}return new Fi(e,t.fromCache,n,i)}}/**
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
 */class Nd{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class kd{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return qc()?8:Eh(zc())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,n,i){const o={result:null};return this.Yi(e,t).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.Zi(e,t,i,n).next(a=>{o.result=a})}).next(()=>{if(o.result)return;const a=new Nd;return this.Xi(e,t,a).next(l=>{if(o.result=l,this.zi)return this.es(e,t,a,l.size)})}).next(()=>o.result)}es(e,t,n,i){return n.documentReadCount<this.ji?(Qt()<=B.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",Xt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),P.resolve()):(Qt()<=B.DEBUG&&x("QueryEngine","Query:",Xt(t),"scans",n.documentReadCount,"local documents and returns",i,"documents as results."),n.documentReadCount>this.Hi*i?(Qt()<=B.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",Xt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ut(t))):P.resolve())}Yi(e,t){if(To(t))return P.resolve(null);let n=ut(t);return this.indexManager.getIndexType(e,n).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=fi(t,null,"F"),n=ut(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(o=>{const a=pe(...o);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,n).next(h=>{const d=this.ts(t,l);return this.ns(t,d,a,h.readTime)?this.Yi(e,fi(t,null,"F")):this.rs(e,d,t,h)}))})))}Zi(e,t,n,i){return To(t)||i.isEqual(K.min())?P.resolve(null):this.Ji.getDocuments(e,n).next(o=>{const a=this.ts(t,o);return this.ns(t,a,n,i)?P.resolve(null):(Qt()<=B.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Xt(t)),this.rs(e,a,t,ph(i,-1)).next(l=>l))})}ts(e,t){let n=new ge(Uh(e));return t.forEach((i,o)=>{Oi(e,o)&&(n=n.add(o))}),n}ns(e,t,n,i){if(e.limit===null)return!1;if(n.size!==t.size)return!0;const o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(i)>0)}Xi(e,t,n){return Qt()<=B.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",Xt(t)),this.Ji.getDocumentsMatchingQuery(e,t,Qe.min(),n)}rs(e,t,n,i){return this.Ji.getDocumentsMatchingQuery(e,n,i).next(o=>(t.forEach(a=>{o=o.insert(a.key,a)}),o))}}/**
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
 */class Md{constructor(e,t,n,i){this.persistence=e,this.ss=t,this.serializer=i,this.os=new we(G),this._s=new Lt(o=>Vi(o),Li),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(n)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Ad(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function Fd(s,e,t,n){return new Md(s,e,t,n)}async function Ga(s,e){const t=q(s);return await t.persistence.runTransaction("Handle user change","readonly",n=>{let i;return t.mutationQueue.getAllMutationBatches(n).next(o=>(i=o,t.ls(e),t.mutationQueue.getAllMutationBatches(n))).next(o=>{const a=[],l=[];let h=pe();for(const d of i){a.push(d.batchId);for(const m of d.mutations)h=h.add(m.key)}for(const d of o){l.push(d.batchId);for(const m of d.mutations)h=h.add(m.key)}return t.localDocuments.getDocuments(n,h).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:l}))})})}function $d(s,e){const t=q(s);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const i=e.batch.keys(),o=t.cs.newChangeBuffer({trackRemovals:!0});return function(l,h,d,m){const g=d.batch,b=g.keys();let S=P.resolve();return b.forEach(C=>{S=S.next(()=>m.getEntry(h,C)).next(L=>{const D=d.docVersions.get(C);X(D!==null),L.version.compareTo(D)<0&&(g.applyToRemoteDocument(L,d),L.isValidDocument()&&(L.setReadTime(d.commitVersion),m.addEntry(L)))})}),S.next(()=>l.mutationQueue.removeMutationBatch(h,g))}(t,n,e,o).next(()=>o.apply(n)).next(()=>t.mutationQueue.performConsistencyCheck(n)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(n,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(l){let h=pe();for(let d=0;d<l.mutationResults.length;++d)l.mutationResults[d].transformResults.length>0&&(h=h.add(l.batch.mutations[d].key));return h}(e))).next(()=>t.localDocuments.getDocuments(n,i))})}function Bd(s){const e=q(s);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function Ud(s,e){const t=q(s);return t.persistence.runTransaction("Get next mutation batch","readonly",n=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e)))}class Po{constructor(){this.activeTargetIds=Kh()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class jd{constructor(){this.so=new Po,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,n){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Po,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class zd{_o(e){}shutdown(){}}/**
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
 */class Ro{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){x("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){x("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let zn=null;function Ys(){return zn===null?zn=function(){return 268435456+Math.round(2147483648*Math.random())}():zn++,"0x"+zn.toString(16)}/**
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
 */const Gd={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class qd{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const fe="WebChannelConnection";class Hd extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const n=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+t.host,this.vo=`projects/${i}/databases/${o}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${o}`}get Fo(){return!1}Mo(t,n,i,o,a){const l=Ys(),h=this.xo(t,n.toUriEncodedString());x("RestConnection",`Sending RPC '${t}' ${l}:`,h,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,o,a),this.No(t,h,d,i).then(m=>(x("RestConnection",`Received RPC '${t}' ${l}: `,m),m),m=>{throw Qn("RestConnection",`RPC '${t}' ${l} failed with error: `,m,"url: ",h,"request:",i),m})}Lo(t,n,i,o,a,l){return this.Mo(t,n,i,o,a)}Oo(t,n,i){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Vt}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((o,a)=>t[a]=o),i&&i.headers.forEach((o,a)=>t[a]=o)}xo(t,n){const i=Gd[t];return`${this.Do}/v1/${n}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,n,i){const o=Ys();return new Promise((a,l)=>{const h=new ha;h.setWithCredentials(!0),h.listenOnce(da.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Gn.NO_ERROR:const m=h.getResponseJson();x(fe,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),a(m);break;case Gn.TIMEOUT:x(fe,`RPC '${e}' ${o} timed out`),l(new N(R.DEADLINE_EXCEEDED,"Request time out"));break;case Gn.HTTP_ERROR:const g=h.getStatus();if(x(fe,`RPC '${e}' ${o} failed with status:`,g,"response text:",h.getResponseText()),g>0){let b=h.getResponseJson();Array.isArray(b)&&(b=b[0]);const S=b==null?void 0:b.error;if(S&&S.status&&S.message){const C=function(D){const F=D.toLowerCase().replace(/_/g,"-");return Object.values(R).indexOf(F)>=0?F:R.UNKNOWN}(S.status);l(new N(C,S.message))}else l(new N(R.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new N(R.UNAVAILABLE,"Connection failed."));break;default:M()}}finally{x(fe,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(i);x(fe,`RPC '${e}' ${o} sending request:`,i),h.send(t,"POST",d,n,15)})}Bo(e,t,n){const i=Ys(),o=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=pa(),l=ma(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.Oo(h.initMessageHeaders,t,n),h.encodeInitMessageHeaders=!0;const m=o.join("");x(fe,`Creating RPC '${e}' stream ${i}: ${m}`,h);const g=a.createWebChannel(m,h);let b=!1,S=!1;const C=new qd({Io:D=>{S?x(fe,`Not sending because RPC '${e}' stream ${i} is closed:`,D):(b||(x(fe,`Opening RPC '${e}' stream ${i} transport.`),g.open(),b=!0),x(fe,`RPC '${e}' stream ${i} sending:`,D),g.send(D))},To:()=>g.close()}),L=(D,F,j)=>{D.listen(F,Q=>{try{j(Q)}catch(le){setTimeout(()=>{throw le},0)}})};return L(g,Jt.EventType.OPEN,()=>{S||(x(fe,`RPC '${e}' stream ${i} transport opened.`),C.yo())}),L(g,Jt.EventType.CLOSE,()=>{S||(S=!0,x(fe,`RPC '${e}' stream ${i} transport closed`),C.So())}),L(g,Jt.EventType.ERROR,D=>{S||(S=!0,Qn(fe,`RPC '${e}' stream ${i} transport errored:`,D),C.So(new N(R.UNAVAILABLE,"The operation could not be completed")))}),L(g,Jt.EventType.MESSAGE,D=>{var F;if(!S){const j=D.data[0];X(!!j);const Q=j,le=Q.error||((F=Q[0])===null||F===void 0?void 0:F.error);if(le){x(fe,`RPC '${e}' stream ${i} received error:`,le);const et=le.status;let _e=function(v){const _=Z[v];if(_!==void 0)return od(_)}(et),w=le.message;_e===void 0&&(_e=R.INTERNAL,w="Unknown error status: "+et+" with message "+le.message),S=!0,C.So(new N(_e,w)),g.close()}else x(fe,`RPC '${e}' stream ${i} received:`,j),C.bo(j)}}),L(l,fa.STAT_EVENT,D=>{D.stat===ci.PROXY?x(fe,`RPC '${e}' stream ${i} detected buffering proxy`):D.stat===ci.NOPROXY&&x(fe,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{C.wo()},0),C}}function Qs(){return typeof document<"u"?document:null}/**
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
 */function ms(s){return new ad(s,!0)}/**
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
 */class qa{constructor(e,t,n=1e3,i=1.5,o=6e4){this.ui=e,this.timerId=t,this.ko=n,this.qo=i,this.Qo=o,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),i=Math.max(0,t-n);i>0&&x("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class Kd{constructor(e,t,n,i,o,a,l,h){this.ui=e,this.Ho=n,this.Jo=i,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=h,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new qa(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===R.RESOURCE_EXHAUSTED?(ft(t.toString()),ft("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===R.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,i])=>{this.Yo===t&&this.P_(n,i)},n=>{e(()=>{const i=new N(R.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(i)})})}P_(e,t){const n=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{n(()=>this.I_(i))}),this.stream.onMessage(i=>{n(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return x("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(x("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Wd extends Kd{constructor(e,t,n,i,o,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,i,a),this.serializer=o}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return X(!!e.streamToken),this.lastStreamToken=e.streamToken,X(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){X(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=pd(e.writeResults,e.commitTime),n=At(e.commitTime);return this.listener.g_(n,t)}p_(){const e={};e.database=dd(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(n=>md(this.serializer,n))};this.a_(t)}}/**
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
 */class Yd extends class{}{constructor(e,t,n,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new N(R.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,n,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Mo(e,pi(t,n),i,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===R.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(R.UNKNOWN,o.toString())})}Lo(e,t,n,i,o){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,pi(t,n),i,a,l,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===R.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new N(R.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class Qd{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(ft(t),this.D_=!1):x("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class Xd{constructor(e,t,n,i,o){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=o,this.k_._o(a=>{n.enqueueAndForget(async()=>{_n(this)&&(x("RemoteStore","Restarting streams for network reachability change."),await async function(h){const d=q(h);d.L_.add(4),await vn(d),d.q_.set("Unknown"),d.L_.delete(4),await ps(d)}(this))})}),this.q_=new Qd(n,i)}}async function ps(s){if(_n(s))for(const e of s.B_)await e(!0)}async function vn(s){for(const e of s.B_)await e(!1)}function _n(s){return q(s).L_.size===0}async function Ha(s,e,t){if(!us(e))throw e;s.L_.add(1),await vn(s),s.q_.set("Offline"),t||(t=()=>Bd(s.localStore)),s.asyncQueue.enqueueRetryable(async()=>{x("RemoteStore","Retrying IndexedDB access"),await t(),s.L_.delete(1),await ps(s)})}function Ka(s,e){return e().catch(t=>Ha(s,t,e))}async function gs(s){const e=q(s),t=Je(e);let n=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;Jd(e);)try{const i=await Ud(e.localStore,n);if(i===null){e.O_.length===0&&t.o_();break}n=i.batchId,Zd(e,i)}catch(i){await Ha(e,i)}Wa(e)&&Ya(e)}function Jd(s){return _n(s)&&s.O_.length<10}function Zd(s,e){s.O_.push(e);const t=Je(s);t.r_()&&t.V_&&t.m_(e.mutations)}function Wa(s){return _n(s)&&!Je(s).n_()&&s.O_.length>0}function Ya(s){Je(s).start()}async function ef(s){Je(s).p_()}async function tf(s){const e=Je(s);for(const t of s.O_)e.m_(t.mutations)}async function nf(s,e,t){const n=s.O_.shift(),i=Ni.from(n,e,t);await Ka(s,()=>s.remoteSyncer.applySuccessfulWrite(i)),await gs(s)}async function sf(s,e){e&&Je(s).V_&&await async function(n,i){if(function(a){return rd(a)&&a!==R.ABORTED}(i.code)){const o=n.O_.shift();Je(n).s_(),await Ka(n,()=>n.remoteSyncer.rejectFailedWrite(o.batchId,i)),await gs(n)}}(s,e),Wa(s)&&Ya(s)}async function Do(s,e){const t=q(s);t.asyncQueue.verifyOperationInProgress(),x("RemoteStore","RemoteStore received new credentials");const n=_n(t);t.L_.add(3),await vn(t),n&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await ps(t)}async function rf(s,e){const t=q(s);e?(t.L_.delete(2),await ps(t)):e||(t.L_.add(2),await vn(t),t.q_.set("Unknown"))}function Je(s){return s.U_||(s.U_=function(t,n,i){const o=q(t);return o.w_(),new Wd(n,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(s.datastore,s.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ef.bind(null,s),mo:sf.bind(null,s),f_:tf.bind(null,s),g_:nf.bind(null,s)}),s.B_.push(async e=>{e?(s.U_.s_(),await gs(s)):(await s.U_.stop(),s.O_.length>0&&(x("RemoteStore",`Stopping write stream with ${s.O_.length} pending writes`),s.O_=[]))})),s.U_}/**
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
 */class $i{constructor(e,t,n,i,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=i,this.removalCallback=o,this.deferred=new ct,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,i,o){const a=Date.now()+n,l=new $i(e,t,a,i,o);return l.start(n),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(R.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Qa(s,e){if(ft("AsyncQueue",`${e}: ${s}`),us(s))return new N(R.UNAVAILABLE,`${e}: ${s}`);throw s}class of{constructor(){this.queries=Vo(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,n){const i=q(t),o=i.queries;i.queries=Vo(),o.forEach((a,l)=>{for(const h of l.j_)h.onError(n)})})(this,new N(R.ABORTED,"Firestore shutting down"))}}function Vo(){return new Lt(s=>Da(s),Ra)}function af(s){s.Y_.forEach(e=>{e.next()})}var Lo,Oo;(Oo=Lo||(Lo={})).ea="default",Oo.Cache="cache";class lf{constructor(e,t,n,i,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=i,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Lt(l=>Da(l),Ra),this.Ma=new Map,this.xa=new Set,this.Oa=new we(k.comparator),this.Na=new Map,this.La=new ki,this.Ba={},this.ka=new Map,this.qa=Dt.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function cf(s,e,t){const n=ff(s);try{const i=await function(a,l){const h=q(a),d=se.now(),m=l.reduce((S,C)=>S.add(C.key),pe());let g,b;return h.persistence.runTransaction("Locally write mutations","readwrite",S=>{let C=ns(),L=pe();return h.cs.getEntries(S,m).next(D=>{C=D,C.forEach((F,j)=>{j.isValidDocument()||(L=L.add(F))})}).next(()=>h.localDocuments.getOverlayedDocuments(S,C)).next(D=>{g=D;const F=[];for(const j of l){const Q=td(j,g.get(j.key).overlayedDocument);Q!=null&&F.push(new yt(j.key,Q,Ta(Q.value.mapValue),ke.exists(!0)))}return h.mutationQueue.addMutationBatch(S,d,F,l)}).next(D=>{b=D;const F=D.applyToLocalDocumentSet(g,L);return h.documentOverlayCache.saveOverlays(S,D.batchId,F)})}).then(()=>({batchId:b.batchId,changes:La(g)}))}(n.localStore,e);n.sharedClientState.addPendingMutation(i.batchId),function(a,l,h){let d=a.Ba[a.currentUser.toKey()];d||(d=new we(G)),d=d.insert(l,h),a.Ba[a.currentUser.toKey()]=d}(n,i.batchId,t),await ys(n,i.changes),await gs(n.remoteStore)}catch(i){const o=Qa(i,"Failed to persist write");t.reject(o)}}function xo(s,e,t){const n=q(s);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const i=[];n.Fa.forEach((o,a)=>{const l=a.view.Z_(e);l.snapshot&&i.push(l.snapshot)}),function(a,l){const h=q(a);h.onlineState=l;let d=!1;h.queries.forEach((m,g)=>{for(const b of g.j_)b.Z_(l)&&(d=!0)}),d&&af(h)}(n.eventManager,e),i.length&&n.Ca.d_(i),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function uf(s,e){const t=q(s),n=e.batch.batchId;try{const i=await $d(t.localStore,e);Ja(t,n,null),Xa(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await ys(t,i)}catch(i){await va(i)}}async function hf(s,e,t){const n=q(s);try{const i=await function(a,l){const h=q(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let m;return h.mutationQueue.lookupMutationBatch(d,l).next(g=>(X(g!==null),m=g.keys(),h.mutationQueue.removeMutationBatch(d,g))).next(()=>h.mutationQueue.performConsistencyCheck(d)).next(()=>h.documentOverlayCache.removeOverlaysForBatchId(d,m,l)).next(()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,m)).next(()=>h.localDocuments.getDocuments(d,m))})}(n.localStore,e);Ja(n,e,t),Xa(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await ys(n,i)}catch(i){await va(i)}}function Xa(s,e){(s.ka.get(e)||[]).forEach(t=>{t.resolve()}),s.ka.delete(e)}function Ja(s,e,t){const n=q(s);let i=n.Ba[n.currentUser.toKey()];if(i){const o=i.get(e);o&&(t?o.reject(t):o.resolve(),i=i.remove(e)),n.Ba[n.currentUser.toKey()]=i}}async function ys(s,e,t){const n=q(s),i=[],o=[],a=[];n.Fa.isEmpty()||(n.Fa.forEach((l,h)=>{a.push(n.Ka(h,e,t).then(d=>{var m;if((d||t)&&n.isPrimaryClient){const g=d?!d.fromCache:(m=void 0)===null||m===void 0?void 0:m.current;n.sharedClientState.updateQueryState(h.targetId,g?"current":"not-current")}if(d){i.push(d);const g=Fi.Wi(h.targetId,d);o.push(g)}}))}),await Promise.all(a),n.Ca.d_(i),await async function(h,d){const m=q(h);try{await m.persistence.runTransaction("notifyLocalViewChanges","readwrite",g=>P.forEach(d,b=>P.forEach(b.$i,S=>m.persistence.referenceDelegate.addReference(g,b.targetId,S)).next(()=>P.forEach(b.Ui,S=>m.persistence.referenceDelegate.removeReference(g,b.targetId,S)))))}catch(g){if(!us(g))throw g;x("LocalStore","Failed to update sequence numbers: "+g)}for(const g of d){const b=g.targetId;if(!g.fromCache){const S=m.os.get(b),C=S.snapshotVersion,L=S.withLastLimboFreeSnapshotVersion(C);m.os=m.os.insert(b,L)}}}(n.localStore,o))}async function df(s,e){const t=q(s);if(!t.currentUser.isEqual(e)){x("SyncEngine","User change. New user:",e.toKey());const n=await Ga(t.localStore,e);t.currentUser=e,function(o,a){o.ka.forEach(l=>{l.forEach(h=>{h.reject(new N(R.CANCELLED,a))})}),o.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await ys(t,n.hs)}}function ff(s){const e=q(s);return e.remoteStore.remoteSyncer.applySuccessfulWrite=uf.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=hf.bind(null,e),e}class is{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ms(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return Fd(this.persistence,new kd,e.initialUser,this.serializer)}Ga(e){return new Od(Mi.Zr,this.serializer)}Wa(e){return new jd}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}is.provider={build:()=>new is};class yi{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>xo(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=df.bind(null,this.syncEngine),await rf(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new of}()}createDatastore(e){const t=ms(e.databaseInfo.databaseId),n=function(o){return new Hd(o)}(e.databaseInfo);return function(o,a,l,h){return new Yd(o,a,l,h)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(n,i,o,a,l){return new Xd(n,i,o,a,l)}(this.localStore,this.datastore,e.asyncQueue,t=>xo(this.syncEngine,t,0),function(){return Ro.D()?new Ro:new zd}())}createSyncEngine(e,t){return function(i,o,a,l,h,d,m){const g=new lf(i,o,a,l,h,d);return m&&(g.Qa=!0),g}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const o=q(i);x("RemoteStore","RemoteStore shutting down."),o.L_.add(5),await vn(o),o.k_.shutdown(),o.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}yi.provider={build:()=>new yi};/**
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
 */class mf{constructor(e,t,n,i,o){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=i,this.user=me.UNAUTHENTICATED,this.clientId=ya.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(n,async a=>{x("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(x("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new ct;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Qa(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function Xs(s,e){s.asyncQueue.verifyOperationInProgress(),x("FirestoreClient","Initializing OfflineComponentProvider");const t=s.configuration;await e.initialize(t);let n=t.initialUser;s.setCredentialChangeListener(async i=>{n.isEqual(i)||(await Ga(e.localStore,i),n=i)}),e.persistence.setDatabaseDeletedListener(()=>s.terminate()),s._offlineComponents=e}async function No(s,e){s.asyncQueue.verifyOperationInProgress();const t=await pf(s);x("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,s.configuration),s.setCredentialChangeListener(n=>Do(e.remoteStore,n)),s.setAppCheckTokenChangeListener((n,i)=>Do(e.remoteStore,i)),s._onlineComponents=e}async function pf(s){if(!s._offlineComponents)if(s._uninitializedComponentsProvider){x("FirestoreClient","Using user provided OfflineComponentProvider");try{await Xs(s,s._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===R.FAILED_PRECONDITION||i.code===R.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;Qn("Error using user provided cache. Falling back to memory cache: "+t),await Xs(s,new is)}}else x("FirestoreClient","Using default OfflineComponentProvider"),await Xs(s,new is);return s._offlineComponents}async function gf(s){return s._onlineComponents||(s._uninitializedComponentsProvider?(x("FirestoreClient","Using user provided OnlineComponentProvider"),await No(s,s._uninitializedComponentsProvider._online)):(x("FirestoreClient","Using default OnlineComponentProvider"),await No(s,new yi))),s._onlineComponents}function yf(s){return gf(s).then(e=>e.syncEngine)}/**
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
 */function Za(s){const e={};return s.timeoutSeconds!==void 0&&(e.timeoutSeconds=s.timeoutSeconds),e}/**
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
 */const ko=new Map;/**
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
 */function el(s,e,t){if(!t)throw new N(R.INVALID_ARGUMENT,`Function ${s}() cannot be called with an empty ${e}.`)}function vf(s,e,t,n){if(e===!0&&n===!0)throw new N(R.INVALID_ARGUMENT,`${s} and ${t} cannot be used together.`)}function Mo(s){if(!k.isDocumentKey(s))throw new N(R.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${s} has ${s.length}.`)}function Fo(s){if(k.isDocumentKey(s))throw new N(R.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${s} has ${s.length}.`)}function Bi(s){if(s===void 0)return"undefined";if(s===null)return"null";if(typeof s=="string")return s.length>20&&(s=`${s.substring(0,20)}...`),JSON.stringify(s);if(typeof s=="number"||typeof s=="boolean")return""+s;if(typeof s=="object"){if(s instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(s);return e?`a custom ${e} object`:"an object"}}return typeof s=="function"?"a function":M()}function tl(s,e){if("_delegate"in s&&(s=s._delegate),!(s instanceof e)){if(e.name===s.constructor.name)throw new N(R.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Bi(s);throw new N(R.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return s}/**
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
 */class $o{constructor(e){var t,n;if(e.host===void 0){if(e.ssl!==void 0)throw new N(R.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new N(R.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}vf("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Za((n=e.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new N(R.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new N(R.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new N(R.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,i){return n.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class vs{constructor(e,t,n,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new $o({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(R.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new N(R.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new $o(e),e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new oh;switch(n.type){case"firstParty":return new uh(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new N(R.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const n=ko.get(t);n&&(x("ComponentProvider","Removing Datastore"),ko.delete(t),n.terminate())}(this),Promise.resolve()}}function _f(s,e,t,n={}){var i;const o=(s=tl(s,vs))._getSettings(),a=`${e}:${t}`;if(o.host!=="firestore.googleapis.com"&&o.host!==a&&Qn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),s._setSettings(Object.assign(Object.assign({},o),{host:a,ssl:!1})),n.mockUserToken){let l,h;if(typeof n.mockUserToken=="string")l=n.mockUserToken,h=me.MOCK_USER;else{l=jc(n.mockUserToken,(i=s._app)===null||i===void 0?void 0:i.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new N(R.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");h=new me(d)}s._authCredentials=new ah(new ga(l,h))}}/**
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
 */class Ui{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Ui(this.firestore,e,this._query)}}class Me{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ke(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Me(this.firestore,e,this._key)}}class Ke extends Ui{constructor(e,t,n){super(e,t,Fh(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Me(this.firestore,null,new k(e))}withConverter(e){return new Ke(this.firestore,e,this._path)}}function Ef(s,e,...t){if(s=ht(s),el("collection","path",e),s instanceof vs){const n=Y.fromString(e,...t);return Fo(n),new Ke(s,null,n)}{if(!(s instanceof Me||s instanceof Ke))throw new N(R.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child(Y.fromString(e,...t));return Fo(n),new Ke(s.firestore,null,n)}}function wf(s,e,...t){if(s=ht(s),arguments.length===1&&(e=ya.newId()),el("doc","path",e),s instanceof vs){const n=Y.fromString(e,...t);return Mo(n),new Me(s,null,new k(n))}{if(!(s instanceof Me||s instanceof Ke))throw new N(R.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child(Y.fromString(e,...t));return Mo(n),new Me(s.firestore,s instanceof Ke?s.converter:null,new k(n))}}/**
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
 */class Bo{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new qa(this,"async_queue_retry"),this.Vu=()=>{const n=Qs();n&&x("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=e;const t=Qs();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Qs();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new ct;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!us(e))throw e;x("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(n=>{this.Eu=n,this.du=!1;const i=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(n);throw ft("INTERNAL UNHANDLED ERROR: ",i),n}).then(n=>(this.du=!1,n))));return this.mu=t,t}enqueueAfterDelay(e,t,n){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const i=$i.createAndSchedule(this,e,t,n,o=>this.yu(o));return this.Tu.push(i),i}fu(){this.Eu&&M()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,n)=>t.targetTimeMs-n.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class nl extends vs{constructor(e,t,n,i){super(e,t,n,i),this.type="firestore",this._queue=new Bo,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Bo(e),this._firestoreClient=void 0,await e}}}function Tf(s,e){const t=typeof s=="object"?s:aa(),n=typeof s=="string"?s:"(default)",i=pn(t,"firestore").getImmediate({identifier:n});if(!i._initialized){const o=Bc("firestore");o&&_f(i,...o)}return i}function If(s){if(s._terminated)throw new N(R.FAILED_PRECONDITION,"The client has already been terminated.");return s._firestoreClient||bf(s),s._firestoreClient}function bf(s){var e,t,n;const i=s._freezeSettings(),o=function(l,h,d,m){return new bh(l,h,d,m.host,m.ssl,m.experimentalForceLongPolling,m.experimentalAutoDetectLongPolling,Za(m.experimentalLongPollingOptions),m.useFetchStreams)}(s._databaseId,((e=s._app)===null||e===void 0?void 0:e.options.appId)||"",s._persistenceKey,i);s._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((n=i.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(s._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),s._firestoreClient=new mf(s._authCredentials,s._appCheckCredentials,s._queue,o,s._componentsProvider&&function(l){const h=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(h),_online:h}}(s._componentsProvider))}/**
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
 */class mn{constructor(e){this._byteString=e}static fromBase64String(e){try{return new mn(Ve.fromBase64String(e))}catch(t){throw new N(R.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new mn(Ve.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class sl{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new N(R.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ae(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class ji{constructor(e){this._methodName=e}}/**
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
 */class il{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new N(R.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new N(R.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return G(this._lat,e._lat)||G(this._long,e._long)}}/**
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
 */class rl{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,i){if(n.length!==i.length)return!1;for(let o=0;o<n.length;++o)if(n[o]!==i[o])return!1;return!0}(this._values,e._values)}}/**
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
 */const Af=/^__.*__$/;class Sf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new yt(e,this.data,this.fieldMask,t,this.fieldTransforms):new yn(e,this.data,t,this.fieldTransforms)}}function ol(s){switch(s){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M()}}class zi{constructor(e,t,n,i,o,a){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=i,o===void 0&&this.vu(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new zi(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:n,xu:!1});return i.Ou(e),i}Nu(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:n,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return rs(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(ol(this.Cu)&&Af.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Cf{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||ms(e)}Qu(e,t,n,i=!1){return new zi({Cu:e,methodName:t,qu:n,path:ae.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Pf(s){const e=s._freezeSettings(),t=ms(s._databaseId);return new Cf(s._databaseId,!!e.ignoreUndefinedProperties,t)}function Rf(s,e,t,n,i,o={}){const a=s.Qu(o.merge||o.mergeFields?2:0,e,t,i);ul("Data must be an object, but it was:",a,n);const l=ll(n,a);let h,d;if(o.merge)h=new Pe(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){const m=[];for(const g of o.mergeFields){const b=Df(e,g,t);if(!a.contains(b))throw new N(R.INVALID_ARGUMENT,`Field '${b}' is specified in your field mask but missing from your input data.`);Of(m,b)||m.push(b)}h=new Pe(m),d=a.fieldTransforms.filter(g=>h.covers(g.field))}else h=null,d=a.fieldTransforms;return new Sf(new Ce(l),h,d)}class Gi extends ji{_toFieldTransform(e){return new Xh(e.path,new hn)}isEqual(e){return e instanceof Gi}}function al(s,e){if(cl(s=ht(s)))return ul("Unsupported field value:",e,s),ll(s,e);if(s instanceof ji)return function(n,i){if(!ol(i.Cu))throw i.Bu(`${n._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${n._methodName}() is not currently supported inside arrays`);const o=n._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(s,e),null;if(s===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),s instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(n,i){const o=[];let a=0;for(const l of n){let h=al(l,i.Lu(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}}(s,e)}return function(n,i){if((n=ht(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return Wh(i.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const o=se.fromDate(n);return{timestampValue:mi(i.serializer,o)}}if(n instanceof se){const o=new se(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:mi(i.serializer,o)}}if(n instanceof il)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof mn)return{bytesValue:ld(i.serializer,n._byteString)};if(n instanceof Me){const o=i.databaseId,a=n.firestore._databaseId;if(!a.isEqual(o))throw i.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:ja(n.firestore._databaseId||i.databaseId,n._key.path)}}if(n instanceof rl)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(h=>{if(typeof h!="number")throw l.Bu("VectorValues must only contain numeric values.");return xi(l.serializer,h)})}}}}}}(n,i);throw i.Bu(`Unsupported field value: ${Bi(n)}`)}(s,e)}function ll(s,e){const t={};return Ea(s)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):gn(s,(n,i)=>{const o=al(i,e.Mu(n));o!=null&&(t[n]=o)}),{mapValue:{fields:t}}}function cl(s){return!(typeof s!="object"||s===null||s instanceof Array||s instanceof Date||s instanceof se||s instanceof il||s instanceof mn||s instanceof Me||s instanceof ji||s instanceof rl)}function ul(s,e,t){if(!cl(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){const n=Bi(t);throw n==="an object"?e.Bu(s+" a custom object"):e.Bu(s+" "+n)}}function Df(s,e,t){if((e=ht(e))instanceof sl)return e._internalPath;if(typeof e=="string")return Lf(s,e);throw rs("Field path arguments must be of type string or ",s,!1,void 0,t)}const Vf=new RegExp("[~\\*/\\[\\]]");function Lf(s,e,t){if(e.search(Vf)>=0)throw rs(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,s,!1,void 0,t);try{return new sl(...e.split("."))._internalPath}catch{throw rs(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,s,!1,void 0,t)}}function rs(s,e,t,n,i){const o=n&&!n.isEmpty(),a=i!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${n}`),a&&(h+=` in document ${i}`),h+=")"),new N(R.INVALID_ARGUMENT,l+s+h)}function Of(s,e){return s.some(t=>t.isEqual(e))}/**
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
 */function xf(s,e,t){let n;return n=s?s.toFirestore(e):e,n}function Nf(s,e){const t=tl(s.firestore,nl),n=wf(s),i=xf(s.converter,e);return kf(t,[Rf(Pf(s.firestore),"addDoc",n._key,i,s.converter!==null,{}).toMutation(n._key,ke.exists(!1))]).then(()=>n)}function kf(s,e){return function(n,i){const o=new ct;return n.asyncQueue.enqueueAndForget(async()=>cf(await yf(n),i,o)),o.promise}(If(s),e)}function Mf(){return new Gi("serverTimestamp")}(function(e,t=!0){(function(i){Vt=i})(Qu),Ye(new Fe("firestore",(n,{instanceIdentifier:i,options:o})=>{const a=n.getProvider("app").getImmediate(),l=new nl(new lh(n.getProvider("auth-internal")),new dh(n.getProvider("app-check-internal")),function(d,m){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new N(R.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zn(d.options.projectId,m)}(a,i),a);return o=Object.assign({useFetchStreams:t},o),l._setSettings(o),l},"PUBLIC").setMultipleInstances(!0)),De(mo,"4.7.3",e),De(mo,"4.7.3","esm2017")})();var Ff="firebase",$f="10.14.1";/**
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
 */De(Ff,$f,"app");const hl="@firebase/installations",qi="0.6.9";/**
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
 */const dl=1e4,fl=`w:${qi}`,ml="FIS_v2",Bf="https://firebaseinstallations.googleapis.com/v1",Uf=60*60*1e3,jf="installations",zf="Installations";/**
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
 */const Gf={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},pt=new cs(jf,zf,Gf);function pl(s){return s instanceof Ze&&s.code.includes("request-failed")}/**
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
 */function gl({projectId:s}){return`${Bf}/projects/${s}/installations`}function yl(s){return{token:s.token,requestStatus:2,expiresIn:Hf(s.expiresIn),creationTime:Date.now()}}async function vl(s,e){const n=(await e.json()).error;return pt.create("request-failed",{requestName:s,serverCode:n.code,serverMessage:n.message,serverStatus:n.status})}function _l({apiKey:s}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":s})}function qf(s,{refreshToken:e}){const t=_l(s);return t.append("Authorization",Kf(e)),t}async function El(s){const e=await s();return e.status>=500&&e.status<600?s():e}function Hf(s){return Number(s.replace("s","000"))}function Kf(s){return`${ml} ${s}`}/**
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
 */async function Wf({appConfig:s,heartbeatServiceProvider:e},{fid:t}){const n=gl(s),i=_l(s),o=e.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const a={fid:t,authVersion:ml,appId:s.appId,sdkVersion:fl},l={method:"POST",headers:i,body:JSON.stringify(a)},h=await El(()=>fetch(n,l));if(h.ok){const d=await h.json();return{fid:d.fid||t,registrationStatus:2,refreshToken:d.refreshToken,authToken:yl(d.authToken)}}else throw await vl("Create Installation",h)}/**
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
 */function wl(s){return new Promise(e=>{setTimeout(e,s)})}/**
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
 */function Yf(s){return btoa(String.fromCharCode(...s)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const Qf=/^[cdef][\w-]{21}$/,vi="";function Xf(){try{const s=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(s),s[0]=112+s[0]%16;const t=Jf(s);return Qf.test(t)?t:vi}catch{return vi}}function Jf(s){return Yf(s).substr(0,22)}/**
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
 */function _s(s){return`${s.appName}!${s.appId}`}/**
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
 */const Tl=new Map;function Il(s,e){const t=_s(s);bl(t,e),Zf(t,e)}function bl(s,e){const t=Tl.get(s);if(t)for(const n of t)n(e)}function Zf(s,e){const t=em();t&&t.postMessage({key:s,fid:e}),tm()}let at=null;function em(){return!at&&"BroadcastChannel"in self&&(at=new BroadcastChannel("[Firebase] FID Change"),at.onmessage=s=>{bl(s.data.key,s.data.fid)}),at}function tm(){Tl.size===0&&at&&(at.close(),at=null)}/**
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
 */const nm="firebase-installations-database",sm=1,gt="firebase-installations-store";let Js=null;function Hi(){return Js||(Js=ra(nm,sm,{upgrade:(s,e)=>{switch(e){case 0:s.createObjectStore(gt)}}})),Js}async function os(s,e){const t=_s(s),i=(await Hi()).transaction(gt,"readwrite"),o=i.objectStore(gt),a=await o.get(t);return await o.put(e,t),await i.done,(!a||a.fid!==e.fid)&&Il(s,e.fid),e}async function Al(s){const e=_s(s),n=(await Hi()).transaction(gt,"readwrite");await n.objectStore(gt).delete(e),await n.done}async function Es(s,e){const t=_s(s),i=(await Hi()).transaction(gt,"readwrite"),o=i.objectStore(gt),a=await o.get(t),l=e(a);return l===void 0?await o.delete(t):await o.put(l,t),await i.done,l&&(!a||a.fid!==l.fid)&&Il(s,l.fid),l}/**
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
 */async function Ki(s){let e;const t=await Es(s.appConfig,n=>{const i=im(n),o=rm(s,i);return e=o.registrationPromise,o.installationEntry});return t.fid===vi?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function im(s){const e=s||{fid:Xf(),registrationStatus:0};return Sl(e)}function rm(s,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(pt.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},n=om(s,t);return{installationEntry:t,registrationPromise:n}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:am(s)}:{installationEntry:e}}async function om(s,e){try{const t=await Wf(s,e);return os(s.appConfig,t)}catch(t){throw pl(t)&&t.customData.serverCode===409?await Al(s.appConfig):await os(s.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function am(s){let e=await Uo(s.appConfig);for(;e.registrationStatus===1;)await wl(100),e=await Uo(s.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:n}=await Ki(s);return n||t}return e}function Uo(s){return Es(s,e=>{if(!e)throw pt.create("installation-not-found");return Sl(e)})}function Sl(s){return lm(s)?{fid:s.fid,registrationStatus:0}:s}function lm(s){return s.registrationStatus===1&&s.registrationTime+dl<Date.now()}/**
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
 */async function cm({appConfig:s,heartbeatServiceProvider:e},t){const n=um(s,t),i=qf(s,t),o=e.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const a={installation:{sdkVersion:fl,appId:s.appId}},l={method:"POST",headers:i,body:JSON.stringify(a)},h=await El(()=>fetch(n,l));if(h.ok){const d=await h.json();return yl(d)}else throw await vl("Generate Auth Token",h)}function um(s,{fid:e}){return`${gl(s)}/${e}/authTokens:generate`}/**
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
 */async function Wi(s,e=!1){let t;const n=await Es(s.appConfig,o=>{if(!Cl(o))throw pt.create("not-registered");const a=o.authToken;if(!e&&fm(a))return o;if(a.requestStatus===1)return t=hm(s,e),o;{if(!navigator.onLine)throw pt.create("app-offline");const l=pm(o);return t=dm(s,l),l}});return t?await t:n.authToken}async function hm(s,e){let t=await jo(s.appConfig);for(;t.authToken.requestStatus===1;)await wl(100),t=await jo(s.appConfig);const n=t.authToken;return n.requestStatus===0?Wi(s,e):n}function jo(s){return Es(s,e=>{if(!Cl(e))throw pt.create("not-registered");const t=e.authToken;return gm(t)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function dm(s,e){try{const t=await cm(s,e),n=Object.assign(Object.assign({},e),{authToken:t});return await os(s.appConfig,n),t}catch(t){if(pl(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Al(s.appConfig);else{const n=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await os(s.appConfig,n)}throw t}}function Cl(s){return s!==void 0&&s.registrationStatus===2}function fm(s){return s.requestStatus===2&&!mm(s)}function mm(s){const e=Date.now();return e<s.creationTime||s.creationTime+s.expiresIn<e+Uf}function pm(s){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},s),{authToken:e})}function gm(s){return s.requestStatus===1&&s.requestTime+dl<Date.now()}/**
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
 */async function ym(s){const e=s,{installationEntry:t,registrationPromise:n}=await Ki(e);return n?n.catch(console.error):Wi(e).catch(console.error),t.fid}/**
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
 */async function vm(s,e=!1){const t=s;return await _m(t),(await Wi(t,e)).token}async function _m(s){const{registrationPromise:e}=await Ki(s);e&&await e}/**
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
 */function Em(s){if(!s||!s.options)throw Zs("App Configuration");if(!s.name)throw Zs("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!s.options[t])throw Zs(t);return{appName:s.name,projectId:s.options.projectId,apiKey:s.options.apiKey,appId:s.options.appId}}function Zs(s){return pt.create("missing-app-config-values",{valueName:s})}/**
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
 */const Pl="installations",wm="installations-internal",Tm=s=>{const e=s.getProvider("app").getImmediate(),t=Em(e),n=pn(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:n,_delete:()=>Promise.resolve()}},Im=s=>{const e=s.getProvider("app").getImmediate(),t=pn(e,Pl).getImmediate();return{getId:()=>ym(t),getToken:i=>vm(t,i)}};function bm(){Ye(new Fe(Pl,Tm,"PUBLIC")),Ye(new Fe(wm,Im,"PRIVATE"))}bm();De(hl,qi);De(hl,qi,"esm2017");/**
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
 */const as="analytics",Am="firebase_id",Sm="origin",Cm=60*1e3,Pm="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",Yi="https://www.googletagmanager.com/gtag/js";/**
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
 */const Ee=new Ai("@firebase/analytics");/**
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
 */const Rm={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},be=new cs("analytics","Analytics",Rm);/**
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
 */function Dm(s){if(!s.startsWith(Yi)){const e=be.create("invalid-gtag-resource",{gtagURL:s});return Ee.warn(e.message),""}return s}function Rl(s){return Promise.all(s.map(e=>e.catch(t=>t)))}function Vm(s,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(s,e)),t}function Lm(s,e){const t=Vm("firebase-js-sdk-policy",{createScriptURL:Dm}),n=document.createElement("script"),i=`${Yi}?l=${s}&id=${e}`;n.src=t?t==null?void 0:t.createScriptURL(i):i,n.async=!0,document.head.appendChild(n)}function Om(s){let e=[];return Array.isArray(window[s])?e=window[s]:window[s]=e,e}async function xm(s,e,t,n,i,o){const a=n[i];try{if(a)await e[a];else{const h=(await Rl(t)).find(d=>d.measurementId===i);h&&await e[h.appId]}}catch(l){Ee.error(l)}s("config",i,o)}async function Nm(s,e,t,n,i){try{let o=[];if(i&&i.send_to){let a=i.send_to;Array.isArray(a)||(a=[a]);const l=await Rl(t);for(const h of a){const d=l.find(g=>g.measurementId===h),m=d&&e[d.appId];if(m)o.push(m);else{o=[];break}}}o.length===0&&(o=Object.values(e)),await Promise.all(o),s("event",n,i||{})}catch(o){Ee.error(o)}}function km(s,e,t,n){async function i(o,...a){try{if(o==="event"){const[l,h]=a;await Nm(s,e,t,l,h)}else if(o==="config"){const[l,h]=a;await xm(s,e,t,n,l,h)}else if(o==="consent"){const[l,h]=a;s("consent",l,h)}else if(o==="get"){const[l,h,d]=a;s("get",l,h,d)}else if(o==="set"){const[l]=a;s("set",l)}else s(o,...a)}catch(l){Ee.error(l)}}return i}function Mm(s,e,t,n,i){let o=function(...a){window[n].push(arguments)};return window[i]&&typeof window[i]=="function"&&(o=window[i]),window[i]=km(o,s,e,t),{gtagCore:o,wrappedGtag:window[i]}}function Fm(s){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(Yi)&&t.src.includes(s))return t;return null}/**
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
 */const $m=30,Bm=1e3;class Um{constructor(e={},t=Bm){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Dl=new Um;function jm(s){return new Headers({Accept:"application/json","x-goog-api-key":s})}async function zm(s){var e;const{appId:t,apiKey:n}=s,i={method:"GET",headers:jm(n)},o=Pm.replace("{app-id}",t),a=await fetch(o,i);if(a.status!==200&&a.status!==304){let l="";try{const h=await a.json();!((e=h.error)===null||e===void 0)&&e.message&&(l=h.error.message)}catch{}throw be.create("config-fetch-failed",{httpStatus:a.status,responseMessage:l})}return a.json()}async function Gm(s,e=Dl,t){const{appId:n,apiKey:i,measurementId:o}=s.options;if(!n)throw be.create("no-app-id");if(!i){if(o)return{measurementId:o,appId:n};throw be.create("no-api-key")}const a=e.getThrottleMetadata(n)||{backoffCount:0,throttleEndTimeMillis:Date.now()},l=new Km;return setTimeout(async()=>{l.abort()},Cm),Vl({appId:n,apiKey:i,measurementId:o},a,l,e)}async function Vl(s,{throttleEndTimeMillis:e,backoffCount:t},n,i=Dl){var o;const{appId:a,measurementId:l}=s;try{await qm(n,e)}catch(h){if(l)return Ee.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${h==null?void 0:h.message}]`),{appId:a,measurementId:l};throw h}try{const h=await zm(s);return i.deleteThrottleMetadata(a),h}catch(h){const d=h;if(!Hm(d)){if(i.deleteThrottleMetadata(a),l)return Ee.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${d==null?void 0:d.message}]`),{appId:a,measurementId:l};throw h}const m=Number((o=d==null?void 0:d.customData)===null||o===void 0?void 0:o.httpStatus)===503?so(t,i.intervalMillis,$m):so(t,i.intervalMillis),g={throttleEndTimeMillis:Date.now()+m,backoffCount:t+1};return i.setThrottleMetadata(a,g),Ee.debug(`Calling attemptFetch again in ${m} millis`),Vl(s,g,n,i)}}function qm(s,e){return new Promise((t,n)=>{const i=Math.max(e-Date.now(),0),o=setTimeout(t,i);s.addEventListener(()=>{clearTimeout(o),n(be.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function Hm(s){if(!(s instanceof Ze)||!s.customData)return!1;const e=Number(s.customData.httpStatus);return e===429||e===500||e===503||e===504}class Km{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function Wm(s,e,t,n,i){if(i&&i.global){s("event",t,n);return}else{const o=await e,a=Object.assign(Object.assign({},n),{send_to:o});s("event",t,a)}}/**
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
 */async function Ym(){if(Ii())try{await bi()}catch(s){return Ee.warn(be.create("indexeddb-unavailable",{errorInfo:s==null?void 0:s.toString()}).message),!1}else return Ee.warn(be.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Qm(s,e,t,n,i,o,a){var l;const h=Gm(s);h.then(S=>{t[S.measurementId]=S.appId,s.options.measurementId&&S.measurementId!==s.options.measurementId&&Ee.warn(`The measurement ID in the local Firebase config (${s.options.measurementId}) does not match the measurement ID fetched from the server (${S.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(S=>Ee.error(S)),e.push(h);const d=Ym().then(S=>{if(S)return n.getId()}),[m,g]=await Promise.all([h,d]);Fm(o)||Lm(o,m.measurementId),i("js",new Date);const b=(l=a==null?void 0:a.config)!==null&&l!==void 0?l:{};return b[Sm]="firebase",b.update=!0,g!=null&&(b[Am]=g),i("config",m.measurementId,b),m.measurementId}/**
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
 */class Xm{constructor(e){this.app=e}_delete(){return delete rn[this.app.options.appId],Promise.resolve()}}let rn={},zo=[];const Go={};let ei="dataLayer",Jm="gtag",qo,Ll,Ho=!1;function Zm(){const s=[];if(ta()&&s.push("This is a browser extension environment."),na()||s.push("Cookies are not available."),s.length>0){const e=s.map((n,i)=>`(${i+1}) ${n}`).join(" "),t=be.create("invalid-analytics-context",{errorInfo:e});Ee.warn(t.message)}}function ep(s,e,t){Zm();const n=s.options.appId;if(!n)throw be.create("no-app-id");if(!s.options.apiKey)if(s.options.measurementId)Ee.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${s.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw be.create("no-api-key");if(rn[n]!=null)throw be.create("already-exists",{id:n});if(!Ho){Om(ei);const{wrappedGtag:o,gtagCore:a}=Mm(rn,zo,Go,ei,Jm);Ll=o,qo=a,Ho=!0}return rn[n]=Qm(s,zo,Go,e,qo,ei,t),new Xm(s)}function tp(s=aa()){s=ht(s);const e=pn(s,as);return e.isInitialized()?e.getImmediate():np(s)}function np(s,e={}){const t=pn(s,as);if(t.isInitialized()){const i=t.getImmediate();if(Wn(e,t.getOptions()))return i;throw be.create("already-initialized")}return t.initialize({options:e})}async function sp(){if(ta()||!na()||!Ii())return!1;try{return await bi()}catch{return!1}}function ip(s,e,t,n){s=ht(s),Wm(Ll,rn[s.app.options.appId],e,t,n).catch(i=>Ee.error(i))}const Ko="@firebase/analytics",Wo="0.10.8";function rp(){Ye(new Fe(as,(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("installations-internal").getImmediate();return ep(n,i,t)},"PUBLIC")),Ye(new Fe("analytics-internal",s,"PRIVATE")),De(Ko,Wo),De(Ko,Wo,"esm2017");function s(e){try{const t=e.getProvider(as).getImmediate();return{logEvent:(n,i,o)=>ip(t,n,i,o)}}catch(t){throw be.create("interop-component-reg-failed",{reason:t})}}}rp();let Ol;function op(){const e=oa({apiKey:"AIzaSyC2oOMCF6T2qjW6vsuiwKp7u4eA1QG9V1U",authDomain:"amazesv1.firebaseapp.com",projectId:"amazesv1",storageBucket:"amazesv1.firebasestorage.app",messagingSenderId:"5056362888",appId:"1:5056362888:web:edf69d4b49937651a0623d",measurementId:"G-PLNRBMVC30"});Ol=Tf(e),sp().then(t=>{t&&tp(e)})}function ap(){return Ol}const lp="daily_times";async function cp(s){const e=ap(),t=Sc();await Nf(Ef(e,lp),{day:t,timeMs:s,createdAt:Mf()})}class lt{constructor(){this.STORAGE_KEY="labyrinth_leap_progress",this.CURRENT_VERSION=2,this.progress=this.loadProgress(),this.migrateProgressIfNeeded()}static getInstance(){return lt.instance||(lt.instance=new lt),lt.instance}getCurrentLevel(){return this.progress.currentLevel}getHighestLevel(){return this.progress.highestLevel}getTotalStars(){return this.progress.totalStars}getTotalCoins(){return this.progress.totalCoins}isLevelUnlocked(e){if(typeof e=="number")return e<=this.progress.highestLevel;if(this.progress.unlockedLevels.has(e))return!0;const t=this.extractNumericLevel(e);return t!==null?t<=this.progress.highestLevel:!1}unlockLevel(e){this.progress.unlockedLevels.add(e),this.saveProgress()}unlockLevels(e){e.forEach(t=>this.progress.unlockedLevels.add(t)),this.saveProgress()}completeLevel(e,t,n,i,o,a){if(typeof e=="number"){this.completeLevelLegacy(e,t,n,i);return}this.completeLevelV2(e,t,n,i,o,a)}completeLevelLegacy(e,t,n,i){const o=this.progress.levelStats.get(e)||{completed:!1,bestTime:1/0,stars:0,attempts:0,lastPlayed:new Date};if(o.completed=!0,o.attempts++,o.lastPlayed=new Date,t<o.bestTime&&(o.bestTime=t),n>o.stars){const a=n-o.stars;o.stars=n,this.progress.totalStars+=a}this.progress.totalCoins+=i,this.progress.levelStats.set(e,o),e>=this.progress.highestLevel&&(this.progress.highestLevel=e+1),this.saveProgress()}completeLevelV2(e,t,n,i,o,a){const l=this.progress.levelStatsV2.get(e)||{levelId:e,completed:!1,bestTime:1/0,stars:0,attempts:0,lastPlayed:new Date,firstCompleted:void 0,objectives:new Map},h=l.completed;if(l.completed=!0,l.attempts++,l.lastPlayed=new Date,h||(l.firstCompleted=new Date),t<l.bestTime&&(l.bestTime=t),n>l.stars){const m=n-l.stars;l.stars=n,this.progress.totalStars+=m}o&&(l.objectives=new Map(o)),this.progress.totalCoins+=i,this.progress.levelStatsV2.set(e,l),a&&a.forEach(m=>this.progress.unlockedLevels.add(m));const d=this.extractNumericLevel(e);d!==null&&d>=this.progress.highestLevel&&(this.progress.highestLevel=d+1),this.saveProgress()}getLevelStats(e){return typeof e=="number"?this.progress.levelStats.get(e):this.progress.levelStatsV2.get(e)}getObjectiveProgress(e,t){const n=this.progress.levelStatsV2.get(e);return n==null?void 0:n.objectives.get(t)}getCompletedLevels(){const e=Array.from(this.progress.levelStats.entries()).filter(([n,i])=>i.completed).map(([n,i])=>n),t=Array.from(this.progress.levelStatsV2.entries()).filter(([n,i])=>i.completed).map(([n,i])=>n);return{legacy:e,v2:t}}extractNumericLevel(e){const t=e.match(/(\d+)/);return t?parseInt(t[1],10):null}loadProgress(){try{const e=localStorage.getItem(this.STORAGE_KEY);if(e){const t=JSON.parse(e),n=new Map;t.levelStats&&t.levelStats.forEach(([o,a])=>{const l={...a,lastPlayed:a.lastPlayed?new Date(a.lastPlayed):new Date};n.set(o,l)});const i=new Map;return t.levelStatsV2&&t.levelStatsV2.forEach(([o,a])=>{const l={...a,lastPlayed:new Date(a.lastPlayed),firstCompleted:a.firstCompleted?new Date(a.firstCompleted):void 0,objectives:new Map(a.objectives||[])};l.objectives.forEach(h=>{h.completedAt&&(h.completedAt=new Date(h.completedAt))}),i.set(o,l)}),{currentLevel:t.currentLevel||1,highestLevel:t.highestLevel||1,totalStars:t.totalStars||0,totalCoins:t.totalCoins||0,levelStats:n,levelStatsV2:i,unlockedLevels:new Set(t.unlockedLevels||[]),version:t.version||1}}}catch(e){console.warn("Failed to load progress:",e)}return{currentLevel:1,highestLevel:1,totalStars:0,totalCoins:0,levelStats:new Map,levelStatsV2:new Map,unlockedLevels:new Set(["level-001-tutorial"]),version:this.CURRENT_VERSION}}saveProgress(){try{const e=Array.from(this.progress.levelStatsV2.entries()).map(([n,i])=>[n,{...i,objectives:Array.from(i.objectives.entries())}]),t={...this.progress,levelStats:Array.from(this.progress.levelStats.entries()),levelStatsV2:e,unlockedLevels:Array.from(this.progress.unlockedLevels),version:this.CURRENT_VERSION};localStorage.setItem(this.STORAGE_KEY,JSON.stringify(t))}catch(e){console.warn("Failed to save progress:",e)}}migrateProgressIfNeeded(){this.progress.version<this.CURRENT_VERSION&&(console.log(`Migrating progress from version ${this.progress.version} to ${this.CURRENT_VERSION}`),this.progress.version<2&&this.migrateToV2(),this.progress.version=this.CURRENT_VERSION,this.saveProgress())}migrateToV2(){this.progress.levelStatsV2||(this.progress.levelStatsV2=new Map),this.progress.unlockedLevels||(this.progress.unlockedLevels=new Set),this.progress.levelStats.forEach((e,t)=>{const n=`level-${t.toString().padStart(3,"0")}-migrated`;if(!this.progress.levelStatsV2.has(n)){const i={levelId:n,completed:e.completed,bestTime:e.bestTime,stars:e.stars,attempts:e.attempts,lastPlayed:e.lastPlayed,objectives:new Map};this.progress.levelStatsV2.set(n,i),e.completed&&this.progress.unlockedLevels.add(n)}}),this.progress.unlockedLevels.add("level-001-tutorial"),console.log(`Migrated ${this.progress.levelStats.size} legacy levels to new format`)}getPlayStats(){const e=Array.from(this.progress.levelStats.values()).filter(n=>n.completed).length,t=Array.from(this.progress.levelStatsV2.values()).filter(n=>n.completed).length;return{totalLevelsCompleted:e+t,legacyLevelsCompleted:e,v2LevelsCompleted:t,averageAttempts:this.getAverageAttempts(),totalPlayTime:this.getTotalPlayTime(),streakDays:this.getStreakDays(),unlockedLevelsCount:this.progress.unlockedLevels.size}}getAverageAttempts(){const e=Array.from(this.progress.levelStats.values()).filter(o=>o.completed),t=Array.from(this.progress.levelStatsV2.values()).filter(o=>o.completed),n=[...e,...t];return n.length===0?0:n.reduce((o,a)=>o+a.attempts,0)/n.length}getTotalPlayTime(){const e=Array.from(this.progress.levelStats.values()).filter(n=>n.completed).reduce((n,i)=>n+i.bestTime,0),t=Array.from(this.progress.levelStatsV2.values()).filter(n=>n.completed).reduce((n,i)=>n+i.bestTime,0);return e+t}getStreakDays(){const e=new Date;let t=0;for(let n=0;n<30;n++){const i=new Date(e);i.setDate(e.getDate()-n);const o=Array.from(this.progress.levelStats.values()).some(l=>new Date(l.lastPlayed).toDateString()===i.toDateString()),a=Array.from(this.progress.levelStatsV2.values()).some(l=>new Date(l.lastPlayed).toDateString()===i.toDateString());if(o||a)t++;else if(n>0)break}return t}getUnlockedLevels(){return Array.from(this.progress.unlockedLevels)}resetProgress(){this.progress={currentLevel:1,highestLevel:1,totalStars:0,totalCoins:0,levelStats:new Map,levelStatsV2:new Map,unlockedLevels:new Set(["level-001-tutorial"]),version:this.CURRENT_VERSION},this.saveProgress()}exportProgress(){return JSON.stringify({...this.progress,levelStats:Array.from(this.progress.levelStats.entries()),levelStatsV2:Array.from(this.progress.levelStatsV2.entries()).map(([e,t])=>[e,{...t,objectives:Array.from(t.objectives.entries())}]),unlockedLevels:Array.from(this.progress.unlockedLevels)},null,2)}importProgress(e){try{const t=JSON.parse(e);if(!t||typeof t!="object")throw new Error("Invalid progress data format");const n={currentLevel:t.currentLevel||1,highestLevel:t.highestLevel||1,totalStars:t.totalStars||0,totalCoins:t.totalCoins||0,levelStats:new Map(t.levelStats||[]),levelStatsV2:new Map,unlockedLevels:new Set(t.unlockedLevels||["level-001-tutorial"]),version:t.version||this.CURRENT_VERSION};return t.levelStatsV2&&t.levelStatsV2.forEach(([i,o])=>{const a={...o,lastPlayed:new Date(o.lastPlayed),firstCompleted:o.firstCompleted?new Date(o.firstCompleted):void 0,objectives:new Map(o.objectives||[])};n.levelStatsV2.set(i,a)}),this.progress=n,this.saveProgress(),!0}catch(t){return console.error("Failed to import progress:",t),!1}}}class It{constructor(){this.events=[],this.maxEvents=100,this.debugElement=null,this.isVisible=!1,this.logToConsole=!0,this.logToScreen=!0,this.createDebugInterface(),this.setupGlobalErrorHandling()}static getInstance(){return It.instance||(It.instance=new It),It.instance}log(e,t,n,i,o){const a={timestamp:Date.now(),type:e,category:t,message:n,data:i,position:o};if(this.events.push(a),this.events.length>this.maxEvents&&(this.events=this.events.slice(-this.maxEvents)),this.logToConsole){const l=new Date(a.timestamp).toLocaleTimeString(),h=o?` @(${o.x},${o.y})`:"",d=i?` | Data: ${JSON.stringify(i)}`:"";console.log(`🐛 [${l}] ${e.toUpperCase()} | ${t} | ${n}${h}${d}`)}if(this.logToScreen&&this.isVisible&&this.updateDebugDisplay(),window.Android)try{window.Android.log(`MAZE_DEBUG: [${e}] ${t}: ${n}`)}catch{}}click(e,t,n,i){this.log("click",e,t,n,i)}touch(e,t,n,i){this.log("touch",e,t,n,i)}scene(e,t,n){this.log("scene",e,t,n)}level(e,t,n){this.log("level",e,t,n)}game(e,t,n){this.log("game",e,t,n)}error(e,t,n){this.log("error",e,t,n)}info(e,t,n){this.log("info",e,t,n)}toggle(){this.isVisible=!this.isVisible,this.debugElement&&(this.debugElement.style.display=this.isVisible?"block":"none",this.isVisible&&this.updateDebugDisplay())}show(){this.isVisible=!0,this.debugElement&&(this.debugElement.style.display="block",this.updateDebugDisplay())}hide(){this.isVisible=!1,this.debugElement&&(this.debugElement.style.display="none")}clear(){this.events=[],this.updateDebugDisplay(),console.clear()}getEvents(){return[...this.events]}getRecentEvents(e=10){return this.events.slice(-e)}exportLogs(){return JSON.stringify(this.events,null,2)}createDebugInterface(){this.debugElement=document.createElement("div"),this.debugElement.id="debug-overlay",this.debugElement.style.cssText=`
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
      border: 1px solid #00ff00;
    `;const e=document.createElement("button");e.textContent="🐛",e.style.cssText=`
      position: fixed;
      top: 10px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      border: 1px solid #00ff00;
      border-radius: 50%;
      font-size: 16px;
      z-index: 10001;
      cursor: pointer;
    `,e.addEventListener("click",()=>this.toggle());const t=document.createElement("button");t.textContent="🗑️",t.style.cssText=`
      position: fixed;
      top: 60px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.8);
      color: #ff0000;
      border: 1px solid #ff0000;
      border-radius: 50%;
      font-size: 16px;
      z-index: 10001;
      cursor: pointer;
    `,t.addEventListener("click",()=>this.clear()),document.body?(document.body.appendChild(this.debugElement),document.body.appendChild(e),document.body.appendChild(t)):document.addEventListener("DOMContentLoaded",()=>{document.body.appendChild(this.debugElement),document.body.appendChild(e),document.body.appendChild(t)}),document.addEventListener("keydown",n=>{n.ctrlKey&&n.key==="d"&&(n.preventDefault(),this.toggle())})}updateDebugDisplay(){if(!this.debugElement||!this.isVisible)return;const t=this.getRecentEvents(20).map(n=>{const i=new Date(n.timestamp).toLocaleTimeString(),o=this.getTypeColor(n.type),a=n.position?` @(${n.position.x},${n.position.y})`:"";return`<div style="color: ${o}; margin-bottom: 2px;">
        [${i}] ${n.type.toUpperCase()}<br>
        ${n.category}: ${n.message}${a}
        ${n.data?`<br><small>${JSON.stringify(n.data)}</small>`:""}
      </div>`}).join("");this.debugElement.innerHTML=`
      <div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">
        🐛 Debug Log (${this.events.length} events)
      </div>
      ${t}
    `,this.debugElement.scrollTop=this.debugElement.scrollHeight}getTypeColor(e){return{click:"#00ff00",touch:"#00ffff",scene:"#ffff00",level:"#ff8800",game:"#8800ff",error:"#ff0000",info:"#ffffff"}[e]||"#ffffff"}setupGlobalErrorHandling(){window.addEventListener("error",e=>{var t;this.error("JavaScript",`${e.message} at ${e.filename}:${e.lineno}`,{error:e.error,stack:(t=e.error)==null?void 0:t.stack})}),window.addEventListener("unhandledrejection",e=>{this.error("Promise",`Unhandled rejection: ${e.reason}`,{reason:e.reason})})}}const O=It.getInstance();window.debug={log:(s,e,t,n)=>O.log(s,e,t,n),click:(s,e,t,n)=>O.click(s,e,t,n),touch:(s,e,t,n)=>O.touch(s,e,t,n),scene:(s,e,t)=>O.scene(s,e,t),level:(s,e,t)=>O.level(s,e,t),game:(s,e,t)=>O.game(s,e,t),error:(s,e,t)=>O.error(s,e,t),info:(s,e,t)=>O.info(s,e,t),toggle:()=>O.toggle(),show:()=>O.show(),hide:()=>O.hide(),clear:()=>O.clear(),export:()=>O.exportLogs()};const J=24;class up extends ee.Scene{constructor(){super("Game"),this.gameState=null,this.arrowButtons={},this.currentLevel=1,this.orbs=[]}create(){O.scene("Game","Game scene created",{sceneKey:this.scene.key,scaleWidth:this.scale.width,scaleHeight:this.scale.height}),this.cameras.main.setBackgroundColor("#F5E6D3"),this.gameCore=new Cc,this.levelService=new Xo,this.progressManager=lt.getInstance(),O.game("Game","Core services initialized"),this.subscribeToGameEvents();const e=this.registry.get("selectedLevelId"),t=this.registry.get("selectedLevelDefinition");e?(O.game("Game",`Using selected level: ${e}`),this.currentLevel=e):(O.game("Game","No selected level, using current level from progress manager"),this.currentLevel=this.progressManager.getCurrentLevel()),this.initLevel(t)}async initLevel(e){try{O.game("Game",`Initializing level: ${this.currentLevel}`,{hasPreloadedDefinition:!!e}),this.children.removeAll(),this.orbs=[],this.input.off("pointerdown"),this.input.off("pointermove");let t;e?(O.game("Game","Using preloaded level definition"),t=e):(O.game("Game",`Loading level definition for: ${this.currentLevel}`),t=await this.levelService.loadLevel(this.currentLevel.toString())),O.game("Game","Initializing GameCore with level definition",{levelId:t.id,levelName:t.metadata.name,generationType:t.generation.type}),this.gameCore.initializeLevel(t),this.gameState=this.gameCore.getGameState(),this.createUI(),this.renderGameState(),this.createArrowButtons(),this.updateArrowButtons(),this.setupInputHandlers(),this.gameCore.startGame()}catch(t){console.error("Failed to initialize level:",t)}}subscribeToGameEvents(){this.gameCore.on("game.initialized",e=>{this.gameState=e.state,console.log("Game initialized for level:",e.levelDefinition.id)}),this.gameCore.on("game.started",e=>{console.log("Game started at:",new Date(e.timestamp))}),this.gameCore.on("game.paused",e=>{console.log("Game paused after:",e.duration,"ms")}),this.gameCore.on("game.resumed",e=>{console.log("Game resumed after pause of:",e.pausedDuration,"ms")}),this.gameCore.on("game.completed",e=>{this.showCompletionUI(e.result)}),this.gameCore.on("game.failed",e=>{console.log("Game failed:",e.reason)}),this.gameCore.on("player.moved",e=>{this.animatePlayerMovement(e.from,e.to),this.updateArrowButtons()}),this.gameCore.on("player.move.attempted",e=>{e.blocked&&this.showMoveBlockedFeedback(e.direction,e.reason)}),this.gameCore.on("orb.collected",e=>{this.animateOrbCollection(e.orbId,e.position),this.updateHintText(),this.showScorePopup(e.position,e.score)}),this.gameCore.on("orb.collection.attempted",e=>{e.success||console.log("Orb collection failed:",e.reason)}),this.gameCore.on("objective.progress",e=>{console.log(`Objective ${e.objectiveId} progress: ${e.newProgress}/${e.target}`),e.completed&&this.showObjectiveCompletedFeedback(e.objectiveId)}),this.gameCore.on("objective.completed",e=>{console.log("Objective completed:",e.objectiveId)}),this.gameCore.on("score.changed",e=>{console.log(`Score changed: ${e.previousScore} -> ${e.newScore} (${e.change>0?"+":""}${e.change})`)}),this.gameCore.on("level.loaded",e=>{console.log("Level loaded:",e.levelId,e.result.success?"successfully":"with errors")}),this.gameCore.on("level.generated",e=>{console.log(`Level generated in ${e.generationTime}ms:`,{levelId:e.levelId,seed:e.seed,mazeSize:e.mazeSize,orbCount:e.orbCount})}),this.gameCore.on("state.changed",e=>{this.gameState=e.state,this.updateUI();const t=e.changes.filter(n=>["status","score","player.position"].includes(n.property));t.length>0&&console.log("Significant state changes:",t)}),this.gameCore.on("state.validated",e=>{e.valid||console.warn("State validation failed:",e.errors),e.warnings.length>0&&console.warn("State validation warnings:",e.warnings)}),this.gameCore.on("error",e=>{console.error("Game error:",e.error.message,e.context),this.showErrorFeedback(e.error.message,e.recoverable)}),this.gameCore.on("debug",e=>{e.level==="error"?console.error("[Game Debug]",e.message,e.data):e.level==="warn"?console.warn("[Game Debug]",e.message,e.data):e.level==="info"?console.info("[Game Debug]",e.message,e.data):console.log("[Game Debug]",e.message,e.data)})}createUI(){if(!this.gameState)return;const e=this.add.text(20,20,"← Back",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#FFFFFF",backgroundColor:"#8B7355",padding:{x:12,y:6}}).setOrigin(0,0).setInteractive({useHandCursor:!0});e.on("pointerdown",()=>{O.click("Game","Back button clicked - returning to level select"),this.scene.start("LevelSelect")}),e.on("pointerover",()=>{e.setStyle({backgroundColor:"#A0522D"})}),e.on("pointerout",()=>{e.setStyle({backgroundColor:"#8B7355"})}),this.titleText=this.add.text(this.scale.width/2,50,"Labyrinth Leap",{fontFamily:"Arial, sans-serif",fontSize:"36px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5),this.subtitleText=this.add.text(this.scale.width/2,80,"Collect all the orbs and find your way to the goal!",{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#8B7355"}).setOrigin(.5);const t=120;this.add.circle(this.scale.width/2-60,t,12,13789470).setStrokeStyle(2,9127187),this.levelText=this.add.text(this.scale.width/2-60,t,this.currentLevel.toString(),{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#FFFFFF",fontStyle:"bold"}).setOrigin(.5);for(let i=0;i<3;i++){const o=i<this.currentLevel-1?8368233:13882323;this.add.circle(this.scale.width/2-20+i*20,t,6,o)}this.timerText=this.add.text(this.scale.width/2+60,t,"00:00",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#D2691E",fontStyle:"bold"}).setOrigin(.5);const n=this.add.text(this.scale.width-20,20,"⏸ Menu",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#FFFFFF",backgroundColor:"#D2691E",padding:{x:12,y:6}}).setOrigin(1,0).setInteractive({useHandCursor:!0});n.on("pointerdown",()=>{O.click("Game","Pause/Menu button clicked"),this.showPauseMenu()}),n.on("pointerover",()=>{n.setStyle({backgroundColor:"#CD853F"})}),n.on("pointerout",()=>{n.setStyle({backgroundColor:"#D2691E"})}),this.hintText=this.add.text(this.scale.width/2,150,"Collect all the orbs to unlock the goal!",{fontFamily:"Arial, sans-serif",fontSize:"12px",color:"#8B7355",backgroundColor:"#F0E68C",padding:{x:8,y:4}}).setOrigin(.5),this.spaceHintText=this.add.text(this.scale.width/2,this.scale.height-40,"Use arrow buttons or tap to move.",{fontFamily:"Arial, sans-serif",fontSize:"12px",color:"#8B7355"}).setOrigin(.5)}update(e,t){if(!this.gameState||this.gameState.status!=="playing")return;const n=this.gameCore.getCurrentTime(),i=Math.floor(n/6e4),o=Math.floor(n%6e4/1e3);this.timerText.setText(`${i.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`)}renderGameState(){this.gameState&&(this.drawMaze(),this.createPlayer(),this.createOrbs())}updateUI(){this.gameState&&this.updateHintText()}cx(e){if(!this.gameState)return 0;const t=this.gameState.maze[0].length*J;return(this.scale.width-t)/2+e*J+J/2}cy(e){return 200+e*J+J/2}drawMaze(){if(!this.gameState)return;const e=this.gameState.maze,t=e[0].length,n=e.length,i=t*J,o=n*J,a=(this.scale.width-i)/2,l=200;this.add.rectangle(a+i/2,l+o/2,i+20,o+20,8368233).setStrokeStyle(4,7048794),this.mazeGraphics=this.add.graphics(),this.mazeGraphics.fillStyle(16115411);for(let h=0;h<n;h++)for(let d=0;d<t;d++){const m=e[h][d],g=a+d*J,b=l+h*J;this.mazeGraphics.fillRect(g+2,b+2,J-4,J-4),m.walls&1&&this.mazeGraphics.fillRect(g+J-2,b+2,4,J-4),m.walls&2&&this.mazeGraphics.fillRect(g+2,b+J-2,J-4,4),m.walls&4&&this.mazeGraphics.fillRect(g-2,b+2,4,J-4),m.walls&8&&this.mazeGraphics.fillRect(g+2,b-2,J-4,4)}}createPlayer(){if(!this.gameState)return;const e=this.gameState.player.position;this.player=this.add.circle(this.cx(e.x),this.cy(e.y),8,4286945).setStrokeStyle(2,1981066)}createOrbs(){if(!this.gameState)return;this.orbs.forEach(t=>t.destroy()),this.orbs=[];const e=[16739179,5164484,16770669,9822675,15961e3];this.gameState.orbs.forEach((t,n)=>{if(!t.collected){const i=e[n%e.length],o=this.add.circle(this.cx(t.position.x),this.cy(t.position.y),6,i).setStrokeStyle(2,9127187);o.setData("orbId",t.id),this.orbs.push(o)}})}createArrowButtons(){const e=this.scale.width/2,t=this.scale.height-100,n=40,i=60,o={fillStyle:16115411,lineStyle:{width:2,color:13808780}};this.arrowButtons.up=this.add.graphics(o),this.arrowButtons.up.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.up.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.up.fillStyle(9139029),this.arrowButtons.up.fillTriangle(0,-8,-6,6,6,6),this.arrowButtons.up.setPosition(e,t-i),this.arrowButtons.up.setInteractive(new ee.Geom.Rectangle(-n/2,-n/2,n,n),ee.Geom.Rectangle.Contains),this.arrowButtons.up.on("pointerup",()=>this.handleButtonMove("up")),this.arrowButtons.down=this.add.graphics(o),this.arrowButtons.down.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.down.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.down.fillStyle(9139029),this.arrowButtons.down.fillTriangle(0,8,-6,-6,6,-6),this.arrowButtons.down.setPosition(e,t+i),this.arrowButtons.down.setInteractive(new ee.Geom.Rectangle(-n/2,-n/2,n,n),ee.Geom.Rectangle.Contains),this.arrowButtons.down.on("pointerup",()=>this.handleButtonMove("down")),this.arrowButtons.left=this.add.graphics(o),this.arrowButtons.left.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.left.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.left.fillStyle(9139029),this.arrowButtons.left.fillTriangle(-8,0,6,-6,6,6),this.arrowButtons.left.setPosition(e-i,t),this.arrowButtons.left.setInteractive(new ee.Geom.Rectangle(-n/2,-n/2,n,n),ee.Geom.Rectangle.Contains),this.arrowButtons.left.on("pointerup",()=>this.handleButtonMove("left")),this.arrowButtons.right=this.add.graphics(o),this.arrowButtons.right.fillRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.right.strokeRoundedRect(-n/2,-n/2,n,n,8),this.arrowButtons.right.fillStyle(9139029),this.arrowButtons.right.fillTriangle(8,0,-6,-6,-6,6),this.arrowButtons.right.setPosition(e+i,t),this.arrowButtons.right.setInteractive(new ee.Geom.Rectangle(-n/2,-n/2,n,n),ee.Geom.Rectangle.Contains),this.arrowButtons.right.on("pointerup",()=>this.handleButtonMove("right"));const a=this.add.graphics(o);a.fillRoundedRect(-n/2,-n/2,n,n,8),a.strokeRoundedRect(-n/2,-n/2,n,n,8),a.fillStyle(13789470),a.fillCircle(0,0,6),a.setPosition(e,t),a.setInteractive(new ee.Geom.Rectangle(-n/2,-n/2,n,n),ee.Geom.Rectangle.Contains),a.on("pointerup",()=>this.dropOrb())}dropOrb(){console.log("Drop orb at current position")}setupInputHandlers(){this.input.on("pointerdown",e=>this.handlePointerInput(e.worldX,e.worldY)),this.input.on("pointermove",e=>{e.isDown&&this.handlePointerInput(e.worldX,e.worldY)}),this.setupKeyboardInput()}setupKeyboardInput(){var a,l,h,d,m,g,b,S,C,L,D,F,j;const e=(a=this.input.keyboard)==null?void 0:a.createCursorKeys(),t=(l=this.input.keyboard)==null?void 0:l.addKeys("W,S,A,D");e&&((h=e.up)==null||h.on("down",()=>this.handlePlayerMove("up")),(d=e.down)==null||d.on("down",()=>this.handlePlayerMove("down")),(m=e.left)==null||m.on("down",()=>this.handlePlayerMove("left")),(g=e.right)==null||g.on("down",()=>this.handlePlayerMove("right"))),t&&((b=t.W)==null||b.on("down",()=>this.handlePlayerMove("up")),(S=t.S)==null||S.on("down",()=>this.handlePlayerMove("down")),(C=t.A)==null||C.on("down",()=>this.handlePlayerMove("left")),(L=t.D)==null||L.on("down",()=>this.handlePlayerMove("right")));const n=(D=this.input.keyboard)==null?void 0:D.addKey(ee.Input.Keyboard.KeyCodes.SPACE),i=(F=this.input.keyboard)==null?void 0:F.addKey(ee.Input.Keyboard.KeyCodes.ESC);n==null||n.on("down",()=>this.handlePauseToggle()),i==null||i.on("down",()=>this.handlePauseToggle());const o=(j=this.input.keyboard)==null?void 0:j.addKey(ee.Input.Keyboard.KeyCodes.R);o==null||o.on("down",()=>this.handleReset())}handlePauseToggle(){if(!(!this.gameCore||!this.gameState))try{this.gameState.status==="playing"?(this.gameCore.pauseGame(),console.log("Game paused")):this.gameState.status==="paused"&&(this.gameCore.resumeGame(),console.log("Game resumed"))}catch(e){console.error("Error toggling pause:",e),this.showErrorFeedback("Failed to pause/resume game",!0)}}handleReset(){if(this.gameCore)try{this.gameCore.resetGame(),console.log("Game reset")}catch(e){console.error("Error resetting game:",e),this.showErrorFeedback("Failed to reset game",!0)}}handleButtonMove(e){const t=e==="up"?"up":e==="down"?"down":e==="left"?"left":"right",n=this.arrowButtons[t];n&&this.tweens.add({targets:n,scaleX:.9,scaleY:.9,duration:100,yoyo:!0,ease:"Power2"}),this.handlePlayerMove(e)}handlePlayerMove(e){if(!this.gameCore||!this.gameState){console.warn("Cannot move player: game not initialized");return}if(this.gameState.status!=="playing"){console.log("Move ignored: game not in playing state");return}try{const t=this.gameCore.movePlayer(e);t.success?console.log(`Player moved ${e} to position (${t.newPosition.x}, ${t.newPosition.y})`):(this.showMoveBlockedFeedback(this.directionToCardinal(e),t.reason),console.log("Move failed:",t.reason))}catch(t){console.error("Error during player move:",t),this.showErrorFeedback("Failed to move player",!0)}}directionToCardinal(e){switch(e){case"up":return"north";case"down":return"south";case"left":return"west";case"right":return"east";default:return"unknown"}}handlePointerInput(e,t){if(!this.gameState){console.warn("Cannot handle pointer input: game state not available");return}if(this.gameState.status!=="playing"){console.log("Pointer input ignored: game not in playing state");return}try{const n=this.gameState.maze;if(!n||n.length===0||!n[0]){console.error("Invalid maze data");return}const i=n[0].length,o=n.length,a=i*J,l=(this.scale.width-a)/2,h=200,d=Math.floor((e-l)/J),m=Math.floor((t-h)/J);if(d<0||m<0||d>=i||m>=o){console.log("Pointer input outside maze bounds");return}const g=this.gameState.player.position,b=d-g.x,S=m-g.y;if(Math.abs(b)+Math.abs(S)!==1){console.log("Pointer input not adjacent to player");return}let C;if(b===1)C="right";else if(b===-1)C="left";else if(S===1)C="down";else if(S===-1)C="up";else{console.error("Invalid direction calculation");return}this.handlePlayerMove(C)}catch(n){console.error("Error handling pointer input:",n),this.showErrorFeedback("Input handling error",!0)}}updateArrowButtons(){if(!this.gameState)return;const e=this.gameState.player.position,t=this.gameState.maze[e.y][e.x];this.arrowButtons.up.setAlpha(t.walls&8?1:.4),this.arrowButtons.down.setAlpha(t.walls&2?1:.4),this.arrowButtons.left.setAlpha(t.walls&4?1:.4),this.arrowButtons.right.setAlpha(t.walls&1?1:.4)}animatePlayerMovement(e,t){this.player&&this.tweens.add({targets:this.player,x:this.cx(t.x),y:this.cy(t.y),duration:150})}animateOrbCollection(e,t){const n=this.orbs.findIndex(i=>i.getData("orbId")===e);if(n>=0){const i=this.orbs[n];this.tweens.add({targets:i,scaleX:0,scaleY:0,alpha:0,duration:200,onComplete:()=>{i.destroy()}}),this.orbs.splice(n,1)}}updateHintText(){if(!this.gameState||!this.hintText)return;const e=this.gameState.orbs.filter(n=>n.collected).length,t=this.gameState.orbs.length;e>=t?(this.hintText.setText("All orbs collected! Find the goal!"),this.hintText.setStyle({backgroundColor:"#90EE90"})):(this.hintText.setText(`Collect all orbs to unlock the goal! (${e}/${t})`),this.hintText.setStyle({backgroundColor:"#F0E68C"}))}showCompletionUI(e){const t=this.gameCore.getCurrentTime(),n=this.gameCore.getCurrentLevelDefinition();this.add.text(this.scale.width/2,this.scale.height/2-60,"Level Complete!",{fontFamily:"Arial, sans-serif",fontSize:"24px",color:"#7FB069",backgroundColor:"#F5E6D3",padding:{x:20,y:10}}).setOrigin(.5),n&&this.add.text(this.scale.width/2,this.scale.height/2-30,n.metadata.name,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#8B7355",backgroundColor:"#F5E6D3",padding:{x:15,y:5}}).setOrigin(.5);const i=Math.floor(t/6e4),o=Math.floor(t%6e4/1e3);this.add.text(this.scale.width/2,this.scale.height/2,`Time: ${i.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#8B7355",backgroundColor:"#F5E6D3",padding:{x:15,y:8}}).setOrigin(.5),e&&e.score!==void 0&&this.add.text(this.scale.width/2,this.scale.height/2+30,`Score: ${e.score}`,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#8B7355",backgroundColor:"#F5E6D3",padding:{x:15,y:8}}).setOrigin(.5);const a=this.add.text(this.scale.width/2,this.scale.height/2+70,"Continue",{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FFFFFF",backgroundColor:"#7FB069",padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:!0});a.on("pointerdown",()=>{this.handleLevelCompletion(n)}),cp(t).catch(()=>{}),this.time.delayedCall(5e3,()=>{a.active&&this.handleLevelCompletion(n)})}async handleLevelCompletion(e){try{if(!e){O.error("Game","No current level definition for completion handling"),this.scene.start("LevelSelect");return}const t=this.gameCore.getCurrentTime();this.progressManager.completeLevel(e.id,t,3);const n=e.progression.unlocks;if(n&&n.length>0){const i=n[0];O.game("Game",`Advancing to next level: ${i}`);try{const o=await this.levelService.loadLevel(i);this.registry.set("selectedLevelId",i),this.registry.set("selectedLevelDefinition",o),this.scene.restart()}catch(o){O.error("Game",`Failed to load next level: ${i}`,o),this.scene.start("LevelSelect")}}else O.game("Game","No more levels available, returning to level select"),this.scene.start("LevelSelect")}catch(t){O.error("Game","Error handling level completion",t),this.scene.start("LevelSelect")}}showMoveBlockedFeedback(e,t){this.player&&this.tweens.add({targets:this.player,x:this.player.x+(e==="east"?5:e==="west"?-5:0),y:this.player.y+(e==="south"?5:e==="north"?-5:0),duration:100,yoyo:!0,ease:"Power2"})}showPauseMenu(){this.gameCore.getGameState().status==="playing"&&this.gameCore.pauseGame(),this.add.rectangle(this.scale.width/2,this.scale.height/2,this.scale.width,this.scale.height,0,.7).setData("isPauseMenu",!0);const t=this.add.container(this.scale.width/2,this.scale.height/2);t.setData("isPauseMenu",!0);const n=this.add.rectangle(0,0,280,320,16115411,1).setStrokeStyle(3,9139029);t.add(n);const i=this.add.text(0,-120,"Game Paused",{fontFamily:"Arial, sans-serif",fontSize:"24px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5);t.add(i);const o=this.add.text(0,-60,"Resume",{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FFFFFF",backgroundColor:"#7FB069",padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:!0});o.on("pointerdown",()=>{this.hidePauseMenu(),this.gameCore.resumeGame()}),t.add(o);const a=this.add.text(0,-10,"Restart Level",{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FFFFFF",backgroundColor:"#D2691E",padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:!0});a.on("pointerdown",()=>{this.hidePauseMenu(),this.gameCore.resetGame()}),t.add(a);const l=this.add.text(0,40,"Level Select",{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FFFFFF",backgroundColor:"#8B7355",padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:!0});l.on("pointerdown",()=>{this.hidePauseMenu(),this.scene.start("LevelSelect")}),t.add(l);const h=[o,a,l],d=["#8FD17A","#E6A85C","#A0522D"],m=["#7FB069","#D2691E","#8B7355"];h.forEach((g,b)=>{g.on("pointerover",()=>{g.setStyle({backgroundColor:d[b]})}),g.on("pointerout",()=>{g.setStyle({backgroundColor:m[b]})})})}hidePauseMenu(){this.children.list.forEach(e=>{e.getData("isPauseMenu")&&e.destroy()})}showScorePopup(e,t){const n=this.add.text(this.cx(e.x),this.cy(e.y),`+${t}`,{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#FFD700",fontStyle:"bold"}).setOrigin(.5);this.tweens.add({targets:n,y:n.y-30,alpha:0,duration:1e3,ease:"Power2",onComplete:()=>n.destroy()})}showObjectiveCompletedFeedback(e){const t=this.add.text(this.scale.width/2,180,"Objective Complete!",{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#7FB069",backgroundColor:"#F5E6D3",padding:{x:10,y:5}}).setOrigin(.5);this.time.delayedCall(2e3,()=>{this.tweens.add({targets:t,alpha:0,duration:500,onComplete:()=>t.destroy()})})}showErrorFeedback(e,t){const n=t?"#FFA500":"#FF0000",i=this.add.text(this.scale.width/2,this.scale.height-80,t?"Warning: "+e:"Error: "+e,{fontFamily:"Arial, sans-serif",fontSize:"12px",color:n,backgroundColor:"#F5E6D3",padding:{x:8,y:4},wordWrap:{width:this.scale.width-40}}).setOrigin(.5);this.time.delayedCall(5e3,()=>{i&&i.active&&this.tweens.add({targets:i,alpha:0,duration:500,onComplete:()=>i.destroy()})})}destroy(){this.gameCore&&console.log("GameScene destroyed, cleaning up event listeners"),super.destroy()}}class hp extends ee.Scene{constructor(){super("Boot")}preload(){}create(){this.scene.start("LevelSelect")}}class dp extends ee.Scene{constructor(){super("LevelSelect"),this.currentPage=0,this.LEVELS_PER_PAGE=20,this.availableLevels=[],this.levelMetadata=new Map}async create(){O.scene("LevelSelect","Scene created - initializing level selection",{sceneKey:this.scene.key,scaleWidth:this.scale.width,scaleHeight:this.scale.height}),this.progressManager=lt.getInstance(),this.levelService=new Xo,this.cameras.main.setBackgroundColor("#F5E6D3"),this.showLoading();try{await this.loadAvailableLevels(),this.hideLoading(),this.createUI(),this.createLevelGrid(),O.scene("LevelSelect","Scene fully loaded",{availableLevels:this.availableLevels.length,currentPage:this.currentPage})}catch(e){O.error("LevelSelect","Failed to create scene",e),this.hideLoading(),this.showError(`Failed to load levels: ${e instanceof Error?e.message:"Unknown error"}`)}}async loadAvailableLevels(){try{console.log("🔍 Loading available levels..."),this.availableLevels=await this.levelService.listAvailableLevels(),console.log(`✅ Found ${this.availableLevels.length} levels:`,this.availableLevels),await this.preloadLevelMetadata(),console.log("✅ Level metadata preloaded")}catch(e){throw console.error("❌ Failed to load available levels:",e),e}}async preloadLevelMetadata(){const e=this.currentPage*this.LEVELS_PER_PAGE,t=Math.min(e+this.LEVELS_PER_PAGE,this.availableLevels.length),n=this.availableLevels.slice(e,t);try{(await this.levelService.loadLevels(n,{validateSchema:!1,includeMetadata:!0})).forEach(o=>{this.levelMetadata.set(o.id,o)})}catch(i){console.warn("Failed to preload some level metadata:",i)}}showLoading(){this.loadingText=this.add.text(this.scale.width/2,this.scale.height/2,"Loading levels...",{fontFamily:"Arial, sans-serif",fontSize:"24px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5)}hideLoading(){this.loadingText&&(this.loadingText.destroy(),this.loadingText=void 0)}showError(e){this.errorText=this.add.text(this.scale.width/2,this.scale.height/2,e,{fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#FF6B6B",fontStyle:"bold",wordWrap:{width:this.scale.width-100}}).setOrigin(.5),this.add.text(this.scale.width/2,this.scale.height/2+60,"Tap to retry",{fontFamily:"Arial, sans-serif",fontSize:"16px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.scene.restart())}createUI(){this.add.text(this.scale.width/2,50,"Select Level",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069",fontStyle:"bold"}).setOrigin(.5),this.progressManager.getPlayStats();const e=this.progressManager.getTotalStars(),t=this.progressManager.getTotalCoins();this.add.text(this.scale.width/2,90,`Levels: ${this.availableLevels.length} | Stars: ${e} | Coins: ${t}`,{fontFamily:"Arial, sans-serif",fontSize:"14px",color:"#8B7355"}).setOrigin(.5),this.currentPage>0&&this.add.text(50,this.scale.height/2,"◀",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.previousPage());const n=Math.floor(this.availableLevels.length/this.LEVELS_PER_PAGE);this.currentPage<n&&this.add.text(this.scale.width-50,this.scale.height/2,"▶",{fontFamily:"Arial, sans-serif",fontSize:"32px",color:"#7FB069"}).setOrigin(.5).setInteractive({useHandCursor:!0}).on("pointerup",()=>this.nextPage())}createLevelGrid(){const e=this.currentPage*this.LEVELS_PER_PAGE,t=Math.min(e+this.LEVELS_PER_PAGE,this.availableLevels.length),n=this.availableLevels.slice(e,t),i=5,o=60,a=70,l=(this.scale.width-(i-1)*a)/2,h=150;n.forEach((d,m)=>{const g=m%i,b=Math.floor(m/i),S=l+g*a,C=h+b*a;this.createLevelButton(d,S,C,o)})}createLevelButton(e,t,n,i){const o=this.progressManager.isLevelUnlocked(e),a=this.progressManager.getLevelStats(e),l=this.levelMetadata.get(e);let h=o?a!=null&&a.completed?8368233:16115411:13882323;if(l&&o){const g={easy:8368233,medium:16032353,hard:15167313,expert:10309341};h=a!=null&&a.completed?g[l.metadata.difficulty]:16115411}const d=this.add.circle(t,n,i/2,h).setStrokeStyle(3,o?7048794:11119017),m=this.getLevelDisplayText(e,l);if(this.add.text(t,n-8,m,{fontFamily:"Arial, sans-serif",fontSize:"12px",color:o?"#FFFFFF":"#808080",fontStyle:"bold"}).setOrigin(.5),l&&o&&this.add.text(t,n+8,l.metadata.difficulty.charAt(0).toUpperCase(),{fontFamily:"Arial, sans-serif",fontSize:"10px",color:o?"#FFFFFF":"#808080"}).setOrigin(.5),a!=null&&a.completed&&a.stars>0)for(let g=0;g<a.stars;g++)this.add.text(t-15+g*15,n+20,"★",{fontFamily:"Arial, sans-serif",fontSize:"10px",color:"#FFD700"}).setOrigin(.5);o&&d.setInteractive({useHandCursor:!0}).on("pointerup",()=>{O.click("LevelSelect",`Level button clicked: ${e}`,{levelId:e,position:{x:t,y:n},isCompleted:a==null?void 0:a.completed,stars:a==null?void 0:a.stars}),this.selectLevel(e)}).on("pointerover",()=>{O.touch("LevelSelect",`Level button hover: ${e}`,{levelId:e}),this.showLevelTooltip(e,t,n)}).on("pointerout",()=>{O.touch("LevelSelect",`Level button hover end: ${e}`,{levelId:e}),this.hideLevelTooltip()})}getLevelDisplayText(e,t){if(t!=null&&t.metadata.name)return t.metadata.name.length>8?t.metadata.name.substring(0,6)+"...":t.metadata.name;const n=e.match(/(\d+)/);return n?n[1]:e.length>6?e.substring(0,6):e}showLevelTooltip(e,t,n){const i=this.levelMetadata.get(e);if(!i)return;const o=`${i.metadata.name}
${i.metadata.difficulty} • ${i.metadata.estimatedTime}s`,a=this.add.rectangle(t,n-80,120,40,0,.8).setStrokeStyle(1,16777215),l=this.add.text(t,n-80,o,{fontFamily:"Arial, sans-serif",fontSize:"10px",color:"#FFFFFF",align:"center"}).setOrigin(.5);a.setData("isTooltip",!0),l.setData("isTooltip",!0)}hideLevelTooltip(){this.children.list.forEach(e=>{e.getData("isTooltip")&&e.destroy()})}async selectLevel(e){O.click("LevelSelect",`Level selected: ${e}`,{levelId:e,currentPage:this.currentPage,isUnlocked:this.progressManager.isLevelUnlocked(e),levelStats:this.progressManager.getLevelStats(e)});try{O.level("LevelSelect",`Loading level definition for ${e}`);const t=await this.levelService.loadLevel(e);O.level("LevelSelect",`Level loaded successfully: ${e}`,{levelName:t.metadata.name,difficulty:t.metadata.difficulty,generationType:t.generation.type}),this.registry.set("selectedLevelId",e),this.registry.set("selectedLevelDefinition",t),O.scene("LevelSelect","Starting Game scene",{levelId:e}),this.scene.start("Game")}catch(t){O.error("LevelSelect",`Failed to load level: ${e}`,t),console.error("Failed to load level:",t),this.showError(`Failed to load level: ${t instanceof Error?t.message:"Unknown error"}`)}}async previousPage(){this.currentPage>0&&(this.currentPage--,await this.refreshPage())}async nextPage(){const e=Math.floor(this.availableLevels.length/this.LEVELS_PER_PAGE);this.currentPage<e&&(this.currentPage++,await this.refreshPage())}async refreshPage(){this.children.removeAll(),this.showLoading();try{await this.preloadLevelMetadata(),this.hideLoading(),this.createUI(),this.createLevelGrid()}catch(e){this.hideLoading(),this.showError(`Failed to load page: ${e instanceof Error?e.message:"Unknown error"}`)}}}class bt{constructor(){this.isActive=!1,this.touchIndicators=[]}static getInstance(){return bt.instance||(bt.instance=new bt),bt.instance}activate(){this.isActive||(this.isActive=!0,O.info("TouchDebugger","Touch debugging activated"),document.addEventListener("click",this.handleClick.bind(this),!0),document.addEventListener("touchstart",this.handleTouchStart.bind(this),!0),document.addEventListener("touchmove",this.handleTouchMove.bind(this),!0),document.addEventListener("touchend",this.handleTouchEnd.bind(this),!0),document.addEventListener("pointerdown",this.handlePointerDown.bind(this),!0),document.addEventListener("pointerup",this.handlePointerUp.bind(this),!0),document.addEventListener("mousedown",this.handleMouseDown.bind(this),!0),document.addEventListener("mouseup",this.handleMouseUp.bind(this),!0))}deactivate(){this.isActive&&(this.isActive=!1,O.info("TouchDebugger","Touch debugging deactivated"),document.removeEventListener("click",this.handleClick.bind(this),!0),document.removeEventListener("touchstart",this.handleTouchStart.bind(this),!0),document.removeEventListener("touchmove",this.handleTouchMove.bind(this),!0),document.removeEventListener("touchend",this.handleTouchEnd.bind(this),!0),document.removeEventListener("pointerdown",this.handlePointerDown.bind(this),!0),document.removeEventListener("pointerup",this.handlePointerUp.bind(this),!0),document.removeEventListener("mousedown",this.handleMouseDown.bind(this),!0),document.removeEventListener("mouseup",this.handleMouseUp.bind(this),!0),this.clearTouchIndicators())}handleClick(e){var i;const t=e.target,n={x:e.clientX,y:e.clientY};O.click("DOM",`Click on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,textContent:(i=t.textContent)==null?void 0:i.substring(0,50),position:n,button:e.button,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,altKey:e.altKey},n),this.showTouchIndicator(n,"click")}handleTouchStart(e){const t=e.target;Array.from(e.touches).forEach((n,i)=>{var a;const o={x:n.clientX,y:n.clientY};O.touch("DOM",`Touch start ${i+1}/${e.touches.length} on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,textContent:(a=t.textContent)==null?void 0:a.substring(0,50),position:o,touchId:n.identifier,force:n.force,radiusX:n.radiusX,radiusY:n.radiusY},o),this.showTouchIndicator(o,"touchstart")})}handleTouchMove(e){if(Math.random()>.2)return;const t=e.target;Array.from(e.touches).forEach((n,i)=>{const o={x:n.clientX,y:n.clientY};O.touch("DOM",`Touch move ${i+1}/${e.touches.length}`,{tagName:t.tagName,position:o,touchId:n.identifier},o)})}handleTouchEnd(e){const t=e.target;Array.from(e.changedTouches).forEach((n,i)=>{const o={x:n.clientX,y:n.clientY};O.touch("DOM",`Touch end ${i+1} on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,position:o,touchId:n.identifier},o),this.showTouchIndicator(o,"touchend")})}handlePointerDown(e){const t=e.target,n={x:e.clientX,y:e.clientY};O.touch("DOM",`Pointer down (${e.pointerType}) on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,position:n,pointerId:e.pointerId,pointerType:e.pointerType,pressure:e.pressure,width:e.width,height:e.height},n)}handlePointerUp(e){const t=e.target,n={x:e.clientX,y:e.clientY};O.touch("DOM",`Pointer up (${e.pointerType}) on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,position:n,pointerId:e.pointerId,pointerType:e.pointerType},n)}handleMouseDown(e){const t=e.target,n={x:e.clientX,y:e.clientY};O.touch("DOM",`Mouse down on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,position:n,button:e.button},n)}handleMouseUp(e){const t=e.target,n={x:e.clientX,y:e.clientY};O.touch("DOM",`Mouse up on ${this.getElementDescription(t)}`,{tagName:t.tagName,className:t.className,id:t.id,position:n,button:e.button},n)}getElementDescription(e){let t=e.tagName.toLowerCase();if(e.id&&(t+=`#${e.id}`),e.className){const n=e.className.split(" ").filter(i=>i.trim()).slice(0,2);n.length>0&&(t+=`.${n.join(".")}`)}if(e.textContent&&e.textContent.trim()){const n=e.textContent.trim().substring(0,20);t+=` "${n}${e.textContent.length>20?"...":""}"`}return t}showTouchIndicator(e,t){const n=document.createElement("div"),i={click:"#00ff00",touchstart:"#00ffff",touchend:"#ff00ff",default:"#ffff00"},o=i[t]||i.default;if(n.style.cssText=`
      position: fixed;
      left: ${e.x-10}px;
      top: ${e.y-10}px;
      width: 20px;
      height: 20px;
      border: 2px solid ${o};
      border-radius: 50%;
      background: ${o}33;
      z-index: 9999;
      pointer-events: none;
      animation: touchIndicator 1s ease-out forwards;
    `,!document.getElementById("touch-indicator-styles")){const a=document.createElement("style");a.id="touch-indicator-styles",a.textContent=`
        @keyframes touchIndicator {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `,document.head.appendChild(a)}document.body.appendChild(n),this.touchIndicators.push(n),setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n);const a=this.touchIndicators.indexOf(n);a>-1&&this.touchIndicators.splice(a,1)},1e3)}clearTouchIndicators(){this.touchIndicators.forEach(e=>{e.parentNode&&e.parentNode.removeChild(e)}),this.touchIndicators=[]}}const ti=bt.getInstance(),on=class on{static initialize(){on.initialized||(on.initialized=!0,O.info("Debug","Initializing debug system"),ti.activate(),O.info("App","Application starting",{userAgent:navigator.userAgent,platform:navigator.platform,language:navigator.language,screenSize:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight},windowSize:{width:window.innerWidth,height:window.innerHeight},devicePixelRatio:window.devicePixelRatio,timestamp:new Date().toISOString()}),window.Capacitor&&O.info("Capacitor","Capacitor detected",{platform:window.Capacitor.getPlatform(),isNativePlatform:window.Capacitor.isNativePlatform(),plugins:Object.keys(window.Capacitor.Plugins||{})}),window.Phaser&&O.info("Phaser","Phaser detected",{version:window.Phaser.VERSION}),window.addEventListener("resize",()=>{O.info("Window","Window resized",{newSize:{width:window.innerWidth,height:window.innerHeight}})}),window.addEventListener("orientationchange",()=>{var e,t;O.info("Device","Orientation changed",{orientation:((e=screen.orientation)==null?void 0:e.angle)||"unknown",type:((t=screen.orientation)==null?void 0:t.type)||"unknown"})}),document.addEventListener("visibilitychange",()=>{O.info("App",`App ${document.hidden?"backgrounded":"foregrounded"}`,{hidden:document.hidden,visibilityState:document.visibilityState})}),window.addEventListener("load",()=>{O.info("App","Page fully loaded")}),window.addEventListener("beforeunload",()=>{O.info("App","Page unloading")}),window.debugCommands={showDebug:()=>O.show(),hideDebug:()=>O.hide(),toggleDebug:()=>O.toggle(),clearDebug:()=>O.clear(),exportLogs:()=>{const e=O.exportLogs();return console.log("Exported logs:",e),e},enableTouchDebug:()=>ti.activate(),disableTouchDebug:()=>ti.deactivate(),logTest:()=>{O.info("Test","Test log message",{test:!0}),O.click("Test","Test click",{x:100,y:100},{x:100,y:100}),O.error("Test","Test error",new Error("Test error"))}},O.info("Debug","Debug system initialized successfully",{touchDebugging:!0,globalCommands:Object.keys(window.debugCommands)}))}static logPhaserEvent(e,t,n){O.game("Phaser",`${e}: ${t}`,n)}static logCapacitorEvent(e,t,n){O.info("Capacitor",`${e}.${t}`,n)}static logLevelEvent(e,t,n){O.level("Level",`${e}: ${t}`,n)}static logUserAction(e,t,n){O.click("User",e,t,n)}};on.initialized=!1;let _i=on;_i.initialize();op();const fp=360,mp=640,pp={type:ee.AUTO,parent:"app",backgroundColor:"#0f0f12",scale:{mode:ee.Scale.FIT,autoCenter:ee.Scale.CENTER_BOTH,width:fp,height:mp},physics:{default:"arcade",arcade:{gravity:{y:0},debug:!1}},scene:[hp,dp,up]};new ee.Game(pp);
