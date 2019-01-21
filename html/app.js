/*

	QUESTO FILE CONTIENE LA LOGICA SERVER SIDE DELLA PAGINA
  DALL'INDICIZZAZIONE DELLE PAGINE VISITABILI ALLA RICHIESTA DI DATI
  E FORNIMENTO DI QUESTO ATTRAVERSO API

*/

var http = require('http')
var url = require('url')
var fs = require('fs')
var spotify = require('./node/spotify.js')


var jsonPop = {
    site: "localhost:8000/",
    recommender: "YYYYYY",
    lastWatched: "unknown",
    recommended: []
};


/*
var jsonGlobPop = JSON.stringify(jsonPop);
fs.writeFile('./globPop.JSON', jsonGlobPop, function(err) {
        if(err) {
                return console.log(err);
        }
});
*/

//array-db con i video visualizzati per utente
var video_history = [[ '0']];

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+'h, '+minutes+'m, '+seconds+'s';
}

function renderHTML(path, response) {
    fs.readFile(path, null, function(error, data) {
        if (error) {
            response.writeHead(404);
            response.write('File not found!');
        } else {
            response.write(data);
        }
        response.end();
    });
}

//"mescola" l'array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function populateHistoryZero(){
  video_history = [ [ '0' ],
    [ '0',
    { videoId: 'GgwE94KZJ7E',
      image: 'https://i.ytimg.com/vi/GgwE94KZJ7E/mqdefault.jpg',
      title: 'Gorillaz - Hollywood feat. Snoop Dogg & Jamie Principle (Visualiser)',
      reason: 'User choice' },
    { videoId: 's_7MB8vjc6E',
      image: 'https://i.ytimg.com/vi/s_7MB8vjc6E/mqdefault.jpg',
      title: 'J-Ax Ancora in piedi',
      reason: 'User choice' },
    { videoId: '1G4isv_Fylg',
      image: 'https://i.ytimg.com/vi/1G4isv_Fylg/mqdefault.jpg',
      title: 'Coldplay - Paradise (Official Video)',
      reason: 'User choice' },
    { videoId: 'fKopy74weus',
      image: 'https://i.ytimg.com/vi/fKopy74weus/mqdefault.jpg',
      title: 'Imagine Dragons - Thunder',
      reason: 'User choice' },
    { videoId: 'mRphSExPu7M',
      image: 'https://i.ytimg.com/vi/mRphSExPu7M/mqdefault.jpg',
      title: 'Nayt - Piove (Prod. by 3D & Skioffi) VIDEOCLIP UFFICIALE',
      reason: 'User choice' },
    { videoId: 'a9tf49drPKY',
      image: 'https://i.ytimg.com/vi/a9tf49drPKY/mqdefault.jpg',
      title: 'CAPAREZZA - AVRAI RAGIONE TU',
      reason: 'User choice' },
    { videoId: 'gEPmA3USJdI',
      image: 'https://i.ytimg.com/vi/gEPmA3USJdI/mqdefault.jpg',
      title: 'AC/DC - Highway to Hell (from Live at River Plate)',
      reason: 'User choice' },
    { videoId: 'xMVTKOoy1uk',
      image: 'https://i.ytimg.com/vi/xMVTKOoy1uk/mqdefault.jpg',
      title: 'The Prodigy - Omen (Official Video)',
      reason: 'User choice' },
    { videoId: 'ANS9sSJA9Yc',
      image: 'https://i.ytimg.com/vi/ANS9sSJA9Yc/mqdefault.jpg',
      title: 'Maroon 5 - Don\'t Wanna Know',
      reason: 'User choice' },
    { videoId: 'V7WSrlSIF8k',
      image: 'https://i.ytimg.com/vi/V7WSrlSIF8k/mqdefault.jpg',
      title: 'Articolo 31 - Domani Smetto (Video Clip)',
      reason: 'User choice' } ] ];
}

