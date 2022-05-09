/*  
The file is.a part of Foolplay（傻瓜弹曲）

Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/


var touchTimerId = 0;
var touchOnX,touchOnY;
var allowFaking = false;
function touchHandler(event){   
	if(!UI.touchEnabled)return;
	var touches = event.changedTouches,
		first = touches[0],
		type = "";
		switch(event.type)
		{
			case "touchstart":
				type="mousedown"; 
				touchTimerId = setTimeout(function(){allowFaking = true},100);
				touchOnX = first.clientX;
				touchOnY = first.clientY;
				break;
			case "touchmove":  type="mousemove"; break;        
			case "touchend": 
			case "touchcancel":
				type="mouseup";
				clearTimeout(touchTimerId);
				
				break;
			
			default: return;
		}

	//initMouseEvent(type, canBubble, cancelable, view, clickCount, 
	//           screenX, screenY, clientX, clientY, ctrlKey, 
	//           altKey, shiftKey, metaKey, button, relatedTarget);
	
	if(Math.abs(touchOnX - first.clientX) + Math.abs(touchOnY - first.clientY) > 5)	clearTimeout(touchTimerId);	
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, 
							  first.screenX, first.screenY, 
							  first.clientX, first.clientY, false, 
							  false, false, false, 0/*left*/, null);
	if(touches.length < 2) {
		if(type != "mousemove" || allowFaking)
		first.target.dispatchEvent(simulatedEvent);
		if(allowFaking)
		event.preventDefault();
	}
	if(event.type == "touchend"){
		fakeContextMenu(event)
		allowFaking = false
	}
}
function fakeContextMenu(event){
	//alert(event)
	var touches = event.changedTouches,
		first = touches[0],
		type = "contextmenu";

	//initMouseEvent(type, canBubble, cancelable, view, clickCount, 
	//           screenX, screenY, clientX, clientY, ctrlKey, 
	//           altKey, shiftKey, metaKey, button, relatedTarget);
	
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, 
							  first.screenX, first.screenY, 
							  first.clientX, first.clientY, false, 
							  false, false, false, 0/*left*/, null);
	if(touches.length < 2 && allowFaking) {
	  first.target.dispatchEvent(simulatedEvent);
	  event.preventDefault();
	}
	allowFaking = false;
}
UI.container.addEventListener("touchstart",touchHandler,{
	capture: false,
	passive: false,
});
UI.container.addEventListener("touchmove",touchHandler),{
	capture: false,
	passive: false,
};
UI.container.addEventListener("touchend",touchHandler,{
	capture: false,
	passive: false,
});