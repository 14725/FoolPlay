/*
The file is a part of Foolplay（傻瓜弹曲）
Foolplay is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
/*  
  With great respect to yux-storage <https://github.com/yued-fe/yux-storage> with the MIT license. 
  This one is much lighter (and more naive)
*/
let DB_KEY = 'lf-keystore';
let handleRequest = (req) => new Promise((ok, fail) => {
	req.onsuccess = (e) => (ok(e.target.result));
	req.onerror = fail;
});

let initPromise = (() => {
	let req = indexedDB.open(DB_KEY);
	req.onupgradeneeded = (e) => (e.target.result.createObjectStore(DB_KEY));
	return handleRequest(req);
})();

let getObjectStore = (db, str="write") => (db.transaction(DB_KEY, 'read'+str).objectStore(DB_KEY))

let AsyncStorage = {
	getItem: (key) => (
		initPromise.then((db) => (handleRequest(getObjectStore(db, 'only').get(key))))
	),
	setItem: (key, data) => (
		initPromise.then((db) => (handleRequest(getObjectStore(db).put(data, key))))
	),
	clear: () => (
		initPromise.then((db) => (handleRequest(getObjectStore(db).clear()))
		)
	),
};

window.AsyncStorage = AsyncStorage;
