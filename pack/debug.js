
/*
The file is.a part of Foolplay（傻瓜弹曲）
Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/



  (function(){
    if(!('eruda' in window)){
      function show(text){
        var ele = document.createElement("div");
    		with(ele.style){
    		  border = '3px solid';
    		  color = 'red';
    		  whiteSpace = 'pre';
    		  padding = '1em';
    		  overflowX = 'auto';
    		  position = 'relative';
    		  background = 'white';
    		  zIndex = '9999999';
    		}
    		ele.innerText = text;
    		ele.innerHTML = '<input type="button" style="position:absolute;top:0;right:0;" value="关闭" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">' + ele.innerHTML;
    		var parent = (document.querySelector('.errors')) || (document.body) || (document.documentElement) || document.createElement('div');
    		parent.appendChild(ele)
    		ele.scrollIntoView();
      }
      function showError(message, source, lineno, colno, error) {
    		var text = '';
    		text += "程序内部错误：\n"+error+"\n";
    		text += message;
    		text += "\n在脚本文件 " + source + " 中\n\n";
    		text += "\n第 " + lineno + " 行，第 " + colno + " 列\n\n";
    		try{
    		  text += error.stack;
    		}catch(e){};
    		show(text);
    	}
    	window.addEventListener('error',function(event){
    	  if(event.error){
      	  try{
        	  var message, filename, lineno, colno;
        	  message= filename= lineno= colno = "(未知)";
        	  with(event){
        	    showError(message, filename, lineno, colno, error);
      	    }
      	  }catch(e){alert(e)};
    	  }else{
    	    show(event.target.outerHTML + '\n加载失败。')
    	  }
    	},true);
    	window.addEventListener('unhandledrejection',function(event){
    	  var reason = event.reason;
    	  var message, filename, lineno, colno;
    	  message= filename= lineno= colno = "(未知)";
    	  with(reason){
    	     showError(message, filename, lineno, colno, reason);
    	  }
    	  event.preventDefault();
    	})
    }else{
      eruda.init();
      window.addEventListener('error',function(event){
    	  if(!event.error){
    	    console.error(event.target.outerHTML + '\n加载失败。');
    	  }
    	},true);
    	window.addEventListener('unhandledrejection',function(event){
    	  console.error(event,event.reason)
    	  event.preventDefault();
    	})
    }
  })();
