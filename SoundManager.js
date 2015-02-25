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
pc.script.attribute('menuSelect', 'asset', [],
{
    type: 'audio',
    max: 1
});

pc.script.attribute('menuChange', 'asset', [],
{
    type: 'audio',
    max: 1
});

pc.script.attribute('menuCancel', 'asset', [],
{
    type: 'audio',
    max: 1
});


pc.script.create('SoundManager', function (context) {
    
    // Creates a new SoundManager instance
    var SoundManager = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
    };


    window.SoundManager =
    {
        Sound: Object.freeze({
            
            MenuSelect: 0,
            MenuChange: 1,
            MenuCancel: 2
        })
    };
    
    
    SoundManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
        },


        PlaySound: function (soundEnum) {
            
            var soundId = null;
            
            switch(soundEnum) {
                
                case window.SoundManager.Sound.MenuSelect:
                    soundId = this.menuSelect;
                    break;
                    
                case window.SoundManager.Sound.MenuChange:
                    soundId = this.menuChange;
                    break;
                    
                case window.SoundManager.Sound.MenuCancel:
                    soundId = this.menuCancel;
                    break;
            }
            
            if(soundId)
            {
                var snd = context.assets.getAssetById(soundId);
                if (snd) {
                    this.root.audiosource.play(snd.name);
                }
            }
        }
    };

    return SoundManager;
});