function getSpotifyInfoOfTrack (err, data, res){
  console.log("data:" + data);
  if(data && (!err && JSON.parse(data).tracks.total > 0)){

    //estrapolo le info dalla canzone
    //nome canzone
    var songName = JSON.parse(data).tracks.items[0].name;
    //nome artista
    var artistName = JSON.parse(data).tracks.items[0].artists[0].name;
    //info della canzone rilevanti per spotify
    var trackId = JSON.parse(data).tracks.items[0].id;
    var albumId = JSON.parse(data).tracks.items[0].album.id;
    var artistId = JSON.parse(data).tracks.items[0].album.artists[0].id;

    //controlla se l'array contiene una conzone con l'id passato come parametro
    function scan_songs(songId, array){
      if(songId==trackId)
        return true;
      array.forEach((el) => {
        if(el.id==songId)
          return true;
      });
      return false;
    }

    songList = []; //lista finale delle canzoni
    var count = 0; //numero chiamate terminate -> 5
    var synch_calls = function (){ //fine di una chiamata, se sono tutte terminate motra l'array
      count++;
      //console.log("entries: " + count);
      if(count==6){
        //le chiamate sono finite
        //pubblica i risultati
        res.end(JSON.stringify({
          "artist" : artistName,
          "song" : songName,
          "songs" : shuffle(songList)
        }))
      }
    }
    //Album tracks
    getSpotifyApi(res, //gestore della risposta
      "/v1/albums/" + albumId + "/tracks?limit=10", //ricerca della canzone
      (err, data, r)=>{ //callback
        if(!err){
          //console.log(data);
          for (var i = 0; i < JSON.parse(data).total && i < 10; i++) {
            //res.end(data)
            if(!scan_songs(JSON.parse(data).items[i].id, songList)){
              var newSong = {};
              newSong.id = JSON.parse(data).items[i].id;
              newSong.reason = "Same album";
              newSong.name = JSON.parse(data).items[i].name;
              newSong.artist = JSON.parse(data).items[i].artists[0].name;
              songList.push(newSong);
            }
          }
          synch_calls();
        }//else{res.end("err in album tracks")}
      }
    );
    //Artist top tracks
    var insertTopTrack = function(artist_id, reason){
      getSpotifyApi(res, //gestore della risposta
        "/v1/artists/" + artist_id + "/top-tracks?country=IT&limit=10", //ricerca della canzone
        (err, data, r)=>{ //callback
          if(!err){
            //console.log(JSON.parse(data).tracks[0].track_number)
            for (var i = 0; i < JSON.parse(data).tracks[0].track_number && i < 10; i++) {
              console.log(data);
              if(!scan_songs(JSON.parse(data).tracks[i].id, songList)){ //ERROR
                var newSong = {};
                newSong.id = JSON.parse(data).tracks[i].id;
                newSong.reason = reason;
                newSong.name = JSON.parse(data).tracks[i].name;
                newSong.artist = JSON.parse(data).tracks[i].artists[0].name;
                songList.push(newSong);
              }
            }
            synch_calls();
          }//else{res.end("err in artist top tracks")}
        }
      );
    }
    insertTopTrack(artistId, "Artist top tracks");
    //Artist related artist -> Artist top tracks
    getSpotifyApi(res, //gestore della risposta
      "/v1/artists/" + artistId + "/related-artists?limit=10", //ricerca della canzone
      (err, data, r)=>{ //callback
        if(!err){
          for (var i = 0; i < 2; i++) {
            insertTopTrack(JSON.parse(data).artists[i].id, "Similar artist"); //ERRORE
          }
          synch_calls();
        }//else{res.end("err in similar artists")}
      }
    );
    //Raccomandation based on track id & artist id
    getSpotifyApi(res, //gestore della risposta
      "/v1/recommendations?limit=10&seed_artists=" +
      artistId +
      "&seed_tracks=" +
      trackId, //ricerca della canzone
      (err, data, r)=>{ //callback
        if(!err){
          //10 elementi per pagina
          if(JSON.parse(data).tracks[0]){
            for (var i = 0; i < JSON.parse(data).tracks[0].track_number && i<10; i++) {
              //console.log("in_for_instance"+i);
              if(!scan_songs(JSON.parse(data).tracks[i].id, songList)){
                var newSong = {};
                newSong.id = JSON.parse(data).tracks[i].id;
                newSong.reason = "Similar based on artist and song";
                newSong.name = JSON.parse(data).tracks[i].name;
                newSong.artist = JSON.parse(data).tracks[i].artists[0].name;
                songList.push(newSong);
              }
            }
          }
          synch_calls();
        }//else{res.end("err in album tracks")}
      }
    );

    //res.end(JSON.stringify(songList));
  }else{
    res.end("error");
    console.log("no data received, song not recognized")
  }
}

