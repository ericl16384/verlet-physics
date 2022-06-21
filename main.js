class VerletObject {
    constructor(position, radius=10, density=1) {
        this.position = position.copy();
        this.oldPosition = position.copy();
        this.acceleration = new Vector(0, 0);

        this.radius = radius;
        this.mass = this.radius**2 * Math.PI * density;

        this.kinematic = false;
    }

    updatePosition(dt) {
        var velocity = this.position.sub(this.oldPosition);
        this.oldPosition = this.position;
        this.position = this.position.add(velocity).add(this.acceleration.mul(dt**2));
        this.acceleration = new Vector(0, 0);
    }

    accelerate(acceleration) {
        if(!this.kinematic) {
            this.acceleration = this.acceleration.add(acceleration);
        }
    }

    applyInstantForce(force) {
        if(!this.kinematic) {
            this.position = this.position.add(force.div(this.mass));
        }
    }
}

//class VerletLink {
//    constructor(o1, o2, targetDistance=undefined) {
//        this.o1 = o1;
//        this.o2 = o2;
//        this.targetDistance = targetDistance;
//    }

//    apply() {
//        if(this.targetDistance === undefined) {
//            var targetDistance = this.o1.radius + this.o2.radius;
//        } else {
//            var targetDistance = this.targetDistance;
//        }

//        //var displacement = this.o1.position.sub(this.o2.position);
//        //var distance = displacement.mag;

//        //var totalMass = this.o1.mass + this.o2.mass;
//        //var iFraction = this.o1.mass / totalMass;
//        //var jFraction = this.o2.mass / totalMass;

//        //var fix = displacement.div(distance).mul(targetDistance - distance);
//        //this.o1.position = this.o1.position.sub(fix.mul(jFraction));
//        //this.o2.position = this.o2.position.add(fix.mul(iFraction));


//        var o1 = this.o1;
//        var o2 = this.o2;

//        //var displacement = o1.position.sub(o2.position);
//        var displacement = o2.position.sub(o1.position);
//        var distance = displacement.mag;
//        if(distance == 0) {
//            return;
//        }
//        //var separation = distance - o1.radius - o2.radius;

//        //var totalMass = o1.mass + o2.mass;
//        //var iFraction = o1.mass / totalMass;
//        //var jFraction = o2.mass / totalMass;
//        var averageMass = (o1.mass + o2.mass) / 2;

//        var fix = displacement.div(distance).mul(distance - targetDistance).div(2);
//        //o1.position = o1.position.sub(fix.mul(jFraction));
//        //o2.position = o2.position.add(fix.mul(iFraction));
//        var force = fix.mul(averageMass);
//        o1.applyInstantForce(force);
//        o2.applyInstantForce(force.neg);
//    }
//}

class VerletSimulation {
    constructor(objects=[]) {
        this.objects = objects;

        this.links = [];

        this.constraintCenter = new Vector(250, 250);
        this.constraintRadius = 250;

        this.gravity = new Vector(0, 0.5);

        this.subSteps = 8;
        this.linkSteps = 8;
    }

    update(dt=1) {
        var dtPerStep = dt / this.subSteps;
        for(let i=0; i<this.subSteps; i++) {
            this.applyConstraint();
            this.solveCollisions();
            //this.applyLinks(); // broken

            this.applyGravity();
            this.updatePositions(dtPerStep);
        }
    }

    updatePositions(dt) {
        for(let i=0; i<this.objects.length; i++) {
            this.objects[i].updatePosition(dt);
        }
    }

    applyGravity() {
        for(let i=0; i<this.objects.length; i++) {
            this.objects[i].accelerate(this.gravity);
        }
    }

    applyConstraint() {
        for(let i=0; i<this.objects.length; i++) {
            //var displacement = this.objects[i].position.sub(this.constraintCenter);
            //var displacement = this.constraintCenter.sub(this.objects[i].position);
            //var distance = displacement.mag;
            var toCenter = this.constraintCenter.sub(this.objects[i].position);
            var distance = toCenter.mag;
            var effectiveRadius = this.constraintRadius - this.objects[i].radius;
            
            var overstep = distance - effectiveRadius;

            //if(distance > effectiveRadius) {
            if(overstep > 0) {
                //this.objects[i].position = this.constraintCenter.add(displacement.norm.mul(effectiveRadius));

                this.objects[i].applyInstantForce(toCenter.norm.mul(overstep*this.objects[i].mass));
            }
        }
    }

