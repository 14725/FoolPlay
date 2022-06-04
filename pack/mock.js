
/*
The file is.a part of Foolplay（傻瓜弹曲）
Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/



/* Monkey patch it then load pages */
var _fetch = fetch;
var _dict = {};
function get(url){
	var element = document.getElementById(url);
	var str = element.textContent;
	var uint;
	var res;
	var i;
	if(element.type == 'base64'){
		str = atob(str);
		i = str.length;
		uint = new Uint8Array(str.length);
		while(i--){
			uint[i] = str.charCodeAt(i);
		}
		res = uint.buffer;
	} else {
		res = str;
	}
	_dict[url] = res;
}
function hook(){
	window.fetch = function(uri){
		console.log(uri);
		if(_dict[uri])	return Promise.resolve(new Response(_dict[uri]));
		return Promise.reject(new TypeError('不能fetch：打包资源表中无该文件。'));
	};
	_xhr = XMLHttpRequest;
	window.XMLHttpRequest = function(){};
	XMLHttpRequest.prototype.addEventListener = function(){}
	XMLHttpRequest.prototype.open = function(_,url){
		this._url = url;
	};
	XMLHttpRequest.prototype.send = async function(){
		if(_dict[this._url]){
			this.response = _dict[this._url];
			console.log(this.response);
			setTimeout(function(a){
				a.onload && a.onload(new Event('load'));
			},0,this);
		} else {
			setTimeout(function(a){
				a.onerror && a.onerror(new ErrorEvent('error'))
			},0,this);
		}
	};
}
get('data/inf.d');
get('data/pianosap.mp3');
get('data/voice.jpg');
hook();