var timeout_time = 0;
var valid_bearer = "";

function isBearerValid(){
  if((new Date().getTime() / 1000) > (timeout_time - 60))
    return false;
  else
    return true;
}

function getSpotifyApi(r, url, callback){

	var res = "";

  if(!isBearerValid()){
     var bearer = "";
	   spotify.getbearer((err, bearerChunck, finished)=>{
  		//l'ultimo pezzo potrebbe essere vuoto
  		if(bearerChunck)
  			bearer+=bearerChunck
  		if(err)
  			r.end(err)
  		else if (finished){
        valid_bearer = bearer;
        //console.log(JSON.parse(bearer).expires_in);
        timeout_time = (new Date().getTime() / 1000) + parseInt(JSON.parse(bearer).expires_in);
  			spotify.request(
  				"GET", //mi servono solo richieste get
  				"api.spotify.com", //l'uri è sempre lo stesso
  				{
  					'Accept': 'application/json', //voglio la risposta in json
  					'Content-Type': 'application/json', //voglio la risposta in json
  					'Authorization': 'Bearer ' + JSON.parse(bearer).access_token //bearer NECESSARIO!
  				},
  				url,
  				(err, data, finished) => {
  					if(err){
  						res = err;
              callback(err);
  					}else if (finished){
  						//pezzi finiti
              if(data)
                res+=data
                //genere della canzone
                callback(null, res, r);
  					}else{
  						//pezzi non ancora finiti
  						res+=data
            }
  				}
  			);
      }
  	})
  }else{
    spotify.request(
      "GET", //mi servono solo richieste get
      "api.spotify.com", //l'uri è sempre lo stesso
      {
        'Accept': 'application/json', //voglio la risposta in json
        'Content-Type': 'application/json', //voglio la risposta in json
        'Authorization': 'Bearer ' + JSON.parse(valid_bearer).access_token //bearer NECESSARIO!
      },
      url,
      (err, data, finished) => {
        if(err){
          res = err;
          callback(err);
        }else if (finished){
          //pezzi finiti
          if(data)
            res+=data
            //genere della canzone
            callback(null, res, r);
        }else{
          //pezzi non ancora finiti
          res+=data
        }
      }
    );
  }
}

