pc.script.create('AnimSpriteManager', function (context) {
    
    // Creates a new AnimSpriteManager instance
    var AnimSpriteManager = function (entity) {
        this.entity = entity;
    };


    AnimSpriteManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return AnimSpriteManager;
});