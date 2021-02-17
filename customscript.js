//add id to launcher object => children[id]
//no, slider for velocity, fire rate

//1
var doSimulation = true;
var launcherCreationMode = false;
var targetCreationMode = false;
var velocitySetMode = false;
var launcherID = 0;
function toggleSimulation()
{
    doSimulation = !doSimulation
    if(doSimulation)
    {
        timerID = setInterval("updateCanvas()", 1000/globalParams.FPS);

        managerID = setInterval("bulletManager()", 5000/globalParams.FPS);

        scheduleID = setInterval("fireOnSchedule()", 1000/(globalParams.FPS * globalParams.fireRate));
    }
    else
    {
        clearInterval(timerID);
        clearInterval(managerID);
        clearInterval(scheduleID);
    }
    
}



var currentLauncherID;

var e_LauncherListParent= document.getElementById('launcher-list-parent');

//e_addLauncher.onclick(e=>{
//    if(launcherTable.addLauncher})

//function canvasClick(e)
//{
//    
//    mouseDownPos = {x: e.offsetX, y: canvas.height - e.offsetY};
    if(launcherCreationMode){
        addLauncher();
        launcherCreationMode = false;
    }
        lastLauncher.pos = mouseDownPos;
    resetCanvas()});
}

function setLauncherCreateMode()
{
    launcherCreationMode = !launcherCreationMode
    if(launcherCreationMode)
    {
        e_fgOverlay.style.visible = true;
        
    }
    else
    {
        e_fgOverlay.style.visible = false;
    }
}


function addLauncher()
{
    
    newLauncher = Launcher((mouseDownPos.x, mouseDownPos.y), 10, targetList[0], launcherID);

    e_LauncherListParent.insertAdjacentHTML('beforeend', `<tr id='l-`+launcherID+`>...</tr>`)}; //change to node
    
    //add event listeners
        
    launcherID += 1;
    launcherList.append(newLauncher);
}

function addTarget() //when clicked
    let position = {x: mouseDownPos.x, y: mouseDownPos.y}
    if(!velocitySetMode)
    {
      velocitySetMode = true;
      return;
    }
    else //when clicked again
    {
        velocitySetMode = false;
        let newTarget = Target(position, velocity)
        TargetList.Push(newTarget);
    }
    velocitySetMode
    
    