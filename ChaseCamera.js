pc.script.attribute('cameraName', 'string', 'Camera',
{
    displayName: "Camera Name"
});

pc.script.create('ChaseCamera', function (context) {
    
    // Creates a new ChaseCamera instance
    var ChaseCamera = function (entity) {
        
        this.entity = entity;

        this.camera = null;
        this.target = null;

        // Desired Camera Position Variables
        this.desiredPositionOffset = new pc.Vec3();
        this.desiredPosition = new pc.Vec3();

        this.lookAtOffset = new pc.Vec3(0.0, 2.8, 0.0);
        this.lookAt = new pc.Vec3();
        
        
        // Spring Camera Physics
        //    * stiffness coefficient for spring (higher the value the closer it will stay)
        //    * damping coefficient for spring (prevents infinit oscillation)
        //    * mass of camera body 
        this.stiffness = 1800.0;
        this.damping = 600.0;
        this.mass = 50.0;
        
        
        // Camera Properties
        //    * position of camera in world space
        //    * velocity of camera
        this.position = new pc.Vec3();
        this.velocity = new pc.Vec3();
    };


    ChaseCamera.prototype = {
        
        Initialize: function (levelName) {
            this.camera = context.root.findByName('Camera');
            
            //if (this.entity && this.entity.collision) {
            //    this.entity.collision.on('collisionstart', this.OnCollisionStart, this);
            //}
        },


        setChaseEntity: function(target) {

            this.target = target;
            this.desiredPositionOffset = new pc.Vec3();
            this.desiredPosition = new pc.Vec3();

            this.lookAtOffset = new pc.Vec3();
            this.lookAt = new pc.Vec3();

            var cameraOffset = target.findByName('CameraOffset');
            if (cameraOffset) {
                var localPos = cameraOffset.getLocalPosition();
                this.desiredPositionOffset.set(localPos.x, localPos.y, localPos.z);
            }

            this.camera = context.root.findByName('Camera');
            if (this.camera) {
                this.updateWorldPositions();
                this.camera.setPosition(this.desiredPosition);
            }
        },
        
        
        Update: function (dt) {

            if (!this.target || !this.camera)
                return;

            this.updateWorldPositions();

            this.position.copy(this.camera.getPosition());
            
            // calculate spring force
            var stretch = new pc.Vec3();
            stretch.sub2(this.position, this.desiredPosition);
            
            var force = new pc.Vec3();
            force.add(stretch);
            force.scale(-this.stiffness);
            
            var tmpDamping = new pc.Vec3();
            tmpDamping.add(this.velocity);
            tmpDamping.scale(this.damping);

            force.sub(tmpDamping);
            
            // apply acceleration
            if (!this.mass || this.mass == 0)
                this.mass = 1.0;
            
            var s = 1.0 / this.mass;

            var acceleration = new pc.Vec3();
            acceleration.add(force);
            acceleration.scale(s);
            acceleration.scale(dt);
            this.velocity.add(acceleration);
             
            // apply velocity
            var p = new pc.Vec3();
            p.add(this.velocity);
            p.scale(dt);
            this.position.add(p);

            /*
            var rayStart = new pc.Vec3().copy(this.position);
            var rayEnd = new pc.Vec3().copy(this.lookAt);
            context.systems.rigidbody.raycastFirst(rayStart, rayEnd, function (result) {
                if (result.entity && result.entity.name != this.target.name && result.point) {

                    var dir = new pc.Vec3().copy(result.point);
                    dir.sub(this.lookAt);
                    dir.normalize();
                    dir.scale(3);

                    var collisionPosition = new pc.Vec3().copy(result.point);
                    collisionPosition.sub(dir);
                    this.position.copy(collisionPosition);
                }
            }.bind(this));
            */
            
            this.camera.setPosition(this.position);
            this.camera.lookAt(this.lookAt, this.target.up);
        },
        

        OnCollisionStart: function(result) {
            if(result.other && result.other.rigidbody) {
                var dir = new pc.Vec3().copy(result.contacts[0].normal);
                dir.scale(0.5);
                this.entity.translate(dir);
            }
        },
        
        
        updateWorldPositions: function () {

            var worldTransform = this.target.getWorldTransform();

            this.desiredPosition = worldTransform.transformVector(this.desiredPositionOffset);
            this.desiredPosition.add(this.target.getPosition());

            this.lookAt = worldTransform.transformVector(this.lookAtOffset);
            this.lookAt.add(this.target.getPosition());
        }
    };

    return ChaseCamera;
});
