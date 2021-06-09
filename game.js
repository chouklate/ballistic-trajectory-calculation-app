var globalParams =
{
    gravity: -1.2,
    FPS : 30, //defines the amount of updates ({FPS} times) per second

    simulationSpeed: .5, //defines the 'unit time' for physics calculations as 1 / {simulationSpeed} seconds

    maximumTargets: 15, //defines the maximum number of targets drawn on the screen before they are deleted

    fireRate: 10, //fires {fireRate} times per unit time

}


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
            console.log(loadCounter);
            if(loadCounter === 0){onImageLoad()}
        }
    }
}

var assets =
{
    missile_launcher: new Asset("assets/missile_launcher.png"),
    missile: new Asset("assets/missile.png"),
    bullet_launcher: new Asset("assets/bullet_launcher.png"),
    bullet: new Asset("assets/bullet.png"),
    trace: new Asset("assets/trace.png")
}



class GameObject 
{
    constructor(pos = {x: 0, y: 0}, sprite = null)
    {
        this.pos = pos;
        this.sprite = sprite;
    }
}


class BulletLauncher extends GameObject
{
    constructor(pos, launchVelocity, target)
    {
        super(pos, assets.bullet_launcher);
        this.launchVelocity = launchVelocity;
        this.target = target;
        this.targetActive = true;
    }

    
    TransformPoint(targetPos) // converts coords into local space
    {
        return {x: targetPos.x - this.pos.x, y: targetPos.y - this.pos.y}
    }

    RapidFire()
    {
        this.targetActive = true;
        let Tlocal = this.TransformPoint(this.target.pos);
        if(Tlocal.y <= 0)
        { 
            this.targetActive = false; 
            return; 
        }


        //Physics calculations
        let r = Tlocal.y/Tlocal.x;
        let a = (-r*this.target.velocity.x + this.target.velocity.y) / this.launchVelocity;
        let cos = Tlocal.x > 0 ? (-a*r + Math.sqrt(r**2-a**2+1))/(r**2+1) : (-a*r - Math.sqrt(r**2-a**2+1))/(r**2+1)
        let sin = Tlocal.y > 0 ? (Math.sqrt(1-cos**2)) : -(Math.sqrt(1-cos**2))

        activeObjects.bullet.push(new Bullet(Object.create(this.pos), {x: this.launchVelocity * cos, y: this.launchVelocity * sin}));
        
        this.lastLaunchAngle = Math.acos(cos);
    }

    FocusedFire()
    {
        this.targetActive = true;
        let Tlocal = this.TransformPoint(this.target.pos);
        if(Tlocal.y <= 0)
        { 
            this.targetActive = false; 
            return; 
        }

        //Physics calculations
        //tba
    }
}


class Missile extends GameObject{
    constructor(pos, velocity = {x: 0, y: 0})
    {
        super(pos);
        this.velocity = velocity;
    }


};

class Bullet extends GameObject{
    constructor(pos, velocity = {x: 0, y: 0})
    {
        super(pos);
        this.velocity = velocity;
    }
}

var activeObjects = {
    bulletLauncher: [new BulletLauncher({x:100, y:100}, 70, null)],
    bullet: [],
    missile: [new Missile({x:0, y:2000}, {x:30, y:10})]
}

