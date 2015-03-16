pc.script.create('LevelSettings', function (context) {

    // Creates a new LevelSettings instance
    var LevelSettings = function (entity) {
        this.entity = entity;
    };


    LevelSettings.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        }
    };

    return LevelSettings;
});
