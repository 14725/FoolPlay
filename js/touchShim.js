/*  
The file is a part of Foolplay（傻瓜弹曲）

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

/**
 * 键盘钩子。
 * 缓解移动端某输入法无法选择问题。有必要针对全站进行修复！
 */
;(function(){
    var shiftDown = false;
    var has_bug = false;
    function cloneAndShift(e){
        var obj = {};
        for(var i in e){
            if(i[0] != i[0].toLowerCase()) continue;
            obj[i] = e[i];
        }
        obj.target = e.target;
        obj.shiftKey = true;
        
        return obj;
    }
    function keyHook(e){
        if(!e.isTrusted){return;}
        if(e.target.matches(".nofix, .nofix *")) return;
        if(e.key.includes("Shift")){
            if(e.type == "keydown"){
                shiftDown = true;
            } else if(e.type == "keyup"){
                shiftDown = false;
            }
        } else {
            if(e.shiftKey == true && shiftDown == true){
                document.removeEventListener("keydown", keyHook, true);
                document.removeEventListener("keyup", keyHook, true);
            }

            if(e.shiftKey == false && shiftDown == true){
                /* Hook! */
                var fakedEvent = new KeyboardEvent(e.type,cloneAndShift(e));
                e.stopImmediatePropagation();
                e.preventDefault();
                var res = e.target.dispatchEvent(fakedEvent);
                /* 模仿默认行为 */
                if(!res) return;
                if(e.type != "keydown") return;
                var textarea = e.target;
                if(!textarea.matches("textarea,input")) return;
                if(e.key == "ArrowLeft"){
                    if(textarea.selectionEnd == textarea.selectionStart){
                        textarea.setSelectionRange(Math.max(textarea.selectionStart-1,0),textarea.selectionEnd,"backward");
                    } else if(textarea.selectionDirection == "forward"){
                        textarea.setSelectionRange(textarea.selectionStart,textarea.selectionEnd-1,"forward");
                    } else {
                        textarea.setSelectionRange(Math.max(textarea.selectionStart-1,0),textarea.selectionEnd,"backward");
                    }
                } else if(e.key == "ArrowRight"){
                    if(textarea.selectionEnd == textarea.selectionStart){
                        textarea.setSelectionRange(textarea.selectionStart,textarea.selectionEnd+1,"forward");
                    } else if(textarea.selectionDirection == "forward"){
                        textarea.setSelectionRange(textarea.selectionStart,textarea.selectionEnd+1,"forward");
                    } else {
                        textarea.setSelectionRange(textarea.selectionStart+1,textarea.selectionEnd,"backward");
                    }
                }
            }
        }
    }
    document.addEventListener("keydown", keyHook, true);
    document.addEventListener("keyup", keyHook, true);
})();