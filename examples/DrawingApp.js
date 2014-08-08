(function(){
		
	// Import library dependencies
	var Texture = PIXI.Texture,
		Sprite = PIXI.Sprite,
		Point = PIXI.Point,
		Graphics = PIXI.Graphics,
		Application = cloudkid.Application;
	
	var DrawingApp = function(options)
	{
		Application.call(this, options);
	};
	
	var stage;
	var sprite
	var texture;
	
	// Private mouse down variable
	var isMouseDown;

	// Private current shape
	var currentShape;

	// Number variables needed
	var oldMidX, oldMidY, oldX, oldY;
	
	var direction = 1;
	var speed = 5;
	var button;
	
	// Extend the createjs container
	var p = DrawingApp.prototype = Object.create(Application.prototype);
	
	p.init = function()
	{
		Debug.log("DrawingApp is ready to use.");
		
		stage = this.display.stage;
		
		texture = new Texture.fromImage("cloudkid.png");//fromImage automatically loads stuff it it wasn't preloaded
		sprite = new Sprite(texture);		
				
		sprite.position.x = 0;
		sprite.position.y = 100;
		
		stage.addChild(sprite);
				
		stage.mouseup = onMouseUp;
		stage.mousedown = onMouseDown;
		
		// Load the sprite info for the buttons
		this._assetLoader = new PIXI.AssetLoader(['images/button.json']);
		this._assetLoader.onComplete = this._onCompletedLoad.bind(this);
		this._assetLoader.load();
		
		currentShape = new Graphics();		
		stage.addChild(currentShape);
		
		this._clear();

		this.on("update", this.update.bind(this));
	};
	
	/**
	*   When the button sprite sheet has finished loading 
	*/
	p._onCompletedLoad = function()
	{
		button = new cloudkid.Button(
			// the button states, from the button data loaded
			{
				up : Texture.fromFrame("button_up.png"),
				over : Texture.fromFrame("button_over.png"),
				down : Texture.fromFrame("button_down.png"),
				disabled : Texture.fromFrame("button_disabled.png")
			}, 
			// The text field
			{
				text : 'Clear',
				style : {
					font : '20px Arial',
					fill : "#ffffff"
				}
			}
		);
		
		button.position.x = this.display.width - button.width - 5;
		button.position.y = this.display.height - button.height - 5;
		button.releaseCallback = this._clear.bind(this);
		
		stage.addChild(button);
	};
	
	/**
	*  Clear the stage  
	*/
	p._clear = function()
	{
		currentShape.clear();
		currentShape.lineStyle(3,0xCCCCCC,1);
	};
	
	/**
	* Called by the stage to update
	* @public
	*/
	p.update = function(elapsed)
	{
		var max = 800 - sprite.width;
		
		sprite.position.x += speed * direction;
		
		if (sprite.position.x < 0 || sprite.position.x > max )
		{
			direction *= -1;
		}
				
		if (isMouseDown)
		{
			var mPos = stage.getMousePosition();
			var pt = new Point(mPos.x, mPos.y);
			var midPoint = new  Point(oldX + pt.x>>1, oldY+pt.y>>1);
			currentShape.moveTo(pt.x, pt.y);
			currentShape.lineTo(oldX, oldY, midPoint.x, midPoint.y);
			
			oldX = pt.x;
			oldY = pt.y;
			
			oldMidX = midPoint.x;
			oldMidY = midPoint.y;
		}
	};
	
	/**
	*  Destroy this app, don't use after this
	*/
	p.destroy = function()
	{
		Debug.log("DrawingApp destroy.");
		
		if (stage)
		{
			stage.mouseup = null;
			stage.mousedown = null;
		}
		
		if (button)
		{
			button.destroy();
			button = null;
		}
		
		if (currentShape)
		{
			currentShape.clear();
			currentShape = null;
		}
		
		stage = null;
		sprite = null;
		texture = null;
		stage.removeChildren();
	};
	
	/**
	*  Handler for the mouse down event
	*  @private
	*/
	var onMouseDown = function()
	{
		isMouseDown = true;
		
		var mPos = stage.getMousePosition();
		
		oldX = mPos.x;
		oldY = mPos.y;
		oldMidX = mPos.x;
		oldMidY = mPos.y;
	};

	/**
	*  Handler for the mouse up event
	*  @private
	*/
	var onMouseUp = function()
	{
 		isMouseDown = false;
	};
	
	namespace('cloudkid').DrawingApp = DrawingApp;
	
}());