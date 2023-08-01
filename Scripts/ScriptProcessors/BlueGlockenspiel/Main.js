Content.makeFrontInterface(1000, 750);

Synth.deferCallbacks(true);

//Zoom
namespace ZoomHandler
{
	const var MIN_ZOOM = 0.1;
	const var MAX_ZOOM = 1.0;
	const var ZOOM_STEP = 0.01;
	const var INTERFACE_WIDTH = 1000;
	const var INTERFACE_HEIGHT = 750;

	const var Zoom_Pnl = Content.getComponent("Zoom_Pnl");
	
	Zoom_Pnl.setPaintRoutine(function(g)
	{
		g.setColour(Colours.withAlpha(Colours.white, (this.data.hover && this.data.allowDrag) ? 1 : 0.7));
		g.fillPath(Triangle, [960, 710, 35, 35]);
	});
	
	inline function allowZoom(panel, on)
	{
		panel.data.allowDrag = on;
		panel.setMouseCursor(on ?"BottomRightCornerResizeCursor" : "NormalCursor", Colours.white, [0, 0]);
		panel.repaint();
	}
	
	allowZoom(Zoom_Pnl, true);
	
	Zoom_Pnl.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		
		if(event.clicked)
		{
			this.data.zoomStart = Settings.getZoomLevel();
		}
		if(event.mouseUp)
		{
			return;
		}
	
		if(event.drag)
		{
			if(!this.data.allowDrag)
				return;
	
			var diagonal = Math.sqrt(INTERFACE_WIDTH*INTERFACE_WIDTH + INTERFACE_HEIGHT*INTERFACE_HEIGHT);
			var currentZoom = Settings.getZoomLevel();
			var dragPixel = 0;
			
			if(event.dragX > event.dragY)
				dragPixel = (event.dragX * currentZoom) / INTERFACE_WIDTH;
			else
				dragPixel = (event.dragY * currentZoom) / INTERFACE_HEIGHT;
			
			
			var maxScaleFactor = Content.getScreenBounds(false)[3] / INTERFACE_HEIGHT;
			var diagonalDrag = this.data.zoomStart + dragPixel;
			
			diagonalDrag += (ZOOM_STEP / 2);
			
			diagonalDrag = Math.min(diagonalDrag, maxScaleFactor);
			
			diagonalDrag -= Math.fmod(diagonalDrag, ZOOM_STEP);
			diagonalDrag = Math.range(diagonalDrag, MIN_ZOOM, MAX_ZOOM);
			
			var zoomToUse = diagonalDrag;
	
			if(currentZoom != zoomToUse)
			{
				Settings.setZoomLevel(zoomToUse);
			}
		}
		
		this.repaint();
	});
}


//Keyboard
const var Keyboard = Content.getComponent("Keyboard");

const var Keyboard_LAF = Content.createLocalLookAndFeel();

Keyboard_LAF.registerFunction("drawWhiteNote", function(g, obj)
{
	var a = obj.area;
	a[1] = -2;
	a[2] = 31;
	a[3] = (obj.down ? 97 : 100);
	var atexta = [obj.area[0], 75, obj.area[2], 20];
	
	//Base
	g.setColour(Colours.white);
	g.fillRoundedRectangle(a, 5);
	
	g.setGradientFill([Colours.withAlpha(0x102244, 0.75), 0, 0, Colours.withAlpha(0x1077AA, 0.0), 0, 80]);
	g.fillRoundedRectangle(a, 5);
	
	//Color
	if(obj.keyColour)
	{
		g.setColour(Colours.withAlpha(obj.keyColour, 0.3));
		g.fillRect(a);
	}
	
	//Text
	if(obj.noteNumber % 12 == 0)
	{
		g.setColour(0xFF111111);
		g.setFont("Oxygen", 20);
		g.drawAlignedText("C" + (parseInt(obj.noteNumber / 12) - 2), atexta, "centred");
	}
	
	//Hover
	if(obj.hover)
	{
		g.setColour(Colours.withAlpha(0x222222, 0.15));
		g.fillRect(a);
	}
	else
	{
		g.setColour(Colours.withAlpha(Colours.white, 0.0));
		g.fillRect(a);
	}
});

