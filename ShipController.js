pc.script.create('ShipController', function (context) {
    
    // Creates a new ShipController instance
    var ShipController = function (entity) {
        
        this.entity = entity;
        this.root = null;

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
            
            this.root = context.root.getChildren()[0];
            this.gameOptions = this.root.script.GameOptions;
            
            this.position.copy(pc.Vec3.ZERO);
            this.velocity.copy(pc.Vec3.ZERO);
            this.force.copy(pc.Vec3.ZERO);

            this.rotation.setIdentity();
            this.rotationVelocityAxis.copy(pc.Vec3.ZERO);
            this.rotationForce.copy(pc.Vec3.ZERO);
            
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
            
            this.velocity.copy(pc.Vec3.ZERO);
            this.force.copy(pc.Vec3.ZERO);
            
            this.rotationVelocityAxis.copy(pc.Vec3.ZERO);
            this.rotationForce.copy(pc.Vec3.ZERO);
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
        
        
        processInput: function(dt, inputManager, player) {

            if(!inputManager)
                return;

            var leftStick = inputManager.LeftStick(player);
            var rightStick = inputManager.RightStick(player);

            // camera rotation
            this.rotationForce.x = this.inputRotationForce * rightStick.x;
            this.rotationForce.y = -this.inputRotationForce * rightStick.y;
            this.rotationForce.z = 0.0;
            
            // camera bank
            if (inputManager.WasRightShoulderPressed(player)) {
                this.rotationForce.z += this.inputRotationForce;
            }
            if (inputManager.WasLeftShoulderPressed(player)) {
                this.rotationForce.z -= this.inputRotationForce;
            }

            // move forward/backward
            this.force.x = this.inputForce * leftStick.x;

            if (inputManager.WasRightStickPressed(player)) {
                // slide up/down
                this.force.y = this.inputForce * leftStick.y;
                this.force.z = 0.0;
            }
            else {
                // slide left/right
                this.force.y = 0.0;
                this.force.z = this.inputForce * leftStick.y;
            }

            // keyboard camera rotation
            if (inputManager.IsKeyDown(player, pc.KEY_UP))
                this.rotationForce.x = this.inputRotationForce;
            if (inputManager.IsKeyDown(player, pc.KEY_DOWN))
                this.rotationForce.x = -this.inputRotationForce;
            if (inputManager.IsKeyDown(player, pc.KEY_LEFT))
                this.rotationForce.y = this.inputRotationForce;
            if (inputMananger.IsKeyDown(player, pc.KEY_RIGHT))
                this.rotationForce.y = -this.inputRotationForce;

            // keyboard camera bank
            if (this.inputManager.IsKeyDown(player, pc.KEY_A))
                this.rotationForce.z = -this.inputRotationForce;
            if (this.inputManager.IsKeyDown(player, pc.KEY_D))
                this.rotationForce.z = this.inputRotationForce;

            // move forward/backward
            if (this.inputManager.IsKeyDown(player, pc.KEY_W))
                this.force.z = this.inputForce;
            if (this.inputManager.IsKeyDown(player, pc.KEY_S))
                this.force.z = -this.inputForce;

            // slide left/right
            if (this.inputManager.IsKeyDown(player, pc.KEY_Q))
                this.force.x = -this.inputForce;
            if (this.inputManager.IsKeyDown(player, pc.KEY_E))
                this.force.x = this.inputForce;
        },

        
        Update: function (dt) {

            // apply force
            var tmp = new pc.Vec3().copy(this.force);
            tmp.scale(dt);
            this.velocity.add(tmp);

            // apply damping
            if (this.force.x > -0.001 && this.force.x < 0.001) {
                if (this.velocity.x > 0) {
                    this.velocity.x = Math.max(0.0, this.velocity.x - this.dampingForce * dt);
                } else {
                    this.velocity.x = Math.min(0.0, this.velocity.x + this.dampingForce * dt);
                }
            }
            if (this.force.y > -0.001 && this.force.y < 0.001) {
                if (this.velocity.y > 0) {
                    this.velocity.y = Math.max(0.0, this.velocity.y - this.dampingForce * dt);
                } else {
                    this.velocity.y = Math.min(0.0, this.velocity.y + this.dampingForce * dt);
                }
            }
            if (this.force.z > -0.001 && this.force.z < 0.001) {
                if (this.velocity.z > 0) {
                    this.velocity.z = Math.max(0.0, this.velocity.z - this.dampingForce * dt);
                } else {
                    this.velocity.z = Math.min(0.0, this.velocity.z + this.dampingForce * dt);
                }
            }

            // crop with maximum velocity
            var velocityLength = this.velocity.length();
            if (velocityLength > this.maxVelocity) {
                this.velocity.normalize();
                this.velocity.scale(this.maxVelocity);
            }

            // apply velocity
            var pos = this.rotation.transformVector(this.velocity);
            pos.scale(dt);

            this.rotation.getX(tmp);
            tmp.scale(this.velocity.x * dt);
            this.position.add(tmp);

            this.rotation.getY(tmp);
            tmp.scale(this.velocity.y * dt);
            this.position.add(tmp);

            this.rotation.getZ(tmp);
            tmp.scale(this.velocity.z * dt);
            this.position.add(tmp);

            // apply rotational damping
            if(this.rotationForce.x > -0.001 && this.rotationForce.x < 0.001) {
                if (this.rotationForce.x > 0) {
                    this.rotationVelocityAxis.x = Math.max(0.0, this.rotationVelocity.x - this.dampingRotationForce * dt);
                } else {
                    this.rotationVelocityAxis.x = Math.min(0.0, this.rotationVelocity.x + this.dampingRotationForce * dt);
                }
            }
            if(this.rotationForce.y > -0.001 && this.rotationForce.y < 0.001) {
                if (this.rotationForce.y > 0) {
                    this.rotationVelocityAxis.y = Math.max(0.0, this.rotationVelocity.y - this.dampingRotationForce * dt);
                } else {
                    this.rotationVelocityAxis.y = Math.min(0.0, this.rotationVelocity.y + this.dampingRotationForce * dt);
                }
            }
            if(this.rotationForce.z > -0.001 && this.rotationForce.z < 0.001) {
                if (this.rotationForce.z > 0) {
                    this.rotationVelocityAxis.z = Math.max(0.0, this.rotationVelocity.z - this.dampingRotationForce * dt);
                } else {
                    this.rotationVelocityAxis.z = Math.min(0.0, this.rotationVelocity.z + this.dampingRotationForce * dt);
                }
            }

            // crop with maximum rotational velocity
            var rotationVelocityLength = this.rotationVelocityAxis.length();
            if (rotationVelocityLength > this.maxRotationVelocity) {
                this.rotationVelocityAxis.normalize();
                this.rotationvelocityAxis.scale(this.maxRotationVelocity);
            }

            // apply rotation velocity
            var rotationVelocity = new pc.Mat4();
            
            if (this.rotationVelocityAxis.x < -0.001 || this.rotationVelocityAxis.x > 0.001) {
                var m = new pc.Mat4().setFromAxisAngle(this.rotation.getX(), this.rotationVelocityAxis.x * dt);
                rotationVelocity.mul(m);
            }
            if (this.rotationVelocityAxis.y < -0.001 || this.rotationVelocityAxis.y > 0.001) {
                var m = new pc.Mat4().setFromAxisAngle(this.rotation.getY(), this.rotationVelocityAxis.y * dt);
                rotationVelocity.mul(m);
            }
            if (this.rotationVelocityAxis.z < -0.001 || this.rotationVelocityAxis.z > 0.001) {
                var m = new pc.Mat4().setFromAxisAngle(this.rotation.getZ(), this.rotationVelocityAxis.z * dt);
                rotationVelocity.mul(m);
            }

            this.rotation.mul(rotationVelocity);
        }
    };

    return ShipController;
});
