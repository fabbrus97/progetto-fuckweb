/*

	QUESTO FILE CONTIENE LE MODIFICHE ALLA PAGINA HTML
	USA LE FUNZIONI DEFINITE IN "youtube_fetch.js" PER POPOLARE LA PAGINA

*/


//categoria selezionata di default
var current_category = 4;
//video in riproduzione, di default Gorillaz
var video_info = {};
video_info.videoId = "GgwE94KZJ7E";
//nome del cookie usato per riconoscere l'utente
var uc_name = "user_identifier_cookie";
//valore del cookie usato per riconoscere l'utente
var uc_value;
//iframe player reference
var ytplayer;

function ChangeInfoSong(data){
	var songInfo = {titolo: "", album: "", artista: ""}
  titolo = "\""+data['name']+"\"";
  album = "\""+data['album']+"\"";
  artista = "\""+data['artist']+"\"" ;
	$('#pills-info').html(songInfo);
}

//CAMBIO DEL VIDEO IN RIPRODUZIONE
function changeVideo(new_video_id, new_video_thumb, new_video_title, new_video_reason) {
	//il video non è più visto
	done = false;
	//$('#pills-comments').html("");
	if (viewed){
		viewed = false;
	  video_precedente = video_info.videoId;
	  old_title = video_info.title;
	  old_image = video_info.image;
	  console.log(" debug per popolarità relativa: video precedente è: " + video_precedente);
	  videos.push(video_precedente); //se il video è stato visto, lo aggiungo nell'array dei video visualizzati nella sezione corrente dall'utente
	}  else if (is_usable(video_info.videoId))
	  video_precedente = video_info.videoId;
	else
	  video_precedente = "";

	YouTubeRequest(single_video_url + new_video_id, showSingleVideoInfo, []);
	player.loadVideoById(new_video_id);
	video_info.videoId = new_video_id;
	video_info.image = new_video_thumb;
	video_info.title = new_video_title;
	video_info.reason = new_video_reason;
	//document.getElementById('ytplayer').outerHTML = video_url;
	//getRecentlyWatchedVideos(uc_value);
	//current_category = 4;
	//document.getElementById("pills-random-tab").classList.remove("active");
	//document.getElementById("pills-search-tab").classList.remove("active");
	//document.getElementById("pills-related-tab").classList.remove("active");
	//document.getElementById("pills-recent-tab").classList.remove("active");
	//document.getElementById("pills-popular-tab").classList.remove("active");
	//document.getElementById("pills-fvitali-tab").classList.remove("active");
	//document.getElementById("pills-similar-tab").classList.remove("active");
	//document.getElementById("pills-recent-tab").classList.add("active");
	/*
	document.getElementById("pills-description-tab").classList.remove("active");
	document.getElementById("pills-comments-tab").classList.remove("active");
	document.getElementById("pills-wikipedia-tab").classList.remove("active");
	document.getElementById("pills-info-tab").classList.add("active");
	*/
	//GESTIONE CRONOLOGIA
	//youTubeRandomVideos();
	suggested_videos_similar = [];
	suggested_videos_related = [];
	//ottengo info sul video da spotify
	//var songInfo = getSongInfo(current_video, ChangeInfoSong); //cerco artista, album... (funzione definita in sparql_query.js)
	var songInfo = getSongInfo(current_video, null, 0); //cerco artista, album... (funzione definita in sparql_query.js)
  //wikipedia
	//query(dbpedia_url); //faccio la query su dbpedia (funzione definita in sparql_query.js)
//	var s+='Artist: ' + songInfo.artist; s+='Album: ' + songInfo.album; s+='Year: ' + songInfo.year;
//	$('#pills-info').html(s);
}


//carica i nuovi contenuti nella pagina sovrascrivendo quelli vecchi
//se non sono impostati disabilita il pulsante
function changeContent(new_content) {
	if (new_content) {
		if (new_content[0]) {
			$('#pills-description').text('new_content[0]');
		} else {
			$('#pills-description').addClass('disabled');
		}
		if (new_content[1]) {
			$('#pills-comments').html('new_content[1]');
		} else {
			$('#pills-comments-tab').addClass('disabled');
		}
		if (new_content[2]) {
			$('#pills-wikipedia').html('new_content[2]');
		} else {
			$('#pills-wikipedia-tab').addClass('disabled');
		}
	} else {
		var er = 'Error loading new content, try loading <a href="http://localhost?v=Q4bsDgZa4ns">this</a> page';
		$('#pills-description').html(er);
		$('#pills-description-tab').addClass('disabled');
		$('#pills-comments-tab').addClass('disabled');
		$('#pills-wikipedia-tab').addClass('disabled');
	}
}


