var r = globalParams.simulationSpeed;

var i = 0;

var mouseDownPos = {x:0, y:2000};


function initCanvas()
{
    

    bulletImg = new Image();
    bulletImg.src = "bullet.png";

    bulletImg.onload = e =>
    {
        targetImg = new Image();
        targetImg.src = "target.png";

        targetImg.onload = e =>
        {
            launcherImg = new Image();
            launcherImg.src = "launcher.png"
            launcherImg.onload = e =>
            {
                canvas = document.getElementById("main-canvas");
                bgcanvas = document.getElementById("bg-canvas");
                fgoverlay = document.getElementById("fg-overlay")
                e_gravitySlider = document.getElementById("gravity-slider");
                e_simSpeedSlider = document.getElementById("sim-speed-slider")
                bgctx = bgcanvas.getContext("2d");
                ctx = canvas.getContext("2d");
                canvas.addEventListener("mousedown", canvasClick(e))
                
                document.addEventListener("keydown", e => {
                    e.preventDefault();
                    if(e.key == "a") {targetList[0].velocity.x -= 5}
                    if(e.key == "d") {targetList[0].velocity.x += 5}
                    if(e.key == "w") {targetList[0].velocity.y += 9}
                    if(e.key == "s") {targetList[0].velocity.y -= 5}
                    console.log(targetList[0].velocity.x)

                });


                bgctx.beginPath(); // draw launchers
                launcherList.forEach(e => {
                    bgctx.drawImage(launcherImg, e.pos.x - .5*launcherImg.width, canvas.height-e.pos.y - .5*launcherImg.height)
                });

                timerID = setInterval("updateCanvas()", 1000/globalParams.FPS);

                managerID = setInterval("bulletManager()", 5000/globalParams.FPS);

                scheduleID = setInterval("fireOnSchedule()", 1000/globalParams.fireRate);
                
                fixedUpdateID = 
            }
        }
    }
}

function fireOnSchedule() //debug
{
    launcherList[3].Fire(omnidirectional = false)
    //i++;
    
}
function updateCanvas()
{
    globalParams.simulationSpeed = e_simSpeedSlider.value;
    r = globalParams.simulationSpeed
    globalParams.gravity = e_gravitySlider.value;
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
        
        if(launcherCreationMode)
        {
            ctx.drawImage(targetAlphaImg, mousepos.x, mousepos.y )
        }
        
        if(velocitySetMode)
        {
            //get mouse delta
            //blip size
            //draw arrow
        }
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
function bulletManager()
{
    for(let i=0; i<bulletList.length; i++)
    {
        e = bulletList[i]
        if(e.pos.x < 0 || e.pos.x > canvas.length || e.pos.y > canvas.height || e.pos.y < 0)
        {
            bulletList.splice(i, 1);
        }
        
    };
    


}

function resetCanvas()
{
    //debug only for now
    targetList[0].pos = mouseDownPos;
    targetList[0].velocity.y = 0;
}