activeObjects.bulletLauncher[0].target = activeObjects.missile[0];

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
    console.log("returned!");
    canvas = document.getElementById("main-canvas");
    nbcanvas = document.getElementById("nb-canvas");
    bgcanvas = document.getElementById("bg-canvas");
    e_gravitySlider = document.getElementById("gravity-slider");
    e_simSpeedSlider = document.getElementById("sim-speed-slider");
    e_toggleButton = document.getElementById("toggle-simulation");
    e_launcherOutput = document.getElementById("launcher-data");

    nbcanvas.ctx = nbcanvas.getContext("2d");
    bgcanvas.ctx = bgcanvas.getContext("2d");
    canvas.ctx = canvas.getContext("2d");

    updateCanvasDimensions();

    canvas.addEventListener("mousedown", e => {
        updateCanvasDimensions();
        lastMouseDownPos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
        if(!createTargetMode) {onMouseClick();} 
    })

        
    document.addEventListener("mousemove", e=> {
        mousePos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
    });

    // draw background
    
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    nbcanvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgcanvas.ctx.beginPath(); 
    activeObjects.bulletLauncher.forEach(e => {
        bgcanvas.ctx.drawImage(assets.bullet_launcher.img, e.pos.x - .5*assets.bullet_launcher.img.width, canvas.height-e.pos.y - .5*assets.bullet_launcher.img.height)
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


    ctx.beginPath(); // draw bullets

    activeObjects.bullet.forEach(e => {
        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;
        ctx.moveTo(e.pos.x, canvas.height - e.pos.y);

        
        ctx.drawImage(assets.bullet.img, e.pos.x - .5*assets.bullet.img.width, canvas.height-e.pos.y - .5*assets.bullet.img.height);
    });

    ctx.beginPath(); // draw target

    activeObjects.missile.forEach(e => {

        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;

        
        ctx.drawImage(assets.missile.img, e.pos.x -.5*assets.missile.img.width, canvas.height-e.pos.y -.5*assets.missile.img.height);
        

    })
    
}

function updateLauncherData() //currently designed for single output
{
    let a = activeObjects.bulletLauncher[0].lastLaunchAngle;
    if(a != null){e_launcherOutput.innerHTML = Math.round((a*(180/Math.PI) + Number.EPSILON) * 100) / 100;}
}

function applyPhysics()
{
    //update bullets
    activeObjects.bullet.forEach(e => {
    e.velocity.y += globalParams.gravity * r;
    })

    //update targets
    activeObjects.missile.forEach(e => {
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
    for(let i=0; i<activeObjects.bullet.length; i++)
    {
        e = activeObjects.bullet[i];
        if(e.pos.x < 0 || e.pos.x > canvas.length || e.pos.y > canvas.height || e.pos.y < 0)
        {
            activeObjects.bullet.splice(i, 1);
        }
        
    };

    

    //remove targets if there are too many
    if(activeObjects.missile.length > globalParams.maximumTargets)
    {
        activeObjects.missile.splice(0,activeObjects.missile.length - globalParams.maximumTargets);
    }
    


}



function onMouseClick()
{
    createTargetMode = true;
    nbcanvas.ctx.drawImage(assets.missile.img, lastMouseDownPos.x - .5*assets.missile.img.width, canvas.height - lastMouseDownPos.y - .5*assets.missile.img.height);
    canvas.addEventListener("mouseup", createNewTarget);
    
    targetTraceID = setInterval("drawTargetTrace()", 1000/globalParams.FPS);
}

function createNewTarget(e)
{
    updateCanvasDimensions();
    T = new Missile(JSON.parse(JSON.stringify(lastMouseDownPos)), {x: 0.05*(- e.offsetX*rx + lastMouseDownPos.x), y: 0.05*(-canvas.height + e.offsetY*ry + lastMouseDownPos.y)} );
    activeObjects.missile.push(T);

    createTargetMode = false;
    nbcanvas.ctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height); //clear creator layer
    canvas.ctx.drawImage(assets.missile.img, T.pos.x -.5*assets.missile.img.width, canvas.height-T.pos.y -.5*assets.missile.img.height);
    
    clearInterval(targetTraceID);

    canvas.removeEventListener("mouseup", createNewTarget);
    console.log(T.velocity)

}

function drawTargetTrace()
{
    nbcanvas.ctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height)
    nbcanvas.ctx.drawImage(assets.missile.img, lastMouseDownPos.x - .5*assets.missile.img.width, canvas.height - lastMouseDownPos.y - .5*assets.missile.img.height);
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
        let L = activeObjects.bulletLauncher[0];
        if(true){L.target = activeObjects.missile[activeObjects.missile.length - 1]}
        L.RapidFire(omnidirectional = false);
    }
    
    if(activeObjects.bullet.length > 200)
    {
        activeObjects.bullet.shift();
    }

        if(running)
        {
            fireID = setTimeout("fireOnSchedule()", 1000 /(globalParams.simulationSpeed * globalParams.fireRate));
        }
    
    
}