//CARICO I CONTENUTI NELLA PAGINA
//require new_suggestions[i].image
//require new_suggestions[i].title
//require new_suggestions[i].id
//require new_suggestions[i].reason
function addYouTubeInformationsRefined(new_data) {
	changeIndex(false);
	let results = new_data.length;
	console.log(new_data[0]);

	for (let i = 0; i < 10 && i < results; i++) {
		$("#video-suggestion-"+i).attr("onclick", "").unbind("click");
		$("#video-suggestion-"+i).click(function(){
			//changeIndex(true);
			console.log(new_data[i].videoId);

			var video2insertInHistory = {};
			video2insertInHistory.videoId = new_data[i].videoId;
			video2insertInHistory.image = new_data[i].image;
			video2insertInHistory.reason = new_data[i].reason;
			video2insertInHistory.title = new_data[i].title;
			history.pushState(video2insertInHistory, "", "#"+video_info.videoId)
			console.log("video nuovo: \n " + JSON.stringify(video2insertInHistory))
			console.log("video vecchio: \n " + JSON.stringify(video_info))

			changeVideo(new_data[i].videoId, new_data[i].image, new_data[i].title, new_data[i].reason);


		});
		$("#image-suggestion-"+i.toString()).attr("src",new_data[i].image);
		$("#title-suggestion-"+i.toString()).html(new_data[i].title);
		$("#description-suggestion-"+i.toString()).html(new_data[i].reason);
	}
	//pulisco i campi non popolati
	for (var i = results; i < 10 ; i++) {
		console.log("deleting");
		$("#image-suggestion-"+i.toString()).attr("src","");
		$("#title-suggestion-"+i.toString()).html("");
		$("#description-suggestion-"+i.toString()).html("");
	}
}

//SHOW-HIDE ANIMATION

function changeIndex(up){
	if(up){
		$('.spinner').css("z-index","1");
		$('.card-image-top').css("z-index","-1");
		$('.card-body').css("z-index","-1");
		//alert("down");
	}else{
		$('.spinner').css("z-index","-1");
		$('.card-body').css("z-index","1");
		$('.card-image-top').css("z-index","1");
		//alert("up");
	}
}

