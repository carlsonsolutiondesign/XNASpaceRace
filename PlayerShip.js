pc.script.create('PlayerShip', function (context) {

    // Creates a new PlayerShip instance
    var PlayerShip = function (entity) {
        this.entity = entity;

		this.playerClient = null;
		
		this.playerId = null;
        this.index = 0;
        this.shipId = null;

        this.shield = 1.0;                                      // current shield charge (1.0 when ready to use)
        this.boost = 1.0;                                       // curren boost charge (1.0 when ready to use)
        this.energy = 1.0;                                      // energy charge (0.0 when ship is destroyed)

        this.shieldUse = false;                                 // shield is active flag
        this.boostUse = false;                                  // boost is active flag

        this.deadTime = 0.4;                                    // time left before ship respawn after death

        this.blaster = 0.0;                                     // blaster charge (1.0 when ready to fire)
        this.missile = 0.0;                                     // missile charge (1.0 when ready to fire)
        this.missileCount = 0;                                  // number of missiles available
    
        this.damageTime = 0.0;                                  // time left showing damage screen 
        this.damageColor = new pc.Color(0.0, 0.0, 0.0, 0.0);    // current damage screen color

        this.playerIndex = 0;                                   // the player index for this ship
        this.score = 0;                                         // the player current score

        this.camera3DPerson = true;
        this.shipModel = null;                                  // player ship model

        this.elapsedTime = 0.0;

        this.simulate = false;
        this.nextSimulationDelta = 3;
        this.lastSimulation = 0;
    };


    PlayerShip.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        // Called every frame, dt is time in seconds since last update
        Update: function (dt) {
            this.elapsedTime += dt;

            this.damageTime = Math.max(0.0, this.damageTime - dt);

            if (!this.IsAlive()) {

                // when deadTime reaches 0 the player respawns
                this.deadTime = Math.max(0, this.deadTime - dt);

                // if player dead time expires, then respawn
                if (this.IsAlive()) {

                    // find respawn point
                    this.Spawn();

                    // reset energy, shield and boost
                    this.energy = 1.0;
                    this.shield = 1.0;
                    this.boost = 1.0;
                    this.missileCount = 3;
                }

                return;
            }

            if (this.simulate) {
                this.Simulate();
            }
        },


        Spawn: function () {
            if (this.playerClient) {
                this.playerClient.fire('spawn', this.shipId, this.entity.getPosition(), this.entity.getEulerAngles());
	        }
        },


        Simulate: function () {

            // temporary for testing purposes
            var t = Math.floor(this.elapsedTime);
            if (t != this.lastSimulation && (t % this.nextSimulationDelta) === 0.0) {
                var e = Math.random();
                var s = Math.floor(e * 10) % 2;
                var i = (s === 0 ? -1 : 1);

                this.AddEnergy(e * i);
                this.shield = Math.random();
                this.boost = Math.random();

                this.lastSimulation = t;
                this.nextSimulationDelta = Math.max(1, Math.floor(Math.random() * 10));
            }
        },


        IsAlive: function () {
            if (this.deadTime <= 0.0) {
                return true;
            }
            
            return false;
        },


        Bars: function () {
            return new pc.Vec3(this.energy, this.shield, this.boost);
        },


        DamageColor: function () {
            this.damageColor.a = Math.min(1.0, (this.damageTime / GameOptions.DamageFadeout));
            return new pc.Color().copy(this.damageColor);
        },


        AddEnergy: function (value) {

            if (value < 0 && this.shieldUse) {
                // play shield collide
                return;
            }

            // apply value to energy
            this.energy = Math.max(0.0, Math.min(1.0, this.energy + value));

            if (this.energy <= 0.0) {
                this.deadTime = GameOptions.DeathTimeout;
            }

            // if reducing energy, add damage screen intensity and timeout
            if (value < 0) {
                var intensity = this.damageTime / GameOptions.DamageFadeout;
                this.damageColor.r = Math.min(1.0, (intensity * this.damageColor.r + 0.05));
                this.damageColor.g = Math.min(1.0, (intensity * this.damageColor.g));
                this.damageColor.b = Math.min(1.0, (intensity * this.damageColor.b));
                this.damageColor.a = Math.min(1.0, (intensity * this.damageColor.a));
                this.damageTime = GameOptions.DamageFadeout;
            }
        }
    };

    return PlayerShip;
});
