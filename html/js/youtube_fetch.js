/*

	QUESTO FILE CONTIENE LA LOGICA PER RICEVERE E FORMATTARE I DATI
	CHE VERRANNO MOSTRATI COME SUGGERIMENTI VIDEO

*/

//YouTube js library
//YOUTUBE API REQUESTS

//video in riproduzione
var current_video = null;
//video salvati per ogni categoria
//se sono vuoti carico dalle query/api
var suggested_videos_random = [];
var suggested_videos_search = [];
var suggested_videos_related = [];
var suggested_videos_recent = [];
var suggested_videos_popular = [];
var suggested_videos_fvitali = [];
var suggested_videos_similar = [];

//var key = "AIzaSyDCYqpMCC5Sc_wHyaajDduO0NNpgXTzOgs"; chiave di un Simo
var key= "AIzaSyDbiarM9h6vGjTBHbI_BrkMPnTLKXZtgrU"; //chiave di un altro Simo
//NOT EMBEDDABLE -> for some unknown reason it works
var random_search_url = "https://www.googleapis.com/youtube/v3/search?part=id&maxResults=50&type=video&videoCategoryId=10&key="+key+"&q=";
var search_url = "https://www.googleapis.com/youtube/v3/search?key="+key+"&part=snippet&maxResults=10&type=video&videoCategoryId=10";
var related_url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=surfing&regionCode=IT&videoCategoryId=10&key="+key+"&relatedToVideoId=";
//var related_url = "https://www.googleapis.com/youtube/v3/search?key="+key+"&maxResults=20&part=snippet&q=surfing&type=video&relatedToVideoId="+video_info.videoId+"&videoCategoryId=10&regionCode=IT";
var list_url = "https://www.googleapis.com/youtube/v3/videos?key="+key+"&part=snippet&maxResults=10";
var single_video_url = "https://www.googleapis.com/youtube/v3/videos?key="+key+"&part=snippet&maxResults=10&id=";

function YouTubeRequest(theUrl, callback, dataSetToSave, reason){
	//alert(callback);
	$.ajax({
		url: theUrl,
		data: {
			format: 'json'
		},
		error: function(data) {
			console.log("error" + JSON.stringify(data));
		},
		dataType: 'json',
		success: function(data) {
			callback(data, dataSetToSave, reason);
		},
		type: 'GET'
	});
}

String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);

}

var total_items = 0;

//10 video random
function A(data, my_data_set, reason){
	function B(data, data_set){
		//alert("here");
		if(data_set.length <= 10){
			var new_info = [];
			new_info.image = data.items[0].snippet.thumbnails.medium.url;
			new_info.title = data.items[0].snippet.title;
			//new_info.description = data.items[0].snippet.description;
			new_info.reason = reason;
			new_info.videoId = data.items[0].id;
			data_set.push(new_info);suggested_videos_search
			if(data_set.length==10){
				//alert("ok");
				addYouTubeInformationsRefined(data_set);
			}
		}
	}
	for (var i = 0; (i < data.items.length - 1)&&(total_items<10); i++) {
		total_items++;
		var query = JSON.stringify(data.items[i].id.videoId);
		query = query.substring(1,query.length-1);
		YouTubeRequest(single_video_url+query, B, my_data_set, reason);
	}

	if(total_items<10){
		//alert(total_items);
		YouTubeRequest(random_search_url+makeid(), A, my_data_set, reason);
	}
}


function searchRefine(data, data_set, reason){
	console.log(data.items.length);
	for (var i = 0; i < data.items.length; i++) {
		//data.items[i].snippet.title
		var new_info = [];
		new_info.image = data.items[i].snippet.thumbnails.medium.url;
		//alert(new_info.image);
		new_info.title = data.items[i].snippet.title;
		//new_info.description = data.items[0].snippet.description;
		new_info.reason = reason;
		new_info.videoId = data.items[i].id.videoId;
		data_set.push(new_info);
	}
	console.log(data_set)
	//alert("passed");
	addYouTubeInformationsRefined(data_set);
}

function searchRefineOneVideo(data, data_set, reason){
	let new_info = [];
	if(data.pageInfo.totalResults==1){
		new_info.image = data.items[0].snippet.thumbnails.medium.url;
		new_info.title = data.items[0].snippet.title;
		new_info.reason = reason;
		new_info.videoId = data.items[0].id.videoId;
		if (!new_info.videoId){
			new_info.videoId = data.items[0].id;
		}
		data_set.push(new_info);
		addYouTubeInformationsRefined(data_set);
	}else{
		//altrimenti cerco normalmente
		data_set = youTubeSearchVideos(toBeSearched, true, data_set);
	}
}

function searchRefineFirstVideo(data, data_set, reason){
	let new_info = [];
	new_info.image = data.items[0].snippet.thumbnails.medium.url;
	new_info.title = data.items[0].snippet.title;
	new_info.reason = reason;
	new_info.videoId = data.items[0].id.videoId;
	data_set.push(new_info);
	waitForItems(data_set);
}

