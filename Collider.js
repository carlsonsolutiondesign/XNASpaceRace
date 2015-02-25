pc.script.create('Collider', function (context) {
    
    // Creates a new Collider instance
    var Collider = function (entity) {
        this.entity = entity;
    };


    Collider.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.collision.on('collisionstart', this.onCollisionStart, this);
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        
        onCollisionStart: function(result) {
            if(result.other && result.other.rigidbody) {
                var dir = new pc.Vec3().copy(result.contacts[0].normal);
                dir.scale(1.0);
                this.entity.translate(dir);
            }
        }
    };

    return Collider;
});