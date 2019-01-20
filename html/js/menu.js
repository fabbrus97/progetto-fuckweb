$('document').ready(function(){
	//AGGIUNGO I 50 VIDEO INIZIALI

	var URL = "http://site1825.tw.cs.unibo.it/video.json";
        var $videoInfo = '';
        $.getJSON(URL, function(result){
                var result = JSON.parse(JSON.stringify(result));
                $(result).each(function(index, value){
                        $videoInfo = $('<li id="' + value.videoID + '">'  + 'Titolo: ' + value.title + ' Artista: ' + value.artist
				 + '</li>');
                        $('#videoInizialiMenu.dropdown-menu').append($videoInfo);
                        $videoInfo.css({"border":"2px solid black", "margin":"3px", "padding": "2px"});
			$('#videoInizialiMenu.dropdown-menu').css({"height": "300px", "width": "200px", "overflow": "auto", "font-size": "80%"});
		});

		$('#videoInizialiMenu.dropdown-menu li').on("mouseover", function(event){
                	$(event.target).css('background-color', 'yellow');
        	});

        	$('#videoInizialiMenu.dropdown-menu li').on("mouseout", function(event){
        	        $(event.target).css('background-color', 'transparent');
	        });

		$('#videoInizialiMenu.dropdown-menu li').on("click", function(){
			changeVideo(this.id);
		});
        });

	//TROLLO L'UTENTE

	$('#trollCatalog').on("click", function(){
		var trollId = "gkTb9GP9lVI";
		changeVideo(trollId);
		alert("We hope you like our catalog!");
	});

	//AGGIUNGO I COMMENTI DEL VIDEO IN ESECUZIONE
});
//	$('#pills-comments-tab').on("click", function(){
	function load_comments(){
		$('#pills-comments').html("");
		var commentsURL = "https://www.googleapis.com/youtube/v3/commentThreads";
		var currentVideo = video_info.videoId;
		var optionsComments = {
			maxResults: 50,
                        part: 'snippet',
                        key: key,
                        videoId: currentVideo,
			order: "relevance"
                }
		$.getJSON(commentsURL, optionsComments, function(data){
			//console.log("COMMENTI RELATTIVI AL VIDEO IN ESECUZIONE");
			//console.log(data);
			var newComments = [];

			for(let i=0; i < data.items.length; i++){
				var comment = {};
				comment.author = data.items[i].snippet.topLevelComment.snippet.authorDisplayName;
				comment.content = data.items[i].snippet.topLevelComment.snippet.textDisplay;
				comment.likes = data.items[i].snippet.topLevelComment.snippet.likeCount;
				newComments.push(comment);
			}

			for(let i=0; i< newComments.length; i++){
				$('#pills-comments').append(function(){
					return('<div class="ytComment">' + '<span class="ytCommentAuthor">' + newComments[i].author +
						":" + '</span>' + '<p class="textOfComment">' + newComments[i].content + " ( "
						 + '<span class="numOfLikes">' + newComments[i].likes + " likes </span>)</p></div><hr>");
				});
			}

			$('#pills-comments').css({"height":"250px", "overflow":"auto", "font-size": "85%"});
			$('.ytComment').css({"padding": "2px", "margin": "3px"});
			$('.ytCommentAuthor').css({"color": "#062f4f", "font-size": "15px"});
			$('.numOfLikes').css({"color": "#6885aa"});
		});
	}//});
//});
