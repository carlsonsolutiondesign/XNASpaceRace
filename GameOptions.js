pc.script.create('GameOptions', function (context) {
    
    // Creates a new GameOptions instance
    var GameOptions = function (entity) {
        
        this.entity = entity;
    };

    window.GameOptions =
    {
        // game screen horizontal resolution
        ScreenWidth: 1280,

        // game screen vertical resolution
        ScreenHeight: 720,

        // glow buffer resolution
        GlowResolution: 1024,

        // maximum number of supported players
        MaxPlayers: 2,

        // max points (kills) to end game
        MaxPoints: 10,

        // how many octree subdivisions in collision mesh
        CollisionMeshSubdivisions: 4,

        // size of player collision box
        CollisionBoxRadius: 60,

        // maximum bones per model
        MaxBonesPerModel: 128,

        // inpulse force when two ships collide
        ShipCollidePush: 500.0,

        // use game pade vibrate?
        //    gamepad vibration fadeout time
        //    gamepad vibration intensity
        UseGamepadVibrate: true,
        VibrationFadeout: 0.1,
        VibrationIntensity: 0.5,

        // max simultaneous particles per frame
        MaxParticles: 8192,

        // max simultaneous animated sprites per frame
        MaxSprites: 128,

        // color and time (seconds) used for screen transitions
        FadeColor: new pc.Vec4(0.0, 0.0, 0.0, 0.0),
        FadeTime: 2.0,

        // time shield is active
        // time for shield recharge
        ShieldUse: 2.0,
        ShieldRecharge: 8.0,

        // time boost is active
        // time for boost recgarge
        // how fast boost slows down after finished
        // force to apply forward when using boost
        BoostUse: 2.0,
        BoostRecharge: 8.0,
        BoostSlowdown: 1000.0,
        BoostForce: 50.0,

        // fadeout time for damage effect
        // timeout before you respawn after a kill
        DamageFadeout: 0.5,
        DeathTimeout: 3.0,

        // bobbing distance
        // bobbing speed
        ShipBobbingRange: 4.0,
        ShipBobbingSpeed: 4.0,

        // time between two blasters fire
        // blaster velocity
        BlasterChargeTime: 0.2,
        BlasterVelocity: 6000.0,

        // time between two missiles fire
        // missile velocity
        MissileChargeTime: 0.5,
        MissileVelocity: 4000.0,

        // offset for camera in 1st person mode
        CameraViewOffset: new pc.Vec3(0, -10, 0),
        // offset for camera in 3rd person mode
        CameraOffset: new pc.Vec3(0, 50, 125),
        // offset for camera target in 3rd person mode
        CameraTargetOffset: new pc.Vec3(0, 0, -50),
        // stiffness for camera in 3rd person mode
        CameraStiffness: 3000.0,
        // damping for camera in 3rd person mode
        CameraDamping: 600.0,
        // mass for camera in 3rd person mode
        CameraMass: 50.0,
        // offset for missile trail
        MissileTrailOffset: new pc.Vec3(0, 0, -10),

        // powerups rotation speed
        PowerupTurnSpeed: 2.0,
        // up/down powerup movement speed 
        PowerupMoveSpeed: 4.0,
        // up/down powerup movement distance
        PowerupMoveDistance: 4.0,
        // time for powerup respawn afetr picked up
        PowerupRespawnTime: 5.0,

        // max ship velocity
        MovementVelocity: 700.0,
        // max ship velocity with boost activated
        MovementVelocityBoost: 1200.0,
        // force applied by controls to move ship
        MovementForce: 3000.0,
        // damping force used to stop movemnt 
        MovementForceDamping: 750.0,
        // max rotation velocity
        MovementRotationVelocity: 1.1,
        // rotation force applied by controls to rotate ship
        MovementRotationForce: 5.0,
        // damping force used to stop rotation
        MovementRotationForceDamping: 3.0
    };

    GameOptions.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },
    };

    return GameOptions;
});
