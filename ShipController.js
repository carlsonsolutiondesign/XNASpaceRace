pc.script.create('ShipController', function (context) {
    
    // Creates a new ShipController instance
    var ShipController = function (entity) {
        
        this.entity = entity;
        
        this.gameOptions = null;
        
        this.position = new pc.Vec3();                      // player position
        this.velocity = new pc.Vec3();                      // velocity in local player space
        this.force = new pc.Vec3();                         // forces in local player space

        
        this.rotation = new pc.Mat4();                      // player rotation
        
        this.rotationVelocityAxis = new pc.Vec3();          // rotation velocities around each local player axis
        this.rotationForce = new pc.Vec3();                 // rotation forces around each local player axis

        this.maxVelocity = 0.0;                             // maximum player velocity
        this.maxRotationVelocity = 0.0;                     // maximum player rotation velocity

        this.dampingForce = 0.0;                            // damping force
        this.dampingRotationForce = 0.0;                    // damping rotation force

        
        this.inputForce = 0.0;                              // maximum force created by input stick
        this.inputRotationForce = 0.0;                      // maximum rotation force created by input stick
    };


    ShipController.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
            this.gameOptions = context.root._children[0].script.GameOptions;
            
            this.position = pc.Vec3.ZERO;
            this.velocity = pc.Vec3.ZERO;
            this.force = pc.Vec3.ZERO;

            this.rotation = pc.Mat4.IDENTITY;
            this.rotationVelocityAxis = pc.Vec3.ZERO;
            this.rotationForce = pc.Vec3.ZERO;
            
            this.maxVelocity = this.gameOptions.MovementVelocity;
            this.dampingForce = this.gameOptions.MovementForceDamping;
            this.inputForce = this.gameOptions.MovementForce;
            
            this.maxRotationVelocity = this.gameOptions.MovementRotationVelocity;
            this.dampingRotationForce = this.gameOptions.MovementRotationForceDamping;
            this.inputRotationForce = this.gameOptions.MovementRotationForce;
        },


        reset: function(m) {
            
            this.rotation.copy(m);
            m.getTranslation(this.position);
            
            this.velocity = pc.Vec3.ZERO;
            this.force = pc.Vec3.ZERO;
            
            this.rotationVelocityAxis = pc.Vec3.ZERO;
            this.rotationForce = pc.Vec3.ZERO;
        },
        
        
        getTransform: function() {
            
            var transform = new pc.Mat4();
            transform.copy(this.rotation);
            transform.translate(this.position);
            
            return transform;
        },
        
        
        getVelocityVector: function() {
            // return the normalized velocity
            return this.velocity.length() / this.maxVelocity;
        },


        getWorldVelocity: function() {
            // transform local velocity into world space
            var wt = this.rotation.transformVector(this.velocity);
            return wt;
        },
        
        
        setWorldVelocity: function(v) {

            // transform world velocity into local space
            var r = this.rotation.right;
            var u = this.rotation.up
            var f = this.rotation.forward;
            
            this.velocity.x = r.dot(v);
            this.velocity.y = u.dot(v);
            this.velocity.z = f.dot(v);
        },
        
        
        processInput: function(dt, current, player) {
            
            // camera rotation
            this.rotationForce.x = this.inputRotationForce * context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_R_STICK_X);
            this.rotationForce.y = -this.inputRotationForce * context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_R_STICK_Y);
            this.rotationForce.z = 0.0;
            
            // camera bank
            
        },
        
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var x = 0;
            x++;
        }
    };

    return ShipController;
});
