class VerletObject {
    constructor(position) {
        this.oldPosition = position.copy();
        this.newPosition = position.copy();
        this.acceleration = new Vector(0, 0);

        this.radius = 10;
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
                    var fix = displacement.div(distance).mul(separation/2);
                    this.objects[i].newPosition = this.objects[i].newPosition.sub(fix);
                    this.objects[j].newPosition = this.objects[j].newPosition.add(fix);
                }
            }
        }
    }
}


var sim = new VerletSimulation();

for(let i=0; i<100; i++) {
    sim.objects.push(new VerletObject(new Vector(randRange(100, 400), randRange(100, 400))));
}


function draw() {
    fillCanvas(ctx, canvas, "#000000");
    drawCircle(ctx, sim.constraintCenter.arr(), sim.constraintRadius, "#ffffff");

    for(let i=0; i<sim.objects.length; i++) {
        drawCircle(ctx, sim.objects[i].newPosition.arr(), sim.objects[i].radius, "#0000ff");
    }
}

function update() {
    sim.update();
}
