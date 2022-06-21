class VerletObject {
    constructor(position, radius=10, density=1) {
        this.position = position.copy();
        this.oldPosition = position.copy();
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
        console.log(this.position.arr(), local);

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
        console.log(localForceCenter);

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


//var sim = new VerletSimulation();


var bodies = [
    new VerletRigidbody(new Vector(150, 100)),
    new VerletRigidbody(new Vector(150, 300))
];
//body.accelerate(new Vector(5, 0));
//body.oldAngle -= 0.05;

var force = new Vector(100, 0);
var forceCenter = new Vector(0, 25);
//var forceLocal = true;


function draw() {
    //fillCanvas(ctx, canvas, BLACK);
    //drawCircle(ctx, sim.constraintCenter.arr(), sim.constraintRadius, WHITE);

    //for(let i=0; i<sim.objects.length; i++) {
    //    sim.objects[i].draw(ctx, BLUE);
    //}

    //drawRectangle(ctx, [100, 100], [300, 300], undefined, RED);


    bodies.forEach(b => b.draw(ctx, BLUE));

    //if(forceLocal) {
    //    drawLine(ctx,
    //        bodies[0].position.arr(),
    //        bodies[0].toGlobalPosition(forceCenter).arr(),
    //    GREEN);
    //    drawLine(ctx,
    //        bodies[0].toGlobalPosition(forceCenter).arr(),
    //        bodies[0].toGlobalPosition(forceCenter).add(bodies[0].toGlobalRotation(force)).arr(),
    //    RED);
    //} else {
    //    drawLine(ctx,
    //        bodies[0].position.arr(),
    //        bodies[0].position.add(forceCenter).arr(),
    //    GREEN);
    //    drawLine(ctx,
    //        bodies[0].position.add(forceCenter).arr(),
    //        bodies[0].position.add(forceCenter).add(force).arr(),
    //    RED);
    //}
}

function update() {
    //sim.objects.push(new VerletObject(new Vector(randRange(100, 300), randRange(100, 300))));

    //sim.update();


    //bodies.forEach((b, i) => b.applyInstantForce(force, forceCenter, i))
    for(let i=0; i<2; i++) {
        bodies[i].applyInstantForce(force);
    }

    bodies.forEach(b => b.updatePosition(1));
}
