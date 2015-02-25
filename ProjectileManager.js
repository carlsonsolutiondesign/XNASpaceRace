pc.script.create('ProjectileManager', function (context) {
    
    // Creates a new ProjectileManager instance
    var ProjectileManager = function (entity) {
        this.entity = entity;
    };


    ProjectileManager.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return ProjectileManager;
});
