class Asset{ // class representing image assets
    constructor(src)
    {
        this.src = src;
    }

    Initiate()
    {
        let I = new Image();
        I.src = this.src;
        this.img = I;
        I.onload = () => {
            loadCounter--;
            if(loadCounter === 0){onImageLoad()}
        }
    }
}



class GameObject 
{
    constructor(pos = {x: 0, y: 0}, sprite = null)
    {
        this.pos = pos;
        this.sprite = sprite;
    }
}


class RocketLauncher extends GameObject
{
    constructor(pos, launchVelocity, target)
    {
        super(pos, assets.rocket_launcher);
        this.launchVelocity = launchVelocity;
        this.target = target;
        this.targetActive = true;
    }

    lastLaunchAngle = 0;
    
    TransformPoint(targetPos) // converts coords into local space
    {
        return {x: targetPos.x - this.pos.x, y: targetPos.y - this.pos.y}
    }

    RapidFire()
    {
        this.targetActive = true;
        let Tlocal = this.TransformPoint(this.target.pos);
        if(this.target.pos.y <= 0)
        { 
            this.targetActive = false; 
            return; 
        }


        //Physics calculations
        let r = Tlocal.y/Tlocal.x;
        let a = (-r*this.target.velocity.x + this.target.velocity.y) / this.launchVelocity;
        let cos = Tlocal.x > 0 ? (-a*r + Math.sqrt(r**2-a**2+1))/(r**2+1) : (-a*r - Math.sqrt(r**2-a**2+1))/(r**2+1)
        let sin = Tlocal.y > 0 ? (Math.sqrt(1-cos**2)) : -(Math.sqrt(1-cos**2))
        //let sin = -(Math.sqrt(1-cos**2))

        activeObjects.rocket.push(new Rocket(Object.create(this.pos), {x: this.launchVelocity * cos, y: this.launchVelocity * sin}));
        
        this.lastLaunchAngle = Math.acos(cos);
    }
}


class Target extends GameObject{
    constructor(pos, velocity = {x: 0, y: 0})
    {
        super(pos);
        this.velocity = velocity;
    }


};

class Rocket extends GameObject{
    constructor(pos, velocity = {x: 0, y: 0})
    {
        super(pos);
        this.velocity = velocity;
    }
}

var globalParams =
{
    gravity: -1.2,
    FPS : 30, //defines the amount of updates ({FPS} times) per second

    simulationSpeed: .5, //defines the 'unit time' for physics calculations as 1 / {simulationSpeed} seconds

    maximumTargets: 15, //defines the maximum number of targets drawn on the screen before they are deleted

    fireRate: 10, //fires {fireRate} times per unit time

}



var assets =
{
    target: new Asset("assets/missile.png"),
    rocket_launcher: new Asset("assets/bullet_launcher.png"),
    rocket: new Asset("assets/bullet.png"),
    trace: new Asset("assets/trace.png")
}



var activeObjects = {
    rocketLauncher: [new RocketLauncher({x:100, y:100}, 70, null)],
    rocket: [],
    target: [new Target({x:0, y:2000}, {x:30, y:10})]
}

activeObjects.rocketLauncher[0].target = activeObjects.target[0];

var running = false;
var createTargetMode = false;

var r = globalParams.simulationSpeed;
var lastMouseDownPos = {x:0, y:2000};
var mousePos = {x:0, y:0}

var loadCounter = 0;

//var rx = 1; canvas zoom scale x
//var ry = 1; //canvas zoom scale y





// Actual game code

function updateCanvasDimensions()
{
    rx = canvas.width/canvas.offsetWidth; 
    ry= canvas.height/canvas.offsetHeight; 
}


function initCanvas()
{
    let keys = Object.keys(assets);
    loadCounter = keys.length;
    keys.forEach(e => assets[e].Initiate());
}


function onImageLoad()
{
    canvas = document.getElementById("main-canvas");
    nbcanvas = document.getElementById("nb-canvas");
    bgcanvas = document.getElementById("bg-canvas");
    e_gravitySlider = document.getElementById("gravity-slider");
    e_simSpeedSlider = document.getElementById("sim-speed-slider");
    e_toggleButton = document.getElementById("toggle-simulation");
    e_launchVelocitySlider = document.getElementById("launch-velocity-change-slider");
    e_launcherOutput = document.getElementById("launcher-data");
    e_launchVelocityOutput = document.getElementById("launcher-velocity");

    nbcanvas.ctx = nbcanvas.getContext("2d");
    bgcanvas.ctx = bgcanvas.getContext("2d");
    canvas.ctx = canvas.getContext("2d");

    updateCanvasDimensions();

    canvas.addEventListener("mousedown", e => {
        updateCanvasDimensions();
        lastMouseDownPos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
        if(!createTargetMode) {onMouseClick();} 
    })



    // draw background
    
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    nbcanvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgcanvas.ctx.beginPath(); 
    activeObjects.rocketLauncher.forEach(e => {
        bgcanvas.ctx.drawImage(assets.rocket_launcher.img, e.pos.x - .5*assets.rocket_launcher.img.width, canvas.height-e.pos.y - .5*assets.rocket_launcher.img.height)
    });
}


function toggleSimulation()
{
    running = !running;
    if(running)
    {
        resumeCanvas();
        e_toggleButton.innerHTML = "Stop";
        e_toggleButton.classList.remove("bg-primary");
        e_toggleButton.classList.add("bg-danger");
    }
    
    else {
        stopCanvas();
        e_toggleButton.innerHTML = "Start";
        e_toggleButton.classList.remove("bg-danger");
        e_toggleButton.classList.add("bg-primary");}
}