function poprel(err, old, newid, old_title, current_title, old_image, current_image, res){ //data è un video id, type può essere inPlayer oppure toSuggest
  if (old_image)
    old_image = decodeURIComponent(old_image);
  if(current_image)
    current_image = decodeURIComponent(current_image);
  if(old && newid!=null && !err){
    var parseddata;
    fs.readFile(__dirname+'./json/poprel.json', null, function read(err, data){
      if(err) {
        console.log("API poprel errore: " + err);
	res.end()
      }else{
        parseddata = JSON.parse(data);
        var i = 0; var flag = false;
        while(i < parseddata.video.length && !flag){
          if (parseddata.video[i].id_vid_base == old){
            flag = true;
            console.log("poprel: video " + old_title + " già esistente");
            console.log("quindi devo inserire il video " + current_title + " come correlato di " + old_title)
          }
          i++;
        }
        if (!flag) {//se arrivo qui, non ho trovato il video in poprel.json
          let string = { "id_vid_base" : old, "old_title": old_title, "old_image": old_image, "suggested" : [] };
          parseddata.video.push(string);
        }
        //inserisco il video con newid
        if (flag)
        i--;
        var x = 0; flag = false;
        while(x < parseddata.video[i].suggested.length && !flag){
          if (parseddata.video[i].suggested[x].id_vid_rec == newid){ //se lo trovo, aumento il contatore
            console.log("A quanto pare, " + current_title + " era già correlato a " + old_title + "; aumento solo il contatore")
            flag = true;
            parseddata.video[i].suggested[x].counter++;
          }
          x++;
        }
        if (!flag){ //se non lo trovo, allora devo crearlo
          console.log("A quanto pare, " + current_title + " non era già correlato a " + old_title + "; creo la correlazione ex novo")
          let string = { "id_vid_rec"  : newid, "current_title": current_title, "current_image": current_image, "counter" : 1 };
          parseddata.video[i].suggested.push(string);
        }
        fs.writeFile(__dirname+'./json/poprel.json', JSON.stringify(parseddata), function after(err){
          if (err)
          console.log("Error while writing poprel.json (poprel): " + err);
          else
          console.log("poprel.json aggiornato con successo");
        });
        res.end(JSON.stringify(parseddata));
      }
    });
  } else if (old && newid===null && !err){
    var rawdata; var parseddata;
    fs.readFile(__dirname+'./json/poprel.json', null, function read(err, data){
      if(err) {
        console.log("API poprel errore: " + err);
        throw err;
      } else {
        var i = 0; var flag = false;
        parseddata = JSON.parse(data);
        while(i < parseddata.video.length && !flag){
          if (parseddata.video[i].id_vid_base == old){
            flag = true;
            console.log("poprel: video " + old_title + " già esistente");
            console.log("non stavamo aggiugendo niente, ma solo cercando dei dati da leggere e inviare al client :-)")
          }
          i++;
        }
        if (!flag){
          res.end("Errore, video non trovato");
        }
        i--;
        function compare(a, b){
          let comparison = 0; let counterA = a.counter; let counterB = b.counter;
          if (counterA > counterB){
            comparison = -1;
          } else if (counterA < counterB){
            comparison = 1
          }
          return comparison;
        }

        parseddata.video[i].suggested.sort(compare); //ordina prima l'array...
        if (parseddata.video[i].suggested.length > 10){
            parseddata.video[i].suggested = parseddata.video[i].suggested.slice(0, 10);
        }
        res.end(JSON.stringify(parseddata.video[i].suggested)); //poi lo restituisce
      }
    });
  } else {
    res.end("poprel: error: " + err);
  }
}

