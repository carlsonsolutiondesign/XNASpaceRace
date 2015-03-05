//------------------------------------------------------------------------------------------------------------------------
// PlayCanvas Defines      - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.html
//                           (PIXELFORMAT, etc.)
//
// GraphicsDevice          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.GraphicsDevice.html
// RenderTarget            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.RenderTarget.html
// Texture                 - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Texture.html
// VertexBuffer            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexBuffer.html
// VertexFormat            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexFormat.html
// VertexIterator          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexIterator.html
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
pc.script.create('BootManager', function (context) {
    
    // Creates a new BootManager instance
    var BootManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.fontManager = null;
        
        this.totalTime = 0.0;
    };


    // PlayCanvas Order of Events (http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.ScriptComponent.html):
    //
    //      initialize
    //      postInitialize
    //      update
    //      fixedUpdate
    //      postUpdate
    //
    BootManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        
            this.root = context.root.getChildren()[0];
            
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
            this.fontManager = this.root.script.FontManager;
            
            this.totalTime = 0.0;
        },
        
        
        postInitialize: function() {
            this.screenManager.LoadContent();
            this.gameManager.LoadContent();
            this.fontManager.LoadContent();
        },
        
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.totalTime += dt;

            this.screenManager.ProcessInput(dt);
            this.screenManager.Update(dt);
        },
        
        
        ToggleFullScreen: function () {
            if(context.isFullscreen()) {
                context.disableFullscreen();
            } else {
                var canvas = document.getElementById('application-canvas');
                context.enableFullscreen(canvas);
            }
        }
    };

    return BootManager;
});
