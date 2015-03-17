pc.script.create('LevelSettings', function (context) {

    // Creates a new LevelSettings instance
    var LevelSettings = function (entity) {
        this.entity = entity;
    };


    LevelSettings.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },


        GetShipSpawnPointsList: function (level) {
            switch (level) {
                case GameManager.Levels.SmallSpace:
                    return ['Ship.Spawn.01', 'Ship.Spawn.02'];

                case GameManager.Levels.RedSpace:
                    return ['Ship.Spawn.01', 'Ship.Spawn.02'];

                case GameManager.Levels.DoubleSpace:
                    return [];

                default:
                    return null;
            }
        }
    };

    return LevelSettings;
});
