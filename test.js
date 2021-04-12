class MissileLauncher extends GameObject
{
	constructor(pos, launchVelocity){
        super(pos);
        this.launchVelocity = launchVelocity;
	}

	Fire(initVelocity){ // {x, y}
	ActiveObjects.missile.push(new Target(JSON.parse(JSON.stringify(self.pos))), initVelocity);
    }
  
  canvas.AddEventListener("click", e =>{
    if(// click location overlaps any in ActiveObjects.MissileLauncher)
      {
        gameMode = "missileLauncherSet";
        MissileLauncherSet(id); //no in list.
     ...
      }}

 function MissileLauncherSet(id){
      ActiveObjects.missile[id].Fire({x: -200, y: 100})
 }