//IFRAME PLAYER

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('the_player', {
    videoId: video_info.videoId,
		playerVars: { 'autoplay': 0, 'controls': 0, 'color': 'white', 'fs': 0, 'rel' : 0 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
var viewed = false;
var time_out;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    time_out = setTimeout(viewedVideo, 15000);
    done = true;
  }else if(event.data == YT.PlayerState.PAUSED && !viewed){
		clearTimeout(time_out);
		done = false;
	}
}
function viewedVideo() {
	console.log("VIEWED");
  //player.stopVideo();
	suggested_videos_recent = [];
	$.ajax({
		url : 'api/addSong?uc_value='+uc_value+'&song_info='+escape(JSON.stringify(video_info)),
		success : ((data)=>{
			if(current_category==4){
				getRecentlyWatchedVideos(uc_value);
			}
		}),
		error : ((err)=>{
			console.log(JSON.stringify(err));
		})
	});
	viewed = true;
	current_video_id = video_info.videoId;
	current_title = video_info.title;
	current_image = video_info.image;
	popolarita_assoluta_locale();
	popolarita_relativa();
}

//END OF IFRAME PLAYER

//INCREMENT OF TIME COUNTER
$('#dropdownUptime').click(()=>{
	asyncTimerUpdateCall();
});

async function asyncTimerUpdateCall() {
	if($('#dropdownUptime').is(':focus')){
		$.ajax({url: window.location.href.replace('#','') + "api/uptime", success: function(result){
		    $("#uptime-info").html(result);
		}});
		setTimeout(asyncTimerUpdateCall, 1000);
	}
}

//FUNCTION CALLED WHEN THE DOCUMENT HAS FINISHED LOADING

$(document).ready(function() {
	//var element = document.getElementById("pills-wikipedia-tab");
	//element.classList.add("disabled");
	//youTubeRandomVideos();
	//ytplayer = document.getElementById("ytplayer");
});
//carico il video passato come parametro
var url_string = window.location.href;
var url = new URL(url_string);
var video = url.searchParams.get("v");
changeIndex(true);
if (video) {
	//alert("video");
	changeVideo(video);
}else{
	YouTubeRequest(single_video_url+video_info.videoId, showSingleVideoInfo, []);
}
//setCookie(uc_name,1,365);
uc_value = parseInt(getCookie(uc_name));
if(!uc_value){
	$.ajax({
		url : "api/createUser",
		success : ((data)=>{
			uc_value = (JSON.parse(data) - 1);
			setCookie(uc_name, uc_value, 365);
		}),
		error : ((err)=>{
			console.log(err);
		})
	});
}
getRecentlyWatchedVideos(uc_value);

function show(data){
	alert(data);
}

//SEARCH FUNCTIONS - LOGIC

function SearchLogic(){
	//search for videos where q=
	suggested_videos_search = [];
	let query_value = document.getElementById("search-query-value").value;
	if(query_value){
		//alert(query_value);
		$('#pills-search-tab').removeClass('disabled');
		//YouTubeRequest(search_url+"&q="+query_value, ouTubeInformations);

		//TO TEST
		suggested_videos_search = youTubeSearchOneVideo(query_value, true, suggested_videos_search);

		var elmnt = document.getElementById("search-button-stop");
	  elmnt.scrollIntoView({behavior: 'smooth'});
		document.getElementById("pills-random-tab").classList.remove("active");
		document.getElementById("pills-search-tab").classList.remove("active");
		document.getElementById("pills-related-tab").classList.remove("active");
		document.getElementById("pills-recent-tab").classList.remove("active");
		document.getElementById("pills-popular-tab").classList.remove("active");
		document.getElementById("pills-fvitali-tab").classList.remove("active");
		document.getElementById("pills-similar-tab").classList.remove("active");
		document.getElementById("pills-search-tab").classList.add("active");
	}
}

document.getElementById('search-query-value').onkeydown = function(e){
   if(e.keyCode == 13){
     // submit
		 SearchLogic();
   }
};

$("#search-button-go").click(SearchLogic);

//END OF SEARCH FUNCTIONS - LOGIC

//COOKIE SECTION

var setCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
						console.log(document.cookie);
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
		console.log("cookie not found");
    return "";
}

//END OF COOKIE SECTION

//deativate all highlighted buttons
function changeButtonPopular(){
	document.getElementById("pills-random-tab").classList.remove("active");
	document.getElementById("pills-search-tab").classList.remove("active");
	document.getElementById("pills-related-tab").classList.remove("active");
	document.getElementById("pills-recent-tab").classList.remove("active");
	document.getElementById("pills-fvitali-tab").classList.remove("active");
	document.getElementById("pills-similar-tab").classList.remove("active");
	document.getElementById("pills-search-tab").cclassList.remove("active");
	//document.getElementById("dropdownMenuLink").classList.add("active");
}

//VIDEO-SUGGESTION CATEGORIES

function changeSuggestedVideos(index){
	changeIndex(true);
	switch (index) {
		case 1:
			current_category = 1;
			youTubeRandomVideos();
			break;
		case 2:
			current_category = 2;
			let search_value = document.getElementById("search-query-value").value;
			console.log(search_value);
			if(search_value)
				youTubeSearchVideos(search_value, false, suggested_videos_search);
			else
				changeIndex(false);
			break;
		case 3:
			current_category = 3;
			youTubeRelatedVideos();
			break;
		case 4:
			current_category = 4;
			getRecentlyWatchedVideos(uc_value);
			break;
			case 5:
			current_category = 5;
			console.log("cat 5");
			break;
		case 50://Global absolute
			changeButtonPopular();
			document.getElementById("pills-popular-tab").classList.add("active");
			current_category = 50;
			break;
		case 51://Local absolute
			changeButtonPopular();
			document.getElementById("pills-popular-tab-absloc").classList.add("active");
			current_category = 51;
			break;
		case 52://Local relative
		    changeButtonPopular();
		    document.getElementById("pills-popular-tab-relloc").classList.add("active");
		    current_category = 52;
		    carica_video_popolarita_relativa();
		    break;
		case 6:
			current_category = 6;
			console.log("cat 6");
			getfvitali();
			break;
		case 7:
			current_category = 7;
			getSuggestedVideos();
			break;

	}
}

history.replaceState(video_info, '', '#'+video_info.videoId);
