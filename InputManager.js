//------------------------------------------------------------------------------------------------------------------------
// GraphicsDevice          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.GraphicsDevice.html
// RenderTarget            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.RenderTarget.html
// Texture                 - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Texture.html
//
// AssetRegistry           - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.asset.AssetRegistry.html
//                         - http://developer.playcanvas.com/en/tutorials/intermediate/using-assets/
// 
// Custom Shaders          - http://developer.playcanvas.com/en/tutorials/advanced/custom-shaders/
//
// Audio                   - http://developer.playcanvas.com/en/user-manual/assets/audio/
//
// Script Attributes       - http://developer.playcanvas.com/en/user-manual/scripting/script-attributes/
// Matrices (Mat4)         - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Mat4.html
// Vectors (Vec3)          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Vec3.html
//------------------------------------------------------------------------------------------------------------------------
pc.script.create('InputManager', function (context) {

    // Creates a new InputManager instance
    var InputManager = function (entity) {

        this.entity = entity;
        this.root = null;

        this.elapsedTime = 0;
        this.dt = 0.3;

        // last time measure was taken and saved
        //
        // plldx plrdx pludy plddy
        // [p]revious [l]eftstick [l]eft/[r]ight or [u]p/[d]own
        //
        // prldx prrdx prudy prddy
        // [p]revious [r]ightstick [l]eft/[r]ight or [u]p/[d]own
        this.plldx = [0, 0, 0, 0];
        this.plrdx = [0, 0, 0, 0];
        this.pludy = [0, 0, 0, 0];
        this.plddy = [0, 0, 0, 0];

        this.prldx = [0, 0, 0, 0];
        this.prrdx = [0, 0, 0, 0];
        this.prudy = [0, 0, 0, 0];
        this.prddy = [0, 0, 0, 0];

        this.pdldx = [0, 0, 0, 0];
        this.pdrdx = [0, 0, 0, 0];
        this.pdudy = [0, 0, 0, 0];
        this.pdddy = [0, 0, 0, 0];

        this.pkeys = [];
    };


    window.InputManager =
    {
        GamePad: Object.freeze({One: pc.PAD_1, Two: pc.PAD_2, Three: pc.PAD_3, Four: pc.PAD_4})
    };


    InputManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];

            this.elapsedTime = 0;
            this.dt = 0.3;
        },


        SyncInput: function (dt) {
            this.elapsedTime += dt;
        },
        

        IsKeyDown: function (player, key) {
            
            if (context.keyboard.isPressed(key)) {
                return true;
            }
                
            return false;
        },
        
        
        WasKeyPressed: function (player, key) {

            if (context.keyboard.isPressed(key) && (!this.pkeys[key] || (this.elapsedTime - this.pkeys[key]) > this.dt)) {
                this.pkeys[key] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        LeftStick: function (player) {
            
            var pad, dx, dy, v;
            
            switch(player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return new pc.Vec2();
            }
            
            dx = context.gamepads.getAxis(pad, pc.PAD_L_STICK_X);
            dy = context.gamepads.getAxis(pad, pc.PAD_L_STICK_Y);

            v = new pc.Vec2(dx, dy);

            return v;
        },
        
        
        RightStick: function(player) {
            
            var pad, dx, dy, v;
            
            switch(player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return new pc.Vec2();
            }
            

            dx = context.gamepads.getAxis(pad, pc.PAD_R_STICK_X);
            dy = context.gamepads.getAxis(pad, pc.PAD_R_STICK_Y);

            v = new pc.Vec2(dx, dy);

            return v;
        },
        
        
        WasLeftTriggerPressed: function(player) {

            var pad;

            switch(player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }
            
            if (context.gamepads.wasPressed(pad, pc.PAD_L_SHOULDER_2)) {
                return true;
            }

            return false;
        },
        
        
        WasRightTriggerPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_R_SHOULDER_2)) {
                return true;
            }

            return false;
        },
        
        
        WasBackButtonPressed: function (player) {

            var pad;

            switch(player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }
            
            if (context.gamepads.wasPressed(pad, pc.PAD_SELECT)) {
                return true;
            }

            return false;
        },
        
        
        WasStartButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_START)) {
                return true;
            }

            return false;
        },
        
        
        WasDPadLeftButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.isPressed(pad, pc.PAD_LEFT) && (this.elapsedTime - this.pdldx[player]) > this.dt) {
                this.pdldx[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasDPadRightButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.isPressed(pad, pc.PAD_RIGHT) && (this.elapsedTime - this.pdrdx[player]) > this.dt) {
                this.pdrdx[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasDPadUpButtonPressed: function(player) {

            var pad, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.isPressed(pad, pc.PAD_UP) && (this.elapsedTime - this.pdudy[player]) > this.dt) {
                this.pdudy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasDPadDownButtonPressed: function(player) {

            var pad, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.isPressed(pad, pc.PAD_DOWN) && (this.elapsedTime - this.pdddy[player]) > this.dt) {
                this.pdddy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasAButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_FACE_1)) {
                return true;
            }

            return false;
        },
        
        
        WasBButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_FACE_2)) {
                return true;
            }

            return false;
        },
        
        
        WasXButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_FACE_3)) {
                return true;
            }

            return false;
        },
        
        
        WasYButtonPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_FACE_4)) {
                return true;
            }

            return false;
        },
        
        
        WasLeftShoulderPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_L_SHOULDER_1)) {
                return true;
            }

            return false;
        },
        
        
        WasRightShoulderPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_R_SHOULDER_1)) {
                return true;
            }

            return false;
        },
        
        
        WasLeftStickPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_L_STICK_BUTTON)) {
                return true;
            }

            return false;
        },
        
        
        WasRightStickPressed: function(player) {

            var pad;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            if (context.gamepads.wasPressed(pad, pc.PAD_R_STICK_BUTTON)) {
                return true;
            }

            return false;
        },
        
        
        WasLeftStickUpPressed: function(player) {

            var pad, cdy, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdy = context.gamepads.getAxis(pad, pc.PAD_L_STICK_Y);
            dt = this.elapsedTime - this.pludy[player];

            if (cdy < -0.5 && dt >= this.dt) {
                this.pludy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasLeftStickDownPressed: function(player) {
            
            var pad, cdy, dt;
            
            switch(player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }
            
            cdy = context.gamepads.getAxis(pad, pc.PAD_L_STICK_Y);
            dt = this.elapsedTime - this.plddy[player];

            if (cdy > 0.5 && dt >= this.dt) {
                this.plddy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasLeftStickRightPressed: function(player) {

            var pad, cdx, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdx = context.gamepads.getAxis(pad, pc.PAD_L_STICK_X);
            dt = this.elapsedTime - this.plrdx[player];

            if (cdx > 0.5 && dt >= this.dt) {
                this.plrdx[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasLeftStickLeftPressed: function(player) {

            var pad, cdx, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdx = context.gamepads.getAxis(pad, pc.PAD_L_STICK_X);
            dt = this.elapsedTime - this.plldx[player];

            if (cdx < -0.5 && dt >= this.dt) {
                this.plldx[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasRightStickUpPressed: function(player) {

            var pad, cdy, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdy = context.gamepads.getAxis(pad, pc.PAD_R_STICK_Y);
            dt = this.elapsedTime - this.prudy[player];

            if (cdy < -0.5 && dt >= this.dt) {
                this.prudy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasRightStickDownPressed: function (player) {

            var pad, cdy, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdy = context.gamepads.getAxis(pad, pc.PAD_R_STICK_Y);
            dt = this.elapsedTime - this.prddy[player];

            if (cdy > 0.5 && dt >= this.dt) {
                this.prddy[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasRightStickRightPressed: function(player) {

            var pad, cdx, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdx = context.gamepads.getAxis(pad, pc.PAD_R_STICK_X);
            dt = this.elapsedTime - this.prrdx[player];

            if (cdx > 0.5 && dt >= this.dt) {
                this.prrdx[player] = this.elapsedTime;
                return true;
            }

            return false;
        },
        
        
        WasRightStickLeftPressed: function(player) {

            var pad, cdx, dt;

            switch (player) {
                case 0:
                    pad = window.InputManager.GamePad.One;
                    break;

                case 1:
                    pad = window.InputManager.GamePad.Two;
                    break;

                default:
                    return false;
            }

            cdx = context.gamepads.getAxis(pad, pc.PAD_R_STICK_X);
            dt = this.elapsedTime - this.prldx[player];

            if (cdx < -0.5 && dt >= this.dt) {
                this.prldx[player] = this.elapsedTime;
                return true;
            }

            return false;
        }
    };

    return InputManager;
});