function updateGlobPopJSON(current_video_id, response){
     console.log("Sono dentro la funzione, l'id del video è" + JSON.stringify(current_video_id));
     fs.readFile(__dirname + '/globPop.JSON', {encoding: "utf-8"},  function(err, data) {
            if(err) {
                    return console.log("Ho riscontrato un errore: " + err);
            }
            else {
                    const buf1 = Buffer.from("Ho letto il file");
                    const buf2 = Buffer.from("JSON aggiornato");
                    console.log(buf1.toString());
                    jsonPop = JSON.parse(data);
                    //let index = jsonPop.recommended.indexOf(current_video_id);
                    var now = new Date();
                    var month = (now.getUTCMonth() + 1).toString();
                    var hours = (now.getUTCHours() + 1).toString();

                    jsonPop.lastWatched = now.getUTCDate().toString() + "/" + month + "/" +
                                          now.getUTCFullYear().toString() + " at " + hours +
                                         ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();
                    var modified = false;
                    jsonPop.recommended = jsonPop.recommended.map(function(x) {
                        if(x.videoId == current_video_id) {
                            console.log("Video già visto, aggiorno le info");
                            x.timesWatched++;
                            x.prevalentReason = "This video was viewed " + x.timesWatched + " times";
                            x.lastSelected = jsonPop.lastWatched;
                            modified = true;
                        }
                        return x;
                    });
                    if(!modified) {
                        console.log("video mai visto, lo aggiungo al json");
                        var newVideo = {
                                videoId: current_video_id,
                                lastSelected: jsonPop.lastWatched,
                                timesWatched: 1,
                                prevalentReason: "This video was viewed once"
                            };
                            jsonPop.recommended.push(newVideo);
                    }
                    /*
                    console.log("Indice del video: " + index);
                    var now = new Date();

                    var month = (now.getUTCMonth() + 1).toString();
                    var hours = (now.getUTCHours() + 1).toString();
                    //aggiorno l'ultima volta che il sito e' stato usato per vedere un video
                    jsonPop.lastWatched = now.getUTCDate().toString() + "/" + month + "/" +
                            now.getUTCFullYear().toString() + " at " + hours +
                            ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();

                    if(index >= 0) { //se non e' la prima volta che un video viene visto
                            console.log("video gia' stato visto, aggiorno le info");
                            jsonPop.recommended[index].lastSelected = now.getUTCDate().toString() + "/" +
                            month + "/" +
                            now.getUTCFullYear().toString() + " at " + hours +
                            ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();

                            jsonPop.recommended[index].timesWatched++;
                            jsonPop.recommended[index].prevalentReason = "This video was viewed " +
                            jsonPop.recommended[index].timesWatched;
                    }
                    else {
                            console.log("video mai visto, creo le info");
                            var lastSel = now.getUTCDate().toString() + "/" + month + "/" +
                            now.getUTCFullYear().toString() + " at " + hours +
                            ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();

                            var newVideo = {
                                    videoId: current_video_id,
                                    lastSelected: lastSel,
                                    timesWatched: 1,
                                    prevalentReason: "This video was viewed once"
                            };

                            jsonPop.recommended.push(newVideo);
                    }
                    */
                    jsonPop = JSON.stringify(jsonPop);
                    console.log("aggiorno il json");
                    fs.writeFile(__dirname + '/globPop.JSON', jsonPop, 'utf-8', (err)=>{
                      console.log(err)
                    })
                    response.end(JSON.stringify(jsonPop));
            }
     });
}


function infoCanzone(err, data, res){ //funzione simile a getSpotifyInfoOfTrack, ma ritorna meno dati
  var info = {
    name: "" ,
    album: "" ,
    artist: "" ,
    year: ""
  }
  //console.log("Ecco i dati ricevuti: " + JSON.stringify(JSON.parse(data).tracks.items[0]));
  try {  if (data  && (!err && JSON.parse(data).tracks.total > 0)  ){
    //console.log("Ecco l'artista: " + JSON.stringify(JSON.parse(data).tracks.items[0].artists[0].name));
    //tutti questi valori sono stringhe, year può avere vari formati (es. solo anno, anno e mese...)
    info['name'] = JSON.parse(data).tracks.items[0].name; //si prende il primo elemento assumento sia quello con maggiore compatibilità
    info['album'] = JSON.parse(data).tracks.items[0].album.name;
    info['artist'] = JSON.parse(data).tracks.items[0].artists[0].name;
    info['year'] = JSON.parse(data).tracks.items[0].album.release_date;
    //console.log("Parsing eseguito, ecco cosa contiene l'elemento info: " + JSON.stringify(info));
    //console.log("Parsing eseguito, ecco cosa contiene l'elemento info: " + info.name + ", " + info.album + ", " + info.artist + ", " + info.year );
    data = info;
    res.end(JSON.stringify(data));
  } } catch(err) {
    res.end("infoCanzone: error: " + err);
  }
}




