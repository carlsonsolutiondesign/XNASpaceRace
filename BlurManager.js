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
pc.script.create('BlurManager', function (context) {

    // Creates a new BlurManager instance
    var BlurManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.colorShader = null;                // simple color effect
        this.colorTextureShader = null;         // color + texure effect
        this.horizontalBlurShader = null;       // horizontal blur effect
        this.verticalBlurShader = null;         // vertical blur effect
        this.horizontalSplitBlurShader = null;  //

        this.vertexFormat = null;               // screen quad vertex declaration and buffer
        this.vertexBuffer = null;
        
        this.width = 0;                         // render target resolution
        this.height = 0;
        
        this.pixelSize = new pc.Vec2();         // normalized pixel size (1.0/size)
        
        this.projection = null;                 // 2D ortho view projection matrix
        this.modelView = null;
    };
    
    
    window.BlurManager =
    {
        BlurTechnique: Object.freeze(
        {
            Color: 0,
            ColorTexture: 1,
            BlurHorizontal: 2,
            BlurVertical: 3,
            BlurHorizontalSplit: 4
        })
    };


    BlurManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];

            var gd = context.graphicsDevice;

            this.CreateColorShader(gd);
            this.CreateColorTextureShader(gd);
            this.CreateHorizontalBlurShader(gd);
            this.CreateVerticalBlurShader(gd);
            this.CreateHorizontalSplitBlurShader(gd);

            this.vertexFormat = new pc.VertexFormat(context.graphicsDevice, [
                { semantic: pc.SEMANTIC_POSITION, components: 2, type: pc.ELEMENTTYPE_FLOAT32 },
                { semantic: pc.SEMANTIC_TEXCOORD0, components: 2, type: pc.ELEMENTTYPE_FLOAT32 }
            ]);

            this.vertexBuffer = new pc.VertexBuffer(context.graphicsDevice, this.vertexFormat, 6, pc.BUFFER_DYNAMIC);
        },
        
        
        RenderScreenQuad: function(gd, technique, texture, color) {

            if(!gd)
                return;

            if (texture && texture.width > 0 && texture.height > 0)
                this.pixelSize.set(1.0 / texture.width, 1.0 / texture.height);

            this.projection = new pc.Mat4().setOrtho(0, gd.width, gd.height, 0, 0.1, 1000.0);
            this.modelView = new pc.Mat4().setTranslate(0.0, 0.0, -1.0);

            this.UpdateVertexBuffer(gd, 0, 0, gd.width, gd.height);

            switch (technique)
            {
                case window.BlurManager.BlurTechnique.Color:
                    gd.setShader(this.colorShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    break;
                    
                case window.BlurManager.BlurTechnique.ColorTexture:
                    gd.setShader(this.colorTextureShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurHorizontal:
                    gd.setShader(this.horizontalBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurVertical:
                    gd.setShader(this.verticalBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurHorizontalSplit:
                    gd.setShader(this.horizontalSplitBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                default:
                    gd.setShader(this.colorShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    break;
            }

            gd.setVertexBuffer(this.vertexBuffer, 0);
            gd.draw({
                type: pc.PRIMITIVE_TRIANGLES,
                base: 0,
                count: 6,
                indexed: false
            });
        },
        
        
        RenderScaledScreenQuad: function(gd, technique, texture, color, scale) {

            if(!gd || !texture)
                return;
                
            this.pixelSize.set(1.0 / texture.width, 1.0 / texture.height);
            this.projection = new pc.Mat4().setOrtho(0, gd.width, gd.height, 0, 0.1, 1000.0);
            this.modelView = new pc.Mat4().setTranslate(0.0, 0.0, -1.0);

            this.UpdateVertexBuffer(gd, 0, 0, gd.width, gd.height);

            switch (technique)
            {
                case window.BlurManager.BlurTechnique.Color:
                    gd.setShader(this.colorShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    break;
                    
                case window.BlurManager.BlurTechnique.ColorTexture:
                    gd.setShader(this.colorTextureShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurHorizontal:
                    gd.setShader(this.horizontalBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurVertical:
                    gd.setShader(this.verticalBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                case window.BlurManager.BlurTechnique.BlurHorizontalSplit:
                    gd.set(this.horizontalSplitBlurShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("thePixelSize").setValue(this.pixelSize.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
                    
                default:
                    gd.setShader(this.colorShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    break;
            }
            
            gd.setVertexBuffer(this.vertexBuffer, 0);
            gd.draw({
                type: pc.PRIMITIVE_TRIANGLES,
                base: 0,
                count: 6,
                indexed: false
            });
        },
        
        
        UpdateVertexBuffer: function (gd, x, y, width, height) {

            this.vertexBuffer.lock();

            var iterator = new pc.VertexIterator(this.vertexBuffer);

            iterator.element[pc.SEMANTIC_POSITION].set(x, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 1);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x, y + height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x + width, y + height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 1);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x + width, y + height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x + width, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 1);
            iterator.end();

            this.vertexBuffer.unlock();
        },


        CreateColorShader: function (gd) {
            
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "void main(void)",
                    "{",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "uniform vec4 modColor;",
                    "",
                    "void main(void)",
                    "{",
                    "    gl_FragColor = modColor;",
                    "}"
                ].join("\n")
            };
            
            this.colorShader = new pc.Shader(gd, shaderDefinition);
        },
        
        
        CreateColorTextureShader: function(gd) {
            
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "attribute vec2 aTexCoord;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "   theTextureCoord = aTexCoord;",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "uniform vec4 modColor;",
                    "uniform sampler2D theColorMap;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "    vec4 theColor = modColor * texture2D(theColorMap, theTextureCoord);",
                    "    gl_FragColor = theColor;",
                    "}"
                ].join("\n")
            };
            
            this.colorTextureShader = new pc.Shader(gd, shaderDefinition);
        },
        
        
        CreateHorizontalBlurShader: function(gd) {
            
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "attribute vec2 aTexCoord;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "   theTextureCoord = aTexCoord;",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "const float blurRange = 5.0;",
                    "",
                    "uniform vec2 thePixelSize;",
                    "uniform sampler2D theColorMap;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);",
                    "",
                    "    for(float i = -blurRange; i <= blurRange; i++)",
                    "    {",
                    "        vec2 tc = theTextureCoord + vec2(i * thePixelSize.x, 0.0);",
                    "",
                    "        vec4 c = texture2D(theColorMap, tc);",
                    "        c.xyz *= c.w;",
                    "",
                    "        color += c;",
                    "    }",
                    "",
                    "    gl_FragColor = color / (2.0 * blurRange + 1.0);",
                    "}"
                ].join("\n")
            };
            
            this.horizontalBlurShader = new pc.Shader(gd, shaderDefinition);
        },
        
        
        CreateVerticalBlurShader: function(gd) {
            
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "attribute vec2 aTexCoord;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "   theTextureCoord = aTexCoord;",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "const float blurRange = 5.0;",
                    "",
                    "uniform vec2 thePixelSize;",
                    "uniform sampler2D theColorMap;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);",
                    "",
                    "    for(float i = -blurRange; i <= blurRange; i++)",
                    "    {",
                    "        vec2 tc = theTextureCoord + vec2(0.0, i * thePixelSize.y);",
                    "        vec4 c = texture2D(theColorMap, tc);",
                    "",
                    "        color += c;",
                    "    }",
                    "",
                    "    gl_FragColor = color / (2.0 * blurRange + 1.0);",
                    "}"
                ].join("\n")
            };
            
            this.verticalBlurShader = new pc.Shader(gd, shaderDefinition);
        },
        
        
        CreateHorizontalSplitBlurShader: function(gd) {
            
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "attribute vec2 aTexCoord;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "   theTextureCoord = aTexCoord;",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "const float blurRange = 5.0;",
                    "",
                    "uniform vec2 thePixelSize;",
                    "uniform sampler2D theColorMap;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);",
                    "",
                    "    for(float i = -blurRange; i <= blurRange; i++)",
                    "    {",
                    "        vec2 tc = theTextureCoord + vec2(i * thePixelSize.x, 0.0);",
                    "",
                    "        vec4 c = texture2D(theColorMap, tc);",
                    "        c.xyz *= c.w;",
                    "        c.w = 1.0;",
                    "",
                    "        const float split = 0.499;",
                    "        if(theTextureCoord.x >= split)",
                    "        {",
                    "            if(tc.x >= split)",
                    "                color += c;",
                    "        }",
                    "        else if(tc.x < split)",
                    "        {",
                    "            color += c;",
                    "        }",
                    "    }",
                    "",
                    "    gl_FragColor = color / color.w;",
                    "}"
                ].join("\n")
            };
            
            this.horizontalSplitBlurShader = new pc.Shader(gd, shaderDefinition);
        },
        

        UnloadContent: function() {
            
            this.vertexBuffer.destroy();
            this.vertexFormat = null;
        }
    };

    return BlurManager;
});
