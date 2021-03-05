class GameObject 
{
    constructor(pos = {x: 0, y: 0})
    {
        this.pos = pos;
    }
}

class Launcher extends GameObject
{
    constructor(pos, launchVelocity, target, ID)
    {
        super(pos);
        this.launchVelocity = launchVelocity;
        this.target = target;
        this.ID = ID;
        this.targetInactive = false;
    }

    TransformPoint(targetPos) // converts coords into local space
    {
        return {x: targetPos.x - this.pos.x, y: targetPos.y - this.pos.y}
    }

    Fire(omnidirectional = false)
    {
        this.targetInactive = false;
        let Tlocal = this.TransformPoint(this.target.pos);
        if(!omnidirectional && Tlocal.y <= 0) 
        { 
            this.targetInactive = true; 
            return; 
        }

        let r = Tlocal.y/Tlocal.x;
        let a = (-r*this.target.velocity.x + this.target.velocity.y) / this.launchVelocity; //a = s-rc
        let cos = Tlocal.x > 0 ? (-a*r + Math.sqrt(r**2-a**2+1))/(r**2+1) : (-a*r - Math.sqrt(r**2-a**2+1))/(r**2+1)
        let sin = Tlocal.y > 0 ? (Math.sqrt(1-cos**2)) : -(Math.sqrt(1-cos**2))
        bulletList.push(new Bullet(Object.create(this.pos), {x: this.launchVelocity * cos, y: this.launchVelocity * sin}));
    }

}

class Target extends GameObject{
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

var globalParams =
{
    gravity: -1.2,
    FPS : 30,
    simulationSpeed: .5, // physics updates every simSpeed * FPS times per second

    fireRate: 10, //debug only, per second/simulation rate

    maximumTargets: 15 //max no. of targets, will destroy previous ones if over this limit
}

var launcherList = new Array();
var bulletList = new Array();
var targetList = new Array();

t = new Target({x:0, y:2000}, {x:30, y:10});
l1 = new Launcher({x:0, y:100}, 100, t);
launcherList.push(l1);
targetList.push(t)
