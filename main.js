"use strict"; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode/Transitioning_to_strict_mode


class VerletObject {
    constructor(position, radius=10, density=1) {
        this.position = position;
        this.oldPosition = position;
        this.acceleration = new Vector(0, 0);

        this.radius = radius;
        this.mass = this.radius**2 * Math.PI * density;

        this.kinematic = false;
    }

    draw(ctx, color) {
        drawCircle(ctx, this.position.arr(), this.radius, color);
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

class VerletRigidbody {
    constructor(position, angle=0) {
        this.position = position;
        this.oldPosition = position;

        this.angle = angle;
        this.oldAngle = angle;

        this.mass = 1000;
        this.angularMass = this.mass**2; // need better calculation

        // this.scale = 2;

        this.polygon = [
            // simple square
            //[1, 1],
            //[-1, 1],
            //[-1, -1],
            //[1, -1]

            // jedi starfighter
            [52.83018867924528, -3.2349160732194234e-15],
            [-13.207547169811319, 24.90566037735849],
            [-24.528301886792455, 22.830188679245285],
            [-28.49056603773585, 12.07547169811321],
            [-51.320754716981135, 3.142489899698869e-15],
            [-32.264150943396224, -12.264150943396226],
            [-28.49056603773585, -12.641509433962263],
            [-24.71698113207547, -22.830188679245285],
            [-13.396226415094342, -25.09433962264151]
        ];

        // apply poly changes TEMPORARY
        var shift = new Vector(5, 0);
        for(let i=0; i<this.polygon.length; i++) {
            this.polygon[i] = new Vector(...this.polygon[i]).add(new Vector(5, 0)).mul(2).arr();
        }
        //console.log(JSON.stringify(this.polygon));

        this.kinematic = false;
        this.acceleration = new Vector(0, 0);
    }

    draw(ctx, color) {
        drawPolygon(ctx, this.globalPolygon, color);
    }

    updatePosition(dt) {
        var velocity = this.position.sub(this.oldPosition);
        var angularVelocity = this.angle - this.oldAngle;

        this.oldPosition = this.position;
        this.oldAngle = this.angle;

        this.position = this.position.add(velocity).add(this.acceleration.mul(dt**2));
        this.angle += angularVelocity;

        this.acceleration = new Vector(0, 0);
    }

    applyInstantForce(v, forceCenter=undefined, local=false) {
        if(this.kinematic) {
            return;
        }

        if(forceCenter === undefined) {
            if(local) {
                forceCenter = new Vector(0, 0);
            } else {
                forceCenter = this.position;
            }
        }

        if(local) {
            var localV = v;
            var globalV = this.toGlobalRotation(v);
            var localForceCenter = forceCenter;
        } else {
            var localV = this.toLocalRotation(v);
            var globalV = v;
            var localForceCenter = this.toLocalPosition(forceCenter);
        }

        var torque = localForceCenter.rotate(Math.PI/2).dot(localV);

        this.position = this.position.add(globalV.div(this.mass));
        this.angle += torque / this.angularMass;
    }

    accelerate(acceleration) {
        if(!this.kinematic) {
            this.acceleration = this.acceleration.add(acceleration);
        }
    }

    toGlobalRotation(v) {
        return v.rotate(this.angle);
    }
    toLocalRotation(v) {
        return v.rotate(-this.angle);
    }

    //toGlobalScale(v) {
    //    return v.mul(this.scale);
    //}
    //toLocalScale(v) {
    //    return v.div(this.scale);
    //}
    
    toGlobalPosition(v) {
        //return this.toGlobalRotation(this.toGlobalScale(v)).add(this.position);
        return this.toGlobalRotation(v).add(this.position);
    }
    toLocalPosition(v) {
        return this.toLocalRotation(this.position.sub(v));
    }

    //toLocalForce(v, forceCenter) {
    //    return [this.toLocalRotation(v), this.toLocalPosition(forceCenter)];
    //}
    //toGlobalForce(v, forceCenter) {
    //    throw "not implemented";
    //}

    get globalPolygon() {
        var polygon = [];
        for(let i=0; i<this.polygon.length; i++) {
            polygon.push(this.toGlobalPosition(new Vector(...this.polygon[i])).arr());
        }
        return polygon;
    }
}

class VerletConstraintCircle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    apply(object) {
        var toCenter = this.position.sub(object.position);
        var distance = toCenter.mag;
        var effectiveRadius = this.radius - object.radius;
        
        var overstep = distance - effectiveRadius;

        if(overstep > 0) {
            object.applyInstantForce(toCenter.norm.mul(overstep*object.mass));
        }
    }

    draw(ctx, color) {
        drawCircle(ctx, this.position.arr(), this.radius, undefined, color);
    }
}

class VerletConstraintLine {
    // constrains to the left side of the line (right when y is flipped ._.)

    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    apply(object) {
        console.log(object instanceof Object);

        // invert because rotation is flipped
        var distance = -distanceToLine(this.p1, this.p2, object.position);
        var separation = distance - object.radius;

        if(separation < 0) {
            var fix = this.p2.sub(this.p1).norm.perp.mul(separation);
            object.applyInstantForce(fix.mul(object.mass));
        }
    }