var server = http.createServer(function (req, res) {
    //console.log("connected");
    res.setHeader('Access-Control-Allow-Headers', "*");
    if (req.method == 'GET') {
		path = url.parse(req.url).pathname;
    var query = url.parse(req.url, true).query;
    if(query.length>0)
      console.log(query);
		//console.log(path);

		switch (path) {
			//PAGES
			case '/':
			case '/index.html':
			case '/index':
				res.writeHead(200, {'Content-Type': 'text/html'});
				renderHTML(__dirname+'/index.html', res);
			break;
			//CSS
			case '/css/loading_animation.css':
				res.writeHead(200, { 'Content-Type': 'text/css' })
				renderHTML(__dirname+'/css/loading_animation.css', res);
			break;
			case '/css/css.css':
				res.writeHead(200, { 'Content-Type': 'text/css' })
				renderHTML(__dirname+'/css/css.css', res);
			break;
			case '/css/modal.css':
				res.writeHead(200, { 'Content-Type': 'text/css' })
        renderHTML(__dirname+'/css/modal.css', res);
			break;
			//JS
			case '/js/youtube_fetch.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
				renderHTML(__dirname+'/js/youtube_fetch.js', res);
			break;
			case '/js/ciabatta_video.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
				renderHTML(__dirname+'/js/ciabatta_video.js', res);
			break;
			case '/js/modal.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
                                renderHTML(__dirname+'/js/modal.js', res);
			break;
			case '/js/related.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
                                renderHTML(__dirname+'/js/related.js', res);
			break;
			case '/js/sparql_query.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
				renderHTML(__dirname+'/js/sparql_query.js', res);
			break;
			case '/js/menu.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
				renderHTML(__dirname+'/js/menu.js', res);
			break;
			case '/js/popularAssRec.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
                                renderHTML(__dirname+'/js/popularAssRec.js', res);
			break;
      			case '/js/popolarita_relativa.js':
        			res.writeHead(200, { 'Content-Type': 'text/javascript' })
        			renderHTML(__dirname+'/js/popolarita_relativa.js', res);
      			break;
			case '/js/popularAssLocRec.js':
				res.writeHead(200, { 'Content-Type': 'text/javascript' })
                                renderHTML(__dirname+'/js/popularAssLocRec.js', res);
			break;
			//IMAGESJSON.parse().video
			case '/images/image.svg':
				res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
				renderHTML(__dirname+'/images/image.svg', res);
			break;
			//API
			case '/api/uptime':
				res.writeHead(200, { 'Content-Type': 'text/plain' })
				var now = new Date();
				var running_time = "App.js is up and running for : <br>\n" + ((now - startup_time)/1000).toString().toHHMMSS();
				res.end(running_time);
			break;
			case '/api/spotify/bearer':
				res.writeHead(200, { 'Content-Type': 'text/plain' })
				spotify.getbearer((err, bearer, finished)=>{
					if(err)
						res.end(err)
					else if (finished)
						//pezzi finiti
						res.end(bearer)
					else
						//pezzi non ancora finiti
						res.write(bearer)
				});

			break;
			case '/api/spotify/videoInfo':
				res.writeHead(200, { 'Content-Type': 'application/json' })
        //chiude la risposta in seguito
        getSpotifyApi(res, //gestore della risposta
          "/v1/search?q=" + //ricerca della canzone
	escape(query.video) + //titolo
          "&type=track&market=IT", //tipo di ricerca
          getSpotifyInfoOfTrack) //funzione di callback
			break;
			case '/api/spotify/infocanzone':
			//console.log("È stato richiesto l'uso dell'api infocanzone ");
			        res.writeHead(200, {'Content-Type': 'application/json'})
        getSpotifyApi(res, "/v1/search?q=" + escape(query.video) + "&type=track&market=IT", infoCanzone)
		        break;
			case '/api/spotify/videoDetails':
        res.writeHead(200, { 'Content-Type': 'application/json' })
        getSpotifyApi(res, //gestore della risposta
          "/v1/search?q=" + //ricerca della canzone
          escape(query.video) + //titolo
          "&type=track&market=IT", //tipo di ricerca
          getSpotifyInfoOfTrack) //funzione di callback
				res.end()
			break;
      //aggiungo un utente all'array
      case '/api/createUser':
        res.writeHead(200, { 'Content-Type': 'application/json' })
        //aggiungo un array col primo elemento inizializzato a 0 all'array
        //e ritorno l'indice del nuovo elemento da usare come valore del cookie
        res.end((video_history.length - 1).toString())
      break;
      //aggiungo una canzone all'array
      case '/api/addSong': //uc_value & song_id
        res.writeHead(200, { 'Content-Type': 'application/json' })
        video_history[query.uc_value].push(JSON.parse(query.song_info));
	//inizio codice scritto da Liam
	/*
	fs.readFile('./globPopJSON', null, function(data, err) {
		if(err) {
			return console.log(err);
		}
		let index = jsonPop.recommended.indexOf(query.song_info);
		var now = new Date();
		if(index >= 0) {
			jsonPop = JSON.parse(data);
			console.log("jsonPop: ");
			console.log(jsonPop);
			jsonPop.recommended[index].timesWatched++;
	                jsonPop.recommended[index].lastSelected = now.getUTCDate().toString() + "/" + now.getUTCMonth().toString() + "/" +
			 now.getUTCFullYear().toString() + " at " + now.getUTCHours().toString(); +
			 ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();

             JSON.stringify(jsonPop);
             fs.writeFile('./globPop.JSON', jsonPop, function(err) {
               if(err) {
                 return console.log(err);
               }
             });
            }
            else {

		 var lastSel = now.getUTCDate().toString() + "/" + now.getUTCMonth().toString() + "/" + now.getUTCFullYear().toString() +
		 " at " + now.getUTCHours().toString() + ":" + now.getUTCMinutes().toString() + ":" + now.getUTCSeconds().toString();

             var newElem = {
			videoID : video_info.videoId ,
            	timesWatched : 1,
            	prevalentReason: video_info.reason,
             	lastSelected: lastSel
             };
		 jsonPop.recommended.push(newElem);
             JSON.stringify(jsonPop);
             fs.writeFile('./globPop.JSON', jsonPop, function(err) {
               if(err) {
                 return console.log(err);
               }
             });

           }
         });
         fine codice scritto da Liam
	*/
	/*console.log("VIDEO HISTORY");
        console.log(video_history);
        */
        res.end('{"operation":"success"}')
      break;
      //ritorno le ultime 10 canzoni visualizzate
      case '/api/userHistory': //uc_value
        res.writeHead(200, { 'Content-Type': 'application/json' })
        if(video_history[query.uc_value] && video_history[query.uc_value].length > 10){
            res.end(JSON.stringify(video_history[query.uc_value].slice(Math.max(video_history[query.uc_value].length - 10, 1))))
        }else{
          res.end()
        }
      break;
      case '/populate':
        populateHistoryZero();
        res.writeHead(302,  {Location: "http://localhost:8000/"})
        res.end();
      break;
      case '/api/poprel':
        res.writeHead(200, {'Content-Type': 'application/json'})
        if(escape(query.old) && escape(query.newid)!="null"){
            poprel(null, escape(query.old), escape(query.newid), escape(query.old_title), escape(query.current_title), escape(query.old_image), escape(query.current_image), res);
        } else if (escape(query.old) && escape(query.newid)=="null"){
          poprel(null, escape(query.old), null, null, null, null, null, res);
        } else {
          poprel("error!", null, null, null, null, null, null, res);
        }
      break;
            case '/api/globpop':
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(jsonPop));
            break;
      case '/api/localpop':
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        //res.writeHead("Access-Control-Allow-Origin": "*");
        console.log("chiamo la funzione per aggiornare il JSON della popolarita' globale");
        updateGlobPopJSON(escape(query.id), res);
      break;

			//404
			default:
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.write('Route not defined');
				res.end();
		  }
    }
})

var startup_time = new Date();

server.listen(8000);
console.log("Server started on port 8000 (this message is only for debug purposes)");
