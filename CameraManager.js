pc.script.attribute('cameraName', 'string', 'Camera',
{
    displayName: "Camera Name"
});

pc.script.attribute('startingCameraName', 'string', 'SceneCamera',
{
    displayName: "Starting Camera Name"
});

pc.script.attribute('lockCamera', 'boolean', false,
{
    displayName: "Lock Camera"
});

pc.script.attribute('itsLinearVelocity', 'number', 6.5,
{
    displayName: "Speed",
    min: 0.1,
    max: 30.0,
    step: 0.1,
    decimalPrecision: 1
});

pc.script.attribute('itsAngularVelocity', 'number', 120.0,
{
    displayName: "Angular Velocity",
    min: 0.1,
    max: 180.0,
    step: 0.1,
    decimalPrecision: 1
});

pc.script.attribute('itsRateOfAscension', 'number', 0.1,
{
    displayName: "Rate of Ascension",
    min: 0.1,
    max: 6.0,
    step: 0.1,
    decimalPrecision: 1
});

pc.script.create('CameraManager', function (context) {
    
    // Creates a new CameraManager instance
    var CameraManager = function (entity) {
        
        this.entity = entity;
        this.target = null;
        
        this.cameraIndex = 1;
        this.cameraList = new Array({name: "SceneCamera", isMovable: false}, {name: "Ship.01.Camera", isMovable: true}, {name: "Ship.02.Camera", isMovable: true});
    };


    CameraManager.nextCAMERA = "nextCamera";
    CameraManager.prevCAMERA = "prevCamera";


    CameraManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
            context.controller = new pc.input.Controller(document);
            context.controller.registerKeys(CameraManager.nextCAMERA, [pc.KEY_RIGHT]);
            context.controller.registerKeys(CameraManager.prevCAMERA, [pc.KEY_LEFT]);

            this.camera = context.root.findByName(this.cameraName);
            
            this.cameraIndex = this.findCameraByName(this.startingCameraName);
            this.setCamera(this.cameraList[this.cameraIndex].name);
        },


        findCameraByName: function(cameraName) {

            for(var x = 0; x < this.cameraList.length; x++) {
                if(this.cameraList[x].name === cameraName)
                    return x;
            }
            
            return 0;
        },


        // Called every frame, dt is time in seconds since last update
        update: function (dt) {

            if (!this.lockCamera) {
                if (context.controller.wasPressed(CameraManager.nextCAMERA)) {
                    this.onNextCamera();
                }
                else if (context.controller.wasPressed(CameraManager.prevCAMERA)) {
                    this.onPrevCamera();
                }
            
                if (context.gamepads.wasPressed(pc.input.PAD_1, pc.PAD_R_SHOULDER_1)){
                    this.onNextCamera();
                } else if(context.gamepads.wasPressed(pc.input.PAD_1, pc.PAD_L_SHOULDER_1)){
                    this.onPrevCamera();
                }
            }            
            
            if (this.target) {
                var ex = context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_R_STICK_X);
                var ey = context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_R_STICK_Y);
                if (context.keyboard.isPressed(pc.KEY_K)) {
                    ey -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_J)) {
                    ey += 1;
                }
                if (context.keyboard.isPressed(pc.KEY_Y)) {
		            ex -= 1;
                    ey -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_U)) {
		            ex += 1;
                    ey -= 1;
                }
                if (context.keyboard.isPressed(pc.KEY_B)) {
		            ex -= 1;
                    ey += 1;
                } else if (context.keyboard.isPressed(pc.KEY_N)) {
		            ex += 1;
                    ey += 1;
                }


                var ez = 0;
                ez -= context.gamepads.isPressed(pc.input.PAD_1, pc.PAD_R_SHOULDER_2);
                ez += context.gamepads.isPressed(pc.input.PAD_1, pc.PAD_L_SHOULDER_2);
                if (context.keyboard.isPressed(pc.KEY_L)) {
                    ez -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_H)) {
                    ez += 1;
                }

                var dA = this.itsAngularVelocity * dt;
                this.target.getParent().rotateLocal(-(dA * ey), -(dA * ex), dA * ez);

                var dx = context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_L_STICK_X);
                var dz = context.gamepads.getAxis(pc.input.PAD_1, pc.PAD_L_STICK_Y);

                if (context.keyboard.isPressed(pc.KEY_W)) {
                    dz -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_S)) {
                    dz += 1;
                }

                if (context.keyboard.isPressed(pc.KEY_A)) {
                    dx -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_D)) {
                    dx += 1;
                }

                var dy = 0;
                dy += context.gamepads.isPressed(pc.input.PAD_1, pc.PAD_L_STICK_BUTTON);
                dy -= context.gamepads.isPressed(pc.input.PAD_1, pc.PAD_R_STICK_BUTTON);
                if (context.keyboard.isPressed(pc.KEY_DOWN)) {
                    dy -= 1;
                } else if (context.keyboard.isPressed(pc.KEY_UP)) {
                    dy += 1;
                }


                this.target.getParent().translateLocal(this.itsLinearVelocity * dt * dx, this.itsRateOfAscension * dy, this.itsLinearVelocity * dt * dz);
            }
        },
        
        
        setCamera: function (entityName) {

            this.target = context.root.findByName(entityName);
            if (this.target) {
                this.entity.script.ChaseCamera.setChaseEntity(this.target);
            }
        },


        onPrevCamera: function () {
            
            if (this.cameraList && this.cameraList.length > 0) {
                this.cameraIndex--;

                if (this.cameraIndex < 0)
                    this.cameraIndex = this.cameraList.length - 1;

                this.setCamera(this.cameraList[this.cameraIndex].name);
            }
        },


        onNextCamera: function () {
            
            if (this.cameraList && this.cameraList.length > 0) {
                this.cameraIndex++;

                if (this.cameraIndex >= this.cameraList.length)
                    this.cameraIndex = 0;

                this.setCamera(this.cameraList[this.cameraIndex].name);
            }
        }
    };

    return CameraManager;
});
