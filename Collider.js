pc.script.create('Collider', function (context) {
    
    // Creates a new Collider instance
    var Collider = function (entity) {
        this.entity = entity;
    };


    Collider.prototype = {
        
		Initialize: function () {
			if (this.entity && this.entity.collision) {
				this.entity.collision.on('collisionstart', this.onCollisionStart, this);
			}
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