Keyboard_LAF.registerFunction("drawBlackNote", function(g, obj)
{
	var a = obj.area;
	a[1] = -2;
	a[2] = 20;
	a[3] = (obj.down ? 60 : 65);

	//Base
	g.setColour(Colours.black);
	g.fillRoundedRectangle(a, 4);
	
	g.setGradientFill([Colours.withAlpha(0x000000, 0.0), 0, 15, 		Colours.withAlpha(0xFFFFFF, 0.3), 0, 50]);
	g.fillRoundedRectangle([a[0] + 5, a[1], a[2] - 10, a[3] - 10], 5);
	
	//Color
	if(obj.keyColour)
	{
		g.setColour(Colours.withAlpha(obj.keyColour, 0.15));
		g.fillRect(a);
	}
	
	//Hover
	if(obj.hover)
	{
		g.setColour(Colours.withAlpha(0x000000, 0.5));
		g.fillRoundedRectangle(a, 5);
	}
	else
	{
		g.setColour(Colours.withAlpha(0x000000, 0.0));
		g.fillRect(a);
	}
});

Keyboard.setLocalLookAndFeel(Keyboard_LAF);

//KeyColor
for (i = 53; i < 101; i++)
{
	Engine.setKeyColour(i, 0x999999);
}

for (i = 67; i < 92; i++)
{
	Engine.setKeyColour(i, 0x0099DF);
}

for (i = 67; i < 92; i++)
{
	Engine.setKeyColour(i, 0x00CCFF);
}

//Reverb
const var Reverb = Synth.getEffect("Reverb");

inline function onReverbControl(component, value)
{
	Reverb.setAttribute(1, value);
};
Content.getComponent("Reverb").setControlCallback(onReverbControl);


//Drive
const var Saturation = Synth.getEffect("Saturation");

inline function onDriveControl(component, value)
{
	reg va = (-value)*10;

	Saturation.setAttribute(3, va);
	Saturation.setAttribute(0, value);
};

Content.getComponent("Drive").setControlCallback(onDriveControl);


//Spread
const var SpreadR = Synth.getEffect("Spread R");
const var SpreadS = Synth.getEffect("Spread S");

inline function onSpreadControl(component, value)
{
	reg v = value*100;
	SpreadR.setAttribute(1, v);
	SpreadS.setAttribute(1, v);
}
Content.getComponent("Spread").setControlCallback(onSpreadControl);


//Articulation Switch
const var Interface = Content.getComponent("Interface");

var LightDark = 1;

inline function onSwitchControl(component, value)
{
	LightDark = (1-value);
	if(value)
	{
		Interface.setPosition(0, -750, 1000, 1500);
		RegularSMP.setBypassed(1);
		SoftSMP.setBypassed(0);
	}
	else
	{
		Interface.setPosition(0 , 0, 1000, 1500);
		RegularSMP.setBypassed(0);
		SoftSMP.setBypassed(1);
	}
	Settings_Pnl.changed();
};
Content.getComponent("Switch").setControlCallback(onSwitchControl);


//Extend Keyrange
const var Extend = Content.getComponent("Extend");
const var RegularSMP = Synth.getChildSynth("Regular_SMP");
const var Regular_SMP = Synth.getSampler("Regular_SMP");
const var SoftSMP = Synth.getChildSynth("Soft_SMP");
const var Soft_SMP = Synth.getSampler("Soft_SMP");


inline function onExtendControl(component, value)
{
	if(value == 1)
	{
	Regular_SMP.loadSampleMap("RegularExtended");
	Soft_SMP.loadSampleMap("SoftExtended");

	for (i = 60; i < 67; i++)
		{
		Engine.setKeyColour(i, 0x0069FF);
		}
	for (i = 92; i < 97; i++)
		{
		Engine.setKeyColour(i, 0x0069FF);
		}
	}
	else
	{
	Regular_SMP.loadSampleMap("Regular");
	Soft_SMP.loadSampleMap("Soft");

	for (i = 60; i < 67; i++)
		{
		Engine.setKeyColour(i, 0x999999);
		}
	for (i = 92; i < 97; i++)
		{
		Engine.setKeyColour(i, 0x999999);	
		}
	}
};
Content.getComponent("Extend").setControlCallback(onExtendControl);


