pc.script.create('PlayerShip', function (context) {

    // Creates a new PlayerShip instance
    var PlayerShip = function (entity) {
        this.entity = entity;

        this.shield = 1.0;                      // current shield charge (1.0 when ready to use)
        this.boost = 1.0;                       // curren boost charge (1.0 when ready to use)
        this.energy = 1.0;                      // energy charge (0.0 when ship is destroyed)

        this.shieldUse = false;                 // shield is active flag
        this.boostUse = false;                  // boost is active flag

        this.deadTime = 0.4;                    // time left before ship respawn after death

        this.blaster = 0.0;                     // blaster charge (1.0 when ready to fire)
        this.missile = 0.0;                     // missile charge (1.0 when ready to fire)
        this.missileCount = 0;                  // number of missiles available
    
        this.damageTime = 0.0;                  // time left showing damage screen 

        // (0.0 for no damage screen)
        this.damageColor = new pc.Vec4();       // current damage screen color

        this.playerIndex = 0;                   // the player index for this ship
        this.score = 0;                         // the player current score

        this.camera3DPerson = true;
        this.shipModel = null;                  // player ship model
    };


    PlayerShip.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },


        IsAlive: function () {
            if (this.deadTime === 0.0) {
                return true;
            }

            return false;
        },


        Bars: function () {
            return new pc.Vec3(this.energy, this.shield, this.boost);
        }
    };

    return PlayerShip;
});
