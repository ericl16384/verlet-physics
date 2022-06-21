# verlet-physics
 - basic verlet physics based on https://youtu.be/lS_qeBy3aQI
 - rigidbody forces based on https://github.com/ericl16384/pygame-spaceship

## Issues
 - see multipleConstraintIssue.js
   - multiple constraints on an object can cause it to launch
   - maybe it is the object colliding with one, and then it's new position collides with the next, passing it's new position up in a zigzag, rather than into the corner
   - if I were to calculate the nearest position the object could be valid, and move it there when it collides, it be fixed