//Settings
//Path
const var Wheel = Content.createPath();
const WheelData = [110,109,133,107,128,66,246,40,57,66,98,215,35,129,66,0,0,53,66,20,174,129,66,205,204,48,66,184,30,130,66,226,122,44,66,108,246,40,149,66,226,122,44,66,98,195,245,150,66,52,51,21,66,41,220,149,66,84,184,248,65,123,20,146,66,247,40,204,65,108,21,174,126,
66,42,92,217,65,98,144,194,123,66,73,225,202,65,113,61,120,66,73,225,188,65,72,225,115,66,134,235,175,65,108,72,97,135,66,238,81,116,65,98,41,92,128,66,23,174,39,65,134,235,109,66,200,245,208,64,154,153,88,66,124,61,122,64,108,205,204,66,66,54,51,59,
65,98,215,163,59,66,85,184,46,65,184,30,52,66,177,71,37,65,226,122,44,66,64,10,31,65,108,226,122,44,66,61,10,215,62,98,52,51,21,66,143,194,245,190,84,184,248,65,40,92,143,61,247,40,204,65,71,225,250,63,108,42,92,217,65,174,71,53,65,98,73,225,202,65,194,
245,64,65,73,225,188,65,61,10,79,65,134,235,175,65,225,122,96,65,108,238,81,116,65,133,235,233,64,98,23,174,39,65,184,30,45,65,200,245,208,64,236,81,120,65,124,61,122,64,205,204,166,65,108,54,51,59,65,102,102,210,65,98,85,184,46,65,82,184,224,65,177,
71,37,65,143,194,239,65,64,10,31,65,61,10,255,65,108,61,10,215,62,61,10,255,65,98,143,194,245,190,205,204,22,66,40,92,143,61,215,163,47,66,71,225,250,63,133,235,69,66,108,174,71,53,65,235,81,63,66,98,194,245,64,65,92,143,70,66,61,10,79,65,92,143,77,66,
225,122,96,65,61,10,84,66,108,133,235,233,64,133,235,110,66,98,164,112,45,65,92,15,129,66,246,40,120,65,102,230,136,66,205,204,166,65,20,46,142,66,108,102,102,210,65,50,51,125,66,98,82,184,224,65,214,35,128,66,20,174,239,65,10,87,129,66,61,10,255,65,
184,30,130,66,108,61,10,255,65,246,40,149,66,98,205,204,22,66,195,245,150,66,215,163,47,66,41,220,149,66,133,235,69,66,123,20,146,66,108,235,81,63,66,21,174,126,66,98,30,133,70,66,144,194,123,66,92,143,77,66,113,61,120,66,61,10,84,66,72,225,115,66,108,
133,235,110,66,72,97,135,66,98,92,15,129,66,236,81,128,66,102,230,136,66,195,245,109,66,20,46,142,66,154,153,88,66,108,50,51,125,66,205,204,66,66,98,91,143,126,66,21,174,63,66,9,215,127,66,164,112,60,66,133,107,128,66,246,40,57,66,108,133,107,128,66,
246,40,57,66,99,109,0,0,82,66,184,30,22,66,98,41,92,82,66,92,143,49,66,133,235,61,66,133,235,74,66,123,20,35,66,92,143,80,66,98,144,194,3,66,51,51,88,66,21,174,195,65,82,184,66,66,72,225,182,65,123,20,35,66,98,154,153,167,65,144,194,3,66,92,143,210,65,
21,174,195,65,133,235,8,66,72,225,182,65,98,112,61,40,66,154,153,167,65,246,40,74,66,92,143,210,65,92,143,80,66,133,235,8,66,98,31,133,81,66,113,61,13,66,0,0,82,66,20,174,17,66,0,0,82,66,184,30,22,66,99,101,0,0];
Wheel.loadFromData(WheelData);

//Button
const var Settings_Btn = Content.getComponent("Settings_Btn");

const var SetBtn_LAF = Content.createLocalLookAndFeel();

SetBtn_LAF.registerFunction("drawToggleButton", function(g, obj)
{
	var a = obj.area;

	g.setColour(Colours.withAlpha(Colours.white, (obj.over) ? 1 : 0.7));
	g.fillPath(Wheel, [a[0]+10, a[1]+5, 35, 35]);
});

Settings_Btn.setLocalLookAndFeel(SetBtn_LAF);


const var Hand = Content.getComponent("Hand");
Hand.setMouseCursor("PointingHandCursor", Colours.white, [0, 0]);