    draw(ctx, color) {
        drawLine(ctx, this.p1.arr(), this.p2.arr(), color);
    }
}

class VerletSimulation {
    constructor() {
        this.constraints = [];
        this.objects = [];
        this.rigidbodies = [];
        //this.links = [];

        //this.constraintCenter = new Vector(500, 250);
        //this.constraintRadius = 500;

        this.gravity = new Vector(0, 0.5);

        this.subSteps = 8;
        //this.linkSteps = 8;
    }

    draw(ctx) {
        for(let i=0; i<sim.constraints.length; i++) {
            //drawCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, WHITE, BLACK);
            //drawCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, undefined, BLACK);
            //fillOutsideCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, BLACK);
    
            sim.constraints[i].draw(ctx, BLACK);
        }

        for(let i=0; i<sim.objects.length; i++) {
            sim.objects[i].draw(ctx, BLUE);
        }

        for(let i=0; i<sim.rigidbodies.length; i++) {
            sim.rigidbodies[i].draw(ctx, GREEN);
        }
    }

    update(dt=1) {
        var dtPerStep = dt / this.subSteps;
        for(let i=0; i<this.subSteps; i++) {
            this.applyConstraints();
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

        for(let i=0; i<this.rigidbodies.length; i++) {
            this.rigidbodies[i].updatePosition(dt);
        }
    }

    applyGravity() {
        for(let i=0; i<this.objects.length; i++) {
            this.objects[i].accelerate(this.gravity);
        }

        for(let i=0; i<this.rigidbodies.length; i++) {
            this.rigidbodies[i].accelerate(this.gravity);
        }
    }

    applyConstraints() {
        for(let i=0; i<this.constraints.length; i++) {
            for(let j=0; j<this.objects.length; j++) {
                this.constraints[i].apply(this.objects[j]);
            }

            for(let j=0; j<this.rigidbodies.length; j++) {
                this.constraints[i].apply(this.rigidbodies[j]);
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

            // add rigidbodies TODO
        }
    }
}


var sim = new VerletSimulation();

sim.constraints.push(new VerletConstraintCircle(new Vector(250, 250), 250));
//sim.constraints.push(new VerletConstraintCircle(new Vector(350, 250), 250));

//sim.constraints.push(new VerletConstraintCircle(new Vector(500, 500), 500));
//sim.constraints.push(new VerletConstraintLine(new Vector(0, 400), new Vector(1000, 400)));

//for(let i=0; i<3; i++) {
//    sim.constraints.push(new VerletConstraintCircle(
//        new Vector(250, 250).add(angleToVector(i * Math.PI*2/3, 50)), 100
//    ));
//}

//sim.constraints.push(new VerletConstraintLine(new Vector(1000, 0), new Vector(0, 500)));


//sim.objects.push(new VerletObject(new Vector(randRange(200, 300), randRange(200, 300))));
//sim.objects.push(new VerletObject(new Vector(500, 300)));


//sim.rigidbodies.push(new VerletRigidbody(new Vector(250, 250)));


function draw() {
    fillCanvas(ctx, canvas, WHITE);
    sim.draw(ctx);


    //for(let i=0; i<sim.constraints.length; i++) {
    //    //drawCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, WHITE, BLACK);
    //    //drawCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, undefined, BLACK);
    //    //fillOutsideCircle(ctx, sim.constraints[i].position.arr(), sim.constraints[i].radius, BLACK);

    //    sim.constraints[i].draw(ctx, BLACK);
    //}

    //for(let i=0; i<sim.objects.length; i++) {
    //    sim.objects[i].draw(ctx, BLUE);
    //}

    ////drawRectangle(ctx, [100, 100], [300, 300], undefined, RED);

    ////bodies.forEach(b => b.draw(ctx, GREEN));
}

function update() {
    //for(let i=0; i<3; i++) {
    //    sim.constraints[i].position = new Vector(200, 200).add(angleToVector(i * Math.PI*2/3 + ticks/50, 50));
    //}


    sim.objects.push(new VerletObject(new Vector(randRange(100, 300), randRange(100, 300))));

    sim.update();


    //bodies.forEach((b, i) => b.applyInstantForce(force, forceCenter, i))
    //for(let i=0; i<2; i++) {
    //    bodies[i].applyInstantForce(force);
    //}

    //bodies.forEach(b => b.updatePosition(1));
}
