pc.script.create('PowerupManager', function (context) {
    
    // Creates a new PowerupManager instance
    var PowerupManager = function (entity) {
        this.entity = entity;
    };


    PowerupManager.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return PowerupManager;
});
