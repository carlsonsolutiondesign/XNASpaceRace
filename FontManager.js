pc.script.create('FontManager', function (context) {
    
    // Creates a new FontManager instance
    var FontManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
    };


    FontManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
        },
        
        
        LoadContent: function() {
        },
        
        
        UnloadContent: function() {
        }
    };

    return FontManager;
});