    //applyLinks() {
    //    for(let i=0; i<this.linkSteps; i++) {
    //        // apply in random order
    //        var links = [];
    //        for(let j=0; j<this.links.length; j++) {
    //            links.push(this.links[j]);
    //        }
    //        shuffle(links);

    //        for(let j=0; j<links.length; j++) {
    //            links[j].apply();
    //        }
    //    }
    //}

    solveCollisions() {
        for(let i=0; i<this.objects.length; i++) {
            for(let j=i+1; j<this.objects.length; j++) {
                var o1 = this.objects[i];
                var o2 = this.objects[j];

                //var displacement = o1.position.sub(o2.position);
                var displacement = o2.position.sub(o1.position);
                var distance = displacement.mag;
                if(distance == 0) {
                    return;
                }
                var separation = distance - o1.radius - o2.radius;

                if(separation < 0) {
                    //var totalMass = o1.mass + o2.mass;
                    //var iFraction = o1.mass / totalMass;
                    //var jFraction = o2.mass / totalMass;
                    var averageMass = (o1.mass + o2.mass) / 2;

                    var fix = displacement.div(distance).mul(separation).div(2);
                    //o1.position = o1.position.sub(fix.mul(jFraction));
                    //o2.position = o2.position.add(fix.mul(iFraction));
                    var force = fix.mul(averageMass);
                    o1.applyInstantForce(force);
                    o2.applyInstantForce(force.neg);
                }
            }
        }
    }
}


var sim = new VerletSimulation();

//sim.objects.push(new VerletObject(new Vector(20, 200)));
//sim.objects.push(new VerletObject(new Vector(300, 200)));

//for(let i=0; i<20; i++) {
//    sim.objects.push(new VerletObject(new Vector(randRange(100, 400), randRange(100, 400)), 10));
//}

//var numLinks = 10;
//var r = 5;
//for(let i=0; i<numLinks; i++) {
//    sim.objects.push(new VerletObject(new Vector(250 + r*2*i, 250), r));

//    if(i == 0) {
//        sim.objects[sim.objects.length-1].kinematic = true;
//    } else {
//        sim.links.push(new VerletLink(
//            sim.objects[sim.objects.length-2],
//            sim.objects[sim.objects.length-1]
//        ))
//    }
//}

//sim.objects.push(new VerletObject(new Vector(250 + r*2*numLinks, 250), 5, 10));
//sim.links.push(new VerletLink(
//    sim.objects[sim.objects.length-2],
//    sim.objects[sim.objects.length-1]
//));


//for(let i=0; i<30; i++) {
//    sim.update();
//}


function draw() {
    fillCanvas(ctx, canvas, "#000000");
    drawCircle(ctx, sim.constraintCenter.arr(), sim.constraintRadius, "#ffffff");

    for(let i=0; i<sim.objects.length; i++) {
        if(i == 0 && false) {
            drawCircle(ctx, sim.objects[i].position.arr(), sim.objects[i].radius, "#00ff00");
        } else {
            drawCircle(ctx, sim.objects[i].position.arr(), sim.objects[i].radius, "#0000ff");
        }
    }

    drawRectangle(ctx, [100, 100], [300, 300], undefined, "#ff0000");
}

function update() {
    //sim.constraintCenter = new Vector(randRange(250, 255), randRange(250, 255));
    //sim.objects[0].accelerate(sim.gravity.neg);
    //sim.objects[0].accelerate(new Vector(0, 10));

    sim.objects.push(new VerletObject(new Vector(randRange(100, 300), randRange(100, 300))));

    sim.update();
}


//(function() {
//    document.onmousemove = handleMouseMove;
//    function handleMouseMove(event) {
//        var eventDoc, doc, body;

//        event = event || window.event; // IE-ism

//        // If pageX/Y aren't available and clientX/Y are,
//        // calculate pageX/Y - logic taken from jQuery.
//        // (This is to support old IE)
//        if (event.pageX == null && event.clientX != null) {
//            eventDoc = (event.target && event.target.ownerDocument) || document;
//            doc = eventDoc.documentElement;
//            body = eventDoc.body;

//            event.pageX = event.clientX +
//              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
//              (doc && doc.clientLeft || body && body.clientLeft || 0);
//            event.pageY = event.clientY +
//              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
//              (doc && doc.clientTop  || body && body.clientTop  || 0 );
//        }

//        // Use event.pageX / event.pageY here
//    }
//})();
