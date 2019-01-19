$('document').ready(function() {
    var sitesToVisit = [
    "http://site1829.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1828.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1838.tw.cs.unibo.it/globpop?id=YYYYYYY",
    "http://site1839.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1846.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1822.tw.cs.unibo.it/globpop?id=YYYYYY ",
    "http://site1847.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1831.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1827.tw.cs.unibo.it/globpop?id=YYYYYY",
    "http://site1848.tw.cs.unibo.it/globpop?id=YYYYYY"
    ]
    var suggestedVideos = new Array();
    var videoInfo = {
        videoId: "",
        timesWatched: "",
        reason: ""
    };
    for(let i = 0; i < sitesToVisit.length; i++) {
        $.getJSON(sitesToVisit[i], function (data){
            console.log("ECCO I DATI RICEVUTI: " + data);
        })
        .done(function(data) {
            for(let j = 0; j < data.recommended.length; j++) {
                if(data.recommended[j].videoID) {
                    videoInfo.videoId = data.recommended[j].videoID;
                }
                else {
                    videoInfo.videoId = data.recommended[j].videoId;
                }
                videoInfo.timesWatched = data.recommended[j].timesWatched;
                videoInfo.reason = data.recommended[j].prevalentReason;
                suggestedVideos.push(videoInfo);
            }
        })
        .fail(function() {
                console.log("JSON non ricvuto");
        });
        console.log("JSON ricevuto dal sito "+ sitesToVisit[i]+ "sito numero " + i);
    }
    console.log("ARRAY DEI VIDEO DA ORDINARE, POPOLARITA' ASSOLUTA GLOBALE");
    console.log(suggestedVideos);
    suggestedVideos.sort(function(a, b) { return b.timesWatched - a.timesWatched });
    console.log("ARRAY DEI VIDEO ORDINATO, POPOLARITA' ASSOLUTA GLOBALE");

});
/*
$('document').ready(function() {
    //invece che controllare automaticamente quali siti funzionano, l'ho fatto io per poi creare questo array
    var sitesToVisit = ["http://site1828.tw.cs.unibo.it/globpop?id=YYYYYY", "http://site1838.tw.cs.unibo.it/globpop?id=YYYYYYY", "http://site1839.tw.cs.unibo.it/globpop?id=YYYYYYY", "http://site1846.tw.cs.unibo.it/globpop?id=YYYYYYY", "http://site1847.tw.cs.unibo.it/globpop?id=YYYYYYY", "http://site1827.tw.cs.unibo.it/globpop?id=YYYYYYY"];
    var numOfSites = sitesToVisit.length;
    var suggested_videos_popularGlob = [];
    var getMostViewed = function(currentSite, updateViews_cb) {
        var mostViewed = {
            image: "none",
            videoId: "none",
            timesWatched: "0",
            title: "none",
            reason: "none"
        };
        $.getJSON(currentSite, function(data) {
            //a partire dal JSON, seleziono il video più visto di ogni sito
            console.log(data);
            var recommendedLength = data.recommended.length;
            for (let i = 0; i < recommendedLength; i++) {
                if ((data.recommended[i].timesWatched > mostViewed.timesWatched) &&
                    (typeof(data.recommended[i]) != null)) {
                    //aggiorno i campi di mostViewed
                    mostViewed.timesWatched = data.recommended[i].timesWatched;
                    //if-then-else per sopperire alla mancanza di coerenza nei JSON
                    if (data.recommended[i].videoId) {
                        mostViewed.videoId = data.recommended[i].videoId;
                    } else {
                        mostViewed.videoId = data.recommended[i].videoID;
                    }
                }
            }
            updateViews_cb(mostViewed, currentSite, updateInfos);
        });
	suggested_videos_popularGlob.push(mostViewed);
        //return mostViewed;
    }

    function updateInfos(videoToUpdate) {
        var URL = "https://www.googleapis.com/youtube/v3/videos";
        var options = {
            part: "snippet",
            key: key,
            id: videoToUpdate.videoId,
        };
        console.log("Video di cui prendo la thumbnail: " + videoToUpdate.videoId);
        videoToUpdate.reason = "Number of views: " + videoToUpdate.timesWatched.toString();
        $.getJSON(URL, options, function(data) {
            console.log("Dati restituti dall'API di youtube");
            console.log(data);
            videoToUpdate.image = data.items[0].snippet.thumbnails.medium.url;
            videoToUpdate.title = data.items[0].snippet.title;
            //updateViews(mostViewed, currentSite);
	    console.log("STO CHIAMANDO WAIT FOR ALL");
		waitForAll();
        });
    }



    var updateViews = function(videoToUpdate, currentSite, updateInfos_cb) {
        var id2find = videoToUpdate.videoId;
        for (let i = 0; i < numOfSites; i++) {
            //se il sito è quello da cui ho ottenuto il più visto, lo evito;
            if (sitesToVisit[i] != currentSite) {
                $.getJSON(sitesToVisit[i], function(data) {
                    var recommendedLength = data.recommended.length;
                    for (let j = 0; j < recommendedLength; j++) {
                        //cerco il video di cui voglio aggiornare il conto delle views
                        if ((id2find == data.recommended[j].videoId) || (id2find == data.recommended[j].videoID)) {
                            //aggiorno il conto delle sue views
                            videoToUpdate.timesWatched = videoToUpdate.timesWatched + data.recommended[j].timesWatched;
                        }
                    }
                });
            }
        }
        //una volta calcolate le views "globali", aggiorno il motivo della proposta nel recommender
        updateInfos_cb(videoToUpdate);
        return videoToUpdate;
    }

    $('#pills-popular-tab').on('click', function() {
        console.log("Clicked on popular");
        arrived = 0;
        for (let i = 0; i < numOfSites; i++) {
            //per ogni sito, trovo il video più visto e ne aggiorno le views aggiungendo quelle che lo stesso video ha negli altri siti
            //var mostViewed = getMostViewed(sitesToVisit[i]);
            getMostViewed(sitesToVisit[i], updateViews);
        }
        console.log(suggested_videos_popularGlob);

    });

    let arrived = 0;

    function waitForAll() {
	arrived+=1;
	console.log("ARRIVED = ");
	console.log(arrived);
	if(arrived == 5){
		console.log("SONO ARRIVATO IN FONDO");
		console.log(suggested_videos_popularGlob);
		addYouTubeInformationsRefined(suggested_videos_popularGlob);
	}
    }
    /*
      currentSite = "http://site1828.tw.cs.unibo.it/globpop?id=YYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      currentSite = "http://site1838.tw.cs.unibo.it/globpop?id=YYYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      currentSite = "http://site1839.tw.cs.unibo.it/globpop?id=YYYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      currentSite = "http://site1846.tw.cs.unibo.it/globpop?id=YYYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      currentSite = "http://site1847.tw.cs.unibo.it/globpop?id=YYYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      currentSite = "http://site1827.tw.cs.unibo.it/globpop?id=YYYYYYY";
      suggested_videos_popularGlob.push(getMostViewed(currentSite));
      addYouTubeInformationsRefined(suggested_videos_popularGlob); });
*/