function waitForItems(data_set){
	if(data_set.length>=10){
		addYouTubeInformationsRefined(data_set);
	}
}


function ChangeCurrentVideo(video_name){
	current_video = video_name;
	current_video = current_video.toLowerCase();
	current_video = current_video.replace(new RegExp(/\((.*?)\)/), "");
	current_video = current_video.replace(new RegExp(/\[(.*?)\]/), "");
	current_video = current_video.replace(new RegExp(/\*(.*?)\*/), "");
	current_video = current_video.replaceAll("official","");
	current_video = current_video.replaceAll("video","");
	current_video = current_video.replaceAll("videoclip","");
	current_video = current_video.replaceAll("ufficiale","");
	current_video = current_video.replaceAll("original","");
	current_video = current_video.replaceAll("lyrics","");
	current_video = current_video.replaceAll("by","");
	current_video = current_video.replaceAll("hq","");
	current_video = current_video.replaceAll("1080p","");
	current_video = current_video.replaceAll("1080","");
	current_video = current_video.replaceAll("full hd","");
	current_video = current_video.replaceAll("720","");
	current_video = current_video.replaceAll("\"","");
	current_video = current_video.replaceAll("|","");
	current_video = current_video.replaceAll("(","");
	current_video = current_video.replaceAll(")","");
	current_video = current_video.replaceAll("[","");
	current_video = current_video.replaceAll("]","");
	current_video = current_video.replaceAll("-","");
	current_video = current_video.replaceAll("+","");
	current_video = current_video.replaceAll("*","");
}

function parseCurrentVideo(video_name){
	let parsed = video_name;
	parsed = parsed.toLowerCase();
	parsed = parsed.replace(new RegExp(/\((.*?)\)/), "");
	parsed = parsed.replace(new RegExp(/\[(.*?)\]/), "");
	parsed = parsed.replace(new RegExp(/\*(.*?)\*/), "");
	parsed = parsed.replaceAll("official","");
	parsed = parsed.replaceAll("video","");
	parsed = parsed.replaceAll("videoclip","");
	parsed = parsed.replaceAll("ufficiale","");
	parsed = parsed.replaceAll("original","");
	parsed = parsed.replaceAll("lyrics","");
	parsed = parsed.replaceAll("by","");
	parsed = parsed.replaceAll("hq","");
	parsed = parsed.replaceAll("1080p","");
	parsed = parsed.replaceAll("1080","");
	parsed = parsed.replaceAll("full hd","");
	parsed = parsed.replaceAll("720","");
	parsed = parsed.replaceAll("\"","");
	parsed = parsed.replaceAll("|","");
	parsed = parsed.replaceAll("(","");
	parsed = parsed.replaceAll(")","");
	parsed = parsed.replaceAll("[","");
	parsed = parsed.replaceAll("]","");
	parsed = parsed.replaceAll("-","");
	parsed = parsed.replaceAll("+","");
	parsed = parsed.replaceAll("*","");
	return parsed;
}

var showSingleVideoInfo = function(data){
	video_info.videoId = data.items[0].id;
	video_info.image = data.items[0].snippet.thumbnails.medium.url;
	video_info.title = data.items[0].snippet.title;
	video_info.reason = "User choice";
	var original_name = data.items[0].snippet.title.toString();
	ChangeCurrentVideo(original_name);
	console.log(current_video);
	//getSuggestedVideos();
	$('#current-video-title').text(original_name);
	var s = "";
	//Artist
	//Album
	//Year
	//YouTube
/*	s+='Youtube: <a href="https://www.youtube.com/watch?v='+data.items[0].id+'">'+data.items[0].id+'</a>'; // +
	   'Name: <a id="info-name"></a> Artist: <a id="info-art"></a> Album: <a id="info-album"></a> Year: <a id="info-year"></a>';
	$('#pills-info').html(s);

	$('#pills-description').html("<pre>"+data.items[0].snippet.description+"</pre>");
*/	s+='Youtube: <a href="https://www.youtube.com/watch?v='+data.items[0].id+'">'+data.items[0].id+'</a><br>' +
	' Name: <a id="info-name" href="#"></a><br> Artist: <a id="info-art" href="#"></a><br> Album: <a id="info-album" href="#"></a><br> Year: <a id="info-year" href="#"></a><br>';
	$('#pills-info').html(s);
	$('#pills-description').html("<div>"+data.items[0].snippet.description+"</div>");
	//getSongInfo($('#current-video-title').text(), printOut); //cerco artista, album... (funzione definita in sparql_query.js)
	getSongInfo(current_video, printOut, 1); //cerco artista, album... (funzione definita in sparql_query.js)
	wikipedia(current_video);
	load_comments();
}

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

	for (var i = 0; i < 5; i++)
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function youTubeRandomVideos(){
	//se non ho video salvati
	if(suggested_videos_random.length<10){
		total_items = 0;
		YouTubeRequest(random_search_url+makeid(), A, suggested_videos_random, "A random YouTube video...");
	}else{
		addYouTubeInformationsRefined(suggested_videos_random);
	}
}

