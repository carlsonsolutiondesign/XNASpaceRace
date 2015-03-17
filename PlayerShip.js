pc.script.create('PlayerShip', function (context) {

    // Creates a new PlayerShip instance
    var PlayerShip = function (entity) {
        this.entity = entity;
        this.gameManger = null;

        this.isLocalPlayer = false;
        this.localId = null;
		this.playerClient = null;

		this.playerId = null;
		this.shipId = null;
		this.spawnedId = null;

		this.updateDT = 0.20;
		this.nextUpdate = this.updateDT;

		this.targetPositions = [];
		this.modelLoaded = false;


        this.shield = 1.0;                                      // current shield charge (1.0 when ready to use)
        this.boost = 1.0;                                       // curren boost charge (1.0 when ready to use)
        this.energy = 1.0;                                      // energy charge (0.0 when ship is destroyed)

        this.shieldUse = false;                                 // shield is active flag
        this.boostUse = false;                                  // boost is active flag

        this.deadTime = GameOptions.DeathTimeout;               // time left before ship respawn after death

        this.blaster = 0.0;                                     // blaster charge (1.0 when ready to fire)
        this.missile = 0.0;                                     // missile charge (1.0 when ready to fire)
        this.missileCount = 0;                                  // number of missiles available
    
        this.damageTime = 0.0;                                  // time left showing damage screen 
        this.damageColor = new pc.Color(0.0, 0.0, 0.0, 0.0);    // current damage screen color

        this.score = 0;                                         // the player current score

        this.camera3DPerson = true;

        this.transform = new pc.Mat4();

        this.elapsedTime = 0.0;
    };


    PlayerShip.prototype = {

        Initialize: function (levelName) {

            this.entity.setPosition(0.0, 0.0, 0.0);
            this.entity.setLocalPosition(0.0, 0.0);

            this.entity.setEulerAngles(0.0, 0.0, 0.0);
            this.entity.setLocalEulerAngles(0.0, 0.0, 0.0);

            this.spawnedId = null;

            this.nextUpdate = this.updateDT;

            this.targetPositions = [];
            this.modelLoaded = false;

            this.shield = 1.0;
            this.boost = 1.0;
            this.energy = 1.0;

            this.shieldUse = false;
            this.boostUse = false;

            this.deadTime = GameOptions.DeathTimeout;

            this.blaster = 0.0;
            this.missile = 0.0;
            this.missileCount = 0;

            this.damageTime = 0.0;
            this.damageColor = new pc.Color(0.0, 0.0, 0.0, 0.0);

            this.score = 0;

            this.camera3DPerson = true;

            this.transform = new pc.Mat4();

            this.elapsedTime = 0.0;
        },


        GetTransform: function () {
            // return this.bobbing * this.transform;
            return this.transform;
        },


        ProcessInput: function (dt, inputManager, player) {

            if (!inputManager)
                return;

            if (!this.IsAlive())
                return;

            this.entity.script.ShipController.ProcessInput(dt, inputManager, player);
        },


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
                }

                return;
            }

            // save position before moving
            var lastPosition = new pc.Vec3().copy(this.entity.script.ShipController.position);

            this.entity.script.ShipController.Update(dt);

            var trans = this.entity.script.ShipController.position;
            var rot = new pc.Quat().setFromMat4(this.entity.script.ShipController.rotation);
            var scale = new pc.Vec3().copy(pc.Vec3.ONE);
            
            this.transform.setTRS(trans, rot, scale);

            this.transform.getTranslation(trans);
            this.entity.setPosition(trans);
            this.entity.setEulerAngles(this.transform.getEulerAngles());

            this.entity.script.ChaseCamera.Update(dt);

            if (this.playerClient) {
				this.nextUpdate -= dt;
				if (this.nextUpdate <= 0.0) {
					this.nextUpdate = this.updateDT;
					this.playerClient.fire('ClientUpdate', this.shipId, dt, this.entity.getPosition(), this.entity.getEulerAngles());
				}
			}
        },


        FindSpawnPoint: function () {
            if (this.gameManager) {
                var spawnPoints = this.gameManager.GetShipSpawnPointsList();

                if (spawnPoints && spawnPoints.length > 0) {
                    var spawnPointName = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
                    var spawnPoint = context.root.findByName(spawnPointName);
                    return spawnPoint;
                }
            }
            return null;
        },


        Spawn: function () {

            // reset energy, shield and boost
		    this.energy = 1.0;
		    this.shield = 1.0;
		    this.boost = 1.0;
		    this.missileCount = 3;

            // find spawn point
		    var spawnCameraOffset = null;
		    var spawnPoint = this.FindSpawnPoint();
		    if (spawnPoint) {

		        spawnCameraOffset = spawnPoint.findByName('Spawn.CameraPos');

		        // if the model is not loaded or the player changed ship load the new model
			    if (!this.spawnedId || this.spawnedId != this.shipId) {
			        this.spawnedId = this.shipId;
			        this.modelLoaded = false;

			        var asset = context.assets.getAssetById(this.shipId);
			        context.assets.load(asset).then(function (resources) {
			            this.entity.model.model = resources[0].clone();
			            this.modelLoaded = true;
			        }.bind(this));
			    }

			    this.entity.setPosition(spawnPoint.getPosition());
			    this.entity.setEulerAngles(spawnPoint.getEulerAngles());

			    this.entity.script.ShipController.Reset(this.entity.getWorldTransform());
			}

			if (this.playerClient) {
			    this.playerClient.fire('ClientSpawn', this.shipId, this.entity.getPosition(), this.entity.getEulerAngles());
			}

			if (spawnCameraOffset) {
			    var entityOffset = this.entity.findByName('CameraOffset');
			    if (entityOffset) {
			        entityOffset.setLocalPosition(spawnCameraOffset.getLocalPosition());
			        entityOffset.setLocalRotation(spawnCameraOffset.getLocalRotation());

			        var camera = context.root.findByName('Camera');
			        if (camera) {
			            camera.setPosition(spawnCameraOffset.getPosition());
			            camera.setRotation(spawnCameraOffset.getRotation());
			            this.entity.script.ChaseCamera.camera = camera;
			            this.entity.script.ChaseCamera.setChaseEntity(this.entity);
                    }
			    }
			}
        },


        SvrSpawn: function (shipId, position, orientation) {
            // reset energy, shield and boost
            this.energy = 1.0;
            this.shield = 1.0;
            this.boost = 1.0;
            this.missileCount = 3;

            // remove any pending simulations
            //(this may not be the right thing to do, espcially since simulations could still be valid)
            //this.targetPositions = [];

            this.deadTime = 0.0;

            this.shipId = shipId;

            // if the model is not loaded or the player changed ship load the new model
            if (!this.spawnedId || this.spawnedId != this.shipId) {
                this.spawnedId = this.shipId;
                this.modelLoaded = false;

                var asset = context.assets.getAssetById(this.shipId);
                context.assets.load(asset).then(function (resources) {
                    this.entity.model.model = resources[0].clone();
                    this.modelLoaded = true;
                }.bind(this));
            }

            this.entity.setPosition(position);
            this.entity.setEulerAngles(orientation);
        },


        SvrUpdate: function (dt, position, orientation) {
            this.targetPositions.push({ time: dt, dt: 0, position: position, orientation: orientation });
        },


        NetworkUpdate: function (rdt) {

            if (!this.IsAlive())
		        return;

		    // lerp/slerp from current position to target position/orientation
		    if (this.targetPositions && this.targetPositions.length > 0) {

		        this.targetPositions[0].dt += rdt;
		        var dt = Math.min(1.0, Math.abs(this.targetPositions[0].dt / this.targetPositions[0].time));

		        var ePos = this.entity.getPosition();
		        var tPos = this.targetPositions[0].position;

		        var removeTarget = false;

		        ePos.lerp(ePos, tPos, dt);
		        this.entity.setPosition(ePos);

		        var eAngles = this.entity.getEulerAngles();
		        var q1 = new pc.Quat().setFromEulerAngles(eAngles.x, eAngles.y, eAngles.z);

		        var tAngles = this.targetPositions[0].orientation;
		        var q2 = new pc.Quat().setFromEulerAngles(tAngles.x, tAngles.y, tAngles.z);

		        var q3 = new pc.Quat().slerp(q1, q2, dt);

		        this.entity.setEulerAngles(q3.getEulerAngles());

		        var lerpEpsilon = 0.0001;
       	        ePos.sub(tPos);
		        if (dt >= 1.0 || ePos.lengthSq() <= lerpEpsilon)
		            removeTarget = true;

		        if(removeTarget){
		            this.targetPositions.splice(0, 1);
                }
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