//Path
const var Triangle = Content.createPath();
const TriangleData = [110,109,0,0,150,66,246,40,108,64,108,0,0,150,66,246,40,108,64,98,0,0,150,66,164,112,149,64,82,56,149,66,51,51,179,64,10,215,147,66,174,71,201,64,108,174,71,201,64,10,215,147,66,98,51,51,179,64,82,56,149,66,184,30,149,64,0,0,150,66,246,40,108,64,0,0,150,
66,108,246,40,108,64,0,0,150,66,98,136,235,209,62,0,0,150,66,164,112,157,191,123,20,142,66,32,133,139,63,164,112,137,66,108,164,112,137,66,31,133,139,63,98,123,20,142,66,163,112,157,191,0,0,150,66,134,235,209,62,0,0,150,66,246,40,108,64,99,109,164,112,
137,66,154,153,189,65,108,154,153,189,65,164,112,137,66,98,62,10,171,65,123,20,142,66,246,40,184,65,0,0,150,66,103,102,210,65,0,0,150,66,108,205,204,222,65,0,0,150,66,98,215,163,230,65,0,0,150,66,123,20,238,65,82,56,149,66,154,153,243,65,10,215,147,66,
108,10,215,147,66,152,153,243,65,98,82,56,149,66,121,20,238,65,0,0,150,66,91,143,230,65,0,0,150,66,203,204,222,65,108,0,0,150,66,101,102,210,65,98,0,0,150,66,244,40,184,65,123,20,142,66,60,10,171,65,164,112,137,66,152,153,189,65,99,109,72,225,73,66,0,
0,150,66,108,215,163,142,66,0,0,150,66,98,51,179,146,66,0,0,150,66,0,0,150,66,51,179,146,66,0,0,150,66,215,163,142,66,108,0,0,150,66,72,225,73,66,98,0,0,150,66,144,194,60,66,123,20,142,66,52,51,54,66,164,112,137,66,226,122,63,66,108,226,122,63,66,164,
112,137,66,98,52,51,54,66,123,20,142,66,144,194,60,66,0,0,150,66,72,225,73,66,0,0,150,66,99,101,0,0];
Triangle.loadFromData(TriangleData);


//Open-Close
const var Settings_Pnl = Content.getComponent("Settings_Pnl");

inline function onSettings_BtnControl(component, value)
{

	Settings_Pnl.set("visible", 1-value);
};

Content.getComponent("Settings_Btn").setControlCallback(onSettings_BtnControl);

//Settings Panel
Settings_Pnl.loadImage("{PROJECT_FOLDER}Blur light.png", "BlurLight");
Settings_Pnl.loadImage("{PROJECT_FOLDER}Blur dark.png", "BlurDark");

Settings_Pnl.setPaintRoutine(function(g)
{
	if(LightDark == 1)
	{
		g.drawImage("BlurLight", [0, 0, 250, 350], 0, 0);
	}
	else
	{
		g.drawImage("BlurDark", [0, 0, 250, 350], 0, 0);
	}

	g.setColour(Colours.white);
	g.drawRoundedRectangle([2, 2, 246, 346], 20, 5);
});

//Settings FloatingTile
const var Settings_Tl = Content.getComponent("Settings_Tl");

const var Settings_LAF = Content.createLocalLookAndFeel();

Settings_LAF.registerFunction("drawComboBox", function(g, obj)
{
	g.setColour(Colours.withAlpha(Colours.black, 0.4));
	g.fillRoundedRectangle([0, 0, 110, 30], 5);
	
	g.setColour(Colours.white);
	g.drawRoundedRectangle([1, 1, 108, 28], 5, 2);
	
	g.drawAlignedText(obj.text, [5, 0, 110, 30], "left");
});

Settings_LAF.registerFunction("drawPopupMenuItem", function(g, obj)
{
	if(obj.isHighlighted == 0)
	{
		g.setColour(0xFF555555);
		g.fillRoundedRectangle([0,0, 110, 18], 5);
	}
	else
	{
		if(LightDark == 1)
		{
			g.setColour(0xFF5db0cc);
			g.fillRoundedRectangle([0,0, 110, 18], 5);
			g.setColour(Colours.white);
			g.drawRoundedRectangle([1, 1, 108, 16], 5, 1);
		}
		else
		{
			g.setColour(0xFF2975a1);
			g.fillRoundedRectangle([0,0, 110, 18], 5);
			g.setColour(Colours.white);
			g.drawRoundedRectangle([1, 1, 108, 16], 5, 1);
		}
	}
	
	g.setColour(Colours.white);
	g.drawAlignedText(obj.text, [5, 0, 100, 18], "left");
});

Settings_LAF.registerFunction("drawPopupMenuBackground", function(g, obj)
{
	g.fillAll(0xFF555555);
});

Settings_LAF.registerFunction("drawScrollbar", function(g, obj)
{
	var h = obj.handle;
	h[1] = h[1]+40;
	h[2] = 8;
	h[3] = h[3]-50;

	g.setColour(Colours.withAlpha(Colours.white, 0.5));
	g.fillRoundedRectangle(h, 4);
	
	if(obj.over)
	{
		g.setColour(Colours.white);
		g.fillRoundedRectangle(h, 4);	
	}
});

Settings_Tl.setLocalLookAndFeel(Settings_LAF);

//Reverb Sample
Engine.loadAudioFilesIntoPool();function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 