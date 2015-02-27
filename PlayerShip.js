pc.script.create('PlayerShip', function (context) {

    // Creates a new PlayerShip instance
    var PlayerShip = function (entity) {
        this.entity = entity;
    };


    PlayerShip.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return PlayerShip;
});