function resumeCanvas()
{
    mainLoopID = setInterval("update()", 1000/globalParams.FPS);
    cleanupID = setInterval("cleanup()", 2000/globalParams.FPS);
    fireID = setTimeout("fireOnSchedule()", 1000 /(globalParams.simulationSpeed * globalParams.fireRate));
}


function stopCanvas()
{
    clearInterval(mainLoopID);
    clearInterval(cleanupID);
}


function update()
{
    updateLauncherData();
    ctx = canvas.ctx;
    globalParams.simulationSpeed = e_simSpeedSlider.value;
    r = globalParams.simulationSpeed;
    globalParams.gravity = - e_gravitySlider.value;
    applyPhysics();
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.beginPath(); // draw rockets

    activeObjects.rocket.forEach(e => {
        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;
        ctx.moveTo(e.pos.x, canvas.height - e.pos.y);

        
        ctx.drawImage(assets.rocket.img, e.pos.x - .5*assets.rocket.img.width, canvas.height-e.pos.y - .5*assets.rocket.img.height);
    });

    ctx.beginPath(); // draw target

    activeObjects.target.forEach(e => {

        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;

        
        ctx.drawImage(assets.target.img, e.pos.x -.5*assets.target.img.width, canvas.height-e.pos.y -.5*assets.target.img.height);
        

    })
    
}

function updateLauncherData() //currently designed for single output
{
    let R = activeObjects.rocketLauncher[0];
    let a = R.lastLaunchAngle;
    if(a != null){e_launcherOutput.innerHTML = Math.round((a*(180/Math.PI) + Number.EPSILON) * 100) / 100;}
    R.launchVelocity = e_launchVelocitySlider.value;
    e_launchVelocityOutput.innerHTML = e_launchVelocitySlider.value
}

function applyPhysics()
{
    //update rockets
    activeObjects.rocket.forEach(e => {
    e.velocity.y += globalParams.gravity * r;
    })

    //update targets
    activeObjects.target.forEach(e => {
        if(e.pos.y <= 0)
        {
            e.pos.y = 0;
            e.velocity.x = 0;
            e.velocity.y = 0;
        }
        else
        {
        e.velocity.y += globalParams.gravity * r;
        }
    })
}


function cleanup()
{
    for(let i=0; i<activeObjects.rocket.length; i++)
    {
        e = activeObjects.rocket[i];
        if(e.pos.x < 0 || e.pos.x > canvas.length || e.pos.y > canvas.height || e.pos.y < 0)
        {
            activeObjects.rocket.splice(i, 1);
        }
        
    };

    

    //remove targets if there are too many
    if(activeObjects.target.length > globalParams.maximumTargets)
    {
        activeObjects.target.splice(0,activeObjects.target.length - globalParams.maximumTargets);
    }
    


}



function onMouseClick()
{
            
    document.addEventListener("mousemove", onMouseMove);

    createTargetMode = true;
    nbcanvas.ctx.drawImage(assets.target.img, lastMouseDownPos.x - .5*assets.target.img.width, canvas.height - lastMouseDownPos.y - .5*assets.target.img.height);
    document.addEventListener("mouseup", createNewTarget);
    
    targetTraceID = setInterval("drawTargetTrace()", 1000/globalParams.FPS);
}

function onMouseMove(e){
    e.preventDefault();
    mousePos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
}
function createNewTarget(e)
{
    updateCanvasDimensions();
    T = new Target(JSON.parse(JSON.stringify(lastMouseDownPos)), {x: 0.05*(- e.offsetX*rx + lastMouseDownPos.x), y: 0.05*(-canvas.height + e.offsetY*ry + lastMouseDownPos.y)} );
    activeObjects.target.push(T);

    createTargetMode = false;
    nbcanvas.ctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height); //clear creator layer
    canvas.ctx.drawImage(assets.target.img, T.pos.x -.5*assets.target.img.width, canvas.height-T.pos.y -.5*assets.target.img.height);
    
    clearInterval(targetTraceID);

    document.removeEventListener("mouseup", createNewTarget);
    document.removeEventListener("mousemove", onMouseMove);


}

function drawTargetTrace()
{
    nbcanvas.ctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height)
    nbcanvas.ctx.drawImage(assets.target.img, lastMouseDownPos.x - .5*assets.target.img.width, canvas.height - lastMouseDownPos.y - .5*assets.target.img.height);
    let newDotX = lastMouseDownPos.x;
    let newDotY = lastMouseDownPos.y;
    let lengthX = lastMouseDownPos.x - mousePos.x;
    let lengthY = lastMouseDownPos.y - mousePos.y;
    for(let i=1; i<=9; i++)
        {
            newDotX -= lengthX * 0.1;
            newDotY -= lengthY * 0.1;
            nbcanvas.ctx.drawImage(assets.trace.img, newDotX - .5*assets.trace.img.width, canvas.height - newDotY - .5*assets.trace.img.height);
            
        }
}




function fireOnSchedule()
{
    if(r > 0)
    {
        let L = activeObjects.rocketLauncher[0];
        if(true){L.target = activeObjects.target[activeObjects.target.length - 1]}
        L.RapidFire();
    }
    
    if(activeObjects.rocket.length > 200)
    {
        activeObjects.rocket.shift();
    }

        if(running)
        {
            fireID = setTimeout("fireOnSchedule()", 1000 /(globalParams.simulationSpeed * globalParams.fireRate));
        }
    
    
}