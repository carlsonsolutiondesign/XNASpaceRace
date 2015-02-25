pc.script.create('ParticleManager', function (context) {
    
    // Creates a new ParticleManager instance
    var ParticleManager = function (entity) {
        this.entity = entity;
    };


    ParticleManager.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return ParticleManager;
});
