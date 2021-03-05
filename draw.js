var r = globalParams.simulationSpeed;
var mouseDownPos = {x:0, y:2000};
var mousePos = {x:0, y:0}
var running = false;
var loadCount = 4;
var createTargetMode = false;

var rx = 1; //canvas zoom scale x
var ry = 1; //canvas zoom scale y

function initCanvas()
{
    const onLoad = () => {--loadCount; if(loadCount === 0){afterImageLoad()}}
    bulletImg = new Image(); bulletImg.src = "assets/bullet.png"; bulletImg.onload = onLoad()
    targetImg = new Image(); targetImg.src = "assets/target.png"; targetImg.onload = onLoad()
    launcherImg = new Image(); launcherImg.src = "assets/launcher.png"; launcherImg.onload = onLoad()
    dotImg = new Image(); dotImg.src = "assets/dot.png"; dotImg.onload = onLoad()
}


function afterImageLoad()
{
    canvas = document.getElementById("main-canvas");
    nbcanvas = document.getElementById("nb-canvas");
    bgcanvas = document.getElementById("bg-canvas");
    fgoverlay = document.getElementById("fg-overlay");
    e_gravitySlider = document.getElementById("gravity-slider");
    e_simSpeedSlider = document.getElementById("sim-speed-slider");
    e_toggleButton = document.getElementById("toggle-simulation");
    
    nbctx = nbcanvas.getContext("2d");
    bgctx = bgcanvas.getContext("2d");
    ctx = canvas.getContext("2d");

    
    rx = canvas.width/canvas.offsetWidth; 
    ry= canvas.height/canvas.offsetHeight; 

    canvas.addEventListener("mousedown", e => {
        rx = canvas.width/canvas.offsetWidth; 
        ry= canvas.height/canvas.offsetHeight; 
        mouseDownPos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
        if(!createTargetMode) {onMouseClick();} 
    })

        
    canvas.addEventListener("mousemove", e=> {
        mousePos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
    });

    bgctx.beginPath(); // draw launchers
    launcherList.forEach(e => {
        bgctx.drawImage(launcherImg, e.pos.x - .5*launcherImg.width, canvas.height-e.pos.y - .5*launcherImg.height)
    });
}

function onMouseClick()
{
    createTargetMode = true;
    nbctx.drawImage(targetImg, mouseDownPos.x - .5*targetImg.width, canvas.height - mouseDownPos.y - .5*targetImg.height);
    canvas.addEventListener("mouseup", createNewTarget);
    
    targetGizmosID = setInterval("drawTargetGizmos()", 1000/globalParams.FPS);
}

function createNewTarget(e)
{
    
    rx = canvas.width/canvas.offsetWidth; 
    ry = canvas.height/canvas.offsetHeight; 
    T = new Target(JSON.parse(JSON.stringify(mouseDownPos)), {x: 0.05*(- e.offsetX*rx + mouseDownPos.x), y: 0.05*(-canvas.height + e.offsetY*ry + mouseDownPos.y)} );
    targetList.push(T);

    createTargetMode = false;
    nbctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height); //clear creator layer
    ctx.drawImage(targetImg, T.pos.x -.5*targetImg.width, canvas.height-T.pos.y -.5*targetImg.height);
    
    clearInterval(targetGizmosID);

    canvas.removeEventListener("mouseup", createNewTarget);
    console.log(T.velocity)


    //mouseDownPos = {x: e.offsetX*rx, y: (canvas.offsetHeight - e.offsetY)*ry};
}

function drawTargetGizmos()
{
    nbctx.clearRect(0, 0, nbcanvas.width, nbcanvas.height)
    nbctx.drawImage(targetImg, mouseDownPos.x - .5*targetImg.width, canvas.height - mouseDownPos.y - .5*targetImg.height);
    let newDotX = mouseDownPos.x;
    let newDotY = mouseDownPos.y;
    let lengthX = mouseDownPos.x - mousePos.x;
    let lengthY = mouseDownPos.y - mousePos.y;
    for(let i=1; i<=9; i++)
        {
            newDotX -= lengthX * 0.1;
            newDotY -= lengthY * 0.1;
            nbctx.drawImage(dotImg, newDotX - .5*dotImg.width, canvas.height - newDotY - .5*dotImg.height);
            
        }
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
    
    else {stopCanvas();e_toggleButton.innerHTML = "Start";
        e_toggleButton.classList.remove("bg-danger");
        e_toggleButton.classList.add("bg-primary");}
}


function resumeCanvas()
{
    mainLoopID = setInterval("updateCanvas()", 1000/globalParams.FPS);
    cleanupID = setInterval("cleanup()", 5000/globalParams.FPS);
    scheduleID = setInterval("fireOnSchedule()", 1000 /(globalParams.simulationSpeed * globalParams.fireRate));
}


function stopCanvas()
{
    clearInterval(mainLoopID);
    clearInterval(cleanupID);
    clearInterval(scheduleID);
}


function fireOnSchedule()
{
    if(r > 0)
    {
        let L = launcherList[0];
        if(L.targetInactive){L.target = targetList[targetList.length - 1]}
        L.Fire(omnidirectional = false);
    }
    
    if(bulletList.length > 200)
    {
        bulletList.shift();
    }

    
    
}
function updateCanvas()
{
    globalParams.simulationSpeed = e_simSpeedSlider.value;
    r = globalParams.simulationSpeed;
    globalParams.gravity = -e_gravitySlider.value;
    applyPhysics();
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.beginPath(); // draw bullets

    bulletList.forEach(e => {
        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;
        ctx.moveTo(e.pos.x, canvas.height - e.pos.y);

        
        ctx.drawImage(bulletImg, e.pos.x - .5*bulletImg.width, canvas.height-e.pos.y - .5*bulletImg.height);
    });

    ctx.beginPath(); // draw target
    targetList.forEach(e => {

        e.pos.x += e.velocity.x * r;
        e.pos.y += e.velocity.y * r;

        
        ctx.drawImage(targetImg, e.pos.x -.5*targetImg.width, canvas.height-e.pos.y -.5*targetImg.height);
        

    })
    
}

function applyPhysics()
{
bulletList.forEach(e => {
    e.velocity.y += globalParams.gravity * r;
})
targetList.forEach(e => {
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
    for(let i=0; i<bulletList.length; i++)
    {
        e = bulletList[i];
        if(e.pos.x < 0 || e.pos.x > canvas.length || e.pos.y > canvas.height || e.pos.y < 0)
        {
            bulletList.splice(i, 1);
        }
        
    };

    if(targetList.length > globalParams.maximumTargets)
    {
        targetList.shift();
    }
    


}
