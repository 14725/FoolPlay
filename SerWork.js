
var CACHE = "cache-first";
self.addEventListener("install", function(evt){
    self.skipWaiting();
});

self.addEventListener("fetch", function(evt){
	evt.respondWith(NetworkFirst(evt.request));
});

async function NetworkFirst(request){
	var cache;
	var fet = fetch(request);
	var response,ret;
	var cloner;
	try{
	  response = await fet;
	}catch(e){
	  try{
	    cache = await caches.open(CACHE);
	    response = await cache.match(request);
	    if(response) return response;
	    return offlineErrorPage('缓存捞不到页面。');
	  }catch(e){
	    return errorPage(e);
	  }
	}
	try{
	  if(!checkNeed(request,response)){
	    return response;
	  }
	  cloner = await responseCloner(response);
	  cache = await caches.open(CACHE);
	  await cache.put(request,cloner());
	  return cloner();
	}catch(e){
	  return errorPage(e);
	}
}

function offlineErrorPage(error){
  var html = `
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>≥﹏≤</title>
  <body style="background:gray">
  <div style="
    margin:3em auto;
    max-width:330px;
    padding:1em;
    border:black 1px solid;
    background:white;
  ">
  <h1>未找到网页</h1>
  <p>我们不能从网络下载这张网页，并且不能从网页存储中捞出来这张页面。</p>
  <p>最大的可能是您不在线，尽管也有可能是本网站被和谐了。</p>
  <p>如果您真的不在线，请您连接网络后再次尝试访问。如果能从网站下载这张网页，我们会把它存入网页存储，期望下回您可以离线使用本程序。</p>
  <script>setTimeout('location.reload()',1000);</script>
  </div>
  <xmp style="overflow-x:auto;max-width:100%">${error.stack || error}</xmp>
  </body>
  `;
  return new Response(new Blob([html],{type:'text/html'}));
}
function errorPage(error){
  var html = `
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>≥﹏≤</title>
  <body style="background:gray">
  <div style="
    margin:3em auto;
    max-width:330px;
    padding:1em;
    border:black 1px solid;
    background:white;
  ">
  <h1>BUG</h1>
  <p>您遭遇了一个臭虫。到留言板来，我去杀他。（记得把框框外面的字也给我贴一份）</p>
  </div>
  <xmp style="overflow-x:auto;max-width:100%">${error.stack || error}</xmp>
  </body>
  `;
  return new Response(new Blob([html],{type:'text/html'}));
}

function checkNeed(request,response){
  if(request.url.split('?')[0].toLowerCase().indexOf('.d') > 0){
    // Niao Source
    return false;
  }
  return response.ok;
}

async function responseCloner(response){
  var blob = await response.blob();
  return function(){
    return new Response(blob);
  };
}