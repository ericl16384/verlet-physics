class VerletObject {
    constructor(position, radius=10, density=1) {
        this.oldPosition = position.copy();
        this.newPosition = position.copy();
        this.acceleration = new Vector(0, 0);

        this.radius = radius;
        this.mass = this.radius**2 * Math.PI * density;
    }

    updatePosition(dt) {
        var velocity = this.newPosition.sub(this.oldPosition);
        this.oldPosition = this.newPosition;
        this.newPosition = this.newPosition.add(velocity).add(this.acceleration.mul(dt**2));
        this.acceleration = new Vector(0, 0);
    }

    accelerate(acceleration) {
        this.acceleration = this.acceleration.add(acceleration);
    }
}

class VerletSimulation {
    constructor(objects=[]) {
        this.objects = objects;

        this.gravity = new Vector(0, 0.5);

        this.constraintCenter = new Vector(250, 250);
        this.constraintRadius = 250;

        this.subSteps = 8;
    }

    update(dt=1) {
        var dtPerStep = dt / this.subSteps;
        for(let i=0; i<this.subSteps; i++) {
            this.applyGravity();
            this.applyConstraint();
            this.solveCollisions();

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
            var displacement = this.objects[i].newPosition.sub(this.constraintCenter);
            var distance = displacement.mag;
            var effectiveRadius = this.constraintRadius - this.objects[i].radius;

            if(distance > effectiveRadius) {
                this.objects[i].newPosition = this.constraintCenter.add(displacement.norm.mul(effectiveRadius));
            }
        }
    }

    solveCollisions() {
        for(let i=0; i<this.objects.length; i++) {
            for(let j=i+1; j<this.objects.length; j++) {
                var displacement = this.objects[i].newPosition.sub(this.objects[j].newPosition);
                var distance = displacement.mag;
                var separation = distance - this.objects[i].radius - this.objects[j].radius;

                if(separation < 0) {
                    var totalMass = this.objects[i].mass + this.objects[j].mass;
                    var iFraction = this.objects[i].mass / totalMass;
                    var jFraction = this.objects[j].mass / totalMass;

                    var fix = displacement.div(distance).mul(separation);
                    this.objects[i].newPosition = this.objects[i].newPosition.sub(fix.mul(jFraction));
                    this.objects[j].newPosition = this.objects[j].newPosition.add(fix.mul(iFraction));

                    //var fix = displacement.div(distance).mul(separation/2);
                    //this.objects[i].newPosition = this.objects[i].newPosition.sub(fix);
                    //this.objects[j].newPosition = this.objects[j].newPosition.add(fix);
                }
            }
        }
    }
}


var sim = new VerletSimulation();

//sim.objects.push(new VerletObject(new Vector(10, 250), 10, 1000));

//for(let i=0; i<200; i++) {
//    sim.objects.push(new VerletObject(new Vector(randRange(100, 400), randRange(100, 400)), 10));
//}


function draw() {
    fillCanvas(ctx, canvas, "#000000");
    drawCircle(ctx, sim.constraintCenter.arr(), sim.constraintRadius, "#ffffff");

    for(let i=0; i<sim.objects.length; i++) {
        if(false) {
            drawCircle(ctx, sim.objects[i].newPosition.arr(), sim.objects[i].radius, "#00ff00");
        } else {
            drawCircle(ctx, sim.objects[i].newPosition.arr(), sim.objects[i].radius, "#0000ff");
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