function youTubeRelatedVideos(){
	//se non ho video salvati
	if(suggested_videos_related.length<10){
		total_items = 0;
		YouTubeRequest(related_url+video_info.videoId, A, suggested_videos_related, "A related video");
	}else{
		addYouTubeInformationsRefined(suggested_videos_related);
	}
}

var toBeSearched;

function youTubeSearchVideos(query, force_search, dataset){
	//alert(data_set.length);
	if(force_search || dataset.length<10){
		//alert(search_url+"&q="+query);
		suggested_videos_search = [];
		YouTubeRequest(search_url+"&q="+query, searchRefine, dataset, "One of the best search result");
		return dataset;
	}else{
		addYouTubeInformationsRefined(dataset);
	}
}

function youTubeSearchOneVideo(query, force_search, dataset){
	toBeSearched = query;
	//alert(data_set.length);
	if(force_search){
		//alert(search_url+"&q="+query);
		suggested_videos_search = [];
		YouTubeRequest(single_video_url+query, searchRefineOneVideo, dataset, "Your video request");
		return dataset;
	}else{
		addYouTubeInformationsRefined(dataset);
	}
}

function getSuggestedVideos(force_search){
	if(suggested_videos_similar.length >= 10 && !force_search){
		addYouTubeInformationsRefined(suggested_videos_similar);
	}else{
		//alert("http://localhost:8000:1824/api/spotify/videoInfo?video=" + escape(current_video));
		$.ajax(
			{
				url: "http://localhost:8000/api/spotify/videoInfo?video=" + escape(current_video),
				success: function(result){
					//alert(JSON.stringify(result));
					if(result.songs.length >= 10)
						suggested_videos_similar = getSuggestedVideosResults(result.songs, suggested_videos_similar);
					else{
						//getSuggestedVideos(false);//se non ho abbastanza risultati ricarico
					}
		  	},
				error: function(err){
					console.log("That's the error: " + err);
					switch (err.responseText) {
						case "error":
							alert("L'artista o la canzone non è stata riconosciuta");
							break;
						default:
							alert("errore generico");
					}
				}
			}
		);
	}
}

function getSuggestedVideosResults(queries, dataset){
	//alert(search_url+"&q="+query);
	suggested_videos_search = [];
	queries.forEach((el)=>{
		//alert(search_url + "&q=" + el.name + " " + el.artist);
		YouTubeRequest(search_url + "&q=" + el.name + " " + el.artist, searchRefineFirstVideo, dataset, el.reason);
	});
	return dataset;
}

function getRecentlyWatchedVideos(id){
	$.ajax({
		url : 'api/userHistory?uc_value=' + id,
		success: ((data)=>{
			console.log("data: "+data);
			let result = data;
			if(data){
				addYouTubeInformationsRefined(data.reverse());
			}else{
				alert("not enough video in history");
			}
		}),
		error : ((err)=>{
			console.log(err);
		})
	})
}

function getfvitali(){
	var videos = [];
	var video_info = [];
	$.get("http://site1825.tw.cs.unibo.it/TW/globpop",function(data){
		let urlYT = "https://www.googleapis.com/youtube/v3/videos?key="+key+"&part=snippet&maxResults=1&id="
		for(i in data.recommended){
			let urlYT = "https://www.googleapis.com/youtube/v3/videos?key="+key+"&part=snippet&maxResults=1&id="
			urlYT+= data.recommended[i].videoID;
			videos.push(urlYT);
		}
	}).then(function(){
		for (i in videos){
			let url = videos[i];
			$.get(url, function(data){
			var item = {
				"videoId" : data.items[0].id,
				"image" : data.items[0].snippet.thumbnails.medium.url,
				"title" : data.items[0].snippet.title,
				"reason" : "fvitali video"
			}
			video_info.push(item);
			}
			).then( function(){
				if (video_info.length >= 10){
					addYouTubeInformationsRefined(video_info);
				}
			})
		}
	});
}

//History Browser Manipulation

let video_boxes = Array.from(document.getElementsByClassName('card border-light mb-3'));

/*video_boxes.forEach(b => {
	b.addEventListener('click', e => {
		console.log("###### DEBUG ####### \n stiamo inserendo il video nella cronologia \n ######################### \n" + JSON.stringify(video_info))
		console.log("video nuovo: \n " + JSON.stringify(video2insertInHistory))
		console.log("video vecchio: \n " + JSON.stringify(video_info))
		history.pushState(video2insertInHistory, "", "#"+video_info.videoId)
	})
})
*/
window.addEventListener("popstate", e => {
	console.log("è stato attivato un evento popstate");
	console.log(JSON.stringify(e.state));
	changeVideo(e.state.videoId, e.state.image, e.state.title, e.state.reason);
});
